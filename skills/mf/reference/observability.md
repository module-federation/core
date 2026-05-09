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

## Runtime codes and plugin reports

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

If the browser global is disabled, ask for the app's observability controller or
for the full report output pasted by the user.

If the browser console only contains `traceId` and `errorCode`, treat it as
production-safe output. Do not assume the full report is globally readable. Ask
for an explicit `exportReport(traceId)` output, the app observability controller
output, or the user's uploaded observability record.

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

## Step 6: Common paths

### Manifest failure / `RUNTIME-003`

Check:

- `diagnosis.facts.url`
- `summary.phases.manifest`
- `build.host.remotes`

Fix wrong manifest URL, HTML shell responses, CORS, gateway routing, or stale
query/hash assumptions.

### Invalid manifest / `RUNTIME-013`

Definition:

`RUNTIME-013` means the manifest URL returned JSON, but the JSON is not a valid
Module Federation manifest. It is different from `RUNTIME-003`, which means the
manifest could not be fetched or parsed.

Check:

- `diagnosis.facts.url`
- `diagnosis.facts.errorCode`
- `summary.phases.manifest`
- `diagnosis.facts.hostName`
- manifest fields such as `metaData`, `exposes`, and `shared`

When explaining this failure, say that the manifest response is reachable but
structurally invalid or incomplete. Do not describe it as a remoteEntry network
failure unless the report also contains network evidence.

Fix wrong JSON responses, gateway/deployment rewrites, missing producer manifest
output, or stale/incomplete manifest files.

### Remote not matched / `RUNTIME-004`

Check:

- `diagnosis.facts.requestId`
- host remotes in `.mf/observability/build-info.json` when available

Fix remote name, alias, or host remote declaration.

### Snapshot / moduleInfo failure / `RUNTIME-007`

Definition:

`RUNTIME-007` means the runtime failed while resolving a snapshot/moduleInfo
remote. It is not a remoteEntry network failure, not an expose lookup failure,
and not a React/component render failure unless another report field explicitly
shows those later phases.

Check:

- `requestId`
- `remote.name`
- `remote.alias`
- `remote.version`
- `diagnosis.errorCode`
- `diagnosis.facts.moduleInfoMatchedCount`
- `diagnosis.facts.moduleInfoNames`
- `moduleInfo.entries`
- `moduleInfo.availableNames`
- `build.host.remotes`

When explaining this failure, say that the runtime could not match the requested
remote name/alias/version against deployment-provided `__FEDERATION__.moduleInfo`.
Do not say "available component list" unless the report explicitly refers to
remote exposes. This failure usually happens before the remote URL, remoteEntry,
or exposed component can be loaded.

The first cause sentence must include the literal term `moduleInfo`. Do not
replace it with "loadable source list", "available source list", "component
list", or any other paraphrase.

Use this wording:

- "The requested remote did not match any deployment-provided moduleInfo entry."
- "Check whether the deployment/platform moduleInfo injection contains the
  requested remote name, alias, or version key."
- "The component has not been reached yet; the failure is in remote snapshot
  resolution."

Avoid this wording:

- "The component is missing from the available component list."
- "The prefetch list does not contain the component."
- "The expose is missing."
- "The React component failed to render."
- "The remoteEntry request failed."

Only mention source files or demo setup code after report evidence. In real
projects, first inspect the deployment/platform plugin or runtime registration
that injects `__FEDERATION__.moduleInfo`; do not jump directly to editing the
business component.

Exclude likely causes when the report only shows a snapshot/moduleInfo failure:

- remoteEntry URL/network/CORS failure
- remoteEntry execution failure
- exposed module key missing
- shared dependency version/provider/eager failure
- business component render failure

Fix missing deployment-provided `__FEDERATION__.moduleInfo`, mismatched remote
name/alias keys, or missing `publicPath` / `getPublicPath` in the injected
moduleInfo.

### Expose not found / `RUNTIME-014`

Definition:

`RUNTIME-014` means the remote entry loaded and initialized, but the requested
expose was not exported by that remote.

Check:

- `diagnosis.facts.requestId`
- `diagnosis.facts.remoteName`
- `diagnosis.facts.expose`
- producer `exposes` config or manifest `exposes`

When explaining this failure, say that remote loading reached the expose lookup
phase. Do not call it a manifest fetch failure, moduleInfo match failure,
remoteEntry network failure, or shared dependency failure unless another report
field explicitly shows that evidence.

Fix the consumer request id, producer expose name, `./` prefix, case mismatch,
alias mismatch, or stale producer deployment.

### Remote init failure / `RUNTIME-015`

Definition:

`RUNTIME-015` means the remote entry loaded, but the remote container failed
during `init`.

Check:

- `diagnosis.facts.remoteName`
- `diagnosis.facts.remoteEntry`
- `diagnosis.facts.entryGlobalName`
- `summary.phases.remoteEntry`
- original error text in `diagnosis.errorMessage` or `summary.error.errorMessage`
- shared facts and build-side shared config when available

When explaining this failure, say that the remote entry was reached and failed
while initializing. If the original error points to shared config, classify the
likely owner as shared/host+remote config; otherwise inspect producer init
logic.

Fix shared provider/version/scope/eager config, remoteEntry type/global mismatch,
or producer code that throws during container initialization.

### Shared or eager failure / `RUNTIME-005` / `RUNTIME-006`

Check:

- `summary.shared`
- shared config in `.mf/observability/build-info.json` when available
- `summary.error.lifecycle`

Fix provider availability, version range, shareScope, singleton/strictVersion,
eager, or async boundary.

### RemoteEntry failure / `RUNTIME-008`

Check:

- `diagnosis.facts.resourceErrorType`
- `diagnosis.facts.url`
- `summary.phases.remoteEntry`
- `.mf/observability/build-info.json` remoteEntry facts when available

If the type is network/timeout, fix URL, CORS, routing, server, or timeout. If
the type is script execution, inspect the producer exception and fix the remote
build. Retry does not fix script execution failures.

## Step 7: Final response shape

When reporting back, keep it concrete:

1. what report source was used
2. likely owner
3. the key evidence
4. what was changed or what should be changed
5. how it was verified

If the report is missing, ask for the console `traceId`, optional `read:` line,
or `.mf/observability/latest.json`.
