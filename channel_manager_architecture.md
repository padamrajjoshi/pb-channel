# Channel Manager API — Internal Architecture & Design

> **Purpose**: How the Pebiglobe Channel Manager is built, how data flows, and how all the pieces work together.

---

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        pb-channel (Next.js)                         │
│   /properties  /calendar  /reservations  /promotions  /reviews      │
│   /connections/[connId]/booking  /expedia  /reporting               │
└────────────────────────────┬────────────────────────────────────────┘
                             │  HTTPS + HttpOnly Cookies
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FastAPI  (pb-api)                               │
│  ┌───────────────────┐  ┌──────────────────────────────────────┐   │
│  │  /v1/auth/*       │  │  /v1/hotels/*  (Channel Manager)     │   │
│  │  JWT / RSA / 2FA  │  │  router.py  →  sync_service.py       │   │
│  └───────────────────┘  └──────────────┬───────────────────────┘   │
│                                        │                            │
│              ┌─────────────────────────▼──────────────────────┐    │
│              │            OTA Plugin Registry                  │    │
│              │  zodomus_client.py  |  booking.py  |  airbnb.py │    │
│              │  expedia.py         |  agoda.py    |  base.py   │    │
│              └──────────┬───────────────────────┬─────────────┘    │
│                         │                       │                   │
│              ┌──────────▼──────────┐            │                   │
│              │   PostgreSQL DB     │            │                   │
│              │  (SQLAlchemy ORM)   │            │                   │
│              └─────────────────────┘            │                   │
│                                                 │                   │
│  ┌──────────────────────────────────────────────▼────────────────┐  │
│  │             Celery Worker (background tasks)                  │  │
│  │   pull_all_reservations (every 5 min)                         │  │
│  │   full_sync_all_properties (every 6 hours)                    │  │
│  └──────────────────────────────────┬─────────────────────────── ┘  │
│                                     │  Redis (Upstash TLS)          │
└─────────────────────────────────────┼─────────────────────────────── ┘
                                      │
            ┌─────────────────────────▼──────────────────────────┐
            │              External OTA APIs                      │
            │   Zodomus  |  Booking.com  |  Expedia  |  Airbnb    │
            └────────────────────────────────────────────────────┘
```

---

## 🧩 Layer 1: OTA Plugin System

### `BaseOTAClient` — The Contract (`integrations/otas/base.py`)

Every OTA integration **must** implement 4 abstract methods:

| Method | Purpose | Required? |
|---|---|---|
| `push_availability(room_id, data)` | Send available units per date to OTA | ✅ Yes |
| `push_rates(room_id, data)` | Send price per date to OTA | ✅ Yes |
| `fetch_reservations(start, end)` | Pull bookings from OTA | ✅ Yes |
| `get_rooms_list()` | Discover rooms on the OTA | ✅ Yes |

And many **optional** methods with no-op defaults:

```python
async def get_reviews(self)            → {"reviews": [], "status": "not_supported"}
async def reply_to_review(self, p)     → {"status": "not_supported"}
async def get_promotions(self)         → {"promotions": [], "status": "not_supported"}
async def check_property(self, p)      → {"status": "not_supported"}
async def activate_property(self, p)   → {"status": "not_supported"}
# ... etc.
```

This means **adding a new OTA never breaks existing ones** — optional capabilities just return `"not_supported"`.

### `capabilities()` Classmethod

Every client exposes a capability map that the sync engine reads before calling methods:

```python
@classmethod
def capabilities(cls) -> Dict[str, bool]:
    return {
        "push_availability": True,
        "push_rates": True,
        "fetch_reservations": True,
        "get_reviews": False,        # Booking.com supports, Airbnb doesn't
        "activate_rooms": True,      # Only Zodomus uses this
        "reservation_queue": True,   # Only Zodomus uses this
        ...
    }
```

### OTA Registry (`sync_service.py`)

```python
OTA_REGISTRY: Dict[str, Type[BaseOTAClient]] = {
    "airbnb":   AirbnbClient,    # integrations/otas/airbnb.py
    "booking":  BookingClient,   # integrations/otas/booking.py
    "expedia":  ExpediaClient,   # integrations/otas/expedia.py
    "agoda":    AgodaClient,     # integrations/otas/agoda.py
    "zodomus":  ZodomusClient,   # hotel_channel/zodomus_client.py
}
```

**Factory function** resolves the correct class at runtime:
```python
async def get_ota_client(ota_connection: OTAConnection) -> BaseOTAClient:
    ota_name = ota_connection.ota_name.lower()
    client_class = OTA_REGISTRY.get(ota_name)
    return client_class(ota_connection.property_id, ota_connection.config)
```

**Adding a new OTA = 3 steps:**
1. Create `integrations/otas/mynewota.py` extending `BaseOTAClient`
2. Add it to `OTA_REGISTRY`
3. Add validation in `router.py` `connect_ota()`

---

## 🗄️ Layer 2: Data Models

### Entity Relationship Overview

```
User (auth module)
 └── Property (hotel_channel/models.py)
      ├── PropertyAmenity (free_wifi, pool, ...)
      ├── PropertyPolicy (check-in/out times, cancellation)
      ├── RoomType ──────────────── RoomMedia (photos)
      │    ├── DailyAvailability   (per-date inventory + price_override)
      │    ├── RatePlan            (base_price, discount_percent, min_los, ...)
      │    │    └── RateMapping ──→ OTAConnection (remote_rate_id)
      │    ├── ChannelMapping ────→ OTAConnection (remote_room_id)
      │    └── Restriction         (closed dates, min/max stay)
      ├── OTAConnection           (ota_name, config JSON, is_active)
      │    └── SyncLog            (status=success/failed, message)
      ├── Reservation             (from any OTA, raw_payload stored)
      └── WebhookLog              (inbound OTA notifications, status=pending/processed/failed)
```

### Key Model Details

#### `OTAConnection`
```python
config = Column(JSON)  # Flexible credential/ID bag per OTA:
# Zodomus:  {"remote_id": "Z123", "zodomus_channel_id": 15}
# Booking:  {"hotel_id": "B456"}
# Expedia:  {"hotel_id": "E789"}
# Airbnb:   {"ical_url": "...", "airbnb_id": "..."}
```

#### `ChannelMapping`
The bridge between a local `RoomType` and the OTA's room ID:
```python
room_type_id      = FK(room_types.id)        # Our internal ID
ota_connection_id = FK(ota_connections.id)   # Which channel
remote_room_id    = String                   # OTA's own ID (e.g. "BD-201")
sync_prices       = Boolean (default True)
sync_availability = Boolean (default True)
```

#### `DailyAvailability`
Per-date record that acts as the **single source of truth** for inventory:
```python
room_type_id    = FK
date            = Date              # One row per room × per date
available_units = Integer           # How many rooms are available
price_override  = Integer (nullable)  # Per-date price (overrides RatePlan.base_price)
is_closed       = Boolean
```

#### `RatePlan`
Handles yield management through discount derivation:
```python
base_price       = Integer    # e.g. 5000 per night
discount_percent = Float      # e.g. 15.0 → 4250 derived price
is_refundable    = Boolean
min_los          = Integer    # Minimum length of stay
advance_days     = Integer    # Advance purchase requirement
```

---

## ⚙️ Layer 3: Sync Engine (`sync_service.py`)

### 3.1 Yield Management & Rate Derivation

When rates are pushed to OTAs, each `RatePlan` is derived from a base price:

```
base_price = RatePlan.base_price
    OR price_override from DailyAvailability (if set by calendar/bulk override)

derived_price = max(1, base_price × (1 - discount_percent/100))

Example:
  RatePlan "Non-Refundable" with 15% discount
  January 1 has a bulk override of 8000
  → Push price = 8000 × (1 - 0.15) = 6800 to OTA
```

This auto-scales derived plans when a base price override happens — no manual re-entry needed.

### 3.2 `sync_room_to_all_otas()` — Real-Time Push

Triggered after any availability/price change:

```
1. Load all active OTA connections for the property
2. For each connection:
   a. Check mapping exists (ChannelMapping: local ↔ remote_room_id)
   b. Check sync_availability=True → push 30-day availability array
   c. Check sync_prices=True → derive rate per RatePlan → push 30-day price array
   d. If explicit RateMapping exists → push to remote_rate_id
   e. Log result to SyncLog
```

```python
# Availability payload sent to every OTA:
[
    {"date": "2025-06-01", "units": 5},
    {"date": "2025-06-02", "units": 4},
    ...  # 30 days
]

# Rate payload (one per RatePlan):
[
    {"date": "2025-06-01", "price": 6800},
    {"date": "2025-06-02", "price": 6800},
    ...
]
```

### 3.3 `sync_property_to_otas()` — Full Sync

Iterates every `RoomType` in the property and calls `sync_room_to_all_otas()` for each. Used by:
- Manual trigger: `POST /hotels/{id}/sync`
- Celery full-sync task (every 6 hours)

### 3.4 `reduce_inventory()` — Overbooking Prevention

Called immediately when a reservation is confirmed:

```
For each night between check_in → check_out:
  1. Find DailyAvailability row for that room_type + date
  2. available_units = max(0, current - num_rooms)
  3. If no row exists: create one (total_inventory - num_rooms)
```

After reducing, `sync_room_to_all_otas()` is called to broadcast the new count to all connected OTAs in real-time.

---

## 📨 Layer 4: Reservation Lifecycle

### Inbound (OTA → Pebiglobe)

Two paths:

```
Path A: Webhook (real-time, preferred)
  OTA → POST /v1/hotels/webhooks/{ota_name}
       ↓
  1. Log payload to WebhookLog (status=pending)
  2. Return 200 immediately (fast ACK to OTA)
  3. Background: parse_ota_webhook() → normalize to ReservationCreate
  4. process_incoming_reservation():
       a. crud.create_reservation() → persist to DB
       b. reduce_inventory() → decrement DailyAvailability
       c. sync_room_to_all_otas() → update all other channels
  5. Mark WebhookLog.status = "processed"

Path B: Polling (fallback)
  Celery task every 5 minutes:
  → pull_all_reservations()
  → ZodomusClient.get_reservations_queue()
  → For each pending: process_incoming_reservation()
```

### Webhook Normalization

Each OTA sends a different JSON format. `parse_ota_webhook()` converts them to the internal schema:

```python
# Booking.com webhook
{"reservation_id": "X", "hotel_id": "Y", "arrival_date": "...", ...}
# normalized to:
ReservationCreate(remote_reservation_id="X", property_id=..., check_in=..., source_ota="booking")

# Expedia webhook
{"confirmId": "X", "hotelId": "Y", "stay": {"checkIn": "...", "checkOut": "..."}, ...}
# normalized to:
ReservationCreate(remote_reservation_id="X", property_id=..., source_ota="expedia")
```

---

## ⏱️ Layer 5: Background Jobs (Celery)

### Tasks (`hotel_channel/tasks.py`)

| Task | Schedule | Purpose |
|---|---|---|
| `pull_all_reservations` | Every **5 minutes** | Poll OTAs for new bookings (fallback when webhooks fail) |
| `full_sync_all_properties` | Every **6 hours** | Reconciliation push — prevents data drift with all OTAs |

### Redis Broker (Upstash)

- All tasks queued via: `rediss://default:**@neat-leech-66398.upstash.io:6379/0`
- TLS enforced (`rediss://`)
- Worker process runs in Docker as `pb-api-worker-1`

---

## 🔌 Layer 6: ZodomusClient — The Channel Manager Bridge

`hotel_channel/zodomus_client.py` is a specialized `BaseOTAClient` that wraps all 9 Zodomus API categories:

```
ZodomusClient
│
├── _make_request(method, endpoint, data)   ← shared HTTP + Basic Auth
│
├── [1] Account:        get_channels, get_currencies, get_account
├── [2] Mapping:        activate_property, cancel_property, activate_rooms, cancel_rooms, check_property
├── [3] Distribution:   get_availability, push_availability, push_rates, push_derived_rates
├── [4] Reservations:   get_reservations_queue, get_reservation, get_reservation_cc, get_reservations_summary
├── [5] Content:        get/push property, room, rate content
├── [6] Engagement:     get_reviews, get_review_score, publish_review_reply, get_opportunities
├── [7] Booking Tables: booking_get/push_property, booking_get/push_room, booking_get/push_rate, booking_push_product
├── [8] Expedia Tables: expedia_get/push_property, expedia_get/push_room, expedia_get/push_rate
└── [9] Reporting:      get_revenue_report, get_cancellation_report, get_performance_report, get_booking_report
```

---

## 🛠️ Layer 7: API Router Design (`hotel_channel/router.py`)

All endpoints live under `prefix="/hotels"`. Standard pattern:

```python
@router.METHOD("/path")
async def handler(
    property_id: int,
    conn_id: int,
    current_user: UserProfile = Depends(get_current_user),   # JWT auth guard
    db: AsyncSession = Depends(database.get_db),             # Async DB session
):
    # 1. Ownership check
    db_property = await crud.get_property(db, property_id)
    if not db_property or db_property.owner_id != current_user.id:
        raise HTTPException(403)

    # 2. Get OTA client via factory
    client = await sync_service.get_ota_client(connection)

    # 3. Delegate to client method
    return await client.some_method(payload)
```

### Shared Auth Guard (`_resolve_booking_conn`)

Avoids duplicating 6 lines of auth+lookup across 17 new endpoints:

```python
async def _resolve_booking_conn(property_id, conn_id, current_user, db):
    db_property = await crud.get_property(db, property_id)
    if not db_property or db_property.owner_id != current_user.id: raise HTTPException(403)
    connection = await db.get(OTAConnection, conn_id)
    if not connection or connection.property_id != property_id:    raise HTTPException(404)
    if not connection.is_active:                                    raise HTTPException(400)
    return connection, _get_zodomus_client_for_conn(connection)
```

---

## 📊 Complete Data Flow: Booking Made on Booking.com

```
1. Guest books on Booking.com
        ↓
2. Booking.com sends webhook to:
   POST https://pb-api.pebiglobe.com/v1/hotels/webhooks/booking
        ↓
3. receive_ota_webhook():
   - Saves to WebhookLog (status=pending)
   - Returns 200 OK immediately (fast ACK)
   - Queues background: process_webhook_payload("booking", payload, log_id)
        ↓
4. Background: parse_ota_webhook("booking", payload)
   - Converts Booking.com format → ReservationCreate schema
        ↓
5. process_incoming_reservation():
   a. crud.create_reservation()    → saved to Reservation table
   b. reduce_inventory(...)        → DailyAvailability.available_units -= 1 per night
   c. sync_room_to_all_otas(...)   → pushes updated availability to:
        - Expedia: push_availability([{date, units}, ...])
        - Airbnb:  push_availability([...])
        - Zodomus: _raw_push_availability({...})
        ↓
6. WebhookLog.status = "processed"
        ↓
7. All connected OTAs now show reduced availability (overbooking prevented) ✅
```

---

## 🏗️ Adding a New OTA (Developer Guide)

```python
# 1. Create integrations/otas/mynewota.py
class MyNewOTAClient(BaseOTAClient):
    async def push_availability(self, room_id, data): ...
    async def push_rates(self, room_id, data): ...
    async def fetch_reservations(self, start, end): ...
    async def get_rooms_list(self): ...

    @classmethod
    def capabilities(cls):
        return {**super().capabilities(), "get_reviews": True}

# 2. Register in sync_service.py
OTA_REGISTRY["mynewota"] = MyNewOTAClient

# 3. Add validation in router.py connect_ota()
elif ota_name == "mynewota":
    required = ["hotel_id", "api_key"]
    missing = [k for k in required if not ota_in.config.get(k)]
    if missing:
        raise HTTPException(400, detail=f"Missing: {missing}")
```

That's all. The sync engine, webhook handling, and reservation lifecycle work **automatically** for the new OTA.

---

## 📁 File Map

```
pb-api/
├── hotel_channel/
│   ├── models.py          ← DB schema (Property, RoomType, OTAConnection, ChannelMapping, ...)
│   ├── schemas.py         ← Pydantic request/response models
│   ├── crud.py            ← Database CRUD operations
│   ├── router.py          ← All FastAPI endpoints (~1500 lines)
│   ├── sync_service.py    ← OTA registry, sync engine, webhook processor
│   ├── tasks.py           ← Celery background jobs (pull + full sync)
│   └── zodomus_client.py  ← Zodomus API wrapper (all 9 categories)
├── integrations/
│   └── otas/
│       ├── base.py        ← Abstract BaseOTAClient (plugin contract)
│       ├── booking.py     ← Booking.com direct client
│       ├── expedia.py     ← Expedia direct client
│       ├── airbnb.py      ← Airbnb (iCal + API) client
│       └── agoda.py       ← Agoda client
├── common/
│   ├── core/
│   │   ├── config.py      ← Pydantic settings + PEM auto-repair validator
│   │   └── celery_app.py  ← Celery + Redis configuration
│   └── database/
│       └── database.py    ← SQLAlchemy async engine + SessionLocal
└── main.py                ← FastAPI app + all router mounts
```
