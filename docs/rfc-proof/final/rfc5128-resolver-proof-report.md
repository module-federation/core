# RFC 5128 resolver compatibility proof

Environment: Node v24.15.0, Corepack pnpm 10.28.0, Webpack 5.104.1, Rspack 2.1.10, enhanced-resolve 5.20.1. Read repository AGENTS.md and installed pstack 0.15.2+codex.20260918001226 prove-it-works/type-system discipline skills and CODEX.md. All commits are local; root alone owns remote topology and pushes.

Minor base: `84cee419c`, isolated `rfc5128-resolvers` / `proof/rfc5128-resolvers`. Major base: `db5159fcf`, isolated `rfc5128-major` / `proof/rfc5128-major`; only explicitly authorized manager files were changed there.

## Local commits and intended stack placement

| Commit    | Earliest link  | Result                                                                                                                                                                                                                                                     |
| --------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2f2281bcd | #5134 managers | Share the composition import resolver with eligibility; detect require-only composition keys.                                                                                                                                                              |
| 32fa01bd1 | #5134 managers | Probe declared composition subpaths as well as family package roots for ordinary externals.                                                                                                                                                                |
| f5739da7b | #5134 managers | Only genuinely unavailable import conditions permit fallback; malformed import targets and missing declared files throw contextual resolver errors.                                                                                                        |
| 73dc8ca28 | #5140 enhanced | Copy resolver and alias objects before child compiler writes; actual graph/externals/identity fixtures.                                                                                                                                                    |
| 606364e8e | #5140 enhanced | Preserve the derived object/array alias union, copy array entries, preserve configured targets, and append missing exact runtime aliases. Real array app returns 42. Real require-only custom implementation preserves the full legacy bundle and defines. |
| c8eccf2c0 | #5141 rspack   | Attach real package roots to final graph summaries, so rule-level aliases report duplicate runtime families; execute distinct kernel identity proof.                                                                                                       |
| d23f80d60 | major tip      | Require-only composition keys produce `unsupported` rather than escaping into rendering. The subsequent narrow malformed-error classification must also be integrated by root.                                                                             |

## Executable defects before fixes

- At `84cee419c`, manager require-only composition test: 1 failed, 103 skipped. Eligibility returned composed while ESM import resolution could not resolve `./compose`.
- At `84cee419c`, real Webpack `compilation.createChildCompiler`: inherited resolve object identity was equal; writing child runtime aliases added two federation keys to the parent's alias object. Failing test used an independent literal expected parent map.
- Rspack rule-level alias: actual chunk graph contained both selected and copied `runtime-core/dist/kernel.js`; executing emitted bundle returned `{same:false, instance:false}`. Expected duplicate-family warning was absent: 1 failed, 22 skipped.
- Manager composition subpath object/regex externals: 2 failed, 104 skipped because only family package roots were probed.
- Catch-all ESM failure fallback: invalid import target and declared missing ESM file both incorrectly resolved to legacy: 2 failed, 39 skipped. Narrow classification now throws for both.
- At `73dc8ca28`, the real array-alias compiler could not resolve `child-only`: 1 failed, 20 skipped. Object spreading the alias array had destroyed resolver semantics. The repaired emitted app evaluates to 42.
- Major source standalone proof and major Jest fixture both returned composed for a real require-only family. After `d23f80d60`, standalone returns unsupported; 37 major selection tests pass.

## Final direct evidence

- Managers: 11 suites, **108 passed**, 5 snapshots passed.
- Rspack: 3 suites, **23 passed**, including actual host/remote execution and singleton count, cores 2.1.10, 1.7.9, 1.5.8, watch, persistent cache, real alias graph and emitted class/instance identities.
- Enhanced targeted final composition file: **21 passed**, no skips. Includes all new object/array child tests, ordinary object/regex/callback/promise/byLayer/subpath externals, issuer-sensitive final graph rejection, two runtime-kernel class and instance identities, and require-only custom runtime fallback with exact legacy output equality and explicit capability define preservation.
- Enhanced full package command after production array correction: 38 normal/config files, **492 passed, 1 existing skip**, plus serial treeshake **6 passed**. The additional require-only test was added afterward and passed in the final 21-test file; full package run was not repeated solely for that new test.
- Existing skip: HoistContainerReferencesPlugin test `should hoist container runtime modules into the single runtime chunk when using remotes with federationRuntimeOriginModule` uses `it.skip` in the repository.
- Manager, enhanced and Rspack package builds passed, including generated declarations. Rspack build retains its existing Publint warning about import types interpreted as CJS and package type suggestion.
- Major targeted manager selection: **37 passed**. Standalone real fixture returns unsupported with ESM composition reason.
- All changed source/tests/changesets passed targeted Prettier; git diff --check passed. Working tree was clean after local code commits.

