"use client";

import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { MODULES, ModuleID } from "@/config/modules";
import { useActiveModule } from "@/hooks/useActiveModule";

export function ModuleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeModule, setActiveModule } = useActiveModule();
  
  const currentModule = MODULES.find(m => m.id === activeModule) || MODULES[0];

  return (
    <div className="relative px-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/30 hover:bg-sidebar-accent/50 border border-sidebar-border transition-all duration-300 group"
      >
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20">
          <currentModule.icon className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-0.5">
            Module
          </p>
          <p className="text-sm font-semibold text-sidebar-foreground truncate">
            {currentModule.label}
          </p>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-sidebar-foreground/30 transition-transform duration-300",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[60]" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute left-4 right-4 mt-2 z-[70] bg-sidebar/95 backdrop-blur-xl border border-sidebar-border rounded-2xl shadow-2xl overflow-hidden p-2"
            >
              {MODULES.map((module) => {
                const isActive = module.id === activeModule;
                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      setActiveModule(module.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-sidebar-primary/10 text-sidebar-primary" 
                        : "hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-accent group-hover:bg-sidebar-primary/20"
                    )}>
                      <module.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold">{module.label}</p>
                      <p className="text-[10px] opacity-60 truncate w-32">{module.description}</p>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-sidebar-primary" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
