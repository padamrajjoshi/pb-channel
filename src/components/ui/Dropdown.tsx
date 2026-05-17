"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface DropdownOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | number | null;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function Dropdown({ options, value, onChange, placeholder = "Select...", className, label }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      {label && <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
          isOpen && "border-primary ring-2 ring-primary/10 shadow-lg shadow-primary/5"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          <span className={cn(selectedOption ? "text-foreground font-bold" : "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden py-1.5"
          >
            <div className="max-h-60 overflow-y-auto no-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all hover:bg-primary/10",
                    option.value === value ? "text-primary font-bold bg-primary/5" : "text-foreground/70"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  {option.value === value && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
