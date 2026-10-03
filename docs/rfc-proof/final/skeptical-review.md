# Independent skeptical review of bounded RFC fixes

Reviewed on 2026-10-03 with Node 24.15.0 and Corepack pnpm 10.28.0. No source edits, pushes, merges, package publication, or settings changes. Repository AGENTS.md files were read (the four RFC checkouts share identical instructions; publicpath adds an opt-in Sokra clause). Applied installed pstack `0.15.2+codex.20260918001226` proof/type-discipline skills and its CODEX.md runtime contract.

## Acceptance recommendation

**Final recommendation:** accept committed composition correction `8c192b569` on inspected exact source diff and original full baseline tarball controls; owner final tests passed. Accept RFC5036 cache `0e515cf97` **with correction `2f7085b1a`** and RFC5128 cache `10566aafc`/`1301cebe7` **with correction `fb97b4f1c`**: both reported Node blockers below are independently verified fixed, and their final committed diffs match the reviewed built corrections. Accept the bounded manager/platform, resolver, child-alias, and RFC5036 declaration/injector fixes on inspected evidence, subject to explicit scope limits. No remaining newly introduced bounded-fix blocker found. #5180 remains **open draft and unmerged**; the parent independently corrected/verified its zero-async-chunk fixture and CI. That is parent verification, not a new independent run here. The four pre-existing RFC5036 mixed-format TS2403 failures remain a failed gate, not a bounded-fix regression.

| Change                                                         | Review result                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Composition `c807938a8`, `b03a8f164`, `1af66be63`, `8c192b569` | Accept inspected exact committed source and original full-tarball controls. Owner reports 510 package tests + six serial passed, one existing skip; actual installed 29-case proof passed.                                                                    |
| Platform `21474e168`                                           | Accept bounded change; independently reran all 23 planner tests.                                                                                                                                                                                              |
| Resolver `2f2281bcd`, `32fa01bd1`, `f5739da7b`                 | Accept bounded change; independently reran 44 selector/import tests. Only unavailable ESM conditions trigger fallback; malformed targets/files propagate contextual failures.                                                                                 |
| Enhanced aliases `73dc8ca28`, `606364e8e`                      | Accept bounded change; independently reran real object/array child cases. Array shape and entry order are preserved, child writes replace resolver/alias objects.                                                                                             |
| Rspack graph ownership `c8eccf2c0`                             | No new concrete blocker identified by source inspection. Existing proof includes actual aliased kernel class/instance inequality and warnings; not independently rerun here. Purely virtual roots without disk package.json remain unclassified as disclosed. |
| RFC5036 `45b7e606b`, `4a1bd3fe8`                               | Accept bounded fixes; packed named/default CJS shapes, separate strict ESM/CJS consumers, and all seven injector artifact tests independently pass. Combined-format program limit below remains.                                                              |
| Public path `836986585`, `dc6154381` / #5180                   | Source inspected; parent corrected literal topology assertion and verified zero asynchronous main-compilation chunks and CI. No production blocker identified.                                                                                                |
| RFC5128 cache `10566aafc`, `1301cebe7`, `fb97b4f1c`            | Accept corrected contextual Node shortcut boundary. Actual built six-case custom/default/default-dedup/direct-legacy matrix and malformed guard independently pass; final exact commit inspected.                                                             |
| RFC5036 cache `0e515cf97` plus `2f7085b1a`                     | Accept corrected boundary. Actual malformed/restored-global rejection, subsequent valid evaluator, retry, unchanged metadata-free fallback, and nine positive cache regressions independently pass.                                                           |

## Original composition blocker, now corrected: legacy compilation required the composed protocol

**Location:** `rfc5128-composition/packages/enhanced/src/lib/container/ModuleFederationPlugin.ts:221` and `.../runtime/FederationCompositionPlugin.ts:67-84,131-134`. The registration is unconditional. `slotOf()` now rejects older unversioned slots or old options participants lacking provenance. `FederationRuntimePlugin.ts:316` also invokes `composedEntryOf()` on its ordinary legacy dependency path, and that accessor now validates the slot.

