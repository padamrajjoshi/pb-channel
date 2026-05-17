"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useProfile } from "@/hooks/useHotel";
import { useNotifications } from "@/hooks/useNotifications";
import { useActiveModule } from "@/hooks/useActiveModule";
import { useRole } from "@/hooks/useRole";
import { MODULES } from "@/config/modules";
import { useUIStore } from "@/hooks/useUIStore";
import { Bell, ChevronDown, User, Settings, LogOut, Search, Sparkles, Clock, ShieldCheck } from "lucide-react";
import Logo from "@/components/common/logo";
import { api } from "@/lib/api";
import { cn } from "@/utils/cn";

export function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeModule } = useActiveModule();
  const { isSidebarCollapsed } = useUIStore();
  const { currentRole, enabledModules, hasPermission } = useRole();
  const currentModule = MODULES.find(m => m.id === activeModule) || MODULES[0];

  // Dropdown states
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Refs for click-outside
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Define routes that DON'T require authentication
  const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Load User Profile from Auth Token - Only on protected routes
  const { profile, isLoading: isProfileLoading, isError } = useProfile(isPublicRoute);

  const [isAuthenticated, setIsAuthenticated] = useState(!!profile);
  const [isChecking, setIsChecking] = useState(!profile && !isError && !isPublicRoute);
  
  // Load notifications
  const { notifications, unreadCount, mutate: mutateNotifications } = useNotifications();
  const [prevUnread, setPrevUnread] = useState(0);

  useEffect(() => {
    // Request permission for browser notifications on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    // Trigger a browser notification if unreadCount goes up
    if (unreadCount > prevUnread && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        const latestNotif = notifications.find((n: any) => !n.is_read);
        if (latestNotif) {
          new Notification(latestNotif.title, {
            body: latestNotif.message,
            icon: "/favicon.ico"
          });
        }
      }
    }
    setPrevUnread(unreadCount);
  }, [unreadCount, notifications, prevUnread]);

  useEffect(() => {
    if (profile) {
      setIsAuthenticated(true);
      setIsChecking(false);
    } else if (!isProfileLoading) {
      setIsChecking(false);
    }
  }, [profile, isProfileLoading]);

  const handleLogout = async () => {
    try { await api.post("/auth/logout", {}); } catch { /* best-effort */ }
    router.push("/login");
  };

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`, {});
      mutateNotifications();
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1], 
            rotate: [0, 90, 180, 270, 360],
            borderRadius: ["20%", "50%", "20%"] 
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 bg-gradient-to-tr from-primary to-blue-500 shadow-xl shadow-primary/20"
        />
      </div>
    );
  }

  const userInitials = profile?.first_name ? profile.first_name[0] + (profile.last_name ? profile.last_name[0] : "") : "US";
  const fullName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}` : "User";

  // Global Route Guard
  let isAuthorized = true;
  let denialReason = "";

  if (profile && !isPublicRoute) {
    // Find the module and nav item for the current route
    for (const mod of MODULES) {
      for (const item of mod.navItems) {
        if (item.exact ? pathname === item.href : pathname.startsWith(item.href)) {
          // 1. Check Module Subscription
          if (!mod.id.startsWith("SYSTEM_") && enabledModules && enabledModules.length > 0) {
            if (!enabledModules.includes(mod.id)) {
              isAuthorized = false;
              denialReason = `Your organization does not have an active subscription for the ${mod.label} module.`;
              break;
            }
          }
          // 2. Check Module Role Bounds
          if (mod.allowedRoles && currentRole && !mod.allowedRoles.includes(currentRole)) {
            isAuthorized = false;
            denialReason = `Your current role (${currentRole}) is not authorized to access the ${mod.label} module.`;
            break;
          }
          // 3. Check NavItem Explicit Permission
          if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
            isAuthorized = false;
            denialReason = `You require the ${item.requiredPermission} permission to access this page.`;
            break;
          }
          // 4. Check NavItem Role Bounds
          if (item.allowedRoles && currentRole && !item.allowedRoles.includes(currentRole)) {
            isAuthorized = false;
            denialReason = `Your current role (${currentRole}) is not authorized to access this specific page.`;
            break;
          }
        }
      }
      if (!isAuthorized) break;
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-8">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-500/10">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mx-auto text-lg mb-8">
          {denialReason || "Your current account permissions do not authorize you to view this page."}
        </p>
        <Link 
          href="/"
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-indigo-600/5 dark:bg-indigo-600/15 rounded-full blur-[140px]" />
      </div>

      <Sidebar />

      <motion.main 
        initial={false}
        animate={{ marginLeft: isSidebarCollapsed ? 64 : 256 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="flex-1 relative z-10 min-h-screen flex flex-col"
      >
        <header className="h-20 px-8 flex items-center justify-between border-b border-border/40 bg-background/40 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <AnimatePresence mode="popLayout">
              {isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="hidden md:block flex-shrink-0"
                >
                  <Logo className="w-auto h-7 object-contain" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="hidden md:flex relative" ref={searchRef}>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border border-border/50 rounded-2xl w-64 focus-within:w-96 focus-within:bg-card focus-within:shadow-md group focus-within:border-primary/50 transition-all duration-300 ease-out">
                <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="bg-transparent text-sm focus:outline-none w-full" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
                />
              </div>

              <AnimatePresence>
                {showSearchResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-3 w-80 bg-card/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl z-50 p-4"
                  >
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-2">Top Results</div>
                    <div className="space-y-1">
                      {[
                        { label: "Recent Bookings", sub: "Check arrivals for today", icon: Clock },
                        { label: "Inventory Audit", sub: "Verify room sync status", icon: ShieldCheck },
                        { label: "Revenue Analytics", sub: "View MTD performance", icon: Sparkles },
                      ].map((res) => (
                        <button key={res.label} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/5 transition-colors text-left group">
                          <div className="p-2 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                            <res.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{res.label}</p>
                            <p className="text-[10px] text-muted-foreground">{res.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-6 w-px bg-border/50" />
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-70">
                {currentModule.label}
              </p>
              <h2 className="text-lg font-bold truncate max-w-[200px]">
                {pathname === "/" ? "Dashboard" : (
                  (() => {
                    const exactMatch = MODULES.flatMap(m => m.navItems).find(n => n.href === pathname);
                    if (exactMatch) return exactMatch.name;
                    return "Portfolio";
                  })()
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "p-2.5 rounded-2xl transition-all relative group",
                  showNotifications ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Bell className="w-5 h-5 group-active:scale-90 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-background animate-bounce" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    ref={notifMenuRef}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-card/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden z-50 py-2"
                  >
                      <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
                        <span className="font-black text-xs uppercase tracking-widest">Notifications</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground italic text-sm">No notifications found.</div>
                        ) : (
                          notifications.map((n: any) => (
                            <div 
                              key={n.id} 
                              onClick={() => markAsRead(n.id)}
                              className={cn(
                                "px-5 py-4 hover:bg-primary/5 transition-colors cursor-pointer border-b border-border/30 last:border-0",
                                !n.is_read && "bg-primary/5"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn("w-2 h-2 rounded-full mt-1.5", !n.is_read ? "bg-primary" : "bg-transparent")} />
                                <div className="space-y-0.5">
                                  <p className="font-bold text-sm">{n.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                  <p className="text-[10px] text-muted-foreground/50 pt-1 font-medium">Just now</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <Link href="/notifications" className="block text-center py-3 text-xs font-bold text-primary hover:bg-primary/5 transition-colors">
                        View all activity
                      </Link>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            <div className="relative ml-2">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 pl-1.5 pr-3 py-1.5 bg-card border border-border/60 hover:border-primary/40 rounded-2xl transition-all shadow-sm group active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-xs font-black text-white shadow-md shadow-primary/20">
                  {userInitials}
                </div>
                <div className="hidden sm:block text-left mr-1">
                  <p className="text-xs font-black leading-tight">{isProfileLoading ? "Loading..." : fullName}</p>
                  <p className="text-[10px] text-muted-foreground font-medium opacity-70 capitalize">{profile?.role?.replace("_", " ") || "Admin"}</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", showUserMenu && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    ref={userMenuRef}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-card/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden z-50 py-2"
                  >
                      <div className="px-4 py-3 border-b border-border/50 mb-1">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">My Account</p>
                      </div>
                      {[
                        { icon: User, label: "Profile", href: "/profile" },
                        { icon: Settings, label: "Settings", href: "/settings" },
                        { icon: Sparkles, label: "Achievements", href: "/achievements" },
                      ].map((item) => (
                        <Link 
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="h-px bg-border/50 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/5 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
