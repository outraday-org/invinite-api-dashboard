import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export function FilingsTableHeader({
    onSortToggle,
    sortDirection,
}: {
    onSortToggle: () => void;
    sortDirection: "asc" | "desc";
}) {
    return (
        <>
            <div className="hidden sm:grid gap-x-6 gap-y-1 sm:grid-cols-5 sm:items-center text-muted-foreground text-xs pb-2">
                <div>Form Type</div>
                <div>Accession Number</div>
                <div>Fiscal Period</div>
                <div>Files</div>
                <button
                    className="inline-flex cursor-pointer w-full items-center justify-end gap-1 text-right hover:text-foreground transition-colors"
                    onClick={onSortToggle}
                    title={sortDirection === "desc" ? "Sort ascending" : "Sort descending"}
                    type="button"
                >
                    <span>Filed</span>
                    {sortDirection === "desc"
                        ? <ArrowDownIcon className="size-4 mb-px" />
                        : <ArrowUpIcon className="size-4 mb-px" />}
                </button>
            </div>
        </>
    );
}