## Commands

All commands use `export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH` before execution; minor commands run in `rfc5128-resolvers` unless marked major. Real compiler Rstest and Rspack tests required approved sandbox escalation for a local listener/HTTP fixture.

```sh
node --version
corepack pnpm --version
corepack pnpm --filter @module-federation/enhanced... --filter @module-federation/managers... --filter @module-federation/rspack... install --frozen-lockfile
corepack pnpm --filter @module-federation/enhanced... --filter @module-federation/managers... --filter @module-federation/rspack... --filter @module-federation/playground install --frozen-lockfile
corepack pnpm exec turbo run build --filter=@module-federation/enhanced... --filter=@module-federation/rspack... --concurrency=4
corepack pnpm --filter @module-federation/managers build
corepack pnpm --filter @module-federation/enhanced build
corepack pnpm --filter @module-federation/rspack build
corepack pnpm --filter @module-federation/managers test --runInBand
corepack pnpm --filter @module-federation/managers test --runInBand --testPathPatterns=composition/selectMode --testNamePattern='only supports require'
corepack pnpm --filter @module-federation/managers test --runInBand --testNamePattern='composition subpath'
corepack pnpm --filter @module-federation/managers test --runInBand --runTestsByPath __tests__/composition/selectMode.spec.ts --testNamePattern='silently selecting'
NODE_OPTIONS=--experimental-vm-modules corepack pnpm --filter @module-federation/enhanced exec rstest run test/compiler-unit/container/FederationCompositionPlugin.test.ts --project unit -t 'real child compiler'
NODE_OPTIONS=--experimental-vm-modules corepack pnpm --filter @module-federation/enhanced exec rstest run test/compiler-unit/container/FederationCompositionPlugin.test.ts --project unit -t 'preserves array aliases'
NODE_OPTIONS=--experimental-vm-modules corepack pnpm --filter @module-federation/enhanced exec rstest run test/compiler-unit/container/FederationCompositionPlugin.test.ts --project unit
corepack pnpm --filter @module-federation/enhanced test
corepack pnpm --filter @module-federation/rspack test --runInBand --testNamePattern='rule-level runtime'
corepack pnpm --filter @module-federation/rspack test --runInBand
corepack pnpm exec prettier --check .
corepack pnpm exec prettier --check packages/managers/src/composition/selectMode.ts packages/managers/src/composition/resolveImports.ts packages/managers/__tests__/composition/selectMode.spec.ts packages/enhanced/src/lib/container/runtime/FederationRuntimePlugin.ts packages/enhanced/test/compiler-unit/container/FederationCompositionPlugin.test.ts packages/rspack/src/ComposedRuntimePlugin.ts packages/rspack/__tests__/composedRuntime.spec.ts packages/rspack/__tests__/composed-fixture/harness.mjs
corepack pnpm exec prettier --write packages/managers/src/composition/selectMode.ts packages/managers/src/composition/resolveImports.ts packages/managers/__tests__/composition/selectMode.spec.ts
corepack pnpm exec prettier --write packages/enhanced/src/lib/container/runtime/FederationRuntimePlugin.ts packages/enhanced/test/compiler-unit/container/FederationCompositionPlugin.test.ts
corepack pnpm exec prettier --write packages/rspack/src/ComposedRuntimePlugin.ts packages/rspack/__tests__/composedRuntime.spec.ts packages/rspack/__tests__/composed-fixture/harness.mjs
git diff --check
# Major (authorized isolated manager work)
corepack pnpm --filter @module-federation/managers test --runInBand --testNamePattern='only supports require'
corepack pnpm --filter @module-federation/managers test --runInBand
corepack pnpm --filter @module-federation/managers test --runInBand --runTestsByPath __tests__/composition/selectMode.spec.ts
corepack pnpm --filter @module-federation/managers build
corepack pnpm exec esbuild packages/managers/src/composition/selectMode.ts --bundle --platform=node --format=cjs --packages=external --outfile=/tmp/rfc5128-major-selectMode.cjs
NODE_PATH=$PWD/packages/managers/node_modules node /tmp/rfc5128-major-export-proof.cjs
```

