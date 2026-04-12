"use client";

import React from "react";
import {
   Hotel,
   Activity,
   RefreshCw,
   TrendingUp,
   AlertTriangle,
   CheckCircle2,
   Clock,
   Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";
import { useHotelConnections, useSyncLogs, useReservations } from "@/hooks/useHotel";
import Link from "next/link";

export default function DashboardHome() {
   const { properties, isLoading: propsLoading } = useProperties();
   
   // Defaulting aggregate analytics to primary assigned portfolio property until Multi-Property dashboards are required
   const primaryPropertyId = properties?.[0]?.id || null;

   const { connections = [], isLoading: connLoading } = useHotelConnections(primaryPropertyId || "");
   const { syncLogs = [], isLoading: logsLoading } = useSyncLogs(primaryPropertyId || "");
   const { reservationsData, isLoading: resLoading } = useReservations(primaryPropertyId || "");

   const isLoading = propsLoading || connLoading || logsLoading || resLoading;
   
   const revenueMTD = reservationsData?.reservations?.reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0) || 0;
   const activeChannels = connections.filter((c: any) => c.status === "active" || c.status === "connected").length;

   const dailySuccessSyncs = Array.isArray(syncLogs) ? syncLogs.filter((l: any) => 
      l.status === "success" && new Date(l.created_at) > new Date(Date.now() - 86400000)
   ).length : 0;

   const stats = [
      { name: "Total Properties", value: propsLoading ? "..." : (properties?.length || 0).toString(), icon: Hotel, color: "text-blue-400", bg: "bg-blue-500/10" },
      { name: "Active Channels", value: activeChannels.toString(), icon: Activity, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { name: "Daily Syncs", value: dailySuccessSyncs.toString(), icon: RefreshCw, color: "text-emerald-400", bg: "bg-emerald-500/10" },
      { name: "Revenue (MTD)", value: `₹${revenueMTD.toLocaleString()}`, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
   ];

   return (
      <div className="space-y-8 pb-12">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat: any, index: number) => (
               <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
               >
                  <div className={stat.bg + " absolute top-0 right-0 w-24 h-24 blur-[30px] rounded-full -mr-12 -mt-12 group-hover:blur-[40px] transition-all duration-500 opacity-50"} />

                  <div className="flex items-center gap-4 relative">
                     <div className={stat.bg + " p-3 rounded-xl " + stat.color}>
                        <stat.icon className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.name}</p>
                        <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sync Status / Activity */}
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                     <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                     Recent Sync Activity
                  </h3>
                  <Link 
                     href="/analytics"
                     className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                     View Full Logs
                  </Link>
               </div>

               <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm h-[278px]">
                  <div className="divide-y divide-border overflow-y-auto h-full custom-scrollbar">
                     {(!syncLogs || syncLogs.length === 0) && (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                           <RefreshCw className="w-6 h-6 mb-2 opacity-50" />
                           <p className="text-sm">No synchronized pipeline activity detected.</p>
                        </div>
                     )}
                     
                     {Array.isArray(syncLogs) && syncLogs.slice(0, 10).map((activity: any) => (
                        <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${activity.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500 dark:text-rose-400'}`}>
                                 {activity.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                              </div>
                              <div>
                                 <p className="font-medium text-sm">
                                    {activity.status === 'success' ? 'Telemetry Event' : 'Sync Error Event'}
                                    <span className="text-muted-foreground font-normal"> on </span>
                                    {activity.ota_name}
                                 </p>
                                 <p className="text-xs text-muted-foreground mt-0.5">{new Date(activity.created_at).toLocaleString()}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Channel Distribution */}
            <div className="space-y-6">
               <h3 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  Channel Health
               </h3>

               <div className="bg-card border border-border rounded-2xl p-6 h-[278px] flex flex-col justify-start gap-6 shadow-sm overflow-y-auto custom-scrollbar">
                  {(!connections || connections.length === 0) ? (
                     <div className="text-center text-muted-foreground pt-12">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Awaiting connections or data aggregation...</p>
                     </div>
                  ) : (
                     connections.map((conn: any, i: number) => {
                        const bgColors = ["bg-emerald-500", "bg-indigo-500", "bg-amber-500", "bg-blue-500"];
                        const textColor = ["text-emerald-500", "text-indigo-500", "text-amber-500", "text-blue-500"];
                        const themeB = bgColors[i % bgColors.length];
                        const themeT = textColor[i % bgColors.length];

                        return (
                           <div key={conn.id} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                 <span className={`${themeT} dark:${themeT} capitalize`}>{conn.ota_name}</span>
                                 <span className="text-foreground/60 capitalize">{conn.status}</span>
                              </div>
                              <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: conn.status === 'active' || conn.status === 'connected' ? '100%' : '35%' }} className={`${themeB} h-full`} />
                              </div>
                           </div>
                        );
                     })
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
