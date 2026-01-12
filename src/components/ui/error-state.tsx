import * as React from "react";

import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

function getErrorMessage(error: unknown): null | string {
    if (!error) return null;

    if (error instanceof Error) return error.message;

    if (typeof error === "string") return error;

    if (typeof error === "object") {
        const maybeMessage = (error as { message?: unknown }).message;

        if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage;

        try {
            return JSON.stringify(error, null, 2);
        }
        catch {
            // fallthrough
        }
    }

    try {
        return String(error);
    }
    catch {
        return null;
    }
}

type ErrorStateProps = {
    className?: string;
    error?: unknown;
    message?: React.ReactNode;
    title?: React.ReactNode;
};

export function ErrorState({
    className,
    error,
    message,
    title = "Something went wrong",
}: ErrorStateProps) {
    const resolvedMessage = message ?? getErrorMessage(error) ?? "Unknown error";

    return (
        <Card className={cn("border-destructive/40 bg-destructive/5", className)} role="alert" size="sm">
            <CardHeader className="gap-2">
                <div className="flex items-center gap-2">
                    <Badge variant="destructive">Error</Badge>
                    <CardTitle className="text-sm">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-destructive text-xs whitespace-pre-wrap wrap-break-word">
                    {resolvedMessage}
                </div>
            </CardContent>
        </Card>
    );
}
