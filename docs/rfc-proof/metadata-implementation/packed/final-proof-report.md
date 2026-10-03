# Final packed runtime-image API proof

Both actual final package graphs pass: **60 PASS gates, 2 expected readonly rejections, 0 unexpected failures, 0 skipped gates**. Gate counts include packing, extraction and source-map verification, not only consumer executions. An independent artifact audit adds **14 PASS package checks covering 987 extracted dist files**. No builds, implementation edits, installs, services, package publication or pushes were performed by these runs.

| Graph                | Clean committed source head                | Matching emitted source-map inputs | Runner outcome                          |
| -------------------- | ------------------------------------------ | ---------------------------------- | --------------------------------------- |
| final-minor          | `abc32180ce7820bbd784b6fc3b90cf1dbacfe1a6` | 172                                | 30 PASS + 1 expected readonly rejection |
| final-major-complete | `3cf6ff1050089c8bd500ab044653116ee2f22b23` | 170                                | 30 PASS + 1 expected readonly rejection |

Root supplied completed forced builds. Major artifacts were emitted at `acf69e8e6ae37bcc23bef4d91395f6e12f795b8a`; the current major head includes two subsequent test-only Rspack counter/comment corrections. All seven production-source fingerprints and all seven package manifest/dist fingerprints match the original and intermediate `89dc3d4397cf97e45afe82c60e6279f93786f7f0` results. Actual tar members match byte for byte except pnpm dependency-key ordering in runtime/package.json, whose parsed manifest remains identical. Exact current hashes are recorded below; `final-major-followup-equality.json` records these comparisons. No rebuild was needed. Prior `results/final-major/` and `results/final-major-current/` stay preserved; neither is the latest final result. The original good audit remains in `final-artifact-audit-before-counter-fix.json`. The intermediate audit failed closed when the head advanced during verification; its exact negative control remains in `final-artifact-audit-moving-head-control.log`. The final clean-head audit passes. Six changed runtime-family packages per graph were packed with actual `corepack pnpm@10.28.0 --dir SOURCE pack --out TARBALL`; only error-codes was reused after verified complete dist-byte equality and original tarball SHA256. The seven real packages were extracted into each consumer. Recorded provenance contains every package manifest/build-dist fingerprint, tarball hash and exact pack/extract command. `audit.mjs` independently checks tarball hashes, all extracted dist bytes against current builds, public manifest fields/exports/imports, source fingerprints, clean committed heads and tsdown config hashes. The runner consumes the real resulting public entry points and declarations.

