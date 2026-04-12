"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Hotel, 
  Calendar, 
  Settings, 
  RefreshCw, 
  ChevronRight, 
  LogOut,
  LayoutDashboard,
  User,
  Inbox,
  MessageSquareText,
  Tag,
  Bed,
  Moon,
  Sun,
  Activity
} from "lucide-react";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Logo from "@/components/common/logo";
import { api } from "@/lib/api";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Reservations", href: "/reservations", icon: Inbox },
  { name: "Guest Reviews", href: "/reviews", icon: MessageSquareText },
  { name: "Promotions", href: "/promotions", icon: Tag },
  { name: "Properties", href: "/properties", icon: Hotel },
  { name: "Rooms & Setup", href: "/rooms", icon: Bed },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics & Sync", href: "/analytics", icon: Activity },
  { name: "Users & Staff", href: "/users", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (e) {
      // Best-effort backend closure
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="w-64 h-full bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50 transition-colors duration-300">
      <div className="p-6 flex items-center justify-center border-b border-sidebar-border bg-sidebar-accent/20">
        <Logo className="w-auto h-12 py-1" />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-primary"
              )} />
              <span className="font-medium flex-1 text-sm">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground"
                />
              )}
              {!isActive && (
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground/70 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
