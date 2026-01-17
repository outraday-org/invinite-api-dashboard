import type { InfiniteData } from "@tanstack/react-query";

import { queryOptions, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";

import { useApiKeyStore } from "@/lib/stores/api-key-store";

import type {
    CagrPeriodYears,
    DividendsResponse,
    FilingsResponse,
    FiscalPeriodType,
    GrowthType,
    RatioCategory,
    SegmentedFinancialsSegmentId,
    SplitsResponse,
    StatementType,
} from "./types";

import {
    getAsReportedFinancialsPresentation,
    getAvailableFormTypes,
    getCompanyDetails,
    getCompanyDividends,
    getCompanySplits,
    getFilings,
    getFinancialCagr,
    getFinancialGrowth,
    getFinancialRatios,
    getSegmentedFinancials,
    getStandardizedFinancials,
    searchCompanies,
} from "./server-functions";

function useApiKey() {
    const apiKey = useApiKeyStore(s => s.apiKey);

    const apiKeyUpdatedAt = useApiKeyStore(s => s.apiKeyUpdatedAt);

    const hasHydrated = useApiKeyStore(s => s.hasHydrated);

    return {
        apiKey,
        apiKeyUpdatedAt,
        hasHydrated,
    };
}

// Query options
export const companySearchOptions = (query: string) =>
    queryOptions({
        enabled: query.trim().length > 0,
        queryFn: () => searchCompanies({ data: { query } }),
        queryKey: ["company", "search", query],
        staleTime: 5 * 60 * 1000,
    });

export const companyDetailsOptions = (identifier: string) =>
    queryOptions({
        enabled: identifier.trim().length > 0,
        queryFn: () => getCompanyDetails({ data: { identifier } }),
        queryKey: ["company", "details", identifier],
        staleTime: 5 * 60 * 1000,
    });

type FilingsQueryInput = {
    formType?: string;
    identifier: string;
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
};

export const filingsOptions = (input: FilingsQueryInput) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getFilings({ data: input }),
        queryKey: [
            "filings",
            input.identifier,
            input.formType ?? "all",
            input.sort ?? "desc",
            input.limit ?? 40,
            input.offset ?? 0,
        ],
        staleTime: 10 * 60 * 1000,
    });

type AvailableFormTypesInput = {
    identifier: string;
};

type DividendsQueryInput = {
    endDate?: string;
    identifier: string;
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
    startDate?: string;
};

export const availableFormTypesOptions = (input: AvailableFormTypesInput) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getAvailableFormTypes({ data: input }),
        queryKey: ["filings", "available-form-types", input.identifier],
        staleTime: 10 * 60 * 1000,
    });

type SplitsQueryInput = {
    identifier: string;
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
};

export const dividendsOptions = (input: DividendsQueryInput) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getCompanyDividends({ data: input }),
        queryKey: [
            "dividends",
            input.identifier,
            input.startDate ?? "all",
            input.endDate ?? "all",
            input.sort ?? "desc",
            input.limit ?? 40,
            input.offset ?? 0,
        ],
        staleTime: 10 * 60 * 1000,
    });

export const splitsOptions = (input: SplitsQueryInput) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getCompanySplits({ data: input }),
        queryKey: [
            "splits",
            input.identifier,
            input.sort ?? "desc",
            input.limit ?? 40,
            input.offset ?? 0,
        ],
        staleTime: 10 * 60 * 1000,
    });

type StandardizedFinancialsInput = {
    fiscalPeriodType: FiscalPeriodType;
    identifier: string;
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
    statement: StatementType;
};

export const standardizedFinancialsOptions = (input: StandardizedFinancialsInput) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getStandardizedFinancials({ data: input }),
        queryKey: [
            "standardized",
            input.statement,
            input.identifier,
            input.fiscalPeriodType,
            input.sort ?? "desc",
            input.limit ?? 8,
            input.offset ?? 0,
        ],
        staleTime: 5 * 60 * 1000,
    });

type AsReportedFinancialsPresentationInput = StandardizedFinancialsInput;

