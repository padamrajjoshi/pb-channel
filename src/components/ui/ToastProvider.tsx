"use client";

import React, { useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContext, Toast, ToastType } from "@/hooks/useToast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/utils/cn";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const helpers = {
    toast: addToast,
    success: (msg: string, dur?: number) => addToast(msg, "success", dur),
    error: (msg: string, dur?: number) => addToast(msg, "error", dur),
    info: (msg: string, dur?: number) => addToast(msg, "info", dur),
    warning: (msg: string, dur?: number) => addToast(msg, "warning", dur),
  };

  return (
    <ToastContext.Provider value={helpers}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 20, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto p-5 rounded-[1.5rem] border shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] flex items-center gap-4 backdrop-blur-xl transition-all relative overflow-hidden",
                t.type === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10",
                t.type === "error" && "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-rose-500/10",
                t.type === "warning" && "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-amber-500/10",
                t.type === "info" && "bg-primary/10 border-primary/20 text-primary dark:text-primary-foreground shadow-primary/10"
              )}
            >
              {/* Progress bar effect (simulated) */}
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (t.duration || 5000) / 1000, ease: "linear" }}
                className={cn(
                  "absolute bottom-0 left-0 h-1 opacity-30",
                  t.type === "success" && "bg-emerald-500",
                  t.type === "error" && "bg-rose-500",
                  t.type === "warning" && "bg-amber-500",
                  t.type === "info" && "bg-primary"
                )}
              />

              <div className="flex-shrink-0">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                  t.type === "success" && "bg-emerald-500/20",
                  t.type === "error" && "bg-rose-500/20",
                  t.type === "warning" && "bg-amber-500/20",
                  t.type === "info" && "bg-primary/20"
                )}>
                  {t.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                  {t.type === "error" && <AlertCircle className="w-5 h-5" />}
                  {t.type === "warning" && <AlertTriangle className="w-5 h-5" />}
                  {t.type === "info" && <Info className="w-5 h-5" />}
                </div>
              </div>
              
              <div className="flex-1 pr-2">
                <p className="text-sm font-black leading-tight tracking-tight">
                  {t.message}
                </p>
              </div>

              <button 
                onClick={() => removeToast(t.id)}
                className="text-muted-foreground/30 hover:text-foreground hover:bg-muted p-1.5 rounded-lg transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
