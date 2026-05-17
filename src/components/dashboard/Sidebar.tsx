"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  Table2,
  BarChart2,
  Globe2,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Logo from "@/components/common/logo";
import { api } from "@/lib/api";

import { useProfile } from "@/hooks/useHotel";
import { useActiveModule } from "@/hooks/useActiveModule";
import { MODULES, ModuleConfig, NavItem } from "@/config/modules";
import { ModuleSwitcher } from "./ModuleSwitcher";

// Shared Tooltip State
const Tooltip = ({ text, pos }: { text: string; pos: { x: number; y: number } | null }) => {
  if (!pos) return null;
  return (
    <div 
      className="fixed z-[100] px-3 py-1.5 bg-card/90 backdrop-blur-md text-foreground border border-border shadow-xl rounded-xl text-xs font-bold pointer-events-none transition-opacity duration-200 whitespace-nowrap"
      style={{ left: pos.x, top: pos.y, transform: 'translateY(-50%)' }}
    >
      {text}
    </div>
  );
};

import { useUIStore } from "@/hooks/useUIStore";
import { useRole } from "@/hooks/useRole";
import { 
  Menu, 
  ChevronLeft as ChevronLeftIcon,
  Bell,
  User,
  Settings,
  HelpCircle
} from "lucide-react";