export const asReportedFinancialsPresentationOptions = (
    input: AsReportedFinancialsPresentationInput,
) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getAsReportedFinancialsPresentation({ data: input }),
        queryKey: [
            "as-reported",
            "presentation",
            input.statement,
            input.identifier,
            input.fiscalPeriodType,
            input.sort ?? "desc",
            input.limit ?? 8,
            input.offset ?? 0,
        ],
        staleTime: 5 * 60 * 1000,
    });

type SegmentedFinancialsInput = {
    fiscalPeriodType: FiscalPeriodType;
    identifier: string;
    limit?: number;
    offset?: number;
    segmentId?: SegmentedFinancialsSegmentId;
    sort?: "asc" | "desc";
};

type FinancialRatiosInput = {
    category?: RatioCategory;
    fiscalPeriodType: FiscalPeriodType;
    identifier: string;
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
};

type FinancialGrowthInput = {
    fiscalPeriodType: FiscalPeriodType;
    growthType?: GrowthType;
    identifier: string;
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
};

type FinancialCagrInput = {
    identifier: string;
    limit?: number;
    offset?: number;
    periodYears?: CagrPeriodYears;
    sort?: "asc" | "desc";
};

export const segmentedFinancialsOptions = (input: SegmentedFinancialsInput) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getSegmentedFinancials({ data: input }),
        queryKey: [
            "segmented-financials",
            input.identifier,
            input.fiscalPeriodType,
            input.segmentId ?? "all",
            input.sort ?? "desc",
            input.limit ?? 8,
            input.offset ?? 0,
        ],
        staleTime: 5 * 60 * 1000,
    });

export const financialRatiosOptions = (input: FinancialRatiosInput) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getFinancialRatios({ data: input }),
        queryKey: [
            "financial-metrics",
            "ratios",
            input.identifier,
            input.fiscalPeriodType,
            input.category ?? "all",
            input.sort ?? "desc",
            input.limit ?? 8,
            input.offset ?? 0,
        ],
        staleTime: 5 * 60 * 1000,
    });

export const financialGrowthOptions = (input: FinancialGrowthInput) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getFinancialGrowth({ data: input }),
        queryKey: [
            "financial-metrics",
            "growth",
            input.identifier,
            input.fiscalPeriodType,
            input.growthType ?? "all",
            input.sort ?? "desc",
            input.limit ?? 8,
            input.offset ?? 0,
        ],
        staleTime: 5 * 60 * 1000,
    });

export const financialCagrOptions = (input: FinancialCagrInput) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getFinancialCagr({ data: input }),
        queryKey: [
            "financial-metrics",
            "cagr",
            input.identifier,
            input.periodYears ?? "all",
            input.sort ?? "desc",
            input.limit ?? 8,
            input.offset ?? 0,
        ],
        staleTime: 5 * 60 * 1000,
    });

// Helper to show error toast
function useErrorToast(error: Error | null, message: string) {
    React.useEffect(() => {
        if (error) {
            toast.error(message, {
                description: error.message,
            });
        }
    }, [error, message]);
}

// Hooks with error handling
export function useCompanySearch(query: string) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const result = useQuery(
        queryOptions({
            ...companySearchOptions(query),
            enabled: hasHydrated && query.trim().length > 0,
            queryFn: () => searchCompanies({ data: { apiKey: apiKey ?? undefined, query } }),
            queryKey: [...companySearchOptions(query).queryKey, String(apiKeyUpdatedAt)],
        }),
    );

    useErrorToast(result.error, "Failed to search companies");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useCompanyDetails(identifier: string) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const result = useQuery(
        queryOptions({
            ...companyDetailsOptions(identifier),
            enabled: hasHydrated && identifier.trim().length > 0,
            queryFn: () =>
                getCompanyDetails({ data: { apiKey: apiKey ?? undefined, identifier } }),
            queryKey: [...companyDetailsOptions(identifier).queryKey, String(apiKeyUpdatedAt)],
        }),
    );

    useErrorToast(result.error, "Failed to load company details");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useFilings(input: FilingsQueryInput) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const result = useQuery(
        queryOptions({
            ...filingsOptions(input),
            enabled: hasHydrated && input.identifier.trim().length > 0,
            queryFn: () =>
                getFilings({ data: { ...input, apiKey: apiKey ?? undefined } }),
            queryKey: [...filingsOptions(input).queryKey, String(apiKeyUpdatedAt)],
        }),
    );

    useErrorToast(result.error, "Failed to load filings");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useAvailableFormTypes(input: AvailableFormTypesInput) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const result = useQuery(
        queryOptions({
            ...availableFormTypesOptions(input),
            enabled: hasHydrated && input.identifier.trim().length > 0,
            queryFn: () =>
                getAvailableFormTypes({ data: { ...input, apiKey: apiKey ?? undefined } }),
            queryKey: [...availableFormTypesOptions(input).queryKey, String(apiKeyUpdatedAt)],
        }),
    );

    useErrorToast(result.error, "Failed to load form types");

    return {
        ...result,
        data: result.data,
    };
}

