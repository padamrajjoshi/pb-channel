"use client";

import React from "react";
import { useReservations, useSyncLogs } from "@/hooks/useHotel";
import { Loader2, PieChart, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

export function AnalyticsDashboard({ propertyId }: { propertyId: number }) {
  const { reservationsData, isLoading: resLoading } = useReservations(propertyId);
  const { syncLogs, isLoading: logsLoading } = useSyncLogs(propertyId);

  if (resLoading || logsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p className="text-sm font-medium">Aggregating telemetry and audit logs...</p>
      </div>
    );
  }

  // --- Process Channels Data ---
  const { sources = [], total = 0, reservations = [] } = reservationsData || {};
  
  // Calculate Revenue
  const totalRevenue = reservations.reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0);

  // --- Process Sync Logs Data ---
  const logs = Array.isArray(syncLogs) ? syncLogs : [];
  const recentLogs = [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50);
  
  // Real-time telemetry calculations
  const now = new Date();
  const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const logs24h = logs.filter((log: any) => new Date(log.created_at) >= past24h);
  const totalSyncs24h = logs24h.length;
  const successfulSyncs = logs24h.filter((log: any) => log.status === 'success').length;
  const healthScore = totalSyncs24h > 0 ? ((successfulSyncs / totalSyncs24h) * 100).toFixed(1) + "%" : "100%";

  const latestByOTA = Object.values(
    logs.reduce((acc: any, log: any) => {
      if (!acc[log.ota_name] || new Date(log.created_at) > new Date(acc[log.ota_name].created_at)) {
        acc[log.ota_name] = log;
      }
      return acc;
    }, {})
  );
  const connectionAlerts = latestByOTA.filter((log: any) => log.status !== 'success').length;


  return (
    <div className="space-y-6">
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Reservations</p>
            <h3 className="text-3xl font-black">{total}</h3>
            <p className="text-xs text-muted-foreground mt-2">Active pipeline bookings</p>
          </div>
        </div>

        <div className="bg-card border rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-600">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Gross Revenue (INR)</p>
            <h3 className="text-3xl font-black">₹{totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-muted-foreground mt-2">Sum of confirmed OTA bookings</p>
          </div>
        </div>

        {/* Sync Telemetry Stack */}
        <div className="grid grid-rows-3 gap-6">
           <div className="bg-card border rounded-3xl p-4 shadow-sm flex items-center justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-[20px] rounded-full -mr-8 -mt-8" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Health Score</p>
                <p className={cn(
                   "text-2xl font-bold",
                   parseFloat(healthScore) < 95 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                )}>{healthScore}</p>
              </div>
              <p className="text-[10px] text-muted-foreground w-20 text-right">Past 24h success rate</p>
           </div>
           
           <div className="bg-card border rounded-3xl p-4 shadow-sm flex items-center justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-[20px] rounded-full -mr-8 -mt-8" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Syncs</p>
                <p className="text-2xl font-bold">{totalSyncs24h.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-muted-foreground w-20 text-right">In the last 24 hours</p>
           </div>

           <div className="bg-card border rounded-3xl p-4 shadow-sm flex items-center justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-[20px] rounded-full -mr-8 -mt-8" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Connection Alerts</p>
                <p className={cn(
                   "text-xl font-bold",
                   connectionAlerts > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                )}>{connectionAlerts}</p>
              </div>
              <p className={cn(
                 "text-[10px] w-28 text-right font-medium",
                 connectionAlerts > 0 ? "text-rose-600 dark:text-rose-400/80" : "text-emerald-600 dark:text-emerald-400/70"
              )}>{connectionAlerts > 0 ? "Channels require attention" : "Everything operational"}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Channel Distribution */}
        <div className="lg:col-span-1 bg-card border rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b bg-muted/10">
            <h3 className="font-bold text-foreground">Bookings by Channel</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
            {sources.length > 0 ? sources.map((s: any, i: number) => {
              const bgColors = ["bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-emerald-500"];
              const color = bgColors[i % bgColors.length];
              const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
              return (
                <div key={s.ota}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold capitalize">{s.ota}</span>
                    <span className="text-muted-foreground">{s.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-muted-foreground text-sm">No active channel bookings</div>
            )}
          </div>
        </div>

        {/* Sync Audit Trail */}
        <div className="lg:col-span-2 bg-card border rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b bg-muted/10 flex items-center justify-between">
            <h3 className="font-bold text-foreground">Background Sync Audit Log</h3>
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">Last 50 Events</span>
          </div>
          
          <div className="h-[400px] overflow-y-auto custom-scrollbar">
            {recentLogs.length > 0 ? (
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted/5 sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="p-4 font-semibold text-muted-foreground border-b uppercase text-[10px] tracking-wider">Timestamp</th>
                    <th className="p-4 font-semibold text-muted-foreground border-b uppercase text-[10px] tracking-wider">OTA</th>
                    <th className="p-4 font-semibold text-muted-foreground border-b uppercase text-[10px] tracking-wider">Status</th>
                    <th className="p-4 font-semibold text-muted-foreground border-b uppercase text-[10px] tracking-wider">Detail Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold capitalize">
                        {log.ota_name}
                      </td>
                      <td className="p-4">
                        {log.status === "success" ? (
                          <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Success
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold">
                            <AlertCircle className="w-4 h-4" /> Failed
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground max-w-[200px] truncate" title={log.message}>
                        {log.message || "Operation completed normally."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Activity className="w-8 h-8 opacity-20 mb-3" />
                <p className="text-sm font-medium">No sync events recorded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
