import type { paths } from "./schema";

// Helper type to extract successful JSON response from a path
type ApiResponse<TPath extends keyof paths, TPathValue extends keyof paths[TPath]>
    = paths[TPath][TPathValue] extends { responses: { 200: { content: { "application/json": infer R } } } }
        ? R
        : never;

// Response types derived from schema
export type CompanySearchResponse = ApiResponse<"/v1/company/search", "get">;
export type CompanyDetailsResponse = ApiResponse<"/v1/company/details", "get">;
export type FilingsResponse = ApiResponse<"/v1/sec-filings/filings", "get">;
export type AvailableFormTypesResponse = ApiResponse<"/v1/sec-filings/available-form-types", "get">;

// All 3 statement endpoints have the same response structure
export type StandardizedFinancialsResponse = ApiResponse<"/v1/standardized/income-statement", "get">;
export type StandardizedFinancialsPresentationResponse = ApiResponse<
    "/v1/standardized/income-statement/presentation",
    "get"
>;

// Derived entity types
export type Company = CompanySearchResponse["companies"][number];
export type CompanyDetails = CompanyDetailsResponse["companies"][number];
export type Filing = FilingsResponse["companies"][number]["filings"][number];
export type FinancialPeriod
    = StandardizedFinancialsPresentationResponse["companies"][number]["periods"][number];

// Query parameter types
export type FiscalPeriodType = "annual" | "quarterly" | "ttm" | "ytd";

// Only the 3 statement types that share the same response structure
export type StatementType = "balance-sheet" | "cash-flow-statement" | "income-statement";
