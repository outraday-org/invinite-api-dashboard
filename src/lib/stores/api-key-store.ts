import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ApiKeyState = {
    apiKey: null | string;
    apiKeyUpdatedAt: number;
    hasHydrated: boolean;
    clearApiKey: () => void;
    markHydrated: () => void;
    setApiKey: (apiKey: null | string) => void;
};

const inMemoryStorage = {
    getItem: (_name: string) => null,
    removeItem: (_name: string) => {},
    setItem: (_name: string, _value: string) => {},
};

const storage = createJSONStorage(() =>
    typeof window !== "undefined" ? window.localStorage : inMemoryStorage,
);

export const useApiKeyStore = create<ApiKeyState>()(
    persist(
        set => ({
            apiKey: null,
            apiKeyUpdatedAt: 0,
            clearApiKey: () =>
                set({
                    apiKey: null,
                    apiKeyUpdatedAt: Date.now(),
                }),
            // Important for SSR: server + first client render must match.
            // We only consider the store "hydrated" once localStorage has been read in the browser.
            hasHydrated: false,
            markHydrated: () => {
                if (typeof window === "undefined") return;

                set({ hasHydrated: true });
            },
            setApiKey: apiKey =>
                set({
                    apiKey: apiKey?.trim() ? apiKey.trim() : null,
                    apiKeyUpdatedAt: Date.now(),
                }),
        }),
        {
            name: "invinite-api-key",
            onRehydrateStorage: () => (state) => {
                if (typeof window === "undefined") return;

                state?.markHydrated();
            },
            partialize: state => ({
                apiKey: state.apiKey,
                apiKeyUpdatedAt: state.apiKeyUpdatedAt,
            }),
            storage,
        },
    ),
);
