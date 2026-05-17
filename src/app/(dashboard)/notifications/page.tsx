"use client";

import React, { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Check, Info, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications?.filter((n: any) => 
    filter === "unread" ? !n.is_read : true
  ) || [];

  const getIcon = (type: string) => {
    switch (type) {
      case "booking": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "alert": return <Bell className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-md text-[10px] font-bold border border-blue-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <Bell className="w-3 h-3" />
              Notifications
            </span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight">Your Activity Feed</h2>
          <p className="text-muted-foreground mt-2 font-medium">Keep track of incoming bookings and important system alerts.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-card p-1 rounded-xl border border-border shadow-sm flex text-sm font-bold">
            <button 
              onClick={() => setFilter("all")}
              className={cn("px-4 py-1.5 rounded-lg transition-colors", filter === "all" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("unread")}
              className={cn("px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2", filter === "unread" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              Unread
              {unreadCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">{unreadCount}</span>}
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs font-bold text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-3xl p-6 shadow-sm min-h-[400px]">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-4" />
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <Bell className="w-12 h-12 opacity-20 mb-4" />
            <p className="font-medium">You're all caught up!</p>
            <p className="text-xs mt-1">No new notifications to display.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredNotifications.map((notif: any, idx: number) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "flex gap-4 p-4 rounded-2xl border transition-all",
                    notif.is_read ? "bg-muted/30 border-transparent opacity-60" : "bg-background border-border shadow-sm ring-1 ring-blue-500/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    notif.is_read ? "bg-muted" : "bg-blue-500/10"
                  )}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={cn("font-bold text-sm", !notif.is_read && "text-blue-500 dark:text-blue-400")}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 shrink-0 ml-4">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="shrink-0 self-center w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-500/10 text-blue-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
