import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

import type { FiscalPeriodType, GrowthType } from "@/lib/api/types";

import { buildPeriodLabel, FinancialMetricsTable } from "@/components/financial-metrics/financial-metrics-table";
import { PeriodTypeButtons } from "@/components/financials-presentation/period-type-buttons";
import { ErrorState } from "@/components/ui/error-state";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useFinancialGrowth } from "@/lib/api/queries";
import { formatMetricId, formatPercentCompact } from "@/lib/utils";

export const Route = createFileRoute("/$ticker/financials-growth/")({
    component: FinancialGrowthPage,
});

const growthTypeOptions: Array<{ label: string; value: "all" | GrowthType }> = [
    { label: "All Growth Types", value: "all" },
    { label: "Year over Year", value: "year_over_year" },
    { label: "Quarter over Quarter", value: "quarter_over_quarter" },
];

const growthTypeShortLabel: Partial<Record<GrowthType, string>> = {
    quarter_over_quarter: "QoQ",
    year_over_year: "YoY",
};

function FinancialGrowthPage() {
    const { ticker } = Route.useParams();

    const [periodType, setPeriodType] = React.useState<FiscalPeriodType>("quarterly");

    const [growthType, setGrowthType] = React.useState<"all" | GrowthType>("all");

    const { data, error, isLoading } = useFinancialGrowth({
        fiscalPeriodType: periodType,
        growthType: growthType === "all" ? undefined : growthType,
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
            key: string;
            label: string;
            values: Record<string, number | undefined>;
        }>();

        periods.forEach((period, index) => {
            const label = periodLabels[index];

            Object.entries(period.facts).forEach(([growthTypeKey, metricsMap]) => {
                const growthLabel = growthTypeShortLabel[growthTypeKey as GrowthType] ?? growthTypeKey;

                Object.entries(metricsMap).forEach(([metricId, value]) => {
                    const rowKey = `${growthTypeKey}:${metricId}`;

                    const metricLabel = `${formatMetricId(metricId)} (${growthLabel})`;

                    if (!rowMap.has(rowKey)) {
                        rowMap.set(rowKey, {
                            key: rowKey,
                            label: metricLabel,
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
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [periodLabels, periods]);

    return (
        <div className="space-y-4 relative flex flex-col h-0 grow">
            <div className="flex flex-col shrink-0 gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div>Growth Financials</div>
                    <div>
                        Period-over-period growth metrics (YoY/ QoQ).
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select
                        onValueChange={value => setGrowthType(value as "all" | GrowthType)}
                        value={growthType}
                    >
                        <SelectTrigger className="w-[220px]">
                            {growthTypeOptions.find(opt => opt.value === growthType)?.label ?? "Growth Type"}
                        </SelectTrigger>
                        <SelectContent>
                            {growthTypeOptions.map(opt => (
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
                        <ErrorState error={error} title="Failed to load growth financials" />
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
                                    formatValue={formatPercentCompact}
                                    periodLabels={periodLabels}
                                    rows={rows}
                                />
                            )}
        </div>
    );
}
