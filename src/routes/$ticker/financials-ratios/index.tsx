import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

import type { FiscalPeriodType, RatioCategory } from "@/lib/api/types";

import { buildPeriodLabel, FinancialMetricsTable } from "@/components/financial-metrics/financial-metrics-table";
import { PeriodTypeButtons } from "@/components/financials-presentation/period-type-buttons";
import { ErrorState } from "@/components/ui/error-state";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useFinancialRatios } from "@/lib/api/queries";
import { formatMetricId, formatNumberEnCompact } from "@/lib/utils";

export const Route = createFileRoute("/$ticker/financials-ratios/")({
    component: FinancialRatiosPage,
});

const ratioCategoryOptions: Array<{ label: string; value: "all" | RatioCategory }> = [
    { label: "All Categories", value: "all" },
    { label: "Valuation", value: "valuation" },
    { label: "Profitability", value: "profitability" },
    { label: "Liquidity", value: "liquidity" },
    { label: "Solvency", value: "solvency" },
];

const formatCategoryLabel = (category: string) =>
    category
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());

function FinancialRatiosPage() {
    const { ticker } = Route.useParams();

    const [periodType, setPeriodType] = React.useState<FiscalPeriodType>("quarterly");

    const [category, setCategory] = React.useState<"all" | RatioCategory>("all");

    const { data, error, isLoading } = useFinancialRatios({
        category: category === "all" ? undefined : category,
        fiscalPeriodType: periodType,
        identifier: ticker,
        limit: 8,
    });

    const company = data?.companies[0];

    const periods = React.useMemo(() => company?.periods ?? [], [company]);

    const periodLabels = React.useMemo(
        () => periods.map(p => buildPeriodLabel(p)),
        [periods],
    );

    const rows = React.useMemo(() => {
        const rowMap = new Map<string, {
            group?: string;
            key: string;
            formatValue?: (value: number) => string;
            label: string;
            values: Record<string, number | undefined>;
        }>();

        periods.forEach((period, index) => {
            const label = periodLabels[index];

            Object.entries(period.facts).forEach(([categoryKey, categoryFacts]) => {
                Object.entries(categoryFacts).forEach(([metricId, value]) => {
                    const rowKey = `${metricId}:${categoryKey}`;

                    const isPercentMetric = metricId.endsWith("_pct");

                    if (!rowMap.has(rowKey)) {
                        rowMap.set(rowKey, {
                            formatValue: isPercentMetric
                                ? (val: number) => `${formatNumberEnCompact(val)}%`
                                : undefined,
                            group: formatMetricId(metricId),
                            key: rowKey,
                            label: formatCategoryLabel(categoryKey),
                            values: {},
                        });
                    }

                    rowMap.get(rowKey)!.values[label] = value;
                });
            });
        });

        return Array.from(rowMap.values())
            .map(row => ({
                ...row,
                values: Object.fromEntries(
                    periodLabels.map(label => [label, row.values[label]]),
                ),
            }))
            .filter(row => periodLabels.some(label => row.values[label] !== undefined))
            .sort((a, b) => {
                const groupCompare = (a.group ?? "").localeCompare(b.group ?? "");

                return groupCompare !== 0
                    ? groupCompare
                    : a.label.localeCompare(b.label);
            });
    }, [periodLabels, periods]);

    return (
        <div className="space-y-4 relative flex flex-col h-0 grow">
            <div className="flex flex-col shrink-0 gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div>Ratio Financials</div>
                    <div>
                        Financial ratios grouped by category.
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select
                        onValueChange={value => setCategory(value as "all" | RatioCategory)}
                        value={category}
                    >
                        <SelectTrigger className="w-[220px]">
                            {ratioCategoryOptions.find(opt => opt.value === category)?.label ?? "Category"}
                        </SelectTrigger>
                        <SelectContent>
                            {ratioCategoryOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <PeriodTypeButtons
                        onValueChange={setPeriodType}
                        value={periodType}
                    />
                </div>
            </div>
            {error
                ? (
                        <ErrorState error={error} title="Failed to load ratio financials" />
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
                                <FinancialMetricsTable
                                    groupLabel="Metric"
                                    labelHeader="Category"
                                    periodLabels={periodLabels}
                                    rows={rows}
                                />
                            )}
        </div>
    );
}
