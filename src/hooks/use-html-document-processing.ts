import * as React from "react";

import { useGetHtmlStorageContent } from "@/hooks/use-get-html-storage-content";

type UseHtmlDocumentProcessingParams = {
    url: string;
};

export const useHtmlDocumentProcessing = ({ url }: UseHtmlDocumentProcessingParams) => {
    const [srcDoc, setSrcDoc] = React.useState<null | string>(null);

    const [failed, setFailed] = React.useState<boolean>(false);

    const { isError, text: html } = useGetHtmlStorageContent(url);

    const baseHref = React.useMemo(() => {
        try {
            return new URL(url).toString();
        }
        catch {
            return url;
        }
    }, [url]);

    React.useEffect(() => {
        setFailed(false);

        setSrcDoc(null);

        if (!url) return;

        if (isError) {
            setFailed(true);

            return;
        }

        if (!html) return;

        try {
            const parser = new DOMParser();

            const doc = parser.parseFromString(html, "text/html");

            // Remove script tags
            doc.querySelectorAll("script").forEach(el => el.remove());

            // Remove inline event handlers (on*)
            doc.querySelectorAll("*").forEach((el) => {
                for (const attr of Array.from(el.attributes)) {
                    if (attr.name.toLowerCase().startsWith("on")) {
                        el.removeAttribute(attr.name);
                    }
                }
            });

            // Inject <base> for resolving relative URLs
            const base = doc.createElement("base");

            base.setAttribute("href", baseHref);

            doc.head.insertBefore(base, doc.head.firstChild);

            const finalHtml = doc.documentElement.outerHTML;

            setSrcDoc(finalHtml);
        }
        catch {
            setFailed(true);
        }
    }, [url, html, isError, baseHref]);

    return {
        baseHref,
        failed,
        srcDoc,
    };
};
