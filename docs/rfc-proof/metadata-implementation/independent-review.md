# Independent RFC5128 runtime-image source/API review — accepted bounded commit

Review checkout: `rfc5128-runtime-image`, initially clean at `7aca6f70d415d110dd5419ace5b4c6a566c902c9`. Final reviewed clean commit: `0d7a700b7469487d7347007e71825b24719296b7`. No production source edits or pushes by this reviewer. Read the checkout's AGENTS.md and the agreed `rfc5128-external-kernel-proof/metadata-integration-proposal.md`. Applied the previously read proof/type-discipline guidance.

Recommendation: accept the bounded source/API change at the commit above. No remaining source/API blocker found in this review. Final emitted matrix and packed checks belong to the owner and packed reviewer; they were not duplicated here. The metadata-free legacy cases must be labeled **UNCHECKED**, even though structural namespace admission succeeds.

## Contract reviewed

The parser accepts only `undefined` as absence and validates all seven supported v1 fields. It now snapshots scalar values once, copies array values before validating them, and freezes both the descriptor and copied arrays. The comparator preserves provider `available ∪ required` coverage of consumer `available ∪ required`, consumer forbidden intersection checks, and exact ABI/target/loader equality.

Both metadata absent: allow unchecked legacy reuse. One absent: warn and allow unchecked reuse when the required helper API exists. Supplied malformed metadata rejects even when the other side is absent. A metadata-aware path through an older/partial core must reject with `RuntimeImageMinimumContract`, rather than calling an undefined helper or fabricating no-op exports.

The draft compiler profile requires explicit author guarantees `compatibilityId` and `entryLoadingIdentity`, plus explicit `optimization.target`. It describes built-in Rspack external runtime families from optimization definitions. Snapshot is retained only if both remote and snapshot are enabled; platform is retained only if remote or shared remains. Supplied nonboolean disable flags now reject. Unknown implementation/plugins and non-external/composed profile modes reject. Parent owns any subsequent composed integration; no composed metadata derivation is endorsed here.

## Concrete findings and current corrections

| Finding                                                                             | Source / topology                                                                      | Status                                                                                                                                                            |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sparse capability lists pass `Array.every` and publish `undefined` members          | `runtime-core/src/runtimeImage.ts`, all three list fields                              | Corrected; actual-source probe rejects all three sparse inputs.                                                                                                   |
| Getter reread publishes an unvalidated scalar                                       | Same parser; compatibilityId getter returns string then undefined                      | Corrected snapshot; actual-source probe reads once and returns validated string.                                                                                  |
| Generic helper overwrites constructor-resolved metadata with absent initial options | `runtime/src/instance.ts:createInstance`, injector config introduces tag in beforeInit | Corrected in inspected source; final association uses resolved instance options.                                                                                  |
| Injector config malformed/mismatch admission after shared handler construction      | Injector beforeInit vs `shared/index.ts` constructor's `_setGlobalShareScopeMap`       | Configured image now parsed/compared in factory; supplied UserOptions image is checked in core constructor before handlers. Final actual matrix still pending.    |
| Unknown `_FROM` payload treated as typed record/absence                             | Injector publication and emitted admission                                             | Record/null/array gate now present in inspected source.                                                                                                           |
| Unconditional metadata helper calls break genuine old valid-kernel legacy path      | Generic instance and injector factory                                                  | Explicit optional narrowing present; independent generic actual-constructor/reuse control passes with genuine built 7aca namespace lacking every metadata helper. |
| Partial metadata API rejects only after construction and shared mutation            | Generic create: parser exists but read/attach/assert absent                            | Executably reproduced; complete helper floor now rejects before construction and preserves SHARE in independent rerun.                                            |
| Provider `.concat` flattens metadata tuple into two plugins                         | Rspack ModuleFederationPlugin provider append                                          | Replaced with self-contained data factory module; actual native-version execution pending.                                                                        |
| Truthy string `'false'` disable flag creates dishonest capability profile           | Profile derivation vs DefinePlugin source expression                                   | Boolean input gate now present in source and owner regression.                                                                                                    |
| Kernel-only minimum lets missing root bootstrap calls through                       | ExternalRuntimePlugin root admission                                                   | Root ModuleFederation/get/set constructor functions now checked before return; Global object checked for metadata paths. Actual missing-export matrix pending.    |

