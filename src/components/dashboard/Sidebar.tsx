"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Hotel,
  Calendar,
  Settings,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  User,
  Inbox,
  MessageSquareText,
  Tag,
  Bed,
  Activity,
  Table2,
  BarChart2,
  Globe2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Logo from "@/components/common/logo";
import { api } from "@/lib/api";

const navItems: { name: string; href: string; icon: React.ElementType; exact?: boolean }[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
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

/** Extract propertyId + connId from /properties/[id]/connections/[connId]/... */
function parseConnectionContext(pathname: string): { propertyId: string; connId: string } | null {
  const match = pathname.match(/^\/properties\/(\d+)\/connections\/(\d+)/);
  if (!match) return null;
  return { propertyId: match[1], connId: match[2] };
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const connCtx = parseConnectionContext(pathname);

  const handleLogout = async () => {
    try { await api.post("/auth/logout", {}); } catch { /* best-effort */ }
    router.push("/login");
  };

  return (
    <div className="w-64 h-full bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50 transition-colors duration-300">
      {/* Logo */}
      <div className="p-6 flex items-center justify-center border-b border-sidebar-border bg-sidebar-accent/20">
        <Logo className="w-auto h-12 py-1" />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
        {/* Main nav */}
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

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
                isActive
                  ? "text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/50 group-hover:text-sidebar-primary"
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

        {/* ─── Contextual: Channel Manager sub-nav ─── */}
        <AnimatePresence>
          {connCtx && (
            <motion.div
              key="cm-subnav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              {/* Section label */}
              <div className="mt-4 mb-1 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-sidebar-border" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/30 whitespace-nowrap">
                    Channel Manager
                  </span>
                  <div className="flex-1 h-px bg-sidebar-border" />
                </div>
              </div>

              {/* Sub-links */}
              {([
                {
                  href: `/properties/${connCtx.propertyId}/connections/${connCtx.connId}/booking`,
                  label: "Booking Tables",
                  icon: Table2,
                  colorText: "text-blue-500",
                  colorBg: "bg-blue-500/10 border border-blue-500/20",
                  dot: "bg-blue-500",
                },
                {
                  href: `/properties/${connCtx.propertyId}/connections/${connCtx.connId}/expedia`,
                  label: "Expedia Tables",
                  icon: Globe2,
                  colorText: "text-violet-500",
                  colorBg: "bg-violet-500/10 border border-violet-500/20",
                  dot: "bg-violet-500",
                },
                {
                  href: `/properties/${connCtx.propertyId}/connections/${connCtx.connId}/reporting`,
                  label: "Reports",
                  icon: BarChart2,
                  colorText: "text-emerald-500",
                  colorBg: "bg-emerald-500/10 border border-emerald-500/20",
                  dot: "bg-emerald-500",
                },
              ] as const).map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                      isActive
                        ? `${item.colorText} ${item.colorBg}`
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4",
                      isActive ? item.colorText : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <div className={cn("w-1.5 h-1.5 rounded-full", item.dot)} />}
                  </Link>
                );
              })}

              {/* Back to property */}
              <Link
                href={`/properties/${connCtx.propertyId}`}
                className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
              >
                <ChevronRight className="w-3 h-3 rotate-180 shrink-0" />
                Back to Property
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
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