**Trigger:** two installed enhanced copies, one from the baseline `84cee419c` and one from the fixed protocol, with **both** options explicitly setting `experiments.composedRuntime: false`, and no remotes/shares/exposes. Thus no composition planner is requested.

Directly executed installed artifacts from `rfc5128-composition-proof/installed-before` and `installed-final`, using their webpack package and normal compilation. Literal outcomes:

```json
{"label":"old-old","errors":[],"warnings":[]}
{"label":"old-new","error":"Invalid module-federation.composition/1 compiler slot: expected version 1 with participants carrying runtime requests and a sealed flag. Ensure every enhanced copy uses the same composition protocol."}
{"label":"new-old","error":"Invalid module-federation.composition/1 compiler slot: expected version 1 with participants carrying runtime requests and a sealed flag. Ensure every enhanced copy uses the same composition protocol."}
```

Reproduction: `/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/legacy-copy.cjs`, from taskroot. Script and output are preserved under `skeptical-review-evidence/`. It performs no package builds. This is an opt-out regression distinct from intentionally rejecting incompatible copies in an opted-in composed build. Keep the fail-closed checks for opted-in composition, while preventing the strict protocol from breaking legacy-only compilers. Add real old/new installed-copy legacy controls in both orders before accepting.

### Independent correction proof against original full baseline tarballs

Reran the actual unmodified `installed-before` enhanced-a **and** enhanced-b packages against corrected newly packed aliases in `/var/folders/6v/c06plt297s75l4yjpgd_zfvr0000gn/T/mf-composition-copies-9rGlvm`. No transplanted baseline modules or mocked old registration algorithm were used. Reproduction: `node skeptical-review-evidence/corrected-original-copy.cjs` with Node 24. The script records actual resolved package paths and asserts all nine cases; full output and JSON are durable next to it.

- Both explicitly false: old-old, old-new, new-old each emit no errors or warnings, zero compose modules, no selected composed entry, and two entry observations of one identical non-null runtime instance.
- Two current copies, true/false and false/true: no errors; exactly one explicit full-runtime fallback warning; no selected composed entry or compose module; same non-null runtime instance.
- Old/new both true, in both orders: named composition protocol rejection.
- Old false/new true, in both orders: named composition protocol rejection, because the compiler opts in while a participating old copy cannot provide the protocol.

The corrected source avoids strict slot lookup on wholly opted-out compilers and records each current options participant's opt-in flag before choosing composition. A later refinement retains early participants without imposing strict legacy slot validation, and validates a requested composition in a per-copy afterResolvers guard. Old wrapped planners' retained explicit opt-in is recognized. This clears the legacy-only blocker and the late-wrapper needs-collection issue on inspected final source.

Independently repeated all nine original-full-tarball controls against final stage `mf-composition-copies-WaXnbg`: **all passed**. Exact command: `MF_FIXED_STAGE=/var/folders/6v/c06plt297s75l4yjpgd_zfvr0000gn/T/mf-composition-copies-WaXnbg /Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/corrected-original-copy.cjs`. Output is `corrected-original-copy-final.log`; JSON records the final stage. Also read the actual final installed harness's `results.json`: `early-needs-forward`, `early-needs-reverse`, and `early-needs-afterPlugins` each have empty errors/warnings, adapters `remotes,share-scope`, and exactly one `adapters/remotes.js` graph module. Those three harness executions were performed by the owner, with their source/assertions and emitted graph output independently inspected here.

Final committed production diff at `8c192b569a1076f3d0c6553ad67368ae834a0213` was read and matches the inspected/probed correction. Its owner completed 510 normal/config tests, one existing skip, six serial tests, and the 29-case installed harness. The existing compiler mock helpers now provide the newly registered afterResolvers hook; this corrects unit fixture shape rather than bypassing a production check.

## Confirmed RFC5128 cache gap, now corrected

After the narrow custom/custom review, the parent ran an additional actual Node matrix and confirmed **custom A → default B** for identical original remote/global/URL returns `[A,A]`, expected `[A,B]`, sequentially and with deterministic overlap. The inverse, default/default dedup, and legacy controls passed. At `1301cebe7` `platform/node.ts:41`, the shortcut accepts any physical global whenever the _current_ request is not custom, without proving that a preceding custom evaluator did not own it. This is asymmetric and invalidates an unconditional cache acceptance.

