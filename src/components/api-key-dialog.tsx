"use client";

import { KeyRound } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKeyStore } from "@/lib/stores/api-key-store";
import { cn } from "@/lib/utils";

export function ApiKeyDialogButton({ className }: { className?: string }) {
    const apiKey = useApiKeyStore(s => s.apiKey);

    const clearApiKey = useApiKeyStore(s => s.clearApiKey);

    const hasHydrated = useApiKeyStore(s => s.hasHydrated);

    const setApiKey = useApiKeyStore(s => s.setApiKey);

    const [open, setOpen] = React.useState(false);

    const [draft, setDraft] = React.useState("");

    const hasKey = hasHydrated && Boolean(apiKey);

    React.useEffect(() => {
        if (open) setDraft(apiKey ?? "");
    }, [apiKey, open]);

    function onSave() {
        setApiKey(draft);

        setOpen(false);
    }

    function onClear() {
        clearApiKey();

        setDraft("");

        setOpen(false);
    }

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger
                render={(
                    <Button
                        aria-label={hasKey ? "API key is set" : "Set API key"}
                        className={cn("relative", className)}
                        size="icon-lg"
                        variant={hasKey ? "secondary" : "outline"}
                    />
                )}
            >
                <KeyRound className={cn(hasKey ? "text-primary" : "text-muted-foreground")} />
                {hasKey && (
                    <span className="bg-primary absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2 ring-background" />
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        API Key
                        {hasKey ? <Badge variant="secondary">set</Badge> : <Badge variant="outline">not set</Badge>}
                    </DialogTitle>
                    <DialogDescription>
                        Stored in your browser’s local storage and sent with requests as a Bearer token.
                        If set, it overrides the server’s env key.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="api-key">Key</Label>
                    <Input
                        autoComplete="off"
                        id="api-key"
                        onChange={e => setDraft(e.target.value)}
                        placeholder="inv_..."
                        spellCheck={false}
                        type="password"
                        value={draft}
                    />
                </div>

                <DialogFooter className="pt-2">
                    {hasKey && (
                        <Button onClick={onClear} type="button" variant="destructive">
                            Clear
                        </Button>
                    )}
                    <DialogClose render={<Button type="button" variant="outline" />}>
                        Cancel
                    </DialogClose>
                    <Button onClick={onSave} type="button">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
