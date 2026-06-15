---
description: Execute all tasks in a task folder (or a single task file) — plan, implement, and quality-analyze each task using agent teams.
model: opus
---

# Execute Tasklist

## Purpose

You are a task orchestrator (team lead) that processes an entire task folder
end-to-end. For each task, you spawn **teammates** that plan, implement, and
quality-fix the code. Teammates are full Claude Code sessions that can spawn
their own subagents and run commands/skills.

**Arguments**: $ARGUMENTS

The argument can be:

- A **task folder** (e.g., `tasks/data-table/`) — executes all tasks in the folder
- A **single task file** (e.g., `tasks/data-table/3-some-task.md`) — executes only that task

## Step −1: Detect Runtime

Inspect the tools available to you in _this_ session, then pick **exactly one**
orchestration branch and ignore the others for the rest of the turn:

- **Claude Code branch** — choose if you have a `TeamCreate` tool and an
  `Agent` tool that accepts `team_name`, `mode`, and `model` parameters.
  Follow `## Runtime A: Claude Code orchestration` below.
- **pi branch** — choose if you have a single `teams` tool with actions
  `member_spawn`, `delegate`, `task_list`, and `member_stop`. Follow
  `## Runtime B: pi orchestration` below.
- **Codex branch** — choose if you have neither of the above team surfaces
  but can spawn **subagents** (the project defines them as TOML files in
  `.codex/agents/`, and Codex spawns them on request, capping concurrency
  with `agents.max_threads`). Follow `## Runtime C: Codex orchestration`
  below.

If none of these tool surfaces is present, stop and tell the user the runtime
is unsupported (this command requires Claude Code with teams, pi with the
teams extension, or Codex with subagents).

Steps 0, 1, 7, and 8 are runtime-agnostic and apply to all branches.

## Step 0: Environment Setup

Before doing anything else, ensure the development environment is ready.

### 0a. Install dependencies

Check whether `node_modules/` exists in the project root. If it does not, run:

```bash
pnpm install
```

Wait for it to complete before proceeding.

### 0b. OpenAPI codegen (if schema changed)

Do **not** start `pnpm dev`. If the OpenAPI schema (`openapi.json`) changed,
teammates that depend on the generated types must regenerate them on demand:

```bash
pnpm generate:api
```

This regenerates `src/lib/api/schema.d.ts` without starting the dev server,
so TypeScript types stay current. Re-run it after any schema change.

## Step 1: Discover Tasks

**Detect mode** based on the argument:

- If the argument ends in `.md` → **single-task mode** (the argument is a task file)
- Otherwise → **folder mode** (the argument is a task folder)

### Folder mode

1. Read the `README.md` in the provided task folder to understand the feature.
2. List all task files matching the pattern `N-*.md` (where N is a number).
   Exclude files prefixed with `X-` (already completed).
3. Sort by number to get execution order.
4. Report the task list to the user:

```
Found <N> tasks to execute in <folder>:
  1. <task-1-filename> — <task title from first line>
  2. <task-2-filename> — <task title>
  ...
```

If no uncompleted tasks are found, tell the user and stop.

### Single-task mode

1. Derive the task folder from the file's parent directory.
2. Read the `README.md` in that folder for context.
3. Verify the file exists and is not already prefixed with `X-`.
4. The task list is just the one file. Report:

```
Executing single task: <task-filename> — <task title from first line>
```

---

## Runtime A: Claude Code orchestration

Follow this section only if Step −1 selected **Claude Code**. Skip ahead to
`## Runtime B: pi orchestration` otherwise.

## Step 2: Create Team

Create a team for executing the tasklist:

```
TeamCreate: execute-<folder-name>
```

You are the team lead. Teammates will be spawned for each phase.

## Step 3: Parse Dependencies

Read the **Task Summary** table from the README.md and extract the
**Dependencies** column for each task. Build a dependency map:

```
Task 1: depends on []
Task 2: depends on [1]
Task 3: depends on [2]
Task 4: depends on [1]
Task 6: depends on []
```

Group tasks into **execution waves** — a wave contains all tasks whose
dependencies are fully satisfied by previously completed waves:

```
Wave 1: [1, 6]        ← no dependencies
Wave 2: [2, 4, 5, 7]  ← depend only on wave-1 tasks
Wave 3: [3]            ← depends on wave-2 task
```

Report the execution plan to the user:

```
Execution plan (parsed from README.md dependencies):
  Wave 1 (parallel): Task 1, Task 6
  Wave 2 (parallel): Task 2, Task 4, Task 5, Task 7
  Wave 3 (parallel): Task 3
```

If the Dependencies column is missing or all tasks list "None", fall back to
**sequential execution** (each task is its own wave).

## Step 4: Execute Waves

Process waves **sequentially**. Within each wave, execute all tasks **in
parallel** using teammates.

### For each wave:

Spawn **one teammate per task** in the wave, all in a **single message** with
multiple Agent tool calls so they run concurrently. Each teammate is named
`plan-execute-<N>` using the Agent tool with `team_name`,
`mode: "bypassPermissions"`, and **always `model: "opus"`**.

**Model rule (non-negotiable):** Every plan+execute teammate runs on
`model: "opus"` — never Sonnet, never Haiku, regardless of task size or
perceived triviality.

```
Plan and implement task: <full-path-to-task-file>

You are a senior engineer. Follow these steps:

1. Read the task file and the parent folder's README.md for context.
2. Read folder-level CLAUDE.md files for every folder you'll touch.
3. Read any sibling tasks prefixed with X- (already completed) for context.
4. Validate every reference in the task against the codebase:
   - Verify files, types, hooks, and functions exist at stated paths
   - Check if work is already partially done
   - Search for naming conflicts before creating anything new
5. Check for issues: duplicate code, missing reuse, convention violations,
   missing steps the task doesn't mention.
6. Write a validated .plan.md file next to the task file (audit artifact).
   Use this structure:
   - Context, Pre-existing work, Issues found, Improvements
   - Numbered steps with verified file paths and concrete details
   - Files to create/modify table
   - Acceptance criteria checklist
7. Implement all steps from the plan:
   - Follow the plan precisely
   - Search before creating any new file/type/hook/component
   - Follow all CLAUDE.md conventions
   - Use existing patterns from neighboring files
8. If the OpenAPI schema changed, run `pnpm generate:api` to regenerate
   `src/lib/api/schema.d.ts`. Do NOT start `pnpm dev`.
9. Update folder-level CLAUDE.md for every folder you touched.

Rules:
- Reuse first — extend existing code instead of creating new
- Minimal diff — smallest change that achieves the goal
- All file paths must be verified against actual codebase, not copied from task
- Write .plan.md even though you implement it yourself — it's an audit artifact
- **Clarify before guessing** — if the task is ambiguous, contradicts the
  codebase, leaves an approach/scope decision open, or you are otherwise
  unsure, call the `AskUserQuestion` tool to resolve every open question
  with the user before finalizing `.plan.md` or writing code. Batch related
  questions into one call (up to 4 questions) instead of asking one-by-one.
- **Do NOT run `pnpm check`, `tsc --noEmit`, `pnpm lint`, or any other
  typecheck/lint commands.** The user runs these themselves after the
  tasklist is complete. Just write correct code and move on.
```

**Wait for ALL teammates in the wave to complete.** Then for each:

- Read the generated `.plan.md` to verify it exists.
- Note the number of files created/modified from the teammate's output.

#### Progress reporting

After all tasks in a wave complete, report:

```
Wave <W>/<total-waves> complete:
  Task <N>/<total>: <task-title> — Plan+Execute: completed
  Task <M>/<total>: <task-title> — Plan+Execute: completed
```

**Then proceed to the next wave.** Do not start a wave until all tasks in the
previous wave have completed.

## Step 5: Quality Pass

After all waves are complete, spawn a final teammate named
`quality-holistic` using the Agent tool with `team_name`,
`mode: "bypassPermissions"`, and `model: "opus"`. The QA pass **always**
runs on Opus regardless of how individual implementation tasks were graded:

### Folder mode (multiple tasks)

