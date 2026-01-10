"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type StatementTabsProps = {
  value: "income" | "balance" | "cashflow" | "snapshot"
  onChange: (value: StatementTabsProps["value"]) => void
  children: React.ReactNode
}

const labelMap: Record<StatementTabsProps["value"], string> = {
  income: "Income Statement",
  balance: "Balance Sheet",
  cashflow: "Cash Flow",
  snapshot: "Snapshot",
}

export function StatementTabs({ value, onChange, children }: StatementTabsProps) {
  return (
    <Tabs defaultValue={value} value={value} onValueChange={(next) => onChange(next as StatementTabsProps["value"])}>
      <TabsList className="w-full justify-start">
        {Object.entries(labelMap).map(([key, label]) => (
          <TabsTrigger key={key} value={key} className="min-w-[120px]">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  )
}

export { TabsContent as StatementTabContent }