The major standalone script and final bundle are preserved under `rfc5128-resolver-proof-logs`; test/setup/build/format logs are copied there. Major initial bundle used its absolute source path from the minor environment; final bundle used the major working directory. Local commits used `HUSKY=0` in minor and per-command `git -c core.hooksPath=/dev/null commit` in major because its generated husky helper was absent. No Git settings were changed.

## Failures, skips and limits

- Initial frozen install in the default sandbox failed registry DNS; approved install succeeded. The older Rspack 1.5.8 fixture was initially missing from the filtered graph; adding the existing locked playground filter resolved this, and all Rspack tests then passed.
- Full-repository Prettier was attempted and failed because uninstalled Next app Tailwind configuration requires `@tailwindcss/typography`. Unrelated app dependencies/configuration were not changed. Changed-file format gate passed.
- Major all-manager test collection initially had five suites unable to find unbuilt workspace SDK output; composition-only suite was runnable and passed 37 tests. Major manager build then collided with a concurrent root-owned manager build, causing a native persistent-cache process-lock panic. Root was notified; no further major builds/writes were attempted after release of ownership.
- App-wide E2E jobs, release/publish commands and repository-wide lint were not run: resolver work used direct real compiler/package fixtures, no app/release changes, and repository instructions require package builds/tests/format rather than these optional workflows.
- Rspack graph package ownership uses cached nearest package.json lookup against actual on-disk resources. Native resourceResolveData was tested and rejected because Rust drops it during watch reuse and mismatches some path/data pairs. Purely virtual package roots without on-disk package.json remain unclassified; actual filesystem aliases and caches are exercised.
- Root must integrate minor commits at the indicated earliest links and apply f5739da7b's narrow error classification/tests while preserving the major `unsupported` return. Root retains all push/topology/RFC ownership.

## Major classification follow-up (2026-10-03)

Completed the explicitly delegated isolated-major adaptation at parent `d23f80d60`, on top of platform fix `eccdc8c04`. New local commit **4800d4e0b**, `fix(managers): preserve malformed composition export failures in major defaults`. Only manager source and its selection test file changed; root stack worktrees were untouched.

The red fixtures produced **2 failed, 37 skipped**: malformed selected import targets and declared missing files were incorrectly classified `unsupported`. The fix returns an unavailable reason only for the literal enhanced-resolve no-export-under-conditions diagnostic. Other selected-contract errors throw with package root, `./compose`, native message, and native error `cause`. The require-only family remains `unsupported`.

Final checks in `rfc5128-major` with Node24 PATH:

```sh
corepack pnpm --filter @module-federation/managers test --runInBand --runTestsByPath __tests__/composition/selectMode.spec.ts --testNamePattern='classifying it as unavailable'
corepack pnpm --filter @module-federation/managers test --runInBand
corepack pnpm --filter @module-federation/managers build
corepack pnpm exec prettier --write packages/managers/src/composition/selectMode.ts packages/managers/__tests__/composition/selectMode.spec.ts
corepack pnpm exec prettier --check packages/managers/src/composition/selectMode.ts packages/managers/__tests__/composition/selectMode.spec.ts
git diff --check
```

Green result: **109 passed in 11 suites, 5 snapshots passed**; package build and declarations passed; changed-file formatting and diff checks passed. Earlier unbuilt SDK and concurrent cache-lock failures are historical and do not block this final isolated-major validation.

User-requested Ripwire navigation used the existing local v0.6.5 binary at `/Users/zackjackson/Documents/Codex/2026-10-02/task-4/ripwire-tool/build/ripwire`, with no global/config installs:

