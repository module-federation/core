# Packed runtime-image public API proof

The standalone runner performs no builds, installs, source edits, publication, or service startup. It validates emitted source-map inputs, packs changed runtime-family packages, reuses identical previously audited package artifacts, then runs actual Node import/require and strict TypeScript consumer checks. Source/API implementations remain owned by the resolver worker and root.

Final actual packed runs are complete at minor `abc32180ce7820bbd784b6fc3b90cf1dbacfe1a6` and major `3cf6ff1050089c8bd500ab044653116ee2f22b23`: **60 PASS gates, two expected readonly rejections, zero failures/skips**. The independent source/artifact audit passes 14 package checks covering 987 extracted dist files. See `final-proof-report.md`, `final-artifact-audit.json`, and `results/final-minor/{results,provenance}.json` and `results/final-major-complete/{results,provenance}.json`; draft checkpoints below remain historical evidence.

With Node24 active, run only after root supplies committed, clean heads and completed builds:

```sh
node newmetadata-proof/prove.mjs --worktree stack5141 --head FINAL_MINOR_SHA --label final-minor --baseline packed-final-corrected-audit/5128-minor
node newmetadata-proof/prove.mjs --worktree stack5142 --head FINAL_MAJOR_SHA --label final-major --baseline packed-final-corrected-audit/5128-major
```

The strict `.mts`, `.cts`, and combined programs consume the actual declared `RuntimeImageDescriptorV1`, additive runtime options, and five metadata value exports on runtime-core root/kernel and runtime/core. There is no `skipLibCheck` or suppressed diagnostic. The readonly negative program must produce exactly seven TS2540 field-write errors and three TS2339 readonly-array mutation errors; its raw source and actual diagnostics are retained.

Both Node formats must execute real parser/attach/read/compatibility helpers, reject malformed descriptors and known incompatibilities, prove fresh frozen descriptor/all-array copies, preserve root/helpers/core identities, return the shared literal, and reuse the same non-null instance. Existing kernel require mapping intentionally exposes the full index namespace; the runner checks the five new API values across both formats and preserves this wrapper instead of redesigning its export graph.

Two distinct older-core controls remain separate:

- Actual old `7aca6f70d415d110dd5419ace5b4c6a566c902c9` packed core, captured with 74 matching source-map inputs, has a kernel export and lacks metadata helpers. The runner copies its worker into the consumer graph and uses actual bare package imports/requires for runtime, core, and kernel in both Node formats. Supplied metadata must produce the named minimum-contract rejection on first use and attempted legacy reuse, preserving registered instances and legacy options. The untagged consumer must return its shared literal and reuse the same non-null instance before and after rejection. Both formats pass in both final actual packed graphs; the prior CJS-only draft result remains historical evidence.
- Actual rebuilt old `94aa846311eeaa5cdb33afd6894b09c1ba9c791c` root namespace also lacks `FederationKernel`. A plain webpack consumer maps both root/kernel external requests to that real namespace, without synthesizing helper fields, and checks the named minimum-contract rejection plus legacy literal. This is a compiled external-namespace boundary; it does not claim old94aa publishes a Node kernel entry or that an old direct constructor understands new options. Resolver-owned Rspack profile/provider checks remain separately attributed.

Results, source/artifact hashes, exact commands, raw diagnostics and literal outcomes are stored under `newmetadata-proof/results/LABEL/`. The runner returns nonzero for any unexpected outcome.

`--built` is an explicitly labelled uncommitted-draft checkpoint using actual built workspace packages without packing. The first such checkpoint at base7aca correctly stopped because the runtime's two emitted source-map inputs no longer matched `instance.ts`, which changed after the owner's build. That moving-draft failure is retained in `draft-proof.log`; no API or type PASS is claimed for it.

The fresh owner's final-build checkpoint at the same uncommitted base7aca passed **16 gates**, with **one expected readonly rejection** and zero unexpected failures: seven source-map gates (162 matched inputs), three strict consumers, two actual Node API/immutability workers, two older-core controls and their extraction, and namespace parity. Its actual readonly compiler result is exactly seven TS2540 plus three TS2339 diagnostics. Evidence is `draft-final-build-proof.log` and `results/isolated-draft-final-build/{results,provenance}.json`. This remains a built-workspace draft checkpoint; final packed proof waits for committed/rebuilt readiness and root propagation.

After the owner changed the additive helper lookup to actual kernel namespace property access and rebuilt, `isolated-draft-bare-import` passed **17 gates**, with **one expected readonly rejection** and zero unexpected failures. Its expanded old7aca workers execute genuine Node ESM and CJS package resolution, two metadata rejection controls per format, and untagged literal/reuse checks. Evidence is `draft-bare-import-proof.log`, `draft-bare-import-report.md`, and `results/isolated-draft-bare-import/{results,provenance}.json`. The 162 matched emitted source-map inputs verify this checkpoint's dirty source snapshot; its status remains explicitly uncommitted built-workspace evidence rather than final packed evidence.

RFC5036's four pre-existing combined-program TS2403 errors remain a separate FAIL. This runner adds no Vite8, Rspack, enhanced-bootstrap or declaration-global redesign claim.
