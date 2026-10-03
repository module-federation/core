# RFC5128 evaluated entry cache proof

Worktree: `/Users/zackjackson/Documents/Codex/2026-10-02/task-4/rfc5128-cache`, branch `proof/rfc5128-cache`.

Baseline PR5141 live head: `84cee419c5c7dc2bb87d1a92cd7fb8e15e409aec`.
Earliest affected stack link: **PR5135**, kernel/platform composition introduced by `8fc7ade879fede70747ea50c5759eca3c3c9e37b`. The name+URL cache predates composition, but composition makes different entry evaluator implementations explicitly injectable.

Local fix commit: `10566aafc4cec87eabdd971c10bc51890410394f` (`fix(runtime-core): scope evaluated entry cache to evaluator`). No pushes, merges, RFC prose edits, or settings changes.

## Concrete reproduced defect

On the unchanged baseline production sources, new `entry-evaluator-cache.spec.ts` read an actual fixture file, executed it using Node VM under two evaluator contexts, and loaded exposed modules through `FederationKernel.loadRemote`.

Baseline command, from the worktree:

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
corepack pnpm --filter @module-federation/runtime-core exec rstest __tests__/entry-evaluator-cache.spec.ts
```

Result: **8 tests; 5 failed, 3 passed, 0 skipped**. Saved original output: `rfc5128-cache-proof-evidence/rfc5128-cache-red.log`.

- A then B: actual `['A:./Button', 'A:./Button']`; expected `['A:./Button', 'B:./Button']`.
- B then A: actual `['B:./Button', 'B:./Button']`; expected `['B:./Button', 'A:./Button']`.
- Both orders fail under concurrent loading as well.
- A rejected evaluator, followed by a successful different evaluator, returns the different evaluator's container on retry (`other:./Button` instead of `retry:./Button`).
- Compatible same-platform sequential/concurrent dedupe and reset controls pass on baseline.

These are wrong exposed module values, not a function-reference comparison or inference from source. The first four tests bypass no runtime cache logic and invoke each evaluator through the runtime's real composed platform.

## Focused fix and identity policy

Production change is in `src/global.ts`, `src/utils/load.ts`, and one remote invalidation call in `src/remote/index.ts`.

The cache suffix includes entry type/global name, a process-global platform object ID, platform `loadEntry` callback ID, `getEntryUrl` callback ID, and ordered IDs for `loadEntry`, `createScript`, `fetch`, and `loadEntryError` callbacks. A nonempty loading hook set additionally includes the origin's ID: identical callbacks can read different host state. `afterLoadEntry` observer callbacks do not partition entries.

Supported compatibility policy:

| Input boundary                                                                              | Behavior                                                                                                                     |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Same explicitly reused Platform object, unchanged loading callback, no custom loading hooks | Cross-host entries share a successful/inflight promise.                                                                      |
| Separate default ModuleFederation hosts                                                     | Built-in platform identity is shared; entry evaluates once.                                                                  |
| Same host and callback set, concurrent requests                                             | Deduplicates.                                                                                                                |
| Identical custom loading callback on different hosts                                        | Both hosts load successfully using isolated entries; no compatibility exception is introduced.                               |
| Distinct platform objects or equivalent callback factories                                  | Both remain supported; each evaluates independently. Function inequality is not classified as semantic incompatibility.      |
| Different createScript/fetch callbacks or host-dependent entry hooks                        | Isolated entries, with literal exposed-value checks.                                                                         |
| Same host and source URL, different getEntryUrl callbacks                                   | Isolated transformed entries; repeated identical transform callback deduplicates.                                            |
| Changed platform callback / changed loading listener set                                    | New evaluator key; previous entry is not borrowed.                                                                           |
| Legacy base-key cache entry without identity                                                | Composed loads evaluate under an identified key instead of borrowing the unknown entry.                                      |
| Federation reset                                                                            | Loading promises clear; identity registry/counter survives so pre-reset work cannot collide with newly allocated identities. |

A reused Platform object is an explicit provider compatibility boundary; the runtime does not prove arbitrary evaluator semantic equivalence. Providers with different stateful evaluators should supply different platform objects. Same-host container/module cache behavior after an already initialized module is outside this entry-cache change.

The one-argument `getRemoteEntryUniqueKey(remoteInfo)` retains the historical base-key shape. Internal loading and removal pass the origin; retry hooks receive the actual scoped `uniqueKey` and global cache record. Existing retry promise-identity cleanup tests remain intact. An existing diagnostics test previously relied on a custom entry callback on only one host being silently borrowed by another; it now uses an explicitly shared platform and observer-only plugins to verify compatible cross-host result observation.

## Executable evidence

Committed regression: `packages/runtime-core/__tests__/entry-evaluator-cache.spec.ts` (22 tests), two actual JS fixture entries, existing retry tests, and patch changeset `.changeset/calm-entries-evaluate.md`.

Standalone built-runtime proof: `rfc5128-cache-proof.mjs` in the task root. It imports the built kernel, remote capability and cache implementation, reads the real fixture, executes VM evaluators, loads exposes and asserts fixed expected outputs/evaluation counts. No test framework mocks are used. It runs all cases and returns nonzero when any assertion fails.

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
node ../rfc5128-cache-proof.mjs
```

