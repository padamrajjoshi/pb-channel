"use client";

import React from "react";
import {
   BarChart3,
   TrendingUp,
   Zap,
   Settings,
   ArrowUpRight,
   AlertCircle,
   Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";

export default function YieldManagementPage() {
   const { properties, isLoading: propsLoading } = useProperties();

   if (propsLoading) {
      return (
         <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="font-medium animate-pulse">Analyzing market trends...</p>
         </div>
      );
   }

   return (
      <div className="space-y-8 pb-12 text-foreground">
         <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-8 rounded-3xl">
            <div className="flex items-start justify-between">
               <div className="space-y-2">
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                     <TrendingUp className="w-8 h-8 text-blue-500" />
                     Yield Management
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                     Maximize your revenue by dynamically adjusting rates based on demand, seasonality, and occupancy. 
                     Our AI-driven engine pushes optimized pricing to all channels simultaneously.
                  </p>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                  <Zap className="w-3 h-3 fill-current" />
                  Auto-Optimization Active
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-card border border-border p-6 rounded-2xl">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                     <Settings className="w-5 h-5 text-muted-foreground" />
                     Active Rules
                  </h3>
                  <div className="space-y-4">
                     {[
                        { name: "Last Minute Demand", condition: "Occupancy < 20% in next 48h", action: "Reduce rates by 15%", status: "Active" },
                        { name: "High Occupancy Surge", condition: "Occupancy > 85%", action: "Increase rates by 25%", status: "Active" },
                        { name: "Early Bird Special", condition: "Booking > 30 days in advance", action: "10% Discount", status: "Inactive" },
                     ].map((rule) => (
                        <div key={rule.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                           <div>
                              <p className="font-bold text-sm">{rule.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{rule.condition} → {rule.action}</p>
                           </div>
                           <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${rule.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                              {rule.status}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl space-y-6">
               <h3 className="font-bold text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  Market Insights
               </h3>
               <div className="space-y-4">
                  <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                     <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Demand Forecast</p>
                     <p className="text-sm font-medium leading-relaxed">
                        Local events in Delhi are driving a 20% increase in searches for next weekend. Consider adjusting base rates.
                     </p>
                  </div>
                  <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                     <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Competitive Price</p>
                     <p className="text-sm font-medium leading-relaxed">
                        Similar properties are priced 12% higher for your "Deluxe" room type.
                     </p>
                  </div>
               </div>
               <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">
                  Run Market Scan
               </button>
            </div>
         </div>
      </div>
   );
}
