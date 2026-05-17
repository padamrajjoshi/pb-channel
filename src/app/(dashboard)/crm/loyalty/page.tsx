"use client";

import React from "react";
import {
   ShieldCheck,
   TrendingUp,
   Users,
   Award,
   Gift,
   Star,
   ArrowUpRight,
   Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";
import { useHotel } from "@/hooks/useHotel";

export default function LoyaltyProgramPage() {
   const { properties, isLoading: propsLoading } = useProperties();
   const primaryPropertyId = properties?.[0]?.id || null;
   const { property, isLoading: hotelLoading } = useHotel(primaryPropertyId || "");

   const isLoading = propsLoading || hotelLoading;

   if (isLoading) {
      return (
         <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="font-medium animate-pulse">Loading Loyalty System...</p>
         </div>
      );
   }

   const stats = [
      { name: "Loyalty Members", value: "1,284", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
      { name: "Points Issued", value: "450k", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
      { name: "Rewards Claimed", value: "342", icon: Gift, color: "text-rose-500", bg: "bg-rose-500/10" },
      { name: "Retention Rate", value: "68%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
   ];

   return (
      <div className="space-y-8 pb-12 text-foreground">
         {/* Stats Row */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
               <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group"
               >
                  <div className="flex items-center gap-4 relative z-10">
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

         {/* Loyalty Tiers */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500" />
                  Active Tiers & Benefits
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                     { name: "Silver", color: "text-slate-400", bg: "bg-slate-400/10", members: "842", benefit: "5% Discount" },
                     { name: "Gold", color: "text-amber-500", bg: "bg-amber-500/10", members: "312", benefit: "15% Discount + Late Checkout" },
                     { name: "Platinum", color: "text-indigo-500", bg: "bg-indigo-500/10", members: "130", benefit: "Free Room Upgrades" },
                  ].map((tier) => (
                     <div key={tier.name} className="bg-card border border-border p-6 rounded-2xl space-y-4">
                        <div className={`w-12 h-12 rounded-xl ${tier.bg} ${tier.color} flex items-center justify-center`}>
                           <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                           <h4 className="font-bold text-lg">{tier.name}</h4>
                           <p className="text-xs text-muted-foreground">{tier.members} Members</p>
                        </div>
                        <div className="pt-4 border-t border-border">
                           <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Top Benefit</p>
                           <p className="text-xs font-medium">{tier.benefit}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-xl font-bold flex items-center gap-2">
                  <Gift className="w-5 h-5 text-rose-500" />
                  Recent Redemptions
               </h3>
               <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
                  {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                              JD
                           </div>
                           <div>
                              <p className="text-sm font-bold">John Doe</p>
                              <p className="text-[10px] text-muted-foreground">Redeemed: Free Breakfast</p>
                           </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground/30" />
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