```sh
ripwire packages/managers/src/composition --for='ESM export resolution eligibility and malformed target failures' --token-budget=2500
ripwire node_modules/.pnpm/enhanced-resolve@5.20.1/node_modules/enhanced-resolve --for='ExportsFieldPlugin missing export conditions diagnostic and invalid export targets' --token-budget=2500
ripwire node_modules/.pnpm/enhanced-resolve@5.20.1/node_modules/enhanced-resolve --expand=lib/ExportsFieldPlugin.js:apply --token-budget=3500
```

Ripwire identified the actual ExportsFieldPlugin/apply resolver path and its conditional export helpers. XML evidence and exact test/build/format output are in `rfc5128-resolver-proof-logs`. Root retains integration ownership; integrated-major verification will run when root supplies the final worktree/tip.

## Final integrated #5141 verification (2026-10-03)

Validated **64eb76956eef950cbe158cf513be0a5cddae1448** in `/Users/zackjackson/Documents/Codex/2026-10-02/task-4/stack5141`, after root integrated parent ownership, cache, alias and composition fixes. This was validation only: no source commits, topology changes, pushes, or configuration installs. HEAD remained exact and the worktree remained clean.

Executed with Node v24.15.0 and Corepack pnpm 10.28.0:

```sh
corepack pnpm --filter @module-federation/enhanced... --filter @module-federation/rspack... --filter @module-federation/managers... --filter @module-federation/playground install --frozen-lockfile
corepack pnpm exec turbo run build --filter=@module-federation/enhanced... --filter=@module-federation/rspack... --force --concurrency=4
corepack pnpm --filter @module-federation/managers test --runInBand
corepack pnpm --filter @module-federation/rspack test --runInBand
NODE_OPTIONS=--experimental-vm-modules corepack pnpm --filter @module-federation/enhanced exec rstest run test/compiler-unit/container/FederationCompositionPlugin.test.ts --project unit
corepack pnpm exec prettier --check packages/managers/src/composition packages/managers/__tests__/composition packages/enhanced/src/lib/container/runtime/FederationRuntimePlugin.ts packages/enhanced/src/lib/container/runtime/FederationCompositionPlugin.ts packages/enhanced/test/compiler-unit/container/FederationCompositionPlugin.test.ts packages/rspack/src/ComposedRuntimePlugin.ts packages/rspack/__tests__/composedRuntime.spec.ts packages/rspack/__tests__/composed-fixture/harness.mjs
git status --short
git rev-parse HEAD
git diff --check
```

Results:

- Frozen filtered install passed, including the locked dependency graph providing older Rspack cores. Initial sandbox DNS failure was stopped; approved install passed.
- **15/15 builds passed, zero cached tasks**, including manager, enhanced and Rspack generated declarations and workspace prerequisites.
- Managers: **111 passed, 11 suites, 5 snapshots**.
- Full Rspack: **23 passed, 3 suites, no skips**, including real host/remote singleton execution on cores 2.1.10, 1.7.9 and 1.5.8, watch, persistent-cache, actual rule-family alias graph diagnostics and emitted kernel class/instance identities.
- Real Webpack composition file: **49 passed, no skips**. This includes the original 21 resolver fixtures (ordinary object/regex/callback/promise/byLayer/subpath externals; issuer-sensitive final-graph rejection; object/array child isolation and app execution; duplicate-family identity; custom require-only fallback) plus root-integrated ownership/cache/protocol fixtures.
- Scoped formatting and git diff checks passed. No regression was found; no source changes were needed.

Logs are at project root:

- `stack5141-final-install.log`
- `stack5141-final-build.log`
- `stack5141-final-managers-tests.log`
- `stack5141-final-rspack-tests.log`
- `stack5141-final-webpack-composition-tests.log`
- `stack5141-final-resolver-format.log`

Used local Ripwire v0.6.5 on the final Rspack source, actual Webpack fixtures, full Rspack fixtures and the actual installed `node_modules/.pnpm/enhanced-resolve@5.20.1/node_modules/enhanced-resolve` directory. Focused `--for` XML outputs are copied to `rfc5128-resolver-proof-logs/stack5141-ripwire-*.xml`.

Other package/app-wide suites and whole-repository formatting were not repeated in this validation-only follow-up: the delegated final scope was package builds, all manager/Rspack tests, and the actual Webpack composition matrix. Prior full-enhanced package and repository formatter outcomes remain recorded above. Integrated-major verification awaits the root-owned final tip.

