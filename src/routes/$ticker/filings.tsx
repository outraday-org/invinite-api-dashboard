import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowDownIcon, ArrowUpIcon, ExternalLink } from "lucide-react";
import * as React from "react";

import type { Filing } from "@/lib/api/types";

import { HtmlViewer } from "@/components/html-viewer";
import { PdfViewer } from "@/components/pdf-viewer";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAvailableFormTypes, useFilingsInfinite } from "@/lib/api/queries";
import { formatEnDateTime } from "@/lib/date";

export const Route = createFileRoute("/$ticker/filings")({
    component: FilingsPage,
});

function formatFiscalQuarterLabel(periodEnd: string) {
    // Prefer YYYY-MM-DD parsing without timezone ambiguity
    const d = /^\d{4}-\d{2}-\d{2}$/.test(periodEnd)
        ? new Date(`${periodEnd}T00:00:00Z`)
        : new Date(periodEnd);

    if (Number.isNaN(d.getTime())) return null;

    const month = d.getUTCMonth() + 1; // 1-12

    const quarter = Math.floor((month - 1) / 3) + 1; // 1-4

    const yy = String(d.getUTCFullYear() % 100).padStart(2, "0");

    return `Q${quarter} FY${yy}`;
}

function FilingsPage() {
    const { ticker } = Route.useParams();

    const [formTypeFilter, setFormTypeFilter] = React.useState<null | string>(null);

    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

    const [pdfDialog, setPdfDialog] = React.useState<null | {
        url: string;
        ticker: string;
        formType: string;
        accessionNumber: string;
        filingDate: string;
        periodEnd: null | string;
    }>(null);

    const [htmlDialog, setHtmlDialog] = React.useState<null | {
        url: string;
        ticker: string;
        formType: string;
        accessionNumber: string;
        filingDate: string;
        periodEnd: null | string;
    }>(null);

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
                    <div>Fiscal Period</div>
                    <div>Files</div>
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
                            <FilingItem
                                filing={filing}
                                key={filing.accession_number}
                                onOpenHtml={(url) => {
                                    setHtmlDialog({
                                        accessionNumber: filing.accession_number,
                                        filingDate: filing.filing_date,
                                        formType: filing.form_type,
                                        periodEnd: filing.period_end,
                                        ticker,
                                        url,
                                    });
                                }}
                                onOpenPdf={(url) => {
                                    setPdfDialog({
                                        accessionNumber: filing.accession_number,
                                        filingDate: filing.filing_date,
                                        formType: filing.form_type,
                                        periodEnd: filing.period_end,
                                        ticker,
                                        url,
                                    });
                                }}
                            />
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
                                        <ArrowDown className="size-4" />
                                        {isFetchingNextPage
                                            ? "Loading..."
                                            : "Load more"}
                                    </Button>
                                )
                            : null}
                    </div>

                    {!isLoading && displayFilings.length === 0 && (
                        <div className="text-muted-foreground w-full text-center text-xs p-2">No filings found.</div>
                    )}

                    {isLoading && displayFilings.length === 0 && (
                        <div className="text-muted-foreground w-full text-center text-xs p-2">Loading...</div>
                    )}
                </ScrollArea>
            </div>
        );
    }

    return (
        <div className="space-y-4 relative flex flex-col h-0 grow">
            <Dialog
                onOpenChange={(open) => {
                    if (!open) setHtmlDialog(null);
                }}
                open={Boolean(htmlDialog)}
            >
                <DialogContent className="sm:max-w-6xl h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] p-0">
                    <div className="flex h-full min-h-0 flex-col">
                        <div className="p-4 pb-2 flex flex-col shrink-0">
                            <DialogHeader>
                                <DialogTitle className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="truncate">{htmlDialog?.ticker ?? ticker}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="truncate">{htmlDialog?.formType ?? "HTML"}</span>
                                            {htmlDialog?.periodEnd
                                                ? (
                                                        <>
                                                            <span className="text-muted-foreground">•</span>
                                                            <span className="truncate">
                                                                {formatFiscalQuarterLabel(htmlDialog.periodEnd) ?? "—"}
                                                            </span>
                                                        </>
                                                    )
                                                : null}
                                        </div>
                                    </div>
                                    {htmlDialog?.url && (
                                        <a
                                            className="text-primary flex items-center gap-1 hover:underline text-xs font-normal shrink-0"
                                            href={htmlDialog.url}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            Open in new tab
                                            {" "}
                                            <ExternalLink className="size-3 mb-0.5" />
                                        </a>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    HTML preview
                                </DialogDescription>
                            </DialogHeader>
                            <div className="shrink-0 text-muted-foreground text-xs mt-0.5 flex items-center gap-2 min-w-0">
                                <span className="truncate">{htmlDialog?.accessionNumber ?? ""}</span>
                                {htmlDialog?.filingDate
                                    ? (
                                            <>
                                                <span>•</span>
                                                <span className="truncate">
                                                    {formatEnDateTime(htmlDialog.filingDate, { hideTime: true })}
                                                </span>
                                            </>
                                        )
                                    : null}
                            </div>
                        </div>

                        <div className="px-4 pb-4 min-h-0 grow">
                            {htmlDialog?.url
                                ? (
                                        <HtmlViewer className="h-full" title={`${htmlDialog.ticker} ${htmlDialog.formType}`} url={htmlDialog.url} />
                                    )
                                : null}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                onOpenChange={(open) => {
                    if (!open) setPdfDialog(null);
                }}
                open={Boolean(pdfDialog)}
            >
                <DialogContent className="sm:max-w-6xl h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] p-0">
                    <div className="flex h-full min-h-0 flex-col">
                        <div className="p-4 pb-2 flex flex-col shrink-0">
                            <DialogHeader>
                                <DialogTitle className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="truncate">{pdfDialog?.ticker ?? ticker}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="truncate">{pdfDialog?.formType ?? "PDF"}</span>
                                            {pdfDialog?.periodEnd
                                                ? (
                                                        <>
                                                            <span className="text-muted-foreground">•</span>
                                                            <span className="truncate">
                                                                {formatFiscalQuarterLabel(pdfDialog.periodEnd) ?? "—"}
                                                            </span>
                                                        </>
                                                    )
                                                : null}
                                        </div>

                                    </div>
                                    {pdfDialog?.url && (
                                        <a
                                            className="text-primary flex items-center gap-1 hover:underline text-xs font-normal shrink-0"
                                            href={pdfDialog.url}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            Open in new tab
                                            {" "}
                                            <ExternalLink className="size-3 mb-0.5" />
                                        </a>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    PDF preview
                                </DialogDescription>
                            </DialogHeader>
                            <div className="shrink-0 text-muted-foreground text-xs mt-0.5 flex items-center gap-2 min-w-0">
                                <span className="truncate">{pdfDialog?.accessionNumber ?? ""}</span>
                                {pdfDialog?.filingDate
                                    ? (
                                            <>
                                                <span>•</span>
                                                <span className="truncate">
                                                    {formatEnDateTime(pdfDialog.filingDate, { hideTime: true })}
                                                </span>
                                            </>
                                        )
                                    : null}
                            </div>
                        </div>

                        <div className="px-4 pb-4 min-h-0 grow">
                            {pdfDialog?.url
                                ? (
                                        <PdfViewer className="h-full" url={pdfDialog.url} />
                                    )
                                : null}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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

function FilingItem({
    filing,
    onOpenHtml,
    onOpenPdf,
}: {
    filing: Filing;
    onOpenHtml: (url: string) => void;
    onOpenPdf: (url: string) => void;
}) {
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
                                    {formatFiscalQuarterLabel(filing.period_end) ?? "—"}
                                </>
                            )
                        : (
                                "—"
                            )}
                </div>

                <div className="flex items-center justify-start gap-x-3 text-xs">
                    {filing.html_url
                        ? (
                                <button
                                    className="text-primary cursor-pointer hover:underline inline-flex w-12 justify-start leading-none"
                                    onClick={() => onOpenHtml(filing.html_url!)}
                                    type="button"
                                >
                                    HTML
                                </button>
                            )
                        : (
                                <span className="w-12" />
                            )}
                    {filing.pdf_url
                        ? (
                                <button
                                    className="text-primary cursor-pointer hover:underline inline-flex w-12 justify-start leading-none"
                                    onClick={() => onOpenPdf(filing.pdf_url!)}
                                    type="button"
                                >
                                    PDF
                                </button>
                            )
                        : (
                                <span className="w-12" />
                            )}
                </div>

                <div className="text-muted-foreground text-xs sm:text-right pr-2">
                    {formatEnDateTime(filing.filing_date, { hideTime: true })}
                </div>
            </div>
            <Separator />
        </>
    );
}
