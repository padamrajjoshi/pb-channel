"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api, handleApiError } from "@/lib/api";
import { Loader2, Plus, Hotel, CircleDollarSign, Hash } from "lucide-react";

interface AddRoomTypeModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddRoomTypeModal({ propertyId, isOpen, onClose, onSuccess }: AddRoomTypeModalProps) {
  const [name, setName] = useState("");
  const [totalInventory, setTotalInventory] = useState<number | "">(1);
  const [basePrice, setBasePrice] = useState<number | "">(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post(`/hotels/${propertyId}/room-types`, {
        name,
        total_inventory: typeof totalInventory === 'number' ? totalInventory : 1,
        base_price: typeof basePrice === 'number' ? basePrice : 0,
        property_id: parseInt(propertyId)
      });
      onSuccess();
      onClose();
      setName("");
      setTotalInventory(1);
      setBasePrice(0);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Room Type">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Hotel className="w-3.5 h-3.5" />
            Room Category Name
          </label>
          <select
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border rounded-lg py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
          >
            <option value="" disabled>Select a room category...</option>
            <option value="Standard Room">Standard Room</option>
            <option value="Single Room">Single Room</option>
            <option value="Double Room">Double Room</option>
            <option value="Twin Room">Twin Room</option>
            <option value="Deluxe Room">Deluxe Room</option>
            <option value="Premium Room">Premium Room</option>
            <option value="Executive Room">Executive Room</option>
            <option value="Family Room">Family Room</option>
            <option value="Suite">Suite</option>
            <option value="Junior Suite">Junior Suite</option>
            <option value="Presidential Suite">Presidential Suite</option>
            <option value="Studio">Studio</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Bungalow">Bungalow</option>
            <option value="Dormitory Bed">Dormitory Bed</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" />
              Inventory
            </label>
            <input
              required
              type="number"
              min="1"
              value={totalInventory}
              onChange={(e) => setTotalInventory(e.target.value === "" ? "" : parseInt(e.target.value))}
              placeholder="e.g. 10"
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CircleDollarSign className="w-3.5 h-3.5" />
              Base Price (INR)
            </label>
            <input
              required
              type="number"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
              placeholder="e.g. 5000"
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Room Type
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
