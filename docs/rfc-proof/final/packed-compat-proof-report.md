# Packed runtime compatibility proof

Environment: Node **24.15.0**, Corepack pnpm **10.28.0**. Both alternatives used their own frozen filtered dependency installation and fresh Turbo builds. No dependency directory was borrowed from a sibling checkout. No pushes, merges, force updates, release commands, or settings changes were performed by this worker.

| Alternative | Starting commit                            | Final proof branch/commit                                        |
| ----------- | ------------------------------------------ | ---------------------------------------------------------------- |
| RFC5128     | `84cee419c5c7dc2bb87d1a92cd7fb8e15e409aec` | `proof/rfc5128-pack`, unchanged                                  |
| RFC5036     | `c813c4fdd82e3f146daca65c322b481ada0cb6c9` | `proof/rfc5036-pack`, `4a1bd3fe8ccdd443654c150293a2dd34e4af5b50` |

## Findings and focused fixes

1. **RFC5036 packed CommonJS declarations failed strict consumer compilation.** `@module-federation/runtime/core` emitted `core.d.cts` containing both `export *` and `export = runtimeCore`; TypeScript reported **TS2309**. Reproduced from starting commit `c813c4fdd82e3f146daca65c322b481ada0cb6c9` using `node packed-compat-proof.mjs 5036`. After correcting fixture-only prerequisites (`remotes: []` and the consumer's webpack type dependency), the failure remained isolated to `core.d.cts:3`. The baseline evidence is `packed5036-proof-isolated.log`.

   Commit **`45b7e606b0086737e52355ff2aeeca2c5e9876f2`** sets `cjsDefault: false` in runtime's existing tsdown build config and adds a patch changeset. Rebuilding and repacking produces valid named declarations. Actual emitted JS before/after was compared independently: root/helpers/core expose the same keys and value kinds; `require(core).default.ModuleFederation === require(core).ModuleFederation` and helpers' default/global/share/utils identities are preserved. Evidence: `packed5036-cjs-shape.log`; the before artifact was freshly emitted with the original `cjsDefault: true` setting into `packed-proof/5036/before/dist`.

2. **RFC5036 new injector with an actual older runtime failed legacy reuse.** The second real `createInstance` call through the new injector threw `TypeError: runtimeCore.assertRuntimeImageCompatible is not a function`, including when neither provider nor consumer had runtime-image metadata. Reproduction: `node packed-mixed-worker.mjs 5036 new-plugin-old-runtime`; baseline `packed5036-new-old-legacy.log` and `packed5036-new-old.log`.

   Commit **`4a1bd3fe8ccdd443654c150293a2dd34e4af5b50`** preserves metadata-free legacy first use/reuse with older cores. Metadata-bearing first use or reuse now requires the checker and throws the stable **`[RuntimeImageMinimumContract]`** diagnostic before publishing/replacing provider globals. Current cores retain their existing compatibility checks. Three regression cases were added to the injector's existing artifact-import tests, and a patch changeset was added. Actual packed older-core first use with tagged metadata is rejected before either provider global exists; `packed5036-new-old-metadata-fixed.log` records the literal rejection outcome.

3. **Vite7 optimizer conditions require explicit optimizer configuration.** `node packed-optimizer-worker.mjs 5036 vite no-remote` intentionally retains the failed control: `resolve.conditions` alone leaves the prebundled remote adapter enabled. Evidence: `packed5036-vite.log`. Adding the same conditions to **`optimizeDeps.esbuildOptions.conditions`** selects the disabled adapter and still loads the literal shared value. Reproduction: `node packed-optimizer-worker.mjs 5036 vite no-remote --optimizer-conditions`; evidence `packed5036-vite-explicit.log`. This is a required integration configuration, not a source fix or proof of automatic Vite support.

## Final artifact results

The fresh `pnpm pack` tarballs were extracted into independent consumer package graphs. Federation packages in the consumer are real tarball contents, not workspace/source symlinks. The only consumer symlinks provide the explicit webpack and Node declaration prerequisites from the corresponding proof worktree. Runtime checks assert actual shared `{ value: 'packed-shared-literal' }` and remote `{ value: 'packed-remote-literal' }` results; optimizer checks assert `{ value: 'optimizer-shared-literal' }`. Every assertion failure or missing artifact exits nonzero. JSON outcomes use `passed`, `failed`, `unrun`, and `not-applicable` variants with command/output evidence.

| Check                                                                                                     | RFC5128                                                         | RFC5036                                                                                                    |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Packed root/helpers/core and bundler imports, ESM + CJS, literal shared/remote execution                  | PASS, 2 cases                                                   | PASS, 2 cases                                                                                              |
| Strict TypeScript NodeNext `.mts` and `.cts` consumers                                                    | PASS, 2 cases                                                   | PASS after declaration fix, 2 cases                                                                        |
| Same strict NodeNext program containing both `.mts` and `.cts` consumers                                  | PASS                                                            | FAILED: four pre-existing TS2403 ambient global conflicts, also reproduced in original #5107 config replay |
| Real external injector provider hook and core constructor identity                                        | PASS                                                            | PASS                                                                                                       |
| Provider name/version metadata                                                                            | PASS                                                            | PASS                                                                                                       |
| Runtime-image metadata, target mismatch and entry-loader mismatch rejection through actual provider hooks | UNRUN: RFC5128 injector has no image metadata/checking contract | PASS                                                                                                       |
| Old injector/new runtime, metadata-free legacy flow                                                       | PASS                                                            | PASS                                                                                                       |
| New injector/old runtime, metadata-free legacy flow                                                       | PASS                                                            | PASS after minimum-contract fix                                                                            |
| New injector/old runtime tagged first use                                                                 | Not an RFC5128 metadata contract                                | Rejected with RuntimeImageMinimumContract before globals publish                                           |
| Node custom `#mf` no-remote condition                                                                     | Not applicable: composition uses explicit imports               | PASS                                                                                                       |
| Actual Vite7.3.5 `optimizeDeps`                                                                           | PASS legacy                                                     | PASS no-remote with explicit optimizer conditions; raw resolve-only control FAILED                         |
| Actual Rolldown rc3 browser bundling and executable output                                                | PASS legacy                                                     | PASS custom no-remote selection                                                                            |
| Actual CJS emitted default/named shape before vs after declaration fix                                    | No declaration fix                                              | PASS root/helpers/core                                                                                     |

Final reusable runner results, including the subsequent combined-program gate: **RFC5128 10 behavioral checks passed + 7 tarball extractions passed, 5 UNRUN, 1 not applicable**; **RFC5036 12 behavioral checks passed + 7 tarball extractions passed, 1 FAILED, 4 UNRUN**. The RFC5036 runner now exits nonzero for the combined consumer failure. The tagged minimum-contract rejection is an asserted negative case; the worker emits `kind: rejected` with its named reason, and the runner records successful verification of that expected rejection. The raw Vite failed control remains in a separate baseline log and is not counted as a final pass.

Old artifacts came from the clean, read-only prior checkout **`exports@94aa846311eeaa5cdb33afd6894b09c1ba9c791c`**. They were already built before this task; they were packed without altering that checkout. Four embedded entry-source maps (runtime, runtime-core, bundler runtime, injector) match its actual source files. `packed-proof/old/provenance.json` records this limitation and evidence. This is not a claim that these older packages were rebuilt from main during this run. All 21 tarball SHA256 hashes are saved in `packed-proof/tarball-hashes.json`.

## Exact validation commands

Commands use `export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH` first. `corepack pnpm -v` returned `10.28.0`. Unless noted, worktree commands run separately from `rfc5128-pack` and `rfc5036-pack`.

```sh
corepack pnpm install --frozen-lockfile --offline --filter '@module-federation/runtime...' --filter '@module-federation/webpack-bundler-runtime...' --filter '@module-federation/enhanced...' --filter '@module-federation/inject-external-runtime-core-plugin...'
corepack pnpm install --frozen-lockfile --filter '@module-federation/runtime...' --filter '@module-federation/webpack-bundler-runtime...' --filter '@module-federation/enhanced...' --filter '@module-federation/inject-external-runtime-core-plugin...'
corepack pnpm exec turbo run build --filter=@module-federation/runtime --filter=@module-federation/webpack-bundler-runtime --filter=@module-federation/runtime-tools --filter=@module-federation/inject-external-runtime-core-plugin --concurrency=2 --force
```

Each offline install failed on missing locked `@jest/globals@29.7.0`. Each initial sandboxed online install encountered registry `ENOTFOUND`. Approved network retries of the **same frozen filtered install** succeeded (5128: 2309 dependencies; 5036: 2377). Only puppeteer's unused build script was ignored by pnpm policy. Both build commands passed **7/7 tasks**, zero cache hits.

For each worktree, this exact package loop creates seven real tarballs:

```sh
for pkg in sdk error-codes runtime-core runtime webpack-bundler-runtime runtime-tools runtime-plugins/inject-external-runtime-core-plugin; do
  corepack pnpm --dir packages/$pkg pack --out "$PWD/../packed-proof/STACK/tarballs/$(basename "$pkg").tgz" || exit
done
```

`STACK` was literal `5128` or `5036` in the executed commands. The read-only reference loop ran from taskroot with `corepack pnpm@10.28.0 --dir exports/packages/$pkg pack --out "$PWD/packed-proof/old/tarballs/$(basename "$pkg").tgz"`. The first unqualified `corepack pnpm` reference-pack attempt selected pnpm12 outside a project and was rejected by the package-manager version check; the explicit pnpm10.28 retry succeeded without changing package settings.

Focused RFC5036 rebuilds and validations:

```sh
corepack pnpm --filter @module-federation/runtime run build
corepack pnpm --dir packages/runtime pack --out "$PWD/../packed-proof/5036/tarballs/runtime.tgz"
corepack pnpm --filter @module-federation/inject-external-runtime-core-plugin run build
corepack pnpm --dir packages/runtime-plugins/inject-external-runtime-core-plugin pack --out "$PWD/../packed-proof/5036/tarballs/inject-external-runtime-core-plugin.tgz"
corepack pnpm --filter @module-federation/runtime run test
corepack pnpm --filter @module-federation/inject-external-runtime-core-plugin run test
corepack pnpm exec prettier --check .
corepack pnpm exec prettier --check packages/runtime/tsdown.config.ts .changeset/packed-runtime-core-declarations.md
corepack pnpm exec prettier --check packages/runtime-plugins/inject-external-runtime-core-plugin/src/index.ts packages/runtime-plugins/inject-external-runtime-core-plugin/__tests__/esm-import.spec.ts .changeset/external-runtime-minimum-contract.md
```

Runtime tests first hit sandbox `listen EPERM ::1:3000`; approved loopback retry passed **13 files/97 tests/zero skipped** (`packed5036-runtime-tests-network.log`). Injector tests passed **1 suite/7 tests/zero snapshots** (`packed5036-inject-tests-fixed.log`), after correcting a new test fixture mock that omitted the constructor being checked; that initial fixture failure is preserved in `packed5036-inject-tests.log`. Whole-root formatting was attempted but blocked by unrelated app Tailwind configuration requiring `@tailwindcss/typography`, outside the filtered install (`packed5036-format.log`). Both changed-file format gates passed. No formatting changes were made to those unrelated apps.

CJS shape proof emitted the before artifact using a temporary, removed config under the runtime package that imported `./tsdown.config.ts` and changed only `cjsDefault: true` and the output directory. Exact build: `corepack pnpm exec tsdown --config packages/runtime/tsdown.before-proof.config.ts`. An initial temporary config omitted the import's `.ts` extension and failed to load; the corrected retry passed (`packed5036-cjs-before-build-fixed.log`). Both temporary configs were removed and neither was committed.

From taskroot, final reruns are:

```sh
node packed-compat-proof.mjs 5128
node packed-compat-proof.mjs 5036
```

Each JSON result file records the exact child commands, cwd, exit status, stdout, and stderr, including strict consumer compilation:

```sh
node WORKTREE/node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --module NodeNext --moduleResolution NodeNext --lib ES2022,DOM --types node consumer.mts
node WORKTREE/node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --module NodeNext --moduleResolution NodeNext --lib ES2022,DOM --types node consumer.cts
node --conditions=module-federation:no-remote conditions.mjs
node packed-mixed-worker.mjs STACK old-plugin-new-runtime
node packed-mixed-worker.mjs STACK new-plugin-old-runtime
node packed-mixed-worker.mjs 5036 new-plugin-old-runtime --metadata --expect-minimum-contract
node packed-cjs-shape-worker.mjs
node packed-optimizer-worker.mjs 5128 vite legacy
node packed-optimizer-worker.mjs 5128 rolldown legacy
node packed-optimizer-worker.mjs 5036 vite no-remote --optimizer-conditions
node packed-optimizer-worker.mjs 5036 rolldown no-remote
```

## Remaining checks and limits

- **UNRUN: old/new enhanced Webpack compiler-plugin bootstrap integration, both directions.** There is no built older enhanced/compiler plugin artifact in the read-only reference. The injector matrices above exercise real runtime plugin hooks and complete package graphs; they do not claim compiler-generated bootstrap compatibility.
- **UNRUN: Rspack externalRuntime provider bootstrap.** No remote service or provider support was installed. Actual provider globals/metadata/identity were proven through the injector package, not Rspack output.
- **UNRUN: Rolldown-backed Vite optimizeDeps.** The locally installed Vite7 optimizer uses esbuild. Actual Rolldown rc3 bundling and conditioned executable output passed; no Vite8/Rolldown optimizer was installed.
- **UNRUN: RFC5128 runtime-image provider metadata compatibility.** Its injector publishes only name/version. A provider metadata extension is a proposal, not supported by the tested alternative.
- **UNRUN: complete runtime-core/enhanced/node/esbuild/browser E2E suites and root lint.** Those broader stacks belong to the other proof owners; this worker changed only RFC5036 runtime build config and injector behavior, and ran their corresponding builds, artifact consumers, runtime tests, and injector tests.
- Root-wide formatting remains blocked as described above; changed files pass. Both proof worktrees and the old reference were clean at handoff. Root owns pushing and propagating these two focused commits to the earliest appropriate stack links.

Deliverables: `packed-compat-proof.mjs`, `packed-mixed-worker.mjs`, `packed-optimizer-worker.mjs`, `packed-cjs-shape-worker.mjs`, `packed-combined-types-proof.mjs`, `packed-proof/{5128,5036}/results.json`, 21 original matrix tarballs and their hash manifest, the separately hashed baseline replay tarball below, all `packed*-*.log` evidence, and the two isolated local RFC5036 commits.

## Subsequent combined ESM/CJS consumer gate and baseline attribution

The original separate `.mts` and `.cts` compile checks did not prove that both formats could coexist in one TypeScript program. That gate is now part of the same consumer matrix. It does not use `skipLibCheck`, declaration suppression, or altered consumer imports:

```sh
node WORKTREE/node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --module NodeNext --moduleResolution NodeNext --lib ES2022,DOM --types node consumer.mts consumer.cts
```

**RFC5128 passes, exit 0. RFC5036 fails, exit 2.** Its emitted `runtime-core/dist/global.d.cts:33-34` redeclares four ambient globals with incompatible ESM/CJS declaration-graph types: `__FEDERATION__`, `__VMOK__`, `__GLOBAL_LOADING_REMOTE_ENTRY__`, and `__GLOBAL_LOADING_REMOTE_ENTRY_META__`. Each reports TS2403 despite the displayed type names matching. Both formats introduce distinct declaration-module identities into the same ambient global namespace. Evidence is `packed5036-combined-final.log` and `packed5128-combined-final.log`.

The original RFC5036 runtime tarball was overwritten during the earlier fixed repack, so attribution uses a **precise original-build-config replay**, not a claim that an untouched original tarball was retained. The baseline is original #5107 commit **`c813c4fdd82e3f146daca65c322b481ada0cb6c9`**:

1. `git show c813c4fdd82e3f146daca65c322b481ada0cb6c9:packages/runtime/tsdown.config.ts` and `:packages/runtime/package.json` were saved under `packed-proof/5036/original-config-replay/`. The current runtime config with its single added `cjsDefault: false` line removed matches the original exactly; the package manifest matches exactly.
2. `git diff c813c4fdd82e3f146daca65c322b481ada0cb6c9 -- packages/runtime/src packages/runtime-core packages/sdk packages/error-codes packages/runtime-tools packages/webpack-bundler-runtime` is empty in the owned proof checkout. The same baseline diff is empty for `tools/scripts/tsdown/config-helpers.mjs`, `pnpm-lock.yaml`, root `package.json`, and `turbo.json`. Thus the runtime source, build driver, lockfile, and all consumer dependency source/config/manifests are unchanged from original #5107. Those dependency tarballs are the fresh original baseline builds from this run and were never replaced by source fixes.
3. The earlier CJS shape comparator had freshly emitted the runtime with the original **`cjsDefault: true`** default made explicit. Its temporary runtime-package config imported `./tsdown.config.ts` and exported `configs.map(config => ({ ...config, cjsDefault: true, outDir: '/Users/zackjackson/Documents/Codex/2026-10-02/task-4/packed-proof/5036/before/dist' }))`. The only other changed build option was the output directory for isolation; `packed5036-cjs-before-build-fixed.log` records that build.
4. Those emitted outputs were packed with pnpm10.28 using the unchanged original runtime package manifest and workspace dependency versions into `packed-proof/5036/original-config-replay/runtime-original-config-replay.tgz`. The fixed runtime `dist` was backed up and restored around this packaging operation. No source file changed. `original-config-replay/pack.log` and `provenance.json` preserve the pack command result, exact baseline attribution, and SHA256 hash.
5. An independent baseline consumer extracts that replay runtime tarball plus the unchanged baseline runtime-core/sdk/error-codes/runtime-tools/bundler tarballs. It uses the same `.mts` and `.cts` input files and the same strict compiler command as the final consumer. The injector is not part of this compiler dependency closure.

The replay fails with the **same four TS2403 global conflicts**, plus the original runtime/core **TS2309** declaration-export error. The fixed artifact removes TS2309 but retains the same four TS2403 errors. Thus the combined-program conflict **predates `cjsDefault: false` and both focused fixes**. This attribution does not turn the failing final gate into a pass.

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
node packed-combined-types-proof.mjs
```

That reusable script returns **exit 1 deliberately** because original and final RFC5036 consumers fail. It records exact commands, stdout/stderr, exit statuses, diagnostic codes, the four matched global names, and an explicit `pre-existing` attribution in `packed-proof/5036/original-config-replay/combined-types-results.json`. The main `packed-compat-proof.mjs` also retains `packed:types:combined-mts-cts` as a **failed** outcome for RFC5036 and returns nonzero. Existing optimizer/provider/runtime evidence was retained; this follow-up ran only the missing combined compile gate and its baseline comparison.

Navigation used the user-requested tool:

```sh
./ripwire-tool/build/ripwire rfc5036-pack/packages/runtime-core --grep=__GLOBAL_LOADING_REMOTE_ENTRY__ --grep-in=any --grep-context=5 --limit=10
```

Its source hits identify `src/global.ts:58-70`; the navigation artifact is `packed-combined-ripwire-navigation.xml`.

**Remaining proposal, UNIMPLEMENTED:** give both format entry wrappers one canonical public declaration graph and declare ambient globals once using those canonical types, then gate simultaneous `.mts`/`.cts` strict compilation. This spans the public global/type graph and potentially SDK/runtime-core entry declarations; it is broader than the focused fixes. No global graph redesign, consumer type assertion, suppressed diagnostic, or package export reshaping was attempted. Both owned proof checkouts remain clean and this combined-program follow-up created no source commits.

## Final integrated artifact audit and declaration correction

The historical RFC5128 PASS evidence above applies to its stated historical artifact head. A later actual packed audit at minor `968ffee8c12687f332c952cca5a7f8da267a30f6` found strict `.mts`, `.cts`, and combined **FAIL TS1203/TS2309**: the original CJS declaration emitter can win the shared `core.d.ts` output with invalid `export *` plus `export =`. That negative control remains recorded in `packed-final-audit/results.json`.

Isolated local correction `307777839d0a950b16b66b073b43beb9c815b098` adds `cjsDefault: false`, a runtime patch changeset, and a checked-in actual packed strict consumer/namespace regression. Three fresh dual-format emissions pass nine strict programs; forced CJS-only original emission fails all three, while the correction passes all three; actual JS namespace shape is preserved. Its full runtime suite passes 97 tests/14 files, zero skipped. The parent integrated the fix at earliest #5135 `ca0b6188fd57b067dc20e3b8d66f0805e8d2b72a`, propagated it, and re-emitted runtime only.

Actual final 2.9.2 runtime tarballs from **minor #5141 `83134b63016cd237bad96f7797706bfd8dd565c5`** and **major #5142 `7db5f9fb9b3b386a3cd36b9ad5b89a62f8f5eb72`** now pass all six strict `.mts`/`.cts`/combined programs, four ESM/CJS root/helpers/core shared+remote literal checks, both provider identity/version hooks, and twelve before/after entry/format namespace comparisons. Only those changed runtime packages were repacked; each stack's six transitive tarballs were reused after manifest/dist-byte equality checks. The remote literal uses an actual registered `loadEntry` hook and proves that boundary, not SDK transport. RFC5036 unchanged dist bytes were verified and its four pre-existing TS2403 failures remain FAIL. All prior integration UNRUN cells remain UNRUN.

Exact artifact hashes, fingerprints, commands, counts, source attribution, and retained controls are in `packed-final-audit-report.md` and `packed-final-corrected-audit/{fingerprints,results,scope,unchanged-5036}.json`. Reproduction: Node24 `node packed-final-audit.mjs --corrected` (no builders/installs). No worker pushes or package publishing occurred.
