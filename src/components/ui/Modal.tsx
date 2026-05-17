"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-xl z-0"
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4 text-center z-10 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-xl transform overflow-hidden rounded-[2.5rem] bg-card border border-border/60 p-0 text-left align-middle shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] transition-all"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-border/40 flex items-center justify-between bg-muted/20 backdrop-blur-sm">
                <h3 className="text-2xl font-black tracking-tight text-foreground">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-muted rounded-2xl text-muted-foreground hover:text-foreground transition-all active:scale-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 max-h-[80vh] overflow-y-auto no-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
