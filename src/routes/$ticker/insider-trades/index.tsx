import type { ColumnDef } from "@tanstack/react-table";

import { createFileRoute } from "@tanstack/react-router";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import type { InsiderTrade } from "@/lib/api/types";

import { ErrorState } from "@/components/ui/error-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInsiderTradesInfinite } from "@/lib/api/queries";
import { formatEnDateTime } from "@/lib/date";
import { formatNumberEn } from "@/lib/utils";
import { LoadMoreButton } from "@/routes/$ticker/filings/-components/load-more-button";

export const Route = createFileRoute("/$ticker/insider-trades/")({
    component: InsiderTradesPage,
});

function InsiderTradesPage() {
    const { ticker } = Route.useParams();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInsiderTradesInfinite({
        identifier: ticker,
        limit: 40,
        sort: "desc",
    });

    const trades = React.useMemo(
        () => data?.pages.flatMap(page => page.transactions ?? []) ?? [],
        [data],
    );

    const currencyFormatter = React.useMemo(
        () => new Intl.NumberFormat("en", { currency: "USD", style: "currency" }),
        [],
    );

    const columns = React.useMemo<Array<ColumnDef<InsiderTrade>>>(
        () => [
            {
                accessorKey: "filed_at",
                cell: ({ getValue }) => formatEnDateTime(String(getValue()), { hideTime: false }),
                header: "Filed",
            },
            {
                accessorKey: "reporting_person_name",
                cell: ({ getValue }) => <div className="truncate">{String(getValue())}</div>,
                header: "Insider",
            },
            {
                cell: ({ row }) => {
                    const trade = row.original;
                    const roles: Array<string> = [];

                    if (trade.reporting_person_is_director) roles.push("Director");
                    if (trade.reporting_person_is_officer) roles.push("Officer");
                    if (trade.reporting_person_is_ten_percent_owner) roles.push("10% Owner");
                    if (trade.reporting_person_is_other) {
                        roles.push(trade.reporting_person_other_text?.trim() || "Other");
                    }

                    return <div className="truncate">{roles.length ? roles.join(", ") : "-"}</div>;
                },
                header: "Role",
                id: "role",
            },
            {
                accessorKey: "security_title",
                cell: ({ getValue }) => <div className="truncate">{String(getValue())}</div>,
                header: "Security",
            },
            {
                accessorKey: "acquired_disposed",
                cell: ({ getValue }) => {
                    const raw = String(getValue());
                    return raw === "A" ? "Acquire" : raw === "D" ? "Dispose" : raw;
                },
                header: "A/D",
            },
            {
                accessorKey: "coding_code",
                header: "Code",
            },
            {
                accessorKey: "shares",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());
                    return <div className="text-right tabular-nums">{Number.isFinite(raw) ? formatNumberEn(raw) : "-"}</div>;
                },
                header: () => <div className="text-right">Shares</div>,
            },
            {
                accessorKey: "share_price",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());
                    return (
                        <div className="text-right tabular-nums">
                            {Number.isFinite(raw) ? currencyFormatter.format(raw) : "-"}
                        </div>
                    );
                },
                header: () => <div className="text-right">Price</div>,
            },
            {
                accessorKey: "total",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());
                    return (
                        <div className="text-right tabular-nums">
                            {Number.isFinite(raw) ? currencyFormatter.format(raw) : "-"}
                        </div>
                    );
                },
                header: () => <div className="text-right">Total</div>,
            },
            {
                accessorKey: "shares_owned_following_transaction",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());
                    return <div className="text-right tabular-nums">{Number.isFinite(raw) ? formatNumberEn(raw) : "-"}</div>;
                },
                header: () => <div className="text-right">Owned After</div>,
            },
        ],
        [currencyFormatter],
    );

    const table = useReactTable({
        columns,
        data: trades,
        getCoreRowModel: getCoreRowModel(),
    });

    if (error) {
        return (
            <div className="space-y-4 relative flex flex-col h-0 grow">
                <ErrorState error={error} title="Failed to load insider trades" />
            </div>
        );
    }

    return (
        <div className="space-y-4 relative flex flex-col h-0 grow">
            <div className="flex flex-col gap-1">
                <div>Insider Trades</div>
                <div className="text-muted-foreground text-sm">
                    Insider transactions sorted by filing date (newest first).
                </div>
            </div>

            <div className="flex flex-col h-0 grow">
                <ScrollArea className="h-0 grow">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id}>
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
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <LoadMoreButton
                        hasNextPage={Boolean(hasNextPage)}
                        isFetchingNextPage={isFetchingNextPage}
                        onLoadMore={() => fetchNextPage()}
                    />

                    {!isLoading && trades.length === 0 && (
                        <div className="text-muted-foreground w-full text-center text-xs p-2">
                            No insider trades available.
                        </div>
                    )}

                    {isLoading && trades.length === 0 && (
                        <div className="text-muted-foreground w-full text-center text-xs p-2">
                            Loading insider trades...
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
