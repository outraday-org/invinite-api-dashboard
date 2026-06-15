---
description: Double-check and validate a tasklist for gaps, issues, and improvements. Directly fixes all problems found in the task files.
model: opus
---

# Validate Tasks

## Purpose

You are a **senior technical reviewer** specializing in task quality assurance.
Your job is to validate a task folder written by `/write-tasks`, find gaps,
inconsistencies, and issues, and **fix them directly** in the task files. You run
after task authoring is complete, before execution begins.

**Arguments**: $ARGUMENTS

The argument should be either:

- A **task folder** path (e.g., `tasks/data-table/`) -- validates all tasks
- A **single task file** path (e.g., `tasks/data-table/3-components.md`) --
  validates just that task (still reads README and sibling tasks for context)

## Step 1: Detect Mode and Load Tasks

### 1a. Determine scope

- If the argument points to a **directory** (or ends with `/`), validate all
  tasks in the folder (**full mode**).
- If the argument points to a **single `.md` file**, validate only that task
  (**single mode**). Still read the parent folder's README and sibling tasks for
  context, but only report/fix issues in the target task.

### 1b. Load files

1. Read the `README.md` in the task folder (or the target file's parent folder).
2. In **full mode**: list and read **all** task files matching `N-*.md` (exclude
   `X-` prefixed).
3. In **single mode**: read the target task file. Also read `X-` prefixed
   siblings for context on what's already done.
4. Read any parent `README.md` if the folder is nested.

## Step 2: Validate Against the Codebase

Launch **parallel Explore subagents** (one per task, max 5 concurrent) to verify
every concrete reference in each task file:

### 2a. File path verification

For every file path mentioned in a task:

- Verify the file exists at that path
- If it doesn't, find the correct path and note the fix
- Check that referenced functions, types, hooks, and components exist in those files

### 2b. Type and schema verification

For every type, Zod schema, openapi-fetch type, or React Query key referenced:

- Verify it exists at the stated path
- Check that types align with the generated `src/lib/api/schema.d.ts` (not
  hand-duplicated)
- Verify zustand store shapes are correct
- Check that React Query hooks reference correct cache keys

### 2c. Existing code detection

For every new file, hook, component, or utility a task proposes to create:

- Search the codebase to check if it already exists (partially or fully).
  Check `src/components/ui/`, `src/components/`, the nearest `hooks/` folder,
  `src/lib/api/`, `src/lib/stores/`, `src/lib/`.
- Search for naming conflicts (same name, different module)
- Check if the functionality already exists under a different name
- If a near-equivalent exists: prefer **extending or reusing** the existing
  symbol over creating a parallel version.
- Check for **deleted / guarded concepts** that must not be reintroduced
  (root CLAUDE.md guard rules).

### 2d. Dependency verification

For each task's stated prerequisites:

- Verify the dependency exists as a task file
- Verify the dependency covers what the dependent task claims it provides
- Check for **unstated dependencies** — does a task implicitly require something
  from another task without declaring it?

## Step 3: Structural Analysis

### 3a. Task sizing

For each task, evaluate against the sizing rules from `/write-tasks`:

- **Too small?** (< 50 lines of real code, < 3 files, exists solely to enable
  the next task) — flag for merging
- **Too large?** (> 15 files, 2+ independent deliverables, mixes unrelated
  domains) — flag for splitting
- **Right size?** (3-10 files, one clear deliverable, 50+ lines of real code)

### 3b. Ordering validation

Walk through tasks 1, 2, 3, ... in sequence and confirm:

- Each task's prerequisites are satisfied by lower-numbered tasks
- API/data-layer tasks come before their route/component consumers
- Shared infrastructure comes before consumers
- No circular dependencies exist

### 3c. Coverage analysis

Check for **gaps** — work that is needed but not covered by any task:

- Missing Zod validation for new server functions
- Missing React Query loading/error/empty states for new UI surfaces
- Missing type aliases or derived types in `src/lib/api/types.ts`
- Missing route tree updates when new routes are added
- Missing zustand store hydration handling for new persisted slices
- Missing error toast handling for user-initiated mutations
- Frontend consumers without data sources (server functions not created yet)
- New server functions not covered by at least a smoke test

### 3d. Redundancy detection

Check for **overlap** between tasks:

- Two tasks creating the same file or modifying the same function
- Duplicate work spread across tasks (e.g., both task 2 and task 4 define
  the same type)
- Unnecessary intermediate tasks that could be folded into their consumers

### 3e. Reusability and code placement

For every new file, type, hook, component, or utility that genuinely
needs to be created, verify it is placed where every actual consumer can
import it — not buried in one feature folder when multiple features will
use it.

**Frontend placement** — shared UI primitives in `src/components/ui/`,
shared feature-agnostic components in `src/components/`, shared hooks
in nearest `hooks/` folder, generic utilities in `src/lib/`. A utility
with >=2 real consumers does not belong inside one consumer's folder.

**API layer** — server functions + React Query hooks in `src/lib/api/`.
Derived types in `src/lib/api/types.ts`. The openapi-fetch schema
(`src/lib/api/schema.d.ts`) is auto-generated — never hand-edit it.

**Types** — prefer types derived from the generated OpenAPI schema.
Do not duplicate API response types manually.

## Step 4: Content Quality Review

For each task file, check:

### 4a. Requirements quality

- Are requirements specific enough to implement without guessing?
- Do they include exact file paths, function signatures, Zod schema shapes?
- Are code snippets accurate (correct field names, types, imports)?

### 4b. Acceptance criteria quality

- Is every requirement reflected in the acceptance criteria?
- Are criteria testable/verifiable?
- Are any criteria missing for implied work?

### 4c. Files to Create/Modify table

- Does the table include all files the task will actually touch?
- Are any files listed that shouldn't be?
- Are the stated actions (Create/Modify) correct?

### 4d. Consistency

- Do task files use consistent terminology?
- Do field names match the actual API schema (not invented names)?
- Are the same concepts named the same way across all tasks?

## Step 5: Second Wave -- Edge Case Sweep

Steps 2-4 catch _what's specified but wrong_. This step catches _what isn't
specified at all but should be_. Walk every task through each category below
and explicitly answer: **"Does this task handle X, and if not, should it?"**

### 5a. Failure and error paths

- What happens if the server function throws? Is the error shown to the user?
- Network failures and API timeouts
- Malformed API responses (Zod validation rejects unexpected shape)
- Partial-write recovery — if one step in a multi-step flow fails, is the
  system in a recoverable state?

### 5b. Empty, null, and boundary states

- Empty arrays / no results / zero-count cases
- Single-item case where logic implicitly assumes >= 2
- First-time users with no existing data
- Optional fields missing from API responses
- Off-by-one on ranges, pagination

### 5c. Auth and security

- Does every new server function validate the API key before making requests?
- Are there any API key leaks (client-side code that exposes server keys)?
- Dev-only seed or debug endpoints properly guarded?

### 5d. React Query states

- Loading, error, empty, and stale states defined for each new surface?
- Does a mutation invalidate / refetch the right queries after success?
- Stale data after a mutation — does the UI update?
- Server-paginated tables keep the shell mounted during refetches?

### 5e. zustand store correctness and SSR

- New zustand slices with `persist` middleware handle `hasHydrated` flag
  to prevent SSR hydration mismatches?
- Actions update the store atomically — no partial update states?
- Selectors are granular enough to avoid unnecessary re-renders?

### 5f. openapi-fetch and generated types

- All API response types derived from `src/lib/api/schema.d.ts`?
- No hand-duplicated API types that will drift from the schema?
- If the OpenAPI schema changed, `pnpm generate:api` is run?

### 5g. Zod validation in server functions

- Every `createServerFn` validates inputs with Zod?
- Zod schemas reject unexpected shapes with clear error messages?
- Server functions do not pass raw unvalidated user input to the API?

### 5h. Frontend state and React rules

- Hook order: no hooks declared below an early return / guard
- No variable shadowing
- No `++` / `--`; no `() => {}` empty arrow
- React Compiler: no partial `useCallback` deps that branch on mode flags

### 5i. Error reporting and user feedback

- Every new user-initiated action (button click, form submit) has a catch
  that surfaces an error via sonner toast — silent catches on user-initiated
  work are a bug.
- Background / passive failures log via `console.error` or a dedicated error
  reporter — flag pure swallowed catches.
- A new API-calling surface defines what the user sees on failure (toast,
  inline banner, retry affordance). "Nothing visible" is a HIGH severity gap.

### 5j. Test coverage

- New server functions or pure utilities covered by vitest tests?
- Test scenarios for the edge cases flagged above (empty / failure /
  invalid input / pagination)?

### 5k. Mirror and tooling drift

- New `.claude/commands/`, `skills/`, or `agents/` entry mirrored to
  `.codex/`, `.cursor/`, `.agent/` per the provider mirror rules in CLAUDE.md?
- Folder-level `CLAUDE.md` update needed for a non-obvious invariant
  introduced by the task?

### Output of Step 5

Fold edge-case gaps into the Step 6 per-task finding tables using
`Category = "Edge case"` plus a sub-tag (e.g. `Edge case / Error path`,
`Edge case / React Query state`, `Edge case / Zod validation`).
Apply the same severity scale:

- **Critical**: missing handling will produce broken or unsafe code
  (no error toast on user-initiated failure, missing Zod validation,
  API key leak, silent catch)
- **Moderate**: missing handling will produce suboptimal code
  (no empty state, missing loading state, zustand hydration gap)
- **Minor**: stylistic or low-impact gaps

Critical and Moderate edge-case gaps must be fixed in Step 7.

## Scope Rules for Single vs Full Mode

- **Full mode**: All checks apply to all tasks. Cross-task issues are reported
  and fixed. README is updated for structural changes.
- **Single mode**: Steps 2-5 run only against the target task. Cross-task
  checks (3b ordering, 3d redundancy) still run but only report/fix issues that
  affect the target task. README updates are limited to the target task's row
  in the summary table.

## Step 6: Report Findings

Output a structured report:

```
## Validation Report: <feature-name>

### Summary
- Tasks validated: N
- Issues found: N (X critical, Y moderate, Z minor)

### Per-Task Findings

#### Task N: <title>

| # | Category | Severity | Finding | Fix |
|---|----------|----------|---------|-----|
| 1 | Stale path | Critical | `src/old/path.ts` doesn't exist | Correct to `src/new/path.ts` |
| 2 | Missing dep | Moderate | Implicitly needs Task 2's hook | Add to Prerequisites |
| 3 | Sizing | Minor | Only touches 2 files, ~30 lines | Consider merging into Task N+1 |

### Cross-Task Issues

| # | Category | Severity | Finding | Fix |
|---|----------|----------|---------|-----|
| 1 | Gap | Critical | No task adds Zod validation to server function | Add to Task 1 |
| 2 | Overlap | Moderate | Tasks 2 and 4 both define TickerData type | Consolidate in Task 1 |
| 3 | Ordering | Critical | Task 3 needs Task 4's hook | Swap order to 3→4 or add dep |

### README Issues

| # | Finding | Fix |
|---|---------|-----|
| 1 | Dependency graph doesn't match task numbers | Update graph |
| 2 | Code reuse table missing existing utility X | Add row |
```

**Severity levels:**

- **Critical**: Will cause task execution to fail or produce incorrect code
  (stale paths, wrong field names, missing dependencies, gaps in coverage)
- **Moderate**: Won't fail but will produce suboptimal code (missing reuse
  opportunities, sizing issues, weak acceptance criteria)
