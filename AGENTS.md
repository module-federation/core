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

Recommended setup for agents:

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
corepack enable
pnpm install --frozen-lockfile
```

2. Run workspace tasks via Turbo/package scripts:

```bash
pnpm exec turbo run <task>
pnpm --filter <package-name> run <script>
```


## CI-Aligned Command Matrix

Use these as defaults unless the task explicitly requires something else.

### Turbo Task Primer (How to Run Tasks)

- List effective tasks:

```bash
pnpm exec turbo run build --dry=json
```

- Run a task across the workspace:

```bash
pnpm exec turbo run <task>
```

- Run a task for packages only:

```bash
pnpm exec turbo run <task> --filter=./packages/**
```

- Run a task for one package:

```bash
pnpm exec turbo run <task> --filter=@module-federation/<pkg>
```

- Run a package script directly (bypasses workspace fanout):

```bash
pnpm --filter @module-federation/<pkg> run <script>
```

- Disable cache for validation/debug runs:

```bash
pnpm exec turbo run <task> --force
```

- Common Turbo tasks defined in `turbo.json`:
  - `build`
  - `test` (depends on `^build`)
  - `lint`
  - `e2e` / `test:e2e` / `test:e2e:production`

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

### Package Pipeline Parity

- Package build (Turbo cache handled automatically):

```bash
pnpm run build:packages
```

- Package tests:

```bash
pnpm run test:packages
```

- Package lint:

```bash
pnpm run lint:packages
```

Root build/lint scripts delegate to the package pipeline scripts.

### Metro Pipeline Parity

- Build pkg + metro:

```bash
pnpm run build:packages
```

- Metro tests:

```bash
pnpm exec turbo run test --filter=@module-federation/metro --filter=@module-federation/metro-plugin-rnef --filter=@module-federation/metro-plugin-rock --filter=@module-federation/metro-plugin-rnc-cli
```

- Metro lint:

```bash
pnpm exec turbo run lint --filter=@module-federation/metro --filter=@module-federation/metro-plugin-rnef --filter=@module-federation/metro-plugin-rock --filter=@module-federation/metro-plugin-rnc-cli
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
| Metro package code (`packages/metro-*`) | metro parity set (build pkg+metro, metro tests, metro lint) | E2E metro job via `ci:local` when relevant |
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

## Pull Request Conventions

- PR titles should use the same conventional-commit style as commits when practical, for example `fix(runtime): handle missing remote entry` or `chore(enhanced): remove unused plugin`.
- Prefer PR titles without extra prefixes such as `[codex]`; the title should describe the change directly.
- PR bodies should be prose-first and explain:
  - what changed
  - why the change was needed
  - user or runtime impact
  - validation that was run
  - any failed or skipped checks, with cause
- If a PR is docs-only, say that explicitly and keep the body brief.

## Webpack Internal Access

- When accessing webpack internals from repo code, prefer the repo's normalized webpack-path convention over direct bare-package imports.
- Prefer:

```ts
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const InternalThing = require(
  normalizeWebpackPath('webpack/lib/some/internal/path'),
) as typeof import('webpack/lib/some/internal/path');
```

- For top-level webpack access, prefer:

```ts
const webpack = require(normalizeWebpackPath('webpack')) as typeof import('webpack');
```

- Avoid introducing new direct bare-path requires such as `require('webpack/lib/...')` when the normalized path pattern is available.
- Avoid introducing new direct webpack package imports for internals when the existing module uses normalized `require(...)` conventions.
- When editing an existing file, preserve the local webpack-loading style already used there unless there is a deliberate reason to migrate the file consistently.

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
