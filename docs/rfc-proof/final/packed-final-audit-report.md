# Final packed audit and bounded declaration correction

## Corrected integrated final artifacts

The parent integrated the bounded correction at earliest #5135 (`ca0b6188fd57b067dc20e3b8d66f0805e8d2b72a`) and completed actual runtime-only emission. This worker then packed **only the two changed final runtime packages**, without builders or installs:

| Final stack         | Exact integrated artifact head             | Runtime tarball SHA256                                             |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| RFC5128 minor #5141 | `83134b63016cd237bad96f7797706bfd8dd565c5` | `29502d199aa10cb93a4c67439136cd5783d10c31e7bd7aef7755346e47021b96` |
| RFC5128 major #5142 | `7db5f9fb9b3b386a3cd36b9ad5b89a62f8f5eb72` | `c73c8f7775b8e510ee5b8456d3d1aa23c44bc2bc4e3b7ed4508db45e163b9208` |

Both actual final-version **2.9.2** consumer graphs pass strict `.mts`, `.cts`, and combined programs (**6/6**), ESM/CJS root/helpers/core shared and remote literal checks (**4/4**), and actual injector provider metadata/constructor identity checks (**2/2**). Comparing the real packed root/helpers/core namespaces before and after correction verifies unchanged export keys and value kinds in ESM and CJS, including core/default constructor and helpers/default identities (**12 entry/format comparisons**). Including the two pack commands and two namespace controls, the corrected audit records **16 PASS, zero FAIL, eight preserved UNRUN**.

The six transitive package artifacts per stack were reused after checking unchanged source manifests at exact heads, published export metadata/version, and every emitted dist byte (**457 minor / 454 major files**). RFC5036 remains at `8643b69633039571cac171d1595645b75e62cf95`; all **849** previously audited published dist files match, so its existing outcomes were reused without repeating pack or consumers. Its combined program still records **four pre-existing TS2403 failures**; the corrected 5128 audit does not turn that separate failed gate into PASS.

For both corrected runtime artifacts, the export-surface fingerprint remains `b41c5f408df5ed11c5197e173fed4144eb8c36a4aff2e86cc01051b61b5a0f03`; the only build-config correction changes the fingerprint from `d6383cec6ee11e2277717b432111907561c906421cf996975c929f2c8b39add4` to `6baa803cbe6bc075e541683f78b264e4a37448ecf70d58d8391cb91d3d6a3041`. Runtime production source trees are unchanged: minor `15fa2d1b75a41a64b5ccd5958d7eae10e0f5c1de`, major `d144d4db52a4d18a5190f91aeb90c146b292bbdb`. Existing emitted source maps again match **170/168 source inputs, zero mismatches**. Both packed `core.d.ts` files have SHA256 `15bb80f24daae213502014e96abc6e9cb63db989c234c39d6a6599fb9e4eb9af`.

The original minor artifact's TS1203/TS2309 failures below remain an explicit superseded negative control in `packed-final-audit/results.json`. Current PASS evidence is independently recorded in `packed-final-corrected-audit/{fingerprints,results,scope,unchanged-5036}.json`, with actual tarballs and extracted consumer graphs. This is final integrated artifact evidence, beyond the historical 2.9.1 candidate controls.

## Original integrated artifact audit

Originally audited existing emitted outputs without rebuilding or installing the integrated stacks:

| Stack         | Audited source head                        | Historical artifact head                                               |
| ------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| RFC5036       | `8643b69633039571cac171d1595645b75e62cf95` | `4a1bd3fe8ccdd443654c150293a2dd34e4af5b50`                             |
| RFC5128 minor | `968ffee8c12687f332c952cca5a7f8da267a30f6` | `84cee419c5c7dc2bb87d1a92cd7fb8e15e409aec`                             |
| RFC5128 major | `3d8014a1de8194628046603320911226cc50719a` | No prior major packed proof; compared inputs with the minor head above |

For each stack, all seven public package export/build-config fingerprints and the shared tsdown helper match their reference. Version metadata moved from 2.9.1 to 2.9.2. Production runtime-core loader/cache source changed in RFC5036/minor; major additionally changes SDK/runtime/bundler source. Existing emitted JS source maps match **228/170/168 source inputs respectively, zero mismatches**. Thus historical artifact behavior was not silently promoted to final-source evidence. Twenty-one new tarballs were created from existing final outputs; each SHA256 is in `packed-final-audit/fingerprints.json`.

## Actual final-head outcomes before correction propagation

| Existing matrix cell                                                                                    | RFC5036                        | RFC5128 minor                 | RFC5128 major                 |
| ------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------- | ----------------------------- |
| Packed root/helpers/core ESM + CJS; actual shared/remote literals through a registered `loadEntry` hook | PASS                           | PASS                          | PASS                          |
| Provider injector hook, constructor identity, name/version                                              | PASS                           | PASS                          | PASS                          |
| Strict `.mts` program                                                                                   | PASS                           | **FAIL TS1203 + TS2309**      | PASS                          |
| Strict `.cts` program                                                                                   | PASS                           | **FAIL TS1203 + TS2309**      | PASS                          |
| Strict combined `.mts` + `.cts` program                                                                 | **FAIL four TS2403**, retained | **FAIL TS1203 + TS2309**      | PASS                          |
| `#mf` custom no-remote condition                                                                        | PASS                           | Not applicable to composition | Not applicable to composition |

The major bundler deliberately removes its named full `runtime` namespace; the audit verifies the remaining `default.runtime.init === runtime.init` compatibility shim. It does not reuse the minor namespace-identity claim.

