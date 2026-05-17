"use client";

import React from "react";
import {
   Briefcase,
   TrendingUp,
   Inbox,
   BarChart3,
   Users,
   Activity,
   Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";
import { useReservations } from "@/hooks/useHotel";

export default function AgentPortalOverview() {
   const { properties, isLoading: propsLoading } = useProperties();
   
   // In Agent portal, we might only see reservations handled by the agent
   // For now, let's show general stats for the primary property
   const primaryPropertyId = properties?.[0]?.id || null;
   const { reservationsData, isLoading: resLoading } = useReservations(primaryPropertyId || "");

   const isLoading = propsLoading || resLoading;
   
   if (isLoading) {
      return (
         <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="font-medium animate-pulse">Loading Agent Portal...</p>
         </div>
      );
   }

   const stats = [
      { name: "Assigned Properties", value: properties?.length || 0, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
      { name: "My Active Bookings", value: reservationsData?.reservations?.length || 0, icon: Inbox, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { name: "Total Commission", value: "₹0", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
      { name: "Performance Score", value: "98%", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-500/10" },
   ];

   return (
      <div className="space-y-8 pb-12">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
               <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border p-6 rounded-2xl shadow-sm"
               >
                  <div className="flex items-center gap-4">
                     <div className={`${stat.bg} p-3 rounded-xl ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.name}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         <div className="bg-card border border-border p-8 rounded-3xl text-center">
            <h3 className="text-xl font-bold mb-2">Partner Management</h3>
            <p className="text-muted-foreground">This area will allow you to manage B2B contracts, partner commissions, and agent-specific booking pipelines.</p>
         </div>
      </div>
   );
}
