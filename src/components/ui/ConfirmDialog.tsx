"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, AlertCircle, Info } from "lucide-react";
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[99998]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-[99999] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl w-full max-w-md pointer-events-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    type === "danger" && "bg-rose-500/10 text-rose-500",
                    type === "warning" && "bg-amber-500/10 text-amber-500",
                    type === "info" && "bg-blue-500/10 text-blue-500"
                  )}>
                    {type === "danger" && <AlertCircle className="w-6 h-6" />}
                    {type === "warning" && <AlertTriangle className="w-6 h-6" />}
                    {type === "info" && <Info className="w-6 h-6" />}
                  </div>
                  <button 
                    onClick={onCancel}
                    className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="p-6 bg-muted/30 border-t border-border flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card font-bold text-sm hover:bg-muted transition-all active:scale-95"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 text-white shadow-lg",
                    type === "danger" && "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20",
                    type === "warning" && "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20",
                    type === "info" && "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                  )}
                >
                  {isLoading ? "Processing..." : confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