Final result: **11 passed, 0 failed, 0 skipped**, process exit **0**, in `rfc5128-cache-proof-evidence/rfc5128-cache-built-proof-final.log`.

`rfc5128-cache-proof-baseline.mjs` is a runnable baseline adapter: it reads the exact baseline `utils/load.ts` through `git show`, transpiles it with only the relative ESM extension adaptation, temporarily replaces the ignored built cache module, runs the same proof, and restores the fixed artifact in `finally`. All other built runtime modules remain unchanged.

```sh
node ../rfc5128-cache-proof-baseline.mjs
```

Result: **3 passed, 8 failed, 0 skipped**, exit **1**, saved as `rfc5128-cache-proof-evidence/rfc5128-cache-baseline-runner.log`. Seven failures assert wrong module values; the eighth checks the newly supported independent-evaluator evaluation-count policy for equivalent factories (baseline output values for that case are correct). This adapter is supplementary evidence; the original 5-failure Rstest reproduction used unchanged baseline production source, without replacing artifacts. The fixed standalone proof was rerun after the adapter and again passed 11/11.

## Commands and validation

All commands used Node `v24.15.0` and pnpm `10.28.0`. Commands below run from the isolated worktree unless stated otherwise.

1. `corepack enable` then `corepack pnpm install --frozen-lockfile --filter @module-federation/runtime-core...`: succeeded; lockfile unchanged. Three selected workspace packages, 2280 locked packages; root lifecycle scripts also executed. Puppeteer install script was ignored by pnpm's existing policy and is irrelevant to these Node proofs.
2. `corepack pnpm exec turbo run build --filter=@module-federation/runtime-core... --force`: baseline build succeeded, **3/3 tasks** (`sdk`, `error-codes`, `runtime-core`).
3. Initial sandboxed `corepack pnpm --filter @module-federation/runtime-core exec rstest __tests__/entry-evaluator-cache.spec.ts`: infrastructure failure before tests, `listen EPERM ::1:3000`. Rerun with allowed loopback escalation produced the concrete **5 failures/3 passes** above. This was not a test skip.
4. Intermediate `corepack pnpm --filter @module-federation/runtime-core exec rstest __tests__/entry-evaluator-cache.spec.ts __tests__/load.spec.ts`: initially **29 passed/1 timed-out** because the legacy diagnostics test assumed custom evaluator reuse by a host without that evaluator. After correcting its compatibility setup, **38 passed/0 failed/0 skipped** for that intermediate 16-case regression version. Host-scope and transformation cases were added afterward.
5. Final `corepack pnpm --filter @module-federation/runtime-core exec rstest`: **17 files, 160 tests passed, 0 failed, 0 skipped, 0 snapshot changes**. Output: `rfc5128-cache-proof-evidence/rfc5128-cache-runtime-all.log`.
6. Final `corepack pnpm exec turbo run build --filter=@module-federation/runtime-core... --force`: **3/3 tasks passed**, including TypeScript declaration generation. Output: `rfc5128-cache-proof-evidence/rfc5128-cache-build-final.log`.
7. `corepack pnpm exec prettier --check .`: attempted the mandatory repository format gate; failed in **389 unrelated Next app files** because the runtime-only filtered install lacks `@tailwindcss/typography` referenced by their Tailwind configs. No unrelated files were edited. Full output: `rfc5128-cache-proof-evidence/rfc5128-cache-prettier.log`.
8. `corepack pnpm exec prettier --write packages/runtime-core/src/global.ts packages/runtime-core/src/utils/load.ts packages/runtime-core/src/remote/index.ts packages/runtime-core/__tests__/entry-evaluator-cache.spec.ts packages/runtime-core/__tests__/load.spec.ts packages/runtime-core/__tests__/resources/load/evaluator-entry.js packages/runtime-core/__tests__/resources/load/default-cache-entry.js`: changed files formatted.
9. `corepack pnpm exec prettier --check packages/runtime-core/src/global.ts packages/runtime-core/src/utils/load.ts packages/runtime-core/src/remote/index.ts packages/runtime-core/__tests__/entry-evaluator-cache.spec.ts packages/runtime-core/__tests__/load.spec.ts packages/runtime-core/__tests__/resources/load/evaluator-entry.js packages/runtime-core/__tests__/resources/load/default-cache-entry.js`: passed.
10. `git diff --check`: passed. `git status --short` after local commit: clean.
11. `HUSKY=0 git commit -m 'fix(runtime-core): scope evaluated entry cache to evaluator' -m 'Attribute this focused cache regression to RFC5128 stack link #5135. Isolate custom loading hooks per host, retain compatible platform deduplication, and preserve rejected-entry retry cleanup.'`: created the local commit above. Hooks were bypassed because this worktree's hooks format and stage the entire repository; relevant checks were run explicitly.

