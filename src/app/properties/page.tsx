"use client";

import React, { useState } from "react";
import { Plus, Hotel, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";
import { AddPropertyModal } from "@/components/dashboard/AddPropertyModal";
import Link from "next/link";

export default function PropertiesPage() {
  const { properties, isLoading, isError, mutate } = useProperties();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 dark:text-blue-400" />
        <p className="font-medium animate-pulse">Loading your properties...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <p className="text-rose-400 font-bold">Failed to load properties.</p>
        <button className="text-sm text-blue-400 hover:text-white" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Properties</h1>
          <p className="text-muted-foreground">Manage your hotels and active channel connections.</p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property: any, index: number) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-card border border-border p-6 rounded-2xl hover:bg-muted/50 dark:hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <Hotel className="text-blue-500 dark:text-blue-400 w-6 h-6" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Status</span>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-bold border border-emerald-500/20">
                  Active Sync
                </span>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-1">{property.name}</h3>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6">
              <MapPin className="w-3.5 h-3.5" />
              {property.address || "No address provided"}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/50 dark:bg-white/5 rounded-xl p-3 border border-border dark:border-white/5">
                <p className="text-[10px] uppercase text-muted-foreground font-bold mb-0.5">Active OTAs</p>
                <p className="text-lg font-bold">{property.ota_count || 0}</p>
              </div>
              <div className="bg-muted/50 dark:bg-white/5 rounded-xl p-3 border border-border dark:border-white/5">
                <p className="text-[10px] uppercase text-muted-foreground font-bold mb-0.5">Room Types</p>
                <p className="text-lg font-bold">{property.room_count || 0}</p>
              </div>
            </div>

            <Link 
              href={`/properties/${property.id}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted/40 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl text-sm font-semibold hover:bg-muted/60 dark:hover:bg-white/10 hover:border-blue-500/30 transition-all group-hover:text-blue-600 dark:group-hover:text-blue-400"
            >
              Manage Property
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        ))}

        {/* Empty State / Add New Card */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="border-2 border-dashed border-border dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300"
        >
          <div className="p-4 bg-muted dark:bg-white/5 rounded-full">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-semibold text-lg">Add New Property</span>
        </button>
      </div>

      <AddPropertyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => mutate()} 
      />
    </div>
  );
}
