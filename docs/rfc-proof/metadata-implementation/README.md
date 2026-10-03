# RFC5128 immutable metadata implementation: final local proof

The reviewed alternative1 is implemented locally. Source and PR pushes remain held; this directory publishes reviewable patches and evidence only. The evidence branch has no open PR. Independent review and merge remain with the user. No source branch was pushed, PR merged, service deployed, or package published during this metadata phase; historical workflow-triggered previews in earlier phases remain recorded separately.

Focused source commit: `0d7a700b7469487d7347007e71825b24719296b7`, based on the previously reviewed external-kernel fix `7aca6f70d415d110dd5419ace5b4c6a566c902c9`. Final minor: `abc32180ce7820bbd784b6fc3b90cf1dbacfe1a6`. Final major: `3cf6ff1050089c8bd500ab044653116ee2f22b23`. [All seven clean local stack heads and preserved ancestry](source-manifest.json). RFC5036 ancestry and registry layout are unchanged; no new shared protocol, handler cast replacement, or no-op capability was introduced.

## Reviewable source

- [Isolated full patch](isolated-runtime-image.patch), [zero-context patch](isolated-runtime-image-U0.patch): descriptor/parser/helper APIs, runtime admission, injector timing, compiler profile/guards, bounded bundler carry-forward, tests and changeset.
- [Minor integration patch](minor-runtime-image.patch), [zero-context version](minor-runtime-image-U0.patch), against prior minor head `7af25cdb9243eb8556d18ec451fce9973b6a0cfb`.
- [Major integration patch](major-runtime-image.patch), [zero-context version](major-runtime-image-U0.patch), against prior major head `9a5c81b05ae0ab16f7858fa877ab3073e48b218b`.

All six patches passed reverse-apply checks against their exact final local worktrees. For zero-context patches use `git apply --unidiff-zero`. [Focused file hashes](isolated-source-provenance.json), [isolated report](isolated-implementation-report.md), and [independent source/API review](independent-review.md) provide attribution.

The parser retains an immutable copied v1 descriptor and three copied/frozen arrays. It preserves the existing unions: provider available∪required covers request required∪available; request forbidden excludes the provider union. Both absent remains **UNCHECKED**; one absent warns and remains **UNCHECKED**. Supplied malformed metadata and known incompatibilities reject. Metadata-bearing old cores lacking the API raise a named minimum-contract error.

Default/global external admission reads the actual provider slots and validates before root/kernel namespace dereference. New helpers are projected from the real namespace; none are fabricated. Metadata-aware injector publication uses the existing init hook after beforeInit metadata admission; minor tagged constructors defer their initial global SHARE publication until admission. Untagged minor timing remains unchanged. Major retains its existing final-id init-hook SHARE timing. A real later malformed hook initially changed provider slots before rejecting; the corrected actual compiled and independent built controls preserve both slot identities, registry identities/contents, and share state. This is metadata admission ordering, not a promise to roll back arbitrary plugin side effects. [Original lean failing observation](logs/publication-order-before-summary.log), [actual built controls](review-probes/).

## Compiler derivation limits

Opt-in profiles require explicit caller ABI/entry-loader guarantees, an explicit web/node runtime target, and known built-in Rspack external/provide implementations. Minor derives retained families from its actual disable defines, captures that snapshot once, and emits matching defines. Major external/provide selects the full legacy facade: required/available are shared, remote, snapshot and platform; forbidden is empty. Historical disable flags cannot advertise omitted capabilities in that facade.

Major's existing tentative composition planner reads a flag and target before discarding its plan for legacy mode. The changing-getter regression independently proves emitted legacy target/image retain the first admitted node value. Two test counter assumptions were corrected; their failing logs are preserved. No planner redesign or build-id change was needed.

Opaque/custom runtime plugins or implementations, composed profile selection, and Enhanced compiler profiles have named unsupported derivation errors. Unknown requirements are not represented by an empty set. Metadata-aware non-global externalsType has a precise unsupported transport boundary. Actual untagged CommonJS preserves the real default/namespace and an extra user export; other transport implementations are unverified. Explicit web profiles are accepted by derivation, but browser execution is unverified. ABI/loader identity is supplied as a guarantee, not inferred from package version or function shape.

## Final checks

Node24.15.0 and pnpm10.28.0. Forced builds of Rspack + Enhanced and their dependencies passed **15/15 per tip, zero cache hits**. Full repository Prettier passed both tips. Tests:

| Suite                   |          Minor |          Major |  Skips |
| ----------------------- | -------------: | -------------: | -----: |
| runtime-core            |            201 |            201 |      0 |
| runtime                 |            101 |            102 |      0 |
| webpack-bundler-runtime |            129 |            131 |      0 |
| injector                |              2 |              2 |      0 |
| Rspack                  |  37 / 7 suites |  41 / 7 suites |      0 |
| Enhanced main           | 525 / 40 files | 530 / 40 files | 1 each |
| Enhanced serial         |              6 |              6 |      0 |

Enhanced's existing skip is `HoistContainerReferencesPlugin.test.ts:376`, “should hoist container runtime modules into the single runtime chunk when using remotes with federationRuntimeOriginModule.” Sandbox attempts at Rspack's localhost fixture stalled and were interrupted; approved reruns passed. [Runtime suite heads/commands](runtime-suite-report.md), [machine facts](runtime-suite-facts.json), [all final logs and retained counter failures](logs/).

