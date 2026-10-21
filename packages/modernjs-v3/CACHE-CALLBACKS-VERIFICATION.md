# Producer messages and Service cache: integration verification

The recorded [HTTP, browser and processing counts](verification-evidence/service-producer-20261021.json) accompany this report.

Verified on 2026-10-21 for [MF #5201](https://github.com/module-federation/core/pull/5201), stacked on [the framework callbacks in #5200](https://github.com/module-federation/core/pull/5200) and using [Modern #9002](https://github.com/web-infra-dev/modern.js/pull/9002). These are draft, unpublished changes.

## Implemented boundary

The Modern Node provider adapts the existing raw `renderStream` callback to `BridgeSSRMessageResult`. It frames HTML, isolates React update scripts, and emits `ready` after the complete shell and initial snapshot are available. Business callbacks keep their signature. The Service handler accepts this prepared result, or adapts a raw callback inside the producer service. Already prepared results are not parsed a second time.

`mf-bridge-service/2` carries complete HTML strings and explicit readiness/data/completion records as NDJSON. The producer cache stores the successfully completed wire transcript. A hit skips the provider, loaders, framing, marker checks and script rewriting. The SSR compositor and CSR forwarding middleware consume these messages without reparsing producer HTML. The SSR Host still processes its own document stream. Browser insertion, CSS/module readiness and hydration remain browser work.

The wire protocol rejects v1 raw-byte responses, invalid readiness order and incomplete transcripts. Producers and consumers must upgrade together. Cached render identities, React prefixes, revisions, headers and nonces remain exact-match inputs. Replay never changes embedded IDs to manufacture cross-instance hits. HTTP `Cache-Control: no-store` remains separate from the enabled in-process render cache.

## Actual Service App

The production weekend Service App in `code.byted.org/zhanghang.heal/mf-sdc`, branch `feat/bridge-renderer-callbacks`, ran four separate processes on ports 4950–4953: SSR Host, producer service, CSR Host and business API. The producer loaded its real MF Node expose and Modern renderer. Its loaders fetched the business API. The provider uses React 18.3.1 with its existing UTF-8 patch; the Hosts use React 19.2.8. No test renderer, replacement HTML or hydration-data stub was used.

The final frozen runtime was followed by a cold production build. An intermediate validation start overlapped a dependency rebuild and failed to load a config export. The final runs were repeated after the runtime stopped changing; no application workaround was added. Three application typechecks, three existing Node tests and all four production application builds passed.

Twelve HTTP requests passed, covering progressive and complete miss/hit pairs, header and route isolation, cancellation, and retry after cancellation. Hits replayed byte-identical transcripts with zero new renderer calls or business API fetches. Failed or cancelled output did not become a cache hit. In the progressive pair, first HTML arrived at 145 ms on the miss and 5 ms on the hit. Featured/recommended content arrived at 854/2351 ms on the miss. These are single local observations with deliberate 700/2200 ms API delays, not a performance comparison with the previous architecture.

## Actual browser streaming and hydration

Chrome 149 was controlled through `byted-browser`. Each path opened two fresh documents with identical render inputs. The observer correlated the service request hash with `x-mf-bridge-cache`, renderer calls and loader requests. The browser probe captured the original button before hydration, checked content visibility, and exercised the actual plan counter, note field and both detail dialogs.

| Path | Cache miss | Cache hit |
| --- | --- | --- |
| SSR Host, progressive hydration | Shell DOM inserted at 111 ms, counter interactive at 201 ms. Featured content visible at 1481 ms and interactive at 1521 ms while the stream was incomplete. Recommended content visible at 5080 ms. | Shell DOM inserted at 73 ms, counter interactive at 197 ms. |
| CSR Host, complete hydration | Shell DOM inserted at 406 ms, featured content visible at 1842 ms. Recommended content visible at 5440 ms, counter interactive at 5480 ms after final data arrived. | Shell DOM inserted at 347 ms, counter interactive at 428 ms. |

All four documents retained the captured DOM, passed real interactions and preserved note/counter state. Browser error lists were empty and no CSR recovery navigation occurred. CSR Host still streams visible HTML before completion, but hydrates after the final snapshot. Cached replay keeps message order without reproducing the original delays. Browser timings include intentional 1400/5000 ms API delays and are not production latency claims.

### Processing location

V8 precise coverage observed the real compiled producer expose, including functions renamed by bundling. CommonJS import hooks alone missed that code, so their zero counters were not used to claim absence of parsing. Coverage was sampled separately for each cache miss and hit.

| Process | Miss | Hit |
| --- | --- | --- |
| Producer, each browser path | `htmlFrames`: 1, `containsShellMarker`: 5, `isolateReactStreamScripts`: 9 | All three: 0, renderer: 0, business fetches: 0 |
| SSR Host | Its own `hostPieces`: 1, framer: 1, script isolation: 1. Producer normalizer/marker checks: 0 | Same Host-only work |
| CSR forwarding server | Producer framing, marker checks and script isolation: 0 | All remain 0 |

The remaining Host-only work is required to compose its own document. JSON decoding, protocol/size validation, scheduling, browser template parsing and hydration are not eliminated.

## Independent flush experiment

Sixteen actual renderer scenarios used the installed React 18.3.1 and 19.2.8 in development and production: ordinary fragments, nested Suspense with 30 KB Chinese content and backpressure, full HTML documents, and aborts. The backpressure scenarios produced six `write()` calls returning false per render.

Observed fragment flushes had no open elements. React 19 full-document output still had open `html` and `body` elements at its first flush. This disproves treating every React `destination.flush()` as a closed HTML unit. The samples do not prove correctness for every application fragment, renderer version, error path or browser insertion context. The production implementation retains the HTML framer and does not use `flush()` as a boundary.

## Package checks

Commands run from the MF worktree with Node 24.18.1 and pnpm 10.28.0:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/modern-js-v3 --output-logs=errors-only
pnpm --filter @module-federation/bridge-react run test
pnpm --filter @module-federation/modern-js-v3 run test
pnpm --filter @module-federation/modern-js-v3 run test src/bridge-stream/client-service.server.spec.ts src/bridge-stream/executor.server.spec.ts src/ssr-runtime/bridgeStreamPlugin.spec.ts src/bridge-stream/service-cache-react.spec.tsx
pnpm --filter @module-federation/modern-js-v3 exec rstest src/bridge-stream/producer.server.spec.ts src/bridge-stream/service-http.spec.ts src/bridge-stream/application.spec.ts src/rspack/index.spec.ts
pnpm exec turbo run test --filter=@module-federation/modern-js --filter=@module-federation/modern-js-v3 --concurrency=20 --output-logs=errors-only
pnpm exec tsc --noEmit -p packages/modernjs-v3/tsconfig.json
pnpm exec prettier --check .
git diff --check
```

Build: 20 successful tasks. Final Modern workflow: 23 successful tasks, including 166 modern-js-v3 tests in 19 files. Bridge React: 67 Jest and 11 Rstest tests. Targeted producer/HTTP/entry tests: 48 passed; targeted consumer/cache/React tests: 31 passed. TypeScript and repository formatting passed. Tests cover delayed snapshot readiness, complete HTML units, script isolation, mutable queued data, cancellation, byte limits, malformed message order, exact cache replay and real React hydration without DOM replacement.

The following were run from `packages/modernjs-v3` against the actual demo installations:

```bash
node tests/bridge-platform-build.cjs /Users/bytedance/personal/mf-x-bridge-service-ssr/apps/provider /Users/bytedance/personal/mf-x-bridge-service-ssr/apps/host-ssr
node tests/progressive-hydration.cjs /Users/bytedance/personal/mf-x-bridge-service-ssr/apps/provider /Users/bytedance/personal/mf-x-bridge-service-ssr/apps/host-ssr
```

The six React 18/19 import/require/CSR build scenarios and eight progressive scenarios passed. The latter cover reversed completion, deferred errors, cancellation, CSR and Service miss/hit. Three independent roots retain early interaction and receive six updates. A hit leaves renderer calls at three and loader calls at `[2, 1]`. The platform build test covers Host lifecycle selection; the actual Service App additionally verifies the new producer wrapper in its compiled Node expose.

The minor changeset includes bridge-react and modern-js-v3. Release planning was checked with the bundled Python runtime because the helper requires Python 3.10+:

```bash
/Users/bytedance/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 .codex/skills/changeset-pr/scripts/inspect_changeset_scope.py --base origin/feat/bridge-renderer-callbacks --file .changeset/quiet-pandas-cache.md
/Users/bytedance/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --output /private/tmp/producer-messages-changeset-status.json
```

Repeatable demo probes and their command record are retained in `/Users/bytedance/personal/mf-x-bridge-service-ssr/PRODUCER-MESSAGES-VERIFICATION.md`. Raw HTTP/browser/coverage/flush evidence is in `/private/tmp/service-app-producer-validation`. Observers delegate to the actual application and do not change render inputs or returned HTML.

## Scope not verified

The full monorepo/Metro/legacy-manifest E2E matrices were not run because the changed path is covered by the matching Modern workflow and real Service App. The older standalone `stream-react-versions.cjs` was not repeated because its low-level functions were unchanged and the integration matrices above exercise the modified path. No second browser harness was run alongside `byted-browser`. Other browser/React versions, production proxies, compression and sustained load remain unverified. `maxBufferedBytes` limits pending messages, not all renderer/parser process memory. No merge, release or deployment was performed.
