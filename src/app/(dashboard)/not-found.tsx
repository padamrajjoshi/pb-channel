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
    <div className="flex flex-col items-center justify-center py-20 text-foreground">
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Floating Icon */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex justify-center"
        >
          <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 backdrop-blur-sm shadow-xl">
            <Ghost className="w-16 h-16 text-primary" />
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl font-black tracking-tighter text-foreground/20"
          >
            404
          </motion.h1>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              This part of the dashboard doesn't seem to exist.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center pt-4"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-primary/20 text-sm"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
