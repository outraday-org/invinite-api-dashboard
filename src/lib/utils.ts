import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<ClassValue>) {
    return twMerge(clsx(inputs));
}

export function formatNumberEn(value: number, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat("en", options).format(value);
}

export function formatNumberEnCompact(
    value: number,
    options: Intl.NumberFormatOptions = {},
) {
    return new Intl.NumberFormat("en", {
        notation: "compact",
        compactDisplay: "short",
        ...options,
    }).format(value);
}