Skipped expected checks: no runtime-core tests skipped. Repository-wide builds/tests, optional lint, browser E2E, and other package suites were not run: this patch affects evaluated entry cache scoping only and has a complete runtime-core suite plus actual built Node runtime proof. The mandatory global format gate was attempted and remains an unrelated filtered-dependency blocker, with changed-file formatting passing. No release/publish actions were run.

## Parent handoff

Review the actual commit diff and rerun `node ../rfc5128-cache-proof.mjs`. Apply the focused commit to **#5135** first, then propagate through the stack using the parent's topology workflow. The child has not pushed or edited RFC prose. Registry/key shape is private global implementation detail; distinct evaluator inputs can increase evaluation count intentionally rather than silently alias containers.

# Actual default platform followup — supersedes the initial handoff

The initial VM-based proof was insufficient to declare default platform isolation complete. Parent-directed followup found a second concrete cache layer leak in the actual Node platform. Do not push the first commit alone.

Followup local commit: **`1301cebe747b749ed188b8705b5e7a7318e1a8a0`**, `fix(runtime-core): isolate concrete platform entry exports`. Apply with prerequisite `10566aafc4cec87eabdd971c10bc51890410394f`, attributing the runtime-owned platform fix to #5135. Both commits remain local; worktree is clean.

## Actual Node reproduction

At the first local commit, before followup production changes, the actual built `platform/node` + SDK `loadScriptNode` fetched native data URLs, executed CJS remote containers in Node VM, and loaded their exposed factories through `FederationKernel.loadRemote`.

```sh
export PATH=/Users/zackjackson/.nvm/versions/node/v24.15.0/bin:$PATH
node ../rfc5128-cache-node-proof.mjs
```

Initial one-case proof: expected `['A:./Button', 'B:./Button']`, actual `['A:./Button', 'A:./Button']`; A hook called once, B hook never called. Exit 1. Original output preserved as `rfc5128-cache-proof-evidence/rfc5128-cache-node-red.log`.

