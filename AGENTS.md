# AGENTS.md

How AI coding agents should operate in this repository.

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

- In git worktree contexts, prefer `pnpm run nx:safe -- <nx args>` to avoid Nx daemon issues.

### Worktree Mode (Required in Worktrees)

Use these rules whenever the checkout is a git worktree (typically `git rev-parse --git-dir` differs from `git rev-parse --git-common-dir`):

1. Setup/install via:

```bash
pnpm run setup:codex -- --frozen-lockfile
```

2. Run Nx commands via:

```bash
pnpm run nx:safe -- <nx args>
```

3. Avoid plain `pnpm nx ...` for routine worktree commands unless `NX_DAEMON=false` is set explicitly.
4. If Nx reports missing projects or stale graph/cache behavior, refresh graph cache with:

```bash
NX_DAEMON=false pnpm exec nx show projects --json >/dev/null
```


## CI-Aligned Command Matrix

Use these as defaults unless the task explicitly requires something else.

### Formatting

- CI-equivalent format gate:

```bash
npx nx format:check
```

- Local format fix:

```bash
nx format:write --uncommitted
```

Wrapper script also exists: `pnpm run lint-fix`.

### Package Pipeline Parity (`tag:type:pkg`)

- Cold-cache package build:

```bash
npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4 --skip-nx-cache
```

- Warm-cache package build:

```bash
npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4
```

- Affected package tests:

```bash
npx nx affected -t test --parallel=3 --exclude='*,!tag:type:pkg'
```

### Metro Pipeline Parity (`tag:type:metro`)

- Build pkg + metro:

```bash
npx nx run-many --targets=build --projects=tag:type:pkg,tag:type:metro --parallel=4 --skip-nx-cache
```

- Affected metro tests:

```bash
npx nx affected -t test --parallel=2 --exclude='*,!tag:type:metro'
```

- Metro lint:

```bash
npx nx run-many --targets=lint --projects=tag:type:metro --parallel=2
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
| Docs-only (no code/config behavior change) | none by default; run only checks explicitly requested by user | `npx nx format:check` |
| Package code in `packages/*` (non-metro) | `npx nx format:check`; cold + warm pkg build; affected pkg tests | targeted project test/build commands |
| Metro package code (`tag:type:metro`) | metro parity set (build pkg+metro, affected metro tests, metro lint) | E2E metro job via `ci:local` when relevant |
| App/E2E-related changes in `apps/*` or E2E scripts/workflows | `pnpm run ci:local --only=<matching-job>` | additional related `ci:local` jobs |
| Release workflow/release tooling changes | release sanity commands only, no publish | package/metro builds if impacted |

Release sanity commands (no publish):

```bash
pnpm install --frozen-lockfile --ignore-scripts
npx nx build assemble-release-plan
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
- Keep commit messages compatible with conventional commits and repo commitlint config (`@commitlint/config-conventional` + `@commitlint/config-nx-scopes`).

## Operating Rules

- Keep changes minimal and directly scoped to the user request.
- Prefer modifying existing files over creating new files.
- Reuse existing Nx targets and scripts; do not introduce parallel tooling without need.
- Preserve public API compatibility unless user requests a breaking change.
- Never switch package manager or lockfile strategy.
- Do not alter CI/release mechanics unless explicitly requested.

## Safety Constraints

- Never commit secrets or `.env` values.
- Never run destructive git commands unless explicitly requested.
- If unrelated files are dirty, leave them untouched.
