---
name: sokra-mode
description: >-
  Work in sokra's (Tobias Koppers) webpack style: implement, restructure, or
  review core webpack/rspack plugins (module federation, container, sharing,
  runtime) the way webpack 5's architect does. Use for /sokra-mode, "sokra
  mode", "do it like sokra", or "review this like sokra would".
disable-model-invocation: true
---

# sokra mode

These are the conventions to follow when building or reviewing webpack-style plugins. They come from sokra's public webpack/webpack record. His code in that repo stops in Nov 2022, so the evidence covers 739 authored PRs (2019–2022), 717 PRs he reviewed (2019–2022), and 400 issues plus 49 discussions (2020–2024). Don't impersonate him: never sign as him, post as him, or claim his approval. Detailed patterns with evidence links are in [references/plugin-patterns.md](references/plugin-patterns.md). Read it before writing a new plugin, Module, Dependency, or RuntimeModule.

## Architecture

- **Split features into small plugins.** One feature is a vertical slice of small single-purpose classes, one class per file: Plugin (wiring), Dependency plus Template, a Module subclass, a ModuleFactory, a RuntimeModule, and a `RuntimeGlobals` entry. An umbrella plugin only composes the others: `ModuleFederationPlugin` → `ContainerPlugin` + `ContainerReferencePlugin` + `SharePlugin` → `Consume`/`ProvideSharedPlugin`.
- **Reuse existing machinery.** Remotes are externals. A container is a normal entry with a `library`. Fallbacks go through `normalModuleFactory`.
- **Communicate through hooks and requirements, not direct calls.** Code declares `runtimeRequirements`. `runtimeRequirementInTree` adds the runtime modules those requirements need. Extension points are `static getCompilationHooks(compilation)`, backed by a `WeakMap`.
- **Put logic where the concern lives.** Chunk-loading code belongs in the loading or runtime plugin. Error text belongs in the Error class. Build-phase work belongs in `Module.build`.
- **Keep build and codeGeneration separate.** Never mutate `buildInfo` during codegen. Pass data out through the codegen result's `data` and custom source types. Anything that crosses from build to codegen must be serializable.
- **Keep core small.** Challenge the premise first: ask for the use case, and check whether an existing option or hook already covers it. For rare needs, expose a small override or a replaceable RuntimeModule rather than new config. Never add globals.
- **Don't branch on `target` or hard-code enums.** Gate on `output.environment.*` or feature flags, and keep extension points open.

## Discipline

- **Builds must be deterministic.** Sort every emitted map and key, and add tiebreakers. Output may not depend on build order, the machine, or the Node version. Long-term caching matters: adding a chunk must not rewrite shared chunks.
- **Caching must be correct by default.** Classes that land in the cache use `makeSerializable` and serialize every field, including subclass fields. Plugin work goes through `compilation.getCache`. Per-compilation state goes in a `WeakMap`. Dependency paths are absolute. Anything unsafe stays opt-in.
- **Performance is a correctness concern.** In hot paths, do one `get` and compare to `undefined`, avoid throwaway arrays and quadratic scans, hoist constant `Set`s, lazy-require with `memoize`, and use `LazySet`. Don't "clean up" code that is shaped for speed. Back perf claims with measurements. An optimization that trades memory, such as a cache that grows or keeps modules that left the compilation, is not a plain win. Gate it behind `experiments.*` and evict stale entries, or revert it ([#14436](https://github.com/webpack/webpack/pull/14436), [#14319](https://github.com/webpack/webpack/pull/14319)).
- **Never break a plugin-facing interface in a minor.** New behavior goes behind `experiments.*` or `futureDefaults`. Renames keep a `util.deprecate` shim with a `DEP_WEBPACK_*` code and a `// TODO webpack 6` note.
- **Report problems through `WebpackError` subclasses** pushed to `compilation.errors`/`warnings` or `module.addError`/`addWarning`. Make it an error when the build can't be correct. Messages name the cause and the fix.
- **Every option goes in a schema.** Use `additionalProperties: false` and descriptions, validate in the constructor, and regenerate the derived types rather than hand-writing them. Put defaults in the defaults layer. Name options positively.
- **Use the graph APIs.** Use `moduleGraph` and `chunkGraph`, never legacy `module.*` fields. Use `RuntimeGlobals` and `runtimeTemplate.basicFunction`/`returningFunction`, never literal `__webpack_require__.x` or hand-written ES5/arrow branches.

## Verification

- **A bug fix or feature needs a regression test that hits the edge that broke.** Use `test/configCases/<area>/<case>` by default, `watchCases` for incremental builds, `hotCases` for HMR, and `statsCases` for stats output. Expected diagnostics go in `errors.js`/`warnings.js`. Without a test, the PR is blocked.
- **When you fix one path, check its siblings.** Grep every code path that emits the same thing (every RuntimeModule, every library type, non-main chunks) and cover all of them.
- **Regenerate derived files in the same change:** snapshots, types, schema outputs.
- **In this repo:** mirror webpack's layout. Put config cases in `packages/enhanced/test/configCases`, run `pnpm generate:schema` after schema edits, and load webpack internals through `normalizeWebpackPath` (see `AGENTS.md`).

## Reviews

- **Approve without comment. Put every objection inline on a specific line.** Prefer a `suggestion` block with the replacement code over describing the change.
- **Lead with the verdict**, e.g. "working as expected", "that's a bug", "not supported". Follow with the mechanism in one or two sentences, then a minimal snippet or a permalink to the source line.
- **Keep requests short and imperative:** "Please add a test case", "Use `X` instead", "move this to Y". When refusing, give the reason and name the alternative. Reject refactors that have no concrete benefit.
- **Triage:** ask for a minimal repro repo before debugging, and for profiling data (`--cpu-prof`, `ProgressPlugin({ profile: true })`) before accepting a perf claim. Keep one problem per issue. Name the owning tool when the bug is not webpack's.

## Process

- **Titles and commits are lowercase imperatives with no prefix**, like "fix …", "add …", "improve …", "avoid …". Put snapshot and type regeneration in separate `update snapshots` / `update types` commits. Follow this repo's own title convention when it differs.
- **Land features as one experimental PR, then small single-purpose fix PRs.** The PR body is a short bullet list of what changed, plus `fixes #N`. Answer the template honestly ("no, too difficult" is acceptable). List each new option with its type.
- **Defer scope creep** to "before this leaves experimental", or to a tracked TODO. Revert quickly when a change costs more than it gives, and say why in one line.
