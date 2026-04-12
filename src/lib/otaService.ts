/**
 * OTA Service Layer
 * 
 * A clean, domain-specific API service for all OTA interactions.
 * Replaces scattered api.get(...) calls across the app with organized,
 * type-safe methods.
 * 
 * When you add new OTAs or remove Zodomus, only this file and the backend
 * need to change — the UI components remain untouched.
 */

import { api, handleApiError } from "./api";

// ---------------------------------------------------------
// Types
// ---------------------------------------------------------

export interface OTASource {
  ota: string;
  count?: number;
  error?: string;
}

export interface ReservationsResponse {
  reservations: any[];
  sources: OTASource[];
  total: number;
}

export interface ReviewsResponse {
  reviews: any[];
  sources: OTASource[];
  total: number;
}

export interface PromotionsResponse {
  promotions: any[];
  sources: OTASource[];
  total: number;
}

// ---------------------------------------------------------
// Reservations
// ---------------------------------------------------------

const reservations = {
  /**
   * Fetches aggregated reservations from ALL active OTA connections.
   */
  async list(propertyId: number | string): Promise<ReservationsResponse> {
    const res = await api.get(`/hotels/${propertyId}/reservations`);
    const data = res.data;
    return {
      reservations: Array.isArray(data.reservations) ? data.reservations : [],
      sources: data.sources || [],
      total: data.total || 0,
    };
  },
};

// ---------------------------------------------------------
// Reviews
// ---------------------------------------------------------

const reviews = {
  /**
   * Fetches aggregated guest reviews from ALL active OTA connections.
   */
  async list(propertyId: number | string): Promise<ReviewsResponse> {
    const res = await api.get(`/hotels/${propertyId}/reviews`);
    const data = res.data;
    return {
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      sources: data.sources || [],
      total: data.total || 0,
    };
  },

  /**
   * Publishes a management reply to a guest review.
   * @param targetOta - The OTA to route the reply to (e.g., "booking", "zodomus")
   */
  async reply(
    propertyId: number | string,
    reviewId: string,
    text: string,
    channelId?: string,
    targetOta?: string
  ) {
    return api.post(`/hotels/${propertyId}/reviews/reply`, {
      review_id: reviewId,
      reply_text: text,
      channel_id: channelId,
      target_ota: targetOta,
    });
  },
};

// ---------------------------------------------------------
// Promotions
// ---------------------------------------------------------

const promotions = {
  /**
   * Fetches aggregated promotions from ALL active OTA connections.
   */
  async list(propertyId: number | string): Promise<PromotionsResponse> {
    const res = await api.get(`/hotels/${propertyId}/promotions`);
    const data = res.data;
    return {
      promotions: Array.isArray(data.promotions) ? data.promotions : [],
      sources: data.sources || [],
      total: data.total || 0,
    };
  },

  /**
   * Creates a new promotion on a specific OTA.
   * @param targetOta - The OTA to create the promotion on (e.g., "booking", "expedia")
   */
  async create(propertyId: number | string, payload: any, targetOta?: string) {
    return api.post(`/hotels/${propertyId}/promotions`, {
      ...payload,
      target_ota: targetOta,
    });
  },
};

// ---------------------------------------------------------
// Calendar / Availability
// ---------------------------------------------------------

const calendar = {
  /**
   * Fetches the dynamic availability grid for a property.
   * Returns a map of roomTypeId -> Array of {date, units}.
   */
  async getGrid(propertyId: number | string, startDate: string, endDate: string) {
    const res = await api.get(`/hotels/${propertyId}/availability`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return res.data;
  },

  /**
   * Pushes an inventory/rate override for a specific room type and date.
   * Syncs to ALL active OTAs automatically.
   */
  async override(
    propertyId: number | string,
    roomTypeId: number,
    date: string,
    inventory?: number,
    price?: number
  ) {
    return api.post(`/hotels/${propertyId}/calendar-override`, {
      room_type_id: roomTypeId,
      date,
      inventory,
      price,
    });
  },
};

// ---------------------------------------------------------
// Connections
// ---------------------------------------------------------

const connections = {
  /**
   * Lists all OTA connections for a property.
   */
  async list(propertyId: number | string) {
    const res = await api.get(`/hotels/${propertyId}/ota-connections`);
    return res.data;
  },

  /**
   * Creates a new OTA connection.
   */
  async create(propertyId: number | string, otaName: string, config: Record<string, any>) {
    return api.post(`/hotels/${propertyId}/ota-connections`, {
      property_id: propertyId,
      ota_name: otaName,
      config,
    });
  },

  /**
   * Removes an OTA connection.
   */
  async remove(propertyId: number | string, connectionId: number) {
    return api.delete(`/hotels/${propertyId}/ota-connections/${connectionId}`);
  },

  /**
   * Activates room mappings on an OTA connection.
   */
  async activateRooms(propertyId: number | string, connectionId: number) {
    return api.post(`/hotels/${propertyId}/ota-connections/${connectionId}/activate-rooms`);
  },

  /**
   * Discovers remote rooms on an OTA connection.
   */
  async getRemoteRooms(propertyId: number | string, connectionId: number) {
    const res = await api.get(`/hotels/${propertyId}/ota-connections/${connectionId}/remote-rooms`);
    return res.data;
  },
};

// ---------------------------------------------------------
// Sync Engine
// ---------------------------------------------------------

const sync = {
  /**
   * Triggers a manual sync to ALL active OTAs.
   */
  async trigger(propertyId: number | string) {
    return api.post(`/hotels/${propertyId}/sync`);
  },

  /**
   * Fetches sync logs for a property.
   */
  async logs(propertyId: number | string) {
    const res = await api.get(`/hotels/${propertyId}/sync-logs`);
    return res.data;
  },
};

// ---------------------------------------------------------
// Platform Discovery
// ---------------------------------------------------------

const platform = {
  /**
   * Returns the list of OTAs this platform supports.
   */
  async getSupportedOTAs(): Promise<string[]> {
    const res = await api.get("/hotels/supported-otas");
    return res.data.otas || [];
  },

  /**
   * Returns Zodomus sub-channels (legacy — for backward compat).
   */
  async getZodomusChannels() {
    const res = await api.get("/hotels/zodomus-channels");
    return res.data.channels || [];
  },
};

// ---------------------------------------------------------
// Unified Export
// ---------------------------------------------------------

export const otaService = {
  reservations,
  reviews,
  promotions,
  calendar,
  connections,
  sync,
  platform,
};
