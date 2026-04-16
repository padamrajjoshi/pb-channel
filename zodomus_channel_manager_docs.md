# Zodomus Channel Manager — Complete API Coverage & Operations Guide

**Last updated:** 2026-04-17 | Status: ✅ 100% coverage

---

## 📊 Coverage Summary

| Zodomus Category | Backend | Frontend | Notes |
|---|---|---|---|
| **Authentication** | ✅ | ✅ | Basic Auth via env, managed by ZodomusClient |
| **Account & Info** | ✅ | ✅ | `/zodomus-channels`, `/supported-otas` |
| **Mapping** | ✅ | ✅ | Full check → activate → map rooms flow |
| **Rates & Availability** | ✅ | ✅ | Calendar, bulk override, rate plans |
| **Reservation** | ✅ | ✅ | Queue, summary, CC, test reservation |
| **Content** | ✅ | ✅ | Property/Room/Rate push (generic) |
| **Booking Tables** | ✅ | ✅ | Dedicated page `/connections/[connId]/booking` |
| **Expedia Tables** | ✅ | ✅ | Dedicated page `/connections/[connId]/expedia` |
| **Booking Opportunities** | ✅ | — | Backend only (promotions router) |
| **Booking Guest Reviews** | ✅ | ✅ | `/reviews` page |
| **Booking Promotions** | ✅ | ✅ | `/promotions` page |
| **Booking Reporting** | ✅ | ✅ | Dedicated page `/connections/[connId]/reporting` |

---

## 🗺️ Frontend Route Map

```
/properties
  /[id]                             ← Property detail + OTA connections list
    /connect                        ← Connect new OTA wizard
    /connections
      /[connId]
        /booking                    ← Booking Tables (Property / Rooms / Rates / Product)
        /expedia                    ← Expedia Tables (Property / Rooms / Rates)
        /reporting                  ← Booking Reporting (Revenue / Cancellations / Performance / Custom)
/rooms                              ← Room types management
/calendar                           ← Availability calendar
/reservations                       ← Reservation management
/reviews                            ← Guest reviews & replies
/promotions                         ← Booking promotions
/analytics                          ← Analytics dashboard
```

**Navigation entry point**: Booking.com and Expedia connection cards on the property detail page automatically show deep-link buttons:
- 🔵 **Booking Tables** → `booking/`
- 🟢 **Reports** → `reporting/`
- 🟣 **Expedia Tables** → `expedia/`

---

## 🔐 Authentication

All Zodomus API calls use **HTTP Basic Auth** via `.env` on AWS:

```
ZODOMUS_API_USER=<your_base64_user>
ZODOMUS_API_PASSWORD=<your_api_password>
ZODOMUS_CC_PASSWORD=<credit_card_password>
```

All Pebiglobe API calls use **cookie-based JWT auth** (set via the 2FA login flow).

---

## 1. Account & Info

### List Available OTA Channels
```bash
curl -X GET https://pb-api.pebiglobe.com/v1/hotels/zodomus-channels \
  -H "Cookie: access_token=<token>"

# Direct Zodomus
curl -X GET https://api.zodomus.com/channels \
  -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD"
```

### Get Currencies / Price Models / Account
```bash
curl -X GET https://api.zodomus.com/currencies -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD"
curl -X GET https://api.zodomus.com/price-model -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD"
curl -X GET https://api.zodomus.com/account -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD"
```

---

## 2. Mapping (OTA Connection Flow)

### Step 1 — Create Connection
```bash
curl -X POST https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"ota_name": "booking", "remote_property_id": "YOUR_BOOKING_HOTEL_ID", "config": {"hotel_id": "123", "zodomus_channel_id": 15}}'
```

### Step 2 — Check Property
```bash
curl -X POST https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/property-check \
  -H "Cookie: access_token=<token>"
```

### Step 3 — Activate Property
```bash
curl -X POST https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/property-activation \
  -H "Cookie: access_token=<token>"
```

### Step 4 — Activate Rooms
```bash
curl -X POST https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/activate-rooms \
  -H "Cookie: access_token=<token>"
```

### Cancel Property / Rooms
```bash
curl -X POST https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/property-cancellation \
  -H "Cookie: access_token=<token>"

curl -X POST https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/rooms-cancellation \
  -H "Cookie: access_token=<token>"
```

### Discover Remote Rooms & Rates
```bash
curl -X GET "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/remote-rooms" \
  -H "Cookie: access_token=<token>"

curl -X GET "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/remote-rates" \
  -H "Cookie: access_token=<token>"
```

---

## 3. Rates & Availability

### Get Availability Calendar
```bash
curl -X GET "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/availability?start_date=2025-06-01&end_date=2025-06-30" \
  -H "Cookie: access_token=<token>"
```

