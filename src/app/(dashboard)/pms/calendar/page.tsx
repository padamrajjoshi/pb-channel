"use client";

import React, { useState, useEffect } from "react";
import {
  Hotel,
  Loader2,
  Filter,
  Sparkles, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";
import { useHotelRoomTypes, useAvailability } from "@/hooks/useHotel";
import { BulkUpdateModal } from "@/components/dashboard/BulkUpdateModal";
import { cn } from "@/utils/cn";
import { api } from "@/lib/api";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";

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
      console.error("Failed to sync override", e);
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

  const propertyOptions = properties?.map((p: any) => ({
    value: p.id,
    label: p.name,
    icon: <Hotel className="w-4 h-4 text-primary" />
  })) || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-border/50 shadow-xl shadow-primary/5">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Yield Engine v2.0
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" />
              Sync Active
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
             Portfolio <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm max-w-md">
            Manage your inventory distribution and dynamic pricing strategy across all channels in real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 min-w-[400px]">
           <Dropdown
             options={propertyOptions}
             value={selectedPropertyId}
             onChange={setSelectedPropertyId}
             placeholder="Select Property..."
             className="w-full sm:w-72"
           />
           
           <button
             onClick={() => setIsBulkModalOpen(true)}
             disabled={!selectedPropertyId}
             className="w-full sm:w-auto h-11 px-8 bg-primary text-white rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
           >
             <Zap className="w-4 h-4" />
             Bulk Actions
           </button>
        </div>
      </div>

      {/* Room Selection & Stats */}
      {selectedPropertyId && !roomsLoading && roomTypes?.length > 0 && (
         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/40 border border-border/50 rounded-[1.5rem] shadow-inner">
               {roomTypes.map((room: any) => (
                  <button
                     key={room.id}
                     onClick={() => setSelectedRoomTypeId(room.id)}
                     className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300",
                        selectedRoomTypeId === room.id 
                           ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" 
                           : "text-muted-foreground hover:text-foreground hover:bg-card"
                     )}
                  >
                     {room.name}
                  </button>
               ))}
            </div>

            <div className="flex items-center gap-6 px-6 py-3 bg-card border border-border/60 rounded-2xl shadow-sm">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Normal</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Low Stock</span>
               </div>
            </div>
         </div>
      )}

      {/* Modern Grid View */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-card border border-border/60 rounded-[2.5rem] overflow-hidden shadow-2xl">
          {/* Calendar Headers */}
          <div className="grid grid-cols-7 border-b border-border/40 bg-muted/20 backdrop-blur-sm">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="py-5 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] border-r border-border/30 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {!selectedPropertyId ? (
            <div className="py-40 text-center flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-muted/40 flex items-center justify-center animate-pulse">
                <Hotel className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold">Awaiting Input</p>
                <p className="text-sm text-muted-foreground">Select a property above to visualize the inventory matrix.</p>
              </div>
            </div>
          ) : roomsLoading ? (
            <div className="py-40 text-center flex flex-col items-center gap-6">
               <Loader2 className="w-12 h-12 animate-spin text-primary" />
               <p className="font-bold text-muted-foreground italic tracking-widest uppercase text-xs">Calibrating Real-time Matrix...</p>
            </div>
          ) : !selectedRoom ? (
            <div className="py-40 text-center text-muted-foreground italic font-medium">
              No active room types found for this configuration.
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-border/40 p-px">
              {days.map((day, i) => {
                const dateStr = formatDate(day, 'yyyy-MM-dd');
                const isToday = dateStr === formatDate(startOfToday(), 'yyyy-MM-dd');
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                let currentUnits = selectedRoom.total_inventory;
                let currentPrice = selectedRoom.base_price;
                
                if (grid && grid[selectedRoom.id]) {
                  const dayData = grid[selectedRoom.id].find((d: any) => d.date === dateStr);
                  if (dayData) {
                    currentUnits = dayData.units;
                    if (dayData.price !== undefined) currentPrice = dayData.price; 
                  }
                }

                const isLow = currentUnits <= 2;
                const isSoldOut = currentUnits <= 0;

                return (
                  <div 
                    key={i} 
                    className={cn(
                      "min-h-[160px] p-4 bg-card relative group transition-all duration-500 overflow-hidden",
                      isToday ? "bg-primary/[0.03]" : "",
                      isWeekend ? "bg-muted/10" : ""
                    )}
                  >
                    {/* Background indicator for Today */}
                    {isToday && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                    )}

                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-xl font-black leading-none",
                          isToday ? "text-primary" : "text-foreground"
                        )}>
                          {formatDate(day, 'dd')}
                        </span>
                        <span className="text-[10px] uppercase font-black text-muted-foreground/30 tracking-widest">
                          {formatDate(day, 'EEE')}
                        </span>
                      </div>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase rounded-md shadow-lg shadow-primary/20">Today</span>
                      )}
                    </div>

                    <div className="mt-4 relative z-10">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setEditingCell({ room: selectedRoom, date: day })}
                        className={cn(
                          "w-full py-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 shadow-sm",
                          isSoldOut 
                            ? "bg-rose-500/10 border-rose-500/40 text-rose-600 grayscale opacity-60" 
                            : isLow 
                              ? "bg-orange-500/10 border-orange-500/40 text-orange-600 hover:bg-orange-500 hover:text-white" 
                              : "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/20"
                        )}
                      >
                        <span className="text-2xl font-black">
                          {currentUnits}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-70">
                          {isSoldOut ? "Sold Out" : "In Stock"}
                        </span>
                      </motion.button>
                    </div>

                    {/* Price and Action indicator */}
                    <div className="mt-4 flex items-center justify-between px-1 relative z-10">
                       <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black text-foreground/80">₹{currentPrice?.toLocaleString()}</span>
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                       </div>
                       <button 
                         onClick={() => setEditingCell({ room: selectedRoom, date: day })}
                         className="p-1.5 rounded-lg bg-muted/40 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                        >
                         <ArrowRight className="w-3 h-3" />
                       </button>
                    </div>

                    {/* Decoration elements */}
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Premium Legend & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-8 bg-gradient-to-br from-primary to-indigo-700 text-white rounded-[2.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <Zap className="absolute top-[-20px] right-[-20px] w-40 h-40 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
               <h4 className="text-xl font-black">Sync Engine v2.0</h4>
               <p className="text-white/70 text-sm font-medium leading-relaxed mt-2">
                 Our proprietary synchronization engine is currently active. Any changes made to the grid will reflect across Zodomus, Booking.com, and Airbnb within seconds.
               </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
               <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-6 h-6 rounded-full border-2 border-primary bg-muted" />
                 ))}
               </div>
               <span className="text-[10px] font-bold text-white/60">3,421 updates synced today</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-8 bg-card border border-border/60 rounded-[2.5rem] shadow-xl flex items-center gap-8">
           <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg">Inventory Health</h4>
                  <p className="text-sm text-muted-foreground font-medium">Your current distribution across channels is optimal.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg">Pricing Suggestions</h4>
                  <p className="text-sm text-muted-foreground font-medium">Consider increasing rates for upcoming weekends due to high demand.</p>
                </div>
              </div>
           </div>
           <div className="hidden xl:block w-px h-24 bg-border/50" />
           <div className="hidden xl:block text-center space-y-2">
              <p className="text-4xl font-black text-primary">84%</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg. Occupancy</p>
           </div>
        </div>
      </div>

      {/* Modernized Override Modal */}
      <AnimatePresence>
        {editingCell && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl" 
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 30, scale: 0.9, rotateX: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card border border-border rounded-[3rem] p-10 max-w-md w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative z-10"
            >
              <div className="absolute top-6 right-6">
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                   <Filter className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Sync Override</h3>
                  <p className="text-sm text-muted-foreground font-medium">{editingCell.room.name}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date Selected</span>
                   <span className="text-sm font-black text-primary">{formatDate(editingCell.date, 'yyyy-MM-dd')}</span>
                </div>

                <Input
                  label="New Inventory Count"
                  type="number"
                  value={editInventory}
                  onChange={(e) => setEditInventory(e.target.value)}
                  placeholder={`Base: ${editingCell.room.total_inventory}`}
                  icon={<Zap className="w-4 h-4" />}
                />

                <Input
                  label="Rate Override (INR)"
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder={`Base: ₹${editingCell.room.base_price}`}
                  icon={<TrendingUp className="w-4 h-4" />}
                />

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={handleSaveOverride}
                    disabled={isSaving || (!editInventory && !editPrice)}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Push to Channels
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground font-medium italic">
                    Pushing this will update Airbnb, Booking.com and Zodomus instantly.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
