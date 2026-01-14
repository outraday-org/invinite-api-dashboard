import { cn } from "@/lib/utils";

import { useHtmlDocumentProcessing } from "../hooks/use-html-document-processing";

export function HtmlViewer({
    className,
    title = "HTML preview",
    url,
}: {
    url: string;
    className?: string;
    title?: string;
}) {
    const { failed, srcDoc } = useHtmlDocumentProcessing({ url });

    if (!url) return null;

    return (
        <div className={cn("flex flex-col min-h-0", className)}>
            <div className="relative h-full min-h-0 overflow-hidden rounded-md bg-muted/20 ring-1 ring-foreground/10">
                {failed
                    ? (
                            // Fallback: if fetching fails (CORS), try embedding directly.
                            <iframe
                                className="h-full w-full border-0 bg-white"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                src={url}
                                title={title}
                            />
                        )
                    : srcDoc
                        ? (
                                <iframe
                                    className="h-full w-full border-0 bg-white"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    srcDoc={srcDoc}
                                    title={title}
                                />
                            )
                        : (
                                <div className="text-muted-foreground flex h-full w-full items-center justify-center p-6 text-sm">
                                    Loading HTML…
                                </div>
                            )}
            </div>
        </div>
    );
}
