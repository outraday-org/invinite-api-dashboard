import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BarChart3Icon, FileTextIcon, LayoutDashboardIcon } from "lucide-react";

import { ErrorState } from "@/components/ui/error-state";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarInset,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCompanyDetails } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$ticker")({
    component: TickerLayout,
});

const navItems = [
    { icon: LayoutDashboardIcon, label: "Overview", to: "/$ticker" },
    { icon: FileTextIcon, label: "Filings", to: "/$ticker/filings" },
    { icon: BarChart3Icon, label: "Standardized Financials", to: "/$ticker/financials-standardized" },
] as const;

function TickerLayout() {
    const { ticker } = Route.useParams();

    const { data, error } = useCompanyDetails(ticker);

    const company = data?.companies[0];

    return (
        <>
            <Sidebar className="group-data-[side=left]:border-none [&>div]:bg-background">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="mt-7">
                            <SidebarMenu>
                                {navItems.map(item => (
                                    <SidebarMenuItem key={item.to}>
                                        <Link
                                            activeOptions={{ exact: item.to === "/$ticker" }}
                                            className={cn(
                                                "ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80 flex h-8 w-full items-center gap-2 overflow-hidden rounded-[calc(var(--radius-sm)+2px)] px-2 text-left text-xs outline-hidden transition-colors focus-visible:ring-2",
                                                "data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground data-[status=active]:font-medium",
                                            )}
                                            params={{ ticker }}
                                            to={item.to}
                                        >
                                            <item.icon className="size-4 shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            <SidebarInset>
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
                    <header className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            {company?.logo_url && (
                                <img
                                    alt={`${ticker} logo`}
                                    className="bg-muted ring-border/60 h-9 w-9 rounded-md object-contain ring-1"
                                    src={company.logo_url}
                                />
                            )}
                            <h1 className="text-3xl font-bold tracking-tight">{ticker}</h1>
                            {company && (
                                <span className="text-muted-foreground text-lg">{company.name}</span>
                            )}
                        </div>
                    </header>

                    {error && (
                        <ErrorState error={error} title="Failed to load company header details" />
                    )}

                    <Outlet />
                </div>
            </SidebarInset>
        </>
    );
}
