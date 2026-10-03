# Focused module-federation review follow-ups

Correction recorded 2026-10-03: the initial claim that no package publication occurred was incorrect. Read-only exact-head checks show successful automatic pkg.pr.new preview jobs for the pushed #5121, #5144, #5124 and draft #5179 heads; #5180 also has a successful preview job. No manual publish command was run. Later RFC5036 pushes triggered additional automatic previews. The final ledger records these side effects and holds further PR pushes pending authorization of normal preview workflows.

Environment: Node v24.15.0, corepack pnpm 10.28.0, macOS. All changes are in isolated git worktrees under task-4; the original /Volumes/bigssd/projects/core checkout and its unrelated untracked work were preserved. No PR merge, force-push, manual deployment/publication command, or credential/settings change occurred. Automatic package previews are corrected below.

## Published heads

| Lane                                  | Head                                     | Result                                                                                                      |
| ------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| PR5143                                | 226ec3198cff98a7babae288d7915a6088246227 | Unchanged real loadEntry/Pick fix                                                                           |
| Draft PR5179, based on PR5143 branch  | 3f9e3cbcf9fb3ba6f28c4af6b1ac12efc048b0a5 | Type-negative regression and proposal; no production contract refactor                                      |
| PR5121                                | c41da583a0b81cc77f08fd2ae27c94c6569a0f88 | Eight relative/absolute include/exclude admissions through real ProvideSharedPlugin fixture                 |
| PR5144                                | 3636d048dc7547e381cf7491d9da2246a107ab03 | Filesystem-cache restoration in a new process with reversed installed-copy load order                       |
| PR5124                                | 94aa846311eeaa5cdb33afd6894b09c1ba9c791c | Private release planner conditional ESM/CJS declaration exports; real manifest regression                   |
| test/enhanced-node-copy-investigation | 9a393af54ff7beedef6b7462ea015d77f9ce6266 | Real app/node same-compiler HTTP execution, same-copy and separate-compiler controls; strict aggregate gate |

## Validation commands

All pnpm commands below were executed as `corepack pnpm` with `/Users/zackjackson/.nvm/versions/node/v24.15.0/bin` first on PATH.

Builds passed:

- handler: `pnpm exec turbo run build --filter=@module-federation/runtime-core...` (3 successful tasks).
- filter and cache independently: `pnpm exec turbo run build --filter=@module-federation/enhanced...` (15 successful tasks each).
- cache: `pnpm --filter @module-federation/node run build` (successful; existing direct-eval warnings).
- exports: `pnpm exec turbo run build --filter=@module-federation/inject-external-runtime-core-plugin... --filter=@changesets/assemble-release-plan` (8 successful tasks).

Tests passed:

- handler: `pnpm --filter @module-federation/runtime-core run test` (131 passed, zero failures/skips, no snapshot changes). Includes the compiler-driven negative capability tests and the existing four disabled/shared-fallback tests.
- filter: `pnpm exec rstest -c packages/enhanced/rstest.config.ts --project config-cases packages/enhanced/test/ConfigTestCases.basictest.rstest.ts -t provide-request-filters` (selected real compiler fixture passed; 61 other outer cases skipped by selection). The harness executes six inner fixture assertions including both new static-path assertions.
- cache: `pnpm exec rstest -c packages/enhanced/rstest.config.ts --project unit packages/enhanced/test/compiler-unit/container/duplicateEnhancedCopies.test.ts` (1 passed). Checks distinct child PIDs, reversed order, no errors/logs, three cold rebuilt federation modules, zero rebuilt warm/restored modules.
- exports: `node --test tools/scripts/tsdown/config-helpers.test.mjs` (1 passed; now reads both actual package manifests).
- ownership: `MF_REPRO_BUILD_ROOT=/Users/zackjackson/Documents/Codex/2026-10-02/task-4/cache node ownership/tools/repros/enhanced-node-copies.cjs` from task-4 (exit 0; all six scenarios pass actual shared/HTTP remote execution and runtime marker assertions). The committed script runs standalone from its own built checkout without the optional environment override.

Sensitivity checks:

- Removing only the built static actualRequest admission filter and rerunning the selected PR5121 fixture exits 1: excluded relative-include-fail is present. The built artifact was restored and the final test passes.
- A disposable ownership script with wrong-remote replacing one expected returned value exits 1 while retaining JSON assertion diagnostics and removing the temporary fixture. The production investigation script was not mutated.

