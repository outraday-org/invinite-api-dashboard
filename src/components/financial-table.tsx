"use client"

import * as React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type StatementResponse = {
  companies?: Array<{
    ticker?: string
    cik?: string
    periods?: Array<{
      fiscal_year?: number
      fiscal_quarter?: number | null
      period_end?: string
      facts?: Record<string, number>
    }>
  }>
}

type FinancialTableProps = {
  data?: StatementResponse
  className?: string
}

export function FinancialTable({ data, className }: FinancialTableProps) {
  const company = data?.companies?.[0]
  const periods = company?.periods ?? []

  const periodLabels = periods.map((period) => {
    const fy = period.fiscal_year
    const fq = period.fiscal_quarter
    if (fq && fq > 0) return `Q${fq} ${fy}`
    return `${fy ?? ""}`.trim()
  })

  const metricKeys = React.useMemo(() => {
    const keys = new Set<string>()
    periods.forEach((period) => {
      Object.keys(period.facts ?? {}).forEach((key) => keys.add(key))
    })
    return Array.from(keys)
  }, [periods])

  if (!company || periods.length === 0) {
    return (
      <div className={cn("border-border/60 text-muted-foreground border rounded-lg p-6", className)}>
        No data available.
      </div>
    )
  }

  return (
    <div className={cn("border-border/60 border rounded-lg", className)}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm font-semibold">{company.ticker}</div>
        <div className="text-muted-foreground text-xs">Periods: {periods.length}</div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            {periodLabels.map((label, idx) => (
              <TableHead key={idx} className="text-right">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {metricKeys.map((metric) => (
            <TableRow key={metric}>
              <TableCell className="font-medium">{metric}</TableCell>
              {periods.map((period, idx) => {
                const value = period.facts?.[metric]
                return (
                  <TableCell key={`${metric}-${idx}`} className="text-right tabular-nums">
                    {value === undefined ? "—" : value.toLocaleString()}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
