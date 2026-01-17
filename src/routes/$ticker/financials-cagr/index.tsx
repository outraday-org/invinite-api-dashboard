import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

import type { CagrPeriodYears } from "@/lib/api/types";

import { buildPeriodLabel, FinancialMetricsTable } from "@/components/financial-metrics/financial-metrics-table";
import { ErrorState } from "@/components/ui/error-state";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useFinancialCagr } from "@/lib/api/queries";
import { formatMetricId, formatPercentCompact } from "@/lib/utils";

export const Route = createFileRoute("/$ticker/financials-cagr/")({
    component: FinancialCagrPage,
});

const cagrPeriodOptions: Array<{ label: string; value: "3" | "5" | "10" | "all" }> = [
    { label: "All Periods", value: "all" },
    { label: "3 Year CAGR", value: "3" },
    { label: "5 Year CAGR", value: "5" },
    { label: "10 Year CAGR", value: "10" },
];

function FinancialCagrPage() {
    const { ticker } = Route.useParams();

    const [periodYears, setPeriodYears] = React.useState<"3" | "5" | "10" | "all">("all");

    const { data, error, isLoading } = useFinancialCagr({
        identifier: ticker,
        limit: 8,
        periodYears: periodYears === "all" ? undefined : (Number(periodYears) as CagrPeriodYears),
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

            Object.entries(period.facts).forEach(([yearsKey, metricsMap]) => {
                if (periodYears !== "all" && yearsKey !== periodYears) return;

                const years = Number(yearsKey);

                Object.entries(metricsMap).forEach(([metricId, value]) => {
                    const rowKey = `${metricId}:${years}`;

                    const metricLabel = `${formatMetricId(metricId)} (${years}Y CAGR)`;

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
            .sort((a, b) => {
                const [aMetricId, aYearsRaw] = a.key.split(":");

                const [bMetricId, bYearsRaw] = b.key.split(":");

                const metricCompare = aMetricId.localeCompare(bMetricId);

                if (metricCompare !== 0) return metricCompare;

                const aYears = Number(aYearsRaw);

                const bYears = Number(bYearsRaw);

                if (aYears !== bYears) return bYears - aYears;

                return a.label.localeCompare(b.label);
            });
    }, [periodLabels, periodYears, periods]);

    return (
        <div className="space-y-4 relative flex flex-col h-0 grow">
            <div className="flex flex-col shrink-0 gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div>CAGR Financials</div>
                    <div>
                        Compound annual growth rates by metric.
                    </div>
                </div>
                <Select
                    onValueChange={value => setPeriodYears(value as "3" | "5" | "10" | "all")}
                    value={periodYears}
                >
                    <SelectTrigger className="w-[200px]">
                        {cagrPeriodOptions.find(opt => opt.value === periodYears)?.label ?? "CAGR Period"}
                    </SelectTrigger>
                    <SelectContent>
                        {cagrPeriodOptions.map(opt => (
                            <SelectItem key={opt.value} value={String(opt.value)}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {error
                ? (
                        <ErrorState error={error} title="Failed to load CAGR financials" />
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
