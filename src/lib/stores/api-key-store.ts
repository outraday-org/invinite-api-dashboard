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
            hasHydrated: typeof window === "undefined",
            markHydrated: () => set({ hasHydrated: true }),
            setApiKey: apiKey =>
                set({
                    apiKey: apiKey?.trim() ? apiKey.trim() : null,
                    apiKeyUpdatedAt: Date.now(),
                }),
        }),
        {
            name: "invinite-api-key",
            onRehydrateStorage: () => (state) => {
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
