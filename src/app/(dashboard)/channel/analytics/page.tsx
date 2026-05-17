"use client";

import React, { useState } from "react";
import { Activity, Hotel } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";

export default function GlobalAnalyticsPage() {
  const { properties, isLoading: propsLoading } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-md text-[10px] font-bold border border-blue-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              Global Telemetry
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Financial & Sync Analytics</h1>
          <p className="text-muted-foreground mt-2 font-medium">Aggregated OTA revenue, channel performance, and technical audit logs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-card border border-border rounded-2xl p-1.5 flex transition-all shadow-sm">
            {propsLoading ? (
              <div className="w-48 h-10 bg-muted animate-pulse rounded-xl" />
            ) : (
              <select
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="bg-transparent text-foreground px-4 py-2 text-sm font-bold focus:outline-none min-w-[200px]"
                value={selectedPropertyId || ""}
              >
                <option value="" className="bg-card">All Properties (Aggregate)</option>
                {properties?.map((p: any) => (
                  <option key={p.id} value={p.id} className="bg-card">{p.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="pt-4">
        {!selectedPropertyId ? (
          <AnalyticsOverview />
        ) : (
          <AnalyticsDashboard propertyId={parseInt(selectedPropertyId)} />
        )}
      </div>
    </div>
  );
}
