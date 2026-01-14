"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { cn } from "@/lib/utils";

// Vite + react-pdf worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

function getErrorMessage(err: unknown, fallback: string) {
    if (typeof err === "object" && err !== null && "message" in err) {
        const msg = (err as { message?: unknown }).message;

        if (typeof msg === "string" && msg.trim().length > 0) return msg;
    }

    return fallback;
}

export function PdfViewer({
    className,
    url,
}: {
    url: string;
    className?: string;
}) {
    const scrollRef = React.useRef<HTMLDivElement | null>(null);

    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const [containerWidth, setContainerWidth] = React.useState<number>(0);

    const [numPages, setNumPages] = React.useState<number>(0);

    const [error, setError] = React.useState<null | string>(null);

    React.useEffect(() => {
        const el = containerRef.current;

        if (!el) return;

        const ro = new ResizeObserver(() => {
            setContainerWidth(el.clientWidth);
        });

        ro.observe(el);

        // Initial measure (RO callback may be async)
        setContainerWidth(el.clientWidth);

        return () => ro.disconnect();
    }, []);

    React.useEffect(() => {
        // Reset on URL change
        setNumPages(0);

        setError(null);

        // Keep scroll position predictable when switching PDFs
        scrollRef.current?.scrollTo({ top: 0 });
    }, [url]);

    const virtualizer = useVirtualizer({
        count: numPages,
        estimateSize: () => 1100,
        getScrollElement: () => scrollRef.current,
        overscan: 2,
    });

    const virtualItems = virtualizer.getVirtualItems();

    if (!url) return null;

    return (
        <div className={cn("flex flex-col min-h-0", className)}>
            <div
                className="relative h-full min-h-0 overflow-auto rounded-md bg-muted/20"
                ref={scrollRef}
            >
                <div className="p-3" ref={containerRef}>
                    {error
                        ? (
                                <div className="text-destructive text-xs">{error}</div>
                            )
                        : (
                                <Document
                                    file={url}
                                    loading={<div className="text-muted-foreground text-xs">Loading PDF…</div>}
                                    onLoadError={e => setError(getErrorMessage(e, "Failed to load PDF"))}
                                    onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                                    onSourceError={e => setError(getErrorMessage(e, "Failed to load PDF source"))}
                                >
                                    <div
                                        className="relative w-full"
                                        style={{ height: `${virtualizer.getTotalSize()}px` }}
                                    >
                                        {virtualItems.map(virtualRow => (
                                            <div
                                                className="absolute left-0 top-0 w-full"
                                                data-index={virtualRow.index}
                                                key={virtualRow.key}
                                                ref={virtualizer.measureElement}
                                                style={{ transform: `translateY(${virtualRow.start}px)` }}
                                            >
                                                <div className="flex justify-center">
                                                    <div className="rounded-md bg-background shadow-sm ring-1 ring-foreground/10">
                                                        <Page
                                                            loading={<div className="p-6 text-muted-foreground text-xs">Loading page…</div>}
                                                            pageNumber={virtualRow.index + 1}
                                                            renderAnnotationLayer
                                                            renderTextLayer
                                                            width={Math.max(1, containerWidth)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="h-4" />
                                            </div>
                                        ))}
                                    </div>
                                </Document>
                            )}
                </div>
            </div>
        </div>
    );
}
