"use client";

import React, { useState } from "react";
import { MoveRight, Lock, Mail, Key, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api, handleApiError } from "@/lib/api";
import Logo from "@/components/common/logo";

export default function StaffLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Load remembered email on mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post("/auth/staff/login", { email, password });
      setTempToken(response.data.temp_token);
      setStep("otp");
      setResendTimer(60); // Start cooldown on first arrival
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/auth/staff/resend-otp", { temp_token: tempToken });
      setSuccess("A new code has been sent to your email.");
      setResendTimer(60);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post("/auth/staff/verify-2fa", {
        temp_token: tempToken,
        otp,
        captcha_token: null
      });

      const { access_token, refresh_token } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      // Save or remove email based on rememberMe
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      router.push("/");
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

      {/* Animated Subtle Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] dark:opacity-[0.03] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10 p-4"
      >
        <div className="bg-card/40 dark:bg-card/30 backdrop-blur-3xl border border-border dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Accent glow line at the top */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 dark:opacity-80" />

          <div className="flex flex-col items-center mb-12">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Logo className="w-auto h-12" />
            </motion.div>

            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                Staff Portal
              </h1>
              <p className="text-muted-foreground font-medium text-sm flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Secure Channel synchronization access
              </p>
            </div>
          </div>

          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl text-sm font-medium mb-8 flex items-center gap-3 border ${
                error 
                  ? "bg-destructive/10 border-destructive/20 text-destructive" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${error ? "bg-destructive" : "bg-emerald-500"}`} />
              {error || success}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === "credentials" ? (
              <motion.form
                key="credentials"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleLoginSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">
                    Work Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your work email"
                      className="w-full bg-muted/30 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold ml-1">
                    Access Password
                  </label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-muted/30 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border border-border rounded-lg bg-muted/30 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer" 
                      />
                      <ShieldCheck className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => router.push("/forgot-password")}
                    className="text-xs text-blue-500 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Continue to Access</span>
                      <MoveRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleOtpSubmit}
                className="space-y-8 flex flex-col items-center"
              >
                <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/10 w-full">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Check your email for the verification code <br />
                    <span className="text-foreground font-semibold">{email}</span>
                  </p>
                </div>

                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center mb-1 px-1">
                    <label htmlFor="otp" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                      6-Digit OTP
                    </label>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || isLoading}
                      onClick={handleResendOtp}
                      className="text-[11px] font-bold text-blue-500 hover:text-blue-400 disabled:text-muted-foreground/50 transition-colors uppercase tracking-wider"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                      placeholder="000000"
                      className="w-full bg-muted/30 border border-border rounded-2xl py-5 pl-12 pr-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-center tracking-[0.6em] font-mono text-2xl font-bold"
                    />
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <button
                    disabled={isLoading || otp.length !== 6}
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Authentication"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2 font-medium"
                  >
                    Change credentials or email
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-muted-foreground/60 text-xs font-medium"
        >
          All Right Reserved by PEBIGLOBE &copy; 2026
        </motion.p>
      </motion.div>
    </div>
  );
}
