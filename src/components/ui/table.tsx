
import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<
    HTMLTableElement,
    React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
        <table
            className={cn(
                "w-full caption-bottom text-left text-sm text-foreground/90",
                className,
            )}
            ref={ref}
            {...props}
        />
    </div>
));

Table.displayName = "Table";

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead className={cn("text-foreground", className)} ref={ref} {...props} />
));

TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody className={cn("divide-border divide-y", className)} ref={ref} {...props} />
));

TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        className={cn(
            "bg-muted/50 text-muted-foreground font-medium [&>tr]:last:border-b-0",
            className,
        )}
        ref={ref}
        {...props}
    />
));

TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        className={cn(
            "data-[state=selected]:bg-muted/60 transition-colors hover:bg-muted/50",
            className,
        )}
        ref={ref}
        {...props}
    />
));

TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        className={cn(
            "text-muted-foreground border-border/70 h-10 px-3 text-xs font-medium uppercase tracking-wide",
            className,
        )}
        ref={ref}
        {...props}
    />
));

TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        className={cn("border-border/70 px-3 py-2 align-middle", className)}
        ref={ref}
        {...props}
    />
));

TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        className={cn("text-muted-foreground mt-2 text-xs", className)}
        ref={ref}
        {...props}
    />
));

TableCaption.displayName = "TableCaption";

export {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
};
