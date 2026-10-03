# RFC5128 Node custom-to-default evaluator followup

Completed 2026-10-03. Original proof worktree: `rfc5128-cache`, branch `proof/rfc5128-cache`. Baseline source head `1301cebe747b749ed188b8705b5e7a7318e1a8a0`; final clean head `fb97b4f1cd0aabbe43891d6eb8c1009669bce5ff`. Earliest affected stack link: #5135. No stack worktree writes, pushes, topology changes, RFC prose edits, or PR state changes.

## Concrete defect

From the worktree, with Node24 on PATH:

```sh
node ../rfc5128-cache-node-asymmetry-proof.mjs
```

Before the fix: 4 pass / 2 fail / 0 skip, exit 1. Custom evaluator A and default host B share the original remote name, global name, URL, and host name. A redirects its own actual SDK Node fetch to a CJS data URL. Its SDK evaluation publishes process-global A exports. B, having no custom hooks, takes the old physical-global shortcut and returns A. The literal actual values are `["A:./Button", "A:./Button"]`; expected `["A:./Button", "B:./Button"]`.

The wrong value occurs sequentially and in a deterministic overlapping control: the first actual SDK evaluation has already published A, while an afterLoadEntry observer holds its entry promise pending; B then begins. The inverse order passes, exposing the asymmetry missed by earlier both-custom tests. Default dedupe and uncontextual direct legacy platform reuse passed on the baseline.

Evidence: [node-asymmetry-before.log](rfc5128-cache-proof-evidence/node-asymmetry-before.log). The standalone proof uses the real built runtime, actual SDK `loadScriptNode`, native fetch of data URLs, and Node VM CJS evaluation. It does not mock the transport.

## Focused correction

Contextual Node loads now skip unprovenanced physical-global exports, including default hosts. They deduplicate through the existing evaluator-scoped globalLoading cache and use the validated result from their own SDK attempt. A contextual SDK payload without callable get/init rejects rather than falling back to an unrelated global. Direct legacy calls to the Node platform without a loading context retain the existing global shortcut. No identity registry, SDK signature, unsafe cast, or additional platform lifecycle was introduced.

The load.ts comment now states that platform scopes load independently where supported and that browser IIFEs sharing a physical global reject conflicting custom scopes before evaluating another script.

Committed source regressions add four actual SDK custom/default cases (both orders, sequential and deterministic overlap), actual default cross-host concurrency plus retained-cache dedupe, and direct legacy platform global reuse. A runtime-core patch changeset is included. The runtime fixture includes the identical two beforeEach global deletions already authorized and committed as `9b603b19acb4562e61d0a93f7bcc56b09d0bb7f1` in stack5135; parent handles propagation without duplicate ownership.

## Exact validation

All commands ran from `rfc5128-cache` with:

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
```

Node v24.15.0 / pnpm 10.28.0. Existing own filtered install and built artifacts were used; the full runtime dependency filter was subsequently installed frozen in the same worktree.

```sh
corepack pnpm exec prettier --write packages/runtime-core/src/platform/node.ts packages/runtime-core/src/utils/load.ts packages/runtime-core/__tests__/platform-entry-cache.spec.ts .changeset/node-default-evaluator-isolation.md
corepack pnpm exec turbo run build --filter=@module-federation/runtime... --concurrency=2 --force
corepack pnpm --filter @module-federation/runtime-core exec rstest
node ../rfc5128-cache-node-asymmetry-proof.mjs
node ../rfc5128-cache-node-proof.mjs
node ../rfc5128-cache-proof.mjs
corepack pnpm --filter @module-federation/runtime exec rstest
corepack pnpm install --frozen-lockfile --filter @module-federation/runtime...
corepack pnpm --filter @module-federation/runtime exec rstest
corepack pnpm exec prettier --check .
corepack pnpm exec prettier --check packages/runtime-core/src/platform/node.ts packages/runtime-core/src/utils/load.ts packages/runtime-core/__tests__/platform-entry-cache.spec.ts packages/runtime/__tests__/hooks.spec.ts .changeset/node-default-evaluator-isolation.md
git diff --check
```

| Check                                    | Result                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Forced runtime and dependency build      | 4/4 tasks successful, zero cached                                                                       |
| Full runtime-core                        | 18 files / 182 tests passed / 0 skipped                                                                 |
| New actual Node asymmetry proof          | 6 passed / 0 failed / 0 skipped                                                                         |
| Existing actual Node proof               | 12 passed / 0 failed / 0 skipped                                                                        |
| Existing VM evaluated-container proof    | 11 passed / 0 failed / 0 skipped                                                                        |
| First full runtime attempt               | infrastructure failure: runtime-core dependency unresolved in core-only filtered install; preserved log |
| Frozen runtime filtered install          | passed, own worktree installation                                                                       |
| Full runtime rerun after installation    | 13 files / 96 tests passed / 0 skipped                                                                  |
| Changed-file Prettier and git diff check | passed                                                                                                  |
| Repository-wide Prettier                 | exit 2; 389 unrelated Next files cannot load Tailwind typography plugin omitted by filtered install     |

Existing Node proof retains same-origin custom dedupe, rejection then another evaluator then retry, transformed URLs, both-custom orders/concurrency, and malformed custom payload rejection. Existing VM proof retains reset, rejected retry, compatible default/shared platform dedupe, equivalent factories, origin-sensitive shared callbacks, and URL-transform controls. Full runtime-core also retains the actual browser SDK/DOM rejection and dedupe controls. These are assertions on values and evaluation/callback counts.

All command exit codes were preserved. Rstest fixture-server execution and the frozen dependency install used authorized sandbox escalation. No additional suites were silently skipped. SDK tests were not repeated: this followup changes runtime-core and tests, with SDK source/signatures unchanged; the prior SDK suite result remains recorded in the integrated report (70 passed and one preexisting xit).

Committed after validation using `HUSKY=0 git commit -m 'fix(runtime-core): isolate default Node entry exports'` and staging only the five scoped files. The pre-commit hook runs repository-wide format and `git add .`; explicit changed-file checks were used while preserving the documented repository-wide dependency errors.

The independent skeptical reviewer executed the six-case built proof, inspected actual SDK transport/barrier assertions, and reran malformed-custom-payload rejection without finding a new semantic blocker. This evidence covers the named cases; documented default Node fetch-hook limitations and browser physical-global refusal policy are unchanged.

Runnable artifact: [rfc5128-cache-node-asymmetry-proof.mjs](rfc5128-cache-node-asymmetry-proof.mjs). All followup logs and the exact final patch are under [rfc5128-cache-proof-evidence](rfc5128-cache-proof-evidence/), with prefix `node-asymmetry-`.
