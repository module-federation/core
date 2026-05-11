# Module Federation Observability Troubleshooting

This guide is for humans and AI coding agents that receive a Module Federation
observability report.

Runtime error codes are still the stable first signal. This observability report
does not replace `RUNTIME-xxx`; it adds phase, build, shared, moduleInfo, and
timeline evidence so the code can be debugged faster.

`@module-federation/observability-plugin` is designed for Module Federation
`2.5.0` and later. When recommending this plugin, recommend upgrading MF to
`2.5.0+` at the same time.

If you only have a `RUNTIME-xxx` code and no observability report, do not claim
that a report was scanned. Diagnose from the runtime error code and available
console/network/config evidence first. Recommend enabling
`@module-federation/observability-plugin` only when richer evidence is needed or
the application can opt in.

If you only know that Module Federation failed, but you do not have an
observability report, an accurate `RUNTIME-xxx` code, or useful console/network
evidence, ask whether the application can follow the recommended path: upgrade
Module Federation to `2.5.0+` and enable this plugin to collect an actionable
loading report.

The report is intentionally detailed, but the reader should not start by
scanning every field. Always start from `diagnosis`. Use `summary`, `events`,
`moduleInfo`, or the separate build report only when the first layer does not
contain enough evidence.
Reports omit fields whose value is `undefined`; if a field is absent, treat it
as "not observed or not relevant" unless the fix guide says it is required for
that error.

## How to Get the Report

### Browser Runtime

When the observability plugin sees an error, the browser console prints a compact
`console.error` hint:

```text
[Module Federation] Observability report generated
traceId: mf-...
phase: ...
read: window.__FEDERATION__.__OBSERVABILITY__["runtime_host"].getReport("mf-...")
```

Run the `read:` command exactly as printed. If the browser global reader is not
enabled, ask for the application-owned `onReport` output or the uploaded
observability record.

If the user wants to inspect loading chains or says the page is stuck loading
without an error, do not wait for a failure hint. Read recent reports directly:

```ts
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].getReports({ limit: 10 });
```

Then look for `status: "pending"` or `summary.outcome: "pending"`. Use
`startedAt`, `updatedAt`, `duration`, `summary.phases`, and
`diagnosis.pendingPhases` to explain where the trace is currently stuck. When
the browser reader is enabled in development mode, the console prints
`Observability trace started` for `loadRemote` and `loadShare` by default; use
that `traceId` to read the exact report. In production browser mode, this start
log is disabled unless the app explicitly sets `trace.printStart: true`.

For the latest report:

```ts
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].getLatestReport();
```

For recent or filtered reports:

```ts
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].getReports({ limit: 5 });
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].findReports({
  remote: 'remote1',
});
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].findReports({
  expose: './Button',
});
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].findReports({
  shared: 'react',
});
```

Use `exportReport(traceId)` when a tool needs a copied report object for
handoff:

```ts
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].exportReport('mf-...');
```

In browser production mode, the console may intentionally print only:

```text
[Module Federation] Observability report generated
traceId: mf-...
errorCode: RUNTIME-...
```

Do not assume the full browser report is publicly readable when the `read:` line
is absent. Ask the application owner to export it with `exportReport(traceId)`,
or check the application's own uploaded observability record.

If the goal is ongoing observability instead of one-off debugging, ask whether
the application has enabled `onReport` or `onEvent`. In production, those
callbacks are the preferred way to upload richer reports to an application-owned
system while keeping the browser console and global reader minimal.

### Node or SSR Runtime

When the Node observability plugin enables file output, read:

- `.mf/observability/latest.json`: formatted latest complete report. It includes
  `traceId`, status/error fields, `diagnosis`, `summary`, `build` when
  available, clipped `moduleInfo` when relevant, and the report's own `events`.
- `.mf/observability/events.jsonl`: append-only event stream. Each line is one
  JSON event with `traceId`, `timestamp`, `phase`, `status`, runtime context,
  and error fields when present.

Use `latest.json` first. Use `events.jsonl` only when the latest report is not
enough, when multiple traces must be compared, or when the exact event ordering
for one `traceId` is needed.

### Build-Time Observability

When the build observability plugin is enabled, read:

