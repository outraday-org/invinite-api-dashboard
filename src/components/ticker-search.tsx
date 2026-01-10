"use client"

import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

import { useCompanySearch } from "@/lib/api/queries"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TickerSearchProps = {
  placeholder?: string
  defaultTicker?: string
}

export function TickerSearch({ placeholder = "Search by ticker or name", defaultTicker = "" }: TickerSearchProps) {
  const navigate = useNavigate({ from: "/" })
  const [input, setInput] = React.useState(defaultTicker)
  const { data, isFetching } = useCompanySearch(input)

  const companies = data?.companies ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const target = input.trim().toUpperCase()
    if (target) {
      navigate({ to: "/$ticker", params: { ticker: target } })
    }
  }

  const handleSelect = (value: string) => {
    setInput(value)
    navigate({ to: "/$ticker", params: { ticker: value.toUpperCase() } })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field>
        <FieldLabel htmlFor="ticker-search">Ticker</FieldLabel>
        <Combobox items={companies.map((c) => c.ticker)}>
          <div className="flex items-center gap-2">
            <ComboboxInput
              asChild
              value={input}
              onChange={(event) => setInput(event.target.value)}
            >
              <Input
                id="ticker-search"
                placeholder={placeholder}
                autoComplete="off"
              />
            </ComboboxInput>
            <Button type="submit" disabled={isFetching || input.trim().length === 0}>
              Go
            </Button>
          </div>
          <ComboboxContent>
            <ComboboxEmpty>No companies found</ComboboxEmpty>
            <ComboboxList>
              {(ticker) => {
                const company = companies.find((c) => c.ticker === ticker)
                return (
                  <ComboboxItem
                    key={ticker}
                    value={ticker}
                    onClick={() => handleSelect(ticker)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{ticker}</span>
                      {company ? (
                        <span className="text-muted-foreground text-xs">
                          {company.name}
                        </span>
                      ) : null}
                    </div>
                  </ComboboxItem>
                )
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
    </form>
  )
}