The former remote fixture pre-populated a process-global export then used `unused.invalid`. Both final RFC5128 Node evaluators reject that shortcut by fetching their own entry because the ambient global lacks evaluator provenance. Those raw failed controls remain in `results-before-boundary-hook.json`. The adapted existing remote cell registers an actual `loadEntry` plugin, asserts one invocation, and loads the literal `final-packed-remote`; this proves the hook/factory boundary, **not SDK transport evaluation**. All six adapted ESM/CJS checks pass. No remote server was installed.

Historical RFC5128 consumer PASS cells cannot be used for the audited minor artifact: its currently emitted `core.d.ts` contains `export *` plus `export = runtimeCore`. The shared `.d.ts` output has two format writers; the original CJS emitter can produce an invalid winner even when a historical ESM winner passed. The major's currently emitted artifact happened to have the valid ESM form and is not proof that its unchanged emitter setting is safe.

## Isolated minimum correction

Local commit **`307777839d0a950b16b66b073b43beb9c815b098`**, on `proof/rfc5128-pack` only:

- Adds `cjsDefault: false` to runtime's existing build config, aligning declaration generation with its already named JS exports.
- Adds a patch changeset and a checked-in regression that creates a real `pnpm pack` consumer, compiles `.mts`, `.cts`, and both together with strict NodeNext and no `skipLibCheck`, and executes ESM/CJS root/helpers/core named/default namespace identity assertions. Built runtime-core/sdk/error-codes and explicit declaration prerequisites are linked into this isolated packed-root consumer; they are not advertised as separately packed by that unit test.
- Earliest link **#5135** is confirmed: its `d3b926ef4110bd189bd1d2b7c8ad0fa1a365634c` source already has the same default-plus-star core barrel and runtime config lacking the flag. Runtime source/config in the isolated historical owner and audited minor are identical before the correction; package version differs.

Evidence rules out an ESM writer merely hiding the original defect:

1. **Three fresh runtime-only dual-format emissions and real packs:** all **nine** strict `.mts`/`.cts`/combined programs pass against the audited final minor's transitive package artifacts. All three emitted `core.d.ts` files have identical SHA256 **`15bb80f24daae213502014e96abc6e9cb63db989c234c39d6a6599fb9e4eb9af`** and named default re-export syntax.
2. **Forced CJS-only emitter sensitivity:** with original `cjsDefault: true`, all three strict programs deterministically fail TS1203/TS2309; with `false`, all three pass. Temporary configs altered only that flag, format selection, and isolated output directory and were removed. These are declaration-emitter controls, not claims that a CJS-only output is the normal published package.
3. **Actual emitted CJS before/after:** root/helpers/core export keys and value kinds match across all three corrected artifacts; core/default constructor and helpers/default global/share/utils identities remain intact.
4. Checked-in targeted packed regression **1/1 passes**. Full isolated runtime suite **14 files/97 tests/zero skipped passes**, with no changed snapshots. Changed-file formatting and `git diff --check` pass.

The isolated candidate packs are version **2.9.1** emitted from the owner's identical runtime source, while the audited final transitive packages are **2.9.2**. Those controls are explicitly candidate correction proof. The parent subsequently integrated and re-emitted the correction; the actual final 2.9.2 artifacts pass as recorded above. The original failing minor artifact remains retained as a negative control. No integrated worktree source was changed by this worker and no push, package publication, or workflow/settings change occurred.

## Commands and portable evidence

Node 24.15.0 / Corepack pnpm 10.28.0 throughout. The bounded audit runner performs only pack/extract/consumer checks:

```sh
node packed-final-audit.mjs
node packed-final-audit.mjs --corrected
```

The original mode intentionally exits nonzero for the pre-correction artifact failures; `--corrected` packs only changed runtime artifacts at the corrected heads and exits zero when its executed gates pass. RFC5036's separate failed gate remains in reused evidence. The original `packed-final-audit/{fingerprints,results,scope}.json` and corrected directory contain exact heads, relative tarball paths/hashes, source-map coverage, commands, outputs, and discriminated PASS/FAIL/UNRUN outcomes. The supported hook reruns were appended without erasing the raw boundary controls. `packed-final-namespace-control.mjs` executes both formats against actual before/after tarballs.

The isolated correction used these runtime-only commands, with fresh tsdown emission and no Turbo build cache:

```sh
corepack pnpm --filter @module-federation/runtime run build
corepack pnpm --dir packages/runtime pack --out ABSOLUTE_EMISSION_DIR/runtime.tgz
corepack pnpm exec tsdown --config packages/runtime/tsdown.cjs-before-proof.config.ts
corepack pnpm exec tsdown --config packages/runtime/tsdown.cjs-after-proof.config.ts
corepack pnpm exec rstest -c packages/runtime/rstest.config.ts packed-declarations
corepack pnpm --filter @module-federation/runtime run test
```

Dual-format build/pack ran three times. Both temporary CJS-only configs were removed. Rstest's sandboxed attempt hit `listen EPERM ::1:3000`; approved loopback retries passed. Evidence is `packed-race-fix/{strict-results,cjs-only-sensitivity}.json`, `namespace-shape.mjs` and its log, three emission build/pack logs/tarballs, targeted/full test logs, and the checked-in regression/fixtures in the commit above. Strict compiler invocations and outcomes are recorded in the JSON; no diagnostic was suppressed.

**Unchanged remaining limits:** RFC5036 combined declaration-global conflict remains FAIL; original #5107 baseline attribution is in `packed-compat-proof-report.md`. Old/new enhanced compiler bootstrap matrices, Rspack externalRuntime provider bootstrap, and Rolldown-backed Vite optimizeDeps remain UNRUN. Historical Vite/Rolldown/injector cross-version proofs stay attributed to their historical artifact heads; this bounded audit makes no new final-head claim for those integrations. No public declaration-global graph redesign was attempted.
