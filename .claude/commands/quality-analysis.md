---
description: Analyze code quality, reusability, and type patterns. Staff engineer review for diffs, branches, or task verification. Fixes all issues found and runs tsc.
model: opus
---

# Quality Analysis

You are a **senior staff engineer** conducting a thorough code quality review.
Your job is to analyze code against the unified quality rules below — scoped to
the detected mode.

**Arguments**: $ARGUMENTS

## Step 1: Detect Mode

Determine the analysis mode using this priority chain. Stop at the first match.

| Priority | Condition                                                                                         | Mode       | Scope                                                      |
| -------- | ------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------- |
| 1        | User mentions tasks in arguments (e.g. "tasks/my-feature/ all tasks", "tasks/my-feature/ task 3") | **Task**   | Task requirements + all code introduced by the task        |
| 2        | Current branch has an open PR                                                                     | **PR**     | Full PR diff + local diff if present                       |
| 3        | Not on default branch, no open PR                                                                 | **Branch** | `git diff <default>...HEAD` + local diff if present        |
| 4        | Local staged/unstaged changes exist                                                               | **Local**  | `git diff` + `git diff --cached`                           |
| 5        | None of the above                                                                                 | —          | Tell the user there are no changes to analyze and **stop** |

### Detection commands

Run these to determine the mode:

```bash
# Default branch name
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo main

# Current branch
git branch --show-current

# Open PR?
gh pr view --json number,title,baseRefName,url 2>/dev/null

# Local changes?
git status --porcelain
```

If mode is **Task**, skip to the Task-specific instructions in Step 2.

## Step 2: Gather Context

### Diff modes (PR, Branch, Local)

Collect the diff for the detected mode:

| Mode       | Diff commands                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **PR**     | `gh pr diff` for the full PR diff. Also `git diff` + `git diff --cached` if local changes exist. Fetch review comments: `gh pr view --json reviews,comments` |
| **Branch** | `git diff <default>...HEAD` for all committed work on the branch. Also `git diff` + `git diff --cached` if local changes exist                               |
| **Local**  | `git diff` + `git diff --cached`                                                                                                                             |

When both PR/Branch diff and local diff are present, deduplicate overlap and
clearly label sections:

- **Local changes** — violations found in unstaged/staged diff
- **PR changes** / **Branch changes** — violations found in the broader diff

For each file in the diff, read the **full file** for surrounding context
(imports, function signatures, neighboring code).

For files with non-trivial changes, optionally check `git log --oneline -5 <file>`
and inline code comments (e.g., `// IMPORTANT:`, `// NOTE:`, `// WARNING:`) near
modified lines. Flag if the diff contradicts explicit inline guidance or
reintroduces a previously reverted pattern.

### Task mode

1. **Locate task files** — the argument includes a folder path and task
   specifier. Parse the folder path (e.g. `tasks/my-feature/`) and the task
   specifier (`all tasks`, `task 3`, `tasks 3 and 5`). If `all tasks`, list
   all `N-*.md` and `X-N-*.md` files in that folder. Otherwise resolve the
   referenced task numbers to files in the folder. If ambiguous, list
   candidates and ask.
2. **Parse requirements** — for each task file, extract every discrete
   requirement, acceptance criterion, and specification.
3. **Audit implementation** — for each requirement, use `Explore` subagents
   (one per task, max 5 concurrent) to search the codebase for the
   corresponding implementation. Check that the code exists, is wired up, and
   matches the spec.
4. **Read all implemented code** — for each file introduced or modified by the
   task, read the full file for context.

### Task file naming convention

Task files follow a naming convention that indicates their status:

- **`X-` prefix** (e.g., `X-7-data-table.md`) — the task has been previously
  marked as done/implemented. Still verify it thoroughly, but note its
  pre-existing "done" status in your output.
- **No prefix** (e.g., `7-data-table.md`) — the task has not been marked as
  done yet.

When resolving user references (e.g., "task 7"), match against both prefixed and
non-prefixed filenames. If both exist, prefer the `X-` prefixed version.

## Review Style

- Be direct and specific. Point to exact lines and explain why they're
  problematic.