## Independent executable evidence

These run against the actual current source, stripped by Node 24 rather than reimplemented helper logic:

```sh
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/runtime-image-sparse.cjs
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/runtime-image-old-kernel-source.cjs
```

`runtime-image-parser-fixed.log`: all sparse list fields reject named contract errors; changing compatibilityId getter is read exactly once and the returned field is a string.

`runtime-image-old-kernel-source.log`: real built 7aca namespace has callable FederationKernel and no parse/read/attach/assert image helpers. Current generic source successfully constructs the actual old ModuleFederation class and reuses it when both tags are absent. Supplied metadata produces the named minimum error before construction and preserves the registry/SHARE state. This is a helper-source + actual old built namespace control, **not** an emitted external bootstrap proof.

`runtime-image-partial-api-before.log`: a genuine new parser combined with the real old namespace, with the other three image APIs absent, called the real old constructor once and changed global SHARE before rejection. Expected zero-construction assertion failed.

`runtime-image-partial-api-fixed.log`: the same source/namespace control after correction rejects with zero constructor calls and unchanged SHARE; the genuine legacy absence control also passes.

`runtime-image-config-family-fixed.log`: actual current injector/image/generic source uses the real old constructor and logger. A plugin carries configured familyC through the real runtime-image association API; the initial direct image is absent, a registered instance carries familyA, and both publication slots are absent. The new generic preflight rejects before any constructor call and preserves the publication slots, registry, and SHARE. The same run rechecks genuine old absence and complete metadata API availability. These remain source/direct API probes, not substitutes for emitted execution.

Original sparse observation was captured in the tool transcript before the source correction. Its original output file was overwritten by a later checkpoint; `runtime-image-sparse-original-observation.log` explicitly records this provenance limit. Getter failure checkpoint is preserved in `runtime-image-shape-second-checkpoint.log`. No original-source tarball or full-build baseline is claimed for these draft parser probes.

## Remaining acceptance work

The source-level registered-family bypass through injector configuration is now corrected: the actual plugin carries an immutable descriptor association, and generic/core entrypoints normalize that known claim before construction/registration. Its independent source-level rejection/state-preservation probe passes.

Normalization now compares differing direct and plugin-tagged claims in both directions. The independent public API case requesting remote+shared while the plugin advertises only shared rejects before construction; SHARE and publication slots stay unchanged. Equivalent claims use set equality per list, so reordered or duplicated entries do not accidentally force a reuse comparison on first structural admission. The independent equivalent-set case passes using the actual old constructor after source validation.

The factory's published-core minimum floor also passes independently: a metadata-bearing producer encountering the genuine old namespace rejects before constructor invocation and preserves SHARE. The earlier file named `runtime-image-producer-floor-before.log` was collected after the correction had already landed; it is a successful checkpoint, not a failure baseline.

The emitted old7aca control initially loaded a new untagged provider then replaced its namespace with the real old core. That is useful old-API admission evidence but narrower than a completely old emitted provider. Requested an actual old compiled provider → new untagged consumer control with verified provenance, or an explicitly limited claim.

Need final actual compiled provider/consumer outcomes, state-preserving first-publication and reuse malformed/mismatch rows, early direct root and kernel startup guards, transport boundary execution, old valid-kernel absence case, real packed CJS/ESM root/kernel declarations/exports, and final committed diff. Owner is running these; reviewer has not duplicated full builds. Custom transport must retain its selected transport for untagged paths and refuse known metadata with a named supported-boundary diagnostic. No remote CI, push, or semantic identity across arbitrary custom browser globals is claimed.

## Latest TypeScript/API-only checkpoint

Additional exact invocation:

```sh
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/runtime-image-set-contract.cjs
```

