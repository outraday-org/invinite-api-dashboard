import { createFileRoute } from '@tanstack/react-router'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TickerSearch } from '@/components/ticker-search'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 lg:px-8">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Invinite API</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Financial data dashboard built with TanStack Start, Tailwind, shadcn/ui, Base UI.
        </h1>
        <p className="text-muted-foreground max-w-3xl text-lg">
          Demo and marketing reference for the Invinite API. Enter a ticker to view standardized &amp;
          as-reported statements, detailed and presentation formats, plus SEC filings in one place.
        </p>
      </section>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Jump to a ticker</CardTitle>
          <CardDescription>Type a ticker or company name to open its dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <TickerSearch />
        </CardContent>
      </Card>

      <Separator />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: 'Server-only API calls',
            body: 'All requests run via TanStack Start server functions using @t3-oss/env-core for the API key.',
          },
          {
            title: 'Financial statements',
            body: 'Toggle standardized vs. as-reported, detailed vs. presentation, and fiscal period types.',
          },
          {
            title: 'SEC filings',
            body: 'Filter by form type and link out to HTML/PDF filings.',
          },
        ].map((item) => (
          <Card key={item.title} className="border-border/60">
            <CardHeader className="gap-2">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  )
}