Direct built and packed publint:

- exports: `pnpm exec publint packages/assemble-release-plan` and `pnpm exec publint packages/runtime-plugins/inject-external-runtime-core-plugin`.
- `pnpm --filter @changesets/assemble-release-plan pack --pack-destination /Users/zackjackson/Documents/Codex/2026-10-02/task-4/packed` and the corresponding inject-plugin command. Both tarballs were extracted into task-4/packed-consumers/node_modules.
- exports: `pnpm exec publint ../packed-consumers/node_modules/@changesets/assemble-release-plan --pack false` and the corresponding inject-plugin command.
- Inject plugin: built and packed All good.
- Private planner before fix: warning that top-level exports.types .d.cts is CJS under import and can make default imports ambiguous; suggestion to add package type. After fix: ambiguity warning removed; type-field suggestion remains. private:true preserved.

Actual packed consumers:

- exports: `node_modules/.bin/tsc --noEmit --strict --skipLibCheck --module NodeNext --moduleResolution NodeNext --target ES2021 ../packed-consumers/consumer.mts ../packed-consumers/consumer.cts ../packed-consumers/require.cts` passes before and after. Consumers default-import both actual packages and use import=require forms. The warning itself did not cause a consumer compilation failure.
- `node packed-consumers/resolutions.cjs`: planner resolves .d.mts for .mts and .d.cts for .cts; plugin resolves .d.ts and .d.cts respectively.
- `node packed-consumers/runtime-cjs.cjs` passes actual calls: empty release plan and named runtime plugin.
- `node packed-consumers/runtime.mjs` fails ERR_MODULE_NOT_FOUND for extensionless semver/functions/gt in the private ESM planner. Source utils.ts/determine-dependents.ts and existing index.mjs export target are unchanged by PR5124 versus its base. This existing runtime limitation was not repaired in the declaration-focused change.

Formatting and types:

- `pnpm exec prettier --check .` in handler/filter/cache/exports exited 2 on missing @tailwindcss/typography in uninstalled app dependencies and existing style issues. No repository-wide format rewrite was performed.
- Changed-file Prettier checks pass in all lanes; `git diff --check` passes. The investigation script is formatted with the same root configuration.
- handler: `pnpm exec tsc --noEmit -p packages/runtime-core/tsconfig.lib.json` exits 2 with three unchanged baseline errors: missing ResourceLoadContext in remote/index.ts and callback return mismatches in utils/preload.ts lines 182 and 236.
- A temporary RemoteHandler | DisabledRemoteHandler property/assignment trial added six enabled-only capability errors across preload/snapshot/shared code. It was reverted. The public host property still has the original cast. The proposal explains why truthful removal changes the public API and external plugin narrowing, and the committed type tests check the actual internal disabled source against built enabled declarations without adding any/unknown/double casts or no-op hooks.

## Ownership scope

All six coherent-map cases fetched /app.js and /node.js and returned [app-dep, node-dep, app-remote, node-remote]. Mixed copies have two module-local hook maps and runtime factories, one shared embed tap, and a first-copy-only embed subscriber. Same-copy controls have one factory and likewise first-only runtime initialization. The strict script requires true assertions and absence of compiler/harness/thrown/execution errors, propagates compiler.close failures, and exits nonzero on failure.

Conflicting FEDERATION_BUILD_IDENTIFIER warnings occur in both mixed and same-copy controls. Preliminary disjoint configurations fail RUNTIME-004 for the second remote identically in same-copy controls; manifest-enabled variants hit the same ModuleHandler undefined options.alias limitation. Those observations do not establish a duplicate-install regression. No ownership/serializer redesign was performed. PR5144 sign-off remains with the independent reviewer.

## Skipped scope and setup limitations

Full enhanced package suite, unrelated compiler fixtures, full workspace lint/build/tests, and application E2E suites were not run because these changes are isolated regression fixtures, an internal contract proposal, and private package metadata; targeted real compiler/runtime/package builds were used. Fresh CI completion after pushes was not awaited or represented as passing.

Filtered locked installs used `pnpm install --frozen-lockfile --ignore-scripts` with the relevant package filters. Offline attempts failed on missing cached tarballs (including @jest/globals and schema-utils) and were replaced by successful locked online installs. A later node-only filtered reinstall aborted with no-TTY removal protection; the isolated node build and actual copied-wrapper execution succeeded against the already installed enhanced/root dependency graph. No shared checkout dependencies or settings were modified.
