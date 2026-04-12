"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Settings2, Wifi, Coffee, Car, Dumbbell, Snowflake, Save } from "lucide-react";
import { useSettings } from "@/hooks/useHotel";
import { api, handleApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

const AMENITY_OPTIONS = [
  { code: "free_wifi", label: "Free High-Speed WiFi", icon: <Wifi className="w-4 h-4" /> },
  { code: "breakfast", label: "Breakfast Included", icon: <Coffee className="w-4 h-4" /> },
  { code: "parking", label: "On-site Parking", icon: <Car className="w-4 h-4" /> },
  { code: "gym", label: "Fitness Center", icon: <Dumbbell className="w-4 h-4" /> },
  { code: "ac", label: "Air Conditioning", icon: <Snowflake className="w-4 h-4" /> },
];

export function AmenitiesSettings({ propertyId }: { propertyId: number }) {
  const { settingsData, isLoading, mutate } = useSettings(propertyId);
  const { success, error: toastError } = useToast();

  const [activeAmenities, setActiveAmenities] = useState<string[]>([]);
  const [policies, setPolicies] = useState({
    check_in_time: "14:00",
    check_out_time: "11:00",
    cancellation_policy: "Standard",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settingsData) {
      setActiveAmenities(settingsData.amenities || []);
      if (settingsData.policies) {
        setPolicies(settingsData.policies);
      }
    }
  }, [settingsData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const toggleAmenity = (code: string) => {
    setActiveAmenities(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Parallel save to both endpoints
      await Promise.all([
        api.post(`/hotels/${propertyId}/amenities`, { amenities: activeAmenities }),
        api.post(`/hotels/${propertyId}/policies`, policies)
      ]);
      
      success("Settings synced locally and prepared for OTA payload injection.");
      mutate();
    } catch (err) {
      toastError(handleApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card border shadow-sm rounded-3xl overflow-hidden flex flex-col relative w-full">
      <div className="p-6 border-b bg-muted/10 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-500" />
            Property Settings & Amenities
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Configure property-wide policies and amenities. Required perfectly matched mapping fields for Booking.com.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Sync Core Settings
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Amenities Toggles */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">Property Amenities</h4>
          <div className="grid grid-cols-1 gap-3">
            {AMENITY_OPTIONS.map((opt) => {
              const isActive = activeAmenities.includes(opt.code);
              return (
                <div 
                  key={opt.code}
                  onClick={() => toggleAmenity(opt.code)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive 
                      ? "bg-blue-500/10 border-blue-500/30 text-foreground" 
                      : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? "bg-blue-500 text-white shadow-sm shadow-blue-500/40" : "bg-muted"}`}>
                    {opt.icon}
                  </div>
                  <span className="font-semibold text-sm">{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Policies Form */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">Property Policies</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Check-in Time</label>
              <input 
                type="time" 
                value={policies.check_in_time}
                onChange={e => setPolicies({...policies, check_in_time: e.target.value})}
                className="w-full bg-background border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Check-out Time</label>
              <input 
                type="time" 
                value={policies.check_out_time}
                onChange={e => setPolicies({...policies, check_out_time: e.target.value})}
                className="w-full bg-background border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-muted-foreground mb-1">Cancellation Designation</label>
            <select 
              value={policies.cancellation_policy || ""}
              onChange={e => setPolicies({...policies, cancellation_policy: e.target.value})}
              className="w-full bg-background border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Flexible">Flexible (Free cancellation within 24h)</option>
              <option value="Standard">Standard (Free cancellation within 3 days)</option>
              <option value="Strict">Strict (No refunds)</option>
            </select>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mt-4">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Important: OTA Platforms like Expedia override soft cancellation policies if conflicting Rate Plans exist. 
              Ensure your derived Rate Yield mapping matches the selected global designation.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
