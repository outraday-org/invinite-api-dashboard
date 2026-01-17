import type { ColumnDef } from "@tanstack/react-table";

import { createFileRoute } from "@tanstack/react-router";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import type { InstitutionalHolding, InstitutionalTransaction } from "@/lib/api/types";

import { ErrorState } from "@/components/ui/error-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInstitutionalHoldingsInfinite, useInstitutionalTransactionsInfinite, useInstitutions } from "@/lib/api/queries";
import { formatEnDateTime } from "@/lib/date";
import { formatNumberEn } from "@/lib/utils";
import { LoadMoreButton } from "@/routes/$ticker/filings/-components/load-more-button";

const transactionTypeLabel = (value: string) =>
    value
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

const normalizeCik = (value: string) => value.replace(/^0+/, "") || value;

export const Route = createFileRoute("/$ticker/institutions/")({
    component: InstitutionsPage,
});

function InstitutionsPage() {
    const { ticker } = Route.useParams();

    const {
        data: holdingsData,
        error: holdingsError,
        fetchNextPage: fetchHoldingsNextPage,
        hasNextPage: holdingsHasNextPage,
        isFetchingNextPage: isFetchingHoldingsNextPage,
        isLoading: isHoldingsLoading,
    } = useInstitutionalHoldingsInfinite({
        identifier: ticker,
        limit: 40,
        sort: "desc",
    });

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInstitutionalTransactionsInfinite({
        identifier: ticker,
        limit: 40,
        sort: "desc",
    });

    const holdings = React.useMemo(
        () => holdingsData?.pages.flatMap(page => page.holdings) ?? [],
        [holdingsData],
    );

    const transactions = React.useMemo(
        () => data?.pages.flatMap(page => page.transactions) ?? [],
        [data],
    );

    const institutionCiks = React.useMemo(() => {
        const ciks = new Set<string>();

        holdings.forEach((holding) => {
            if (holding.cik_institution) {
                ciks.add(String(holding.cik_institution));
            }
        });

        transactions.forEach((transaction) => {
            if (transaction.cik_institution) {
                ciks.add(String(transaction.cik_institution));
            }
        });

        return Array.from(ciks);
    }, [holdings, transactions]);

    const institutionsQuery = React.useMemo(
        () => institutionCiks.join(","),
        [institutionCiks],
    );

    const { data: institutionsData } = useInstitutions({
        ciks: institutionsQuery,
        limit: Math.min(1000, Math.max(100, institutionCiks.length)),
        sort: "asc",
    });

    const institutionNameByCik = React.useMemo(() => {
        const map = new Map<string, string>();

        institutionsData?.institutions.forEach((institution) => {
            const cik = String(institution.cik);

            const normalized = normalizeCik(cik);

            map.set(cik, institution.name);

            map.set(normalized, institution.name);
        });

        return map;
    }, [institutionsData]);

    const resolveInstitutionName = React.useCallback(
        (value: string) => institutionNameByCik.get(value) ?? institutionNameByCik.get(normalizeCik(value)) ?? value,
        [institutionNameByCik],
    );

    const currencyFormatter = React.useMemo(
        () => new Intl.NumberFormat("en", { currency: "USD", maximumFractionDigits: 2, style: "currency" }),
        [],
    );

    const holdingsColumns = React.useMemo<Array<ColumnDef<InstitutionalHolding>>>(
        () => [
            {
                accessorKey: "period_end",
                cell: ({ getValue }) => formatEnDateTime(String(getValue())),
                header: "Period End",
            },
            {
                accessorKey: "filing_date",
                cell: ({ getValue }) => formatEnDateTime(String(getValue())),
                header: "Filed",
            },
            {
                accessorKey: "cik_institution",
                cell: ({ getValue }) => (
                    <div className="truncate">
                        {resolveInstitutionName(String(getValue()))}
                    </div>
                ),
                header: "Institution",
            },
            {
                accessorKey: "shares_or_principal_amount",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());

                    return (
                        <div className="text-right tabular-nums">
                            {Number.isFinite(raw) ? formatNumberEn(raw) : "-"}
                        </div>
                    );
                },
                header: () => <div className="text-right">Shares</div>,
            },
            {
                accessorKey: "shares_or_principal_amount_type",
                header: "Amount Type",
            },
            {
                accessorKey: "dollar_value",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());

                    return (
                        <div className="text-right tabular-nums">
                            {Number.isFinite(raw) ? currencyFormatter.format(raw) : "-"}
                        </div>
                    );
                },
                header: () => <div className="text-right">Value</div>,
            },
        ],
        [currencyFormatter, resolveInstitutionName],
    );

    const transactionsColumns = React.useMemo<Array<ColumnDef<InstitutionalTransaction>>>(
        () => [
            {
                accessorKey: "period_end",
                cell: ({ getValue }) => formatEnDateTime(String(getValue())),
                header: "Period End",
            },
            {
                accessorKey: "filing_date",
                cell: ({ getValue }) => formatEnDateTime(String(getValue())),
                header: "Filed",
            },
            {
                accessorKey: "type",
                cell: ({ getValue }) => transactionTypeLabel(String(getValue())),
                header: "Type",
            },
            {
                accessorKey: "cik_institution",
                cell: ({ getValue }) => (
                    <div className="truncate">
                        {resolveInstitutionName(String(getValue()))}
                    </div>
                ),
                header: "Institution",
            },
            {
                accessorKey: "change_dollar_value",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());

                    return (
                        <div className="text-right tabular-nums">
                            {Number.isFinite(raw) ? currencyFormatter.format(raw) : "-"}
                        </div>
                    );
                },
                header: () => <div className="text-right">Change $</div>,
            },
            {
                accessorKey: "change_shares_or_principal_amount_absolute",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());

                    return (
                        <div className="text-right tabular-nums">
                            {Number.isFinite(raw) ? formatNumberEn(raw) : "-"}
                        </div>
                    );
                },
                header: () => <div className="text-right">Change Shares</div>,
            },
            {
                accessorKey: "change_shares_or_principal_amount_percent",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());

                    return (
                        <div className="text-right tabular-nums">
                            {Number.isFinite(raw) ? `${formatNumberEn(raw, { maximumFractionDigits: 2 })}%` : "-"}
                        </div>
                    );
                },
                header: () => <div className="text-right">Change %</div>,
            },
            {
                accessorKey: "shares_or_principal_amount_new",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());

                    return (
                        <div className="text-right tabular-nums">
                            {Number.isFinite(raw) ? formatNumberEn(raw) : "-"}
                        </div>
                    );
                },
                header: () => <div className="text-right">New Position</div>,
            },
            {
                accessorKey: "shares_or_principal_amount_old",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());

                    return (
                        <div className="text-right tabular-nums">
                            {Number.isFinite(raw) ? formatNumberEn(raw) : "-"}
                        </div>
                    );
                },
                header: () => <div className="text-right">Old Position</div>,
            },
            {
                accessorKey: "dollar_value",
                cell: ({ getValue }) => {
                    const raw = Number(getValue());

                    return (
                        <div className="text-right tabular-nums">
                            {Number.isFinite(raw) ? currencyFormatter.format(raw) : "-"}
                        </div>
                    );
                },
                header: () => <div className="text-right">Value</div>,
            },
        ],
        [currencyFormatter, resolveInstitutionName],
    );

    const holdingsTable = useReactTable({
        columns: holdingsColumns,
        data: holdings,
        getCoreRowModel: getCoreRowModel(),
    });

    const transactionsTable = useReactTable({
        columns: transactionsColumns,
        data: transactions,
        getCoreRowModel: getCoreRowModel(),
    });

    if (holdingsError || error) {
        return (
            <div className="space-y-4 relative flex flex-col h-0 grow">
                <ErrorState
                    error={holdingsError ?? error}
                    title="Failed to load institutional data"
                />
            </div>
        );
    }

    return (
        <div className="space-y-4 relative flex flex-col h-0 grow">
            <div className="flex flex-col gap-1">
                <div>Institutions</div>
                <div className="text-muted-foreground text-sm">
                    Institutional ownership and transaction activity for this symbol.
                </div>
            </div>

            <Tabs className="grow" defaultValue="ownership">
                <TabsList variant="line">
                    <TabsTrigger className="h-[34px] text-sm" value="ownership">Ownership</TabsTrigger>
                    <TabsTrigger className="h-[34px] text-sm" value="transactions">Transactions</TabsTrigger>
                </TabsList>

                <TabsContent className="grow relative mt-2" value="ownership">
                    <div className="flex flex-col h-full">
                        <ScrollArea className="h-0 grow">
                            <Table>
                                <TableHeader>
                                    {holdingsTable.getHeaderGroups().map(headerGroup => (
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
                                    {holdingsTable.getRowModel().rows.map(row => (
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
                                hasNextPage={Boolean(holdingsHasNextPage)}
                                isFetchingNextPage={isFetchingHoldingsNextPage}
                                onLoadMore={() => fetchHoldingsNextPage()}
                            />

                            {!isHoldingsLoading && holdings.length === 0 && (
                                <div className="text-muted-foreground w-full text-center text-xs p-2">
                                    No institutional ownership available.
                                </div>
                            )}

                            {isHoldingsLoading && holdings.length === 0 && (
                                <div className="text-muted-foreground w-full text-center text-xs p-2">
                                    Loading institutional ownership...
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </TabsContent>

                <TabsContent className="grow relative mt-2" value="transactions">
                    <div className="flex flex-col h-full">
                        <ScrollArea className="h-0 grow">
                            <Table>
                                <TableHeader>
                                    {transactionsTable.getHeaderGroups().map(headerGroup => (
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
                                    {transactionsTable.getRowModel().rows.map(row => (
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

                            {!isLoading && transactions.length === 0 && (
                                <div className="text-muted-foreground w-full text-center text-xs p-2">
                                    No institutional transactions available.
                                </div>
                            )}

                            {isLoading && transactions.length === 0 && (
                                <div className="text-muted-foreground w-full text-center text-xs p-2">
                                    Loading institutional transactions...
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