The expanded runnable Node proof has **12 checks**. Exact pre-followup Node implementation replay returned **2 passed / 10 failed / 0 skipped**, exit 1: nine assertions show wrong exposed module values across transform/retry/global paths; the tenth checks the new explicit invalid-payload error, while baseline already rejects later with `TypeError: remoteEntryExports.get is not a function`. The two compatible dedupe controls pass. Output: `rfc5128-cache-proof-evidence/rfc5128-cache-node-suite-red.log`.

`rfc5128-cache-node-proof-baseline.mjs` reads exact commit `10566aafc...` Node platform source, transpiles it with relative ESM extension adaptation, replaces only the ignored built Node platform module, runs the actual SDK proof, and restores it in `finally`. This adapter can rerun the expanded before check. The initial wrong-value reproduction above used untouched built production artifacts.

## Node production correction

- A custom evaluator context (loading hooks or `getEntryUrl`) bypasses the process-global export shortcut.
- Apply `getEntryUrl` to the entry URL before the SDK loader. Actual Node tests previously got `original:./Button` instead of the requested transformed A/B module.
- Retain each SDK attempt's actual returned exports instead of discarding them and reading a process-global container that another concurrent load can overwrite.
- The SDK's existing `Promise<void>` declaration is inaccurate: its callback resolves the evaluated exports. At this external boundary, `.then((loaded: unknown) => ...)` checks non-null object/function plus callable `get` and `init`, then returns the narrowed container. No casts or SDK signature changes conceal the mismatch. Invalid custom payloads throw a named validation error.
- Default loaders retain their existing global shortcut. Actual Node default cross-host and same-origin custom concurrency controls still dedupe.

The Node proof after the fix: **12 passed / 0 failed / 0 skipped**, exit 0, rerun after baseline restoration. Output: `rfc5128-cache-proof-evidence/rfc5128-cache-node-green-final.log`.

## Browser IIFE supported boundary

Different custom evaluator scopes cannot safely use one physical browser global name. The web platform records the owning entry context and pending status before script injection. A conflicting custom scope is refused with **`Unsupported browser global entry isolation`**, before the second evaluator hook/script runs. A custom scope also refuses a preexisting unowned global instead of borrowing unknown exports. Owners remain recorded while physical exports exist; failed loads without exports release ownership. If a global is removed and its owner is no longer pending, a new scope may claim it. This avoids speculative serialization or sandbox redesign.

Supported and verified:

- Both A/B orders, sequential and concurrent: first IIFE returns its literal expected A/B module; second conflicting scope rejects with the named boundary, hook invocation count zero, one script evaluation.
- Same custom host concurrently: one evaluation, both callers receive the correct module.
- Separate default hosts: one evaluation and correct module for both.
- Distinct physical global names: custom A/B loaders both succeed with distinct literal values, as the error's guidance promises.
- Preexisting unknown physical global: custom load refuses before executing its hook.

`platform-entry-cache.spec.ts` invokes actual Node SDK loading and actual browser `web.loadEntry` / SDK DOM script creation. Browser fixture responses use the repository's existing script test harness, reading and evaluating actual JS fixture files; this is not a browser app/network end-to-end claim. No serialization or mocked platform substitute implements the isolation assertion.

## Followup exact commands and counts