`runtime-image-set-contract.log` passes copied/frozen arrays for all three list fields, input mutation isolation, attachment copies, required/available union comparison on both sides, forbidden comparison against the provider union, and exact compatibilityId/target/entryLoadingIdentity. Both absence directions remain explicitly **UNCHECKED**; one absent warns and allows. Malformed metadata rejects before absence comparison in either direction. The harness evaluates actual current helper source and binds the genuine old runtime logger.

`runtime-image-normalization-namespace-checkpoint.log` passes all six direct API controls after the owner switched optional helpers to a namespace import. The preceding `runtime-image-normalization-final-checkpoint.log` contains a reviewer harness SyntaxError because its old import stripper did not remove that new namespace import. The harness was adapted to bind the actual namespace, without changing production source or replacing missing metadata functions with no-ops.

Inspected exported descriptor types in root/kernel and typed runtime options match the seven-field v1 shape and readonly copied arrays. Generic helper validation precedes construction, registry publication and reused-instance initOptions; core constructor admission precedes handler construction for known inputs; hook-resolved metadata is parsed/compared before remote/shared registration. The bundler container init forwards the admitted instance image before sharing changes, and explicit override remains subject to initOptions validation. No new source/API blocker found in this checkpoint. Final commit identity and owner validation results remain pending; this report is not a final compiled or packed artifact endorsement.

## Pending first-admission hook-output correction

Root identified known initial image substitution/removal through beforeInit. Owner added bidirectional comparison for differing known hook results. Independent `runtime-image-hook-format.cjs` executes the actual current formatOptions method, normalizer, parser and comparator. ABI substitution, smaller capability substitution, and null reject before observed remote/shared registration or init calls. Known-image erasure on returned absence still fails at this checkpoint (`runtime-image-hook-format-before.log`: undefined versus ABI). Owner notified; retention correction is pending. The probe also contains the allowed absent-initial/valid-hook-added metadata control to rerun after correction. This isolated method probe does not claim full-constructor SHARE rollback.

## Final commit stamp and actual built publication checks

Reviewed exact committed core/generic/shared-handler diff at `0d7a700b7469487d7347007e71825b24719296b7`; checkout status is clean. Historical pending checkpoints above describe findings before corrections. The hook retention correction is complete, both differing descriptor directions compare, hook-output plugin tags normalize again, and initial metadata remains the fallback when a hook returns absence. The additive `RemoteEntryInitOptions.runtimeImage` declaration makes the intended explicit override typed.

Final actual-source reruns PASS: `runtime-image-set-contract-0d7a700.log`, `runtime-image-normalization-0d7a700.log`, `runtime-image-hook-format-0d7a700.log`. No full build or broad test suite was rerun by this reviewer.

Exact additional actual built API commands (each fresh process):

```sh
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/runtime-image-built-publication-order.cjs reject
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/runtime-image-built-publication-order.cjs success
/Users/zackjackson/.nvm/versions/node/v24.15.0/bin/node skeptical-review-evidence/runtime-image-built-publication-order.cjs legacy
```

All three PASS against the owner's already-built CJS core/runtime/injector namespace. Logs `runtime-image-built-publication-{reject,success,legacy}.log` record exact artifact SHA256 values. Tagged valid injector followed by null-returning later hook rejects and preserves core/FROM identities, instance entry identities, SHARE map identity and keys/value references. Successful tagged admission publishes the frozen descriptor, registry entry and SHARE map before return. Untagged/absent calls retain core and SHARE publication before a later beforeInit hook (**UNCHECKED**). Root's original failing proof was read but not changed; this reviewer-owned copy adds SHARE checks and prints summary-only failure output.

The final source confines SHARE deferral to normalized metadata-bearing constructor options, and tagged injector publication to the existing init hook. This establishes the tested metadata ordering cases; no arbitrary user plugin rollback guarantee is asserted. Parent owns major-line derivation adaptation, and this minor-line commit's capability derivation is not a claim about another branch's runtime definitions. No source edits or pushes by reviewer.
