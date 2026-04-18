"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Search,
  Filter,
  Loader2,
  Plus,
  Hotel,
  Globe,
  Settings2,
  CalendarDays,
  Percent,
  Trash2,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { api, handleApiError } from "@/lib/api";
import { useProperties } from "@/hooks/useProperties";
import { CreatePromotionModal } from "@/components/dashboard/CreatePromotionModal";

export default function PromotionsPage() {
  const { properties = [], isLoading: propsLoading } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  const fetchPromotions = async () => {
    if (!selectedPropertyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/hotels/${selectedPropertyId}/promotions`);
      const payload = response.data.promotions || response.data || [];
      setPromotions(Array.isArray(payload) ? payload : [payload]);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (promotionId: string) => {
    if (!selectedPropertyId) return;
    if (!window.confirm("Are you sure you want to deactivate and remove this promotion? This action cannot be undone on the OTA.")) return;

    setIsLoading(true);
    try {
      await api.post(`/hotels/${selectedPropertyId}/promotions/${promotionId}/deactivate`);
      // Give Zodomus a small buffer before refreshing to allow their async sync to complete
      setTimeout(() => fetchPromotions(), 1500);
    } catch (err: any) {
      alert(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (promo: any) => {
    setEditingPromotion(promo);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchPromotions();
  }, [selectedPropertyId]);

  const filteredPromotions = promotions.filter(promo => {
    const searchMatch = !searchTerm ||
      promo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.target_ota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.targetChannel?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status logic: if we don't have a status field, we assume Active for now as per UI
    const statusMatch = statusFilter === "all" ||
      (statusFilter === "active" && (promo.status === "active" || !promo.status)) ||
      (statusFilter === "expired" && promo.status === "expired");

    return searchMatch && statusMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[10px] font-bold border border-blue-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <Percent className="w-3 h-3" />
              Dynamic Yield Engine
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Tag className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            Active Sales Hub
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Design, track, and inject algorithmic discounts into Expedia and Booking.com.</p>
        </div>

        <div className="flex flex-col items-end gap-4">
          {/* Property Selector - Top Line */}
          <div className="bg-card border border-border rounded-2xl p-1.5 flex transition-all shadow-sm">
            {propsLoading ? (
              <div className="w-64 h-10 bg-muted animate-pulse rounded-xl" />
            ) : (
              <select
                onChange={(e) => setSelectedPropertyId(e.target.value ? parseInt(e.target.value) : null)}
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
            {selectedPropertyId && (
              <>
                <button
                  onClick={fetchPromotions}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-5 py-2.5 rounded-xl text-sm font-bold border border-blue-500/20 transition-all disabled:opacity-50 shadow-sm"
                  title="Force Sync with OTA"
                >
                  <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                  <span className="hidden sm:inline">Sync OTA</span>
                </button>

                <button
                  onClick={() => {
                    if (!selectedPropertyId) return alert("Select a property first!");
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Create Promotion</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Constraints & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium text-sm placeholder:text-muted-foreground/50 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold focus:outline-none cursor-pointer pr-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Grid Canvas */}
      {isLoading ? (
        <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-muted-foreground bg-card border border-border border-dashed rounded-3xl shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 dark:text-blue-400" />
          <p className="font-medium font-mono text-xs uppercase tracking-widest">Compiling Active Modifiers...</p>
        </div>
      ) : filteredPromotions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPromotions.map((promo, idx) => (
            <motion.div
              key={promo.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden group hover:bg-muted/30 dark:hover:bg-white/[0.04] transition-all flex flex-col shadow-sm hover:shadow-md"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors opacity-50" />

              <div className="flex items-start justify-between mb-8 z-10 relative">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {promo.name || "Unnamed Sequence"}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-1">{promo.discount || "10"}% OFF BASE RATE</p>
                </div>
                <div className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border",
                  promo.status === "expired"
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                )}>
                  {promo.status === "expired" ? "Expired / Historic" : "Active / Bound"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1 mb-8 z-10 relative text-sm">
                <div className="space-y-1.5 p-3 rounded-xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <CalendarDays className="w-3 h-3" />
                    Bookable
                  </p>
                  <p className="font-mono leading-tight">{promo.bookDate?.start || "N/A"}</p>
                  <p className="text-muted-foreground font-mono text-xs">{promo.bookDate?.end || "N/A"}</p>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Hotel className="w-3 h-3" />
                    Stay Dates
                  </p>
                  <p className="font-mono leading-tight">{promo.stayDate?.start || "N/A"}</p>
                  <p className="text-muted-foreground font-mono text-xs">{promo.stayDate?.end || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border mt-auto pt-4 z-10 relative">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                  <Globe className="w-4 h-4 text-muted-foreground/40" />
                  {promo.target_ota || promo.targetChannel || promo.target_channel || "Generic Net"}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(promo)}
                    className="p-2 hover:bg-blue-500/10 dark:hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20 group/btn"
                    title="Edit Parameters"
                  >
                    <Settings2 className="w-4 h-4 text-muted-foreground group-hover/btn:text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDeactivate(promo.id)}
                    className="p-2 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20 group/btn"
                    title="Deactivate & Delete"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover/btn:text-rose-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (searchTerm || statusFilter !== "all") ? (
        <div className="bg-card border border-dashed border-border p-16 rounded-3xl text-center text-muted-foreground flex flex-col items-center shadow-sm">
          <Search className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Campaigns Found</h3>
          <p className="max-w-sm text-sm mx-auto leading-relaxed">Adjust your search or filter criteria to locate specific yield strategies.</p>
          <button
            onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
            className="mt-6 text-blue-500 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="bg-card border border-dashed border-border p-16 rounded-3xl text-center text-muted-foreground flex flex-col items-center shadow-sm">
          <Percent className="w-16 h-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Active Strategies</h3>
          <p className="max-w-sm text-sm mx-auto leading-relaxed">No promotions are currently injected into the Yielding engines. Create one to instantly boost visibility on OTAs.</p>
        </div>
      )}

      {selectedPropertyId && (
        <CreatePromotionModal
          propertyId={selectedPropertyId}
          isOpen={isModalOpen}
          initialData={editingPromotion}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPromotion(null);
          }}
          onSuccess={() => {
            // Wait 3 seconds for Zodomus Sandbox to update its list
            setTimeout(() => fetchPromotions(), 3000);
          }}
        />
      )}
    </div>
  );
}
