import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

import type { FiscalPeriodType, SegmentedFinancialsSegmentId } from "@/lib/api/types";

import { PeriodTypeButtons } from "@/components/financials-presentation/period-type-buttons";
import { ErrorState } from "@/components/ui/error-state";
import { useSegmentedFinancials } from "@/lib/api/queries";
import { SegmentSelect } from "@/routes/$ticker/segmented-financials/-components/segment-select";
import { SegmentedFinancialsTable } from "@/routes/$ticker/segmented-financials/-components/segmented-financials-table";

export const Route = createFileRoute("/$ticker/segmented-financials/")({
    component: SegmentedFinancialsPage,
});

function SegmentedFinancialsPage() {
    const { ticker } = Route.useParams();

    const [periodType, setPeriodType] = React.useState<FiscalPeriodType>("quarterly");

    const [segmentId, setSegmentId] = React.useState<"all" | SegmentedFinancialsSegmentId>("all");

    const { data, error, isLoading } = useSegmentedFinancials({
        fiscalPeriodType: periodType,
        identifier: ticker,
        limit: 8,
        segmentId: segmentId === "all" ? undefined : segmentId,
    });

    const company = data?.companies[0];

    const periods = company?.periods ?? [];

    return (
        <div className="space-y-4 relative flex flex-col h-0 grow">
            <div className="flex flex-col shrink-0 gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div>Segmented Financials</div>
                    <div>
                        Financial data broken out by business segment in tabular format.
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <SegmentSelect onValueChange={setSegmentId} value={segmentId} />
                    <PeriodTypeButtons
                        onValueChange={setPeriodType}
                        value={periodType}
                    />
                </div>
            </div>
            {error
                ? (
                        <ErrorState error={error} title="Failed to load segmented financials" />
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
                                <SegmentedFinancialsTable periods={periods} />
                            )}
        </div>
    );
}
