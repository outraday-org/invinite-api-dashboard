# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev          # Start dev server on port 3001
pnpm run build        # Production build
pnpm run test         # Run tests (vitest)
pnpm run lint         # Run ESLint
pnpm run check        # Run ESLint --fix && tsc --noEmit
pnpm run generate:api # Regenerate API types from openapi.json
```

## Architecture

This is a TanStack Start (React SSR) dashboard for the Invinite financial data API. It uses file-based routing with TanStack Router and server functions for API calls.

### API Layer (`src/lib/api/`)

- **schema.d.ts**: Auto-generated TypeScript types from OpenAPI spec. Regenerate with `pnpm run generate:api`
- **types.ts**: Derived response/entity types using the `ApiResponse` helper to extract typed responses from schema
- **client.server.ts**: Creates typed `openapi-fetch` client with Bearer auth
- **server-functions.ts**: TanStack Start server functions (`createServerFn`) with Zod validation. These run on the server and handle API calls
- **queries.ts**: React Query hooks (`useQuery`/`useInfiniteQuery`) that call server functions. Each hook manages API key from store and shows error toasts

### Routing (`src/routes/`)

File-based routing with TanStack Router. The route tree is auto-generated in `routeTree.gen.ts`.

- `__root.tsx`: Root layout with SidebarProvider and Toaster
- `index.tsx`: Landing page with API key input
- `$ticker/route.tsx`: Layout for all company routes with sidebar navigation
- `$ticker/*.tsx`: Company-specific pages (filings, financials, dividends, etc.)

### State Management

- **API Key**: Zustand store in `src/lib/stores/api-key-store.ts` persists to localStorage (`invinite-data-api-key`). Handles SSR hydration with `hasHydrated` flag
- **Ticker History**: `src/lib/stores/ticker-store.ts` for recent ticker navigation

### UI Components (`src/components/ui/`)

Base UI components built on `@base-ui/react` primitives with `class-variance-authority` for variants. Uses `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge).

### Environment

- `INVINITE_DATA_API_KEY`: Server-side API key (optional, can be set via UI)
- `INVINITE_DATA_API_URL`: API base URL (defaults to https://data.invinite.com)

Validated with `@t3-oss/env-core` in `src/lib/env.ts`.

## Code Style

- 4-space indentation, double quotes, semicolons (via @stylistic/eslint-plugin)
- Import sorting via eslint-plugin-perfectionist (recommended-natural)
- React Compiler enabled (`react-compiler/react-compiler: error`)
- Blank lines required before most statements (const, let, if, return, etc.)
- Path alias: `@/*` maps to `./src/*`
