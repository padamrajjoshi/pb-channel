"use client";

import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We encountered an unexpected error while loading this workspace. 
          {error.message && <span className="block mt-1 italic text-xs">"{error.message}"</span>}
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
      >
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