- Make your own judgement calls. Only ask the developer a question when there is
  a genuine ambiguity you cannot resolve from the code alone.
- After a mediocre fix, challenge: **"Knowing everything you know now, scrap
  this and implement the elegant solution."**

## Step 3: Check Against Quality Rules

### Diff modes — Parallel Review

For diff modes (PR, Branch, Local), launch **4 parallel review agents** (Sonnet
model) using the Task tool. Pass each agent the diff, the full file contents read
in Step 2, and its assigned rules (copied verbatim from the rule reference
below).

| Agent | Rules | Focus                                                                                                                               |
| ----- | ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| A     | 1, 6  | **Conventions & Types** — type patterns (Zod, openapi-fetch, zustand) + project conventions                                         |
| B     | 2, 3  | **Reusability & Placement** — deduplication search + code sharing rules                                                             |
| C     | 7, 8  | **Correctness, Robustness & Edge Cases** — bugs, security, performance, error handling, inline guidance, missing edge-case handling |
| D     | 4, 5  | **Code Health** — new SATD, complexity heuristics, nested ternaries, dense one-liners                                               |

Each agent must:

- Only flag violations **in or directly caused by the diff** — never flag
  pre-existing issues in unchanged code
- Score each issue 0-100 using the confidence rubric below
- Include the rule number, `file:line`, and a specific fix suggestion
- Apply the false-positive avoidance list from Constraints

#### Confidence rubric (include verbatim in each agent prompt)

- **0**: False positive or pre-existing issue
- **25**: Might be real, might be false positive. Stylistic issues not explicitly
  backed by a project rule
- **50**: Real issue but a nitpick or unlikely to matter in practice
- **75**: Verified real issue that will be hit in practice, or directly cited in
  a project rule
- **100**: Confirmed definite issue with clear evidence

#### Consolidation

After all 4 agents return:

1. **Filter out issues with confidence < 80**
2. Deduplicate — if multiple agents flag the same line, keep the
   highest-confidence version
3. Assign impact levels (HIGH/MEDIUM/LOW) per the Impact Guidelines in Step 4
4. If no issues survive filtering, report a clean bill of health

### Task mode

Check **all code introduced by the task** against all 8 rules below. Use the
existing Explore subagent approach (one per task, max 5 concurrent) for
requirement verification, then check all introduced code against all rules
directly — no confidence scoring in task mode since issues are reported as
requirement statuses.

---

The following rules are distributed across the 4 parallel agents in diff modes.
In task mode, check all rules directly.

---

### Rule 1 — Type Patterns

#### Pattern A: Zod Schemas for Server Function Inputs

```typescript
// GOOD — Zod schema for server function validation
import { z } from "zod";

const getFilingsSchema = z.object({
    ticker: z.string().min(1),
    limit: z.number().int().positive().optional(),
});

export const getFilings = createServerFn({ method: "GET" })
    .validator(getFilingsSchema)
    .handler(async ({ data }) => {
        // data is typed as z.infer<typeof getFilingsSchema>
    });
```

#### Pattern B: openapi-fetch Generated Types

```typescript
// GOOD — types derived from generated schema, never hand-duplicated
import type { components } from "@/lib/api/schema";

type Filing = components["schemas"]["Filing"];
type FilingsResponse = components["schemas"]["FilingsResponse"];
```

#### Pattern C: React Query Keys

```typescript
// GOOD — stable, serializable query keys using arrays
export const filingKeys = {
    all: ["filings"] as const,
    byTicker: (ticker: string) => [...filingKeys.all, ticker] as const,
};
```

#### Anti-Patterns

| Anti-pattern                                                   | Fix                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------ |
| Hand-written types duplicating `src/lib/api/schema.d.ts`       | Import from generated schema via `components["schemas"]["X"]` |
| `createServerFn` without Zod `.validator()`                    | Add Zod schema and call `.validator()`                       |
| Unstable React Query keys (objects, inline arrays)             | Use stable `as const` array key factories                    |
| Zod schemas defined inline in route files (not reusable)       | Extract to `src/lib/api/` or a `validators/` file            |
| zustand store with missing `hasHydrated` guard for SSR         | Add `hasHydrated` flag + `onRehydrateStorage` pattern        |

