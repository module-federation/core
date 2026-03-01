# AGENTS.md

How AI coding agents should operate in this repository.

> **Important migration note (Turborepo):**
> Nx orchestration has been removed from this repository. Prefer Turbo + package scripts for all build/test/lint workflows.

## Scope and Precedence

- Scope: this file applies to the full repository root.
- Precedence: a deeper `AGENTS.md` overrides this file for its subtree.
- This is an agent-operations document, not a contributor tutorial.

## Source of Truth (in priority order)

1. GitHub Actions workflows in `.github/workflows/*.yml` and `.github/workflows/*.yaml`
2. Local CI parity runner in `tools/scripts/ci-local.mjs`
3. Root scripts in `package.json` as wrappers/convenience entrypoints

If prose docs conflict with workflows (for example `README.md` or `CONTRIBUTING.md`), follow the workflow commands.

## Environment Parity

- Node.js: `20` (from `.nvmrc` and workflow setup)
- pnpm: `10.28.0` (from `package.json` `packageManager`)
- Package manager: pnpm only

Preferred setup for agents:

```bash
pnpm run setup:codex
```

Fallback setup:

```bash
corepack enable
pnpm install --frozen-lockfile
```

Worktree safety rule:

- In git worktree contexts, prefer running Turbo/package scripts directly (`pnpm exec turbo ...` / `pnpm --filter ... run ...`).

### Worktree Mode (Required in Worktrees)

Use these rules whenever the checkout is a git worktree (typically `git rev-parse --git-dir` differs from `git rev-parse --git-common-dir`):

1. Setup/install via:

```bash
pnpm run setup:codex -- --frozen-lockfile
```

2. Run workspace tasks via Turbo/package scripts:

```bash
pnpm exec turbo run <task>
pnpm --filter <package-name> run <script>
```


## CI-Aligned Command Matrix

Use these as defaults unless the task explicitly requires something else.

### Formatting

- CI-equivalent format gate:

```bash
pnpm exec prettier --check .
```

- Local format fix:

```bash
pnpm exec prettier --write .
```

Wrapper script also exists: `pnpm run lint-fix`.

### Package Pipeline Parity (`tag:type:pkg`)

- Cold-cache package build:

```bash
pnpm run build:pkg
```

- Warm-cache package build:

```bash
pnpm run build:pkg
```

- Package tests:

```bash
pnpm run test:pkg
```

### Metro Pipeline Parity (`tag:type:metro`)

- Build pkg + metro:

```bash
pnpm run build:pkg
```

- Metro tests:

```bash
pnpm exec turbo run test --filter=@module-federation/metro*
```

- Metro lint:

```bash
pnpm exec turbo run lint --filter=@module-federation/metro*
```

### E2E Parity via Local CI Runner

- List available jobs:

```bash
pnpm run ci:local --list
```

- Run a single job:

```bash
pnpm run ci:local --only=<job>
```

- Current job names (from `tools/scripts/ci-local.mjs`):
  - `build-and-test`
  - `build-metro`
  - `e2e-modern`
  - `e2e-runtime`
  - `e2e-manifest`
  - `e2e-node`
  - `e2e-next-dev`
  - `e2e-next-prod`
  - `e2e-treeshake`
  - `e2e-modern-ssr`
  - `e2e-router`
  - `e2e-shared-tree-shaking`
  - `devtools`
  - `bundle-size`
  - `actionlint` (listed, CI-only skip)
  - `bundle-size-comment` (listed, CI-only skip)

## Task-to-Checks Decision Table

Run the smallest deterministic set that matches the change type.

| Change type | Required checks | Optional checks |
| --- | --- | --- |
| Docs-only (no code/config behavior change) | none by default; run only checks explicitly requested by user | `pnpm exec prettier --check .` |
| Package code in `packages/*` (non-metro) | `pnpm exec prettier --check .`; package build; package tests | targeted project test/build commands |
| Metro package code (`tag:type:metro`) | metro parity set (build pkg+metro, affected metro tests, metro lint) | E2E metro job via `ci:local` when relevant |
| App/E2E-related changes in `apps/*` or E2E scripts/workflows | `pnpm run ci:local --only=<matching-job>` | additional related `ci:local` jobs |
| Release workflow/release tooling changes | release sanity commands only, no publish | package/metro builds if impacted |

Release sanity commands (no publish):

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm --filter @changesets/assemble-release-plan run build
```

For every handoff, agents must report:

- Exactly which commands were run
- Which expected checks were skipped
- Why each skipped check was not run

## Changesets and Release Guardrails

- If a publishable package behavior changes, add a changeset:

```bash
pnpm run changeset
```

- Release workflows are defined by:
  - `.github/workflows/release.yml`
  - `.github/workflows/release-pull-request.yml`
- Do not run publish commands (`pnpm -r publish`, release execution, or equivalent) unless the user explicitly requests release execution.

## Git Hooks and Commit Policy

Current hooks:

- `.husky/pre-commit` runs:
  - `npm run lint-fix`
  - `git add .`
- `.husky/commit-msg` runs:
  - `npm run commitlint ${1}`

Guidance:

- This AGENTS update does not change hook behavior.
- Keep commit messages compatible with conventional commits (`@commitlint/config-conventional`).

## Operating Rules

- Keep changes minimal and directly scoped to the user request.
- Prefer modifying existing files over creating new files.
- Reuse existing Turbo tasks and package scripts; do not introduce redundant tooling without need.
- Preserve public API compatibility unless user requests a breaking change.
- Never switch package manager or lockfile strategy.
- Do not alter CI/release mechanics unless explicitly requested.

## Safety Constraints

- Never commit secrets or `.env` values.
- Never run destructive git commands unless explicitly requested.
- If unrelated files are dirty, leave them untouched.
