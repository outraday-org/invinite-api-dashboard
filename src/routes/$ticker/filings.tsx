import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

import type { Filing } from "@/lib/api/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useFilings } from "@/lib/api/queries";

export const Route = createFileRoute("/$ticker/filings")({
    component: FilingsPage,
});

function FilingsPage() {
    const { ticker } = Route.useParams();

    const [formTypeFilter, setFormTypeFilter] = React.useState<null | string>(null);

    // First fetch all filings to extract available form types
    const { data: allFilingsData, error: errorAll, isLoading: loadingAll } = useFilings({
        identifier: ticker,
        limit: 100,
    });

    // Fetch filtered filings when filter is applied
    const { data: filteredData, error: errorFiltered, isLoading: loadingFiltered } = useFilings({
        formType: formTypeFilter ?? undefined,
        identifier: ticker,
        limit: 40,
    });

    const allFilings = React.useMemo(() => allFilingsData?.companies[0]?.filings ?? [], [allFilingsData]);

    const displayFilings = filteredData?.companies[0]?.filings ?? [];

    // Extract unique form types from all filings
    const availableFormTypes = React.useMemo(() => {
        const types = new Set(allFilings.map(f => f.form_type));

        return Array.from(types).sort();
    }, [allFilings]);

    const isLoading = loadingAll || loadingFiltered;

    const error = errorAll ?? errorFiltered;

    let content: React.ReactNode;

    if (error) {
        content = <ErrorState error={error} title="Failed to load filings" />;
    }
    else if (isLoading) {
        content = <div className="text-muted-foreground text-sm">Loading filings...</div>;
    }
    else if (displayFilings.length === 0) {
        content = <div className="text-muted-foreground text-sm">No filings found.</div>;
    }
    else {
        content = (
            <div className="space-y-4">
                {displayFilings.map(filing => (
                    <FilingItem filing={filing} key={filing.accession_number} />
                ))}
            </div>
        );
    }

    return (
        <Card className="border-border/60">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>SEC Filings</CardTitle>
                        <CardDescription>Filtered by form type, newest first</CardDescription>
                    </div>
                    <Select
                        disabled={availableFormTypes.length === 0}
                        onValueChange={setFormTypeFilter}
                        value={formTypeFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
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
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    );
}

function FilingItem({ filing }: { filing: Filing }) {
    return (
        <>
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{filing.form_type}</span>
                    <span className="text-muted-foreground text-xs">
                        Filed
                        {" "}
                        {filing.filing_date}
                    </span>
                </div>
                <div className="text-muted-foreground text-xs">
                    Accession:
                    {" "}
                    {filing.accession_number}
                    {filing.period_end ? ` · Period end ${filing.period_end}` : ""}
                </div>
                <div className="flex items-center gap-3 text-xs">
                    {filing.html_url && (
                        <a
                            className="text-primary hover:underline"
                            href={filing.html_url}
                            rel="noreferrer"
                            target="_blank"
                        >
                            HTML
                        </a>
                    )}
                    {filing.pdf_url && (
                        <a
                            className="text-primary hover:underline"
                            href={filing.pdf_url}
                            rel="noreferrer"
                            target="_blank"
                        >
                            PDF
                        </a>
                    )}
                </div>
            </div>
            <Separator />
        </>
    );
}
