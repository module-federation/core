# Rspack external provider execution and metadata proposal

This supplement records actual compiled startup separately from compatibility admission. No production, RFC, integrated-stack, dependency, settings, or remote changes were made. The protocol below is a proposal for parent review, not an implementation.

## Sources and artifacts

| Variant        | Exact source HEAD                                        | Runtime artifacts                                                                                                    |
| -------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| RFC 5036       | `8643b69633039571cac171d1595645b75e62cf95` (`stack5107`) | `packed-final-audit/5036/consumer/node_modules/@module-federation` and source-matched built packages                 |
| RFC 5128 minor | `83134b63016cd237bad96f7797706bfd8dd565c5` (`stack5141`) | `packed-final-corrected-audit/5128-minor/consumer/node_modules/@module-federation` and source-matched built packages |
| RFC 5128 major | `7db5f9fb9b3b386a3cd36b9ad5b89a62f8f5eb72` (`stack5142`) | `packed-final-corrected-audit/5128-major/consumer/node_modules/@module-federation` and source-matched built packages |

All builds use the existing source-matched built `@module-federation/rspack` wrapper, actual `@rspack/core@2.1.10`, Node `24.15.0`, and the locked dependencies already installed by the parent. Packed graphs are the seven real tarball packages supplied by `packed_compat`; no compiler or runtime package was synthesized or rebuilt here. Artifact fingerprint records are `packed-final-audit/fingerprints.json` and `packed-final-corrected-audit/fingerprints.json`.

The packed run explicitly selects its packed runtime-tools implementation and maps the wrapper's automatically selected injector to the same packed injector, preserving the wrapper's require export condition. The built run uses the default same-tree package resolutions with no aliases and no packed-module search path. This second run proves the stock built-family path independently of the packed fixture's explicit selection.

## Executable fixture and results

Harness: `rspack-provider-proof/probe.mjs`. Each variant compiles three real bundles: a pure consumer provider with `provideExternalRuntime:true`; a file container exposing `./literal` with `externalRuntime:true`; and a consumer loading that container through a native promise remote, also with `externalRuntime:true`. The bundles are CommonJS output for the real async-node target. A runtime plugin supplies explicit test metadata before the built injector runs; consumer and container explicitly include the built injector in `runtimePlugins` to exercise admission. Metadata is hand-authored input to the existing protocol, not a claim that the wrapper derives or publishes it automatically.

Each startup uses a fresh Node process. Provider and consumer federation instances must be non-null; their actual `instance.constructor` must equal the published `_FEDERATION_RUNTIME_CORE.ModuleFederation`, and `instanceof` must hold. The fixture asserts `shared-provider-literal`, `remote-file-literal`, and shared object identity between consumer and file container. Independently, the consumer instance registers a `data:` CommonJS remote and calls its own `loadRemote`; the actual Node SDK fetch/evaluator returns `runtime-data-url-remote-literal`. No HTTP listener, mock runtime, stub constructor, or service is involved. Publication identity must remain unchanged after reuse or rejection.

Final matrix: **18 real compiles, 24 isolated startup processes; all expected assertions pass**. Six compiles per source variant cover packed and unaliased built graphs. Startup has 16 successful execution rows and 8 expected named rejection rows. Two successful rows intentionally demonstrate a protocol validation gap; they are not compatibility-conformance passes.

| Variant    | Rows in each of packed and built runs                                                                     | Metadata conclusion                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 5036       | compatible executes; target, loader, ABI-id, missing-capability reject; unsupported `contract:2` executes | Existing metadata admission catches four mismatches but does not validate contract version     |
| 5128 minor | compatible, target-change, loader-change all execute                                                      | Provider has no runtime-image metadata; none of these rows establishes compatibility admission |
| 5128 major | compatible, target-change, loader-change all execute                                                      | Same absence of metadata protocol; full-runtime selection is not compatibility admission       |

5036 named rejection messages:

- `[ Federation Runtime ]: Refusing to reuse a node runtime image for web.`
- `[ Federation Runtime ]: Refusing to reuse entry loader rspack-async-node-file-v1 with different-loader.`
- `[ Federation Runtime ]: Refusing to reuse runtime state from rspack-file-proof-v1 with different-abi.`
- `[ Federation Runtime ]: Runtime image is missing capability unsupported-proof-capability.`

The fixture's target change changes the advertised metadata while the compiled consumer stays async-node. It proves the metadata gate's rejection, not execution on a second platform. Actual startup proves only this fixture's node/shared/remote operations; it does not establish every advertised capability or arbitrary cross-version ABI compatibility. Different provider/consumer names produce the existing injector warning while keeping the provider unchanged. Provider name/version are diagnostic observations only.