1. `corepack pnpm --filter @module-federation/runtime-core exec rstest __tests__/platform-entry-cache.spec.ts`: initial followup version **14/14 passed**, 0 skipped.
2. Replayed exact pre-followup Node/web source from `10566aafc...`, restoring both files in `finally`: the initial 14-case version produced **10 failed / 4 passed / 0 skipped**. Two Node concurrent cases happened to pass under that schedule; the standalone Node before proof independently fails both concurrent orders, demonstrating the schedule-sensitive global read race. All four browser conflict assertions fail on baseline.
3. Final reproducible before command `python3 ../rfc5128-cache-platform-baseline.py`: **16 cases; 11 failed / 5 passed / 0 skipped**, exit 1. It writes exact prior Node/web source temporarily, runs the real SDK/DOM regression, and restores sources in `finally`. Output: `rfc5128-cache-proof-evidence/rfc5128-cache-platform-tests-red-final.log`.
4. Intermediate full-suite run: **174 tests, 171 passed / 3 failed**, no skips. Existing `hooks.spec.ts` leaked `@loader-hooks/app2` and `@loader-hooks/app3` physical globals across tests while replacing evaluator hooks. Added two targeted `Reflect.deleteProperty` calls in its `beforeEach`; no assertions were weakened. Production isolation checks remain intact.
5. Final `corepack pnpm --filter @module-federation/runtime-core exec rstest`: **18 files, 176 tests passed, 0 failed, 0 skipped, 0 snapshot changes**. Output: `rfc5128-cache-proof-evidence/rfc5128-cache-runtime-platform-all.log`.
6. `corepack pnpm exec turbo run build --filter=@module-federation/runtime-core... --force`: **3/3 passed**, including declaration generation. Output: `rfc5128-cache-proof-evidence/rfc5128-cache-platform-build.log`.
7. `corepack pnpm exec prettier --check packages/runtime-core/src/global.ts packages/runtime-core/src/utils/load.ts packages/runtime-core/src/platform/node.ts packages/runtime-core/src/platform/web.ts packages/runtime-core/src/type/capability.ts packages/runtime-core/__tests__/platform-entry-cache.spec.ts packages/runtime-core/__tests__/hooks.spec.ts packages/runtime-core/__tests__/resources/load/browser-cache-A.js packages/runtime-core/__tests__/resources/load/browser-cache-B.js packages/runtime-core/__tests__/resources/load/browser-global-A.js packages/runtime-core/__tests__/resources/load/browser-global-B.js`: passed. The same paths were formatted with `prettier --write` as needed.
8. `git diff --check`: passed. `git status --short` after followup local commit: clean.
9. `HUSKY=0 git commit -m 'fix(runtime-core): isolate concrete platform entry exports' -m 'Follow up the evaluated entry cache proof for RFC5128 stack link #5135. Validate each Node SDK payload instead of reading another evaluator global; apply Node entry URL transforms. Refuse browser IIFE custom evaluator conflicts before a shared physical global can alias exports.'`: created followup commit above; scoped checks run explicitly as in initial handoff.
10. Post-restoration `node ../rfc5128-cache-node-proof.mjs`: **12/12 passed**, exit 0. `node ../rfc5128-cache-proof.mjs`: original built VM proof **11/11 passed**, exit 0. Both reports saved in evidence directory.

## Remaining limits and skipped checks

The original mandatory repository-wide format gate still has its previously recorded unrelated filtered-dependency blocker (389 Next app files require `@tailwindcss/typography`). Changed-file formatting passes. No runtime-core tests are skipped. SDK source/signatures remain unchanged, so SDK unit suites and other package suites were not rerun. Browser app E2E was not run; the actual browser DOM loader path is exercised by repository fixture tests. No pushes, topology changes, releases, or RFC prose edits occurred.

**Default Node fetch-hook propagation is an existing unsupported gap:** the Node platform does not forward runtime fetch hooks to the SDK, and the SDK's existing optional fetch helper assumes an incompatible lifecycle shape. This followup does not redesign that SDK path. The initial VM fetch-hook tests prove custom Platform fetch behavior only; they do not claim default Node fetch override support. Actual default Node proofs cover native fetch of data URLs through `createScript`/`getEntryUrl`, and expose the ignored-URL-transform bug directly.

## Actual SDK custom-to-default followup (2026-10-03)

A further asymmetric Node leak was reproduced on `1301cebe747b749ed188b8705b5e7a7318e1a8a0`: custom A followed by default B returned A twice, sequentially and while A remained pending. Focused commit `fb97b4f1cd0aabbe43891d6eb8c1009669bce5ff` fixes contextual default loads using their scoped cache and validated SDK result. Full core182/runtime96 and actual proof6+12+11 pass; forcedbuild4/4pass. Original source/check history above remains intact. See [exact followup report](rfc5128-cache-node-asymmetry-report.md) for commands, red evidence, resolved runtime install failure, formatting limitation, and controls. No pushes or stack writes.
