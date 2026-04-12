"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Globe,
  Settings2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Info,
  Loader2,
  Hotel,
  RefreshCw,
  Activity,
  ImagePlus,
  Percent
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useHotel, useHotelRoomTypes, useHotelConnections, useHotelMappings } from "@/hooks/useHotel";
import { RoomMappingModal } from "@/components/dashboard/RoomMappingModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import { api, handleApiError } from "@/lib/api";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const propertyId = resolvedParams.id;

  const { property, isLoading: propertyLoading, isError: propertyError } = useHotel(propertyId);
  const { connections, isLoading: connLoading, mutate: mutateConns } = useHotelConnections(propertyId);

  const { success, error: toastError } = useToast();

  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedMappingConn, setSelectedMappingConn] = useState<any>(null);

  // Delete Confirmation State
  const [connToDelete, setConnToDelete] = useState<number | null>(null);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  const handleRemoveConnection = async () => {
    if (!connToDelete) return;
    try {
      await api.delete(`/hotels/${propertyId}/ota-connections/${connToDelete}`);
      success("Channel connection successfully removed");
      mutateConns();
    } catch (err: any) {
      toastError(handleApiError(err));
    } finally {
      setConnToDelete(null);
    }
  };

  const handleDeleteProperty = async () => {
    try {
      await api.delete(`/hotels/${propertyId}`);
      success("Property permanently deleted.");
      // Redirect back to properties list
      window.location.href = "/properties";
    } catch (err: any) {
      toastError(handleApiError(err));
    } finally {
      setIsDeletingProperty(false);
    }
  };

  const [opLoading, setOpLoading] = useState<string | null>(null);

  const handleOperation = async (connId: number, op: string) => {
    setOpLoading(`${connId}-${op}`);
    try {
      const res: any = await api.post(`/hotels/${propertyId}/ota-connections/${connId}/${op}`);

      let detail = "";
      if (res.status?.returnMessage) {
        detail = typeof res.status.returnMessage === 'object'
          ? JSON.stringify(res.status.returnMessage, null, 1)
          : res.status.returnMessage;
      }

      success(`Operation ${op} successful! ${detail}`);
      mutateConns();
    } catch (err: any) {
      toastError(handleApiError(err));
    } finally {
      setOpLoading(null);
    }
  };

  if (propertyLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Loading property details...</p>
      </div>
    );
  }

  if (propertyError) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="text-rose-500 font-bold">Failed to load property.</p>
        <Link href="/properties" className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumbs & Back */}
      <div className="flex flex-col gap-4">
        <Link
          href="/properties"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium group w-fit"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Properties
        </Link>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-md text-[10px] font-bold border border-blue-500/20 uppercase tracking-widest">
                Property ID: {propertyId}
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{property.name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {property.address || "No address provided"}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <Link 
              href="/rooms"
              className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-5 py-2.5 rounded-xl font-semibold border border-indigo-500/20 transition-all"
            >
              <Settings2 className="w-4 h-4" />
              Rooms Setup
            </Link>
            <button 
              onClick={() => setIsDeletingProperty(true)}
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-4 py-2.5 rounded-xl font-semibold border border-rose-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content (OTA Connections) */}
      <div className="min-h-[400px]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Active Channel Connections</h3>
              <p className="text-muted-foreground text-sm mt-1">OTA integrations currently syncing for this property.</p>
            </div>
            <Link
              href={`/properties/${propertyId}/connect`}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Connect New OTA
            </Link>
          </div>

            {connLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : connections?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connections.map((conn: any) => (
                  <div key={conn.id} className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                    {/* Glass background sparkle */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-muted rounded-xl border border-border flex items-center justify-center font-bold text-foreground italic text-lg uppercase">
                          {conn.ota_name[0]}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold">{conn.ota_name}</h4>
                          <p className={cn(
                            "text-[11px] font-bold px-2 py-0.5 rounded-full inline-block border mt-1",
                            conn.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          )}>
                            {conn.is_active ? "Active" : "Disabled"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setConnToDelete(conn.id)}
                        className="p-2 bg-muted hover:bg-rose-500/10 border border-border hover:border-rose-500/30 rounded-lg text-muted-foreground hover:text-rose-500 transition-all relative z-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Inventory Mappings</span>
                        <span className="font-bold">Manage Linked Rooms</span>
                      </div>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-[40%]" />
                      </div>
                    </div>

                    {/* Operations Bar */}
                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOperation(conn.id, "property-check")}
                          disabled={!!opLoading}
                          className="text-[10px] font-bold px-2 py-1 bg-muted hover:bg-muted/80 rounded border border-border uppercase tracking-tight flex items-center gap-1 transition-all"
                        >
                          {opLoading === `${conn.id}-property-check` ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : "Check"}
                        </button>
                        <button
                          onClick={() => handleOperation(conn.id, "property-activation")}
                          disabled={!!opLoading}
                          className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20 uppercase tracking-tight flex items-center gap-1 transition-all"
                        >
                          {opLoading === `${conn.id}-property-activation` ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : "Activate"}
                        </button>
                        <button
                          onClick={() => handleOperation(conn.id, "property-cancellation")}
                          disabled={!!opLoading}
                          className="text-[10px] font-bold px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded border border-rose-500/20 uppercase tracking-tight flex items-center gap-1 transition-all"
                        >
                          {opLoading === `${conn.id}-property-cancellation` ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : "Cancel"}
                        </button>
                      </div>
                      <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground underline underline-offset-4">
                        View Logs
                      </button>
                    </div>

                    <div className="mt-8 flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedMappingConn(conn);
                          setIsMappingModalOpen(true);
                        }}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Configure Mappings
                      </button>
                      <button className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold border border-border">
                        <Settings2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-dashed border-border p-12 rounded-2xl text-center text-muted-foreground col-span-full">
                <p className="font-medium">No channels connected yet.</p>
                <p className="text-xs mt-1">Connect your hotel to Airbnb or Booking.com to start syncing.</p>
              </div>
            )}
        </div>
      </div>

      <RoomMappingModal
        propertyId={propertyId}
        connection={selectedMappingConn}
        isOpen={isMappingModalOpen}
        onClose={() => {
          setIsMappingModalOpen(false);
          setSelectedMappingConn(null);
        }}
        onSuccess={() => mutateConns()}
      />

      <ConfirmDialog
        isOpen={connToDelete !== null}
        title="Remove Connection?"
        message="Are you sure you want to completely disable and delete this channel connection? This action cannot be undone and will stop all synchronization for this OTA."
        type="danger"
        confirmLabel="Remove Connection"
        onConfirm={handleRemoveConnection}
        onCancel={() => setConnToDelete(null)}
      />

      <ConfirmDialog
        isOpen={isDeletingProperty}
        title="Delete Property?"
        message={`Are you sure you want to delete ${property?.name}? This action is permanent and will cascade delete all room types, rate plans, and OTA connection mappings.`}
        type="danger"
        confirmLabel="Permanently Delete"
        onConfirm={handleDeleteProperty}
        onCancel={() => setIsDeletingProperty(false)}
      />
    </div>
  );
}
