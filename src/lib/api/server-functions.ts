import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type {
    AsReportedFinancialsPresentationResponse,
    AvailableFormTypesResponse,
    CompanyDetailsResponse,
    CompanySearchResponse,
    DividendsResponse,
    FilingsResponse,
    FinancialCagrResponse,
    FinancialGrowthResponse,
    FinancialRatiosResponse,
    InsiderTradesResponse,
    InstitutionalHoldingsResponse,
    InstitutionalTransactionsResponse,
    InstitutionsResponse,
    IposResponse,
    MarketHolidaysResponse,
    SegmentedFinancialsResponse,
    SplitsResponse,
    StandardizedFinancialsPresentationResponse,
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

const dividendsSchema = z.object({
    apiKey: apiKeySchema,
    endDate: z.string().optional(),
    identifier: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    startDate: z.string().optional(),
});

export const getCompanyDividends = createServerFn({ method: "GET" })
    .inputValidator(dividendsSchema)
    .handler(async ({ data }): Promise<DividendsResponse> => {
        const {
            apiKey,
            endDate,
            identifier,
            limit = 40,
            offset = 0,
            sort = "desc",
            startDate,
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/company/dividends", {
            params: {
                query: {
                    end_date: endDate,
                    identifier,
                    limit,
                    offset,
                    sort,
                    start_date: startDate,
                },
            },
        });

        if (error) throw error;

        return res;
    });

const splitsSchema = z.object({
    apiKey: apiKeySchema,
    identifier: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
});

export const getCompanySplits = createServerFn({ method: "GET" })
    .inputValidator(splitsSchema)
    .handler(async ({ data }): Promise<SplitsResponse> => {
        const {
            apiKey,
            identifier,
            limit = 40,
            offset = 0,
            sort = "desc",
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/company/splits", {
            params: {
                query: {
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

const insiderTradesSchema = z.object({
    acquiredDisposed: z.enum(["A", "D"]).optional(),
    apiKey: apiKeySchema,
    endDate: z.string().optional(),
    identifier: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    startDate: z.string().optional(),
});

export const getInsiderTrades = createServerFn({ method: "GET" })
    .inputValidator(insiderTradesSchema)
    .handler(async ({ data }): Promise<InsiderTradesResponse> => {
        const {
            acquiredDisposed,
            apiKey,
            endDate,
            identifier,
            limit = 40,
            offset = 0,
            sort = "desc",
            startDate,
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/insider-trades", {
            params: {
                query: {
                    acquired_disposed: acquiredDisposed,
                    end_date: endDate,
                    identifier,
                    limit,
                    offset,
                    sort,
                    start_date: startDate,
                },
            },
        });

        if (error) throw error;

        return res;
    });

const institutionalTransactionsSchema = z.object({
    apiKey: apiKeySchema,
    calendarQuarter: z.number().optional(),
    calendarYear: z.number().optional(),
    endDate: z.string().optional(),
    identifier: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    startDate: z.string().optional(),
    type: z.enum(["new_buy", "added", "reduced", "sold_out"]).optional(),
});

export const getInstitutionalTransactions = createServerFn({ method: "GET" })
    .inputValidator(institutionalTransactionsSchema)
    .handler(async ({ data }): Promise<InstitutionalTransactionsResponse> => {
        const {
            apiKey,
            calendarQuarter,
            calendarYear,
            endDate,
            identifier,
            limit = 40,
            offset = 0,
            sort = "desc",
            startDate,
            type,
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/institutional-ownership/transactions", {
            params: {
                query: {
                    calendar_quarter: calendarQuarter,
                    calendar_year: calendarYear,
                    end_date: endDate,
                    identifier,
                    limit,
                    offset,
                    sort,
                    start_date: startDate,
                    type,
                },
            },
        });

        if (error) throw error;

        return res;
    });

const institutionalHoldingsSchema = z.object({
    apiKey: apiKeySchema,
    identifier: z.string(),
    limit: z.number().optional(),
    minValue: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
});

export const getInstitutionalHoldingsByCompany = createServerFn({ method: "GET" })
    .inputValidator(institutionalHoldingsSchema)
    .handler(async ({ data }): Promise<InstitutionalHoldingsResponse> => {
        const {
            apiKey,
            identifier,
            limit = 40,
            minValue,
            offset = 0,
            sort = "desc",
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/institutional-ownership/holdings-by-company", {
            params: {
                query: {
                    identifier,
                    limit,
                    min_value: minValue,
                    offset,
                    sort,
                },
            },
        });

        if (error) throw error;

        return res;
    });

const institutionsSchema = z.object({
    apiKey: apiKeySchema,
    ciks: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
});

export const getInstitutions = createServerFn({ method: "GET" })
    .inputValidator(institutionsSchema)
    .handler(async ({ data }): Promise<InstitutionsResponse> => {
        const {
            apiKey,
            ciks,
            limit = 100,
            offset = 0,
            sort = "asc",
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/institutional-ownership/institutions", {
            params: {
                query: {
                    ciks,
                    limit,
                    offset,
                    sort,
                },
            },
        });

        if (error) throw error;

        return res;
    });

const iposSchema = z.object({
    apiKey: apiKeySchema,
    endDate: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    startDate: z.string().optional(),
});

export const getIpos = createServerFn({ method: "GET" })
    .inputValidator(iposSchema)
    .handler(async ({ data }): Promise<IposResponse> => {
        const {
            apiKey,
            endDate,
            limit = 40,
            offset = 0,
            sort = "desc",
            startDate,
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/ipos", {
            params: {
                query: {
                    end_date: endDate,
                    limit,
                    offset,
                    sort,
                    start_date: startDate,
                },
            },
        });

        if (error) throw error;

        return res;
    });

