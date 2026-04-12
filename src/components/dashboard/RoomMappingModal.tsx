"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api, handleApiError } from "@/lib/api";
import { 
  useHotelRoomTypes, 
  useRemoteRooms, 
  useHotelMappings, 
  useHotelRatePlans, 
  useRemoteRates, 
  useHotelRateMappings 
} from "@/hooks/useHotel";
import { Loader2, Link as LinkIcon, Save, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface RoomMappingModalProps {
  propertyId: string;
  connection: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RoomMappingModal({ propertyId, connection, isOpen, onClose, onSuccess }: RoomMappingModalProps) {
  const { roomTypes, isLoading: roomsLoading } = useHotelRoomTypes(propertyId);
  const { remoteRooms, isLoading: remoteLoading } = useRemoteRooms(propertyId, connection?.id);
  const { mappings: existingMappings, mutate: mutateMappings } = useHotelMappings(propertyId);
  const { rateMappings: existingRateMappings, mutate: mutateRateMappings } = useHotelRateMappings(propertyId);
  const { ratePlans: allRatePlans } = useHotelRatePlans(propertyId);
  const { remoteRates } = useRemoteRates(propertyId, connection?.id);
  
  const { success, error: toastError } = useToast();
  
  const [mappings, setMappings] = useState<Record<number, string>>({}); // room_type_id -> remote_room_id
  const [rateMappings, setRateMappings] = useState<Record<number, string>>({}); // rate_plan_id -> remote_rate_id
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // Auto-populate existing mappings
  React.useEffect(() => {
    if (existingMappings && connection) {
      const initial: Record<number, string> = {};
      existingMappings.forEach((m: any) => {
        if (m.ota_connection_id === connection.id) {
          initial[m.room_type_id] = m.remote_room_id;
        }
      });
      setMappings(initial);
    }

    if (existingRateMappings && connection) {
      const initial: Record<number, string> = {};
      existingRateMappings.forEach((m: any) => {
        if (m.ota_connection_id === connection.id) {
          initial[m.rate_plan_id] = m.remote_rate_id;
        }
      });
      setRateMappings(initial);
    }
  }, [existingMappings, existingRateMappings, connection?.id]);

  const handleMappingChange = (roomTypeId: number, remoteId: string) => {
    setMappings(prev => ({ ...prev, [roomTypeId]: remoteId }));
  };

  const handleRateMappingChange = (ratePlanId: number, remoteId: string) => {
    setRateMappings(prev => ({ ...prev, [ratePlanId]: remoteId }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Save Room Mappings
      const roomPromises = Object.entries(mappings).map(([roomTypeId, remoteId]) => {
        if (!remoteId) return null;
        return api.post(`/hotels/mappings`, {
          room_type_id: parseInt(roomTypeId),
          ota_connection_id: connection.id,
          remote_room_id: remoteId,
          sync_prices: true,
          sync_availability: true
        });
      });

      // 2. Save Rate Mappings
      const ratePromises = Object.entries(rateMappings).map(([ratePlanId, remoteId]) => {
        if (!remoteId) return null;
        return api.post(`/hotels/rate-mappings`, {
          rate_plan_id: parseInt(ratePlanId),
          ota_connection_id: connection.id,
          remote_rate_id: remoteId
        });
      });

      await Promise.all([...roomPromises.filter(p => p !== null), ...ratePromises.filter(p => p !== null)]);

      // 3. Network Activation Sequence
      if (connection?.ota_name?.toLowerCase() === "zodomus") {
         try {
            await api.post(`/hotels/${propertyId}/ota-connections/${connection.id}/activate-rooms`);
         } catch(activationErr: any) {
            console.error("Zodomus OTA activation rejected", activationErr);
            throw new Error(`Mappings saved locally, but Zodomus activation failed: ${handleApiError(activationErr)}`);
         }
      }

      success("Mappings saved and structural activation triggered!");
      mutateMappings();
      mutateRateMappings();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(handleApiError(err));
      toastError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateRooms = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res: any = await api.post(`/hotels/${propertyId}/ota-connections/${connection.id}/activate-rooms`);
      
      let detail = "";
      if (res.status?.returnMessage) {
          detail = typeof res.status.returnMessage === 'object' 
            ? JSON.stringify(res.status.returnMessage, null, 1) 
            : res.status.returnMessage;
      }

      success(`Activation successful! ${detail}`);
      onSuccess();
    } catch (err: any) {
      setError(handleApiError(err));
      toastError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRooms = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res: any = await api.post(`/hotels/${propertyId}/ota-connections/${connection.id}/rooms-cancellation`);
      
      let detail = "";
      if (res.status?.returnMessage) {
          detail = typeof res.status.returnMessage === 'object' 
            ? JSON.stringify(res.status.returnMessage, null, 1) 
            : res.status.returnMessage;
      }

      success(`Cancellation successful! ${detail}`);
      onSuccess();
    } catch (err: any) {
      setError(handleApiError(err));
      toastError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
      setIsCancelConfirmOpen(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Configure Mappings: ${connection?.ota_name}`}>
      <div className="space-y-6">
        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-4">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <p className="text-xs text-blue-200/70 leading-relaxed">
            Link your internal room types to the listings discovered on <strong>{connection?.ota_name}</strong>. 
            Once mapped, inventory and rates will stay in sync automatically.
          </p>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {roomsLoading || remoteLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
               <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
               <p className="text-sm font-medium">Discovering remote listings...</p>
            </div>
          ) : roomTypes?.length > 0 ? (
            roomTypes.map((room: any) => (
              <div key={room.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                   <h4 className="text-sm font-bold text-white">{room.name}</h4>
                   <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Internal ID: {room.id}</span>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="flex-1">
                      <select 
                        value={mappings[room.id] || ""}
                        onChange={(e) => handleMappingChange(room.id, e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all cursor-pointer"
                      >
                         <option value="">Select Remote Listing...</option>
                         {remoteRooms?.map((remote: any, idx: number) => (
                           <option key={`${remote.remote_room_id}-${idx}`} value={remote.remote_room_id}>
                              {remote.name} ({remote.remote_room_id})
                           </option>
                         ))}
                      </select>
                   </div>
                   <div className={mappings[room.id] ? "text-emerald-400" : "text-slate-700"}>
                      <LinkIcon className="w-4 h-4" />
                   </div>
                </div>

                {/* Nested Rate Mapping */}
                {mappings[room.id] && (
                  <div className="pl-4 border-l border-white/10 space-y-3 pt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Rate Mapping</p>
                    {allRatePlans?.filter((rp: any) => rp.room_type_id === room.id).map((rp: any) => (
                      <div key={rp.id} className="flex items-center gap-3">
                        <div className="flex-1">
                           <p className="text-xs text-slate-400 mb-1 font-medium">{rp.name}</p>
                           <select 
                             value={rateMappings[rp.id] || ""}
                             onChange={(e) => handleRateMappingChange(rp.id, e.target.value)}
                             className="w-full bg-black/40 border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer"
                           >
                              <option value="">Select Remote Rate...</option>
                              {remoteRates?.map((rr: any) => (
                                <option key={rr.rateId} value={rr.rateId}>
                                   {rr.name} ({rr.rateId})
                                </option>
                              ))}
                           </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
             <div className="text-center py-8 text-slate-500 italic text-sm">
                No internal room types found to map.
             </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="pt-4 grid grid-cols-2 gap-3 border-t border-white/5 mt-4">
           <button
             onClick={handleActivateRooms}
             disabled={isSubmitting}
             className="py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded-xl font-bold border border-emerald-500/20 text-xs transition-all flex items-center justify-center gap-2"
           >
              <CheckCircle2 className="w-4 h-4" />
              Structural Activation
           </button>
            <button
              onClick={() => setIsCancelConfirmOpen(true)}
              disabled={isSubmitting}
              className="py-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-xl font-bold border border-rose-500/20 text-xs transition-all flex items-center justify-center gap-2"
            >
               <AlertCircle className="w-4 h-4" />
               Cancel OTA Mappings
            </button>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-2xl font-bold transition-all border border-white/5 text-sm"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(mappings).length === 0}
            className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save & Update
              </>
            )}
          </button>
        </div>

        <ConfirmDialog
          isOpen={isCancelConfirmOpen}
          title="Cancel All Room Mappings?"
          message={`Are you sure you want to cancel ALL active room mappings for ${connection?.ota_name}? This will immediately stop all synchronization for these rooms on the OTA side.`}
          type="danger"
          confirmLabel="Cancel Mappings"
          onConfirm={handleCancelRooms}
          onCancel={() => setIsCancelConfirmOpen(false)}
          isLoading={isSubmitting}
        />
      </div>
    </Modal>
  );
}
