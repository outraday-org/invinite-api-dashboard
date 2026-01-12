import { queryOptions, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";

import { useApiKeyStore } from "@/lib/stores/api-key-store";

import type { FiscalPeriodType, StatementType } from "./types";

import {
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
