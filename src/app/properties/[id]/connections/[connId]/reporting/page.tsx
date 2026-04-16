"use client";

import React, { useState } from "react";
import { ArrowLeft, TrendingUp, XCircle, BarChart2, FileSearch, Loader2, Calendar, Download } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api, handleApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

const REPORT_TYPES = [
  {
    id: "revenue",
    label: "Revenue",
    endpoint: "revenue",
    icon: TrendingUp,
    color: "emerald",
    description: "Total revenue generated from Booking.com bookings over the selected period.",
  },
  {
    id: "cancellations",
    label: "Cancellations",
    endpoint: "cancellations",
    icon: XCircle,
    color: "rose",
    description: "Cancellation breakdown, rates and financial impact over the selected period.",
  },
  {
    id: "performance",
    label: "Performance",
    endpoint: "performance",
    icon: BarChart2,
    color: "blue",
    description: "Click-through rates, conversion rates and occupancy analytics.",
  },
  {
    id: "custom",
    label: "Custom",
    endpoint: "reports",
    icon: FileSearch,
    color: "purple",
    description: "Fetch any available Zodomus report type by specifying a custom report key.",
  },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20",
  rose: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20",
  blue: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",
  purple: "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20",
};

const BADGE_COLOR: Record<string, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  rose: "text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10",
  blue: "text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/10",
  purple: "text-purple-600 dark:text-purple-400 border-purple-500/20 bg-purple-500/10",
};

function DateRangeInput({
  startDate, endDate, onStartChange, onEndChange,
}: {
  startDate: string; endDate: string; onStartChange: (v: string) => void; onEndChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Start Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">End Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>
    </div>
  );
}

function ResultPanel({ data, color }: { data: any; color: string }) {
  if (!data) return null;

  // Try to extract key metrics for display
  const isError = !!data.error;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {!isError && data && typeof data === "object" && Object.keys(data).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(data)
            .filter(([, v]) => typeof v === "number" || typeof v === "string")
            .slice(0, 6)
            .map(([k, v]) => (
              <div key={k} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, " ")}</p>
                <p className="text-xl font-bold mt-1 text-foreground">{String(v)}</p>
              </div>
            ))}
        </div>
      )}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Raw Response</p>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "report.json";
              a.click();
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download JSON
          </button>
        </div>
        <pre className={`bg-muted border border-border rounded-xl p-4 text-xs overflow-auto max-h-80 ${isError ? "text-rose-500" : "text-emerald-500 dark:text-emerald-400"}`}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </motion.div>
  );
}

export default function BookingReportingPage({
  params,
}: {
  params: Promise<{ id: string; connId: string }>;
}) {
  const resolvedParams = React.use(params);
  const { id: propertyId, connId } = resolvedParams;
  const BASE = `/hotels/${propertyId}/ota-connections/${connId}/booking`;
  const { success, error: toastError } = useToast();

  const [activeReport, setActiveReport] = useState("revenue");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const today = new Date().toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(monthAgo);
  const [endDate, setEndDate] = useState(today);
  const [customReportType, setCustomReportType] = useState("reservations");

  const currentTab = REPORT_TYPES.find((r) => r.id === activeReport)!;

  const run = async () => {
    if (!startDate || !endDate) {
      toastError("Please select a date range.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      let url = "";
      if (activeReport === "custom") {
        url = `${BASE}/reports?report_type=${customReportType}&start_date=${startDate}&end_date=${endDate}`;
      } else {
        url = `${BASE}/reports/${currentTab.endpoint}?start_date=${startDate}&end_date=${endDate}`;
      }
      const res = await api.get(url);
      setResult(res);
      success("Report fetched successfully");
    } catch (err: any) {
      toastError(handleApiError(err));
      setResult({ error: handleApiError(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href={`/properties/${propertyId}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium group mt-1">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Booking.com</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reporting</h1>
          <p className="text-muted-foreground text-sm mt-1">Revenue, cancellations and performance analytics from Booking.com via Zodomus.</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            onClick={() => { setActiveReport(r.id); setResult(null); }}
            className={`relative overflow-hidden text-left p-4 rounded-2xl border transition-all ${
              activeReport === r.id
                ? `border-${r.color}-500/50 bg-${r.color}-500/10`
                : "border-border bg-card hover:border-border/80"
            }`}
          >
            <div className={`inline-flex p-2 rounded-lg border mb-3 ${BADGE_COLOR[r.color]}`}>
              <r.icon className="w-4 h-4" />
            </div>
            <p className={`font-bold text-sm ${activeReport === r.id ? `text-${r.color}-600 dark:text-${r.color}-400` : "text-foreground"}`}>{r.label}</p>
            {activeReport === r.id && (
              <motion.div layoutId="report-indicator" className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${r.color}-500`} />
            )}
          </button>
        ))}
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.div key={activeReport} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border ${BADGE_COLOR[currentTab.color]}`}>
                <currentTab.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{currentTab.label} Report</h2>
                <p className="text-sm text-muted-foreground mt-1">{currentTab.description}</p>
              </div>
            </div>

            <DateRangeInput
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />

            {/* Custom report type input */}
            {activeReport === "custom" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Report Type Key</label>
                <input
                  value={customReportType}
                  onChange={(e) => setCustomReportType(e.target.value)}
                  placeholder="e.g. reservations, revenue, cancellations"
                  className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            )}

            <button
              onClick={run}
              disabled={loading}
              className={`px-6 py-3 ${COLOR_MAP[currentTab.color]} text-white rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <currentTab.icon className="w-4 h-4" />}
              {loading ? "Fetching..." : `Run ${currentTab.label} Report`}
            </button>
          </div>

          {result && (
            <div className="mt-6">
              <ResultPanel data={result} color={currentTab.color} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
