import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { useCompanyDetails } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$ticker")({
    component: TickerLayout,
});

const tabs = [
    { label: "Overview", to: "/$ticker" },
    { label: "Filings", to: "/$ticker/filings" },
    { label: "Standardized Financials", to: "/$ticker/financials-standardized" },
] as const;

function TickerLayout() {
    const { ticker } = Route.useParams();

    const { data, error } = useCompanyDetails(ticker);

    const company = data?.companies[0];

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">{ticker}</h1>
                    {company && (
                        <span className="text-muted-foreground text-lg">{company.name}</span>
                    )}
                    <Badge variant="secondary">Invinite API</Badge>
                </div>
            </header>

            {error ? <ErrorState error={error} title="Failed to load company header details" /> : null}

            <nav className="border-border/60 flex gap-1 border-b">
                {tabs.map(tab => (
                    <Link
                        activeOptions={{ exact: tab.to === "/$ticker" }}
                        className={cn(
                            "text-muted-foreground hover:text-foreground border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors",
                            "data-[status=active]:border-primary data-[status=active]:text-foreground",
                        )}
                        key={tab.to}
                        params={{ ticker }}
                        to={tab.to}
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>

            <Outlet />
        </div>
    );
}
