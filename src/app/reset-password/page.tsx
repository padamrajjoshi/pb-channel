"use client";

import React, { useState, useEffect } from "react";
import { Lock, Loader2, CheckCircle2, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { api, handleApiError } from "@/lib/api";
import Logo from "@/components/common/logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setIsSuccess(true);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden transition-colors duration-300">
      {/* Premium Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 dark:bg-blue-600/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 dark:bg-indigo-600/10 blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg relative z-10 p-4"
      >
        <div className="bg-card/40 dark:bg-card/30 backdrop-blur-3xl border border-border dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

          <div className="flex flex-col items-center mb-10">
            <Logo className="h-10 w-auto mb-8" />
            
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight mb-2">
                Secure Password Reset
              </h1>
              <p className="text-muted-foreground font-medium text-sm">
                Set a new password for your account
              </p>
            </div>
          </div>

          {!isSuccess ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl text-sm font-medium flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">
                  New Access Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-muted/30 border border-border rounded-2xl py-4 pl-12 pr-12 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-muted/30 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <button
                disabled={isLoading || !token}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Update Password</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold mb-3">Password Updated</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Your password has been changed successfully. You can now use your new credentials to access the portal.
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20"
              >
                Return to Login
              </button>
            </motion.div>
          )}
        </div>

        <p className="text-center mt-8 text-muted-foreground/60 text-xs font-medium uppercase tracking-widest">
          PEBIGLOBE &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
