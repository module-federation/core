---
name: migrate-to-rstest
description: Migrate Jest or Vitest projects to Rstest. Use when asked to move from Jest/Vitest to Rstest, replace `jest`/`vi` APIs with `@rstest/core`, translate config into `rstest.config.ts`, update scripts/coverage/setup/mocks/snapshots/projects, or diagnose migration failures caused by Rstest's Rsbuild/Rspack execution model or version skew.
---

# Migrate to Rstest

## Goal

Migrate Jest/Vitest tests and config to Rstest with minimal behavior changes. Use the current Rstest migration docs for exact mappings; this skill adds scope, dependency, and cleanup guardrails.

## Workflow

1. Detect runner and scope (`references/detect-test-framework.md`).
2. Run dependency/version gates (`references/dependency-install-gate.md`).
3. Read only the needed deltas: Jest, Vitest, and/or global API replacement.
4. Migrate scripts/config/setup before tests; prefer adapters or Rsbuild/Rspack config fixes before editing test bodies.
5. Validate discovery/types/run, fixing failures in this order: dependency skew, config/resolver, setup/env/coverage, mocks/timers/snapshots, test bodies.
6. After the scope is green, remove only scope-local legacy files and devDeps no remaining scope uses.
7. Summarize changes, kept legacy files, unsupported fields, and TODOs.

## Guardrails

- Keep the smallest viable scope; do not broaden a monorepo migration or bulk-rewrite tests when config/setup fixes are plausible.
- Do not change production behavior, assertions, test names, scenarios, or coverage thresholds to make migration pass.
- No `jest`/`vi` shims or aliases; rewrite call sites to Rstest APIs (`references/global-api-migration.md`).
- Do not silently drop unknown config fields; verify or report them as unsupported.

## High-risk Rstest deltas

- `rstest` / `rstest run` is single-run; watch mode is `rstest --watch` or `rstest watch`.
- `globals` defaults to `false`; if globals remain, set `globals: true` and add `@rstest/core/globals` types.
- Rstest runs on Rsbuild/Rspack. Use `references/dependency-install-gate.md` for latest-only APIs, coverage providers, adapters, plugins, and toolchain-version fallbacks.

## Escalate before large edits

If the next fix requires many test edits or production source changes, stop and report: why smaller fixes failed, options, risks, and the recommended path.