- **Minor**: Cosmetic or stylistic (inconsistent terminology, minor
  documentation gaps)

## Step 7: Fix All Issues

After reporting, **directly edit the task files** to fix all Critical and
Moderate issues. For each fix:

1. Edit the task file with the corrected content.
2. If tasks need reordering, rename files to maintain sequential numbering
   (use `git mv` for tracked files).
3. If tasks need merging, combine content into the target task and delete the
   source task (use `git rm` for tracked files). Update numbering.
4. If tasks need splitting, create new task files with correct numbering.
5. Update the `README.md` to reflect any structural changes.

### What to fix directly:

- **Stale file paths** — replace with verified paths
- **Wrong field/type/function names** — replace with actual names from codebase
- **Missing prerequisites** — add to the Prerequisites section
- **Missing acceptance criteria** — add criteria for uncovered requirements
- **Missing files in Files to Create/Modify** — add missing entries
- **Inaccurate code snippets** — correct to match actual codebase
- **Missing coverage** — add requirements for gaps (Zod validation, React Query
  states, error toasts, zustand hydration, openapi-fetch types)
- **Task ordering issues** — renumber and update dependency references
- **Sizing issues** — merge too-small tasks, split too-large ones
- **Overlap/redundancy** — consolidate duplicate work into one task
- **README inconsistencies** — update dependency graph, summary table, code
  reuse table

