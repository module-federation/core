---
name: sokra-mode
description: >-
  Design, build, and maintain module-federation/core the way sokra (Tobias
  Koppers) built webpack 5: plugin architecture, container/sharing, runtime,
  caching, and reviews. Use for /sokra-mode, "sokra mode", "do it like sokra",
  or "review this like sokra would".
disable-model-invocation: true
---

# sokra mode

This skill applies sokra's webpack design discipline to building and maintaining this repo. `packages/enhanced` is a TypeScript fork of the container and sharing plugins he wrote, so his rules apply there directly. The rules come from his public webpack/webpack record: 739 authored PRs and 717 reviews (2019–2022), and 400 issues plus 49 discussions (2020–2024). His webpack code stops in November 2022. Don't impersonate him: never sign as him, post as him, or claim his approval. Detailed patterns with evidence links are in [references/plugin-patterns.md](references/plugin-patterns.md), and the per-package map of this repo's thirteen plugin packages is in [references/repo-map.md](references/repo-map.md). Read both before writing a new plugin, Module, Dependency, RuntimeModule, or runtime hook.

## Architecture

- **Build one feature as a slice of small classes.** Each class has one job and its own file: Plugin (wiring), Dependency plus Template, Module subclass, ModuleFactory, RuntimeModule, and a `RuntimeGlobals` entry.
- **Umbrella plugins only compose.** `ModuleFederationPlugin` → `ContainerPlugin` + `ContainerReferencePlugin` + `SharePlugin` → `ConsumeSharedPlugin` / `ProvideSharedPlugin`.
- **Reuse existing machinery.** Remotes are externals. A container is a normal entry with a `library`. Fallbacks go through `normalModuleFactory`.
- **Connect parts through hooks and requirements, not direct calls.**
  - Code declares `runtimeRequirements`, and `runtimeRequirementInTree` adds the modules they need.
  - Extension points are `static getCompilationHooks(compilation)` backed by a `WeakMap`. `FederationModulesPlugin` is this repo's example.
- **Put logic where the concern lives.** Loading goes in the loading or runtime plugin. Error text goes in the error. Build-phase work goes in `Module.build`.
- **Keep build and codeGeneration apart.** Never mutate `buildInfo` in codegen. Pass data out through codegen `data` and custom source types. Anything that crosses from build to codegen must be serializable.
- **Keep the core small, and challenge the premise first.**
  - Ask for the use case, and check whether an existing option or hook already covers it.
  - For rare needs, expose a small override or a replaceable module, not new config.
  - Never add globals.
  - Don't branch on `target`; gate on environment or feature flags.

## Discipline

- **Builds must be deterministic.** Sort every emitted map and key, and use tiebreakers. Output must not depend on build order, the machine, or the Node version. Adding a chunk must not rewrite shared chunks.
- **Caching must be correct by default.**
  - Cached classes use `makeSerializable` and serialize every field, including subclass fields.
  - Per-compilation state goes in a `WeakMap`.
  - Dependency paths are absolute.
  - Anything unsafe stays opt-in.
