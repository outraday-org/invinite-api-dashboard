import { createFileRoute } from "@tanstack/react-router";

import { ApiKeyInlineField } from "@/components/api-key-inline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/")({
    component: IndexPage,
});

function IndexPage() {
    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 lg:px-8">
            <section className="space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Invinite API</p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Financial Data Dashboard
                </h1>
                <p className="text-muted-foreground max-w-3xl text-lg">
                    Demo project for using the Invinite API. Enter a ticker to view company info,
                    standardized financial statements, and SEC filings.
                </p>
            </section>

            <Card className="border-border/60">
                <CardContent>
                    <ApiKeyInlineField />
                </CardContent>
            </Card>

            <Separator />

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                    {
                        body: "View company details, market data, and key financial information at a glance.",
                        title: "Company Overview",
                    },
                    {
                        body: "Browse standardized financials with TanStack Table. Filter by statement type and period.",
                        title: "Standardized Financials",
                    },
                    {
                        body: "Filter SEC filings by form type and link out to HTML/PDF filings.",
                        title: "SEC Filings",
                    },
                ].map(item => (
                    <Card className="border-border/60" key={item.title}>
                        <CardHeader className="gap-2">
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            <CardDescription>{item.body}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </section>
        </div>
    );
}
