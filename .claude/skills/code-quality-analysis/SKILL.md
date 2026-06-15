---
name: code-quality-analysis
description: |
    Analyzes code quality, reusability, and type patterns for the dashboard stack. Use this skill when:
    - User mentions "code quality", "complexity", "tech debt", or "maintainability"
    - User asks about "duplicates", "reusability", "deduplication", or "type patterns"
    - User asks about Zod schema extraction, openapi-fetch type usage, or React Query patterns
    - Before/after refactoring or when reviewing code changes
allowed-tools: Bash, Read, Glob, Grep, Edit, Write
---

# Code Quality & Reusability Analysis

You are an expert code quality analyzer combining PMAT static analysis, reusability/deduplication scanning, and type pattern enforcement for this TanStack Start + React Query + openapi-fetch codebase.

## When to Activate

1. User asks about code quality, complexity, tech debt, or maintainability
2. User asks about duplicates, reusability, or "search before creating"
3. User asks about Zod schemas, openapi-fetch types, or React Query patterns
4. Before/after refactoring or when reviewing code changes

## Section 1: PMAT Static Analysis

### Commands

| Command                                 | Purpose                                           |
| --------------------------------------- | ------------------------------------------------- |
| `pmat analyze quality --path <path>`    | Overall health score, complexity, maintainability |
| `pmat analyze complexity --path <path>` | Cyclomatic + cognitive complexity per function    |
| `pmat analyze dead-code --path <path>`  | Unused functions, variables, imports              |
| `pmat analyze satd --path <path>`       | TODO, FIXME, HACK comment detection               |

### Thresholds

| Metric                | Threshold   | Action                      |
| --------------------- | ----------- | --------------------------- |
| Cyclomatic complexity | >10         | Refactor — extract methods  |
| Cognitive complexity  | >15         | High mental load — simplify |
| Maintainability index | <50         | Poor — needs attention      |
| SATD annotations      | >5 per file | High tech debt — triage     |

## Section 2: Reusability & Deduplication

### Scan Priorities

1. `src/components/` — UI component duplication
2. `src/lib/api/` — Server function and React Query hook inconsistencies
3. `src/lib/stores/` — zustand store pattern inconsistencies
4. `src/lib/` — Utility function overlap
5. `src/routes/` — Route-level component duplication

### What to Scan For

- **Duplicated logic**: Similar functions, copy-pasted patterns across files
- **Dead code**: Unused exports, unreachable branches, orphaned files
- **Inconsistent patterns**: Same thing done different ways
- **TODO/FIXME/HACK comments**: Deferred work (overlaps with PMAT SATD)
- **Over-engineering**: Unnecessary abstractions, unused flexibility
- **API types duplicating generated schema**: Manual type definitions that
  should use `components["schemas"]["X"]` from `src/lib/api/schema.d.ts`

### Search-Before-Creating Checklist

Before creating anything new, check these locations:

| Looking for…        | Search first                                           |
| ------------------- | ------------------------------------------------------ |
| UI components       | `src/components/ui/`, `src/components/`                |
| Hooks               | Nearest `hooks/`, `src/lib/api/`                       |
| Utilities           | `src/lib/`, feature-specific `lib/`                    |
| API types           | `src/lib/api/schema.d.ts` (generated), `src/lib/api/types.ts` |
| Server functions    | `src/lib/api/server-functions.ts`                      |
| React Query hooks   | `src/lib/api/queries.ts`                               |
| zustand stores      | `src/lib/stores/`                                      |

### Detection Commands

```bash
# Duplicate functions across utility locations
Grep for function/export name across src/lib/ and src/components/**/lib/

# Duplicate hooks across all hooks directories
Grep for hook name across all hooks/ dirs

# Duplicate components
Glob for component name across src/components/

# Orphaned exports (exported but never imported)
Grep for export name, check if imported anywhere
```

### Best Practices

- Focus on patterns that cause real maintenance burden, not cosmetic issues
- Prefer extracting shared abstractions over picking one duplicate as canonical
- Consider whether a "duplication" is actually intentional variation
- Group related findings by root cause
- Present as prioritized list with impact (high/medium/low)

## Section 3: Type Pattern Enforcement

### Pattern A: Zod Schemas in Server Functions

