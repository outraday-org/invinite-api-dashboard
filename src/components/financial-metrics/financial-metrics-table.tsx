import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumberEnCompact } from "@/lib/utils";

export type MetricsTableRow = {
    group?: string;
    key: string;
    label: string;
    formatValue?: (value: number) => string;
    values: Record<string, number | undefined>;
};

export type MetricsTablePeriod = {
    fiscal_quarter: number;
    fiscal_year: number;
    period_end: string;
};

export function buildPeriodLabel(period: MetricsTablePeriod) {
    if (period.fiscal_quarter && period.fiscal_quarter > 0) {
        return `Q${period.fiscal_quarter} ${period.fiscal_year}`;
    }

    return `${period.fiscal_year}`;
}

export function FinancialMetricsTable({
    formatValue,
    groupLabel = "Category",
    labelHeader = "Metric",
    periodLabels,
    rows,
}: {
    formatValue?: (value: number) => string;
    groupLabel?: string;
    labelHeader?: string;
    periodLabels: Array<string>;
    rows: Array<MetricsTableRow>;
}) {
    const hasGroupColumn = rows.some(row => row.group);

    return (
        <div className="space-y-2 flex flex-col h-0 grow">
            <ScrollArea className="grow h-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {hasGroupColumn
                                ? (
                                        <TableHead className="w-[320px] min-w-[320px] max-w-[320px]">
                                            {groupLabel}
                                        </TableHead>
                                    )
                                : null}
                            <TableHead className="w-[140px] min-w-[140px] max-w-[140px]">
                                {labelHeader}
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
                            <TableRow className="h-[41px] leading-5" key={row.key}>
                                {hasGroupColumn
                                    ? (
                                            <TableCell className="w-[320px] min-w-[320px] max-w-[320px]">
                                                <div className="truncate" title={row.group ?? ""}>
                                                    {row.group ?? "—"}
                                                </div>
                                            </TableCell>
                                        )
                                    : null}
                                <TableCell className="w-[140px] min-w-[140px] max-w-[140px]">
                                    <div className="truncate" title={row.label}>
                                        {row.label}
                                    </div>
                                </TableCell>
                                {periodLabels.map((label) => {
                                    const val = row.values[label];

                                    return (
                                        <TableCell className="text-right" key={`${row.key}:${label}`}>
                                            <span className="tabular-nums">
                                                {val === undefined
                                                    ? "—"
                                                    : ((row.formatValue ?? formatValue)
                                                            ? (row.formatValue ?? formatValue)!(val)
                                                            : formatNumberEnCompact(val))}
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
