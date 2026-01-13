import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { useCompanyDetails } from "@/lib/api/queries";

export const Route = createFileRoute("/$ticker/")({
    component: TickerOverview,
});

function formatEnDateTime(value: string) {
    // API marks this as `format: date` (YYYY-MM-DD). Date-only strings parse as UTC in JS,
    // which can shift the displayed day depending on local timezone. Force local midnight.
    const parsed = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    const hasTime = value.includes("T");

    return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : null),
    }).format(parsed);
}

function TickerOverview() {
    const { ticker } = Route.useParams();

    const { data, error, isLoading } = useCompanyDetails(ticker);

    const company = data?.companies[0];

    if (error) {
        return <ErrorState error={error} title="Failed to load company details" />;
    }

    if (isLoading) {
        return <div className="text-muted-foreground">Loading company details...</div>;
    }

    if (!company) {
        return <div className="text-muted-foreground">No company data found.</div>;
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle>Company Info</CardTitle>
                    <CardDescription>Basic details from the Invinite API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Ticker</span>
                        <span className="font-medium">{company.ticker}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">CIK</span>
                        <span className="font-medium">{company.cik}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Sector</span>
                        <span className="font-medium">{company.sector}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span className="font-medium">{company.industry}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency</span>
                        <span className="font-medium">{company.currency}</span>
                    </div>
                    {company.employees && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Employees</span>
                            <span className="font-medium">
                                {company.employees.toLocaleString()}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle>Market Data</CardTitle>
                    <CardDescription>Key financial metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {company.market_cap && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Market Cap</span>
                            <span className="font-medium">
                                $
                                {(company.market_cap / 1e9).toFixed(2)}
                                B
                            </span>
                        </div>
                    )}
                    {company.shares_outstanding && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shares Outstanding</span>
                            <span className="font-medium">
                                {(company.shares_outstanding / 1e6).toFixed(1)}
                                M
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Exchange</span>
                        <span className="font-medium">{company.exchange}</span>
                    </div>
                    {company.employees && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Employees</span>
                            <span className="font-medium">
                                {company.employees.toLocaleString()}
                            </span>
                        </div>
                    )}
                    {company.list_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Listed since</span>
                            <span className="font-medium">{formatEnDateTime(company.list_date)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {company.description && (
                <Card className="border-border/60 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {company.description}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