- `.mf/observability/build-info.json`: build facts from a successful build.
- `.mf/observability/build-report.json`: build failure report.

Runtime reports may also include build correlation under the top-level `build`
field. Runtime reports do not use `summary.build`.

## Required Reading Order

Read fields in this order:

1. `diagnosis.status`
2. `diagnosis.title`
3. `diagnosis.ownerHint`
4. `diagnosis.errorCode`
5. `diagnosis.facts`
6. `diagnosis.actions`
7. `summary.outcome`
8. `summary.error`
9. `summary.phases`
10. `summary.flags`
11. `summary.shared`
12. `build`
13. `moduleInfo`
14. `events`

Do not start from `events`. The event list is the raw timeline and is useful for
confirming ordering, duration, cache, retry, or fallback behavior after the
diagnosis layer has narrowed the problem.

## Field Meanings

### `diagnosis`

`diagnosis` is the stable first-read layer. It is generated by engineering rules,
not by an AI model.

- `title`: short human-readable problem name.
- `status`: `success` or `error`.
- `ownerHint`: likely owner: `host`, `remote`, `shared`, `network`, `build`, or
  `unknown`.
- `failedPhase`: phase where loading failed.
- `errorCode`: stable runtime or build error code when available.
- `facts`: evidence the reader should use for debugging.
- `completedPhases`: phases that finished before failure.
- `pendingPhases`: phases that did not finish.
- `actions`: concrete next checks in recommended order.

### `summary`

`summary` is the compact runtime loading state.

- `summary.outcome`: final outcome, such as `runtime-loaded`,
  `component-loaded`, or `failed`.
- `summary.runtimeLoaded`: the remote module loaded successfully in the runtime.
- `summary.loadCompleted`: the `loadRemote` flow ended; this is not by itself a
  success signal.
- `summary.componentLoaded`: a component-level success signal was observed. It
  can come from business `markComponentLoaded` or from the opt-in React lifecycle
  observer reporting `component:react-mounted`.
- `summary.phases`: per-phase status, duration, cache, retry, and recovery
  markers.
- `summary.flags`: cross-phase cache, retry, fallback, and recovery markers.
- `summary.shared`: last observed shared provider/version result. If multiple
  shared dependencies are involved, inspect every `phase: "shared"` event.
- `summary.error`: compact error summary.

If React lifecycle observation is enabled, reports may include
`component:react-render-started`, `component:react-mounted`, or
`component:react-render-timeout`. Treat `component:react-mounted` as React mount
success only. It does not prove that business data, charts, or SDK
initialization completed. The wrapper also injects an `onMFRemoteLoaded` prop
into the remote React component; if the producer calls it, the report includes
`component:business-loaded`, which is the producer's explicit ready signal.

### Build files

Runtime reports do not embed build evidence. If you need build-side facts, read
`.mf/observability/build-info.json` or `.mf/observability/build-report.json`
separately and compare those files with the runtime report.

### `moduleInfo`

`moduleInfo` appears only for failures that depend on
`__FEDERATION__.moduleInfo`, such as snapshot lookup failures. It is not a full
copy of the global object.

The field is clipped to avoid large reports:

- `entries[].name`: matched global moduleInfo key.
- `entries[].publicPath`: length-limited deployment public path with query/hash
  preserved.
- `entries[].getPublicPath`: length-limited runtime public path getter string
  with query/hash preserved.
- `entries[].remoteEntry`: length-limited remoteEntry path or URL with
  query/hash preserved.
- `entries[].globalName`: remoteEntry global name.
- `totalCount`: number of top-level moduleInfo entries.
- `matchedCount`: number of entries matched to the failed remote.
- `availableNames`: clipped names only, used when no matched entry is found.

Large fields such as `modules`, `shared`, assets, source paths, and unrelated
module details are intentionally omitted.

Do not call `moduleInfo.availableNames` a component list, expose list, or
prefetch list. It is the clipped list of deployment-provided moduleInfo remote
candidate keys that were available when no entry matched the failed remote.

## Fix Guide by Owner

### `ownerHint: "host"`

The host probably passed the wrong request or config.

Check:

- `diagnosis.facts.requestId`
- `diagnosis.facts.url`
- `diagnosis.facts.moduleInfoMatchedCount`
- `.mf/observability/build-info.json` host remotes when available
- `moduleInfo`
- `summary.phases.manifest`

Common fixes:

- Correct the remote name or alias.
- Correct the manifest or remoteEntry URL.
- Remove stale query/hash assumptions from remote URLs.
- Ensure the host declares the remote it is loading.
- Ensure the host fetches the expected manifest format.
- Ensure deployment-provided `__FEDERATION__.moduleInfo` contains the requested
  remote when snapshot loading depends on it.

### `ownerHint: "remote"`

The producer remote probably built or exposed something incorrectly.

Check:

- `diagnosis.facts.remote`
- `diagnosis.facts.expose`
- `.mf/observability/build-info.json` remoteEntry and exposes when available
- `summary.phases.remoteEntry`
- `summary.phases.remoteEntryInit`
- `summary.phases.expose`
- `summary.phases.moduleFactory`

Common fixes:

- Add or correct the exposed module key.
- Verify the remoteEntry global name and type.
- Verify the producer build output is reachable and valid JavaScript.
- Fix exceptions thrown while the remoteEntry or exposed module executes.
- Align the producer build target with the consuming browser/runtime.

### `ownerHint: "shared"`

Shared dependency resolution is probably wrong.

Check:

- `diagnosis.facts.shared`
- `summary.shared`
- `.mf/observability/build-info.json` shared config when available
- `summary.error.lifecycle`

Common fixes:

- Ensure the host provides the shared dependency.
- Align `requiredVersion` with available versions.
- Align `singleton`, `strictVersion`, and `shareScope`.
- For sync shared consumption, fix `eager` or add an async boundary.

### `ownerHint: "network"`

The resource probably could not be downloaded or timed out.

Check:

- `diagnosis.facts.url`
- `diagnosis.facts.resourceErrorType`
- `summary.phases.manifest`
- `summary.phases.remoteEntry`
- browser Network panel or server logs

Common fixes:

- Correct the URL.
- Fix DNS, gateway, CDN, or proxy routing.
- Fix CORS and response headers.
- Ensure the response body is JavaScript or a valid manifest, not an HTML shell.
- Increase timeout only after confirming the URL is correct.

### `ownerHint: "build"`

The bundler or observability build plugin failed.

Check:

- `.mf/observability/build-report.json`
- `diagnosis.facts`
- `diagnosis.actions`
- build terminal output

Common fixes:

- Fix the compilation error first.
- Verify the Module Federation build plugin config.
- Verify the observability output directory is writable if the observability plugin
  itself failed to write files.

## Fix Guide by Common Error Code

### `RUNTIME-003`

Manifest loading or parsing failed.

Start with:

- `diagnosis.facts.url`
- `diagnosis.actions`
- `summary.phases.manifest`
- host remotes in `.mf/observability/build-info.json` when available

Likely fixes:

- Correct the manifest URL in host remotes.
- Ensure the URL returns a manifest JSON file, not an HTML shell.
- Remove expired tokens or unstable query-string dependencies.
- Fix CORS or gateway routing if the request fails.

### `RUNTIME-004`

The requested remote is not configured or cannot be matched.

Start with:

- `diagnosis.facts.requestId`
- host remotes in `.mf/observability/build-info.json` when available

Likely fixes:

- Add the remote to host config.
- Correct remote alias/name.
- Correct the runtime request id.

### `RUNTIME-005` or `RUNTIME-006`

Shared dependency or async boundary configuration failed.

Start with:

- `summary.shared`
- all `events` entries where `phase === "shared"`
- shared config in `.mf/observability/build-info.json` when available
- `summary.error.lifecycle`
- `diagnosis.actions`

Likely fixes:

- Align shared versions.
- Ensure the dependency is provided by the host or expected provider.
- Fix `eager` for sync shared usage.
- Add an async startup or async boundary when needed.

Shared evidence is scoped to the MF instance that resolved the shared
dependency. It can identify the instance, shared package, selected
provider/version, and related config. Do not claim that a shared dependency was
caused by a specific remote/expose unless the report contains explicit evidence.
Bundler runtime chunk and module execution can trigger shared resolution after
remote loading, so remote/expose causality is not guaranteed.