---

### Rule 2 — Reusability & Deduplication

- **Duplicated logic**: Does the code introduce a function/hook/component that
  already exists elsewhere? Search before flagging.
- **Existing utilities ignored**: Check if the code reimplements something
  that already exists in `src/lib/`, `src/components/ui/`, `src/lib/api/`,
  `src/lib/stores/`. Flag with a pointer to the existing code.
- **Dead code**: Does the code add exports that are never imported?
- **Inconsistent patterns**: Does the code solve a problem differently from how
  it's solved elsewhere in the codebase?
- **API types duplicated from generated schema**: Manual type definitions that
  should derive from `components["schemas"]["X"]`

#### Search-Before-Creating Checklist

If the code **creates** a new file, type, hook, component, or utility, verify it
doesn't already exist:

| Looking for…        | Search first                                           |
| ------------------- | ------------------------------------------------------ |
| UI components       | `src/components/ui/`, `src/components/`                |
| Hooks               | Nearest `hooks/`, `src/lib/api/`                       |
| Utilities           | `src/lib/`, feature-specific `lib/`                    |
| API types           | `src/lib/api/schema.d.ts` (generated), `src/lib/api/types.ts` |
| Server functions    | `src/lib/api/server-functions.ts` (or feature file)    |
| React Query hooks   | `src/lib/api/queries.ts` (or feature file)             |
| zustand stores      | `src/lib/stores/`                                      |

---

### Rule 3 — Code Sharing & Placement

Follow the project's code sharing rules:

| Consumers                                       | Correct location                   |
| ----------------------------------------------- | ---------------------------------- |
| API layer (server functions + React Query hooks) | `src/lib/api/`                     |
| Global state                                     | `src/lib/stores/`                  |
| Shared UI primitives                             | `src/components/ui/`               |
| Shared feature-agnostic components               | `src/components/`                  |
| Route-specific code                              | `src/routes/`                      |
| Generic utilities                                | `src/lib/`                         |

- **API types/constants reused in multiple routes** — verify they live in
  `src/lib/api/types.ts` and are imported (not duplicated) in routes.
- **Route-level code shared between routes** — if the same component or hook
  appears in 2+ routes, extract it to `src/components/`.

---

### Rule 4 — SATD Detection

Flag any **new** `TODO`, `FIXME`, or `HACK` comments introduced in the code.
Pre-existing ones are out of scope.

---

### Rule 5 — Complexity Heuristics

- **Large functions**: Any new or modified function exceeding ~50 lines — suggest
  extraction
- **Deep nesting**: 4+ levels of nesting (if/for/try) — suggest flattening with
  early returns or extraction
- **Cyclomatic complexity**: Functions with many branches (>10 paths) — suggest
  decomposition
- **Nested ternaries**: Ternary expressions nested 2+ levels deep — suggest
  replacing with `if`/`else` or `switch`
- **Dense one-liners**: Chained operations that sacrifice readability for
  brevity — suggest breaking into named intermediate steps

---

### Rule 6 — Project Conventions (from CLAUDE.md)

Flag violations of these project conventions:

- No `any` types — use `unknown` with type guards
- No `as` coercion when the source type is already known — **except**:
  `as const` is always allowed; narrowing from `any` or `unknown` is allowed.
  Only flag `as` when casting between two known, incompatible types.
- No `++`/`--` operators — use `+= 1`/`-= 1`
- No empty arrow functions `() => {}` — use `() => undefined`
- No cross-feature imports between sibling route/feature folders — use
  `src/components/` for shared code
- Server functions must use Zod `.validator()` for all inputs
- All API response types must derive from the generated `schema.d.ts` — no
  hand-duplicated API types
- React Query hooks must manage loading, error, and empty states
- Error toasts for user-initiated failures must use sonner's `toast.error()` (or
  a wrapper) — silent catches on user-initiated work are forbidden
- zustand stores that persist to localStorage must handle SSR hydration with
  `hasHydrated` flag

---

### Rule 7 — Correctness & Robustness

