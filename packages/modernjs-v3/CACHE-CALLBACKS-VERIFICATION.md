# Service cache and framework callbacks: integration verification

The `feat/ssr-fragment-cache` branch combines the callback provider from [#5200](https://github.com/module-federation/core/pull/5200) with the render cache in [#5201](https://github.com/module-federation/core/pull/5201). It uses [Modern #9002](https://github.com/web-infra-dev/modern.js/pull/9002), without a new Modern renderer. The cache PR is stacked on the callback PR. These are draft, unpublished changes.

The producer exports `createBridgeComponent({ rootComponent, render, hydrate, renderStream })`. Its HTTP middleware enables `cache: { maxAgeMs: 60_000 }`. On a miss, the actual Modern root and loaders render while the service records the outgoing transcript. On a hit, the service skips the provider and replays the completed transcript. React HTML, IDs and opaque Modern snapshots are not rewritten. The consumer's stable render identity allows reuse, while its browser delivery session remains independent.

## Real Service App

Verified on 2026-10-19 using the production build of the weekend Service App in `code.byted.org/zhanghang.heal/mf-sdc`, branch `feat/bridge-renderer-callbacks`. Host SSR, producer, CSR Host and business API ran on separate localhost ports 4950–4953. The provider loads its real MF Node expose and calls the Modern callbacks. Its two route loaders fetch the actual business API. The producer uses React 18.3.1 with the demo's existing UTF-8 patch; the SSR Host uses React 19.2.8. This is not evidence for unpatched React 18 or a full browser/version matrix.

The opt-in `tests/observe-service-cache.cjs` records actual renderer calls, business fetches and the response cache header, correlated by the complete request-body hash. It observes the original reader and delegates all work. It does not provide a test renderer, change a request, remove headers or replace HTML. `tests/verify-service-cache.cjs` reads actual HTTP bytes and asserts the protocol and call counts.

Twelve HTTP requests passed:

- Progressive miss: shell at 81 ms, featured content at 789 ms and recommended content at 2288 ms, with one renderer call and two business fetches. The API delays were 700/2200 ms.
- Identical progressive hit: complete transcript at 7 ms, zero renderer calls and zero business fetches. The response was byte-for-byte identical to the completed miss.
- Complete-mode miss also streams HTML, then supplies its final snapshot. Its hit replayed the same transcript in 8 ms without rendering or loader requests.
- Changed request headers and city route inputs produce separate misses and subsequent hits. The real Shanghai and Hangzhou content remains distinct.
- Cancelling incomplete output prevents cache insertion. An identical retry misses, and only the successful completed retry becomes a hit.

The response retains HTTP `Cache-Control: no-store` while `x-mf-bridge-cache` reports the independent producer cache. Exact inputs, including forwarded headers, are part of the cache key. These timings are single-run local observations with intentional data delays, not production performance claims.

## Real browser hydration

Chrome 149 through Divebell loaded four fresh documents. Both members of each miss/hit pair produced the same service request hash. The second document did not trigger renderer or business API calls. The browser probe observes actual inserted DOM and performs ordinary application interactions; it does not create server markup or substitute hydration data.

| Path | Initial miss | Cache hit |
| --- | --- | --- |
| Initial-document progressive SSR | Shell visible at 241 ms. Plan counter responds at 342 ms and featured details at 1544 ms while `session.complete` is false. Recommended details respond at 5223 ms. | Plan counter responds at 266 ms, featured details at 306 ms and recommended details at 386 ms. The cached result does not reproduce the original delay. |
| CSR Host requesting complete-mode SSR | Shell visible at 434 ms. Interaction starts at 5497 ms after the final snapshot, as required by this path. | Plan counter responds at 703 ms. Final snapshot restoration and both detail dialogs work. |

All four documents retained the button captured before hydration. In the progressive miss, the plan count and typed note remained intact when later content arrived. All four documents also passed the plan, note and both detail-dialog interaction checks. No browser error or whole-page CSR recovery occurred. The complete-mode document has a fresh delivery session ID while using the same stable render identity, and therefore hits without reusing the previous document's session.

The probe and repeatable commands are retained as `tests/cache-callback-browser-probe.js` and `CACHE-CALLBACKS-VERIFICATION.md` in the demo. During setup, moving the local dependency link left an old Rspack persistent cache that mixed two worktree runtimes and caused RUNTIME-009. A cold production build removed the old paths. HTTP and browser results above are from that rebuilt output; no runtime initialization workaround was added.

## Commands and checks

MF integration checkout, Node 24.18.1 / pnpm 10.28.0:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/modern-js-v3 --output-logs=errors-only
pnpm --filter @module-federation/bridge-react run test
pnpm exec turbo run test --filter=@module-federation/modern-js --filter=@module-federation/modern-js-v3 --concurrency=20 --output-logs=errors-only
pnpm --filter @module-federation/modern-js-v3 run test src/bridge-stream/service-cache-react.spec.tsx
pnpm exec tsc --noEmit -p packages/modernjs-v3/tsconfig.json
pnpm exec prettier --check .
git diff --check
```

Build: 20 successful tasks. Modern workflow tests: 23 successful tasks, including 155 modern-js-v3 tests in 18 files. Bridge React: 67 Jest and 11 Rstest tests. The two cache/React regressions now enter through the actual public Bridge SSR and hydration callbacks, with real runtime hooks. They assert that complete and progressive hits skip both hooks and rendering, preserve props and exact bytes, and hydrate separate roots without replacing DOM or sharing state.

The existing minor changeset for `@module-federation/modern-js-v3` remains the cache release note. Scope was checked against `origin/feat/bridge-renderer-callbacks`, and Changesets release planning succeeded. The helper scripts require Python 3.10 or later; this machine's default Python 3.9 failed before executing the scope check, so both checks were rerun with the bundled Python runtime:

```bash
/Users/bytedance/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 .codex/skills/changeset-pr/scripts/inspect_changeset_scope.py --base origin/feat/bridge-renderer-callbacks --file .changeset/quiet-pandas-cache.md
/Users/bytedance/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --output /private/tmp/cache-callback-changeset-status.json
```

Service demo checkout:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm run build
NODE_OPTIONS='--require /Users/bytedance/personal/mf-x-bridge-service-ssr/tests/observe-service-cache.cjs' MF_SERVICE_TRACE_LOG=/private/tmp/service-cache-observer.ndjson pnpm start
# In another terminal:
MF_SERVICE_TRACE_LOG=/private/tmp/service-cache-observer.ndjson pnpm run verify:service-cache
```

All three application typechecks, three existing Node tests and four production application builds passed. Browser runs used `divebell setup`, fresh `divebell raw --session ... --init-script tests/cache-callback-browser-probe.js open <url>` calls, then `wait`, `eval`, `console` and `screenshot`. Exact URLs, evidence and commands are in the demo record.

The full monorepo, Metro and legacy manifest E2E matrices were not run because this change concerns the Bridge callback/cache path. The matching Modern package workflow ran directly through Turbo, as required for worktrees. Playwright was not run alongside Divebell; the real production Service App was checked in Chrome. Production proxy behavior, load testing and other browser/React versions remain unverified. No merge, release or production deployment was performed.