/** Extract propertyId + connId from /properties/[id]/connections/[connId]/... */
function parseConnectionContext(pathname: string): { propertyId: string; connId: string } | null {
  const match = pathname.match(/^\/pms\/properties\/(\d+)\/connections\/(\d+)/);
  if (!match) return null;
  return { propertyId: match[1], connId: match[2] };
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const connCtx = parseConnectionContext(pathname);
  const { profile } = useProfile();
  const { currentRole, enabledModules, hasPermission } = useRole();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const [tooltipData, setTooltipData] = React.useState<{ text: string; pos: { x: number; y: number } } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, text: string) => {
    if (!isSidebarCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipData({ text, pos: { x: rect.right + 12, y: rect.top + rect.height / 2 } });
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  const handleLogout = async () => {
    try { await api.post("/auth/logout", {}); } catch { /* best-effort */ }
    router.push("/login");
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isSidebarCollapsed ? 64 : 256 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className={cn(
        "h-full bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50 transition-colors duration-300",
      )}
    >
      <Tooltip text={tooltipData?.text || ""} pos={tooltipData?.pos || null} />
      {/* Header with Logo & Toggle */}
      <div className={cn(
        "h-20 flex items-center border-b border-sidebar-border/50 overflow-hidden relative",
        isSidebarCollapsed ? "justify-center" : "justify-between px-4"
      )}>
        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 overflow-hidden"
            >
              <Logo className="w-auto h-8 py-1 object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-all active:scale-90 shadow-sm flex-shrink-0 z-10"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-3 pb-6 space-y-6 overflow-y-auto no-scrollbar pt-6">
        {/* 🏠 GLOBAL OVERVIEW */}
        <div className="space-y-1 px-1">
          <Link
            href="/"
            onMouseEnter={(e) => handleMouseEnter(e, "Overview")}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "flex items-center gap-3 py-3 rounded-2xl transition-all duration-300 relative",
              isSidebarCollapsed ? "justify-center px-0" : "px-4",
              pathname === "/"
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-xl shadow-sidebar-primary/30"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <LayoutDashboard className={cn("w-5 h-5 flex-shrink-0", isSidebarCollapsed && "mx-auto")} />
            {!isSidebarCollapsed && <span className="font-bold text-sm">Overview</span>}
            {isSidebarCollapsed && pathname === "/" && (
              <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
            )}
          </Link>
        </div>

        {/* 🏨 MODULE GROUPS */}
        {MODULES.filter((m: ModuleConfig) => {
          // 1. Legacy Role Filter
          if (m.allowedRoles && currentRole && !m.allowedRoles.includes(currentRole)) return false;
          // 1.5 Dynamic Permission Filter
          if (m.requiredPermission && !hasPermission(m.requiredPermission)) return false;
          
          // 2. SaaS Module Filter (system modules pass through, otherwise check enabledModules)
          if (!m.id.startsWith("SYSTEM_") && enabledModules && enabledModules.length > 0) {
            if (!enabledModules.includes(m.id)) return false;
          }
          return true;
        }).map((module: ModuleConfig) => {
          const validNavItems = module.navItems.filter((item: NavItem) => {
            if (item.allowedRoles && currentRole && !item.allowedRoles.includes(currentRole)) return false;
            if (item.requiredPermission && !hasPermission(item.requiredPermission)) return false;
            return true;
          });
          
          if (validNavItems.length === 0) return null;

          const isModuleActive = validNavItems.some(item =>
            item.exact ? pathname === item.href : pathname.startsWith(item.href)
          );

          return (
            <div key={module.id} className="space-y-3 px-1">
              {!isSidebarCollapsed ? (
                <p className={cn(
                  "px-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-300",
                  isModuleActive ? "text-sidebar-primary" : "text-sidebar-foreground/30"
                )}>
                  {module.label}
                </p>
              ) : (
                <p className={cn(
                  "text-center text-[10px] font-black uppercase tracking-[0.1em] transition-colors duration-300",
                  isModuleActive ? "text-sidebar-primary" : "text-sidebar-foreground/30"
                )}>
                  {module.label.split(' ')[0].substring(0, 3)}
                </p>
              )}
              
              <div className="space-y-1">
                {validNavItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onMouseEnter={(e) => handleMouseEnter(e, item.name)}
                      onMouseLeave={handleMouseLeave}
                      className={cn(
                        "flex items-center gap-3 py-3 rounded-2xl transition-all duration-300 relative",
                        isSidebarCollapsed ? "justify-center px-0" : "px-4",
                        isActive
                          ? "bg-sidebar-primary/10 text-sidebar-primary font-bold shadow-sm"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/40",
                        isSidebarCollapsed && "mx-auto"
                      )} />
                      {!isSidebarCollapsed && <span className="text-sm">{item.name}</span>}
                      {isSidebarCollapsed && isActive && (
                        <motion.div layoutId="active-pill-sub" className="absolute left-0 w-1 h-6 bg-sidebar-primary rounded-r-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ─── Contextual: Channel Tools ─── */}
        <AnimatePresence>
          {connCtx && !isSidebarCollapsed && (
            <motion.div
              key="cm-subnav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-2 border-t border-sidebar-border/30 pt-4 px-1"
            >
              <p className="px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/30">
                Channel Context
              </p>
              {([
                {
                  href: `/pms/properties/${connCtx.propertyId}/connections/${connCtx.connId}/booking`,
                  label: "Booking Tables",
                  icon: Table2,
                  colorText: "text-blue-500",
                },
                {
                  href: `/pms/properties/${connCtx.propertyId}/connections/${connCtx.connId}/expedia`,
                  label: "Expedia Tables",
                  icon: Globe2,
                  colorText: "text-violet-500",
                },
                {
                  href: `/pms/properties/${connCtx.propertyId}/connections/${connCtx.connId}/reporting`,
                  label: "Reports",
                  icon: BarChart2,
                  colorText: "text-emerald-500",
                },
              ] as const).map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all group",
                      isActive
                        ? `${item.colorText} bg-sidebar-accent`
                        : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Logout & Bottom Actions */}
      <div className="p-4 space-y-2 border-t border-sidebar-border/50">
        {!isSidebarCollapsed && (
          <div className="flex items-center justify-around mb-2 px-2 py-1 bg-sidebar-accent/50 rounded-2xl border border-sidebar-border/30">
            <button className="p-2 text-sidebar-foreground/40 hover:text-sidebar-primary transition-colors"><Settings className="w-4 h-4" /></button>
            <button className="p-2 text-sidebar-foreground/40 hover:text-sidebar-primary transition-colors"><Bell className="w-4 h-4" /></button>
            <button className="p-2 text-sidebar-foreground/40 hover:text-sidebar-primary transition-colors"><HelpCircle className="w-4 h-4" /></button>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 py-3 rounded-2xl transition-all group",
            isSidebarCollapsed ? "justify-center px-0" : "px-4",
            "text-sidebar-foreground/60 hover:text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/20 border border-transparent"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="font-bold text-sm">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
}
