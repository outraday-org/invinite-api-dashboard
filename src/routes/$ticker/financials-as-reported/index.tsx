import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

import type { FiscalPeriodType, StatementType } from "@/lib/api/types";

import { FinancialsPresentationTable } from "@/components/financials-presentation/financials-presentation-table";
import { PeriodTypeButtons } from "@/components/financials-presentation/period-type-buttons";
import { StatementSelect } from "@/components/financials-presentation/statement-select";
import { ErrorState } from "@/components/ui/error-state";
import { useAsReportedFinancialsPresentation } from "@/lib/api/queries";

export const Route = createFileRoute("/$ticker/financials-as-reported/")({
    component: AsReportedFinancialsPage,
});

function AsReportedFinancialsPage() {
    const { ticker } = Route.useParams();

    const [statement, setStatement] = React.useState<StatementType>("income-statement");

    const [periodType, setPeriodType] = React.useState<FiscalPeriodType>("quarterly");

    const { data, error, isLoading } = useAsReportedFinancialsPresentation({
        fiscalPeriodType: periodType,
        identifier: ticker,
        limit: 8,
        statement,
    });

    const company = data?.companies[0];

    const periods = company?.periods ?? [];

    return (
        <div className="space-y-4 relative flex flex-col h-0 grow">
            <div className="flex flex-col shrink-0 gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div>As Reported Financials (Presentation)</div>
                    <div>
                        Financial data reported by the company (tree / presentation format)
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <StatementSelect
                        onValueChange={setStatement}
                        value={statement}
                    />

                    <PeriodTypeButtons
                        onValueChange={setPeriodType}
                        value={periodType}
                    />
                </div>
            </div>
            {error
                ? (
                        <ErrorState error={error} title="Failed to load as-reported financials" />
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
                                <FinancialsPresentationTable isCollapsible={false} periods={periods} />
                            )}
        </div>
    );
}
