"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api, handleApiError } from "@/lib/api";
import { Loader2, Plus, Tag, CalendarDays, Percent, Globe } from "lucide-react";

interface CreatePromotionModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function CreatePromotionModal({ propertyId, isOpen, onClose, onSuccess, initialData }: CreatePromotionModalProps) {
  const [name, setName] = React.useState("");
  const [discount, setDiscount] = React.useState<number | "">(10);
  const [targetChannel, setTargetChannel] = React.useState("Booking.com");
  
  const [bookStart, setBookStart] = React.useState("");
  const [bookEnd, setBookEnd] = React.useState("");
  const [stayStart, setStayStart] = React.useState("");
  const [stayEnd, setStayEnd] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialData && isOpen) {
      setName(initialData.name || "");
      setDiscount(initialData.discount || 10);
      setTargetChannel(initialData.target_ota || "Booking.com");
      setBookStart(initialData.bookDate?.start || "");
      setBookEnd(initialData.bookDate?.end || "");
      setStayStart(initialData.stayDate?.start || "");
      setStayEnd(initialData.stayDate?.end || "");
    } else if (!initialData && isOpen) {
      // Clear for new
      setName("");
      setDiscount(10);
      setBookStart("");
      setBookEnd("");
      setStayStart("");
      setStayEnd("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || discount === "") return;

    setIsSubmitting(true);
    setError(null);

    const payload = {
      channelId: targetChannel === "Booking.com" ? 1 : 2, 
      propertyId: propertyId.toString(),
      name,
      type: "basic",
      target_ota: targetChannel,
      bookDate: { start: bookStart, end: bookEnd },
      stayDate: { start: stayStart, end: stayEnd, activeWeekdays: [], excludedDates: [] },
      discount: discount.toString()
    };

    try {
      if (initialData?.id) {
        await api.put(`/hotels/${propertyId}/promotions/${initialData.id}`, payload);
      } else {
        await api.post(`/hotels/${propertyId}/promotions`, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Refine Yield Strategy" : "Construct OTA Promotion"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Name & Channel Block */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" />
              Promotion Name
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Special"
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              Target Network
            </label>
            <select
              value={targetChannel}
              onChange={(e) => setTargetChannel(e.target.value)}
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm"
            >
              <option value="Booking.com">Booking.com Algorithm</option>
              <option value="Expedia">Expedia Yield System</option>
            </select>
          </div>
        </div>

        {/* Discount Yield */}
        <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Percent className="w-3.5 h-3.5" />
              Base Discount (%)
            </label>
            <input
              required
              type="number"
              min="1"
              max="99"
              value={discount}
              onChange={(e) => setDiscount(e.target.value === "" ? "" : parseFloat(e.target.value))}
              placeholder="15"
              className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-4 text-white font-bold text-lg focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all"
            />
            <div className="absolute right-4 bottom-4 text-slate-500 font-bold">% OFF Best Available Rate</div>
        </div>

        {/* Date Matrices */}
        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl space-y-5">
           <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-400" />
              Activation Matrix
           </h4>
           
           <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                 <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Booking Window (When guests can book)</p>
                 <div className="space-y-2">
                    <input type="date" required value={bookStart} onChange={e => setBookStart(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 px-3 text-sm text-slate-300" />
                    <input type="date" required value={bookEnd} onChange={e => setBookEnd(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 px-3 text-sm text-slate-300" />
                 </div>
              </div>
              
              <div className="space-y-3">
                 <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Stay Window (When guests will stay)</p>
                 <div className="space-y-2">
                    <input type="date" required value={stayStart} onChange={e => setStayStart(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 px-3 text-sm text-slate-300" />
                    <input type="date" required value={stayEnd} onChange={e => setStayEnd(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 px-3 text-sm text-slate-300" />
                 </div>
              </div>
           </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Inject Yield Command
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-500 text-center mt-3 uppercase tracking-widest font-bold">Instantly published to Global OTAs</p>
        </div>
      </form>
    </Modal>
  );
}
