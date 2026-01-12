import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type {
    CompanyDetailsResponse,
    CompanySearchResponse,
    FilingsResponse,
    StandardizedFinancialsResponse,
} from "./types";

import { createApiClient } from "./client.server";

const apiKeySchema = z
    .string()
    .transform(val => val.trim())
    .pipe(z.string().min(1))
    .optional();

const searchSchema = z.object({
    apiKey: apiKeySchema,
    limit: z.number().optional(),
    offset: z.number().optional(),
    query: z.string(),
});

export const searchCompanies = createServerFn({ method: "GET" })
    .inputValidator(searchSchema)
    .handler(async ({ data }): Promise<CompanySearchResponse> => {
        const { apiKey, limit = 10, offset = 0, query } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/company/search", {
            params: { query: { limit, offset, query } },
        });

        if (error) throw error;

        return res;
    });

const detailsSchema = z.object({
    apiKey: apiKeySchema,
    identifier: z.string(),
});

export const getCompanyDetails = createServerFn({ method: "GET" })
    .inputValidator(detailsSchema)
    .handler(async ({ data }): Promise<CompanyDetailsResponse> => {
        const { apiKey, identifier } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/company/details", {
            params: { query: { identifier } },
        });

        if (error) throw error;

        return res;
    });

const filingsSchema = z.object({
    apiKey: apiKeySchema,
    formType: z.string().optional(),
    identifier: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
});

export const getFilings = createServerFn({ method: "GET" })
    .inputValidator(filingsSchema)
    .handler(async ({ data }): Promise<FilingsResponse> => {
        const {
            apiKey,
            formType,
            identifier,
            limit = 40,
            offset = 0,
            sort = "desc",
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/sec-filings/filings", {
            params: {
                query: {
                    form_type: formType,
                    identifier,
                    limit,
                    offset,
                    sort,
                },
            },
        });

        if (error) throw error;

        return res;
    });

const financialsSchema = z.object({
    apiKey: apiKeySchema,
    fiscalPeriodType: z.enum(["annual", "quarterly", "ttm", "ytd"]),
    identifier: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    statement: z.enum(["balance-sheet", "cash-flow-statement", "income-statement"]),
});

export const getStandardizedFinancials = createServerFn({ method: "GET" })
    .inputValidator(financialsSchema)
    .handler(async ({ data }): Promise<StandardizedFinancialsResponse> => {
        const {
            apiKey,
            fiscalPeriodType,
            identifier,
            limit = 8,
            offset = 0,
            sort = "desc",
            statement,
        } = data;

        const api = createApiClient(apiKey);

        const path = `/v1/standardized/${statement}` as const;

        const { data: res, error } = await api.GET(path, {
            params: {
                query: {
                    fiscal_period_type: fiscalPeriodType,
                    identifier,
                    limit,
                    offset,
                    sort,
                },
            },
        });

        if (error) throw error;

        return res;
    });
