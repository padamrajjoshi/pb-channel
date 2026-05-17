"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "info",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-background/60 backdrop-blur-xl z-0"
          />

          {/* Dialog Container */}
          <div className="flex min-h-full items-center justify-center p-4 text-center z-10 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-card border border-border/60 p-8 text-left align-middle shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] transition-all"
            >
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner transition-transform hover:scale-110",
                  type === "danger" && "bg-rose-500/10 text-rose-500",
                  type === "warning" && "bg-amber-500/10 text-amber-500",
                  type === "info" && "bg-primary/10 text-primary"
                )}>
                  {type === "danger" && <AlertCircle className="w-8 h-8" />}
                  {type === "warning" && <AlertTriangle className="w-8 h-8" />}
                  {type === "info" && <Info className="w-8 h-8" />}
                </div>
                <button 
                  onClick={onCancel}
                  className="p-3 hover:bg-muted rounded-2xl text-muted-foreground transition-all active:scale-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black tracking-tight text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3.5 rounded-2xl border border-border bg-card font-black text-sm hover:bg-muted transition-all active:scale-[0.98] shadow-sm"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 px-6 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-[0.98] text-white shadow-2xl flex items-center justify-center gap-2",
                    type === "danger" && "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30",
                    type === "warning" && "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30",
                    type === "info" && "bg-primary hover:bg-primary/90 shadow-primary/30"
                  )}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Processing..." : confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
