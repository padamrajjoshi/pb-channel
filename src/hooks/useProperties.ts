"use client";

import useSWR from "swr";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useProperties() {
  const { data, error, mutate, isLoading } = useSWR("/hotels/", fetcher);

  // Normalize response: extract from 'properties' key or return data if it's already an array
  const properties = data?.properties || (Array.isArray(data) ? data : []);

  return {
    properties,
    isLoading,
    isError: error,
    mutate,
  };
}
