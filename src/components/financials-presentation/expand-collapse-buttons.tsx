import { Button } from "@/components/ui/button";

export function ExpandCollapseButtons({
    onCollapseAll,
    onExpandAll,
}: {
    onExpandAll: () => void;
    onCollapseAll: () => void;
}) {
    return (
        <div className="flex flex-wrap shrink-0 gap-2">
            <Button
                onClick={onExpandAll}
                size="sm"
                variant="outline"
            >
                Expand all
            </Button>
            <Button
                onClick={onCollapseAll}
                size="sm"
                variant="outline"
            >
                Collapse all
            </Button>
        </div>
    );
}
