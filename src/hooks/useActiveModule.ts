import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ModuleID } from "@/config/modules";

interface ActiveModuleState {
  activeModule: ModuleID;
  setActiveModule: (module: ModuleID) => void;
}

export const useActiveModule = create<ActiveModuleState>()(
  persist(
    (set) => ({
      activeModule: "pms",
      setActiveModule: (module) => set({ activeModule: module }),
    }),
    {
      name: "active-module-storage",
    }
  )
);
