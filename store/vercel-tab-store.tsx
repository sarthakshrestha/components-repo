import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TabState {
  activeTabs: Record<string, string>;
  setActiveTab: (key: string, tabId: string) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set) => ({
      activeTabs: {},
      setActiveTab: (key, tabId) =>
        set((state) => ({
          activeTabs: { ...state.activeTabs, [key]: tabId },
        })),
    }),
    {
      name: "tab-storage",
    }
  )
);
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TabState {
  activeTabs: Record<string, string>;
  setActiveTab: (key: string, tabId: string) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set) => ({
      activeTabs: {},
      setActiveTab: (key, tabId) =>
        set((state) => ({
          activeTabs: { ...state.activeTabs, [key]: tabId },
        })),
    }),
    {
      name: "tab-storage",
    }
  )
);
