# Observability: Analyze Reports

Use this reference after you have an observability report, Chrome DevTools
export, browser reader output, Node report file, or build observability file.

## Read Fields In Order

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

## Decide Loading Success

Use `summary.outcome` before reading raw `events`:

- `runtime-loaded`: the remote module was loaded by Module Federation runtime.
- `component-loaded`: a component-level success signal was observed. This may be
  a business `markComponentLoaded` signal or the producer calling the injected
  `onMFRemoteLoaded` callback.
- `shared-resolved`: a shared dependency was resolved successfully. Read
  `shared.name`, `shared.provider`, `shared.requiredVersion`,
  `shared.selectedVersion`, and `shared.availableVersions` to explain which
  provider and version were selected.
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

The observability plugin cannot determine whether
`@module-federation/retry-plugin` itself succeeded. It records the Module
Federation loading chain and final resource result, not retry-plugin internal
state. Do not infer retry success only from URL changes, retry-plugin console
lines, or the page eventually rendering. If the user needs a retry
success/failure judgment, ask them to add their own evidence in retry-plugin
hooks such as `onRetry`, `onSuccess`, and `onError`, then read that output.
Without those hook records or user-provided retry events, say only that the
remote eventually loaded.

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

## Shared Evidence Limits

Do not make shared dependency analysis the default path. If the user did not ask
about shared dependencies and the report does not point to shared loading, do
not rerun the reader just because shared fields are absent.

Shared dependency evidence is only expected when the page uses Module
Federation `>= 2.5.0` and the active runtime path emits shared observability
events. If the version is unknown or below `2.5.0`, say shared dependency
details were not available from this report; do not treat that as a failed read
and do not claim that shared dependencies are definitely fine.

## Decide The Likely Owner

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

## Follow Diagnosis Actions

Treat `diagnosis.actions` as the prioritized checklist. For each action:

1. inspect the referenced config or runtime fact
2. compare it with `diagnosis.facts`
3. compare it with `.mf/observability/build-info.json` when build evidence is needed
4. make the smallest code/config fix
5. verify with the failing app or targeted test

## Use Build Evidence Correctly

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

## Use Runtime Error Codes As References

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

## Final Response Shape

When reporting back, keep it concrete:

1. what report source was used
2. likely owner
3. the key evidence
4. what was changed or what should be changed
5. how it was verified

If the report is missing, route back to `reference/observability-page.md` or
`reference/observability-read.md` instead of guessing from incomplete console
text.
