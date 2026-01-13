import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import * as React from "react";

import type { Filing } from "@/lib/api/types";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAvailableFormTypes, useFilingsInfinite } from "@/lib/api/queries";
import { formatEnDateTime } from "@/lib/date";

export const Route = createFileRoute("/$ticker/filings")({
    component: FilingsPage,
});

function FilingsPage() {
    const { ticker } = Route.useParams();

    const [formTypeFilter, setFormTypeFilter] = React.useState<null | string>(null);

    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

    // Fetch available form types for this identifier (ticker or CIK)
    const {
        data: availableFormTypesData,
        error: errorFormTypes,
        isLoading: loadingFormTypes,
    } = useAvailableFormTypes({
        identifier: ticker,
    });

    // Fetch filings paginated (offset-based) when filter is applied
    const {
        data: pagedData,
        error: errorPaged,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: loadingPaged,
    } = useFilingsInfinite({
        formType: formTypeFilter ?? undefined,
        identifier: ticker,
        limit: 40,
        sort: sortDirection,
    });

    const displayFilings = React.useMemo(
        () => pagedData?.pages.flatMap(page => page.companies[0]?.filings ?? []) ?? [],
        [pagedData],
    );

    const availableFormTypes = React.useMemo(
        () => availableFormTypesData?.form_types ?? [],
        [availableFormTypesData],
    );

    const isLoading = loadingFormTypes || loadingPaged;

    const error = errorFormTypes ?? errorPaged;

    let content: React.ReactNode;

    if (error) {
        content = <ErrorState error={error} title="Failed to load filings" />;
    }
    else {
        content = (
            <div className="flex flex-col h-0 grow">
                <div className="hidden sm:grid gap-x-6 gap-y-1 sm:grid-cols-5 sm:items-center text-muted-foreground text-xs pb-2">
                    <div>Form Type</div>
                    <div>Accession Number</div>
                    <div>Period End</div>
                    <div>Downloads</div>
                    <button
                        className="inline-flex cursor-pointer w-full items-center justify-end gap-1 text-right hover:text-foreground transition-colors"
                        onClick={() => setSortDirection(prev => (prev === "desc" ? "asc" : "desc"))}
                        title={sortDirection === "desc" ? "Sort ascending" : "Sort descending"}
                        type="button"
                    >
                        <span>Filed</span>
                        {sortDirection === "desc"
                            ? <ArrowDownIcon className="size-4 mb-px" />
                            : <ArrowUpIcon className="size-4 mb-px" />}
                    </button>
                </div>
                <Separator />
                <ScrollArea className="h-0 grow">
                    <div className="space-y-4 pt-4">
                        {displayFilings.map(filing => (
                            <FilingItem filing={filing} key={filing.accession_number} />
                        ))}
                    </div>

                    <div className="flex items-center justify-center pt-2">
                        {hasNextPage
                            ? (
                                    <Button
                                        disabled={isFetchingNextPage}
                                        onClick={() => fetchNextPage()}
                                        type="button"
                                        variant="outline"
                                    >
                                        {isFetchingNextPage
                                            ? "Loading..."
                                            : "Load more"}
                                    </Button>
                                )
                            : (
                                    <div className="text-muted-foreground text-xs">End of results</div>
                                )}
                    </div>

                    {!isLoading && displayFilings.length === 0 && (
                        <div className="text-muted-foreground w-full text-center text-xs p-2">No filings found.</div>
                    )}
                </ScrollArea>
            </div>
        );
    }

    return (
        <div className="space-y-4 relative flex flex-col h-0 grow">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <div className="text-sm font-semibold">SEC Filings</div>
                    <div className="text-muted-foreground text-xs">
                        Filtered by form type,
                        {" "}
                        {sortDirection === "desc" ? "newest first" : "oldest first"}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        disabled={loadingFormTypes || availableFormTypes.length === 0}
                        onValueChange={val => setFormTypeFilter(val === "all" ? null : val)}
                        value={formTypeFilter ?? "all"}
                    >
                        <SelectTrigger className="w-[180px]">
                            {!formTypeFilter || formTypeFilter === "all" ? "All form types" : <SelectValue />}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All form types</SelectItem>
                            {availableFormTypes.map(type => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {content}
        </div>
    );
}

function FilingItem({ filing }: { filing: Filing }) {
    return (
        <>
            <div className="grid gap-x-6 gap-y-1 sm:grid-cols-5 sm:items-center">
                <div className="text-sm font-semibold">{filing.form_type}</div>

                <div className="text-muted-foreground text-xs min-w-0 truncate">
                    {filing.accession_number}
                </div>

                <div className="text-muted-foreground text-xs min-w-0 truncate">
                    {filing.period_end
                        ? (
                                <>
                                    {formatEnDateTime(filing.period_end, { hideTime: true })}
                                </>
                            )
                        : (
                                "—"
                            )}
                </div>

                <div className="flex items-center justify-start gap-x-3 text-xs">
                    {filing.html_url
                        ? (
                                <a
                                    className="text-primary hover:underline inline-flex w-12 justify-start leading-none"
                                    href={filing.html_url}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    HTML
                                </a>
                            )
                        : (
                                <span className="w-12" />
                            )}
                    {filing.pdf_url
                        ? (
                                <a
                                    className="text-primary hover:underline inline-flex w-12 justify-start leading-none"
                                    href={filing.pdf_url}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    PDF
                                </a>
                            )
                        : (
                                <span className="w-12" />
                            )}
                </div>

                <div className="text-muted-foreground text-xs sm:text-right">
                    {formatEnDateTime(filing.filing_date, { hideTime: true })}
                </div>
            </div>
            <Separator />
        </>
    );
}