The evaluated-cache owner implemented a bounded follow-up: contextual runtime loads use scoped `globalLoading` for deduplication and validate their own SDK payload; the uncontextual direct-platform legacy shortcut is preserved. This reviewer read the draft `isolatedLoading = Boolean(entryLoadingContext) || customLoading` guard and independently ran the **actual built SDK/data-URL matrix** in `rfc5128-cache-node-asymmetry-proof.mjs`: **six passed, zero failed/skipped**. Custom/default both orders pass sequentially and while an observational hook holds the first entry promise pending after its SDK publishes the global. Both evaluated values and one execution each are asserted. Concurrent/later default hosts evaluate B once; direct uncontextual legacy reuse evaluates zero scripts. Independently reran actual malformed custom payload rejection; it still passes. Output is durable in `skeptical-review-evidence/rfc5128-node-asymmetry-fixed.log` and `rfc5128-malformed-node-final.log`.

Exact commands used Node 24.15.0: `node rfc5128-cache-node-asymmetry-proof.mjs` and `node skeptical-review-evidence/rfc5128-malformed-node.cjs`. The selected script was read before execution; it imports built runtime-core/platform modules and real SDK, uses no transport mocks, and makes no build/install calls. Final exact committed production diff at **`fb97b4f1cd0aabbe43891d6eb8c1009669bce5ff`** was independently read and matches this probed correction. Its release changeset describes contextual versus direct legacy behavior accurately. A two-line runtime fixture cleanup removes physical test globals between cases. The owner reports forced build 4/4, full runtime-core 182 tests/runtime 96 tests, six new actual Node cases, twelve prior Node cases, and eleven VM proofs, all passing with zero skips. An initial runtime dependency setup failure required a frozen runtime-filter install; that setup failure is not counted as proof. This clears the remaining Node asymmetry hold. The original physical-global asymmetry must not be reported as fixed by `1301cebe7` alone.

## Confirmed cache blocker, now corrected: RFC5036 failed Node payload validation reused physical globals

**Location:** `rfc5036/packages/runtime-core/src/utils/load.ts:340-346` at published commit `0e515cf97`. `isRemoteEntryExports(entryExports)` checks callable `get/init`, but its false branch immediately calls `handleRemoteEntryLoaded()`, even for the image-backed path where `ignoreGlobalExports` is true. Thus the claimed external-data validation does not reject invalid SDK payloads and the physical-global fallback can undo evaluator isolation.

Executed the actual built runtime-core and SDK with data URLs, real image descriptors, and two distinct URL-transform callbacks. No mocks, HTTP server, source changes, or builds. Literal output:

```json
{"case":"malformed-sdk-payload","resolved":true,"get":"undefined","init":"undefined"}
{"case":"malformed-payload-stale-global","same":true,"value":"A"}
```

First case: `module.exports={}` resolves from `getRemoteEntry()` and enters the cache despite missing both callable methods. Second case: after evaluator A returns a valid container, evaluator B returns malformed `{}` and its evaluated script restores the preceding physical global in a microtask. B receives A's exact container and value. The script fails its `assert.notEqual()` with `malformed payload must not borrow another evaluator exports`.

Reproduction and durable output: `skeptical-review-evidence/rfc5036-malformed-node.cjs` and `.log`, run using Node 24.15.0. The ordinary successful payload is returned directly, so the defect is bounded to the failed validation branch. Reject an invalid per-attempt payload before the physical-global fallback for image-backed/custom isolation; preserve the separately documented metadata-free legacy fallback if required.

The equivalent RFC5128 custom malformed payload directly rejects with `did not return callable get/init exports`; independently asserted using its actual built FederationKernel/node platform in `skeptical-review-evidence/rfc5128-malformed-node.cjs` and `.log`. RFC5128's `src/platform/node.ts` accepts both object/function containers only after validating methods and explicitly throws on custom invalid payloads.

### Independent correction verification

Committed correction `2f7085b1aaf2f2b1abcfd0e46a33f6b4d6af6676` adds only an `ignoreGlobalExports` invalid-payload rejection before the fallback, with a changeset and actual-SDK proof/tests. The metadata-free fallback remains unchanged. Independently ran `node skeptical-review-evidence/rfc5036-node-payload-fixed.cjs` against the rebuilt committed runtime/SDK artifacts, Node 24.15.0; **exit 0**:

