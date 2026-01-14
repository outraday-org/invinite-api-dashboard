import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FilingsHeader({
    availableFormTypes,
    formTypeFilter,
    loadingFormTypes,
    onFormTypeChange,
    sortDirection,
}: {
    availableFormTypes: Array<string>;
    formTypeFilter: null | string;
    loadingFormTypes: boolean;
    onFormTypeChange: (val: null | string) => void;
    sortDirection: "asc" | "desc";
}) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
                <div className="text-sm font-semibold">SEC Filings</div>
                <div className="text-muted-foreground text-xs">
                    Filtered by form type,
                    {" "}
                    {sortDirection === "desc" ? "newest first" : "oldest first"}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Select
                    disabled={loadingFormTypes || availableFormTypes.length === 0}
                    onValueChange={val => onFormTypeChange(val === "all" ? null : val)}
                    value={formTypeFilter ?? "all"}
                >
                    <SelectTrigger className="w-[180px]">
                        {!formTypeFilter || formTypeFilter === "all" ? "All form types" : <SelectValue />}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All form types</SelectItem>
                        {availableFormTypes.map(type => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
