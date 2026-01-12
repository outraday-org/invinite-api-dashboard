import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
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
                    <div className="justify-self-start shrink-0">
                        <Link
                            aria-label="Go to dashboard home"
                            className="shrink-0 flex items-center gap-2 rounded-md px-2 -ml-2 py-1 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            to="/"
                        >
                            <img alt="Invinite" className="h-6 w-6 shrink-0" src="/logo192.png" />
                        </Link>
                    </div>
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
