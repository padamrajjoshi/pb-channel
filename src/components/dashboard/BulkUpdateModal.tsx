"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api, handleApiError } from "@/lib/api";
import { useHotelRoomTypes } from "@/hooks/useHotel";
import { Loader2, CalendarRange, AlertCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface BulkUpdateModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUpdateModal({ propertyId, isOpen, onClose, onSuccess }: BulkUpdateModalProps) {
  const { roomTypes, isLoading: roomsLoading } = useHotelRoomTypes(propertyId);
  const { success, error: toastError } = useToast();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [inventory, setInventory] = useState("");
  const [price, setPrice] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate || !selectedRoom) {
      setError("Please select a room type and complete the date range.");
      return;
    }

    if (!inventory && !price) {
      setError("You must provide either an inventory override, a price override, or both.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before the start date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        start_date: startDate,
        end_date: endDate,
        room_type_id: parseInt(selectedRoom),
      };

      if (inventory !== "") payload.inventory = parseInt(inventory);
      if (price !== "") payload.price = parseInt(price);

      const res: any = await api.post(`/hotels/${propertyId}/bulk-override`, payload);

      success(`Bulk update applied! Synced to ${res.data?.synced_otas || 0} channels over ${res.data?.days_updated || 0} days.`);
      
      // Reset form
      setStartDate("");
      setEndDate("");
      setInventory("");
      setPrice("");
      setSelectedRoom("");
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(handleApiError(err));
      toastError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Grid Update">
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-4">
          <CalendarRange className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-200/70 leading-relaxed">
            Apply mass inventory or pricing overrides across a large date range. 
            Updates will be instantly pushed to all mapped OTA platforms.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Room Type
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              disabled={roomsLoading}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
            >
              <option value="">{roomsLoading ? "Loading rooms..." : "Choose a room..."}</option>
              {roomTypes?.map((room: any) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all custom-calendar-icon"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all custom-calendar-icon"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Units Available
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
              <p className="text-[10px] text-slate-500 mt-1">Leave blank to skip.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Price (INR)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 2500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
              <p className="text-[10px] text-slate-500 mt-1">Leave blank to skip.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="pt-6 flex gap-3 border-t border-white/5 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-[1] bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-2xl font-bold transition-all border border-white/5 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 text-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Apply Bulk Update
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