Exact commands (Node 24.15.0):

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
node newmetadata-proof/prove.mjs --worktree stack5141 --head abc32180ce7820bbd784b6fc3b90cf1dbacfe1a6 --label final-minor --baseline packed-final-corrected-audit/5128-minor > newmetadata-proof/final-minor-proof.log 2>&1
node newmetadata-proof/prove.mjs --worktree stack5142 --head 3cf6ff1050089c8bd500ab044653116ee2f22b23 --label final-major-complete --baseline packed-final-corrected-audit/5128-major > newmetadata-proof/final-major-complete-proof.log 2>&1
node newmetadata-proof/audit.mjs final-minor final-major-complete > newmetadata-proof/final-artifact-audit.log 2>&1
```

Each graph passes three actual strict TypeScript programs: `.mts`, `.cts`, and their combined program, with no `skipLibCheck` or diagnostic suppression. They consume `RuntimeImageDescriptorV1`, additive `UserOptions.runtimeImage`, and `RUNTIME_IMAGE`, `parseRuntimeImage`, `readRuntimeImage`, `attachRuntimeImage`, `assertRuntimeImageCompatible` from runtime-core root/kernel and runtime/core. The separate negative program must exit 2 with exactly seven TS2540 readonly field-write errors and three TS2339 readonly-array mutation errors; both actual diagnostics meet this gate.

Four actual Node API workers (ESM/CJS per graph) prove the symbol and four functions exist and have identical identities through the three core public entry points. Each rejects 11 malformed values and five known compatibility mismatches, verifies fresh frozen descriptor/all-three-array copies and immutable attach/read/options behavior, returns `immutable-packed-shared`, and reuses the same non-null instance. Ordinary root/barrel/runtime/helpers export keys match ESM/CJS, with existing default identities preserved. The existing CJS `/kernel` export resolves the full index namespace while ESM resolves the kernel namespace: the test preserves that pre-existing wrapper and checks identical five-value metadata API availability, rather than claiming complete kernel namespace equality.

Four old7aca Node workers (ESM/CJS per graph) execute actual bare runtime/core/kernel package imports/requires from a consumer containing the new packed graph and the real captured old core. Old core source is `7aca6f70d415d110dd5419ace5b4c6a566c902c9`, with 74 matched original source-map inputs and tarball SHA256 `bae2e54c46475d6deddd60b648e9dc12aeb3dbca7cf53d1b5c9bd9a7ebd6debc`. Its kernel exists and its four metadata functions are absent. Both first-use metadata admission and attempted legacy reuse raise an ordinary Error containing `[RuntimeImageMinimumContract]`, without registry/legacy-options mutation. Untagged legacy consumers still return `actual-oldcore-legacy-shared`, version `2.9.2`, and reuse the same instance before and after rejection.

Two old94aa controls compile with plain webpack and map both external root/kernel requests to the actual rebuilt old94aa root namespace (`94aa846311eeaa5cdb33afd6894b09c1ba9c791c`), without fabricating exports. Both have zero compiler errors/warnings, named metadata rejection before instance mutation, and `actual-old94-legacy-shared`. This remains a **compiled external-root boundary only**; old94aa publishes no Node kernel entry. It is not a direct old-constructor metadata-support or separately owned Rspack provider/profile proof. The major old-core result is scoped to these actual runtime-root controls, not a claim that all old compiler/bundler integrations are supported.

Prior stale-build/draft evidence and earlier declaration-artifact FAIL controls remain preserved and labelled historical. Final packed results supersede the pending API cells only. RFC5036's four pre-existing combined-program TS2403 failures, Vite8 gap, and other integration UNRUN cells remain explicit in their existing reports; this API harness does not broaden those claims.

Literal rows, exact commands, stdout/stderr and diagnostic codes are in `results/final-minor/results.json` and `results/final-major-complete/results.json`; committed source/artifact fingerprints are in each `provenance.json`. Independent audit results are in `final-artifact-audit.json`. Portable evidence hashes are in `final-evidence-hashes.json`; all raw tarballs and full consumer artifacts remain available locally. Lean publication can include this report, README, four worker/runner scripts plus audit, three consumer fixtures, two results/provenance pairs, three logs, audit JSON, follow-up equality JSON, hash JSON and old-core provenance. It need not copy node_modules or built consumers into the ledger.

Actual tarball SHA256s (paths `results/GRAPH/tarballs/PACKAGE.tgz`):

| Graph                | Package                             | Origin | SHA256                                                             |
| -------------------- | ----------------------------------- | ------ | ------------------------------------------------------------------ |
| final-minor          | sdk                                 | packed | `c87d3e34e0778d0b2674119446faa23cabbab6a0a0e591e76807f18c5cd419d6` |
| final-minor          | error-codes                         | reused | `aeff96de7fdeebf88d395e440455bef872b6b93d0b616e6628ebf0a10498709e` |
| final-minor          | runtime-core                        | packed | `8fd44351a52af972453c4885c2e7004a40f0c27a4ace0253f0b009ac0334c9b7` |
| final-minor          | runtime                             | packed | `13834467f9736932e4f2a02aa1050adbee5bc14a01c723e69caa91fa66eb4632` |
| final-minor          | webpack-bundler-runtime             | packed | `ba8c6f4435e28b52e851f764e572e70fe506336053f7458ca5d933d4b061f599` |
| final-minor          | runtime-tools                       | packed | `f899ce60ffee8b60098b98abba05dee7f0d02e7695ffaa3f872366304376fe17` |
| final-minor          | inject-external-runtime-core-plugin | packed | `ee7d2ef38fc92153145a63484d4f243f15637aa009f92a540b6895c78c60ed4a` |
| final-major-complete | sdk                                 | packed | `0a762a63845a70048575cb37c5d67278e18cc793ff55aadbeac2c5e3753ca227` |
| final-major-complete | error-codes                         | reused | `aeff96de7fdeebf88d395e440455bef872b6b93d0b616e6628ebf0a10498709e` |
| final-major-complete | runtime-core                        | packed | `b4bd5faff32aa7673c57c86cad366a5628d61e6e78f2a3df923cfd6187e01d34` |
| final-major-complete | runtime                             | packed | `f9eac4f1a8372ce5e59a7fc8bacc4bf6f8c0b8287ac9ed138b3f22788756c92c` |
| final-major-complete | webpack-bundler-runtime             | packed | `92ba6ac7026204233b45928dcddb7026e9c301e1fc579d6f693e62637189761f` |
| final-major-complete | runtime-tools                       | packed | `f899ce60ffee8b60098b98abba05dee7f0d02e7695ffaa3f872366304376fe17` |
| final-major-complete | inject-external-runtime-core-plugin | packed | `ee7d2ef38fc92153145a63484d4f243f15637aa009f92a540b6895c78c60ed4a` |
