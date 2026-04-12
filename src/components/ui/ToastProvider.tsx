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
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={cn(
                "pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start gap-3 backdrop-blur-xl transition-all",
                t.type === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                t.type === "error" && "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
                t.type === "warning" && "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
                t.type === "info" && "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
              )}
            >
              <div className="mt-0.5">
                {t.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                {t.type === "error" && <AlertCircle className="w-5 h-5" />}
                {t.type === "warning" && <AlertTriangle className="w-5 h-5" />}
                {t.type === "info" && <Info className="w-5 h-5" />}
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                  {t.message}
                </p>
              </div>

              <button 
                onClick={() => removeToast(t.id)}
                className="text-muted-foreground/50 hover:text-foreground transition-colors"
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
