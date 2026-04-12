"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Hotel,
  Info,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";
import { useHotelRoomTypes, useAvailability } from "@/hooks/useHotel";
import { BulkUpdateModal } from "@/components/dashboard/BulkUpdateModal";
import { cn } from "@/utils/cn";
import { api } from "@/lib/api";

// Native replacements for date-fns
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date, pattern: string) => {
  if (pattern === 'EEE') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  if (pattern === 'dd') {
    return date.getDate().toString().padStart(2, '0');
  }
  if (pattern === 'yyyy-MM-dd') {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return date.toISOString();
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function PortfolioCalendarPage() {
  const { properties, isLoading: propsLoading } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const { roomTypes, isLoading: roomsLoading } = useHotelRoomTypes(selectedPropertyId || "");

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{ room: any, date: Date } | null>(null);
  const [editInventory, setEditInventory] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const today = startOfToday();
  // Generate 30 days matching a 7-day week wrapper
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i));

  const startDateStr = formatDate(days[0], 'yyyy-MM-dd');
  const endDateStr = formatDate(days[days.length - 1], 'yyyy-MM-dd');

  const { grid, mutate: mutateGrid } = useAvailability(
    selectedPropertyId || "",
    startDateStr,
    endDateStr
  );

  useEffect(() => {
    if (properties?.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  useEffect(() => {
    if (roomTypes?.length > 0 && !selectedRoomTypeId) {
      setSelectedRoomTypeId(roomTypes[0].id);
    }
  }, [roomTypes, selectedRoomTypeId]);

  const handleSaveOverride = async () => {
    if (!editingCell || !selectedPropertyId) return;
    setIsSaving(true);
    try {
      await api.post(`/hotels/${selectedPropertyId}/calendar-override`, {
        date: formatDate(editingCell.date, 'yyyy-MM-dd'),
        room_type_id: editingCell.room.id,
        inventory: editInventory ? parseInt(editInventory) : undefined,
        price: editPrice ? parseInt(editPrice) : undefined
      });
      closeModal();
      mutateGrid();
    } catch (e) {
      console.error("Failed to sync override to Zodomus", e);
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setEditingCell(null);
    setEditInventory("");
    setEditPrice("");
  };

  const selectedRoom = roomTypes?.find((r: any) => r.id === selectedRoomTypeId);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[10px] font-bold border border-indigo-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" />
              Live Inventory Matrix
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
             Monthly Yield View
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Visualizing 30-day occupancy across your distribution network.</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-card border border-border rounded-2xl p-1.5 flex transition-all shadow-sm">
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
             onClick={() => setIsBulkModalOpen(true)}
             disabled={!selectedPropertyId}
             className="h-10 px-5 bg-slate-800 hover:bg-slate-700 dark:bg-white/10 dark:hover:bg-white/20 text-white rounded-2xl font-bold transition-all shadow-sm disabled:opacity-50 text-sm"
           >
             Bulk Update
           </button>
        </div>
      </div>

      {/* Room Category Tabs */}
      {selectedPropertyId && !roomsLoading && roomTypes?.length > 0 && (
         <div className="flex flex-wrap items-center gap-2 p-1.5 bg-card border border-border rounded-2xl shadow-sm w-fit">
            {roomTypes.map((room: any) => (
               <button
                  key={room.id}
                  onClick={() => setSelectedRoomTypeId(room.id)}
                  className={cn(
                     "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                     selectedRoomTypeId === room.id 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                        : "text-muted-foreground hover:bg-muted"
                  )}
               >
                  {room.name}
               </button>
            ))}
         </div>
      )}

      {/* Calendar Grid Container */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        {/* Day Headers (Sun-Sat or Mon-Sun) */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-r border-border/50 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {!selectedPropertyId ? (
          <div className="py-32 text-center text-muted-foreground flex flex-col items-center gap-4">
            <Hotel className="w-16 h-16 opacity-20" />
            <p className="font-medium">Please select a property to initialize the engine.</p>
          </div>
        ) : roomsLoading ? (
          <div className="py-32 text-center text-muted-foreground flex flex-col items-center gap-4">
             <Loader2 className="w-8 h-8 animate-spin text-indigo-500 opacity-50" />
             <p className="italic font-medium">Assembling monthly availability matrix...</p>
          </div>
        ) : !selectedRoom ? (
          <div className="py-32 text-center text-muted-foreground italic">
            No room types configured for this property.
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-border/50">
            {/* 1. Logic for Month start padding if we wanted a strictly Monthly grid, 
                but for a "30 day" rolling view requested, we just show 30 days starting from today. */}
            {days.map((day, i) => {
              const dateStr = formatDate(day, 'yyyy-MM-dd');
              const isToday = dateStr === formatDate(startOfToday(), 'yyyy-MM-dd');
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              // Lookup actual availability
              let currentUnits = selectedRoom.total_inventory;
              let currentPrice = selectedRoom.base_price;
              
              if (grid && grid[selectedRoom.id]) {
                const dayData = grid[selectedRoom.id].find((d: any) => d.date === dateStr);
                if (dayData) {
                  currentUnits = dayData.units;
                  // If backend ever adds price to dayData, it will pick it up here
                  if (dayData.price !== undefined) currentPrice = dayData.price; 
                }
              }

              const isLow = currentUnits <= 2;

              return (
                <div 
                  key={i} 
                  className={cn(
                    "min-h-[140px] p-3 bg-card relative group transition-all",
                    isToday ? "ring-2 ring-inset ring-indigo-500/40 z-10" : "",
                    isWeekend ? "bg-muted/10" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                      "text-xs font-bold",
                      isToday ? "bg-indigo-600 text-white px-2 py-0.5 rounded-md" : "text-muted-foreground"
                    )}>
                      {formatDate(day, 'dd')}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/40">{formatDate(day, 'EEE')}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center pt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingCell({ room: selectedRoom, date: day })}
                      className={cn(
                        "w-full py-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all",
                        isLow ? "bg-rose-500/5 border-rose-500/20 hover:border-rose-500" : "bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500"
                      )}
                    >
                      <span className={cn(
                        "text-xl font-black",
                        isLow ? "text-rose-500" : "text-indigo-600 dark:text-indigo-400"
                      )}>
                        {currentUnits}
                      </span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase">Available</span>
                    </motion.button>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[10px] font-bold text-muted-foreground/60">
                     <span>₹{currentPrice?.toLocaleString()}</span>
                     <span className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend / Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-3xl flex items-start gap-4 hover:shadow-md transition-shadow">
          <Info className="w-6 h-6 text-indigo-500 dark:text-indigo-400 mt-1" />
          <div>
            <h4 className="font-bold mb-1">Interactive Grid</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The numbers represent currently available units. Clicking a unit count will allow you to quickly override inventory and rates across Zodomus for that specific date.
            </p>
          </div>
        </div>
        <div className="p-6 bg-card border border-border rounded-3xl flex items-start gap-4 hover:shadow-md transition-shadow">
          <Hotel className="w-6 h-6 text-muted-foreground mt-1" />
          <div>
            <h4 className="font-bold mb-1">Dynamic Mapping</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Updates made here are automatically pushed to Airbnb and Booking.com within 15 seconds through the Sync Engine.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Edit Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            onClick={closeModal}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10"
          >
            <h3 className="text-xl font-bold mb-2">Override Sync</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {editingCell.room.name} <span className="font-bold text-indigo-600 dark:text-indigo-400">• {formatDate(editingCell.date, 'yyyy-MM-dd')}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">New Inventory Units</label>
                <input
                  type="number"
                  value={editInventory}
                  onChange={(e) => setEditInventory(e.target.value)}
                  placeholder={`Current base: ${editingCell.room.total_inventory}`}
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all text-sm mb-1"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Override Price (INR)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder={`Current base: ${editingCell.room.base_price}`}
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all text-sm mb-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-muted transition font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOverride}
                  disabled={isSaving || (!editInventory && !editPrice)}
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  {isSaving ? "Syncing..." : "Push Sync"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {selectedPropertyId && (
        <BulkUpdateModal
          propertyId={parseInt(selectedPropertyId)}
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={() => mutateGrid()}
        />
      )}
    </div>
  );
}