### Bulk Override (push to all OTAs)
```bash
curl -X POST https://pb-api.pebiglobe.com/v1/hotels/{property_id}/bulk-override \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"start_date": "2025-06-01", "end_date": "2025-06-30", "room_type_id": 1, "available_rooms": 5, "price": 99.00}'
```

### Rate Plans
```bash
curl -X GET https://pb-api.pebiglobe.com/v1/hotels/{property_id}/rate-plans -H "Cookie: access_token=<token>"

curl -X POST https://pb-api.pebiglobe.com/v1/hotels/{property_id}/rate-plans \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"name": "Standard Rate", "room_type_id": 1, "base_price": 99.00, "currency": "INR"}'
```

---

## 4. Reservations

```bash
# Pending queue
curl -X GET https://api.zodomus.com/reservations-queue -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD"

# Specific reservation
curl -X GET "https://api.zodomus.com/reservations?id=RES_ID" -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD"

# Credit card (requires CC password)
curl -X GET "https://api.zodomus.com/reservations-cc?id=RES_ID" -u "$ZODOMUS_API_USER:$ZODOMUS_CC_PASSWORD"

# Future reservations summary
curl -X GET https://api.zodomus.com/reservations-summary -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD"

# Create test reservation (sandbox)
curl -X POST https://api.zodomus.com/reservations-createtest \
  -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "REMOTE_ID", "channelId": 15, "roomId": "ROOM_ID", "checkIn": "2025-07-01", "checkOut": "2025-07-05", "adults": 2}'
```

---

## 5. Booking Tables

**Frontend:** `/properties/{id}/connections/{connId}/booking` (4 tabs: Property / Rooms / Rates / Product)

### Property
```bash
# GET
curl -X GET "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/booking/property" \
  -H "Cookie: access_token=<token>"

# PUSH (create/update)
curl -X POST "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/booking/property" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"name": "My Hotel", "address": "123 Street", "city": "Mumbai", "country": "IN"}'

# Status
curl -X POST "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/booking/property-status" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"status": "active"}'
```

### Rooms
```bash
# GET (all or specific)
curl -X GET "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/booking/rooms" \
  -H "Cookie: access_token=<token>"
curl -X GET "...booking/rooms?room_id=BOOKING_ROOM_ID" -H "Cookie: access_token=<token>"

# PUSH
curl -X POST "...booking/rooms" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"roomName": "Standard Double", "maxOccupancy": 2, "bedType": "double"}'

# Status
curl -X POST "...booking/room-status" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"roomId": "BOOKING_ROOM_ID", "status": "open"}'
```

### Rates
```bash
# GET
curl -X GET "...booking/rates" -H "Cookie: access_token=<token>"
curl -X GET "...booking/rates?rate_id=RATE_ID" -H "Cookie: access_token=<token>"

# PUSH
curl -X POST "...booking/rates" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"rateName": "Standard Rate", "currency": "INR", "price": 4999}'
```

### Product (room+rate composite)
```bash
curl -X POST "...booking/product" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"action": "create", "roomId": "ROOM_ID", "rateId": "RATE_ID", "name": "Standard Package"}'
# action: "create" | "modify" | "delete"
```

---

## 6. Expedia Tables

**Frontend:** `/properties/{id}/connections/{connId}/expedia` (3 tabs: Property / Rooms / Rates)

### Property
```bash
curl -X GET "...expedia/property" -H "Cookie: access_token=<token>"
curl -X POST "...expedia/property" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"name": "My Hotel", "starRating": 4, "city": "Mumbai"}'
```

### Rooms
```bash
curl -X GET "...expedia/rooms" -H "Cookie: access_token=<token>"
curl -X GET "...expedia/rooms?room_id=ROOM_ID" -H "Cookie: access_token=<token>"
curl -X POST "...expedia/rooms" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"roomName": "Deluxe Room", "maxOccupancy": 3, "bedType": "king"}'
```

### Rates
```bash
curl -X GET "...expedia/rates" -H "Cookie: access_token=<token>"
curl -X POST "...expedia/rates" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"rateName": "Flexible Rate", "currency": "INR", "price": 6500}'
```

> **Note:** Replace the `...` prefix with `https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/`

---

## 7. Guest Reviews

```bash
# Get reviews
curl -X GET "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/reviews" -H "Cookie: access_token=<token>"

# Get review score
curl -X GET "https://api.zodomus.com/reviews-score?property=REMOTE_ID" \
  -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD"

# Reply
curl -X POST "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/reviews/reply" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"review_id": "REV_ID", "reply": "Thank you for your feedback!"}'
```

---

## 8. Booking Opportunities

```bash
# Get
curl -X GET "https://api.zodomus.com/opportunities?property=REMOTE_ID" \
  -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD"

# Reply
curl -X POST https://api.zodomus.com/opportunities \
  -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "REMOTE_ID", "opportunityId": "OPP_ID", "accepted": true}'
```