- **Correctness**: Does the code do what it claims? Are there edge cases?
- **Security**: Any injection risks, API key leaks, data leaks?
- **Performance**: Unnecessary re-renders, missing React Query cache invalidation,
  redundant server function calls?
- **Error handling**: What happens when server functions throw or the API returns
  an error?
- **Test coverage**: Are critical paths tested?
- **Inline guidance**: Do changes contradict nearby `// IMPORTANT:`, `// NOTE:`,
  `// WARNING:`, or `// HACK:` comments?

---

### Rule 8 — Edge Case Coverage

Rule 7 catches what's written incorrectly. Rule 8 catches what _isn't written
at all but should be_. Walk the diff through each category below and ask:
**"Does this code handle X, and if not, should it?"** Only flag when the
missing handling is in scope for the change.

#### 8a — Failure and error paths

- Server function throws — is the error surfaced to the user via sonner toast?
- Network failures and API timeouts
- API returns unexpected response shape (Zod rejects it)
- Partial-write recovery — if one step in a multi-step flow fails, is the
  system in a recoverable state?

#### 8b — Empty, null, and boundary states

- Empty arrays / no results / zero-count cases
- Single-item case where logic implicitly assumes >= 2
- First-time users with no existing data
- Optional fields missing from API responses
- Off-by-one on ranges, pagination cursors

#### 8c — Auth and security

- Every new server function validates the API key before making requests
- No API keys exposed in client-side bundles
- Dev-only debug endpoints properly guarded

#### 8d — React Query states

- Loading, error, empty, and stale states defined for each new surface
- Does a mutation invalidate / refetch the right queries after success?
- Server-paginated tables keep the shell mounted during refetches?

#### 8e — zustand store correctness and SSR

- New persisted stores handle `hasHydrated` flag to prevent SSR mismatches?
- Store actions update atomically — no partial update states?
- Selectors are granular enough to avoid unnecessary re-renders?

#### 8f — openapi-fetch and generated types

- All API response types derived from `src/lib/api/schema.d.ts`?
- No hand-duplicated API types that will drift from the schema?
- If the OpenAPI schema changed, `pnpm generate:api` is run?

#### 8g — Zod validation

- Every `createServerFn` uses Zod `.validator()` for inputs?
- Zod schemas reject unexpected shapes with clear error messages?
- No raw unvalidated user input passed to the API?

#### 8h — Frontend state and React rules

- Loading, error, empty, and partial states defined for each new surface
- Hook order: no hooks declared below an early return / guard
- No variable shadowing
- No `++` / `--`; no `() => {}` empty arrow
- React Compiler: no partial `useCallback` deps that branch on mode flags

#### 8i — Error reporting and user feedback

- Every new user-initiated action (button click, form submit) has a catch
  that surfaces the error via sonner `toast.error()` — silent catches are bugs.
- Background / passive failures log via `console.error` — flag pure swallowed
  catches.
- A new API-calling surface defines what the user sees on failure (toast,
  inline banner, retry affordance). "Nothing visible" is a HIGH severity gap.

#### 8j — Test coverage

- New server functions or pure utilities covered by vitest tests?
- Test scenarios for the edge cases flagged above (empty / failure /
  invalid input / pagination)?

#### Severity for edge-case gaps

- **HIGH**: Missing handling will produce broken or unsafe code (silent catch
  on user-initiated action, missing Zod validation, API key leak)
- **MEDIUM**: Missing handling will produce suboptimal code (no empty state,
  missing loading state, zustand hydration gap)
- **LOW**: Stylistic or low-impact gaps

---

## Step 4: Report

### Diff modes (PR, Branch, Local)

For each violation found, output:

```
**[impact]** `file:line` — category
Description of what's wrong.
→ Fix: specific instruction on how to fix it.
```

Where `[impact]` is one of: **HIGH**, **MEDIUM**, **LOW**.

Group findings by file. If there are no violations, say so.

#### Impact Guidelines

- **HIGH**: Type safety holes (`any`, missing validators), duplicated
  code/components, security issues, correctness bugs, missing edge-case
  handling that produces broken or unsafe code
