"use client";

import useSWR from "swr";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useHotel(propertyId: string | number) {
  const { data, error, mutate, isLoading } = useSWR(propertyId ? `/hotels/${propertyId}` : null, fetcher);

  return {
    property: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useHotelRoomTypes(propertyId: string | number) {
  const { data, error, mutate, isLoading } = useSWR(propertyId ? `/hotels/${propertyId}/room-types` : null, fetcher);

  return {
    roomTypes: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useHotelConnections(propertyId: string | number) {
  const { data, error, mutate, isLoading } = useSWR(propertyId ? `/hotels/${propertyId}/ota-connections` : null, fetcher);

  return {
    connections: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useHotelMappings(propertyId: string | number) {
  const { data, error, mutate, isLoading } = useSWR(propertyId ? `/hotels/${propertyId}/mappings` : null, fetcher);

  return {
    mappings: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useRemoteRooms(propertyId: string | number, connId: string | number | null) {
  const { data, error, mutate, isLoading } = useSWR(
    propertyId && connId ? `/hotels/${propertyId}/ota-connections/${connId}/remote-rooms` : null,
    fetcher
  );

  return {
    remoteRooms: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useHotelRatePlans(propertyId: string | number, roomTypeId?: number | null) {
  const url = propertyId
    ? (roomTypeId ? `/hotels/${propertyId}/room-types/${roomTypeId}/rates` : `/hotels/${propertyId}/rate-plans`)
    : null;
  const { data, error, mutate, isLoading } = useSWR(url, fetcher);

  return {
    ratePlans: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useHotelRateMappings(propertyId: string | number) {
  const { data, error, mutate, isLoading } = useSWR(propertyId ? `/hotels/${propertyId}/rate-mappings` : null, fetcher);

  return {
    rateMappings: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useRemoteRates(propertyId: string | number, connId: string | number | null) {
  const { data, error, mutate, isLoading } = useSWR(
    propertyId && connId ? `/hotels/${propertyId}/ota-connections/${connId}/remote-rates` : null,
    fetcher
  );

  return {
    remoteRates: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSyncLogs(propertyId: string | number) {
  const { data, error, mutate, isLoading } = useSWR(propertyId ? `/hotels/${propertyId}/sync-logs` : null, fetcher);

  return {
    syncLogs: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useReservations(propertyId: string | number) {
  const { data, error, mutate, isLoading } = useSWR(propertyId ? `/hotels/${propertyId}/reservations` : null, fetcher);

  return {
    reservationsData: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAvailability(propertyId: string | number, startDate: string, endDate: string) {
  const url = propertyId && startDate && endDate 
    ? `/hotels/${propertyId}/availability?start_date=${startDate}&end_date=${endDate}` 
    : null;
    
  const { data, error, mutate, isLoading } = useSWR(url, fetcher);

  return {
    grid: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSettings(propertyId: string | number) {
  const { data, error, mutate, isLoading } = useSWR(propertyId ? `/hotels/${propertyId}/settings` : null, fetcher);

  return {
    settingsData: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProfile() {
  const { data, error, mutate, isLoading } = useSWR(`/user/profile`, fetcher);

  return {
    profile: data,
    isLoading,
    isError: error,
    mutate,
  };
}
