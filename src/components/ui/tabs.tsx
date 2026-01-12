import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
    setValue: (value: string) => void;
    value: string;
};

const TabsContext = React.createContext<null | TabsContextValue>(null);

const useTabsContext = () => {
    const ctx = React.useContext(TabsContext);

    if (!ctx) {
        throw new Error("Tabs components must be used within <Tabs>");
    }

    return ctx;
};

type TabsListProps = React.ComponentProps<"div">;

type TabsProps = {
    children: React.ReactNode;
    className?: string;
    defaultValue: string;
    onValueChange?: (value: string) => void;
    value?: string;
};

function Tabs({ children, className, defaultValue, onValueChange, value }: TabsProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);

    const currentValue = value ?? internalValue;

    const handleChange = (next: string) => {
        if (value === undefined) {
            setInternalValue(next);
        }

        onValueChange?.(next);
    };

    return (
        <TabsContext.Provider value={{ setValue: handleChange, value: currentValue }}>
            <div className={cn("flex flex-col gap-3", className)} data-slot="tabs">
                {children}
            </div>
        </TabsContext.Provider>
    );
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
    ({ className, ...props }, ref) => (
        <div
            className={cn(
                "bg-muted text-muted-foreground border-border/60 inline-flex h-10 items-center justify-center rounded-lg border p-1",
                className,
            )}
            data-slot="tabs-list"
            ref={ref}
            role="tablist"
            {...props}
        />
    ),
);

TabsList.displayName = "TabsList";

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
};

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, ...props }, ref) => {
        const { setValue, value: activeValue } = useTabsContext();

        const isActive = activeValue === value;

        return (
            <button
                aria-selected={isActive}
                className={cn(
                    "text-sm inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 font-medium transition-all",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
                    "data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground",
                    className,
                )}
                data-slot="tabs-trigger"
                data-state={isActive ? "active" : "inactive"}
                onClick={() => setValue(value)}
                ref={ref}
                role="tab"
                type="button"
                {...props}
            />
        );
    },
);

TabsTrigger.displayName = "TabsTrigger";

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
    value: string;
};

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, ...props }, ref) => {
        const { value: activeValue } = useTabsContext();

        const isActive = activeValue === value;

        if (!isActive) return null;

        return (
            <div
                className={cn("ring-offset-background focus-visible:outline-none", className)}
                data-slot="tabs-content"
                data-state="active"
                ref={ref}
                role="tabpanel"
                {...props}
            />
        );
    },
);

TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