type FilingsInfiniteInput = Omit<FilingsQueryInput, "offset"> & {
    limit: number;
};

type DividendsInfiniteInput = Omit<DividendsQueryInput, "offset"> & {
    limit: number;
};

type SplitsInfiniteInput = Omit<SplitsQueryInput, "offset"> & {
    limit: number;
};

export function useFilingsInfinite(input: FilingsInfiniteInput) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const queryKey = [
        "filings",
        "infinite",
        input.identifier,
        input.formType ?? "all",
        input.sort ?? "desc",
        input.limit,
        String(apiKeyUpdatedAt),
    ] as const;

    const result = useInfiniteQuery<
        FilingsResponse,
        Error,
        InfiniteData<FilingsResponse, number>,
        typeof queryKey,
        number
    >({
        enabled: hasHydrated && input.identifier.trim().length > 0,
        getNextPageParam: (lastPage: FilingsResponse) => {
            const nextUrl = lastPage.companies[0]?.next_url;

            if (!nextUrl) return undefined;

            let nextOffset: null | number = null;

            try {
                const parsed = new URL(nextUrl, "http://localhost");

                const offsetParam = parsed.searchParams.get("offset");

                if (offsetParam) nextOffset = Number(offsetParam);
            }
            catch {
                nextOffset = null;
            }

            if (nextOffset === null || Number.isNaN(nextOffset)) return undefined;

            return nextOffset;
        },
        initialPageParam: 0,
        queryFn: ({ pageParam }) =>
            getFilings({
                data: {
                    ...input,
                    apiKey: apiKey ?? undefined,
                    offset: Number(pageParam) || 0,
                },
            }),
        queryKey,
        staleTime: 10 * 60 * 1000,
    });

    useErrorToast(result.error, "Failed to load filings");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useDividendsInfinite(input: DividendsInfiniteInput) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const queryKey = [
        "dividends",
        "infinite",
        input.identifier,
        input.startDate ?? "all",
        input.endDate ?? "all",
        input.sort ?? "desc",
        input.limit,
        String(apiKeyUpdatedAt),
    ] as const;

    const result = useInfiniteQuery<
        DividendsResponse,
        Error,
        InfiniteData<DividendsResponse, number>,
        typeof queryKey,
        number
    >({
        enabled: hasHydrated && input.identifier.trim().length > 0,
        getNextPageParam: (lastPage: DividendsResponse) => {
            const nextUrl = lastPage.companies[0]?.next_url;

            if (!nextUrl) return undefined;

            const parsed = new URL(nextUrl, "http://local");

            const offset = parsed.searchParams.get("offset");

            if (!offset) return undefined;

            const parsedOffset = Number(offset);

            return Number.isNaN(parsedOffset) ? undefined : parsedOffset;
        },
        initialPageParam: 0,
        queryFn: ({ pageParam }) =>
            getCompanyDividends({
                data: {
                    ...input,
                    apiKey: apiKey ?? undefined,
                    offset: Number(pageParam) || 0,
                },
            }),
        queryKey,
        staleTime: 10 * 60 * 1000,
    });

    useErrorToast(result.error, "Failed to load dividends");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useSplitsInfinite(input: SplitsInfiniteInput) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const queryKey = [
        "splits",
        "infinite",
        input.identifier,
        input.sort ?? "desc",
        input.limit,
        String(apiKeyUpdatedAt),
    ] as const;

    const result = useInfiniteQuery<
        SplitsResponse,
        Error,
        InfiniteData<SplitsResponse, number>,
        typeof queryKey,
        number
    >({
        enabled: hasHydrated && input.identifier.trim().length > 0,
        getNextPageParam: (lastPage: SplitsResponse) => {
            const nextUrl = lastPage.companies[0]?.next_url;

            if (!nextUrl) return undefined;

            const parsed = new URL(nextUrl, "http://local");

            const offset = parsed.searchParams.get("offset");

            if (!offset) return undefined;

            const parsedOffset = Number(offset);

            return Number.isNaN(parsedOffset) ? undefined : parsedOffset;
        },
        initialPageParam: 0,
        queryFn: ({ pageParam }) =>
            getCompanySplits({
                data: {
                    ...input,
                    apiKey: apiKey ?? undefined,
                    offset: Number(pageParam) || 0,
                },
            }),
        queryKey,
        staleTime: 10 * 60 * 1000,
    });

    useErrorToast(result.error, "Failed to load stock splits");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useStandardizedFinancials(input: StandardizedFinancialsInput) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const result = useQuery(
        queryOptions({
            ...standardizedFinancialsOptions(input),
            enabled: hasHydrated && input.identifier.trim().length > 0,
            queryFn: () =>
                getStandardizedFinancials({ data: { ...input, apiKey: apiKey ?? undefined } }),
            queryKey: [...standardizedFinancialsOptions(input).queryKey, String(apiKeyUpdatedAt)],
        }),
    );

    useErrorToast(result.error, "Failed to load financials");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useAsReportedFinancialsPresentation(
    input: AsReportedFinancialsPresentationInput,
) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const result = useQuery(
        queryOptions({
            ...asReportedFinancialsPresentationOptions(input),
            enabled: hasHydrated && input.identifier.trim().length > 0,
            queryFn: () =>
                getAsReportedFinancialsPresentation({ data: { ...input, apiKey: apiKey ?? undefined } }),
            queryKey: [
                ...asReportedFinancialsPresentationOptions(input).queryKey,
                String(apiKeyUpdatedAt),
            ],
        }),
    );

    useErrorToast(result.error, "Failed to load as-reported financials");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useSegmentedFinancials(input: SegmentedFinancialsInput) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const result = useQuery(
        queryOptions({
            ...segmentedFinancialsOptions(input),
            enabled: hasHydrated && input.identifier.trim().length > 0,
            queryFn: () =>
                getSegmentedFinancials({ data: { ...input, apiKey: apiKey ?? undefined } }),
            queryKey: [...segmentedFinancialsOptions(input).queryKey, String(apiKeyUpdatedAt)],
        }),
    );

    useErrorToast(result.error, "Failed to load segmented financials");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useFinancialRatios(input: FinancialRatiosInput) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const result = useQuery(
        queryOptions({
            ...financialRatiosOptions(input),
            enabled: hasHydrated && input.identifier.trim().length > 0,
            queryFn: () =>
                getFinancialRatios({ data: { ...input, apiKey: apiKey ?? undefined } }),
            queryKey: [...financialRatiosOptions(input).queryKey, String(apiKeyUpdatedAt)],
        }),
    );

    useErrorToast(result.error, "Failed to load financial ratios");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useFinancialGrowth(input: FinancialGrowthInput) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const result = useQuery(
        queryOptions({
            ...financialGrowthOptions(input),
            enabled: hasHydrated && input.identifier.trim().length > 0,
            queryFn: () =>
                getFinancialGrowth({ data: { ...input, apiKey: apiKey ?? undefined } }),
            queryKey: [...financialGrowthOptions(input).queryKey, String(apiKeyUpdatedAt)],
        }),
    );

    useErrorToast(result.error, "Failed to load growth financials");

    return {
        ...result,
        data: result.data ?? null,
    };
}

export function useFinancialCagr(input: FinancialCagrInput) {
    const { apiKey, apiKeyUpdatedAt, hasHydrated } = useApiKey();

    const result = useQuery(
        queryOptions({
            ...financialCagrOptions(input),
            enabled: hasHydrated && input.identifier.trim().length > 0,
            queryFn: () =>
                getFinancialCagr({ data: { ...input, apiKey: apiKey ?? undefined } }),
            queryKey: [...financialCagrOptions(input).queryKey, String(apiKeyUpdatedAt)],
        }),
    );

    useErrorToast(result.error, "Failed to load CAGR financials");

    return {
        ...result,
        data: result.data ?? null,
    };
}
