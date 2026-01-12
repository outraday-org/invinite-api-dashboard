import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import * as React from "react";

import { ApiKeyDialogButton } from "@/components/api-key-dialog";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 60 * 1000,
        },
    },
});

export const Route = createRootRoute({
    head: () => ({
        links: [
            {
                href: appCss,
                rel: "stylesheet",
            },
        ],
        meta: [
            {
                charSet: "utf-8",
            },
            {
                content: "width=device-width, initial-scale=1",
                name: "viewport",
            },
            {
                title: "Invinite API Dashboard",
            },
        ],
    }),

    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <QueryClientProvider client={queryClient}>
                    <div className="fixed top-4 right-4 z-40">
                        <ApiKeyDialogButton />
                    </div>
                    {children}
                    <TanStackDevtools
                        config={{
                            position: "bottom-right",
                        }}
                        plugins={[
                            {
                                name: "Tanstack Router",
                                render: <TanStackRouterDevtoolsPanel />,
                            },
                        ]}
                    />
                    <Toaster />
                    <Scripts />
                </QueryClientProvider>
            </body>
        </html>
    );
}