- **Performance is a correctness concern.** Hot paths do one `get` and compare to `undefined`. Avoid throwaway arrays and quadratic scans. Hoist constant `Set`s and comparators. Lazy-require with `memoize`. Measure perf claims.
- **Memory-trading optimizations are not plain wins.** A cache that grows, or that keeps modules which have left the compilation, goes behind `experiments.*` with eviction, or gets reverted ([#14436](https://github.com/webpack/webpack/pull/14436), [#14319](https://github.com/webpack/webpack/pull/14319)).
- **Never break a public or plugin-facing interface in a minor.** New behavior ships behind `experiments.*`. Renames keep a deprecation shim.
- **Report problems as errors when the output can't be correct, otherwise as warnings.** Messages name the cause and the fix.
- **Every option gets a schema and a precise type.** Name options positively. Use the graph APIs (`moduleGraph`, `chunkGraph`), never legacy `module.*` fields. Use `RuntimeGlobals` and `runtimeTemplate.basicFunction`/`returningFunction`, never a literal `__webpack_require__.x`.

## This repo

- **Package roles.** Thirteen packages are bundler plugins; [references/repo-map.md](references/repo-map.md) lists each with its hooks and gaps.
  - `enhanced` is the webpack plugin layer, and every rule above applies in full.
  - `node`, `nextjs-mf`, `dts-plugin`, `manifest`, `utilities`, and the legacy plugins compose on top of it. Same rules: umbrella plugins compose, runtime goes through requirements, assets go through `processAssets` with a named stage, options are validated at the boundary.
  - `rspack` and `rsbuild-plugin` wrap rspack's native MF plugin. They shape options; module and dependency internals live in rspack itself.
  - `runtime-core` and `webpack-bundler-runtime` hold the runtime logic.
  - `sdk` owns the shared option types.
- **Runtime split.** RuntimeModules in `enhanced` stay thin: they emit data (mappings, ids) and call `federationGlobal.bundlerRuntime.*`. Logic lives in `runtime-core` or `webpack-bundler-runtime`, with unit tests there. This is a deliberate MF 2 change to sokra's "generate the runtime" rule. His rules still govern the glue: `RuntimeGlobals`, requirements, and template helpers.
- **Extend at runtime through plugins.** Keep `runtime-core` small. Add a hook in its plugin system (`src/utils/hooks`) or a runtime plugin (`runtime-plugins`, `retry-plugin`) before adding an option.
- **Webpack internals.**
  - Load them through `normalizeWebpackPath` (see `AGENTS.md`).
  - `makeSerializable` keys are `'enhanced/lib/<path>'`, and there is no `internalSerializables` registry.
  - Types are TypeScript. Avoid `any` and unchecked casts where a precise type exists.
- **Options.** Types go in `packages/sdk/src/types/plugins/ModuleFederationPlugin.ts` and schemas in `packages/enhanced/src/schemas`. Then run `pnpm --filter @module-federation/enhanced run generate:schema`; the pre-commit hook also runs it when schema JSON changes. New behavior goes under the plugin's `experiments`.
- **Errors.** Runtime errors carry codes from `@module-federation/error-codes`, which is this repo's equivalent of `DEP_WEBPACK_*`. Build problems go to `compilation.errors` or `compilation.warnings`.
- **Compatibility.** Every package is published. Add a changeset (`pnpm run changeset`) for publishable behavior changes.

## Verification

- **Every fix and feature needs a regression test that hits the edge that broke.**
  - Build-side: `packages/enhanced/test/configCases/<area>/<case>`, or `test/compiler-unit`. Other plugin packages use jest or rstest cases next to the source.
  - Runtime: `packages/runtime-core/__tests__/*.spec.ts`.
  - E2E: the matching app in `apps/`, via `pnpm run ci:local --only=<job>`.
  - Run with `pnpm --filter <pkg> run test`.
  - A PR without a test is blocked.
- **When you fix one path, check its siblings.** Grep every path that emits the same thing. Check the counterparts in `rspack`, `runtime-core`, `webpack-bundler-runtime`, `node`, and `nextjs-mf` too.
- **Regenerate derived files in the same change:** snapshots, types, schema outputs.

## Reviews

- **Approve without comment, and put every objection inline.** Prefer a `suggestion` block to a description.
- **Lead with the verdict** ("working as expected", "that's a bug", "not supported"). Then give the mechanism in one or two sentences, then a snippet or a permalink.
- **Keep requests short and imperative:** "Please add a test case", "Use `X` instead". When refusing, give the reason and name the alternative. Reject refactors that bring no concrete benefit.
- **Push guards back to the root cause.** "This should never be undefined" means find where the value is produced.
- **Triage:** get a minimal repro repo before debugging, and profiling data before accepting a perf claim. Keep one problem per issue, and name the owning tool when the bug is not ours.

## Process

- **Titles and commits are short imperatives.** Use this repo's conventional-commit prefix (`fix(enhanced): …`), which commitlint enforces. Put regeneration in separate commits (`chore: update snapshots`).
- **Land a feature as one experimental PR, then small single-purpose fix PRs.** Write the PR body the way `AGENTS.md` asks, and say plainly what was not tested.
- **Defer scope creep** to "before this leaves experimental" or to a tracked TODO. Revert quickly when a change costs more than it gives.
