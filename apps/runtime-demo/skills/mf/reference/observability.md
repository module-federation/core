# Sub-skill: observability

Diagnose Module Federation loading reports produced by
`@module-federation/observability-plugin`.

Use this sub-skill when the user provides or mentions:

- an observability `traceId`
- a console line containing `Observability report generated`
- a Module Federation `console.error` observability hint
- a `read:` command
- `.mf/observability/latest.json`
- `.mf/observability/events.jsonl`
- `.mf/observability/build-info.json`
- `.mf/observability/build-report.json`
- a request to observe, debug, trace, inspect, or upload Module Federation
  loading data
- production telemetry hooks such as `onReport` or `onEvent`
- a report field such as `diagnosis`, `summary.phases`, `ownerHint`, or
  `moduleInfo`

## Error codes vs observability reports

Runtime error codes are still the stable first signal. The observability plugin
does not replace `RUNTIME-xxx`; it enriches the code with phase, moduleInfo,
shared, and timeline evidence. Build evidence is written separately by the
build observability plugin.

`@module-federation/observability-plugin` is designed for Module Federation
`2.5.0` and later. When recommending this plugin, recommend upgrading MF to
`2.5.0+` at the same time.

If the user only provides a `RUNTIME-xxx` code and no observability report, do not
claim that a scan or report was read. Use the official runtime troubleshooting
docs for the code, then recommend enabling `ObservabilityPlugin` when the current
evidence is too thin to identify the owner or exact phase.

If the app is not upgraded or does not use `@module-federation/observability-plugin`,
this skill still works in error-code mode: diagnose from the error code,
console text, URL, network evidence, and runtime/build config. Only ask for an
observability report when the plugin is actually enabled or the user can enable
it.

If the user only knows that MF failed, but has no observability report and no
accurate `RUNTIME-xxx` code or actionable console/network evidence, ask whether
they can follow the recommended path: upgrade Module Federation to `2.5.0+` and
enable `@module-federation/observability-plugin` to collect a report with loading
phase, owner, shared, and moduleInfo evidence. If build evidence is needed, ask
for the separate `.mf/observability/build-info.json` or
`.mf/observability/build-report.json` file.

## Step 1: Get the report

Prefer the most direct source available.

### Browser capability check

For a browser page, first try the least intrusive path:

1. open or inspect the target page
2. check whether the current agent/browser tool can evaluate JavaScript in the
   page context
3. if evaluation works, read
   `window.__FEDERATION__.__OBSERVABILITY__` directly and do not start the local
   collector

Use the local collector only when page-context evaluation is unavailable,
blocked, or unreliable. The collector is a fallback for agent environments that
can open a page but cannot execute `window.__FEDERATION__...` in that page.

### Local collector

If evaluation is unavailable and the project enables
`ObservabilityPlugin({ collector: true })` or
`collector: { enabled: true, port }`, start the lightweight collector before
opening the page.

Before starting the collector, check whether the configured port is available.
Use `17891` by default. If it is occupied, pick the next free local port
(`17892`, `17893`, ...), then tell the user to make the runtime plugin config
match that port:

```ts
ObservabilityPlugin({
  collector: {
    enabled: true,
    port: 17892,
  },
});
```

Start the collector with the selected port:

```bash
node skills/mf/scripts/observability-collector.js --port 17891
```

The collector listens only on `127.0.0.1`, receives browser reports from the
runtime plugin, and writes:

```text
.mf/observability/collector/latest-session.json
.mf/observability/collector/<sessionId>/events.jsonl
.mf/observability/collector/<sessionId>/latest.json
.mf/observability/collector/<sessionId>/latest-report.json
```

After opening the target page and reproducing the issue, read
`latest-report.json` first. If the page is still loading, read `latest.json` or
`events.jsonl` to inspect pending traces. Stop the collector process after the
analysis unless the user asks to keep collecting.

### Browser

If the console hint includes a `read:` line, execute that command exactly in the
browser console context:

```ts
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].getReport('mf-...');
```