```typescript
// src/lib/api/server-functions.ts
import { createServerFn } from "@tanstack/start";
import { z } from "zod";

// GOOD — Zod schema extracted and reusable
export const getFilingsSchema = z.object({
    ticker: z.string().min(1),
    limit: z.number().int().positive().optional(),
});

export const getFilings = createServerFn({ method: "GET" })
    .validator(getFilingsSchema)
    .handler(async ({ data }) => {
        // data is typed as z.infer<typeof getFilingsSchema>
    });
```

**Rules:**

- Every `createServerFn` must use `.validator()` with a Zod schema
- Zod schemas should be exported and reusable (not inlined)
- Place in `src/lib/api/` or a feature-specific server-functions file

### Pattern B: openapi-fetch Generated Types

```typescript
// GOOD — types derived from generated schema, never hand-duplicated
import type { components } from "@/lib/api/schema";

type Filing = components["schemas"]["Filing"];
type FilingsResponse = components["schemas"]["FilingsResponse"];

// GOOD — ApiResponse helper from src/lib/api/types.ts
import type { ApiResponse } from "@/lib/api/types";
```

**Rules:**

- Never hand-write types that exist in the generated `schema.d.ts`
- Run `pnpm generate:api` when the OpenAPI spec changes
- Use `ApiResponse<T>` helper for extracting typed responses
- No manual `interface` or `type` duplicating API schemas

### Pattern C: React Query Keys

```typescript
// GOOD — stable, serializable key factory using as const
export const filingKeys = {
    all: ["filings"] as const,
    byTicker: (ticker: string) => [...filingKeys.all, ticker] as const,
    detail: (ticker: string, id: string) => [...filingKeys.byTicker(ticker), id] as const,
};

// GOOD — hook uses the key factory
export const useFilings = (ticker: string) => {
    return useQuery({
        queryKey: filingKeys.byTicker(ticker),
        queryFn: () => getFilings({ data: { ticker } }),
    });
};
```

**Rules:**

- Query keys must be stable arrays (not objects, not inline arrays without `as const`)
- Use key factory objects grouped by feature
- Place key factories in the same file as the hooks that use them

### Pattern D: zustand Stores with SSR Hydration

```typescript
// GOOD — hasHydrated flag prevents SSR/client mismatch
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ApiKeyStore {
    apiKey: string;
    hasHydrated: boolean;
    setApiKey: (key: string) => undefined;
    setHasHydrated: (state: boolean) => undefined;
}

export const useApiKeyStore = create<ApiKeyStore>()(
    persist(
        (set) => ({
            apiKey: "",
            hasHydrated: false,
            setApiKey: (key) => { set({ apiKey: key }); return undefined; },
            setHasHydrated: (state) => { set({ hasHydrated: state }); return undefined; },
        }),
        {
            name: "invinite-data-api-key",
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
```

**Rules:**

- Persisted stores must include `hasHydrated` flag
- `onRehydrateStorage` callback sets `hasHydrated: true` after rehydration
- Components that depend on persisted state must check `hasHydrated` before rendering

### Anti-Patterns to Flag

| Anti-pattern                                                     | Fix                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------ |
| `createServerFn` without `.validator()`                          | Add Zod schema and call `.validator(zSchema)`                |
| Hand-written types duplicating `schema.d.ts`                     | Import `components["schemas"]["X"]` from generated schema    |
| Inline Zod schemas inside route files (not reusable)             | Extract to `src/lib/api/` or `validators/`                   |
| Unstable React Query keys (inline objects or non-const arrays)   | Use stable `as const` key factory                            |
| Persisted zustand store without `hasHydrated` guard              | Add `hasHydrated` + `onRehydrateStorage` pattern             |
| `toast.error(error.message)` without using the error helper      | Use proper error extraction before passing to toast          |
| Zod `z.any()` in server function validators                      | Use a specific type — `z.any()` defeats the purpose          |

## Section 4: Quick Checklist

```
[ ] PMAT quality + complexity on changed files
[ ] SATD: check for new TODO/FIXME/HACK
[ ] Duplicates: Grep function/hook/component names across codebase
[ ] Server functions: all use .validator() with a Zod schema
[ ] API types: no hand-duplication of schema.d.ts types
[ ] React Query: stable as const key factories, loading/error/empty states
[ ] zustand: persisted stores have hasHydrated guard
[ ] Error handling: user-initiated failures surface via sonner toast
[ ] Imports: no API types duplicated between route files
```
