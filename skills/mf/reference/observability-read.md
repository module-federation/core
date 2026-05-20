# Observability: Read Reports

Use this reference to get Module Federation observability reports from the most
direct available source.

If the user asks to open or visit a real page and observe Module Federation
loading with no existing report, use `reference/observability-page.md` first so
it can choose existing project integration or temporary browser injection.

If the report source is a temporary browser injection from
`reference/observability-page.md`, use
`skills/mf/scripts/read-observability-report.mjs` first. Do not create a
one-off CDP or WebSocket reader script.

If `skills/mf/scripts/open-observability-page.mjs` already returned
`initialRead`, analyze that result before running another read. Rerun the reader
only after user interaction, reload, or a specific follow-up target.

## Browser Capability Check

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

## Browser Console Or Page Global

If the console hint includes a `read:` line, execute that command exactly in the
browser console context:

```ts
window.__FEDERATION__.__OBSERVABILITY__['runtime_host'].getReport('mf-...');
```

For temporary browser injection through `reference/observability-page.md`,
always try `chrome_extension` first:

```ts
window.__FEDERATION__.__OBSERVABILITY__['chrome_extension'].getLatestReport();
window.__FEDERATION__.__OBSERVABILITY__['chrome_extension'].getReports({
  limit: 10,
});
```

Do not pass or invent a custom scope for this injected path. If the app itself
configured a different browser scope, inspect:

```ts
Object.keys(window.__FEDERATION__.__OBSERVABILITY__);
```

For temporary browser injection, read and save reports with the built-in script
from the `mf` skill directory. Use the `port` and `pageId` printed by
`scripts/open-observability-page.mjs`:

```bash
node skills/mf/scripts/read-observability-report.mjs \
  --port "<returned-port>" \
  --page-id "<opened-page-id>" \
  --scope chrome_extension \
  --limit 10 \
  --output "/tmp/mf-observability-report.json" \
  --json
```

Use `--trace-id`, `--remote`, `--expose`, or `--shared` when the user names a
specific trace or target. If the local Chrome debug connection is blocked by
sandbox permissions, rerun this same script with permission. Do not create a
temporary WebSocket/CDP reader script.

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

## Shared Dependency Read Boundary

Do not run another browser read only because the report has no shared dependency
records. Only use `--shared` or rerun for shared data when the user explicitly
asks about shared dependencies, names a shared package, or the report/error
points to shared loading.

Shared dependency evidence is only expected when the page uses Module
Federation `>= 2.5.0` and that runtime path emits shared observability events.
If the MF version is missing, unknown, or lower than `2.5.0`, absence of
`summary.shared`, `shared-resolved`, or shared events is not a reason to reread
the page and is not proof that shared dependencies are healthy.

## Chrome DevTools Export

If the user has the Module Federation Chrome extension, use the `Loading Trace`
tab to inspect or export the same reports. If the page already registered its
own observability plugin, the tab reads those reports. If not, the tab can start
temporary collection for the current tab.

When the user provides an exported JSON file from Chrome DevTools, read that
file as the report source and then use `reference/observability-analyze.md`.

## Local Collector

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

## Node Or SSR

Read `.mf/observability/latest.json` first. Use `.mf/observability/events.jsonl`
only if multiple traces or event ordering are needed.

`latest.json` is the formatted latest complete report. `events.jsonl` is an
append-only stream where each line is one runtime event with its own `traceId`,
`timestamp`, `phase`, `status`, context, and error fields when present.

## Build

Read `.mf/observability/build-report.json` for build failures and
`.mf/observability/build-info.json` for successful build facts.
