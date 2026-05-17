"use client";

import React from "react";
import {
  Hotel,
  TrendingUp,
  Users,
  BedDouble,
  LogIn,
  LogOut,
  ClipboardList,
  Wrench,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Clock,
  Zap,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useProperties } from "@/hooks/useProperties";
import { useReservations, useHotelRoomTypes, useAvailability } from "@/hooks/useHotel";
import { useChannelSync } from "@/hooks/useChannelSync";
import { cn } from "@/utils/cn";

// Utility: Get next 7 days as date strings
function getNext7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export default function PMSWorkspace() {
  const { properties, isLoading: propsLoading } = useProperties();
  const primaryProperty = properties?.[0] || null;
  const primaryPropertyId = primaryProperty?.id ? String(primaryProperty.id) : null;

  const todayStr = getNext7Days()[0];
  const endDateStr = getNext7Days()[6];

  const { reservationsData, isLoading: resLoading } = useReservations(primaryPropertyId || "");
  const { roomTypes = [], isLoading: roomsLoading } = useHotelRoomTypes(primaryPropertyId || "");
  const { lastSyncedAt, isRateLimited } = useChannelSync(primaryPropertyId);

  const reservations = reservationsData?.reservations || [];
  const now = new Date().toDateString();

  const checkInsToday = reservations.filter((r: any) => new Date(r.check_in).toDateString() === now).length;
  const checkOutsToday = reservations.filter((r: any) => new Date(r.check_out).toDateString() === now).length;
  const revenueMTD = reservations.reduce((acc: number, r: any) => acc + (r.total_price || 0), 0);
  const confirmedCount = reservations.filter((r: any) => r.status === "confirmed").length;
  const occupancyRate = roomTypes.length > 0 ? Math.min(100, Math.round((confirmedCount / roomTypes.length) * 100)) : 0;

  const stats = [
    { name: "Arrivals", value: checkInsToday, icon: LogIn, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "Today" },
    { name: "Departures", value: checkOutsToday, icon: LogOut, color: "text-rose-500", bg: "bg-rose-500/10", trend: "Today" },
    { name: "Occupancy", value: `${occupancyRate}%`, icon: BedDouble, color: "text-primary", bg: "bg-primary/10", trend: "Peak" },
    { name: "Yield MTD", value: `₹${revenueMTD.toLocaleString()}`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10", trend: "Revenue" },
  ];

  const quickActions = [
    { label: "New Res", icon: ClipboardList, href: "/pms/reservations", color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white" },
    { label: "Rooms", icon: BedDouble, href: "/pms/rooms", color: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white" },
    { label: "Clean", icon: Wrench, href: "/pms/rooms", color: "bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white" },
    { label: "Pay", icon: CreditCard, href: "/pms/reservations", color: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white" },
    { label: "Guests", icon: Users, href: "/pms/reservations", color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white" },
    { label: "Hotel", icon: Hotel, href: "/pms/properties", color: "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white" },
  ];

  const next7Days = getNext7Days();
  const isLoading = propsLoading || resLoading || roomsLoading;

  const inventoryGrid = roomTypes.map((rt: any) => ({
    id: rt.id,
    name: rt.name,
    inventory: rt.total_inventory || 1,
    days: next7Days.map((day) => {
      const occupied = reservations.filter(
        (r: any) =>
          r.room_type_id === rt.id &&
          r.status !== "cancelled" &&
          r.check_in <= day &&
          r.check_out > day
      ).length;
      const available = Math.max(0, (rt.total_inventory || 1) - occupied);
      const pct = Math.min(100, Math.round((occupied / (rt.total_inventory || 1)) * 100));
      return { day, occupied, available, pct };
    }),
  }));

  const syncStatus = lastSyncedAt
    ? `Validated ${lastSyncedAt.toLocaleTimeString()}`
    : "Channel Sync Pending";
  const syncIsGood = !!lastSyncedAt && !isRateLimited;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-2 shadow-sm">
              <Zap className="w-3 h-3" />
              PMS ENGINE ACTIVE
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
             Property <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm max-w-lg">
            Internal hospitality brain managing rooms, reservations, and real-time operations across your portfolio.
          </p>
        </div>

        <div className={cn(
          "flex items-center gap-6 p-4 rounded-[2rem] border transition-all duration-500 shadow-xl shadow-primary/5",
          syncIsGood ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
        )}>
          <div className={cn(
            "p-4 rounded-2xl",
            syncIsGood ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
          )}>
            {syncIsGood ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
             <p className={cn("text-sm font-black tracking-tight", syncIsGood ? "text-emerald-500" : "text-amber-500")}>
               {syncIsGood ? "Channel Matrix In Sync" : "Sync Required"}
             </p>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">{syncStatus}</p>
          </div>
          <Link href="/channel" className={cn(
            "p-2 rounded-xl transition-all hover:scale-110 active:scale-90",
            syncIsGood ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
          )}>
             <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card/40 backdrop-blur-md border border-border/50 p-8 rounded-[2.5rem] shadow-lg shadow-primary/5 group hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={cn(stat.bg, stat.color, "p-4 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-6")}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{stat.trend}</span>
            </div>
            <p className="text-4xl font-black tracking-tighter mb-1">
               {isLoading ? (
                 <span className="inline-block w-20 h-8 bg-muted animate-pulse rounded-lg" />
               ) : stat.value}
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">{stat.name}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Inventory Health Matrix */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black flex items-center gap-3">
              <BedDouble className="w-6 h-6 text-primary" />
              Inventory Health Grid
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Next 7 Days Rolling</span>
          </div>

          <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />
            <div className="overflow-x-auto no-scrollbar relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 backdrop-blur-md border-b border-border/40">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground min-w-[200px]">Category</th>
                    {next7Days.map((day) => {
                      const d = new Date(day);
                      const isToday = day === todayStr;
                      return (
                        <th key={day} className="px-4 py-6 text-center min-w-[80px]">
                          <div className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            isToday ? "text-primary" : "text-muted-foreground/60"
                          )}>{d.toLocaleDateString("en", { weekday: "short" })}</div>
                          <div className={cn(
                            "text-xl font-black",
                            isToday ? "text-primary" : "text-foreground"
                          )}>{d.getDate()}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {inventoryGrid.map((rt: any) => (
                    <tr key={rt.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-8">
                        <p className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">{rt.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50 mt-1">Total {rt.inventory} Units</p>
                      </td>
                      {rt.days.map(({ day, occupied, available, pct }: any) => (
                        <td key={day} className="px-3 py-6">
                           <div className="flex flex-col items-center gap-3">
                              <div className={cn(
                                "w-14 h-14 rounded-[1.25rem] flex flex-col items-center justify-center gap-0.5 border shadow-sm transition-transform hover:scale-110",
                                pct >= 100 ? "bg-rose-500/10 border-rose-500/30 text-rose-600" :
                                pct >= 70 ? "bg-amber-500/10 border-amber-500/30 text-amber-600" :
                                pct >= 30 ? "bg-primary/10 border-primary/30 text-primary" :
                                "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                              )}>
                                <span className="text-xl font-black">{available}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">AVL</span>
                              </div>
                              <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  className={cn(
                                    "h-full rounded-full",
                                    pct >= 100 ? "bg-rose-500" :
                                    pct >= 70 ? "bg-amber-500" :
                                    pct >= 30 ? "bg-primary" :
                                    "bg-emerald-500"
                                  )}
                                />
                              </div>
                           </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-5 bg-muted/20 border-t border-border/40 flex flex-wrap items-center gap-x-8 gap-y-4">
               {[
                 { label: "Optimal", color: "bg-emerald-500" },
                 { label: "Steady", color: "bg-primary" },
                 { label: "High Demand", color: "bg-amber-500" },
                 { label: "Sold Out", color: "bg-rose-500" }
               ].map(l => (
                 <div key={l.label} className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", l.color)} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">{l.label}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Operations */}
        <div className="space-y-8">
           <div className="space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3 px-2">
                <Clock className="w-6 h-6 text-primary" />
                Operations
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "p-6 rounded-[2rem] border border-border/60 flex flex-col items-center gap-3 text-center transition-all cursor-pointer group shadow-lg hover:shadow-primary/5 shadow-primary/5 hover:border-primary/50",
                        "bg-card/40 backdrop-blur-sm"
                      )}
                    >
                      <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-all", action.color)}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-black tracking-tight">{action.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
           </div>

           {/* Live Feed Placeholder / Next Arrival */}
           <div className="p-8 bg-gradient-to-br from-primary to-indigo-700 text-white rounded-[2.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <Zap className="absolute top-[-20px] right-[-20px] w-40 h-40 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                       <Clock className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">Next Check-in</span>
                 </div>
                 {isLoading ? (
                   <div className="space-y-2 animate-pulse">
                     <div className="h-8 bg-white/10 rounded-lg w-3/4" />
                     <div className="h-4 bg-white/10 rounded-lg w-1/2" />
                   </div>
                 ) : reservations[0] ? (
                   <div>
                      <h4 className="text-2xl font-black leading-tight">
                        {reservations[0].guest_name || reservations[0].booker_name || "Upcoming Guest"}
                      </h4>
                      <p className="text-white/70 text-sm font-medium mt-1">
                        Arrival in ~{Math.floor(Math.random() * 5) + 1} hours • Room {Math.floor(Math.random() * 500) + 100}
                      </p>
                   </div>
                 ) : (
                   <p className="text-white/70 text-sm font-medium">No arrivals scheduled for the next 24 hours.</p>
                 )}
                 <Link href="/pms/reservations" className="block w-full py-4 bg-white text-primary rounded-2xl text-center text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Manage Board
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {/* Reservation Board Table */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-primary" />
              Recent Distribution
            </h3>
            <Link href="/pms/reservations" className="text-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">Full Log</Link>
         </div>

         <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/40">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Guest Identity</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Arrival / Departure</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Net Value</th>
                      <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {isLoading ? (
                      [1,2,3,4,5].map(i => (
                        <tr key={i}>
                          <td colSpan={5} className="px-8 py-6"><div className="h-8 bg-muted animate-pulse rounded-xl w-full" /></td>
                        </tr>
                      ))
                    ) : reservations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic font-medium">No active records found in the current period.</td>
                      </tr>
                    ) : (
                      reservations.slice(0, 8).map((r: any) => (
                        <tr key={r.id} className="hover:bg-muted/10 transition-colors group">
                          <td className="px-8 py-6">
                             <p className="font-black tracking-tight">{r.guest_name || r.booker_name || `Guest #${r.id}`}</p>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50 mt-1">REF: #{r.id.toString().slice(-6)}</p>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                                <span>{new Date(r.check_in).toLocaleDateString()}</span>
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                <span>{new Date(r.check_out).toLocaleDateString()}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-medium text-muted-foreground">
                             {roomTypes.find((rt: any) => rt.id === r.room_type_id)?.name || "Standard Room"}
                          </td>
                          <td className="px-8 py-6 text-right font-black text-lg tracking-tight">₹{(r.total_price || 0).toLocaleString()}</td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center">
                               <span className={cn(
                                 "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                                 r.status === "confirmed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
                                 r.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
                                 r.status === "cancelled" ? "bg-rose-500/10 border-rose-500/20 text-rose-600" :
                                 "bg-muted text-muted-foreground"
                               )}>
                                 {r.status}
                               </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
