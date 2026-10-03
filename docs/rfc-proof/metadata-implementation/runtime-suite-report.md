# Final metadata tips: cache-owner test verification

Verified 2026-10-03 with Node v24.15.0 and Corepack pnpm 10.28.0. This agent performed only tests and read-only verification: no source edits, builds, pushes, commits, new agents, or snapshot updates. Both worktrees are clean.

| Tip         | Initial verification head                | Final source-verification head           |
| ----------- | ---------------------------------------- | ---------------------------------------- |
| Minor #5141 | abc32180ce7820bbd784b6fc3b90cf1dbacfe1a6 | unchanged                                |
| Major #5142 | acf69e8e6ae37bcc23bef4d91395f6e12f795b8a | 3cf6ff1050089c8bd500ab044653116ee2f22b23 |

During verification the parent advanced the major tip through `89dc3d4397cf97e45afe82c60e6279f93786f7f0` to the final head above. The complete delta changes only `packages/rspack/__tests__/external-runtime-fixture/metadata-probe.mjs`, owned and separately tested by the parent. All four tested package trees, SDK/error-codes dependency trees, and root package/lock/workspace/Turbo/TypeScript/Jest/AGENTS configuration remain byte-identical between initial and final major heads. SHA-256 values derived from exact tracked tree/blob listings are recorded in the facts JSON. These unchanged package gates therefore apply to the final major head; no repeated run was necessary.

Commands ran from each respective stack5141/stack5142 directory:

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
node --version
corepack pnpm --version
corepack pnpm --filter @module-federation/runtime-core exec rstest run
corepack pnpm --filter @module-federation/runtime exec rstest run
corepack pnpm --filter @module-federation/webpack-bundler-runtime run test --runInBand
corepack pnpm --filter @module-federation/inject-external-runtime-core-plugin run test --runInBand
git rev-parse HEAD
git status --short
```

Full output is saved in the eight requested task-root `metadata-stack514X-{core,runtime,wbr,injector}-tests.log` files. Each command captured and returned its actual exit code. All eight suite commands exited 0. No retries or overwritten failure logs.

| Suite                               | Minor #5141            | Major #5142            | Skipped |
| ----------------------------------- | ---------------------- | ---------------------- | ------- |
| runtime-core                        | 19 files / 201 passed  | 19 files / 201 passed  | 0       |
| runtime                             | 15 files / 101 passed  | 15 files / 102 passed  | 0       |
| webpack-bundler-runtime             | 14 suites / 129 passed | 14 suites / 131 passed | 0       |
| inject-external-runtime-core-plugin | 1 suite / 2 passed     | 1 suite / 2 passed     | 0       |

Minor total: 433 passed. Major total: 436 passed. Unexpected test failures and skips: 0. Rstest reports zero snapshots added, updated, removed, unmatched, or unchecked; Jest reports zero snapshots. The injector tests execute built ESM and CJS entries with beforeInit; its script deliberately enables experimental VM modules and prints the expected Node experimental warning. Bundler logs retain expected console output from sharing-failure negative tests, whose assertions pass.

Rstest and injector fixture execution used parent-authorized ephemeral-listener escalation. No builds ran. Initial read-only injector lookup used an incorrect package path, corrected to `packages/runtime-plugins/inject-external-runtime-core-plugin` before testing. Report-generation guards detected the parent's two major head advances; these were bookkeeping stops, not test failures, and the final report explicitly verifies scope equality. No tests were omitted or filtered out.

Rspack/format checks belong to root, and Enhanced checks to the composition owner; this report makes no claim about those separately owned gates. [Machine-readable counts, heads, and hashes](runtime-suite-facts.json).
