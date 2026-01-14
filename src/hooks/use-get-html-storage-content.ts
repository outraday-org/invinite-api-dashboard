import { useQuery } from "@tanstack/react-query";

export const useGetHtmlStorageContent = (url: null | string | undefined) => {
    const queryResult = useQuery<{ text: null | string }>({
        enabled: Boolean(url),
        gcTime: 5 * 60 * 1000,
        queryFn: async () => {
            if (!url) return { text: null };

            // Do not send credentials for public/signed storage URLs to avoid CORS issues
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
            }

            const text = await res.text();

            return { text };
        },
        queryKey: ["htmlStorageContent", { url }],
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });

    const { data, ...rest } = queryResult;

    return { text: data?.text ?? null, ...rest };
};
