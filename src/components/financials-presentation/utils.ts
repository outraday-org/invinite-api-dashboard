import { formatMetricId } from "@/lib/utils";

import type {
    AsReportedPresentationFactRaw,
    PresentationFact,
    StandardizedPresentationFactRaw,
    TreeRow,
} from "./types";

export function buildTreeRows(
    facts: Array<PresentationFact>,
    depth: number,
    parentId: null | string,
    out: Array<Omit<TreeRow, "values">>,
) {
    for (const fact of facts) {
        const children = fact.children ?? [];

        out.push({
            depth,
            hasChildren: children.length > 0,
            isTotal: "isTotal" in fact ? Boolean(fact.isTotal) : false,
            label: getFactLabel(fact),
            metricId: getFactId(fact),
            parentId,
        });

        if (children.length > 0) {
            buildTreeRows(children, depth + 1, getFactId(fact), out);
        }
    }
}

export function flattenToValueMap(
    facts: Array<PresentationFact>,
    out: Map<string, null | number>,
) {
    for (const fact of facts) {
        out.set(getFactId(fact), fact.value ?? null);

        if (fact.children?.length) {
            flattenToValueMap(fact.children, out);
        }
    }
}

export function addFactTypes(
    facts: Array<AsReportedPresentationFactRaw | StandardizedPresentationFactRaw>,
): Array<PresentationFact> {
    return facts.map((fact) => {
        if ("metric_id" in fact) {
            const children = fact.children ? addFactTypes(fact.children) : undefined;

            return {
                ...fact,
                children,
                type: "standardized",
            };
        }

        const children = fact.children ? addFactTypes(fact.children) : undefined;

        return {
            ...fact,
            children,
            type: "as-reported",
        };
    });
}

export function getFactId(fact: PresentationFact) {
    return fact.type === "standardized" ? fact.metric_id : fact.concept;
}

export function getFactLabel(fact: PresentationFact) {
    if (fact.type === "standardized") return formatMetricId(fact.metric_id);

    return fact.label || fact.concept;
}