Major builds and unchanged package/Enhanced suites ran at `acf69e8e6ae37bcc23bef4d91395f6e12f795b8a`; only two Rspack fixture assertions/comments changed afterward. Production package/config trees and dist hashes are identical. Rspack, formatting, compiler matrices, and packed source/artifact audit ran at the final `3cf6ff105...` head. These precise scopes are recorded rather than claiming every command executed after the test-only commits.

Standalone actual Rspack2.1.10,1.7.9,1.5.8 matrices passed on each final tip: **72 successful compiled graphs and 266 fresh startup processes**. Each current-version run has12 graphs/47 processes, each older-version run12/43. These counts exclude the expected unsupported-transport compiler rejection attempt. Every external graph has zero core modules; providers/standalone producers retain41. Actual constructors, shared identity/literal, file-container literal, and SDK data-URL remote literal execute. Direct root and kernel admission, malformed publications/own inputs/hook outputs, ABI/target/loader/capability/forbidden mismatches, real old APIs, preserved state, and untagged transport are covered. Absence rows explicitly say unchecked. The major disabled-snapshot row correctly succeeds as a full image; the independent direct forbidden UserOptions row still rejects. [Exact graph/process summaries](compiled-matrix.json), [graphs and every startup row](compiled/).

Final actual packed graphs: **60 PASS gates, 2 expected readonly compile rejections, zero failures/skips**, plus14 independent package audits covering987 emitted files. Gate counts include packing, extraction, and source-map checks. Strict .mts/.cts/combined consumers pass without skipLibCheck or suppression; readonly negatives are exactly7TS2540+3TS2339 per graph. Actual ESM/CJS exported APIs, immutable copies, namespace identities, legacy shared literals and same-instance reuse pass. Genuine old7aca bare ESM/CJS metadata admission rejects before state mutation while untagged reuse works. Old94 is a compiled external-root control only; it publishes no Node kernel entry. [Packed report, exact commands and tar hashes](packed/final-proof-report.md), [portable evidence hashes](packed/final-evidence-hashes.json).

## Exact root commands and remaining scope

From each final stack directory, with Node24 bin first in PATH:

```sh
pnpm exec turbo run build --filter=@module-federation/rspack --filter=@module-federation/enhanced --force
pnpm --filter @module-federation/rspack test
pnpm exec prettier --check .
corepack pnpm --filter @module-federation/runtime-core exec rstest run
corepack pnpm --filter @module-federation/runtime exec rstest run
corepack pnpm --filter @module-federation/webpack-bundler-runtime run test --runInBand
corepack pnpm --filter @module-federation/inject-external-runtime-core-plugin run test --runInBand
corepack pnpm --filter @module-federation/enhanced run test
```

Compiler commands, from each stack:

```sh
TASK=/Users/zackjackson/Documents/Codex/2026-10-02/task-4
# Major only: export PROOF_LEGACY_FULL=1; minor leaves it absent.
PROOF_OLD_KERNEL_CORE_PATH=$TASK/rfc5128-external-kernel/packages/runtime-core/dist/index.cjs \
PROOF_OLD_KERNEL_PROVIDER_PATH=$TASK/rfc5128-external-kernel-proof/fixed/out/provider.cjs \
PROOF_OLD_CORE_PATH=$TASK/packed-enhanced-bootstrap/compilers/old/node_modules/@module-federation/runtime-core/dist/index.cjs \
node packages/rspack/__tests__/external-runtime-fixture/metadata-probe.mjs build "$TASK/metadata-stack514X-actual-2.1"
PROOF_RSPACK_CORE_PATH=$TASK/stack5141/node_modules/.pnpm/@rspack+core@1.7.9_@swc+helpers@0.5.23/node_modules/@rspack/core \
node packages/rspack/__tests__/external-runtime-fixture/metadata-probe.mjs build "$TASK/metadata-stack514X-actual-1.7"
PROOF_RSPACK_CORE_PATH=$TASK/stack5141/node_modules/.pnpm/@rspack+core@1.5.8_@emnapi+core@1.11.3_@emnapi+runtime@1.11.3_@swc+helpers@0.5.17/node_modules/@rspack/core \
node packages/rspack/__tests__/external-runtime-fixture/metadata-probe.mjs build "$TASK/metadata-stack514X-actual-1.5"
```

`514X` is5141 for minor and5142 for major. The old kernel source/provider artifacts were preserved unchanged, not rebuilt against the new API. Exact packed commands are in its linked report. Ripwire0.6.5 navigated repository source and resolved Rspack node_modules, alongside targeted reads; no global install/settings change.

This is focused local evidence, not full workspace/app/Metro E2E or remote CI. Vite8, browser external-runtime execution, arbitrary/custom transport compatibility and original unrebuilt RFC compiler heads remain UNRUN. RFC5036's pre-existing4TS2403 combined-consumer failure and2TS2322 whole-core source check remain recorded in the separate5036 report; the new5128 strict packed program passes without modifying those globals/signatures. #5180 remote CodeQL findings remain unverified/uncleared. Original handler contract refactor remains the independent documented proposal/test branch; PR5143's minimal real loadEntry hook is preserved. No Open Tap or unrelated original worktree changes were made.

Evidence-only Markdown formatting initially failed because the ledger checkout has no Prettier dependency; invoking pnpm outside a project also selected the wrong pnpm version. The corrected check used the existing Node24/pnpm10.28 tools from stack5141, with no install or settings change, and passed. Exact setup failures and the passing scoped format output are retained in logs.