If the user only has the latest browser report, use:

```ts
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].getLatestReport();
```

If the user wants to inspect loading chains, observe MF loading, or debug a page
that stays in loading state without an error or `traceId`, do not wait for a
console error. Read recent reports directly:

```ts
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].getReports({ limit: 10 });
```

Then look for reports with `status: "pending"` or
`summary.outcome: "pending"`. Use `startedAt`, `updatedAt`, `duration`,
`summary.phases`, and `diagnosis.pendingPhases` to explain which phase has
started, which phase has not completed, and how long the trace has been idle.
When the browser reader is enabled in development mode, the console prints
`Observability trace started` lines for `loadRemote` and `loadShare` by default;
use the printed `traceId` to read that exact report. In production browser mode,
these start logs are disabled unless the app explicitly sets
`trace.printStart: true`.

For recent or filtered browser reports, use:

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
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].exportReport('mf-...');
```

If the browser global is disabled, ask for the app's `onReport` output, uploaded
observability record, or the full report output pasted by the user.

If the browser console only contains `traceId` and `errorCode`, treat it as
production-safe output. Do not assume the full report is globally readable. Ask
for an explicit `exportReport(traceId)` output, the app's `onReport` output, or
the user's uploaded observability record.

### Node or SSR

Read `.mf/observability/latest.json` first. Use `.mf/observability/events.jsonl`
only if multiple traces or event ordering are needed.

`latest.json` is the formatted latest complete report. `events.jsonl` is an
append-only stream where each line is one runtime event with its own `traceId`,
`timestamp`, `phase`, `status`, context, and error fields when present.

### Build

Read `.mf/observability/build-report.json` for build failures and
`.mf/observability/build-info.json` for successful build facts.

## Step 2: Read fields in the required order

Do not start from `events`.

Reports omit `undefined` fields. Treat an absent optional field as "not observed
or not relevant" unless a specific failure guide says that field must be
present.

Read:

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

## Step 2.1: Decide loading success

Use `summary.outcome` before reading raw `events`:

- `runtime-loaded`: the remote module was loaded by Module Federation runtime.
- `component-loaded`: a component-level success signal was observed. This may be
  a business `markComponentLoaded` signal or the producer calling the injected
  `onMFRemoteLoaded` callback.
- `failed`: loading failed. Use `summary.error`, `diagnosis.actions`, and
  `failedPhase`.
- `recovered`: loading failed first, then a runtime fallback or recovery path
  returned a result.

For shared loading, `summary.outcome: "recovered"` can also mean the runtime
handled a custom shared-info miss. If `summary.phases.shared.status` is
`"complete"` and `shared.reason` is `"custom-share-info-unmatched"`, do not say
Module Federation loading failed. Say the build plugin supplied
`customShareInfo`, but no registered shared provider matched it, so the runtime
continued through its handled path. Ask the user to inspect shared config only
if they expected a specific provider/version to be selected.

The observability plugin cannot determine whether `@module-federation/retry-plugin`
itself succeeded. It records the Module Federation loading chain and final
resource result, not retry-plugin internal state. Do not infer retry success
only from URL changes, retry-plugin console lines, or the page eventually
rendering. If the user needs a retry success/failure judgment, ask them to add
their own evidence in retry-plugin hooks such as `onRetry`, `onSuccess`, and
`onError`, then read that output. Without those hook records or user-provided
retry events, say only that the remote eventually loaded.

Use `summary.loadCompleted` only as "the loadRemote flow ended"; it does not by
itself prove success. Use `summary.runtimeLoaded` for remote module success and
`summary.componentLoaded` for component-level success.

`summary.componentLoaded: false` is not by itself proof that the React component
failed to render. It only means no component-level ready signal was observed. If
`react.injectLoadedCallback: true` is enabled but `componentLoaded` is false:

1. first inspect the producer source, if available, and check whether the
   component receives and calls `props.onMFRemoteLoaded?.(...)`
2. if the producer source is available and the callback is not called, explain
   that the remote resource loaded but component readiness is unknown until the
   producer adds the callback
3. if the producer source is not available, ask the user whether the producer
   calls `onMFRemoteLoaded`; do not claim the component failed only because the
   flag is false
4. only conclude that the component failed when there is additional evidence,
   such as a React error, an error boundary state, a missing expected UI, or a
   producer/runtime error event

If `events` are needed, remote module success is usually:

- `phase: "loadRemote"`
- `status: "success"`
- `lifecycle: "onLoad"`
- `message: "remote:loaded"`

React callback injection is opt-in. It can inject an `onMFRemoteLoaded` prop
into the remote React component by returning a wrapper component. If the
producer calls that prop, treat the resulting `component:business-loaded` event
as the producer's own ready signal. Do not infer React mount success from this
plugin; it no longer observes React render lifecycle events. Because callback
injection changes the component reference, treat it as a temporary production
debugging switch and ask the user to remove it after the issue is fixed.

## Step 3: Decide the likely owner

Use `diagnosis.ownerHint` first:

- `host`: inspect host remotes, request id, manifest URL, and runtime call.
- `remote`: inspect producer exposes, remoteEntry type/global, and exposed module
  execution.
- `shared`: inspect host and remote shared config, selected provider, versions,
  shareScope, singleton, strictVersion, and eager.
- `network`: inspect URL reachability, CORS, status code, response body, timeout,
  CDN, gateway, or proxy.
- `build`: inspect build-report, bundler output, and observability output path.
- `unknown`: use `summary.phases` to find the first missing/error phase, then
  inspect `events`.

## Step 4: Follow diagnosis actions

Treat `diagnosis.actions` as the prioritized checklist. For each action:

1. inspect the referenced config or runtime fact
2. compare it with `diagnosis.facts`
3. compare it with `.mf/observability/build-info.json` when build evidence is needed
4. make the smallest code/config fix
5. verify with the failing app or targeted test

## Step 5: Use build evidence correctly

Runtime reports do not have `summary.build`.

Runtime reports also do not embed build facts. If build evidence is needed,
read `.mf/observability/build-info.json` or `.mf/observability/build-report.json`
as a separate file and compare it with the runtime report.

`moduleInfo` appears only for snapshot/moduleInfo dependent failures. It is a
clipped view of `__FEDERATION__.moduleInfo`, not a full dump. Use only:

- `entries[].name`
- `entries[].publicPath`
- `entries[].getPublicPath`
- `entries[].remoteEntry`
- `entries[].globalName`
- `totalCount`
- `matchedCount`
- `availableNames`

Large fields such as `modules`, `shared`, and assets are intentionally removed.
The `publicPath`, `getPublicPath`, and `remoteEntry` locator fields preserve
query/hash data and are only length-limited because deployment platforms often
use those values to route a module.

Do not describe `moduleInfo.availableNames` as a component list, expose list, or
prefetch list. It is the clipped list of deployment-provided moduleInfo remote
candidate keys that were available when no entry matched the failed remote.

## Step 6: Use runtime error codes as references

Runtime error codes are stable entry points, but this observability skill should
not act as a full `RUNTIME-xxx` troubleshooting manual.

When a report contains `diagnosis.errorCode`, `summary.error.errorCode`, or a
console `RUNTIME-xxx` code:

1. use the code to choose the relevant runtime troubleshooting document
2. use this report to confirm the actual phase, owner, request, remote, shared,
   `moduleInfo`, and timing evidence
3. avoid giving a fix based only on the code if report fields contradict it
4. if there is no observability report, ask for the report, trace id, browser
   reader output, Node report file, or enough console/network evidence

Keep the explanation centered on the report evidence. For code-specific
definitions and fixes, refer to the runtime troubleshooting docs instead of
duplicating that content here.

## Step 7: Final response shape

When reporting back, keep it concrete:

1. what report source was used
2. likely owner
3. the key evidence
4. what was changed or what should be changed
5. how it was verified

If the report is missing, ask for the console `traceId`, optional `read:` line,
or `.mf/observability/latest.json`.
