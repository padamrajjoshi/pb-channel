"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api, handleApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { Loader2, Plus, Percent, CircleDollarSign, Tag } from "lucide-react";

interface AddRatePlanModalProps {
  propertyId: number;
  roomTypeId: number;
  roomName: string;
  basePrice: number;
  isOpen: boolean;
  onClose: () => void;
}

export function AddRatePlanModal({ propertyId, roomTypeId, roomName, basePrice, isOpen, onClose }: AddRatePlanModalProps) {
  const { success, error: toastError } = useToast();
  
  const [name, setName] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number | "">(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedDerivedPrice = typeof discountPercent === "number" 
    ? Math.max(1, basePrice - (basePrice * (discountPercent / 100))) 
    : basePrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post(`/hotels/${propertyId}/rate-plans`, {
        room_type_id: roomTypeId,
        name: name,
        base_price: basePrice, // Rate plan records current base price for structure
        discount_percent: typeof discountPercent === "number" ? discountPercent : 0,
        currency: "INR"
      });
      success("Derived Yield Rate Plan created!");
      onClose();
      setName("");
      setDiscountPercent(0);
    } catch (err: any) {
      setError(handleApiError(err));
      toastError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`New Yield Rule: ${roomName}`}>
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        
        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex flex-col gap-3">
          <p className="text-xs text-blue-200/70 leading-relaxed flex items-start gap-3">
            <Percent className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            Defining a "Discount Percent" establishes an automated Yield Rule. 
            If the Base Rate ever changes recursively via Bulk Updates or Dynamic Pricing, 
            this plan will automatically recalculate and push real-time rates to OTAs!
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            Rate Plan Code / Name
          </label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Non-Refundable - 15% Off"
            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Percent className="w-3.5 h-3.5" />
              Yield Discount (%)
            </label>
            <input
              required
              type="number"
              min="0"
              max="99"
              step="0.01"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value === "" ? "" : parseFloat(e.target.value))}
              placeholder="e.g. 15"
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm"
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CircleDollarSign className="w-3.5 h-3.5" />
              Derived Real-Time Price
            </label>
            <div className="w-full bg-slate-900 border border-emerald-500/30 text-emerald-400 rounded-2xl py-3 px-4 focus:outline-none transition-all text-sm font-bold flex items-center h-[46px]">
              ₹{calculatedDerivedPrice.toLocaleString()}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs shadow-inner">
            {error}
          </div>
        )}

        <div className="pt-4 flex gap-3">
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
                <Plus className="w-4 h-4" />
                Initialize Linked Rule
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
