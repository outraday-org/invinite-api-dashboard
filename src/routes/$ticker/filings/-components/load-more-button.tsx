import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LoadMoreButton({
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
}: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onLoadMore: () => void;
}) {
    if (!hasNextPage) return null;

    return (
        <div className="flex items-center justify-center pt-2">
            <Button
                disabled={isFetchingNextPage}
                onClick={onLoadMore}
                type="button"
                variant="outline"
            >
                <ArrowDown className="size-4" />
                {isFetchingNextPage
                    ? "Loading..."
                    : "Load more"}
            </Button>
        </div>
    );
}
