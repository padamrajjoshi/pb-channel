"use client";

import React from "react";
import {
   Activity,
   Search,
   Filter,
   Clock,
   User,
   Database,
   Shield,
   ArrowUpRight,
   Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export default function AuditLogsPage() {
   const [isLoading, setIsLoading] = React.useState(true);

   React.useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
   }, []);

   if (isLoading) {
      return (
         <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="font-medium animate-pulse">Decrypting system logs...</p>
         </div>
      );
   }

   const logs = [
      { id: 1, event: "Property Updated", user: "Sangit Joshi", target: "PEBIGLOBE", time: "2 mins ago", type: "update", icon: Database },
      { id: 2, event: "New User Invited", user: "Admin", target: "agent@test.com", time: "15 mins ago", type: "access", icon: User },
      { id: 3, event: "Security Alert", user: "System", target: "Multiple failed logins", time: "1h ago", type: "security", icon: Shield },
      { id: 4, event: "Config Changed", user: "Sangit Joshi", target: "CORS Settings", time: "3h ago", type: "config", icon: Activity },
      { id: 5, event: "OTA Disconnected", user: "System", target: "Booking.com (Property 3)", time: "5h ago", type: "security", icon: Shield },
   ];

   return (
      <div className="space-y-6 pb-12 text-foreground">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <input 
                  type="text" 
                  placeholder="Search logs by user, event, or target..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
               />
            </div>
            <div className="flex items-center gap-2">
               <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
               </button>
               <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  <Clock className="w-4 h-4" />
                  Last 24h
               </button>
            </div>
         </div>

         <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-muted/30 border-b border-border">
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Event</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">User</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Target</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Time</th>
                     <th className="px-6 py-4"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                     <tr key={log.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors`}>
                                 <log.icon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm">{log.event}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-sidebar-accent flex items-center justify-center text-[10px] font-bold">
                                 {log.user[0]}
                              </div>
                              <span className="text-sm font-medium">{log.user}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <code className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground font-mono">{log.target}</code>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                           {log.time}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            <div className="p-4 bg-muted/20 text-center border-t border-border">
               <button className="text-sm font-bold text-primary hover:underline">Load more system activity</button>
            </div>
         </div>
      </div>
   );
}
