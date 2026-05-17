"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api, handleApiError } from "@/lib/api";
import { useHotelRoomTypes } from "@/hooks/useHotel";
import { Loader2, CalendarRange, AlertCircle, Save, TrendingUp, Zap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils/cn";

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
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
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
      setSelectedRoom(null);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(handleApiError(err));
      toastError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const roomOptions = roomTypes?.map((room: any) => ({
    value: room.id.toString(),
    label: room.name
  })) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Matrix Sync">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-primary/5 border border-primary/10 p-6 rounded-[1.5rem] flex items-start gap-4 shadow-inner relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-16 h-16" />
          </div>
          <CalendarRange className="w-6 h-6 text-primary mt-1 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-black text-foreground">Sync Engine v2.0 Active</p>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Applying overrides across a large range will trigger high-priority distribution 
              tasks for all mapped OTAs. Please verify dates before submitting.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Dropdown
            label="Select Room Type"
            options={roomOptions}
            value={selectedRoom}
            onChange={setSelectedRoom}
            placeholder={roomsLoading ? "Loading rooms..." : "Choose room type..."}
          />

          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              icon={<CalendarRange className="w-4 h-4" />}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              icon={<CalendarRange className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Inventory Units"
              type="number"
              placeholder="e.g. 10"
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              icon={<Zap className="w-4 h-4" />}
            />
            <Input
              label="Price (INR)"
              type="number"
              placeholder="e.g. 4500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              icon={<TrendingUp className="w-4 h-4" />}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-black flex items-center gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-14 bg-muted text-foreground px-6 rounded-2xl font-black text-sm transition-all hover:bg-muted/80 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] h-14 bg-primary text-white px-8 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Push Bulk Overrides
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
