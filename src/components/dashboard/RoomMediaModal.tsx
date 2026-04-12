"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { api, handleApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { Loader2, ImagePlus, Save, Trash2 } from "lucide-react";

interface RoomMediaModalProps {
  propertyId: number;
  roomTypeId: number;
  roomName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RoomMediaModal({ propertyId, roomTypeId, roomName, isOpen, onClose }: RoomMediaModalProps) {
  const { success, error: toastError } = useToast();
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, roomTypeId]);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/hotels/${propertyId}/room-types/${roomTypeId}/media`);
      setUrls(res.data?.urls || []);
    } catch (err) {
      toastError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUrl = () => {
    if (!newUrl.trim()) return;
    if (!newUrl.startsWith("http")) {
      toastError("URL must start with http:// or https://");
      return;
    }
    setUrls(prev => [...prev, newUrl.trim()]);
    setNewUrl("");
  };

  const handleRemove = (index: number) => {
    setUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post(`/hotels/${propertyId}/room-types/${roomTypeId}/media`, { urls });
      success("Room media configuration saved and configured for OTA push operations.");
      onClose();
    } catch (err) {
      toastError(handleApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Media Gallery: ${roomName}`}>
      <div className="space-y-6 pt-2">
        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-4">
          <ImagePlus className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-200/70 leading-relaxed">
            Please attach directly resolvable internet URLs for this room's visual assets. 
            OTAs like Booking.com reject broken or redirected URLs.
          </p>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4">
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://your-cloud.com/image.jpg"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddUrl()}
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button 
                onClick={handleAddUrl}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl text-sm font-bold transition-all shadow-sm"
              >
                Add URL
              </button>
            </div>

            <div className="space-y-3 mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Payload Image Set</h4>
              {urls.length === 0 ? (
                <div className="text-sm italic text-muted-foreground p-4 bg-muted/20 border border-dashed rounded-xl text-center">
                  No images mapped. This room will likely be rejected by OTAs.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {urls.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-border aspect-video bg-muted/20 flex flex-col items-center justify-center">
                      <img src={url} alt={`Room asset ${idx}`} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                      <div className="hidden text-xs text-rose-400 font-bold bg-background/80 px-2 py-1 rounded">Broken URL</div>
                      
                      <button 
                        onClick={() => handleRemove(idx)}
                        className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 text-sm"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
            Compile Image Payloads
          </button>
        </div>
      </div>
    </Modal>
  );
}
