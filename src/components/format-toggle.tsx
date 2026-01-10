"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type FormatToggleProps = {
  kind: "standardized" | "as-reported"
  view: "base" | "detailed" | "presentation"
  fiscalPeriodType: "quarterly" | "annual" | "ytd" | "ttm"
  onKindChange: (kind: FormatToggleProps["kind"]) => void
  onViewChange: (view: FormatToggleProps["view"]) => void
  onPeriodChange: (period: FormatToggleProps["fiscalPeriodType"]) => void
}

const periodLabels: Array<FormatToggleProps["fiscalPeriodType"]> = [
  "quarterly",
  "annual",
  "ytd",
  "ttm",
]

export function FormatToggle({
  kind,
  view,
  fiscalPeriodType,
  onKindChange,
  onViewChange,
  onPeriodChange,
}: FormatToggleProps) {
  return (
    <div className="bg-muted/40 border-border/60 flex flex-wrap items-center gap-2 rounded-lg border p-3 text-sm">
      <span className="text-muted-foreground text-xs">Source</span>
      <div className="flex gap-1">
        <Button
          type="button"
          variant={kind === "standardized" ? "default" : "outline"}
          size="sm"
          onClick={() => onKindChange("standardized")}
        >
          Standardized
        </Button>
        <Button
          type="button"
          variant={kind === "as-reported" ? "default" : "outline"}
          size="sm"
          onClick={() => onKindChange("as-reported")}
        >
          As Reported
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <span className="text-muted-foreground text-xs">View</span>
      <div className="flex gap-1">
        <Button
          type="button"
          variant={view === "base" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("base")}
        >
          Summary
        </Button>
        <Button
          type="button"
          variant={view === "detailed" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("detailed")}
        >
          Detailed
        </Button>
        <Button
          type="button"
          variant={view === "presentation" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("presentation")}
        >
          Presentation
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <span className="text-muted-foreground text-xs">Fiscal Period</span>
      <div className="flex gap-1">
        {periodLabels.map((p) => (
          <Button
            key={p}
            type="button"
            variant={fiscalPeriodType === p ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange(p)}
          >
            {p.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  )
}
