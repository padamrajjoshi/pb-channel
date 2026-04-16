"use client";

import React, { useState } from "react";
import { ArrowLeft, Building2, BedDouble, Tag, Package, CheckCircle2, Loader2, ChevronDown, ChevronUp, Save, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api, handleApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

const TABS = [
  { id: "property", label: "Property", icon: Building2 },
  { id: "rooms", label: "Rooms", icon: BedDouble },
  { id: "rates", label: "Rates", icon: Tag },
  { id: "product", label: "Product", icon: Package },
];

function JsonEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-64 font-mono text-xs bg-muted border border-border rounded-xl p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
      spellCheck={false}
    />
  );
}

function ResultPanel({ data }: { data: any }) {
  if (!data) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Response</p>
      <pre className="bg-muted border border-border rounded-xl p-4 text-xs overflow-auto max-h-72 text-emerald-500 dark:text-emerald-400">
        {JSON.stringify(data, null, 2)}
      </pre>
    </motion.div>
  );
}

export default function BookingTablesPage({
  params,
}: {
  params: Promise<{ id: string; connId: string }>;
}) {
  const resolvedParams = React.use(params);
  const { id: propertyId, connId } = resolvedParams;

  const BASE = `/hotels/${propertyId}/ota-connections/${connId}/booking`;
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState("property");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ----- Property Tab -----
  const [propPayload, setPropPayload] = useState(
    JSON.stringify({ name: "My Hotel", address: "123 Street", city: "Mumbai", country: "IN" }, null, 2)
  );
  const [propStatus, setPropStatus] = useState("active");

  // ----- Rooms Tab -----
  const [roomId, setRoomId] = useState("");
  const [roomPayload, setRoomPayload] = useState(
    JSON.stringify({ roomName: "Standard Double", maxOccupancy: 2, bedType: "double" }, null, 2)
  );
  const [roomStatusId, setRoomStatusId] = useState("");
  const [roomStatusValue, setRoomStatusValue] = useState("open");

  // ----- Rates Tab -----
  const [rateId, setRateId] = useState("");
  const [ratePayload, setRatePayload] = useState(
    JSON.stringify({ rateName: "Standard Rate", currency: "INR", price: 4999 }, null, 2)
  );

  // ----- Product Tab -----
  const [productPayload, setProductPayload] = useState(
    JSON.stringify({ action: "create", roomId: "", rateId: "", name: "Standard Room Package" }, null, 2)
  );

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fn();
      setResult(res);
      success("Request completed successfully");
    } catch (err: any) {
      toastError(handleApiError(err));
      setResult({ error: handleApiError(err) });
    } finally {
      setLoading(false);
    }
  };

  const parseJson = (str: string) => {
    try { return JSON.parse(str); } catch { return {}; }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href={`/properties/${propertyId}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium group mt-1"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Booking.com</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Tables</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your Booking.com property, rooms, rates &amp; products via Zodomus.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

          {/* Property Tab */}
          {activeTab === "property" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-500" /> Get Property</h2>
                <p className="text-sm text-muted-foreground">Fetch your Booking.com property details from Zodomus.</p>
                <button onClick={() => run(() => api.get(BASE + "/property"))} disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Fetch Property
                </button>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><Save className="w-5 h-5 text-emerald-500" /> Push Property Content</h2>
                <p className="text-sm text-muted-foreground">Create or update your Booking.com property content.</p>
                <JsonEditor value={propPayload} onChange={setPropPayload} />
                <button onClick={() => run(() => api.post(BASE + "/property", parseJson(propPayload)))} disabled={loading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Push Property
                </button>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><ToggleRight className="w-5 h-5 text-amber-500" /> Set Property Status</h2>
                <div className="flex gap-3">
                  {["active", "inactive", "closed"].map((s) => (
                    <button key={s} onClick={() => setPropStatus(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${propStatus === s ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-border text-muted-foreground hover:border-blue-500/40"}`}>{s}</button>
                  ))}
                </div>
                <button onClick={() => run(() => api.post(BASE + "/property-status", { status: propStatus }))} disabled={loading} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Set Status to &ldquo;{propStatus}&rdquo;
                </button>
              </div>

              <ResultPanel data={result} />
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === "rooms" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><BedDouble className="w-5 h-5 text-blue-500" /> Get Rooms</h2>
                <div className="flex items-center gap-3">
                  <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID (optional)" className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  <button onClick={() => run(() => api.get(`${BASE}/rooms${roomId ? `?room_id=${roomId}` : ""}`))} disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Fetch
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><Save className="w-5 h-5 text-emerald-500" /> Push Room</h2>
                <JsonEditor value={roomPayload} onChange={setRoomPayload} />
                <button onClick={() => run(() => api.post(BASE + "/rooms", parseJson(roomPayload)))} disabled={loading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Push Room
                </button>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><ToggleRight className="w-5 h-5 text-amber-500" /> Set Room Status</h2>
                <div className="flex gap-3 items-center">
                  <input value={roomStatusId} onChange={(e) => setRoomStatusId(e.target.value)} placeholder="Remote Room ID" className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  {["open", "closed"].map((s) => (
                    <button key={s} onClick={() => setRoomStatusValue(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${roomStatusValue === s ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-border text-muted-foreground hover:border-blue-500/40"}`}>{s}</button>
                  ))}
                </div>
                <button onClick={() => run(() => api.post(BASE + "/room-status", { roomId: roomStatusId, status: roomStatusValue }))} disabled={loading} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Set Status
                </button>
              </div>

              <ResultPanel data={result} />
            </div>
          )}

          {/* Rates Tab */}
          {activeTab === "rates" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><Tag className="w-5 h-5 text-blue-500" /> Get Rate Plans</h2>
                <div className="flex items-center gap-3">
                  <input value={rateId} onChange={(e) => setRateId(e.target.value)} placeholder="Rate ID (optional)" className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  <button onClick={() => run(() => api.get(`${BASE}/rates${rateId ? `?rate_id=${rateId}` : ""}`))} disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Fetch
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><Save className="w-5 h-5 text-emerald-500" /> Push Rate Plan</h2>
                <JsonEditor value={ratePayload} onChange={setRatePayload} />
                <button onClick={() => run(() => api.post(BASE + "/rates", parseJson(ratePayload)))} disabled={loading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Push Rate
                </button>
              </div>

              <ResultPanel data={result} />
            </div>
          )}

          {/* Product Tab */}
          {activeTab === "product" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2"><Package className="w-5 h-5 text-purple-500" /> Push Product</h2>
                <p className="text-sm text-muted-foreground">Create, modify or delete a Booking.com product (room + rate composite bundle). Set <code className="bg-muted px-1 rounded text-xs">action</code> to <code className="bg-muted px-1 rounded text-xs">create</code>, <code className="bg-muted px-1 rounded text-xs">modify</code>, or <code className="bg-muted px-1 rounded text-xs">delete</code>.</p>
                <JsonEditor value={productPayload} onChange={setProductPayload} />
                <button onClick={() => run(() => api.post(BASE + "/product", parseJson(productPayload)))} disabled={loading} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Submit Product
                </button>
              </div>

              <ResultPanel data={result} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
