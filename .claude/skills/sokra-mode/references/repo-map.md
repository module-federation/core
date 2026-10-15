# Plugin packages in this repo

Thirteen packages ship webpack or rspack plugins. This file says what each one is, which sokra rules bind it, and the gaps a sokra-style review would flag first. Paths are relative to `packages/`.

## Core plugin layer

| Package | What it is | Follows sokra's shape? |
| --- | --- | --- |
| `enhanced` | TypeScript fork of webpack's `container/` and `sharing/`, plus `startup/` and `container/runtime/` (FederationRuntimePlugin, EmbedFederationRuntimePlugin, FederationModulesPlugin). | Yes: `createSchemaValidation` in 10 plugins, `getCompilationHooks` + `WeakMap`, `runtimeRequirementInTree`, 7 RuntimeModules, `configCases`. Hold it to the full rule set. |
| `rspack` | Wraps rspack's native `container.ModuleFederationPlugin`. Adds `RemoteEntryPlugin` and `TreeShakingSharedPlugin`, and injects runtime plugins from `afterPlugins`. | Option shaping only. Module and dependency internals live in rspack. Changes here usually need a matching rspack change. |
| `sdk` | Shared option types (`src/types/plugins/ModuleFederationPlugin.ts`), `normalizeWebpackPath`, and the types generated from `enhanced` schemas. | Type source of truth. A new option starts here and in `enhanced/src/schemas`. |

## Target and framework plugins

| Package | What it is | Hooks it uses | Gaps to watch |
| --- | --- | --- | --- |
| `node` | Node target: `NodeFederationPlugin`, `UniversalFederationPlugin`, `StreamingTargetPlugin`, `CommonJsChunkLoadingPlugin` with `DynamicFilesystemChunkLoadingRuntimeModule`, `RemotePublicPathRuntimeModule`, `EntryChunkTrackerPlugin`, `ChunkCorrelationPlugin`. | `thisCompilation`, 11 `runtimeRequirementInTree` taps, 2 RuntimeModules, `JavascriptModulesPlugin.getCompilationHooks`. | 2 test files. No schema validation. String tap names instead of `PLUGIN_NAME`. A `// this breaks things` next to a `RuntimeGlobals.publicPath` add in `CommonJsChunkLoadingPlugin.ts` is the kind of unexplained workaround sokra rejects. The `.js` and `.ts` copies of `ChunkCorrelationPlugin` should not both exist. |
| `nextjs-mf` | `NextFederationPlugin` composes `CopyFederationPlugin`, `InvertedContainerPlugin` (+ RuntimeModule), `RemoveEagerModulesFromRuntimePlugin`, `FederatedStatsCompatibilityPlugin`, and `ModuleFederationPlugin`, split by `isServer` into `apply-server-plugins.ts` and `apply-client-plugins.ts`. | `thisCompilation`, `make`, `afterEmit`, `processAssets` (REPORT), `optimizeChunkModules`, `additionalTreeRuntimeRequirements`. | 6 test files. Options are validated by hand in `validate-options.ts`, not a schema. The umbrella composes well, but the server/client split branches on the compiler name, which is this repo's version of "don't switch on `target`"; keep it in one place. |
| `dts-plugin` | `DtsPlugin` composes `DevPlugin`, `GenerateTypesPlugin`, `ConsumeTypesPlugin`. Generates and fetches `.d.ts` archives. | `thisCompilation` → `processAssets` at `OPTIMIZE_TRANSFER`, `afterEmit`, one `WeakMap`. | Best-tested framework plugin (15 files). Heavy async work in `processAssets`, so keep it off the critical path and never block on the network without a timeout. |
| `manifest` | `StatsPlugin` emits `mf-manifest.json` and `mf-stats.json` from `StatsManager` and `ManifestManager`. | `thisCompilation` → `processAssets` at `OPTIMIZE_TRANSFER`, `emitAsset` with `RawSource`. | 2 test files. Output must be deterministic: sort module and asset lists before serializing, since the manifest feeds long-term caching and snapshots. |
| `rsbuild-plugin` | Rsbuild plugin that configures rspack's MF plugin and SSR. | Rsbuild hooks, not compiler hooks. | Option shaping. Validate at the boundary. |
| `utilities` | `DelegateModulesPlugin` and shared helpers. | `thisCompilation`. | Small. Keep it small. |
| `typescript`, `native-federation-typescript`, `native-federation-tests`, `storybook-addon`, `observability-plugin` | Older or peripheral plugins. `typescript` has no tests. | Mixed. | Legacy. Prefer fixing over refactoring, and don't add features here without a use case. |

## Runtime side (no compiler hooks, same discipline)

| Package | Role |
| --- | --- |
| `runtime-core` | Runtime logic: share scopes, remotes, snapshot, plugin system in `src/utils/hooks`. Tests in `__tests__`. |
| `runtime` | Public runtime entry over `runtime-core`. |
| `webpack-bundler-runtime` | What `enhanced` RuntimeModules call via `federationGlobal.bundlerRuntime.*`. |
| `runtime-plugins`, `retry-plugin`, `error-codes` | Runtime plugins and the error-code registry. Add a plugin or a hook before adding an option. |

## Rules that apply to every plugin package

- **Compose, don't inline.** An umbrella plugin (`NodeFederationPlugin`, `NextFederationPlugin`, `DtsPlugin`) applies sub-plugins from `apply`. Each sub-plugin works on its own.
- **Runtime code goes through requirements.** Add a `RuntimeGlobals` need, tap `runtimeRequirementInTree`, and add a RuntimeModule. Keep RuntimeModules thin and push logic to `runtime-core` or `webpack-bundler-runtime`.
- **Asset emission uses `processAssets` with a named stage.** Use `OPTIMIZE_TRANSFER` for files consumed by other builds (manifest, types) and `REPORT` for stats.
- **Validate options at the boundary.** `enhanced` uses schemas. Every other package should validate with the same rigor before options reach a hook, and fail with a message that names the option and the fix.
- **Cross-package changes are sibling checks.** A change to `enhanced` sharing usually has counterparts in `rspack`, `runtime-core`, `webpack-bundler-runtime`, `node`, and `nextjs-mf`. Grep them before calling the change done.
- **Tests match the layer.** Compiler-driven behavior gets a `configCases` or `compiler-unit` case in `enhanced`, or a jest case in the package. Runtime behavior gets a `runtime-core` spec. E2E lives in `apps/` (`node-host`, `next-app-router`, `3000-home`) and runs through `pnpm run ci:local --only=<job>`.
- **Tap names:** use a `PLUGIN_NAME` constant per plugin, not per-call strings.
- **Unexplained workarounds are blockers.** A comment like "this breaks things" is a request to find out why.