```json
{"case":"malformed-payload","result":"rejected","positiveDistinctEvaluator":"B"}
{"case":"malformed-restored-global","result":"rejected","positiveDistinctEvaluator":"B"}
{"case":"same-transform-retry","calls":2,"value":"retry-B"}
{"case":"metadata-free-fallback","result":"unchanged"}
```

The original failing probe/log are preserved; the corrected probe asserts rejection rather than treating rejection as a harness failure. Its `.log` is durable next to the script. Also independently ran the selected positive cache regressions from `rfc5036`:

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
corepack pnpm --filter @module-federation/runtime-core exec rstest run __tests__/load.spec.ts -t 'isolates distinct host evaluators|allows a different evaluator after rejection|isolates shared callbacks|deduplicates default platform|refuses distinct actual browser IIFE'
```

**9 passed**, 34 excluded by the deliberate filter. Both evaluator orders, rejection/reset, shared callback isolation, actual browser physical-global refusal, and default deduplication pass. Approved execution used the existing localhost test server. The owner separately reports 163/163 full runtime-core tests and 32/32 positive installed-copy cases; these full runs were not repeated by this reviewer. No remaining Node payload blocker found in the focused correction.

### Browser ownership and cleanup source review

RFC5128 `platform/web.ts` reserves a per-global owner before loading; a different key involving a custom evaluator rejects while the prior owner is pending or physical exports remain. Unknown preexisting physical exports also cause named refusal for a custom evaluator. Its finally handler deletes only its own failed reservation and retains ownership while physical exports remain. Promise rejection cleanup in `utils/load.ts` removes a cache record only if it still contains the same rejected promise. Reset clears evaluated promises; retained callback IDs/browser ownership do not make stale physical exports appear newly owned or allow an older pending load to erase another reservation. This is conservative identity-based cache/ownership policy, not a claim that distinct callbacks are semantically incompatible.

RFC5036 cache cleanup similarly checks promise identity and metadata-promise identity before deletion, and clear/reset remove scope caches and metadata. Browser evaluator refusal checks live metadata for the physical global before loading a second differing evaluator. Untagged legacy behavior remains intentionally distinct. Node loaderHook.fetch execution remains an explicitly documented gap in both reports; scope-key coverage does not claim that hook is forwarded/executed.

## Concrete packaging limit, baseline-attributed as pre-existing

In `packed-proof/5036/consumer`, compiling the existing `consumer.mts` and `consumer.cts` **together** fails TS2403 at `node_modules/@module-federation/runtime-core/dist/global.d.cts:33-34` for `__FEDERATION__`, `__VMOK__`, `__GLOBAL_LOADING_REMOTE_ENTRY__`, and `__GLOBAL_LOADING_REMOTE_ENTRY_META__`. The ESM and CJS declarations name distinct imported class/plugin/config graphs in these global types. Compiling either existing file alone succeeds. The same combined check in `packed-proof/5128/consumer` succeeds.

Exact failing command:

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
node ../../../rfc5036-pack/node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --module NodeNext --moduleResolution NodeNext --lib ES2022,DOM --types node consumer.mts consumer.cts
```

The bounded CJS fix correctly eliminates its TS2309 declaration error and preserves emitted JS shapes. The evidence supports separate `.mts` and `.cts` consumers; it does not establish a mixed-format TypeScript program. The packed owner subsequently compared an original #5107 `c813c4fdd` build-config replay with final artifacts: the replay has the same four TS2403 conflicts plus original TS2309. The source/build-driver/lock/manifests/dependency closure was shown unchanged; the original runtime tarball had been overwritten, so the report correctly describes a precise config replay rather than an untouched retained artifact. Attribution details, commands/hash, and matched errors are in `packed-compat-proof-report.md` and `packed-proof/5036/original-config-replay/combined-types-results.json`. This reviewer read that evidence rather than duplicating its builds. The four TS2403 errors **predate both bounded fixes** and remain an explicit failed combined-program gate; they are not transformed into a pass by that attribution.

