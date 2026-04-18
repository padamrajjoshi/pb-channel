"use client";

import React, { useState } from "react";
import { Inbox, Hotel, Download, Clock, Search, Filter, CalendarDays, User, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { useReservations } from "@/hooks/useHotel";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export default function ReservationsPage() {
   const { properties, isLoading: propsLoading } = useProperties();
   const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState("");

   const { reservationsData, isLoading: resLoading, mutate } = useReservations(selectedPropertyId || "");

   React.useEffect(() => {
      if (properties?.length > 0 && !selectedPropertyId) {
         setSelectedPropertyId(properties[0].id);
      }
   }, [properties, selectedPropertyId]);

   const { reservations = [], sources = [], total = 0 } = reservationsData || {};

   const filteredReservations = reservations.filter((res: any) => {
     const searchLow = searchTerm.toLowerCase();
     const guestMatch = res.guest_name?.toLowerCase().includes(searchLow) || (typeof res.guest === 'object' && `${res.guest?.first_name} ${res.guest?.last_name}`.toLowerCase().includes(searchLow));
     const idMatch = res.remote_reservation_id?.toLowerCase().includes(searchLow) || String(res.id).includes(searchLow);
     const sourceMatch = res._source_ota?.toLowerCase().includes(searchLow) || res.channel?.toLowerCase().includes(searchLow);
     return guestMatch || idMatch || sourceMatch;
   });

   const getStatusColor = (status: string) => {
     if (!status) return "bg-muted text-muted-foreground border-border";
     const s = typeof status === 'string' ? status : (status as any).name || (status as any).status || "";
     switch (s.toLowerCase()) {
       case "confirmed":
       case "active":
         return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
       case "cancelled":
         return "bg-rose-500/10 text-rose-600 border-rose-500/20";
       case "modified":
         return "bg-amber-500/10 text-amber-600 border-amber-500/20";
       default:
         return "bg-muted text-muted-foreground border-border";
     }
   };

   const getSourceBadge = (source: string) => {
     const s = source || 'Zodomus';
     if (s.toLowerCase() === "zodomus") {
       return (
         <span className="flex w-fit items-center gap-1.5 px-2 py-1 rounded bg-[#011428]/10 text-slate-800 dark:bg-purple-500/20 dark:text-purple-300 font-bold text-[10px] uppercase border border-slate-200 dark:border-purple-500/20 tracking-wider">
           <span className="w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-purple-400 animate-pulse" />
           Zodomus
         </span>
       );
     }
     return (
       <span className="px-2 py-1 w-fit rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase border border-blue-500/20 tracking-wider">
         {s}
       </span>
     );
   };

   const getGuestName = (res: any) => {
      if (res.guest_name) return res.guest_name;
      if (typeof res.guest === 'object' && res.guest !== null) {
         return `${res.guest.first_name || ""} ${res.guest.last_name || ""}`.trim() || "Guest";
      }
      return String(res.guest || "Unknown Guest");
   };

   const handleExportCSV = () => {
      if (!reservations || reservations.length === 0) return;
      const headers = ["Guest", "Reservation ID", "Check In", "Check Out", "Source", "Revenue", "Status"];
      const rows = reservations.map((res: any) => [
         getGuestName(res),
         res.remote_reservation_id || res.id,
         res.check_in || res.arrival_date || "N/A",
         res.check_out || res.departure_date || "N/A",
         res.channel || res._source_ota || "N/A",
         res.total_price || res.price || "0",
         typeof res.status === 'string' ? res.status : (res.status?.name || res.status?.status || "Active")
      ]);
      const csvContent = [
         headers.join(","),
         ...rows.map((row: any) => row.map((str: any) => `"${String(str).replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `reservations_${selectedPropertyId || 'all'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   return (
      <div className="space-y-8 pb-12 max-w-7xl mx-auto">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 mb-2">
                 <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[10px] font-bold border border-indigo-500/20 uppercase tracking-widest flex items-center gap-1.5">
                   <Inbox className="w-3 h-3" />
                   Channel Manager Inbox
                 </span>
               </div>
               <h2 className="text-4xl font-bold tracking-tight">
                  Reservations Pipeline
               </h2>
               <p className="text-muted-foreground mt-2 font-medium">Real-time incoming booking queue aggregating from all active OTA channels.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
               <div className="bg-card p-1.5 rounded-2xl border border-border flex items-center shrink-0 shadow-sm">
                  {propsLoading ? (
                     <div className="w-48 h-10 bg-muted animate-pulse rounded-xl" />
                  ) : (
                     <select
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="bg-transparent text-foreground px-4 py-2 text-sm font-bold focus:outline-none min-w-[200px]"
                        value={selectedPropertyId || ""}
                     >
                        <option value="" className="bg-card">Select Property...</option>
                        {properties?.map((p: any) => (
                           <option key={p.id} value={p.id} className="bg-card">{p.name}</option>
                        ))}
                     </select>
                  )}
               </div>

               <button 
                  onClick={handleExportCSV}
                  className="h-10 px-4 bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm"
               >
                  <Download className="w-4 h-4" />
                  Export CSV
               </button>
            </div>
         </div>

         {/* Main View */}
         <div className="bg-card border shadow-sm rounded-3xl overflow-hidden flex flex-col relative w-full">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between border-b bg-muted/10 gap-4">
              <div>
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  Active Bookings
                  {selectedPropertyId && (
                     <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                       {total}
                     </span>
                  )}
                </h3>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search guest or OTA..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={!selectedPropertyId || resLoading}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:font-normal"
                  />
                </div>
                <button 
                  onClick={() => mutate()}
                  disabled={!selectedPropertyId || resLoading}
                  className="p-2.5 hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 border bg-background rounded-xl text-muted-foreground transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-4 h-4", resLoading && "animate-spin")} />
                </button>
              </div>
            </div>

            {!selectedPropertyId ? (
               <div className="py-32 text-center text-muted-foreground flex flex-col items-center gap-4">
                  <Hotel className="w-16 h-16 opacity-20" />
                  <p className="font-medium">Please select a property to view its pending reservations.</p>
               </div>
            ) : resLoading ? (
               <div className="py-32 text-center text-muted-foreground flex flex-col items-center gap-4">
                  <Clock className="w-12 h-12 animate-spin text-indigo-500" />
                  <span className="italic font-medium">Fetching active reservation pipelines...</span>
               </div>
            ) : filteredReservations.length === 0 ? (
               <div className="text-center py-20 bg-muted/5">
                 <p className="text-muted-foreground font-medium">No reservations match your criteria or pipeline is empty.</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left border-collapse">
                   <thead className="bg-muted/30">
                     <tr>
                       <th className="p-4 font-semibold text-muted-foreground border-b uppercase text-[10px] tracking-wider whitespace-nowrap">Guest</th>
                       <th className="p-4 font-semibold text-muted-foreground border-b uppercase text-[10px] tracking-wider whitespace-nowrap">Check-In / Out</th>
                       <th className="p-4 font-semibold text-muted-foreground border-b uppercase text-[10px] tracking-wider whitespace-nowrap">Source</th>
                       <th className="p-4 font-semibold text-muted-foreground border-b uppercase text-[10px] tracking-wider whitespace-nowrap">Revenue</th>
                       <th className="p-4 font-semibold text-muted-foreground border-b uppercase text-[10px] tracking-wider whitespace-nowrap">Status</th>
                       <th className="p-4 font-semibold text-muted-foreground border-b uppercase text-[10px] tracking-wider whitespace-nowrap text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     <AnimatePresence>
                     {filteredReservations.map((res: any, idx: number) => (
                       <motion.tr 
                         key={res.id || idx} 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         transition={{ delay: idx * 0.03 }}
                         className="hover:bg-muted/30 transition-colors group"
                       >
                         <td className="p-4">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                               <User className="w-4 h-4" />
                             </div>
                             <div>
                               <div className="font-bold text-foreground">{getGuestName(res)}</div>
                               <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest leading-none mt-1">{res.remote_reservation_id || res.id}</div>
                             </div>
                           </div>
                         </td>
                         <td className="p-4">
                           <div className="flex items-center gap-3">
                             <CalendarDays className="w-4 h-4 text-muted-foreground opacity-50" />
                             <div>
                               <div className="font-semibold text-xs">{res.check_in || res.arrival_date ? new Date(res.check_in || res.arrival_date).toLocaleDateString() : 'N/A'}</div>
                               <div className="font-semibold text-xs mt-0.5 text-muted-foreground">{res.check_out || res.departure_date ? new Date(res.check_out || res.departure_date).toLocaleDateString() : 'N/A'}</div>
                             </div>
                           </div>
                         </td>
                         <td className="p-4">
                           {getSourceBadge(res._source_ota || res.channel)}
                         </td>
                         <td className="p-4">
                           <div className="font-bold">
                             {res.currency || 'INR'} {res.total_price?.toLocaleString() || res.price?.toLocaleString() || "0.00"}
                           </div>
                           {(res.num_rooms > 1) && (
                             <div className="text-[10px] font-bold text-muted-foreground uppercase">{res.num_rooms} Rooms</div>
                           )}
                         </td>
                         <td className="p-4">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize tracking-wide ${getStatusColor(typeof res.status === 'string' ? res.status : res.status?.name)}`}>
                             {typeof res.status === 'string' ? res.status : (res.status?.name || res.status?.status || "Active")}
                           </span>
                         </td>
                         <td className="p-4 text-right">
                           <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                             <ExternalLink className="w-4 h-4" />
                           </button>
                         </td>
                       </motion.tr>
                     ))}
                     </AnimatePresence>
                   </tbody>
                 </table>
               </div>
            )}

            {sources.length > 0 && selectedPropertyId && (
              <div className="bg-muted/30 border-t p-4 flex gap-4 text-xs text-muted-foreground items-center font-medium overflow-x-auto">
                <span className="uppercase tracking-widest text-[10px] font-bold">Active Sources:</span>
                {sources.map((s: any) => (
                  <span key={s.ota} className="bg-background px-2 py-1 rounded border shadow-sm flex items-center gap-2">
                    <span className="capitalize">{s.ota}</span>
                    <span className="bg-indigo-500 text-white px-1.5 rounded font-bold font-mono text-[10px]">{s.count}</span>
                  </span>
                ))}
              </div>
            )}
         </div>
      </div>
   );
}
