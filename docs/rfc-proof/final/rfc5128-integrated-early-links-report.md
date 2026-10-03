# RFC5128 integrated early-link validation

Completed 2026-10-03 with Node v24.15.0 and Corepack pnpm 10.28.0. The existing cache proof unit remains documented in [rfc5128-cache-proof-report.md](rfc5128-cache-proof-report.md). This report covers the integrated links after merging current main `8a9677f3e`; no push, topology update, settings change, or production source edit was performed.

## Exact heads and isolated setup

| Worktree          | Initial tested head                      | Final head                               |
| ----------------- | ---------------------------------------- | ---------------------------------------- |
| stack5135 / #5135 | e98a736f561717cbcaad4ba141418793802b8119 | 9b603b19acb4562e61d0a93f7bcc56b09d0bb7f1 |
| stack5137 / #5137 | c7a3099c9e7c124b510d9f59896f821bba25d07f | unchanged                                |
| stack5139 / #5139 | 100baf397e1eeb953c868dd69dd9abd27a1fc29f | unchanged                                |

All final worktrees are clean. Read the current AGENTS.md in each (same SHA-256 `ef33a366bcfadbe019601bfb2f65850bacf1e3b8eb53de87e129ee9ee6290d6c`). Each worktree has its own frozen filtered install and freshly forced dependency builds; no cross-worktree node_modules or dist symlink was used. Existing Puppeteer skipped-install-script notice was preserved. Build output included existing Node declaration bundling warnings; all 17 dependency tasks nevertheless completed successfully.

