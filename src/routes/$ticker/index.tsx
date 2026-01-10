import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { FilingsList } from '@/components/filings-list'
import { FinancialTable } from '@/components/financial-table'
import { FormatToggle } from '@/components/format-toggle'
import { StatementTabContent, StatementTabs } from '@/components/statement-tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCompanyDetails, useFilings, useFinancialStatement } from '@/lib/api/queries'

export const Route = createFileRoute('/$ticker/')({
  component: TickerDashboard,
})

type StatementKey = 'income' | 'balance' | 'cashflow' | 'snapshot'

const statementToPath: Record<StatementKey, 'income-statement' | 'balance-sheet' | 'cash-flow-statement' | 'snapshot'> =
  {
    income: 'income-statement',
    balance: 'balance-sheet',
    cashflow: 'cash-flow-statement',
    snapshot: 'snapshot',
  }

function TickerDashboard() {
  const { ticker } = Route.useParams()
  const [statement, setStatement] = React.useState<StatementKey>('income')
  const [kind, setKind] = React.useState<'standardized' | 'as-reported'>('standardized')
  const [view, setView] = React.useState<'base' | 'detailed' | 'presentation'>('base')
  const [fiscalPeriodType, setFiscalPeriodType] = React.useState<
    'quarterly' | 'annual' | 'ytd' | 'ttm'
  >('quarterly')
  const [formTypeFilter, setFormTypeFilter] = React.useState('')

  const { data: companyDetails, isLoading: detailsLoading } = useCompanyDetails(ticker)

  const { data: statementData, isLoading: statementLoading } = useFinancialStatement({
    identifier: ticker,
    kind,
    statement: statementToPath[statement],
    view,
    fiscal_period_type: fiscalPeriodType,
    sort: 'desc',
    limit: 8,
  })

  const filingsQuery = useFilings({
    identifier: ticker,
    form_type: formTypeFilter || undefined,
    sort: 'desc',
    limit: 20,
  })

  const company = companyDetails?.companies?.[0]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{ticker}</h1>
          <Badge variant="secondary">Invinite API Demo</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Standardized &amp; as-reported statements, detailed/presentation views, and SEC filings.
        </p>
      </header>

      <Card className="border-border/60">
        <CardHeader className="gap-2">
          <CardTitle>Company</CardTitle>
          <CardDescription>Basic details from the Invinite API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {detailsLoading ? (
            <div className="text-muted-foreground">Loading company details...</div>
          ) : company ? (
            <>
              <div className="font-semibold">{company.name}</div>
              <div className="text-muted-foreground">
                Ticker {company.ticker} · CIK {company.cik}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">No company data returned.</div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <StatementTabs value={statement} onChange={setStatement}>
            <StatementTabContent value={statement}>
              <FormatToggle
                kind={kind}
                view={view}
                fiscalPeriodType={fiscalPeriodType}
                onKindChange={setKind}
                onViewChange={setView}
                onPeriodChange={setFiscalPeriodType}
              />
            </StatementTabContent>
          </StatementTabs>
        </div>

        <Card className="border-border/60">
          <CardHeader className="gap-2">
            <CardTitle>Financials</CardTitle>
            <CardDescription>
              {kind === 'standardized' ? 'Standardized' : 'As-reported'} ·{' '}
              {view === 'base' ? 'Summary' : view.charAt(0).toUpperCase() + view.slice(1)} ·{' '}
              {fiscalPeriodType.toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statementLoading ? (
              <div className="text-muted-foreground text-sm">Loading financials...</div>
            ) : (
              <FinancialTable data={statementData} />
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card className="border-border/60">
        <CardHeader className="gap-2">
          <CardTitle>SEC Filings</CardTitle>
          <CardDescription>Filtered by form type, newest first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel htmlFor="form-type">Form type filter (e.g., 10-K, 10-Q)</FieldLabel>
            <Input
              id="form-type"
              placeholder="Leave empty for all form types"
              value={formTypeFilter}
              onChange={(e) => setFormTypeFilter(e.target.value)}
            />
          </Field>
          {filingsQuery.isLoading ? (
            <div className="text-muted-foreground text-sm">Loading filings...</div>
          ) : (
            <FilingsList
              ticker={ticker}
              filings={filingsQuery.data?.companies?.[0]?.filings ?? []}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