## Independent executed checks

All worktree commands prefixed PATH with `/Users/zackjackson/.nvm/versions/node/v24.15.0/bin`. No build reruns.

1. In `rfc5128-resolvers`: `corepack pnpm --filter @module-federation/managers test -- --runInBand __tests__/composition/selectMode.spec.ts __tests__/composition/resolveImports.spec.ts` — **44 passed**, two suites. The extra script delimiter made Jest interpret `--runInBand` as a path-pattern item, but both intended files ran and passed.
2. In `rfc5036-pack`: `NODE_OPTIONS=--experimental-vm-modules corepack pnpm --filter @module-federation/inject-external-runtime-core-plugin exec jest --config jest.config.cjs --runInBand __tests__/esm-import.spec.ts` — **7 passed**. Tests directly load built ESM/CJS artifacts and exercise first-use/reuse boundaries.
3. In `rfc5128-composition`: `NODE_OPTIONS=--experimental-vm-modules corepack pnpm --filter @module-federation/enhanced exec rstest run test/compiler-unit/container/FederationCompositionPlugin.test.ts --project unit -t 'incompatible|different|invalid shared|old copy|malformed needs|replacing a valid|compatible enhanced|plans once'` — **21 passed**, nine excluded by test-name filter.
4. In `rfc5128-resolvers`: `NODE_OPTIONS=--experimental-vm-modules corepack pnpm --filter @module-federation/enhanced exec rstest run test/compiler-unit/container/FederationCompositionPlugin.test.ts --project unit -t 'preserves array aliases|isolates runtime aliases|only supports require'` — **2 passed**, 19 excluded. The actual require-only case name did not match this filter; manager require-only tests were independently exercised by item 1.
5. From taskroot: `node packed-cjs-shape-worker.mjs` — passed. Actual before/after root/helpers/core key sets, value kinds, and default/named identities match.
6. In `packed-proof/5036/consumer`: the strict TypeScript command above with only `consumer.mts`, then only `consumer.cts` — **both passed**.
7. In `packed-proof/5128/consumer`: same combined command with `../../../rfc5128-pack/node_modules/typescript/bin/tsc` — **passed**.
8. In `rfc5128`: `corepack pnpm --filter @module-federation/managers exec jest --config jest.config.js --runInBand __tests__/planComposition.spec.ts` — **23 passed**.
9. From taskroot: legacy installed-copy reproducer above — old-old succeeds; both mixed orders fail.

The two Rstest attempts initially failed before tests on sandbox `listen EPERM ::1:3000`; approved localhost-only reruns succeeded. No automatic approval rejection occurred.

Owner baseline/setup failures remain explicit in their reports: the injector's initial Jest mock omitted a required constructor (`packed5036-inject-tests.log`), then its corrected artifact tests passed; an earlier RFC5036 manager script passed an extra delimiter and ran no tests, then corrected direct Jest ran all six suites; draft cleanup-import tests failed before correction. None of those initial/setup outcomes is counted as a successful test here. The composition owner's newly installed afterResolvers guard required existing compiler mocks to provide that hook before its full package rerun; those fixture changes and rerun are owner work, not a production fallback or this reviewer's independent result.

## Inspected supporting evidence and remaining scope

Inspected source diffs, actual selected source/graphs and committed outcome JSON in the composition proof; resolver proof report and its real compiler test sources; packed CJS outputs and consumer declarations; packed provider/optimizer result logs; publicpath source/test/harness. The composition fixed-results JSON truthfully names its older `c807938a8` capture, while the proof report separately points to the later 15-case seal-time capture. Neither claims baseline executed identity that was not run.

Full builds, complete package reruns, installs, format/lint reruns, and app E2E were intentionally skipped per the delegated bounded-review scope and the parent's already completed validation. No source code was edited here. Externals callback/default-callback/promise/byLayer handling and alias exemption boundaries were inspected and covered by the independent 44-test selector run; no concrete newly introduced callback blocker found. The follow-up cache boundary checks are source inspection plus the two actual malformed Node SDK probes; this reviewer did not repeat the owners' full browser/platform suites. Broader provider bootstrap, browser publicPath, and auto publicPath conclusions remain outside this review.
