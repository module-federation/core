# Final integrated PR #5140 composition verification

Final tested checkout HEAD: `7e1e276ac4a59c8696f38aae999a7c7c9883a5be` in `/Users/zackjackson/Documents/Codex/2026-10-02/task-4/stack5140`. It contains the package-version harness correction cherry-picked by root. The checkout is clean. No source edits, commits, topology changes or remote actions occurred during this final verification.

Composition implementation SHA256: `c965d21d91f206cb981e06901834c2fdf5ae77721e0ca4fcef6b24308eafa882`, hashing the UTF-8 bytes of FederationCompositionPlugin.ts, one newline, then ModuleFederationPlugin.ts. Environment: Node 24.15.0, corepack pnpm 10.28.0.

## Final checked-in proof

From `/Users/zackjackson/Documents/Codex/2026-10-02/task-4`:

```sh
export PATH=/tmp/rfc5128-composition-corepack:/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
COMPOSITION_PROOF_REPO=/Users/zackjackson/Documents/Codex/2026-10-02/task-4/stack5140 COMPOSITION_PROOF_DIR=/Users/zackjackson/Documents/Codex/2026-10-02/task-4/stack5140-composition-final-artifacts-7e1e276ac node stack5140/tools/repros/composition-copies/run.cjs
```

**29/29 installed-package cases passed** using a fresh proof directory at the exact final head. Setup's documented default build command runs normal Turbo caching: 15/15 tasks succeeded, all 15 cached from the previously verified build. No forced rebuild or skip-build toggle was used. Local aliases are installed offline and the final consumer install uses --offline --frozen-lockfile --ignore-scripts.

The proof includes compatible same-family composition, emitted shared non-null instance identity, one compose/kernel graph, conflicting custom families and targets in both orders, invalid slot shapes/versions and late mutations, mixed legacy/current all-opt-out behavior in both orders, current mixed opt-in/out full-runtime fallback, and incompatible old/current composition protocol diagnostics.

The standalone ContainerReferencePlugin A then opaque wrapped ModuleFederationPlugin B composedRuntime:true/no remotes cases pass forward, reverse and afterPlugins orders: errors=[], warnings=[], selectedAdapters=["remotes","share-scope"], one remotes adapter module. Dynamic remote imports compile; these tests do not fetch or execute those remotes.

Both installed current copies are version 2.9.2, with distinct real package roots. All four installed compiler-module SHA256 values equal the corresponding final stack5140 dist artifacts; exact paths and digests are in the manifest.

## Full suite attestation

At predecessor `0f6031e5dfdc53df6158b2fdb36ec13028484b8f`, these commands ran from stack5140:

```sh
corepack pnpm exec turbo run build --filter=@module-federation/enhanced --concurrency=4 --force
corepack pnpm --filter @module-federation/enhanced run test
corepack pnpm exec prettier --check packages/enhanced/src/lib/container/runtime/FederationCompositionPlugin.ts packages/enhanced/src/lib/container/ModuleFederationPlugin.ts packages/enhanced/test/compiler-unit/container/FederationCompositionPlugin.test.ts tools/repros/composition-copies
git diff --check
```

Build: 15/15 passed, zero cached. Full enhanced suite: **524 passed, one existing skip; 6/6 serial tests passed**. Scoped formatting and whitespace passed.

Those results apply to the final implementation: `git rev-parse HEAD:packages 0f6031e5dfdc53df6158b2fdb36ec13028484b8f:packages` returns `2867ab1a249e36a16487c0cd9c7422588f0ee789` for both. The entire packages tree, including code, tests, manifests and package dependencies, is identical. The only tracked change is two inserted/two deleted lines in tools/repros/composition-copies/setup.cjs, deriving the tarball name from package.json.version. This final fresh harness run verifies that correction. No additional full package test run was needed.

## Evidence and retained history

- stack5140-composition-final-manifest.json: final head, source hash, installed artifact digests, unchanged packages tree and suite attestation.
- stack5140-composition-final-installed-proof-7e1e276ac.log: final checked-in 29-case run.
- stack5140-composition-final-artifacts-7e1e276ac/results.json: literal outcomes, selected source and graph paths; emitted bundles and installed copies are adjacent.
- stack5140-composition-final-build.log, stack5140-composition-final-tests.log and stack5140-composition-final-format.log: full predecessor checks.
- stack5140-composition-final-installed-proof.log: retained original hardcoded 2.9.1 tarball filename ENOENT at package version 2.9.2.
- stack5140-composition-final-installed-proof-v2.log and stack5140-composition-final-artifacts-0f6031e5-v2/results.json: earlier corrected external-harness proof.
- stack5140-composition-final-manifest-0f6031e5.json and stack5140-composition-final-proof-report-0f6031e5.md: preserved prior source/harness provenance.

The sole suite skip remains the existing HoistContainerReferencesPlugin runtime-chunk test; no added tests were skipped. Root owns repository-wide formatting and stack publication. No unrelated app/metro E2E was run. No composition behavior or harness integration blockers remain.
