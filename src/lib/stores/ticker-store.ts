import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TickerState = {
    hasHydrated: boolean;
    lastTicker: null | string;
    markHydrated: () => void;
    setLastTicker: (ticker: null | string) => void;
};

const inMemoryStorage = {
    getItem: (_name: string) => null,
    removeItem: (_name: string) => {},
    setItem: (_name: string, _value: string) => {},
};

const storage = createJSONStorage(() =>
    typeof window !== "undefined" ? window.localStorage : inMemoryStorage,
);

export const useTickerStore = create<TickerState>()(
    persist(
        set => ({
            hasHydrated: false,
            lastTicker: null,
            markHydrated: () => {
                if (typeof window === "undefined") return;

                set({ hasHydrated: true });
            },
            setLastTicker: ticker =>
                set({
                    lastTicker: ticker?.trim() ? ticker.trim().toUpperCase() : null,
                }),
        }),
        {
            name: "invinite-last-ticker",
            onRehydrateStorage: () => (state) => {
                if (typeof window === "undefined") return;

                state?.markHydrated();
            },
            partialize: state => ({
                lastTicker: state.lastTicker,
            }),
            storage,
        },
    ),
);