```
Quality review for all tasks in: <full-path-to-task-folder>

Run /quality-analysis with argument: "<full-path-to-task-folder> all tasks"
(e.g. "tasks/my-feature/ all tasks")

This will:
1. Parse all requirements and acceptance criteria from EVERY task file
2. Audit each task's implementation against its requirements
3. Check all code introduced by every task against all quality rules
   (types, reusability, code sharing, SATD, complexity, conventions,
   correctness)
4. Catch cross-task issues:
   - Duplicate code introduced across different tasks
   - Inconsistent patterns between tasks (naming, structure, conventions)
   - Missing shared abstractions — code that should have been extracted
   - Integration issues — tasks that don't wire together correctly
   - Unused imports, dead code, or leftover scaffolding
   - CLAUDE.md files that are stale or missing updates
   - Type safety across module boundaries
5. Grade each task individually AND provide an overall grade
6. Fix all HIGH, MEDIUM and LOW issues found
7. Rename task files with X- prefix for tasks graded Complete + Ship
```

### Single-task mode

```
Quality review for task: <full-path-to-task-file>

Run /quality-analysis with argument: "<full-path-to-task-folder> task <N>"
(e.g. "tasks/my-feature/ task 3")

This will:
1. Parse all requirements and acceptance criteria from the task file
2. Audit the implementation against each requirement
3. Check all code introduced by the task against all quality rules
4. Report findings with impact levels
5. Grade the implementation
6. Fix all HIGH, MEDIUM and LOW issues
7. Rename task file with X- prefix if Complete + Ship
```

**After the teammate completes:**

- Note the per-task grades, overall grade, number of fixes applied, and any
  remaining issues.
- Include the grades in the final report.

## Step 6: Clean Up Team

After all tasks are processed, clean up:

```
TeamDelete: execute-<folder-name>
```

---

## Runtime B: pi orchestration

Follow this section only if Step −1 selected **pi**. Everything below mirrors
Steps 2–6 of Runtime A, translated to pi's `teams` tool surface.

### Step 2 (pi): Implicit team

pi auto-derives the team ID from the leader's cwd via `ensureTeamId()`; there
is no `TeamCreate` equivalent and no name to choose. Skip directly to Step 3.

### Step 3 (pi): Parse Dependencies

Identical to Runtime A Step 3 — read the Task Summary table from `README.md`,
build a dependency map, group tasks into waves. Report the execution plan to
the user in the same format.

### Step 4 (pi): Execute Waves

Process waves **sequentially**. Within each wave, dispatch all tasks **in one
`teams delegate` call** so the workers spin up concurrently. Then poll until
the wave completes.

**Model rule (non-negotiable, identical to Runtime A):** every plan+execute
worker runs on `model: "anthropic/claude-opus-4-7"`. Never Sonnet, never
Haiku, regardless of task size.

#### For each wave:

Issue a single `teams` tool call:

```
action: "delegate"
spawn: [
  { name: "plan-execute-<N1>", model: "anthropic/claude-opus-4-7", thinking: "high" },
  { name: "plan-execute-<N2>", model: "anthropic/claude-opus-4-7", thinking: "high" },
  ...
]
tasks: [
  { text: "<full plan+execute prompt for task N1>", assignee: "plan-execute-<N1>" },
  { text: "<full plan+execute prompt for task N2>", assignee: "plan-execute-<N2>" },
  ...
]
```

Each task `text` is the same plan+execute prompt as Runtime A Step 4 (the
nine-step "You are a senior engineer…" block including `pnpm generate:api`
guidance and the no-typecheck/lint rule).

Record the `taskIds` returned by `delegate` — you need them to poll.

#### Wait for the wave to complete

Loop:

1. Sleep ~10 seconds.
2. Call `teams action: "task_list"`.
3. From the returned `tasks` array, filter to the wave's `taskIds`.
4. Stop when **every** matching task has `status === "completed"` or
   `status === "failed"`.

#### Progress reporting

Same format as Runtime A.

**Then proceed to the next wave.**

### Step 5 (pi): Quality Pass