const marketHolidaysSchema = z.object({
    apiKey: apiKeySchema,
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
});

export const getMarketHolidays = createServerFn({ method: "GET" })
    .inputValidator(marketHolidaysSchema)
    .handler(async ({ data }): Promise<MarketHolidaysResponse> => {
        const { apiKey, limit = 40, offset = 0, sort = "desc" } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/market/market-holidays", {
            params: {
                query: {
                    limit,
                    offset,
                    sort,
                },
            },
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

const availableFormTypesSchema = z.object({
    apiKey: apiKeySchema,
    identifier: z.string().optional(),
});

export const getAvailableFormTypes = createServerFn({ method: "GET" })
    .inputValidator(availableFormTypesSchema)
    .handler(async ({ data }): Promise<AvailableFormTypesResponse> => {
        const { apiKey, identifier } = data;

        const api = createApiClient(apiKey);

        const { data: res } = await api.GET("/v1/sec-filings/available-form-types", {
            params: { query: { identifier } },
        });

        if (!res) {
            throw new Error("Failed to load available form types");
        }

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

const segmentedFinancialsSchema = z.object({
    apiKey: apiKeySchema,
    fiscalPeriodType: z.enum(["annual", "quarterly", "ttm", "ytd"]),
    identifier: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    segmentId: z.enum([
        "seg_revenue_product",
        "seg_revenue_geographic",
        "seg_revenue_business_segment",
        "seg_cost_of_revenue_business_segment",
        "seg_research_and_development_expenses_business_segment",
        "seg_selling_and_marketing_expenses_business_segment",
        "seg_general_and_administrative_expenses_business_segment",
    ]).optional(),
    sort: z.enum(["asc", "desc"]).optional(),
});

const ratiosSchema = z.object({
    apiKey: apiKeySchema,
    category: z.enum(["valuation", "profitability", "liquidity", "solvency"]).optional(),
    fiscalPeriodType: z.enum(["annual", "quarterly", "ttm", "ytd"]),
    identifier: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
});

const growthSchema = z.object({
    apiKey: apiKeySchema,
    fiscalPeriodType: z.enum(["annual", "quarterly", "ttm", "ytd"]),
    growthType: z.enum(["year_over_year", "quarter_over_quarter"]).optional(),
    identifier: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
});

const cagrSchema = z.object({
    apiKey: apiKeySchema,
    identifier: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    periodYears: z.union([z.literal(3), z.literal(5), z.literal(10)]).optional(),
    sort: z.enum(["asc", "desc"]).optional(),
});

export const getStandardizedFinancials = createServerFn({ method: "GET" })
    .inputValidator(financialsSchema)
    .handler(async ({ data }): Promise<StandardizedFinancialsPresentationResponse> => {
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

        const path = `/v1/standardized/${statement}/presentation` as const;

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

export const getAsReportedFinancialsPresentation = createServerFn({ method: "GET" })
    .inputValidator(financialsSchema)
    .handler(async ({ data }): Promise<AsReportedFinancialsPresentationResponse> => {
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

        const path = `/v1/as-reported/${statement}/presentation` as const;

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

export const getSegmentedFinancials = createServerFn({ method: "GET" })
    .inputValidator(segmentedFinancialsSchema)
    .handler(async ({ data }): Promise<SegmentedFinancialsResponse> => {
        const {
            apiKey,
            fiscalPeriodType,
            identifier,
            limit = 8,
            offset = 0,
            segmentId,
            sort = "desc",
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/segmented-financials", {
            params: {
                query: {
                    fiscal_period_type: fiscalPeriodType,
                    identifier,
                    limit,
                    offset,
                    segment_id: segmentId,
                    sort,
                },
            },
        });

        if (error) throw error;

        return res;
    });

export const getFinancialRatios = createServerFn({ method: "GET" })
    .inputValidator(ratiosSchema)
    .handler(async ({ data }): Promise<FinancialRatiosResponse> => {
        const {
            apiKey,
            category,
            fiscalPeriodType,
            identifier,
            limit = 8,
            offset = 0,
            sort = "desc",
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/financial-metrics/ratios", {
            params: {
                query: {
                    category,
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

export const getFinancialGrowth = createServerFn({ method: "GET" })
    .inputValidator(growthSchema)
    .handler(async ({ data }): Promise<FinancialGrowthResponse> => {
        const {
            apiKey,
            fiscalPeriodType,
            growthType,
            identifier,
            limit = 8,
            offset = 0,
            sort = "desc",
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/financial-metrics/growth", {
            params: {
                query: {
                    fiscal_period_type: fiscalPeriodType,
                    growth_type: growthType,
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

export const getFinancialCagr = createServerFn({ method: "GET" })
    .inputValidator(cagrSchema)
    .handler(async ({ data }): Promise<FinancialCagrResponse> => {
        const {
            apiKey,
            identifier,
            limit = 8,
            offset = 0,
            periodYears,
            sort = "desc",
        } = data;

        const api = createApiClient(apiKey);

        const { data: res, error } = await api.GET("/v1/financial-metrics/cagr", {
            params: {
                query: {
                    identifier,
                    limit,
                    offset,
                    period_years: periodYears ? (String(periodYears) as "3" | "5" | "10") : undefined,
                    sort,
                },
            },
        });

        if (error) throw error;

        return res;
    });