---

## 9. Promotions

```bash
# List
curl -X GET "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/promotions" -H "Cookie: access_token=<token>"

# Create
curl -X POST "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/promotions" \
  -H "Content-Type: application/json" -H "Cookie: access_token=<token>" \
  -d '{"name": "Summer 20% Off", "discount_percent": 20, "start_date": "2025-06-01", "end_date": "2025-08-31", "min_nights": 2}'

# Activate / Deactivate
curl -X POST https://api.zodomus.com/activate-promotion \
  -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "REMOTE_ID", "promotionId": "PROMO_ID"}'

curl -X POST https://api.zodomus.com/deactivate-promotion \
  -u "$ZODOMUS_API_USER:$ZODOMUS_API_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "REMOTE_ID", "promotionId": "PROMO_ID"}'
```

---

## 10. Booking Reporting

**Frontend:** `/properties/{id}/connections/{connId}/reporting`

| Report | Endpoint | Description |
|---|---|---|
| Revenue | `GET .../booking/reports/revenue` | Revenue over date range |
| Cancellations | `GET .../booking/reports/cancellations` | Cancellation breakdown |
| Performance | `GET .../booking/reports/performance` | CTR, conversion, occupancy |
| Custom | `GET .../booking/reports?report_type=X` | Any Zodomus report key |

```bash
# Revenue
curl -X GET "https://pb-api.pebiglobe.com/v1/hotels/{property_id}/ota-connections/{conn_id}/booking/reports/revenue?start_date=2025-06-01&end_date=2025-06-30" \
  -H "Cookie: access_token=<token>"

# Cancellations
curl -X GET "...booking/reports/cancellations?start_date=2025-06-01&end_date=2025-06-30" \
  -H "Cookie: access_token=<token>"

# Performance
curl -X GET "...booking/reports/performance?start_date=2025-06-01&end_date=2025-06-30" \
  -H "Cookie: access_token=<token>"

# Custom
curl -X GET "...booking/reports?report_type=reservations&start_date=2025-06-01&end_date=2025-06-30" \
  -H "Cookie: access_token=<token>"
```

---

## 🔁 Full Connection Creation Walkthrough (Bash)

```bash
BASE="https://pb-api.pebiglobe.com/v1"
COOKIE="Cookie: access_token=<your_token>"

# 1. Create property
PROP_ID=$(curl -s -X POST "$BASE/hotels/" \
  -H "Content-Type: application/json" -H "$COOKIE" \
  -d '{"name": "My Hotel", "country": "IN", "city": "Mumbai"}' | jq -r '.id')

# 2. Connect Booking.com
CONN_ID=$(curl -s -X POST "$BASE/hotels/$PROP_ID/ota-connections" \
  -H "Content-Type: application/json" -H "$COOKIE" \
  -d '{"ota_name": "booking", "remote_property_id": "BOOKING_HOTEL_ID", "config": {"hotel_id": "BOOKING_HOTEL_ID", "zodomus_channel_id": 15}}' \
  | jq -r '.id')

# 3. Check → Activate → Map rooms
curl -X POST "$BASE/hotels/$PROP_ID/ota-connections/$CONN_ID/property-check" -H "$COOKIE"
curl -X POST "$BASE/hotels/$PROP_ID/ota-connections/$CONN_ID/property-activation" -H "$COOKIE"
curl -X POST "$BASE/hotels/$PROP_ID/ota-connections/$CONN_ID/activate-rooms" -H "$COOKIE"

# 4. Push Booking.com property content
curl -X POST "$BASE/hotels/$PROP_ID/ota-connections/$CONN_ID/booking/property" \
  -H "Content-Type: application/json" -H "$COOKIE" \
  -d '{"name": "My Hotel", "city": "Mumbai", "country": "IN"}'

# 5. Initial sync
curl -X POST "$BASE/hotels/$PROP_ID/sync" -H "$COOKIE"

# 6. Fetch first revenue report
curl -X GET "$BASE/hotels/$PROP_ID/ota-connections/$CONN_ID/booking/reports/revenue?start_date=2025-06-01&end_date=2025-06-30" \
  -H "$COOKIE"
```

---

## 📁 Key Files Reference

| File | Purpose |
|---|---|
| `pb-api/hotel_channel/zodomus_client.py` | All Zodomus API methods |
| `pb-api/hotel_channel/router.py` | All FastAPI route handlers |
| `pb-channel/src/app/properties/[id]/page.tsx` | Property detail + connection cards |
| `pb-channel/src/app/properties/[id]/connections/[connId]/booking/page.tsx` | Booking Tables UI |
| `pb-channel/src/app/properties/[id]/connections/[connId]/expedia/page.tsx` | Expedia Tables UI |
| `pb-channel/src/app/properties/[id]/connections/[connId]/reporting/page.tsx` | Booking Reporting UI |
