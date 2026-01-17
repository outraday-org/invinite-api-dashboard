import * as React from "react";

import type { SegmentedFinancialPeriod } from "@/lib/api/types";

import { MetricChartDialog } from "@/components/metric-chart/metric-chart-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMetricId, formatNumberEnCompact, formatSegmentId } from "@/lib/utils";

type SegmentedRow = {
    axis?: null | string;
    key: string;
    member?: null | string;
    metricId: string;
    segmentId: string;
    values: Record<string, number | undefined>;
};

const buildPeriodLabel = (period: SegmentedFinancialPeriod) => {
    if (period.fiscal_quarter && period.fiscal_quarter > 0) {
        return `Q${period.fiscal_quarter} ${period.fiscal_year}`;
    }

    return `${period.fiscal_year}`;
};

const formatSegmentLabel = (row: SegmentedRow) => {
    const rawDetails = row.member ?? row.axis;

    const details = rawDetails
        ? rawDetails
                .replace(/(SegmentMember|Member)$/u, "")
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/(\w)and\b/g, "$1 and")
                .trim()
        : undefined;

    const segmentLabel = formatSegmentId(row.segmentId);

    return details ? `${segmentLabel} · ${details}` : segmentLabel;
};

export function SegmentedFinancialsTable({ periods }: { periods: Array<SegmentedFinancialPeriod> }) {
    const periodLabels = React.useMemo(() => periods.map(buildPeriodLabel), [periods]);

    const [selectedRow, setSelectedRow] = React.useState<null | SegmentedRow>(null);

    const rows = React.useMemo(() => {
        const rowMap = new Map<string, SegmentedRow>();

        periods.forEach((period, periodIndex) => {
            const periodLabel = periodLabels[periodIndex];

            Object.entries(period.facts).forEach(([metricId, facts]) => {
                facts.forEach((fact) => {
                    const keyParts = [metricId, fact.segment_id, fact.axis ?? "", fact.member ?? ""];

                    const key = keyParts.join("::");

                    if (!rowMap.has(key)) {
                        rowMap.set(key, {
                            axis: fact.axis,
                            key,
                            member: fact.member,
                            metricId,
                            segmentId: fact.segment_id,
                            values: {},
                        });
                    }

                    const row = rowMap.get(key)!;

                    const current = row.values[periodLabel] ?? 0;

                    row.values[periodLabel] = current + fact.value;
                });
            });
        });

        const out = Array.from(rowMap.values()).map(row => ({
            ...row,
            values: Object.fromEntries(
                periodLabels.map(label => [label, row.values[label]]),
            ),
        }));

        return out
            .filter(row => !periodLabels.every(label => (row.values[label] ?? 0) === 0))
            .sort((a, b) => {
                if (a.metricId !== b.metricId) return a.metricId.localeCompare(b.metricId);

                if (a.segmentId !== b.segmentId) return a.segmentId.localeCompare(b.segmentId);

                return `${a.member ?? ""}${a.axis ?? ""}`.localeCompare(`${b.member ?? ""}${b.axis ?? ""}`);
            });
    }, [periodLabels, periods]);

    return (
        <div className="space-y-2 flex flex-col h-0 grow">
            <ScrollArea className="grow h-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[260px] min-w-[260px] max-w-[260px]">Metric</TableHead>
                            <TableHead className="w-[300px] min-w-[300px] max-w-[300px]">Segment</TableHead>
                            {periodLabels.map(label => (
                                <TableHead className="text-right" key={label}>
                                    {label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y-0">
                        {rows.map(row => (
                            <TableRow
                                className="h-[41px] leading-5 cursor-pointer hover:bg-muted/50"
                                key={row.key}
                                onClick={() => setSelectedRow(row)}
                            >
                                <TableCell className="w-[260px] min-w-[260px] max-w-[260px]">
                                    <div className="font-medium truncate" title={formatMetricId(row.metricId)}>
                                        {formatMetricId(row.metricId)}
                                    </div>
                                </TableCell>
                                <TableCell className="w-[300px] min-w-[300px] max-w-[300px]">
                                    <div className="truncate" title={formatSegmentLabel(row)}>
                                        {formatSegmentLabel(row)}
                                    </div>
                                </TableCell>
                                {periodLabels.map((label) => {
                                    const val = row.values[label];

                                    return (
                                        <TableCell className="text-right" key={`${row.key}:${label}`}>
                                            <span className="tabular-nums">
                                                {val === undefined
                                                    ? "—"
                                                    : formatNumberEnCompact(val)}
                                            </span>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
            <MetricChartDialog
                data={selectedRow
                    ? periodLabels.map(period => ({
                            period,
                            value: selectedRow.values[period],
                        }))
                    : []}
                formatValue={formatNumberEnCompact}
                metricLabel={selectedRow
                    ? `${formatMetricId(selectedRow.metricId)} · ${formatSegmentLabel(selectedRow)}`
                    : ""}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedRow(null);
                    }
                }}
                open={Boolean(selectedRow)}
            />
        </div>
    );
}
