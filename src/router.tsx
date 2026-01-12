import { createRouter } from "@tanstack/react-router";

import { NotFound } from "@/components/ui/not-found";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
    const router = createRouter({
        defaultNotFoundComponent: NotFound,
        defaultPreloadStaleTime: 0,
        routeTree,
        scrollRestoration: true,
    });

    return router;
};
