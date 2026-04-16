import useSWR from "swr";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR("/user/profile", fetcher);

  return {
    profile: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useUserSettings() {
  const { data, error, isLoading, mutate } = useSWR("/user/settings", fetcher);

  return {
    settings: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useAllUsers() {
  const { data, error, isLoading, mutate } = useSWR("/user/all?app_source=pb-cms", fetcher);

  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useUserSessions() {
  const { data, error, isLoading, mutate } = useSWR("/user/sessions", fetcher);

  return {
    sessions: data || [],
    isLoading,
    isError: error,
    mutate
  };
}