### What NOT to fix (flag only):

- Architectural decisions that may need user input
- Ambiguous requirements where multiple valid interpretations exist
- Scope questions (should feature X be included or deferred?)

For these, use `AskUserQuestion` to get clarification before proceeding.

## Step 8: Final Verification

After all fixes:

1. Re-read every modified task file to confirm changes are correct.
2. Verify task numbering is sequential with no gaps.
3. Verify all cross-references between tasks are consistent.
4. Verify the README's dependency graph and summary table match the actual
   task files.
5. Report a final summary:

```
## Fixes Applied

| # | Task/File | Change |
|---|-----------|--------|
| 1 | 2-hooks.md | Fixed 3 stale paths, added missing prerequisite |
| 2 | README.md | Updated dependency graph, added code reuse entry |
| 3 | Merged 3-types.md into 2-api.md, renumbered 4→3, 5→4 |

## Remaining Items (need user input)

- [ ] Should pagination be cursor-based or offset-based?
- [ ] Task 3 assumes API endpoint X exists — confirm or defer
```

## Constraints

- Read every task file completely — do not skim
- Verify all file paths, types, and functions against the actual codebase
- Maximum 5 parallel Explore subagents at any time
- Fix issues directly in files — do not just report them
- Use `git mv` for renames, `git rm` for deletions
- Ask the user only for genuine ambiguities or architectural decisions
- All output in English
- Do not modify `X-` prefixed (completed) task files
- Do not change the feature folder name
- Preserve the established task file format (Goal, Prerequisites, Current
  Behavior, Desired Behavior, Requirements, Files to Create/Modify,
  Acceptance Criteria)