Logs: `rspack-provider-proof/probe.log`, `rspack-provider-proof/probe-built.log`; lean matrix: `rspack-provider-proof/matrix.json`. The matrix was generated by parsing all final row logs and asserting the 24/16/8 counts. Per-variant directories `5036`, `5128-minor`, `5128-major` and their `-built` counterparts contain generated sources, emitted bundles under `out/`, runner, per-mode logs, `compile.json`, and concise `graph-summary.json`. An additional emitted-text check asserts the full `ModuleFederation` class is absent in both 5036 consumer bundles and present in all four 5128 consumer bundles.

Early fixture diagnostics were corrected before the final runs: an initial Ripwire path omitted the `runtime-plugins` directory; a directory alias failed to honor runtime-tools subpath exports; mixing an explicitly selected ESM injector with the native CJS runtime produced different constructor identities; an overbroad assertion assumed independent provider/consumer instances share a scope automatically; and a major fixture inspected `federation.runtime.ModuleFederation`, which the major bundler facade no longer exports. The final harness preserves matching require conditions, checks the actual instance constructor, and asserts shared identity only within the consumer/container share scope. An initial built-artifact attempt retained the packed search path; the final built run removes it and asserts every provider core module comes from the intended built source tree. These were harness/setup failures, not production regressions. Final logs contain only the corrected complete runs.

## Independent partial-externalization defect

RFC 5128 external consumer/container bundles still contain core implementation modules. This is separate from the absent metadata protocol and does not invalidate the execution assertions.

| Variant                        | Provider core dist modules | External container core dist modules | External consumer core dist modules |
| ------------------------------ | -------------------------: | -----------------------------------: | ----------------------------------: |
| 5036, both artifact runs       |                         48 |                                    0 |                                   0 |
| 5128 minor, both artifact runs |                         40 |                                   40 |                                  40 |
| 5128 major, both artifact runs |                         40 |                                   40 |                                  40 |

The counts are actual compilation module records, excluding generated bootstrap URL text. The emitted 5128 consumer bundle also contains the full `ModuleFederation` class definition. The wrapper installs an exact-root external for `@module-federation/runtime-core`; full-runtime helpers now import `@module-federation/runtime-core/kernel`, whose require export resolves to `dist/index.cjs`. Thus the exact-root external remains present while those subpath requests bundle a core copy. Global constructor reuse makes the actual instances use the provider constructor in this fixture, but exclusive external-core ownership and byte removal are not proved.

Relevant source locations: `stack5142/packages/rspack/src/ModuleFederationPlugin.ts:164`, `stack5142/packages/runtime-core/package.json:33`, `stack5142/packages/runtime/src/instance.ts:1`, `stack5142/packages/webpack-bundler-runtime/src/getSharedFallbackGetter.ts:1`, and `stack5142/packages/webpack-bundler-runtime/src/treeShakingSharePlugin.ts:5`. Minor has the same subpath behavior. No source fix is proposed or applied by this supplement.

## Smallest explicit compatibility contract: proposal only

Reuse can retain the existing global core and provider-info slots; a new broad registry or remote protocol is unnecessary for this boundary. The minimum provider metadata consists of these semantic fields, with consumer requirements compiled separately:

| Field                  | Meaning and validation                                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contract: 1`          | Supported metadata schema version; reject every other value before comparing fields                                                                                     |
| `compatibilityId`      | Explicit core/adapter/state ABI epoch, covering controller signatures and shared/global registry layout; a nonempty string, independently assigned from package version |
| `available`            | Validated unique capability identifiers actually retained in the published runtime image                                                                                |
| `target`               | Validated target identifier; initially require exact equality to avoid inferring undocumented universal/platform interoperability                                       |
| `entryLoadingIdentity` | Explicit evaluator/entry-loading contract identity, including the relevant transport and loading-hook semantics; a nonempty string                                      |

The consumer's `required` capability set must come from its actual compiler participants and declared plugin needs. Full compatibility fallback must honestly require the corresponding full runtime behavior; unknown plugin needs cannot be advertised as an empty requirement set. Provider availability must come from the emitted image, not its own requirement list or package name. Optional consumer `forbidden` is needed only where deliberate capability absence is a correctness condition. Existing 5036 v1 has `required`, `forbidden`, and `available` on both descriptors and compares unions; reinterpreting those existing wire fields silently would be a behavior change. A later implementation should preserve existing semantics explicitly or introduce a new schema version for a directional provider-available/consumer-required check.

Publication admission: treat proposed metadata and global state as `unknown`; validate core namespace shape and the complete descriptor before publishing. Copy/freeze the validated descriptor so later mutation cannot change an admitted contract. With an existing provider, admit only a known schema and equal ABI/target/loader identity, with consumer required capabilities covered by provider availability and no forbidden overlap. On rejection preserve both provider slots and instance/share state. Name/version never admit reuse. Matching opaque identifiers express an explicit compatibility guarantee; they do not prove equivalent arbitrary custom loader implementations or create a security boundary.

Consumer reuse admission must happen in bootstrap before evaluating modules that dereference the external core, constructing/registering an instance, or touching shared/remote state. A `beforeInit` hook alone is too late to protect the initial external import when the provider is missing or malformed. A missing provider should have a named bootstrap error; malformed metadata or core payloads should have a named contract error, rather than raw iteration/property TypeErrors. This is a bounded external-provider bootstrap guard, not a redesign of composition.

Boundary validation must check a non-null record, exact supported contract literal, nonempty ABI/loader IDs, known target, actual string arrays with supported capability IDs, and a callable core constructor plus the minimum functions the consumer bootstrap uses. Validation of unknown contracts is mandatory even when all other fields compare equal. Unknown required capabilities must reject; extensions must have defined forward-compatibility semantics instead of accidental coercion.

Concrete regression plan for contract-version rejection: retain the current real compiled `5036/unknown-contract` and `5036-built/unknown-contract` fixtures, change their expected result from execution to a named unsupported-contract rejection, and assert the provider core/info references, instance registry, and share state remain unchanged. Add corresponding provider-publication negative coverage, malformed-record/array cases, and missing-metadata cases. The current source `stack5107/packages/runtime-core/src/runtimeImage.ts:34` is typed but has no runtime contract-version check; both actual compiled `contract:2` consumer rows execute today. This gap is reported for review only.

Legacy policy must be explicit and separate from validated admission: metadata-free historical providers may retain documented permissive behavior for compatibility, labeled unchecked. A strict metadata-requesting consumer must reject missing/unknown metadata unless it deliberately selects a separately documented legacy-unsafe policy. Such an opt-out must never make malformed supplied metadata valid or bypass a known mismatch. `externalRuntime:true`, retired `composedRuntime:false`, and the provider's name/version do not themselves supply this opt-out. RFC 5128 would need an explicit publication/admission implementation before claiming this contract; the current tests cannot substitute for it.

## Commands, checks, and limits

Final executable commands from task root:

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
node rspack-provider-proof/probe.mjs > rspack-provider-proof/probe.log 2>&1
PROOF_ARTIFACTS=built node rspack-provider-proof/probe.mjs > rspack-provider-proof/probe-built.log 2>&1
```

Formatting from `stack5142`:

```sh
corepack pnpm exec prettier --write /Users/zackjackson/Documents/Codex/2026-10-02/task-4/rspack-provider-proof/probe.mjs
corepack pnpm exec prettier --write /Users/zackjackson/Documents/Codex/2026-10-02/task-4/rspack-provider-proof-report.md
corepack pnpm exec prettier --check /Users/zackjackson/Documents/Codex/2026-10-02/task-4/rspack-provider-proof/probe.mjs /Users/zackjackson/Documents/Codex/2026-10-02/task-4/rspack-provider-proof-report.md
```

Repository navigation used local Ripwire v0.6.5, including:

```sh
ripwire-tool/build/ripwire stack5107/packages/runtime-plugins/inject-external-runtime-core-plugin --for='beforeInit provider metadata runtime image publication reuse mismatch' --token-budget=3500
ripwire-tool/build/ripwire stack5107/packages/runtime-core --for='getRemoteEntry esm loadScriptNode dynamic import entry type module' --token-budget=2300
```

Read-only source inspection additionally used `rg`, `cat`, `sed`, and `nl`. Final `git rev-parse HEAD` matches the three exact heads above; `git status --short` is empty in all three integrated worktrees. All probe writes are under task-root `rspack-provider-proof/` plus this report. No commits or pushes were made for this supplement.

UNRUN: external-provider-specific browser startup, older Rspack 1.x versions, and mixed historical/new Rspack wrapper pairs. This supplement intentionally executes the available final 2.1.10 wrapper path; historical wrapper artifact preparation is owned by `packed_compat`, and its enhanced/Webpack matrix is a separate deliverable. No missing current-artifact precondition blocks the executed rows. Package-wide rebuild/test/format gates were not repeated because no package source changed; those final integrated checks are recorded in the existing resolver report. This supplement does not claim arbitrary ABI compatibility, a shipped RFC 5128 metadata contract, or exclusive core ownership for 5128 external builds.
