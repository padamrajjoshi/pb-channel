"use client";

import React, { useState } from "react";
import { Hotel, Plus, Loader2, ImagePlus, Percent, ChevronRight, Settings2, RefreshCw, Info } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { useHotelRoomTypes } from "@/hooks/useHotel";
import { AmenitiesSettings } from "@/components/dashboard/AmenitiesSettings";
import { AddRoomTypeModal } from "@/components/dashboard/AddRoomTypeModal";
import { RoomMediaModal } from "@/components/dashboard/RoomMediaModal";
import { api, handleApiError } from "@/lib/api";
import { motion } from "framer-motion";
import { AddRatePlanModal } from "@/components/dashboard/AddRatePlanModal";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";

export default function RoomsAndSettingsPage() {
   const { properties, isLoading: propsLoading } = useProperties();
   const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

   React.useEffect(() => {
      if (properties?.length > 0 && !selectedPropertyId) {
         setSelectedPropertyId(properties[0].id);
      }
   }, [properties, selectedPropertyId]);

   const { roomTypes, isLoading: roomsLoading, mutate: mutateRooms } = useHotelRoomTypes(selectedPropertyId || "");
   const { success } = useToast();

   const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
   const [selectedMediaRoom, setSelectedMediaRoom] = useState<{ id: number, name: string } | null>(null);
   const [selectedYieldRoom, setSelectedYieldRoom] = useState<any | null>(null);

   const [isSyncing, setIsSyncing] = useState(false);
   const [syncMessage, setSyncMessage] = useState<string | null>(null);

   const handleManualSync = async () => {
      if (!selectedPropertyId) return;
      setIsSyncing(true);
      setSyncMessage(null);
      try {
         await api.post(`/hotels/${selectedPropertyId}/sync`);
         setSyncMessage("Sync triggered successfully!");
         setTimeout(() => setSyncMessage(null), 3000);
      } catch (err: any) {
         setSyncMessage(handleApiError(err));
      } finally {
         setIsSyncing(false);
      }
   };

   return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
         {/* Header */}
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[10px] font-bold border border-indigo-500/20 uppercase tracking-widest flex items-center gap-1.5">
                     <Settings2 className="w-3 h-3" />
                     Configuration Matrix
                  </span>
               </div>
               <h1 className="text-4xl font-bold tracking-tight">Rooms & Settings</h1>
               <p className="text-muted-foreground mt-2 font-medium">Manage base configurations, room structures, and property policies globally.</p>
            </div>

            <div className="flex flex-col items-end gap-4">
               {/* Property Selector - Top Line */}
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

               {/* Action Buttons - Bottom Line */}
               <div className="flex items-center gap-3">
                  {syncMessage && (
                     <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs font-bold text-blue-400 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10 italic"
                     >
                        {syncMessage}
                     </motion.span>
                  )}

                  {selectedPropertyId && (
                     <>
                        <button
                           onClick={handleManualSync}
                           disabled={isSyncing}
                           className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-5 py-2.5 rounded-xl text-sm font-bold border border-blue-500/20 transition-all disabled:opacity-50 shadow-sm"
                           title="Force Sync Engine"
                        >
                           <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                           <span className="hidden sm:inline">Sync Now</span>
                        </button>

                        <button
                           onClick={() => setIsAddRoomModalOpen(true)}
                           className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                           <Plus className="w-4 h-4" />
                           <span className="hidden sm:inline">Add Room Type</span>
                           <span className="sm:hidden text-lg">+</span>
                        </button>
                     </>
                  )}
               </div>
            </div>
         </div>

         {!selectedPropertyId ? (
            <div className="py-32 bg-card border border-border rounded-3xl text-center text-muted-foreground flex flex-col items-center gap-4 shadow-sm">
               <Hotel className="w-16 h-16 opacity-20" />
               <p className="font-medium">Please select a property from the dropdown to configure its rooms and settings.</p>
            </div>
         ) : (
            <div className="space-y-12">
               {/* 1. Room Types Section */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-bold">Configured Room Types</h3>
                  </div>

                  {roomsLoading ? (
                     <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                  ) : roomTypes?.length > 0 ? (
                     <div className="grid grid-cols-1 gap-4">
                        {roomTypes.map((room: any) => (
                           <div key={room.id} className="bg-card border border-border rounded-3xl p-6 flex items-center justify-between hover:bg-muted/30 transition-all shadow-sm">
                              <div className="flex gap-6 items-center">
                                 <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                    <Hotel className="text-indigo-500 dark:text-indigo-400 w-6 h-6" />
                                 </div>
                                 <div>
                                    <h4 className="text-xl font-bold">{room.name}</h4>
                                    <p className="text-muted-foreground text-sm font-medium mt-1">Base Price: INR {room.base_price?.toLocaleString() || "N/A"} / night</p>
                                 </div>
                              </div>

                              <div className="flex gap-12 text-center">
                                 <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Total Units</p>
                                    <p className="text-2xl font-black">{room.total_inventory}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Status</p>
                                    <p className="text-emerald-500 dark:text-emerald-400 text-sm font-bold flex items-center gap-1.5 justify-center">
                                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                       Synced
                                    </p>
                                 </div>
                              </div>

                              <div className="flex gap-3">
                                 <button
                                    onClick={() => setSelectedYieldRoom(room)}
                                    className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs rounded-xl transition-all border border-purple-500/20 flex items-center gap-1.5"
                                 >
                                    <Percent className="w-3 h-3" />
                                    Yield Rules
                                 </button>
                                 <button
                                    onClick={() => setSelectedMediaRoom({ id: room.id, name: room.name })}
                                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl transition-all border border-emerald-500/20 flex items-center gap-1.5"
                                 >
                                    <ImagePlus className="w-3 h-3" />
                                    Media
                                 </button>
                                 <button className="p-2 bg-muted/50 hover:bg-muted border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="bg-card border border-dashed border-border p-12 rounded-3xl text-center text-muted-foreground">
                        <p className="font-medium">No room types configured for this property.</p>
                        <p className="text-xs mt-2">Start by adding your first room category mapping.</p>
                     </div>
                  )}
               </div>

               {/* 2. Property Settings (AmenitiesSettings) */}
               <div className="pt-6 border-t border-border">
                  <AmenitiesSettings propertyId={parseInt(selectedPropertyId)} />
               </div>

               {/* Sync Engine Info Card */}
               <div className="bg-blue-500/5 dark:bg-blue-900/10 border border-blue-500/10 p-6 rounded-2xl flex items-start gap-4 shadow-sm mt-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                     <Info className="w-5 h-5" />
                  </div>
                  <div>
                     <h5 className="text-blue-600 dark:text-blue-200 font-bold mb-1 uppercase tracking-wider text-xs">Sync Engine Note</h5>
                     <p className="text-blue-600/70 dark:text-blue-200/60 text-sm leading-relaxed">
                        Price and inventory synchronization happens automatically every 15 minutes.
                        Manual pushes can be triggered via the "Sync Now" button above or monitored from the Sync Engine tab.
                     </p>
                  </div>
               </div>

               {/* Modals placed safely at the end */}
               <AddRoomTypeModal
                  isOpen={isAddRoomModalOpen}
                  onClose={() => setIsAddRoomModalOpen(false)}
                  propertyId={selectedPropertyId}
                  onSuccess={() => {
                     setIsAddRoomModalOpen(false);
                     mutateRooms();
                     success("Room type created successfully!");
                  }}
               />

               {selectedMediaRoom && (
                  <RoomMediaModal
                     propertyId={parseInt(selectedPropertyId)}
                     roomTypeId={selectedMediaRoom.id}
                     roomName={selectedMediaRoom.name}
                     isOpen={!!selectedMediaRoom}
                     onClose={() => setSelectedMediaRoom(null)}
                  />
               )}

               {selectedYieldRoom && (
                  <AddRatePlanModal
                     propertyId={parseInt(selectedPropertyId)}
                     roomTypeId={selectedYieldRoom.id}
                     roomName={selectedYieldRoom.name}
                     basePrice={selectedYieldRoom.base_price || 0}
                     isOpen={!!selectedYieldRoom}
                     onClose={() => setSelectedYieldRoom(null)}
                  />
               )}
            </div>
         )}
      </div>
   );
}