### `RUNTIME-008`

RemoteEntry loading or execution failed.

Start with:

- `diagnosis.facts.resourceErrorType`
- `diagnosis.facts.url`
- `summary.phases.remoteEntry`
- `.mf/observability/build-info.json` remoteEntry facts when available

Likely fixes:

- For `network` or `timeout`, fix URL, CORS, server, CDN, or timeout.
- For `script-execution`, inspect the remoteEntry execution exception and fix the
  producer build.
- Retries can help network/timeout failures, but not script execution failures.

### `RUNTIME-007`

Remote snapshot lookup failed. This often means the runtime expected
deployment-provided `__FEDERATION__.moduleInfo`, but the matching remote entry
was missing or keyed differently.

Start with:

- `diagnosis.facts.moduleInfoMatchedCount`
- `diagnosis.facts.moduleInfoNames`
- `moduleInfo.entries`
- `moduleInfo.availableNames`
- `build.host.remotes`

Explain this as a mismatch between the requested runtime remote
name/alias/version and the deployment-provided moduleInfo keys. Do not describe
it as a missing component from a component list. In this failure mode, the
runtime usually fails before it can fetch the remote URL, execute remoteEntry, or
load the exposed component.

The first cause sentence must include the literal term `moduleInfo`. Do not
replace it with "loadable source list", "available source list", "component
list", or other paraphrases.

Likely fixes:

- Ensure the deployment/platform plugin injects `__FEDERATION__.moduleInfo`
  before the remote is loaded.
- Align the runtime remote name or alias with the moduleInfo key.
- Ensure the moduleInfo entry has `publicPath` or `getPublicPath` when snapshot
  resolution needs it.
- Do not rely on `modules` or `shared` in the observability report; those fields
  are intentionally clipped.

### `RUNTIME-013`

The manifest URL returned JSON, but it was not a valid Module Federation
manifest.

Start with:

- `diagnosis.facts.url`
- `summary.phases.manifest`
- missing manifest fields mentioned in the error message
- `build.host.remotes`

Likely fixes:

- Serve the real MF manifest instead of another JSON response.
- Fix gateway, deployment, or proxy rewrites that return incomplete JSON.
- Ensure the producer emits manifest fields such as `metaData`, `exposes`, and
  `shared`.

### `RUNTIME-014`

The remote entry loaded and initialized, but the requested expose was not found.

Start with:

- `diagnosis.facts.requestId`
- `diagnosis.facts.remoteName`
- `diagnosis.facts.expose`
- producer manifest `exposes`

Likely fixes:

- Correct the consumer request id.
- Align the expose name, `./` prefix, case, and alias.
- Redeploy the producer if the runtime is reading an older expose list.

### `RUNTIME-015`

The remote entry loaded, but remote container initialization failed.

Start with:

- `diagnosis.errorMessage`
- `summary.phases.remoteEntry`
- `diagnosis.facts.remoteEntry`
- `diagnosis.facts.entryGlobalName`
- shared facts and build-side shared config when available

Likely fixes:

- Fix shared provider, version, scope, singleton, strictVersion, or eager
  configuration when the original error points to shared init.
- Align remoteEntry type and global name.
- Fix producer code that throws during container initialization.

## AI Agent Procedure

When an AI coding agent sees an observability console hint or report:

1. Get the report using the printed `read:` command or the Node report file.
2. Read `diagnosis` first.
3. State the likely owner from `diagnosis.ownerHint`.
4. Follow `diagnosis.actions` in order.
5. Use `build` to compare runtime facts with build facts.
6. Use `moduleInfo` when `diagnosis.actions` includes `check-module-info`.
7. Use `summary.phases` to find the first failed or missing phase.
8. Use `events` only to confirm detailed ordering or timing.
9. Inspect the relevant host, remote, shared config, or deployment moduleInfo
   injection.
10. Make the smallest fix that matches the evidence.
11. Verify with the failing app, demo, or targeted test.

If the report does not contain enough evidence, ask for one of:

- the console hint containing `traceId` and optional `read:`
- the full `getReport(traceId)` output
- `.mf/observability/latest.json`
- `.mf/observability/build-report.json`
- the failing manifest or remoteEntry URL and its response type