## Final integrated major #5142 verification (2026-10-03)

Initial integrated tip **86146bf8b92f9b285073a5d276cf7bf60c780268**; final validated tip **3d8014a1de8194628046603320911226cc50719a** in `/Users/zackjackson/Documents/Codex/2026-10-02/task-4/stack5142`.

The root-owned full frozen install completed successfully before any builds. Environment was Node v24.15.0 and Corepack pnpm 10.28.0. Root retained topology, pushes and production integration ownership. This owner made one authorized, bounded **test-only** commit: `3d8014a1d test(composition): align merged fixtures with major defaults`. No production source, library contract or class types changed.

Concrete initial failures at 86146bf8b:

- Webpack composition file: **41 passed, 11 failed**. Six ordinary external cases retained the minor expectation for now-removed capability defines; two old-slot cases retained minor opt-out tolerance; two mixed retired opt-in settings and the late wrapper retained minor full-runtime warning expectations.
- Rspack: **26 passed, 1 failed**. The inherited real rule-family alias fixture referenced deleted minor helper `composed()`, throwing ReferenceError before compilation.

The test adaptation now proves that compatibility full-runtime builds preserve ENV_TARGET while leaving removed capability macros unresolved; major defaults compose despite retired opt-in settings; malformed old protocol slots reject even with a retired opt-out setting; and the actual Rspack rule-alias identity fixture compiles in default-composed mode. The existing major name/version build-identifier fixtures and copied-family kernel graph/instance identity checks remain in the suites. Root received the exact failure report and proposed scope before the commit.

Commands executed in stack5142 (Node24 PATH exported):

```sh
node --version
corepack pnpm --version
corepack pnpm exec turbo run build --filter=@module-federation/enhanced... --filter=@module-federation/rspack... --force --concurrency=4
corepack pnpm --filter @module-federation/managers test --runInBand
corepack pnpm --filter @module-federation/rspack test --runInBand
NODE_OPTIONS=--experimental-vm-modules corepack pnpm --filter @module-federation/enhanced exec rstest run test/compiler-unit/container/FederationCompositionPlugin.test.ts --project unit
corepack pnpm exec prettier --write packages/enhanced/test/compiler-unit/container/FederationCompositionPlugin.test.ts packages/rspack/__tests__/composedRuntime.spec.ts
corepack pnpm exec prettier --check .
git diff --check
git status --short
```

Initial red logs were saved, then the two compiler test commands and full-repository format check were repeated after adaptation.

Final evidence:

- **15/15 forced dependency builds passed, zero cached**, including manager, enhanced and Rspack declarations. Builds preceded the test-only commit; no production code changed afterward.
- Managers: **111 passed, 11 suites, 5 snapshots**.
- Real Webpack composition file: **52 passed, 0 skipped, 0 failed**.
- Full Rspack: **27 passed, 3 suites, 0 skipped, 0 failed**, including older core compatibility, real singleton execution, watch/cache, default mode, major build identifier, and native final-graph rule-family warning plus emitted kernel identity proof.
- **Whole-repository Prettier passed** with the full dependency graph, both before and after the test-only adaptation.
- Git diff checks passed; final worktree clean.

Durable evidence at task root:

- `stack5142-final-install.log` (root-owned install)
- `stack5142-final-resolver-build.log`
- `stack5142-final-managers-tests.log`
- `stack5142-major-semantic-red-webpack.log`
- `stack5142-major-semantic-red-rspack.log`
- `stack5142-final-webpack-composition-tests.log`
- `stack5142-final-rspack-tests.log`
- `stack5142-final-full-format.log`

Local Ripwire v0.6.5 was used for major family/coordination navigation and focused fixture assertion lookup (`--for` and `--grep` with bounded context/limit). XML maps are preserved in `rfc5128-resolver-proof-logs/stack5142-ripwire-*.xml`.

No validation blockers remain in this delegated final-major scope. Root separately owns actual major shared-fallback HTTP/core inherited checks and remote operations. Other app-wide/full-enhanced suites were not repeated here because the delegated matrix explicitly requested managers, actual composition fixtures and full Rspack; all requested checks passed.
