"use client";

import React from "react";
import {
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Link2,
  ShieldCheck,
  Database,
  Wifi,
  Clock,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useProperties } from "@/hooks/useProperties";
import { useHotelConnections, useSyncLogs, useHotelMappings, useHotelRoomTypes } from "@/hooks/useHotel";
import { useChannelSync } from "@/hooks/useChannelSync";

export default function ChannelWorkspace() {
  const { properties, isLoading: propsLoading } = useProperties();
  const primaryProperty = properties?.[0] || null;
  const primaryPropertyId = primaryProperty?.id ? String(primaryProperty.id) : null;

  const { connections = [], isLoading: connLoading } = useHotelConnections(primaryPropertyId || "");
  const { syncLogs = [], isLoading: logsLoading } = useSyncLogs(primaryPropertyId || "");
  const { roomTypes = [] } = useHotelRoomTypes(primaryPropertyId || "");

  const { triggerSync, isSyncing, isRateLimited, cooldownSeconds, lastSyncedAt, canSync, error: syncError } =
    useChannelSync(primaryPropertyId);

  const isLoading = connLoading || logsLoading || propsLoading;

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Globe className="w-10 h-10 animate-pulse text-emerald-500" />
        <p className="font-medium animate-pulse">Establishing secure channel link...</p>
      </div>
    );
  }

  const activeConnections = connections.filter(
    (c: any) => c.status === "active" || c.status === "connected"
  );
  const last24hLogs = Array.isArray(syncLogs)
    ? syncLogs.filter((l: any) => new Date(l.created_at) > new Date(Date.now() - 86400000))
    : [];
  const successCount = last24hLogs.filter((l: any) => l.status === "success").length;
  const errorCount = last24hLogs.filter((l: any) => l.status !== "success").length;
  const uptimePct = last24hLogs.length > 0 ? Math.round((successCount / last24hLogs.length) * 100) : 100;

  const stats = [
    { name: "Active OTA Channels", value: `${activeConnections.length} / ${connections.length}`, icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10", badge: "Live", badgeColor: "bg-emerald-500/10 text-emerald-500" },
    { name: "Sync Uptime (24h)", value: `${uptimePct}%`, icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", badge: uptimePct >= 99 ? "Healthy" : "Degraded", badgeColor: uptimePct >= 99 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500" },
    { name: "Successful Syncs", value: successCount, icon: CheckCircle2, color: "text-indigo-400", bg: "bg-indigo-500/10", badge: "24h", badgeColor: "bg-muted/50 text-muted-foreground" },
    { name: "Sync Errors", value: errorCount, icon: AlertTriangle, color: errorCount > 0 ? "text-rose-400" : "text-muted-foreground", bg: errorCount > 0 ? "bg-rose-500/10" : "bg-muted/30", badge: "24h", badgeColor: errorCount > 0 ? "bg-rose-500/10 text-rose-500" : "bg-muted/50 text-muted-foreground" },
  ];

  const recentLogs = Array.isArray(syncLogs) ? syncLogs.slice(0, 8) : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Channel Manager</p>
          <h1 className="text-3xl font-bold">Online Sales Distributor</h1>
          <p className="text-muted-foreground mt-1">
            Syncs PMS inventory to OTAs in real time — the layer between your hotel brain and the world.
          </p>
        </div>

        {/* Sync Now Button */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            onClick={triggerSync}
            disabled={!canSync}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              canSync
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing…" : isRateLimited ? `Wait ${cooldownSeconds}s` : "Sync Now"}
          </button>
          {lastSyncedAt && (
            <p className="text-[10px] text-muted-foreground">
              Last synced {lastSyncedAt.toLocaleTimeString()}
            </p>
          )}
          {syncError && (
            <p className="text-[10px] text-rose-500 max-w-[180px] text-right">{syncError}</p>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="backdrop-blur-md bg-white/5 dark:bg-white/5 border border-white/10 p-6 rounded-2xl"
          >
            <div className="flex items-start justify-between">
              <div className={`${stat.bg} p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${stat.badgeColor}`}>
                {stat.badge}
              </span>
            </div>
            <p className="text-2xl font-bold mt-4">{connLoading || logsLoading ? "—" : stat.value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-widest">{stat.name}</p>
          </motion.div>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────── */}
      {/* Data Flow Diagram */}
      {/* ──────────────────────────────────────────────────── */}
      <div className="backdrop-blur-md bg-white/5 dark:bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Live Data Pipeline
        </h3>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {/* PMS Node */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col items-center justify-center gap-1">
              <Database className="w-7 h-7 text-blue-500" />
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">PMS</span>
            </div>
            <p className="text-[10px] font-bold text-center text-muted-foreground leading-tight">
              Source<br />of Truth
            </p>
          </div>

          {/* Arrow PMS → CM */}
          <div className="flex flex-col items-center gap-1 flex-1 min-w-[60px]">
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-1 text-emerald-500"
            >
              <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-500/50 to-emerald-500/50 rounded-full" />
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </motion.div>
            <span className="text-[9px] text-muted-foreground font-medium">Push inventory</span>
          </div>

          {/* Channel Manager Node */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 ${
              isSyncing
                ? "bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "bg-emerald-500/10 border-emerald-500/30"
            }`}>
              <RefreshCw className={`w-7 h-7 text-emerald-500 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">CM</span>
            </div>
            <p className="text-[10px] font-bold text-center text-muted-foreground leading-tight">
              Sync<br />Layer
            </p>
          </div>

          {/* Arrow CM → OTAs */}
          <div className="flex flex-col items-center gap-1 flex-1 min-w-[60px]">
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="flex items-center gap-1 text-indigo-500"
            >
              <div className="h-0.5 flex-1 bg-gradient-to-r from-emerald-500/50 to-indigo-500/50 rounded-full" />
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </motion.div>
            <span className="text-[9px] text-muted-foreground font-medium">Push rates/avail</span>
          </div>

          {/* OTAs Node */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col items-center justify-center gap-1">
              <Globe className="w-7 h-7 text-indigo-500" />
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">OTAs</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              {activeConnections.slice(0, 3).map((c: any) => (
                <p key={c.id} className="text-[9px] text-muted-foreground capitalize">{c.ota_name}</p>
              ))}
              {activeConnections.length === 0 && (
                <p className="text-[9px] text-muted-foreground">None connected</p>
              )}
            </div>
          </div>

          {/* Return arrow: OTA → CM → PMS */}
          <div className="flex flex-col items-center gap-1 flex-1 min-w-[60px]">
            <motion.div
              animate={{ x: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="flex items-center gap-1 text-rose-400"
            >
              <ArrowUpRight className="w-4 h-4 shrink-0 rotate-180" />
              <div className="h-0.5 flex-1 bg-gradient-to-l from-indigo-500/50 to-blue-500/50 rounded-full" />
            </motion.div>
            <span className="text-[9px] text-muted-foreground font-medium">Pull bookings</span>
          </div>

          {/* Inbound indicator on PMS */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col items-center justify-center gap-1">
              <Wifi className="w-7 h-7 text-rose-400" />
              <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">Webhook</span>
            </div>
            <p className="text-[10px] font-bold text-center text-muted-foreground leading-tight">
              OTA<br />Bookings
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: OTA + Room Mapping Table */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-500" />
            Channel Mapping
          </h3>
          <div className="backdrop-blur-md bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {connections.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Globe className="w-7 h-7 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No OTA channels connected.</p>
                <Link href="/pms/properties" className="text-xs text-blue-500 hover:text-blue-400 mt-1 inline-block font-bold">
                  Connect an OTA →
                </Link>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OTA</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rooms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {connections.map((conn: any) => {
                    const isActive = conn.status === "active" || conn.status === "connected";
                    return (
                      <tr key={conn.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-bold capitalize">{conn.ota_name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {conn.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{roomTypes.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Anti-overbooking card */}
          <div className="backdrop-blur-md bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-500">Overbooking Shield Active</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Inventory is reduced in PMS first, then synced to all OTAs within seconds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sync Activity Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Real-time Sync Activity
            </h3>
            <Link href="/channel/analytics" className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
              Full Logs <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="backdrop-blur-md bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {recentLogs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No sync events yet.</p>
                <p className="text-xs mt-1 opacity-60">Click "Sync Now" to push your PMS inventory to all OTAs.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentLogs.map((log: any) => {
                  const isSuccess = log.status === "success";
                  const isInbound = log.direction === "inbound";
                  return (
                    <div key={log.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className={`p-2 rounded-lg shrink-0 ${isSuccess ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                        {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isInbound ? (
                            <><span className="text-rose-400 font-bold">← {log.ota_name}</span><span className="text-muted-foreground"> booking received</span></>
                          ) : (
                            <><span className="font-bold capitalize">{log.ota_name}</span><span className="text-muted-foreground"> — {isSuccess ? "Inventory synced" : "Sync failed, retrying"}</span></>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isInbound ? (
                          <ArrowDown className="w-3 h-3 text-rose-400" />
                        ) : (
                          <ArrowUp className="w-3 h-3 text-emerald-500" />
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isSuccess ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        }`}>{log.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Yield teaser */}
          <div className="backdrop-blur-md bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-500">Yield Management</p>
                <p className="text-xs text-muted-foreground mt-0.5">Dynamically optimize rates pushed to each OTA.</p>
              </div>
            </div>
            <Link href="/channel/yield" className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1">
              Configure <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
