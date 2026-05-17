"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className, ...props }: InputProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
            "placeholder:text-muted-foreground/40",
            "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon && "pl-11",
            error && "border-destructive focus:ring-destructive/10",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] font-bold text-destructive ml-1">{error}</p>}
    </div>
  );
}