Every command below used:

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
```

Run from the named worktree directory under this task root. Install commands used `corepack enable` before `corepack pnpm install`.

## #5135 runtime and cache

```sh
corepack pnpm install --frozen-lockfile --filter @module-federation/runtime...
corepack pnpm exec turbo run build --filter=@module-federation/runtime... --concurrency=2 --force
corepack pnpm --filter @module-federation/runtime-core exec rstest
corepack pnpm --filter @module-federation/sdk run test --runInBand
RFC5128_CACHE_WORKTREE=$PWD node ../rfc5128-cache-proof.mjs
RFC5128_CACHE_WORKTREE=$PWD node ../rfc5128-integrated-node-proof.mjs
corepack pnpm --filter @module-federation/runtime exec rstest
```

Results: build 4/4 tasks; runtime-core 18 files / 176 passed / 0 skipped; SDK 10 suites / 70 passed / 1 existing skipped (71 total); VM built-runtime proof 11 passed; actual Node SDK built-runtime proof 12 passed, both 0 skipped. The SDK skip is the preexisting `xit('should reuse an existing link element if one exists')` in `packages/sdk/__tests__/dom.spec.ts:370`.

The first full runtime run failed 2 of 96 tests (`loader fetch hooks`, `loaderEntry hooks`) because a prior test retained the fixture's `@loader-hooks/app2` global, reaching the explicit browser custom-evaluator isolation refusal. Both independent controls passed:

```sh
corepack pnpm --filter @module-federation/runtime exec rstest __tests__/hooks.spec.ts --testNamePattern 'loader fetch hooks'
corepack pnpm --filter @module-federation/runtime exec rstest __tests__/hooks.spec.ts --testNamePattern 'loaderEntry hooks'
```

Each isolated control had 1 pass and 3 explicitly filtered skips. Parent authorized the identical cleanup already used by runtime-core. Commit `9b603b19acb4562e61d0a93f7bcc56b09d0bb7f1` changes only `packages/runtime/__tests__/hooks.spec.ts`, adding two beforeEach lines:

```ts
Reflect.deleteProperty(globalThis, '@loader-hooks/app2');
Reflect.deleteProperty(globalThis, '@loader-hooks/app3');
```

The full runtime rerun passed all 13 files / 96 tests / 0 skips. Changed-file Prettier and `git diff --check` passed. Commit command was `HUSKY=0 git commit -m 'test(runtime): reset hook fixture globals between cases'` after staging only that file; the repository-wide formatter's known filtered-install errors are recorded below. Root must propagate this test-only commit through later links; this agent did not mutate #5137/#5139.

## #5137 bundler runtime

```sh
corepack pnpm install --frozen-lockfile --filter @module-federation/webpack-bundler-runtime...
corepack pnpm exec turbo run build --filter=@module-federation/webpack-bundler-runtime... --concurrency=2 --force
corepack pnpm --filter @module-federation/webpack-bundler-runtime run test --runInBand
```

Results: build 5/5 tasks; 13 suites / 128 passed / 0 skipped. Includes composed runtime behavior, legacy controls, import boundaries, and consumer type checks.

## #5139 Node and esbuild

```sh
corepack pnpm install --frozen-lockfile --filter @module-federation/node... --filter @module-federation/esbuild...
corepack pnpm exec turbo run build --filter=@module-federation/node... --filter=@module-federation/esbuild... --concurrency=2 --force
corepack pnpm --filter @module-federation/node run test --runInBand
corepack pnpm --filter @module-federation/esbuild run test
corepack pnpm --filter @module-federation/esbuild exec jest --config jest.config.js --runInBand
```

Results: build 17/17 tasks; Node 3 suites / 59 passed / 0 skipped; esbuild Node-test integration 1 passed / 0 skipped; esbuild generated-container Jest 1 suite / 2 passed / 0 skipped. The separate Jest invocation is necessary because the esbuild package test script selects only `__tests__/*.spec.mjs`.

The actual esbuild integration fixture uses a temporary absWorkingDir different from process.cwd(), verifies the generated remote entry and manifest under that project, checks shared dependency version `1.2.3`, and asserts no stray manifest at the process directory. The Jest cases execute composed and legacy generated containers and check their exposed result.

## Formatting limits and evidence

In each worktree, `corepack pnpm exec prettier --check .` exited 2, reporting errors in 389 unrelated Next application files because their Tailwind config requires `@tailwindcss/typography`, omitted by the authorized filtered install. This global formatting check is incomplete; do not report it as passing. The changed runtime fixture passes `corepack pnpm exec prettier --check packages/runtime/__tests__/hooks.spec.ts`.

Read-only navigation used Ripwire v0.6.5 at `ripwire-tool/build/ripwire` for bundler/esbuild package navigation and `packages/runtime-core --uses=getRemoteEntryUniqueKey --limit=8`. Initial corrected CLI/path lookup errors did not modify source.

All commands preserved fail-closed process exit status. Rstest local fixture servers and SDK tests ran with the authorized sandbox escalation. Evidence logs and the exact cleanup patch are in [rfc5128-integrated-early-links-evidence](rfc5128-integrated-early-links-evidence/). The first red runtime log is retained alongside the passing rerun. These integrated checks validate the stated cases; they do not independently endorse every cache compatibility policy. Existing documented default-Node fetch-hook limitation and explicit browser same-global custom-evaluator refusal remain unchanged.

## Final propagated evaluator boundary validation (2026-10-03)

The parent propagated `fb97b4f1cd0aabbe43891d6eb8c1009669bce5ff` into the earliest #5135 link. Final validated/current heads:

| Link  | Exact head                               | Validation basis                                                                                                                                                            |
| ----- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #5135 | d3b926ef4110bd189bd1d2b7c8ad0fa1a365634c | Forced own build and full core/runtime/three built proofs rerun at this exact head                                                                                          |
| #5137 | ccaaa3854fb7d234356f3cbf9c781dc86ea64329 | Bundler package plus configuration hashes match previously tested c7a3099c9e7c124b510d9f59896f821bba25d07f; inherited runtime trees match finally tested #5135              |
| #5139 | 5dec45f2bcf7c22f0e76b69eb49c2eef708efdfb | Node/esbuild/bundler package plus configuration hashes match previously tested 100baf397e1eeb953c868dd69dd9abd27a1fc29f; inherited runtime trees match finally tested #5135 |

All three heads were checked clean after validation. This final followup made no checkout source edits, commits, pushes, or stack/head changes.

At #5135, using the previously installed own locked runtime dependencies:

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
corepack pnpm exec turbo run build --filter=@module-federation/runtime... --concurrency=2 --force
corepack pnpm --filter @module-federation/runtime-core exec rstest
corepack pnpm --filter @module-federation/runtime exec rstest
RFC5128_CACHE_WORKTREE=$PWD node ../rfc5128-cache-proof.mjs
RFC5128_CACHE_WORKTREE=$PWD node ../rfc5128-integrated-node-proof.mjs
RFC5128_CACHE_WORKTREE=$PWD node ../rfc5128-integrated-node-asymmetry-proof.mjs
corepack pnpm exec prettier --check packages/runtime-core/src/platform/node.ts packages/runtime-core/src/utils/load.ts packages/runtime-core/__tests__/platform-entry-cache.spec.ts packages/runtime/__tests__/hooks.spec.ts .changeset/node-default-evaluator-isolation.md
git diff --check
```

Results: forced build 4/4 successful, zero cached; core 18 files / 182 tests passed / 0 skipped; runtime 13 files / 96 tests passed / 0 skipped; VM 11 passed; actual Node SDK 12 passed; actual custom/default Node asymmetry 6 passed, all proof checks 0 skipped. Changed-file formatting and diff checks pass. The asymmetry adapter changes only artifact import paths to use RFC5128_CACHE_WORKTREE and is outside checkouts; assertions, actual SDK transport, and observer barrier are identical to the independently reviewed original proof.

Hash comparisons use SHA-256 of `git ls-tree -r <exact-ref> -- <paths>` output, which includes every tracked path and blob identity. The unchanged configurations include root package.json, pnpm lock/workspace files, turbo.json, tsconfig.base.json, jest.config.js, and AGENTS.md (where tracked). Each named unchanged package comparison includes all tracked source, tests, and package configuration.

Relative to each previously validated later-link baseline, the complete delta is exactly these five inherited files:

- `.changeset/node-default-evaluator-isolation.md` (new patch release note)
- `packages/runtime-core/src/platform/node.ts` (contextual default global-export guard)
- `packages/runtime-core/src/utils/load.ts` (accurate browser conflict comment)
- `packages/runtime-core/__tests__/platform-entry-cache.spec.ts` (six actual SDK regressions and controls)
- `packages/runtime/__tests__/hooks.spec.ts` (the previously proven two-line fixture cleanup)

The entire tracked runtime-core, runtime, SDK, and error-codes trees are identical across final #5135/#5137/#5139 heads. Exact hashes and changed-file before/after blob IDs are saved in `final-later-links-hash-comparison.json` and `final-runtime-scopes-equality.json` under the evidence directory. The changeset has no baseline blob because it is new.

Per the parent's scope, unchanged bundler128, Node59, esbuild absWorkingDir1 and composed-container2 suites were not rerun. Their original exact-head passing evidence remains above; reuse here is justified by package/config equality and direct final validation of the only changed runtime dependency. The SDK70pass/one-existing-xit result also remains prior evidence, not a newly run final-head suite. No final full-suite failure or new skip occurred.

Repository-wide formatting remains the previously demonstrated filtered-install infrastructure limitation (389 unrelated Next files missing @tailwindcss/typography), not a passing CI gate. It was not repeated in this final propagated-head followup because formatter configuration and dependency selection are unchanged; the new files were explicitly checked at #5135. No additional defects were found. Final commands preserve exit status, and Rstest uses the authorized local fixture-server escalation.

Final machine-readable CI facts: [rfc5128-integrated-early-links-ci-facts.json](rfc5128-integrated-early-links-ci-facts.json). Final logs have prefix `stack5135-final-` in the existing evidence directory.
