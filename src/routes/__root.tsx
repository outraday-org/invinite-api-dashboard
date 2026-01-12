import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import * as React from "react";

import { ApiKeyDialogButton } from "@/components/api-key-dialog";
import { TickerSearch } from "@/components/ticker-search";
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
    component: RootLayout,
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

function RootLayout() {
    return (
        <>
            <div className="sticky top-0 z-40 border-b bg-background/80 supports-backdrop-filter:backdrop-blur-md">
                <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 lg:px-8">
                    <div />
                    <TickerSearch />
                    <div className="justify-self-end">
                        <ApiKeyDialogButton />
                    </div>
                </div>
            </div>
            <Outlet />
        </>
    );
}

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <QueryClientProvider client={queryClient}>
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
