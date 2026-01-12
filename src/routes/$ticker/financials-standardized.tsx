import { createFileRoute } from "@tanstack/react-router";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import type { FinancialPeriod, FiscalPeriodType, StatementType } from "@/lib/api/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStandardizedFinancials } from "@/lib/api/queries";

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
        <Card className="border-border/60">
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Standardized Financials</CardTitle>
                        <CardDescription>
                            Financial data normalized to standard metrics
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Select
                            onValueChange={v => setStatement(v as StatementType)}
                            value={statement}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
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
                                    size="sm"
                                    variant={periodType === opt.value ? "default" : "outline"}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
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
                                    <FinancialsTable periods={periods} />
                                )}
            </CardContent>
        </Card>
    );
}

type MetricRow = {
    metric: string;
    values: Record<string, number | undefined>;
};

function FinancialsTable({ periods }: { periods: Array<FinancialPeriod> }) {
    // Build period labels for column headers
    const periodLabels = periods.map((p) => {
        if (p.fiscal_quarter && p.fiscal_quarter > 0) {
            return `Q${p.fiscal_quarter} ${p.fiscal_year}`;
        }

        return `${p.fiscal_year}`;
    });

    // Extract all unique metrics from all periods
    const allMetrics = React.useMemo(() => {
        const metrics = new Set<string>();

        periods.forEach((p) => {
            Object.keys(p.facts).forEach(key => metrics.add(key));
        });

        return Array.from(metrics);
    }, [periods]);

    // Transform data into rows: one row per metric
    const rows: Array<MetricRow> = React.useMemo(() => {
        return allMetrics.map(metric => ({
            metric,
            values: Object.fromEntries(
                periods.map((p, idx) => [periodLabels[idx], p.facts[metric]]),
            ),
        }));
    }, [allMetrics, periods, periodLabels]);

    const columnHelper = createColumnHelper<MetricRow>();

    const columns = React.useMemo(() => [
        columnHelper.accessor("metric", {
            cell: info => <span className="font-medium">{info.getValue()}</span>,
            header: "Metric",
        }),
        ...periodLabels.map(label =>
            columnHelper.accessor(row => row.values[label], {
                cell: (info) => {
                    const val = info.getValue();

                    return (
                        <span className="tabular-nums">
                            {val === undefined ? "—" : val.toLocaleString()}
                        </span>
                    );
                },
                header: label,
                id: label,
            }),
        ),
    ], [columnHelper, periodLabels]);

    const table = useReactTable({
        columns,
        data: rows,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="border-border/60 overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <TableHead
                                    className={header.id !== "metric" ? "text-right" : ""}
                                    key={header.id}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <TableCell
                                    className={cell.column.id !== "metric" ? "text-right" : ""}
                                    key={cell.id}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
