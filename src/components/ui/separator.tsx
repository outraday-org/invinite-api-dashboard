import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "@/lib/utils";

function Separator({
    className,
    orientation = "horizontal",
    ...props
}: SeparatorPrimitive.Props) {
    return (
        <SeparatorPrimitive
            className={cn(
                "bg-border shrink-0 first:hidden last:hidden data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
                className,
            )}
            data-slot="separator"
            orientation={orientation}
            {...props}
        />
    );
}

export { Separator };
