import type { FiscalPeriodType } from "@/lib/api/types";

import { Button } from "@/components/ui/button";

const periodOptions: Array<{ label: string; value: FiscalPeriodType }> = [
    { label: "Quarterly", value: "quarterly" },
    { label: "Annual", value: "annual" },
    { label: "YTD", value: "ytd" },
    { label: "TTM", value: "ttm" },
];

export function PeriodTypeButtons({
    onValueChange,
    value,
}: {
    value: FiscalPeriodType;
    onValueChange: (value: FiscalPeriodType) => void;
}) {
    return (
        <div className="flex gap-1">
            {periodOptions.map(opt => (
                <Button
                    key={opt.value}
                    onClick={() => onValueChange(opt.value)}
                    variant={value === opt.value ? "default" : "outline"}
                >
                    {opt.label}
                </Button>
            ))}
        </div>
    );
}
