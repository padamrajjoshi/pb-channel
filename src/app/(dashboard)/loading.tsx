"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-10 w-64 bg-white/5 rounded-xl" />
        <div className="h-4 w-96 bg-white/5 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white/5 border border-white/10 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px] bg-white/5 border border-white/10 rounded-3xl" />
        <div className="h-[400px] bg-white/5 border border-white/10 rounded-3xl" />
      </div>
    </div>
  );
}
