"use client";

import React, { useState } from "react";
import { X, CalendarDays, User, Mail, Phone, CreditCard, Users, Hash, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelRoomTypes } from "@/hooks/useHotel";
import { api } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess: () => void;
}

export function NewReservationModal({ isOpen, onClose, propertyId, onSuccess }: Props) {
  const { roomTypes = [], isLoading: roomsLoading } = useHotelRoomTypes(propertyId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    room_type_id: "",
    check_in: "",
    check_out: "",
    num_guests: 1,
    num_rooms: 1,
    total_price: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post(`/hotels/${propertyId}/reservations`, {
        ...formData,
        room_type_id: parseInt(formData.room_type_id),
        num_guests: parseInt(String(formData.num_guests)),
        num_rooms: parseInt(String(formData.num_rooms)),
        total_price: formData.total_price ? parseFloat(formData.total_price) : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-card border shadow-2xl rounded-3xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b bg-muted/10">
            <div>
              <h2 className="text-xl font-bold">New Local Reservation</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Creates a direct booking and automatically reduces availability across all OTAs.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Guest Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Guest Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name
                  </label>
                  <input
                    required
                    name="guest_name"
                    value={formData.guest_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="guest_email"
                    value={formData.guest_email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone Number
                  </label>
                  <input
                    name="guest_phone"
                    value={formData.guest_phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Stay Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Stay Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Room Type
                  </label>
                  <select
                    required
                    name="room_type_id"
                    value={formData.room_type_id}
                    onChange={handleChange}
                    disabled={roomsLoading}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                  >
                    <option value="">Select a room type...</option>
                    {roomTypes?.map((rt: any) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" /> Check-in
                  </label>
                  <input
                    required
                    type="date"
                    name="check_in"
                    value={formData.check_in}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" /> Check-out
                  </label>
                  <input
                    required
                    type="date"
                    name="check_out"
                    value={formData.check_out}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" /> Number of Guests
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="num_guests"
                    value={formData.num_guests}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Number of Rooms
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="num_rooms"
                    value={formData.num_rooms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground" /> Total Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      name="total_price"
                      value={formData.total_price}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.room_type_id}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create & Sync
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
