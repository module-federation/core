---
name: local-ci
description: Run this repository's local CI parity commands and `pnpm run ci:local` jobs. Use when validating a change against the same job shapes used in GitHub Actions, choosing the smallest local CI job for a package, workflow, E2E, Metro, devtools, bundle-size, or build-and-test change.
---

# Local CI

Use the local CI runner and Turbo/package scripts as the source of truth for validation in this repo.

## Quick Start

1. Start with the smallest deterministic check that matches the change.
2. Prefer `pnpm run ci:local --only=<job>` for CI-parity validation.
3. Prefer direct Turbo or package scripts only when they are the smaller equivalent of the CI job.
4. Report exactly which command ran, what failed first, and which expected checks were skipped.

## Workflow

### 1. Inspect available local CI jobs

Run:

```bash
pnpm run ci:local --list
```

Use this when the right job is unclear or when the repo may have added or renamed jobs.

For the current job map, read [references/jobs.md](./references/jobs.md).

### 2. Pick the smallest matching job

Use these defaults:

- Package code in `packages/*`: start with `build-and-test` only if the change is broad; otherwise prefer package build/test commands.
- Metro packages or Metro workflow changes: use `build-metro`, then Metro E2E jobs only if relevant.
- E2E app changes: run the matching `e2e-*` job instead of `build-and-test`.
- Devtools workflow or Playwright/devtools changes: run `devtools`.
- Bundle-size workflow/reporting changes: run `bundle-size`.
- GitHub workflow syntax only: use `actionlint` locally only to see skip behavior; the actual action is CI-only.
- Broad CI, packaging, publint, Turbo, or shared runtime changes: run `build-and-test`.

### 3. Run commands in CI order

When reproducing CI, use the same command shape as the repo:

```bash
pnpm run ci:local --only=build-and-test
pnpm run ci:local --only=devtools
pnpm run ci:local --only=e2e-runtime
```

To run more than one job:

```bash
pnpm run ci:local --only=build-and-test,bundle-size
```

### 4. Interpret failures correctly

- Treat the first failing step as the actionable failure.
- Ignore known noisy warnings unless they exit non-zero.
- Distinguish repo-wide drift from changed-file gates.
- If `ci:local` fails in `Check code format`, inspect the changed-file formatter result before running broader builds.
- If a dependency build outside the touched scope fails, note it separately as an unrelated blocker.

## Common Cases

### Broad package or runtime/plugin change

Run:

```bash
pnpm run ci:local --only=build-and-test
```

If that fails on format first, fix the changed files before rerunning the whole job.

### One package only

Prefer the smaller direct command first:

```bash
pnpm exec turbo run build --filter=@module-federation/<pkg>
pnpm exec turbo run test --filter=@module-federation/<pkg> --force
```

Then run `build-and-test` only if the user asks for CI parity or the package change affects shared build/runtime behavior.

### E2E change

Run the matching job from [references/jobs.md](./references/jobs.md), not the whole matrix.

### Workflow change

Use the local CI job if one exists for the workflow's behavior. For workflow syntax, pair local validation with the repo's actionlint path when relevant.

## Notes

- `ci:local` sets `CI=true` and mirrors the repo workflow order.
- Some jobs intentionally skip GitHub-only actions such as `actionlint` and `bundle-size-comment`.
- The repo uses `pnpm`, Node 20, and Turbo as the standard execution path.
- In worktrees, still use Turbo/package scripts directly as documented by the repo instructions.
