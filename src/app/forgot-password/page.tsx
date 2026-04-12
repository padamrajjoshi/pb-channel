"use client";

import React, { useState } from "react";
import { MoveLeft, Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, handleApiError } from "@/lib/api";
import Logo from "@/components/common/logo";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email });
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
                Account Recovery
              </h1>
              <p className="text-muted-foreground font-medium text-sm">
                Enter your work email to reset your credentials
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
                <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">
                  Work Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-muted/30 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Link</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold"
              >
                <MoveLeft className="w-4 h-4" />
                Back to Login
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
              <h2 className="text-xl font-bold mb-3">Check Your Email</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                If an account exists for <span className="text-foreground font-semibold">{email}</span>, you will receive a password reset link shortly.
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full bg-muted hover:bg-muted/80 text-foreground font-bold py-4 rounded-2xl transition-all"
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
