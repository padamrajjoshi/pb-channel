import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = (propertyId: string) => `sync_last_triggered:${propertyId}`;

export function useChannelSync(propertyId: string | null) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load last sync time from localStorage on mount
  useEffect(() => {
    if (!propertyId) return;
    const stored = localStorage.getItem(STORAGE_KEY(propertyId));
    if (stored) {
      const lastTime = new Date(stored);
      setLastSyncedAt(lastTime);
      const elapsed = Date.now() - lastTime.getTime();
      const remaining = Math.max(0, Math.floor((RATE_LIMIT_MS - elapsed) / 1000));
      setCooldownSeconds(remaining);
    }
  }, [propertyId]);

  // Countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const triggerSync = useCallback(async () => {
    if (!propertyId || isSyncing || cooldownSeconds > 0) return;

    setIsSyncing(true);
    setError(null);

    try {
      await api.post(`/hotels/${propertyId}/sync`);
      const now = new Date();
      setLastSyncedAt(now);
      localStorage.setItem(STORAGE_KEY(propertyId), now.toISOString());
      setCooldownSeconds(RATE_LIMIT_MS / 1000);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || "Sync failed. Please try again.";
      setError(detail);
      // If server rate-limited, extract remaining seconds
      if (err?.response?.status === 429) {
        const match = detail.match(/(\d+) seconds/);
        if (match) setCooldownSeconds(parseInt(match[1]));
      }
    } finally {
      setIsSyncing(false);
    }
  }, [propertyId, isSyncing, cooldownSeconds]);

  const isRateLimited = cooldownSeconds > 0;
  const canSync = !isSyncing && !isRateLimited && !!propertyId;

  return { triggerSync, isSyncing, isRateLimited, cooldownSeconds, lastSyncedAt, canSync, error };
}
