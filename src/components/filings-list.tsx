"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Filing = {
  accession_number: string
  filing_date: string
  form_type: string
  html_url?: string | null
  pdf_url?: string | null
  period_end?: string | null
}

type FilingsListProps = {
  ticker?: string
  filings?: Filing[]
}

export function FilingsList({ ticker, filings = [] }: FilingsListProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>SEC Filings {ticker ? `· ${ticker}` : ""}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filings.length === 0 ? (
          <p className="text-muted-foreground text-sm">No filings available.</p>
        ) : (
          filings.map((filing) => (
            <React.Fragment key={filing.accession_number}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{filing.form_type}</div>
                  <div className="text-muted-foreground text-xs">
                    Filed {filing.filing_date}
                  </div>
                </div>
                <div className="text-muted-foreground text-xs">
                  Accession: {filing.accession_number}
                  {filing.period_end ? ` · Period end ${filing.period_end}` : ""}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {filing.html_url ? (
                    <a
                      href={filing.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      HTML
                    </a>
                  ) : null}
                  {filing.pdf_url ? (
                    <a
                      href={filing.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      PDF
                    </a>
                  ) : null}
                </div>
              </div>
              <Separator />
            </React.Fragment>
          ))
        )}
      </CardContent>
    </Card>
  )
}
