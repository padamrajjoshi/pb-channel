"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { Loader2, Plus, Building2, MapPin } from "lucide-react";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPropertyModal({ isOpen, onClose, onSuccess }: AddPropertyModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/hotels/", { name, address });
      onSuccess();
      onClose();
      setName("");
      setAddress("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Property">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            Property Name
          </label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grand Horizon Hotel"
            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            Address / Location
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 123 Ocean Drive, Maldives"
            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm"
          />
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
                Create Property
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
