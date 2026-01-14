import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

import type { FinancialPeriod, FiscalPeriodType, StatementType } from "@/lib/api/types";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStandardizedFinancials } from "@/lib/api/queries";
import { cn, formatNumberEnCompact } from "@/lib/utils";

export const Route = createFileRoute("/$ticker/financials-standardized")({
    component: StandardizedFinancialsPage,
});

const statementOptions: Array<{ label: string; value: StatementType }> = [
    { label: "Income Statement", value: "income-statement" },
    { label: "Balance Sheet", value: "balance-sheet" },
    { label: "Cash Flow Statement", value: "cash-flow-statement" },
];

const periodOptions: Array<{ label: string; value: FiscalPeriodType }> = [
    { label: "Quarterly", value: "quarterly" },
    { label: "Annual", value: "annual" },
    { label: "YTD", value: "ytd" },
    { label: "TTM", value: "ttm" },
];

function StandardizedFinancialsPage() {
    const { ticker } = Route.useParams();

    const [statement, setStatement] = React.useState<StatementType>("income-statement");

    const [periodType, setPeriodType] = React.useState<FiscalPeriodType>("quarterly");

    const { data, error, isLoading } = useStandardizedFinancials({
        fiscalPeriodType: periodType,
        identifier: ticker,
        limit: 8,
        statement,
    });

    const company = data?.companies[0];

    const periods = company?.periods ?? [];

    return (
        <div className="space-y-4 relative flex flex-col h-0 grow">
            <div className="flex flex-col shrink-0 gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div>Standardized Financials (Presentation)</div>
                    <div>
                        Financial data normalized to standard metrics (tree / presentation format)
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select
                        onValueChange={v => setStatement(v as StatementType)}
                        value={statement}
                    >
                        <SelectTrigger className="w-[180px]">
                            {statementOptions.find(opt => opt.value === statement)?.label ?? "Select statement"}
                        </SelectTrigger>
                        <SelectContent>
                            {statementOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex gap-1">
                        {periodOptions.map(opt => (
                            <Button
                                key={opt.value}
                                onClick={() => setPeriodType(opt.value)}
                                variant={periodType === opt.value ? "default" : "outline"}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            {error
                ? (
                        <ErrorState error={error} title="Failed to load standardized financials" />
                    )
                : isLoading
                    ? (
                            <div className="text-muted-foreground text-sm">Loading financials...</div>
                        )
                    : periods.length === 0
                        ? (
                                <div className="text-muted-foreground text-sm">No financial data available.</div>
                            )
                        : (
                                <FinancialsPresentationTable periods={periods} />
                            )}
        </div>
    );
}

type PresentationFact = FinancialPeriod["facts"][number];

type TreeRow = {
    depth: number;
    hasChildren: boolean;
    metricId: string;
    parentId: null | string;
    values: Record<string, number | undefined>;
};

function formatMetricId(metricId: string) {
    const upperWords = new Set(["ebit", "ebitda", "ebt", "eps"]);

    const words = metricId
        .split("_")
        .filter(Boolean)
        .map((part) => {
            const lower = part.toLowerCase();

            if (lower.length === 0) return "";

            if (upperWords.has(lower)) return lower.toUpperCase();

            return `${lower[0].toUpperCase()}${lower.slice(1)}`;
        })
        .filter(Boolean);

    if (words.length <= 1) return words[0] ?? "";

    return words.slice(1).join(" ");
}

function buildTreeRows(
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
            metricId: fact.metric_id,
            parentId,
        });

        if (children.length > 0) {
            buildTreeRows(children, depth + 1, fact.metric_id, out);
        }
    }
}

function flattenToValueMap(facts: Array<PresentationFact>, out: Map<string, number>) {
    for (const fact of facts) {
        out.set(fact.metric_id, fact.value);

        if (fact.children?.length) {
            flattenToValueMap(fact.children, out);
        }
    }
}

function FinancialsPresentationTable({ periods }: { periods: Array<FinancialPeriod> }) {
    // Build period labels for column headers
    const periodLabels = periods.map((p) => {
        if (p.fiscal_quarter && p.fiscal_quarter > 0) {
            return `Q${p.fiscal_quarter} ${p.fiscal_year}`;
        }

        return `${p.fiscal_year}`;
    });

    const canonicalTree = React.useMemo(() => {
        const out: Array<Omit<TreeRow, "values">> = [];

        buildTreeRows(periods[0]?.facts ?? [], 0, null, out);

        return out;
    }, [periods]);

    const parentById = React.useMemo(() => {
        const m = new Map<string, null | string>();

        for (const row of canonicalTree) {
            m.set(row.metricId, row.parentId);
        }

        return m;
    }, [canonicalTree]);

    const valueMaps = React.useMemo(() => {
        return periods.map((p) => {
            const m = new Map<string, number>();

            flattenToValueMap(p.facts, m);

            return m;
        });
    }, [periods]);

    const allExpandableIds = React.useMemo(() => {
        return new Set(canonicalTree.filter(r => r.hasChildren).map(r => r.metricId));
    }, [canonicalTree]);

    const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(allExpandableIds));

    React.useEffect(() => {
        // keep expanded set in sync when switching statement/period type/ticker
        setExpanded(new Set(allExpandableIds));
    }, [allExpandableIds]);

    const isVisible = React.useCallback((row: Omit<TreeRow, "values">) => {
        let p = row.parentId;

        while (p) {
            if (!expanded.has(p)) return false;

            const nextParent = parentById.get(p);

            p = nextParent === undefined ? null : nextParent;
        }

        return true;
    }, [expanded, parentById]);

    const rows: Array<TreeRow> = React.useMemo(() => {
        return canonicalTree
            .filter(isVisible)
            .map(r => ({
                ...r,
                values: Object.fromEntries(
                    periodLabels.map((label, idx) => [label, valueMaps[idx]?.get(r.metricId)]),
                ),
            }));
    }, [canonicalTree, isVisible, periodLabels, valueMaps]);

    return (
        <div className="space-y-2 flex flex-col h-0 grow">
            <div className="flex flex-wrap shrink-0 gap-2">
                <Button
                    onClick={() => setExpanded(new Set(allExpandableIds))}
                    size="sm"
                    variant="outline"
                >
                    Expand all
                </Button>
                <Button
                    onClick={() => setExpanded(new Set())}
                    size="sm"
                    variant="outline"
                >
                    Collapse all
                </Button>
            </div>

            <ScrollArea className="grow h-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[420px] min-w-[420px] max-w-[420px]">
                                Metric
                            </TableHead>
                            {periodLabels.map(label => (
                                <TableHead className="text-right" key={label}>
                                    {label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y-0">
                        {rows.map(row => (
                            <TableRow key={row.metricId}>
                                <TableCell className="w-[420px] min-w-[420px] max-w-[420px]">
                                    <div className="flex items-center gap-1">
                                        {row.hasChildren
                                            ? (
                                                    <button
                                                        className={cn(
                                                            "text-muted-foreground hover:text-foreground inline-flex h-6 w-6 items-center justify-center rounded",
                                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                                        )}
                                                        onClick={() =>
                                                            setExpanded((prev) => {
                                                                const next = new Set(prev);

                                                                if (next.has(row.metricId)) {
                                                                    next.delete(row.metricId);
                                                                }
                                                                else {
                                                                    next.add(row.metricId);
                                                                }

                                                                return next;
                                                            })}
                                                        type="button"
                                                    >
                                                        {expanded.has(row.metricId)
                                                            ? <ChevronDown className="h-4 w-4" />
                                                            : <ChevronRight className="h-4 w-4" />}
                                                    </button>
                                                )
                                            : <span className="inline-block h-6 w-6" />}

                                        <span
                                            className={cn(
                                                "font-medium truncate",
                                                row.depth === 0 && "font-semibold",
                                            )}
                                            style={{
                                                maxWidth: `${420 - 24}px`,
                                                paddingLeft: row.depth * 14,
                                            }}
                                            title={formatMetricId(row.metricId)}
                                        >
                                            {formatMetricId(row.metricId)}
                                        </span>
                                    </div>
                                </TableCell>

                                {periodLabels.map((label) => {
                                    const val = row.values[label];

                                    return (
                                        <TableCell className="text-right" key={`${row.metricId}:${label}`}>
                                            <span className="tabular-nums">
                                                {val === undefined ? "—" : formatNumberEnCompact(val)}
                                            </span>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
}
