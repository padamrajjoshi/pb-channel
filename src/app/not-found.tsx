"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Ghost } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  React.useEffect(() => {
    const handlePopState = () => {
      window.location.reload();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden text-foreground">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Floating Icon */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex justify-center"
        >
          <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 backdrop-blur-md shadow-2xl">
            <Ghost className="w-24 h-24 text-primary" />
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/30"
          >
            404
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-bold">Lost in the Cloud?</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              The page you are looking for has either been moved or doesn't exist in our ecosystem.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold transition-all hover:scale-105 shadow-lg shadow-primary/20"
          >
            <Home className="w-5 h-5" />
            Return to Dashboard
          </Link>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold transition-all hover:bg-secondary/80 border border-border group opacity-70 hover:opacity-100"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
        </motion.div>

        {/* Branded Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-30"
        >
          PEBIGLOBE CLOUD ECOSYSTEM
        </motion.div>
      </div>
    </div>
  );
}
