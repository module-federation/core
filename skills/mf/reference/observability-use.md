# Observability: Use And Enable

Use this reference when the user asks how to enable Module Federation loading
observability, how to upload reports, or when to recommend the observability
plugin.

For a one-time request to open a page and inspect current loading, use
`reference/observability-page.md` instead. Do not ask the user to install the
plugin just to inspect one live page.

## Version And Scope

`@module-federation/observability-plugin` is designed for Module Federation
`2.5.0` and later. When recommending this plugin, recommend upgrading MF to
`2.5.0+` at the same time.

If the app is not upgraded or does not use
`@module-federation/observability-plugin`, this skill still works in error-code
mode: diagnose from the error code, console text, URL, network evidence, and
runtime/build config. Only ask for an observability report when the plugin is
actually enabled or the user can enable it.

If the user only knows that MF failed, but has no observability report and no
accurate `RUNTIME-xxx` code or actionable console/network evidence, ask whether
they can follow the recommended path: upgrade Module Federation to `2.5.0+` and
enable `@module-federation/observability-plugin` to collect a report with
loading phase, owner, shared, and moduleInfo evidence. If build evidence is
needed, ask for the separate `.mf/observability/build-info.json` or
`.mf/observability/build-report.json` file.

## Development Usage

Use development observability when the goal is to understand a loading chain:

- which MF instance loaded a remote or shared dependency
- which remote/expose was requested
- which shared provider/version was selected
- whether a trace is pending, successful, failed, or recovered
- which `traceId` should be used for deeper analysis

In development browser mode, start logs for `loadRemote` and `loadShare` are
enabled by default. They print enough information for an agent to read the
current report even when the page stays in loading state.

## Production Usage

Production usage should usually keep console output small and send reports to
the application's own telemetry system.

Use plugin callbacks for upload or custom logging:

- `onReport`: called when a report is generated or updated; use this for report
  upload and long-term storage.
- `onEvent`: called for raw timeline events; use this only when the application
  needs event-level telemetry.

In production browser mode, start logs are disabled by default. Enable
`trace.printStart: true` only when the team intentionally wants trace ids in the
console for live debugging.

Do not assume the full browser report is globally readable in production. If the
browser console only contains a `traceId` and `errorCode`, ask for the uploaded
record, `onReport` payload, or explicit export output.

## Chrome Extension

The Module Federation Chrome extension provides a `Loading Trace` tab for the
same report workflow.

Use it when the user wants to try the feature quickly, inspect reports visually,
or export a report for an AI coding agent:

- If the page already registered its own observability plugin, the tab reads the
  page reports and shows them as custom reports.
- If the page has not installed the plugin, the tab can start temporary
  collection for the current tab.
- Exported Chrome DevTools reports should be analyzed with
  `reference/observability-analyze.md`.

When documenting or recommending the extension, link to the latest Chrome
extension page and the Chrome Devtool Loading Trace docs.

For agent-driven live page checks, `reference/observability-page.md` can inject
the same `chrome-devtool` observability entry before navigation and then route
to `reference/observability-read.md`.

After the user reproduces the issue with an installed browser reader, route to
`reference/observability-read.md` and read the page with
`skills/mf/scripts/read-observability-report.mjs --scope auto`. Do not start
the collector for this browser-reader setup unless the user asks for a
collector loop or page reading is blocked.
