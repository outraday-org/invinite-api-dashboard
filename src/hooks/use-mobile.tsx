import * as React from "react";

const MOBILE_BREAKPOINT_PX = 768;

export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState<boolean>(() => {
        if (typeof window === "undefined") return false;

        return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`).matches;
    });

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);

        const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

        setIsMobile(mql.matches);

        // Safari < 14 fallback
        if ("addEventListener" in mql) {
            mql.addEventListener("change", onChange);

            return () => mql.removeEventListener("change", onChange);
        }

        (mql as any).addListener(onChange);

        return () => (mql as any).removeListener(onChange);
    }, []);

    return isMobile;
}
