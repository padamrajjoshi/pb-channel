"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  Key, 
  Globe, 
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Loader2,
  Network
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { api, handleApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

const availableOTAs = [
  { 
    id: "airbnb", 
    name: "Airbnb", 
    description: "Sync via iCal or Official API. Best for vacation rentals.",
    category: "PMS / Vacation Rental",
    popular: true
  },
  { 
    id: "zodomus", 
    name: "Zodomus", 
    description: "Master channel manager. Connects to 2000+ OTAs instantly.",
    category: "Channel Manager",
    popular: true
  },
  { 
    id: "booking", 
    name: "Booking.com", 
    description: "Official XML connection. Best for hotels and B&Bs.",
    category: "Full API",
    popular: true
  },
  { 
    id: "expedia", 
    name: "Expedia", 
    description: "Standard EQC connection for mass inventory sync.",
    category: "Full API",
    popular: false
  },
  { 
    id: "agoda", 
    name: "Agoda", 
    description: "Connect to the largest distribution network in Asia.",
    category: "Full API",
    popular: false
  },
];

export default function ConnectOTAPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const propertyId = resolvedParams.id;
  const router = useRouter();
  const { success } = useToast();
  const [selectedOTA, setSelectedOTA] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  
  const [remoteId, setRemoteId] = useState("");
  const [configKey, setConfigKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zodomus Specific Engine
  const [zodomusChannels, setZodomusChannels] = useState<any[]>([]);
  const [zodomusSubChannel, setZodomusSubChannel] = useState<any>(null);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);

  useEffect(() => {
    if (selectedOTA === "zodomus") {
      const loadChannels = async () => {
        setIsLoadingChannels(true);
        try {
          const res = await api.get("/hotels/zodomus-channels");
          setZodomusChannels(res.data.channels || []);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingChannels(false);
        }
      };
      loadChannels();
    }
  }, [selectedOTA]);

  const selectedData = availableOTAs.find(o => o.id === selectedOTA);

  const handleConnect = async () => {
    if (!remoteId) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post(`/hotels/${propertyId}/ota-connections`, {
        ota_name: selectedData?.name,
        config: {
            api_key: configKey,
            remote_id: remoteId,
            ical_url: selectedOTA === 'airbnb' ? remoteId : null,
            zodomus_channel_id: zodomusSubChannel?.id || null,
            zodomus_channel_name: zodomusSubChannel?.name || null
        },
        is_active: true,
        property_id: parseInt(propertyId)
      });
      
      success(`${selectedData?.name} connected successfully! Starting initial sync...`);
      router.push(`/properties/${propertyId}`);
      router.refresh();
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href={`/properties/${propertyId}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium group w-fit"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Hotel Detail
        </Link>
        
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Connect New Channel</h1>
           <p className="text-muted-foreground mt-1">Select an OTA to link with your property and begin synchronization.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search 2000+ OTAs..." 
                  className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm font-medium text-sm"
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableOTAs.map((ota) => (
                  <button
                    key={ota.id}
                    onClick={() => {
                        setSelectedOTA(ota.id);
                        setStep(2);
                    }}
                    className="flex items-center gap-4 bg-card border border-border p-5 rounded-2xl hover:bg-muted/50 hover:border-blue-500/30 transition-all text-left group shadow-sm"
                  >
                     <div className="w-16 h-16 bg-muted rounded-2xl border border-border flex items-center justify-center font-bold text-foreground italic text-xl">
                        {ota.name[0]}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <h3 className="text-lg font-bold">{ota.name}</h3>
                           {ota.popular && (
                             <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase tracking-tighter">Popular</span>
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ota.description}</p>
                     </div>
                     <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
             </div>

             <div className="bg-card border border-dashed border-border p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-3 shadow-sm">
                <Globe className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">Looking for another channel?</p>
                <p className="text-xs text-muted-foreground/60 max-w-xs leading-relaxed">We support over 2,000 global OTAs via our unified plugin architecture.</p>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto"
          >
             <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-card rounded-xl border border-border flex items-center justify-center font-bold text-foreground italic">
                         {selectedData?.name[0]}
                      </div>
                      <h2 className="text-xl font-bold">Connect {selectedData?.name}</h2>
                   </div>
                   <button 
                     onClick={() => setStep(1)}
                     className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                   >
                     Change Channel
                   </button>
                </div>

                <div className="p-8 space-y-8">
                   <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-4">
                      <ShieldCheck className="w-6 h-6 text-blue-500 dark:text-blue-400 mt-1" />
                      <div>
                         <p className="text-sm font-bold text-blue-600 dark:text-blue-200 uppercase tracking-widest mb-1">Official Connection</p>
                         <p className="text-blue-600/70 dark:text-blue-200/60 text-xs leading-relaxed">
                            Your credentials are encrypted and stored securely. We only use them to synchronize inventory and rates.
                         </p>
                      </div>
                   </div>

                   <div className="space-y-6">
                       {selectedOTA === "zodomus" && !zodomusSubChannel ? (
                          <div className="space-y-4">
                              <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                                 <Network className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                 Select Zodomus Sub-Channel Target
                              </h3>
                              {isLoadingChannels ? (
                                  <div className="py-8 flex flex-col items-center justify-center gap-3">
                                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Polling Channel Manager...</p>
                                  </div>
                              ) : (
                                  <div className="grid grid-cols-2 gap-3">
                                      {zodomusChannels.map((channel: any) => (
                                          <button
                                              key={channel.id}
                                              onClick={() => setZodomusSubChannel(channel)}
                                              className="bg-card border border-border py-4 px-4 rounded-xl flex items-center justify-between hover:bg-muted/50 hover:border-blue-500/30 transition-all text-left shadow-sm mb-1"
                                          >
                                              <span className="font-bold text-sm">{channel.channel}</span>
                                              <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                                          </button>
                                      ))}
                                  </div>
                              )}
                          </div>
                      ) : (
                         <div className="space-y-6">
                           {selectedOTA === "zodomus" && zodomusSubChannel && (
                              <div className="px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between">
                                  <div>
                                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-0.5">Target Channel</span>
                                      <span className="text-sm font-bold">{zodomusSubChannel.channel}</span>
                                  </div>
                                  <button 
                                      onClick={() => setZodomusSubChannel(null)}
                                      className="text-xs font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  >
                                      Change Filter
                                  </button>
                              </div>
                           )}
                           
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Key className="w-3.5 h-3.5" />
                                {selectedOTA === 'airbnb' ? 'Airbnb iCal URL' : 'Hotel Channel ID'}
                              </label>
                              <input 
                                type="text" 
                                value={remoteId}
                                onChange={(e) => setRemoteId(e.target.value)}
                                placeholder={selectedOTA === 'airbnb' ? 'e.g. https://www.airbnb.com/calendar/ical/...' : 'e.g. 558932'} 
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all font-mono text-sm placeholder:text-muted-foreground/40"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sync API Key / Secret (Optional)</label>
                              <input 
                                type="password" 
                                value={configKey}
                                onChange={(e) => setConfigKey(e.target.value)}
                                placeholder="••••••••••••••••••••••••••••" 
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all font-mono text-sm placeholder:text-muted-foreground/40"
                              />
                           </div>

                           {error && (
                             <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                                {error}
                             </div>
                           )}

                           <div className="pt-4 space-y-4">
                              <button 
                                 onClick={handleConnect}
                                 disabled={isSubmitting || !remoteId}
                                 className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3"
                              >
                                 {isSubmitting ? (
                                     <Loader2 className="w-5 h-5 animate-spin" />
                                 ) : (
                                     <>
                                         Authorize & Link Channel
                                         <ChevronRight className="w-5 h-5" />
                                     </>
                                 )}
                              </button>
                              <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1.5 uppercase font-bold tracking-widest">
                                 <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                 Secure direct integration
                              </p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="bg-muted/50 p-6 border-t border-border">
                   <h5 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      What happens next?
                   </h5>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground/80">
                      <div className="flex gap-2">
                         <span className="text-blue-500 font-bold">01</span>
                         <span>We will verify your credentials with {selectedData?.name}'s API.</span>
                      </div>
                      <div className="flex gap-2">
                         <span className="text-blue-500 font-bold">02</span>
                         <span>Room types will be discovered and ready for mapping.</span>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
