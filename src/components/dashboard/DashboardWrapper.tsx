"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useProfile } from "@/hooks/useHotel";

export function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Define routes that DON'T require authentication
  const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Load User Profile from Auth Token - Only on protected routes
  const { profile, isLoading: isProfileLoading, isError } = useProfile(isPublicRoute);

  useEffect(() => {
    if (isProfileLoading) return;

    // Only do full session-clear on a genuine 401 Unauthorized.
    // Network errors or 5xx should NOT trigger logout (token could still be valid).
    const isUnauthorized = isError && (isError?.status === 401 || isError?.response?.status === 401);

    const clearSessionAndRedirect = async () => {
      // Tell the backend to blocklist the JTI and send delete_cookie headers
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      } catch { /* ignore — don't block redirect on network failure */ }
      // Client-side cookie expiry as safety net
      document.cookie = "access_token=; Max-Age=0; path=/;";
      document.cookie = "refresh_token=; Max-Age=0; path=/;";
      router.push("/login");
    };

    if (isUnauthorized) {
      setIsAuthenticated(false);
      setIsChecking(false);
      clearSessionAndRedirect();
      return;
    }

    // Non-401 error (network blip, 5xx) — don't destroy the session, just wait
    if (isError && !isUnauthorized) {
      setIsChecking(false);
      return;
    }

    if (profile && isPublicRoute) {
      // Already logged in — bounce away from /login
      router.push("/");
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    if (!profile && !isPublicRoute) {
      // Profile not loaded yet or genuinely unauthenticated.
      // Just redirect — do NOT call logout (would blocklist a valid token on re-render).
      router.push("/login");
      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }

    if (profile) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, [router, pathname, isPublicRoute, profile, isProfileLoading, isError]);


  // If it's a public route (like login), just render children directly without the dashboard sidebar
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Prevent flash of content during checking
  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/20"
        />
      </div>
    );
  }

  const userInitials = profile?.first_name ? profile.first_name[0] + (profile.last_name ? profile.last_name[0] : "") : "US";
  const fullName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}` : "Hi User!";

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Dynamic background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <Sidebar />

      <main className="flex-1 ml-64 p-8 relative">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1">
              Admin Panel
            </h2>
            <h1 className="text-3xl font-bold">Channel Manager</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-card border border-border rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                {userInitials}
              </div>
              <div className="text-xs">
                <p className="font-medium">{isProfileLoading ? "Hi User!" : fullName}</p>
                <p className="text-muted-foreground capitalize">{profile?.role?.replace("_", " ") || "Admin"}</p>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
