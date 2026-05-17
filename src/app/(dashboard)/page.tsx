"use client";

import React from "react";
import { 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  Wallet, 
  BarChart3, 
  Clock, 
  Rocket,
  LayoutDashboard,
  Users2,
  Globe,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useProperties } from "@/hooks/useProperties";
import { useReservations } from "@/hooks/useHotel";
import { cn } from "@/utils/cn";

export default function GlobalDashboardPage() {
   const { properties, isLoading: propsLoading } = useProperties();
   const { reservationsData, isLoading: resLoading } = useReservations(properties?.[0]?.id || "");

   if (propsLoading || resLoading) {
      return (
         <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Zap className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-black text-xl tracking-tight animate-pulse">Initializing Command Center</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em]">Synchronizing Multi-tenant Matrix</p>
            </div>
         </div>
      );
   }

   const revenueMTD = reservationsData?.reservations?.reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0) || 0;

   const modulesSummary = [
      {
         id: "pms",
         name: "Property Intelligence",
         desc: "Full-scale inventory & yield management",
         icon: LayoutDashboard,
         stat: `${properties?.length || 0} Active Properties`,
         trend: "+2 this month",
         color: "text-blue-500",
         bg: "bg-blue-500/10",
         href: "/pms"
      },
      {
         id: "crm",
         name: "Guest Experience",
         desc: "Sentiment analysis & loyalty tracking",
         icon: Users2,
         stat: "84% Avg. Sentiment",
         trend: "+4% from last week",
         color: "text-rose-500",
         bg: "bg-rose-500/10",
         href: "/crm"
      },
      {
         id: "channel",
         name: "Distribution Hub",
         desc: "Real-time OTA synchronization",
         icon: Globe,
         stat: "99.8% Sync Uptime",
         trend: "Healthy",
         color: "text-emerald-500",
         bg: "bg-emerald-500/10",
         href: "/channel"
      },
      {
         id: "admin",
         name: "Security & Ops",
         desc: "System monitoring & access control",
         icon: ShieldCheck,
         stat: "0 Security Incidents",
         trend: "All systems go",
         color: "text-indigo-500",
         bg: "bg-indigo-500/10",
         href: "/admin"
      }
   ];

   return (
      <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
         {/* Hero Section */}
         <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group p-10 rounded-[3rem] overflow-hidden border border-border/40 shadow-2xl shadow-primary/5 bg-card/40 backdrop-blur-md"
         >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 group-hover:scale-105 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20">
                      <Sparkles className="w-3 h-3" />
                      Live Ecosystem
                    </span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Enterprise Edition v4.0</span>
                  </div>
                  <h1 className="text-5xl font-black tracking-tight leading-tight">
                    Global <span className="text-primary">Command</span> Center
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
                    Welcome back, administrator. Your multi-tenant architecture is currently 
                    operating at <span className="text-primary font-bold">peak efficiency</span>. 
                    Monitor real-time performance across all nodes below.
                  </p>
               </div>
               <div className="flex flex-col gap-3">
                 <button className="h-14 px-8 bg-primary text-white rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
                   <Rocket className="w-4 h-4" />
                   System Audit
                 </button>
                 <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-40">Last sync: 2 mins ago</p>
               </div>
            </div>
            <Zap className="absolute right-[-40px] bottom-[-40px] w-96 h-96 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
         </motion.div>

         {/* Performance Matrix */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
               whileHover={{ y: -5 }}
               className="lg:col-span-2 bg-card border border-border/60 p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group transition-all"
            >
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Wallet className="w-40 h-40" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                     <div className="space-y-1">
                        <h3 className="text-xl font-black flex items-center gap-3">
                           <TrendingUp className="w-6 h-6 text-emerald-500" />
                           Revenue Performance
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Aggregated Yield Across Portfolio</p>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                     </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8">
                     <p className="text-7xl font-black tracking-tighter">₹{revenueMTD.toLocaleString()}</p>
                     <div className="flex flex-col pb-2">
                        <p className="text-emerald-500 flex items-center gap-1 text-sm font-black">
                           <ArrowUpRight className="w-5 h-5" />
                           12.4%
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">vs. last month</p>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-8 mt-4">
                     <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        Next reconciliation in 4 hours
                     </div>
                     <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Highest performing: PMS Hub
                     </div>
                  </div>
               </div>
            </motion.div>

            <motion.div 
               whileHover={{ y: -5 }}
               className="bg-primary text-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(16,58,96,0.4)] relative overflow-hidden flex flex-col justify-between"
            >
               <Zap className="absolute top-[-30px] right-[-30px] w-64 h-64 text-white/10 -rotate-12" />
               <div className="relative z-10">
                  <h3 className="text-xl font-black flex items-center gap-3 mb-2">
                     <Activity className="w-6 h-6 text-blue-300" />
                     Sync Reliability
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-10">Global Distribution Nodes</p>
                  
                  <div className="space-y-2">
                     <p className="text-7xl font-black tracking-tighter">99.8<span className="text-2xl">%</span></p>
                     <p className="text-sm font-bold text-white/70">Operational Stability</p>
                  </div>
               </div>
               
               <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-blue-400/30 backdrop-blur-sm" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">All regions healthy</span>
               </div>
            </motion.div>
         </div>

         {/* Module Intelligence */}
         <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-3xl font-black tracking-tight">Module <span className="text-primary">Intelligence</span></h3>
               <Link href="/settings" className="text-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">Configure Nodes</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {modulesSummary.map((module, i) => (
                  <Link key={module.id} href={module.href}>
                     <motion.div
                        whileHover={{ y: -8, scale: 1.01 }}
                        className="bg-card border border-border/60 p-8 rounded-[2rem] flex items-center gap-8 hover:border-primary transition-all cursor-pointer group shadow-lg hover:shadow-2xl hover:shadow-primary/5"
                     >
                        <div className={cn(
                           "p-5 rounded-3xl transition-all duration-500 group-hover:rotate-[10deg] shadow-lg",
                           module.bg, module.color, "group-hover:scale-110"
                        )}>
                           <module.icon className="w-10 h-10" />
                        </div>
                        <div className="flex-1 space-y-1">
                           <h4 className="font-black text-xl tracking-tight">{module.name}</h4>
                           <p className="text-sm text-muted-foreground font-medium leading-tight mb-2">{module.desc}</p>
                           <div className="flex items-center gap-4 pt-2">
                              <span className="text-xs font-black px-2 py-0.5 bg-muted rounded-md">{module.stat}</span>
                              <span className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase">{module.trend}</span>
                           </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                           <ArrowRight className="w-5 h-5" />
                        </div>
                     </motion.div>
                  </Link>
               ))}
            </div>
         </div>
      </div>
   );
}
