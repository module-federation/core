# Actual packed enhanced compiler / runtime bootstrap proof

**All four requested old/new enhanced-webpack bootstrap pairs pass**, with actual emitted startup, shared and remote literals, and two entries observing the identical non-null federation instance. The complete fail-closed harness runs **10 cases: 10 PASS, zero failed/skipped cases**. This supersedes the four enhanced compiler bootstrap UNRUN cells; historical evidence files remain intact.

## Exact artifact sources

| Family              | Exact source head                          | Enhanced package version | Actual enhanced tarball SHA256                                     |
| ------------------- | ------------------------------------------ | ------------------------ | ------------------------------------------------------------------ |
| Old baseline        | `94aa846311eeaa5cdb33afd6894b09c1ba9c791c` | 2.9.1                    | `cd24d589ae7ed9eb5655b8c8efa9b3db378bf12c8736298efe247357b4db51d7` |
| RFC5036 final       | `8643b69633039571cac171d1595645b75e62cf95` | 2.9.2                    | `352e498143fde4fa786ff9297417e11f0959254013cf6ea2292e3a897aeabf0a` |
| RFC5128 minor final | `83134b63016cd237bad96f7797706bfd8dd565c5` | 2.9.2                    | `6849cc9d891e9ad8b2c88f715a5d9f21d28fbd9825b28d12c06804ea4dbff7ab` |

The missing old compiler artifacts were rebuilt in a **new detached checkout** `packed-enhanced-baseline`, preserving the prior `exports` checkout and every prior tarball. Frozen filtered pnpm10.28 installed 16 workspace projects / 2377 packages. Actual Turbo `--force` built enhanced and dependencies: **15/15 tasks, zero cache hits**. The enhanced package build was then run directly. All old dependency packages were packed from these actual outputs, including old SDK/runtime; no compiler module was reconstructed or transpiled into a substitute package.

The final enhanced outputs already existed. Before reuse, every emitted JS source-map input across each 15-package compiler dependency graph matched its exact checkout: **237 old / 314 RFC5036 / 257 minor inputs, zero mismatches**. Enhanced itself accounts for **85/86/87** matching source inputs. Its production source tree hashes are respectively `4829003b434c536f1d1ff431d1fde2a1ebcd676d`, `05d543f8b9611ba9e0619982a614571a85034e7e`, and `7b75522db2deea041063b65d6cce5d554dad90f8`.

Each compiler graph contains **15 actual tarball packages**. Preparation performed **31 pnpm pack operations**, retaining **14 unchanged final-runtime tarballs** after dist-byte equality checks. Compile-time external libraries resolve to the corresponding frozen checkout's installed packages. The selected runtime family lives in a separate extracted graph and is passed through the supported `implementation` option. Each emitted graph asserts selected runtime-core participation and rejects leakage of another compiler-own runtime/runtime-core/runtime-tools/bundler package.

All **45 compiler tarball hashes**, **28 selected runtime artifact hashes**, and **2361 extracted runtime dist files** were independently checked. `compiler-provenance.json` and `runtime-provenance.json` preserve exact heads, versions, source trees, mapped source counts, tarball SHA256 values, and extracted dist-tree hashes. Runtime tarballs:

| Runtime family                | Source head                                | Runtime tarball SHA256                                             |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| Fresh old baseline            | `94aa846311eeaa5cdb33afd6894b09c1ba9c791c` | `4fb2bdb20e40b59ed23e45d672569b86996c9f1f7aca40f69e267f5c509e25a2` |
| RFC5036 final                 | `8643b69633039571cac171d1595645b75e62cf95` | `7d33a2c636ecabd59de9aa9bfc81e26aefdf5635c9ba19bbccb12022617d3907` |
| RFC5128 minor final           | `83134b63016cd237bad96f7797706bfd8dd565c5` | `29502d199aa10cb93a4c67439136cd5783d10c31e7bd7aef7755346e47021b96` |
| RFC5128 major limited control | `7db5f9fb9b3b386a3cd36b9ad5b89a62f8f5eb72` | `c73c8f7775b8e510ee5b8456d3d1aa23c44bc2bc4e3b7ed4508db45e163b9208` |

## Literal outcomes and compatibility policy

Every PASS below requires the emitted webpack bundle to return **`actual-compiled-shared`** and **`actual-data-url-remote`**, exactly **one native fetch, one remote VM evaluation and one remote factory call**, and startup instance `{count:2, nonnull:true, same:true}`. The instance must also match both the later remote/shared consumer's instance and the selected runtime package's version. The remote is a real classic CommonJS container fetched from a `data:` URL by the actual packed SDK; the fetch guard forwards to native fetch and refuses any non-data protocol. No entry-loading hook supplies the container, no response is stubbed, and no HTTP server/service is activated.

