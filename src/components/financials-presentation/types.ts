import type {
    AsReportedFinancialsPresentationResponse,
    StandardizedFinancialsPresentationResponse,
} from "@/lib/api/types";

export type StandardizedPresentationFactRaw
    = StandardizedFinancialsPresentationResponse["companies"][number]["periods"][number]["facts"][number];
export type AsReportedPresentationFactRaw
    = AsReportedFinancialsPresentationResponse["companies"][number]["periods"][number]["facts"][number];

export type PresentationFact
    = | (Omit<AsReportedPresentationFactRaw, "children"> & {
        children?: Array<PresentationFact>;
        type: "as-reported";
    })
    | (Omit<StandardizedPresentationFactRaw, "children"> & {
        children?: Array<PresentationFact>;
        type: "standardized";
    });

export type TreeRow = {
    depth: number;
    hasChildren: boolean;
    isTotal: boolean;
    label: string;
    metricId: string;
    parentId: null | string;
    values: Record<string, null | number | undefined>;
};
