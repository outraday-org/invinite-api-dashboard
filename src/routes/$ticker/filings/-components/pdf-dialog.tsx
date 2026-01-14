import { ExternalLink } from "lucide-react";

import { PdfViewer } from "@/components/pdf/pdf-viewer";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatEnDateTime } from "@/lib/date";

export function PdfDialog({
    dialog,
    onOpenChange,
    ticker,
}: {
    dialog: null | {
        url: string;
        ticker: string;
        formType: string;
        accessionNumber: string;
        filingDate: string;
        fiscalQuarter: null | number;
        fiscalYear: null | number;
    };
    ticker: string;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog
            onOpenChange={onOpenChange}
            open={Boolean(dialog)}
        >
            <DialogContent className="sm:max-w-6xl h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] p-0">
                <div className="flex h-full min-h-0 flex-col">
                    <div className="p-4 pb-2 flex flex-col shrink-0">
                        <DialogHeader>
                            <DialogTitle className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="truncate">{dialog?.ticker ?? ticker}</span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="truncate">{dialog?.formType ?? "PDF"}</span>
                                        {dialog?.fiscalQuarter && dialog.fiscalYear
                                            ? (
                                                    <>
                                                        <span className="text-muted-foreground">•</span>
                                                        <span className="truncate">
                                                            Q
                                                            {dialog.fiscalQuarter}
                                                            {" "}
                                                            FY
                                                            {String(dialog.fiscalYear).slice(-2).padStart(2, "0")}
                                                        </span>
                                                    </>
                                                )
                                            : null}
                                    </div>

                                </div>
                                {dialog?.url && (
                                    <a
                                        className="text-primary flex items-center gap-1 hover:underline text-xs font-normal shrink-0"
                                        href={dialog.url}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        Open in new tab
                                        {" "}
                                        <ExternalLink className="size-3 mb-0.5" />
                                    </a>
                                )}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                PDF preview
                            </DialogDescription>
                        </DialogHeader>
                        <div className="shrink-0 text-muted-foreground text-xs mt-0.5 flex items-center gap-2 min-w-0">
                            <span className="truncate">{dialog?.accessionNumber ?? ""}</span>
                            {dialog?.filingDate
                                ? (
                                        <>
                                            <span>•</span>
                                            <span className="truncate">
                                                {formatEnDateTime(dialog.filingDate, { hideTime: true })}
                                            </span>
                                        </>
                                    )
                                : null}
                        </div>
                    </div>

                    <div className="px-4 pb-4 min-h-0 grow">
                        {dialog?.url
                            ? (
                                    <PdfViewer className="h-full" url={dialog.url} />
                                )
                            : null}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
