import type { InfiniteData } from "@tanstack/react-query";

import { queryOptions, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";

import { useApiKeyStore } from "@/lib/stores/api-key-store";

import type { FilingsResponse, FiscalPeriodType, StatementType } from "./types";

import {
    getAsReportedFinancialsPresentation,
    getAvailableFormTypes,
    getCompanyDetails,
    getFilings,
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

export const availableFormTypesOptions = (input: AvailableFormTypesInput) =>
    queryOptions({
        enabled: input.identifier.trim().length > 0,
        queryFn: () => getAvailableFormTypes({ data: input }),
        queryKey: ["filings", "available-form-types", input.identifier],
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
        getNextPageParam: (lastPage: FilingsResponse, allPages: Array<FilingsResponse>) => {
            const pageSize = input.limit;

            const lastCount = lastPage.companies[0]?.filings?.length ?? 0;

            if (lastCount < pageSize) return undefined;

            const nextOffset = allPages.reduce(
                (acc, page) => acc + (page.companies[0]?.filings?.length ?? 0),
                0,
            );

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