After all waves are done, run the quality pass via `teams delegate` with a
single spawn and a single task — same prompt as Runtime A Step 5.
Poll `teams task_list` until the quality task is `completed` or `failed`.

### Step 6 (pi): Stop Workers

```
action: "member_stop"
all: true
```

---

## Runtime C: Codex orchestration

Follow this section only if Step −1 selected **Codex**. Codex has no team
surface — instead you fan out **subagents**.

Three Codex-specific constraints override Runtime A:

1. **No autoload of skills or slash commands.** A Codex subagent must **manually
   `Read` the workflow file from `.codex/`** — e.g. for quality analysis, Read
   `.codex/skills/quality-analysis/references/command.md` and follow it directly.
2. **Depth is capped at 1.** A spawned subagent cannot spawn its own subagents.
3. **Model inherits from the parent session.** Omit any per-agent `model` override.

### Step 2 (Codex): No team

There is no team to create. Proceed to Step 3.

### Step 3 (Codex): Parse Dependencies

Identical to Runtime A Step 3.

### Step 4 (Codex): Execute Waves

Process waves **sequentially**. Spawn one subagent per task concurrently — in
a single message. Codex caps concurrent threads at `agents.max_threads`
(default 6); the excess queues automatically.

Each subagent receives the same nine-step plan+execute prompt as Runtime A
Step 4, with this Codex preamble prepended:

```
You are a Codex subagent. You do NOT have the leader's slash commands or
skills autoloaded, and you cannot spawn your own subagents (depth is capped).
Do all of the following work yourself. If any step references a slash command
or skill, instead Read the matching file under
`.codex/skills/<name>/references/command.md` (or its `SKILL.md`) and follow
that workflow directly.
```

### Step 5 (Codex): Quality Pass

Spawn a **single** quality subagent with this preamble prepended to the
Runtime A Step 5 quality prompt:

```
You are a Codex subagent performing a holistic quality review. You cannot
spawn your own subagents and do NOT have the /quality-analysis skill
autoloaded. Read `.codex/skills/quality-analysis/references/command.md`
(symlink to .claude/commands/quality-analysis.md) and perform every step of
that workflow YOURSELF — do not attempt to delegate parallel review agents;
instead audit each quality dimension sequentially.
```

### Step 6 (Codex): No cleanup

Codex subagents are ephemeral. Proceed to Step 7.

---

## Step 7: Clean Up Plan Files

Delete all `.plan.md` files generated during execution:

```bash
rm <task-folder>/*.plan.md
```

## Step 8: Final Report

Present a summary:

```
## Execution Complete: <feature-name>

### Execution Plan
  Wave 1 (parallel): Task 1, Task 6
  Wave 2 (parallel): Task 2, Task 4
  Wave 3: Task 3, Task 5

### Results

| Task | Wave | Plan+Execute | Quality Grade | Status |
|------|------|-------------|---------------|--------|
| 1: <title> | 1 | OK | Ship | Marked done |
| 6: <title> | 1 | OK | Ship | Marked done |
| 2: <title> | 2 | OK | Needs work | Pending |
| ... | ... | ... | ... | ... |

**Overall quality grade:** <grade> — <N> issues fixed

### Action Items
- [ ] <Any tasks that need rework>
- [ ] <Any unresolved issues>
```

## Constraints

- Process waves **sequentially** — a wave only starts after the previous wave
  completes
- Within each wave, execute all tasks **in parallel** using concurrent teammates
- Parse the Dependencies column from the Task Summary table to determine waves
- If no Dependencies column exists, fall back to sequential (one task per wave)
- Do NOT implement code yourself — always delegate to teammates
- Do NOT analyze code yourself — always delegate to teammates
- If a task has unresolved prerequisites, skip it and report why
- Skip tasks that already have an `X-` prefix (already completed)
- All reporting must be in English
- Teammates run with `bypassPermissions` mode for autonomous execution
  (Runtime A only)

## Error Handling

- **Plan+Execute teammate fails**: Report the error, continue to next task
- **Quality pass teammate fails**: Report the error, include partial results
  in the final report
- **All tasks skipped**: Report why and suggest fixes