| Actual compiler     | Selected actual runtime | Request                              | Outcome                                                                                        |
| ------------------- | ----------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Old                 | Old                     | Full runtime baseline control        | PASS, no warnings                                                                              |
| Old                 | RFC5036 final           | Full runtime                         | **PASS**, no warnings                                                                          |
| RFC5036 final       | Old                     | Full runtime                         | **PASS**, no warnings                                                                          |
| Old                 | RFC5128 minor final     | Full runtime                         | **PASS**, no warnings                                                                          |
| RFC5128 minor final | Old                     | `composedRuntime:false` / omitted    | **PASS**, no warnings                                                                          |
| RFC5036 final       | Old                     | `disableSnapshot:true`, target node  | PASS, legacy-defines/no-metadata, no warnings                                                  |
| RFC5128 minor final | Old                     | `composedRuntime:true`               | PASS, full-runtime fallback with exactly one named missing `./compose` warning                 |
| RFC5036 final       | RFC5036 final           | Native family full-runtime control   | PASS, no warnings                                                                              |
| RFC5128 minor final | RFC5128 minor final     | `composedRuntime:true`               | PASS, actual composed startup, one compose + one kernel; remotes/consumes/share-scope adapters |
| Old                 | RFC5128 major final     | Retained init-shim bootstrap control | PASS, no warnings; limited control only                                                        |

The old family does not declare the composition subpaths, so new-minor opt-in uses its documented full-runtime fallback rather than claiming a composed old image. The harness asserts no composed entry/module in that cell and the exact warning. All other cells reject unclassified warnings. The supported minor opt-in verifies the actual compiler slot's generated composition entry and graph modules before executing the bundle.

RFC5036's native runtime-tools manifest advertises **`mode: legacy-defines`**. Its optimization request against the old family therefore proves the legacy/no-metadata path, not a metadata-bearing conditions provider. Every fixture above retains null runtime-image metadata. The separate injector minimum-contract/image checks remain separately attributed.

The major control exercises the retained default init shim used by this older compiler's startup. It **does not establish general old/new major compatibility**: the named full bundler `runtime` namespace remains removed, as verified in the final artifact audit. No compatibility claim was inferred from equal package versions or this limited startup control.

## Reusable commands and evidence

All successful install/build/pack/consumer commands used Node **24.15.0** and Corepack pnpm **10.28.0**. From the task root:

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
git -C exports worktree add --detach ../packed-enhanced-baseline 94aa846311eeaa5cdb33afd6894b09c1ba9c791c
```

From that new checkout:

```sh
corepack pnpm install --frozen-lockfile --filter @module-federation/enhanced... --filter module-federation --ignore-scripts
corepack pnpm exec turbo run build --filter=@module-federation/enhanced --concurrency=4 --force
corepack pnpm --filter @module-federation/enhanced run build
```

Then from the task root, preserving already recorded final package graphs:

```sh
node packed-enhanced-prepare.mjs
node packed-enhanced-artifact-audit.mjs
node packed-enhanced-bootstrap-proof.mjs
```

Preparation creates actual isolated compiler/runtime packages; `prepare-commands.json` records every exact pack/extract command and stdout/stderr. The harness verifies artifact provenance, executes each real compiler in a fresh process, writes literal discriminated outcomes and returns nonzero on any failed worker/assertion. An individual cell is reproducible with `node packed-enhanced-bootstrap-worker.mjs COMPILER_FAMILY RUNTIME_FAMILY legacy|opt-in`. The complete command exited **0**, producing **10 PASS** in `packed-enhanced-bootstrap/results.json`; each case retains options, emitted source/modules, bundle, compiler errors/warnings, composition selection and literal execution outcome under `cases/LABEL/`.

Failures retained during setup:

- Initial Corepack invocation from outside a checkout selected pnpm12.8.1 and failed `ERR_PNPM_BAD_PM_VERSION`; rerunning inside the new checkout used 10.28.0. No package-manager config changed.
- Offline frozen install lacked schema-utils4.3.0; sandbox online install failed DNS. The identical approved network install passed. Both failed logs remain; no lockfile changed.
- Initial baseline fixture wrote a CommonJS package scope and generated startup outside the fixture cwd, causing webpack to parse generated ESM `.js` as `javascript/dynamic`. The raw failure is retained in `fixture-commonjs-scope-failed-control.json` and `old-old-control.log`. The fixture now sets its own process cwd and uses an untyped package scope, so generated startup is localized and receives normal webpack ESM/auto parsing. The unchanged baseline passes; this is a fixture-scope correction, not an RFC source fix.

No production source, package export, compiler protocol, release configuration, workflow or repository setting was changed. No pushes or package publications occurred. The new baseline checkout is clean. The matrix compares the exact recorded main baseline with the actual final RFC compiler/runtime artifacts. It does **not** execute enhanced artifacts from the original RFC5036 #5107 `c813c4fdd82e3f146daca65c322b481ada0cb6c9` or original RFC5128 #5141 `84cee419c5c7dc2bb87d1a92cd7fb8e15e409aec`; those distinct historical compiler-head comparisons remain UNRUN. No broader claim about every original RFC version is made.

**Remaining evidence limits:** RFC5036 strict combined consumer's four pre-existing TS2403 conflicts remain FAIL. Historical pre-correction minor declaration failures remain negative controls. Rspack external-provider execution and Vite8/Rolldown-backed optimizeDeps are independent gates; this webpack proof does not claim their status. No all-workspace app/Metro E2E, enhanced full unit-suite rerun, service installation or additional integration expansion was performed because this follow-up changes only task-local proof fixtures and builds the missing baseline artifacts.