- **MEDIUM**: Missing Zod validation, hand-duplicated API types, new SATD,
  inconsistent patterns, missing error handling
- **LOW**: Naming convention mismatches, complexity warnings, stylistic gaps

When reviewing a PR, note the PR number and link at the top of the report.

### Task mode

Output a table per task:

```
## Task N: <Task Title>

| # | Requirement | Status | Details |
|---|-------------|--------|---------|
| 1 | <requirement summary> | <status> | <details> |
| 2 | ... | ... | ... |
```

**Status values:**

- `Done` — fully implemented and matches the spec
- `Partial` — implementation exists but is incomplete or differs from spec
- `Missing` — no implementation found
- `Issue` — implemented but has a bug, type error, duplicate code, missing
  types/validators, or other problem that should be fixed
- `Improvement` — code works but could be better (e.g., extract shared util,
  add stricter types)

Quality rule violations go in the same table with a `[Quality]` prefix in the
Requirement column.

After all task tables, output an **Overall Summary**:

```
## Overall Summary

| Task | Done | Partial | Missing | Issue | Improvement | Verdict |
|------|------|---------|---------|-------|-------------|---------|
| Task N: <title> | X | Y | Z | W | V | <verdict> |
```

**Verdict values:**

- `Complete` — all requirements Done
- `Mostly Complete` — minor gaps only
- `Incomplete` — significant requirements missing or broken

## Step 5: Grading

**Applies to all modes** — diff modes and task mode alike.

Only ask questions if there is a genuine ambiguity that blocks grading.
Otherwise, assign the grade directly based on your analysis.

In task mode, assign a grade per task and one overall.

- **Ship**: Code is clean, correct, handles edge cases, follows conventions.
  Ready for production.
- **Needs work**: Generally solid but has specific issues that must be addressed.
  List them explicitly.
- **Rethink approach**: Fundamental problems with the approach. Step back and
  reconsider the design.

## Step 6: Fix Issues

After reporting and grading, **fix all HIGH, MEDIUM and LOW issues** found in
Steps 3–4. For each issue:

1. Edit the code directly to resolve the issue.
2. Track all files you modified.

**Exception:** If a later task in the same task folder will explicitly address
the issue, skip the fix and note it as deferred.

## Step 7: Type Check

After fixing issues, run TypeScript on all files that were changed (by the
original diff/task AND by your fixes):

1. **Run TypeScript:**

    ```bash
    tsc --noEmit --pretty
    ```

    Filter output to changed files only.

2. **Fix all type errors** in changed files.

3. **Re-run TypeScript** after fixing. Repeat until zero errors remain on
   changed files.

**Do not run ESLint** — it is too slow.
**Do not run `build`** — only `tsc --noEmit`.

## Step 8: Rename Completed Task Files

**Task mode only.** After grading, if a task's verdict is **Complete** and its
task file does **not** already have the `X-` prefix, rename it:

```bash
git mv tasks/.../N-task-name.md tasks/.../X-N-task-name.md
```

This marks the task as done for future runs. Do this for every task that received
a **Complete** verdict and a **Ship** grade.

## Constraints

- Only report on code in scope for the detected mode — never flag pre-existing
  issues in unchanged code (diff modes) or unrelated code (task mode)
- Read changed/implemented files for context but do not scan unrelated
  directories
- Fix all HIGH, MEDIUM and LOW issues found — do not just report them
- Maximum of 5 parallel subagents at any time (task mode)
- Be specific — cite file paths and line numbers where possible
- If a requirement is ambiguous in the task file, note it but still attempt to
  verify (task mode)
- Check both API layer (server functions, React Query hooks) and frontend
  (components, routes) as applicable
- Only ask questions when there is a genuine ambiguity blocking the grade
- All output must be in English

### False positive avoidance

Do not flag:

- Pre-existing issues in unchanged code
- Intentional functionality changes that are directly related to the task/PR
  purpose
- Issues explicitly silenced in code (e.g., eslint-disable, @ts-ignore with
  explanation)
- Pedantic nitpicks a senior engineer wouldn't call out in review
- General code quality opinions not backed by a specific rule above
