import type { paths } from "./schema";

// Helper type to extract successful JSON response from a path
type ApiResponse<TPath extends keyof paths, TPathValue extends keyof paths[TPath]>
    = paths[TPath][TPathValue] extends { responses: { 200: { content: { "application/json": infer R } } } }
        ? R
        : never;

// Response types derived from schema
export type CompanySearchResponse = ApiResponse<"/v1/company/search", "get">;
export type CompanyDetailsResponse = ApiResponse<"/v1/company/details", "get">;
export type DividendsResponse = ApiResponse<"/v1/company/dividends", "get">;
export type SplitsResponse = ApiResponse<"/v1/company/splits", "get">;
export type IposResponse = ApiResponse<"/v1/ipos", "get">;
export type MarketHolidaysResponse = ApiResponse<"/v1/market/market-holidays", "get">;
export type FilingsResponse = ApiResponse<"/v1/sec-filings/filings", "get">;
export type AvailableFormTypesResponse = ApiResponse<"/v1/sec-filings/available-form-types", "get">;
export type FinancialRatiosResponse = ApiResponse<"/v1/financial-metrics/ratios", "get">;
export type FinancialGrowthResponse = ApiResponse<"/v1/financial-metrics/growth", "get">;
export type FinancialCagrResponse = ApiResponse<"/v1/financial-metrics/cagr", "get">;

// All 3 statement endpoints have the same response structure
export type StandardizedFinancialsResponse = ApiResponse<"/v1/standardized/income-statement", "get">;
export type StandardizedFinancialsPresentationResponse = ApiResponse<
    "/v1/standardized/income-statement/presentation",
    "get"
>;
export type AsReportedFinancialsPresentationResponse = ApiResponse<
    "/v1/as-reported/income-statement/presentation",
    "get"
>;
export type SegmentedFinancialsResponse = ApiResponse<"/v1/segmented-financials", "get">;

// Derived entity types
export type Company = CompanySearchResponse["companies"][number];
export type CompanyDetails = CompanyDetailsResponse["companies"][number];
export type Dividend = DividendsResponse["companies"][number]["dividends"][number];
export type Split = SplitsResponse["companies"][number]["splits"][number];
export type Ipo = IposResponse["ipos"][number];
export type MarketHoliday = MarketHolidaysResponse["holidays"][number];
export type Filing = FilingsResponse["companies"][number]["filings"][number];
export type FinancialPeriod
    = StandardizedFinancialsPresentationResponse["companies"][number]["periods"][number];
export type PresentationFinancialPeriod
    = | AsReportedFinancialsPresentationResponse["companies"][number]["periods"][number]
        | StandardizedFinancialsPresentationResponse["companies"][number]["periods"][number];
export type SegmentedFinancialPeriod
    = SegmentedFinancialsResponse["companies"][number]["periods"][number];
export type FinancialCagrPeriod
    = FinancialCagrResponse["companies"][number]["periods"][number];
export type FinancialGrowthPeriod
    = FinancialGrowthResponse["companies"][number]["periods"][number];
export type FinancialRatiosPeriod
    = FinancialRatiosResponse["companies"][number]["periods"][number];
export type FinancialMetricPeriod
    = FinancialCagrPeriod | FinancialGrowthPeriod | FinancialRatiosPeriod;
export type SegmentedFinancialFact
    = SegmentedFinancialPeriod["facts"][string][number];

// Query parameter types
export type FiscalPeriodType = "annual" | "quarterly" | "ttm" | "ytd";

// Only the 3 statement types that share the same response structure
export type StatementType = "balance-sheet" | "cash-flow-statement" | "income-statement";

export type RatioCategory = "liquidity" | "profitability" | "solvency" | "valuation";
export type GrowthType = "quarter_over_quarter" | "year_over_year";
export type CagrPeriodYears = 3 | 5 | 10;

export type SegmentedFinancialsSegmentId
    = | "seg_cost_of_revenue_business_segment"
        | "seg_general_and_administrative_expenses_business_segment"
        | "seg_research_and_development_expenses_business_segment"
        | "seg_revenue_business_segment"
        | "seg_revenue_geographic"
        | "seg_revenue_product"
        | "seg_selling_and_marketing_expenses_business_segment";
