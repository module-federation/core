# Module Federation Chrome Devtools

## Ability

- Proxy online Module Federation remote module to local
- Let proxied remote module get hmr
- Inject the Chrome-specific observability runtime plugin from the Loading Trace
  tab, receive page events through `window.postMessage`, and export collected
  loading reports

https://module-federation.io/

## Extension builds

From the repository root:

```sh
pnpm --filter @module-federation/devtools run build:devtool
```

One compilation produces two unpacked extensions:

| Directory                               | Interface                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------- |
| `packages/chrome-devtools/dist/chrome`  | Chrome side panel and DevTools panel                                      |
| `packages/chrome-devtools/dist/browser` | 800 × 600 popup with fixed navigation/header and a scrolling content area |

Load the appropriate directory, then reload the page being inspected. Both
variants retain the same `document_start` MAIN-world scripts for proxying,
React Fast Refresh and loading traces. The browser variant omits `sidePanel`,
`side_panel`, and `devtools_page`. It still needs Manifest V3 content scripts,
service workers, storage, tabs and scripting APIs from the host browser.

`build:devtool:popup` is a compatibility alias that now builds both variants.
`dist/.extension-build` is intermediate output, not an installable extension.
The library `build` command cleans `dist`, so run `build:devtool` afterwards
when you also need the unpacked extensions. Remove the old root-`dist` extension
registration when migrating; do not enable two variants on the same page.

## WebMCP

Both extensions register page-scoped tools from a MAIN-world content script at
`document_idle`. Tools remain available with the extension UI closed. Registration
uses native `document.modelContext` or the earlier `navigator.modelContext` API.
When neither API is available, the extension continues to work normally without
WebMCP. No polyfill is installed: the browser/agent must support discovering and
calling registered tools. A page exposing tools alone does not establish that
an embedded browser exposes them to its agent.

| Tool                         | Capability                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `mf_get_state`               | Module snapshots, shared scopes, registered plugins, saved proxy/HMR configuration and loading reports |
| `mf_get_modules`             | All module snapshots or one exact `moduleId`                                                           |
| `mf_get_dependencies`        | Dependency graph source data, consumers and remote IDs                                                 |
| `mf_get_shared`              | Shared versions and loading state; factories are not executed                                          |
| `mf_set_proxy`               | Replace rules, enable/disable individual rules and configure snapshot clipping                         |
| `mf_clear_proxy`             | Clear proxy rules and cached proxy snapshots, preserving HMR/tracing                                   |
| `mf_set_hmr`                 | Enable/disable development React replacement and Fast Refresh                                          |
| `mf_configure_loading_trace` | Enable/disable tracing; level, event limit, console, browser output, scope, mode and start logging     |
| `mf_get_loading_reports`     | Current reports across observability scopes                                                            |
| `mf_export_snapshot`         | Serializable JSON export of the current diagnostic state                                               |

These tools cover the implemented runtime features. Graph layout, filtering,
module selection, theme and language remain presentation controls in the UI;
an agent receives the underlying structured data. The Performance tab is still
a placeholder and has no performance-analysis tool. Export tools return JSON
rather than silently downloading a file.

Example tool inputs:

```json
{
  "rules": [
    {
      "key": "mf_playground",
      "value": "https://localhost:3006/mf-manifest.json",
      "checked": true
    }
  ],
  "clip": false
}
```

Pass that object to `mf_set_proxy`. Pass `{ "enabled": true }` to `mf_set_hmr`.
`mf_set_proxy` replaces the complete rule set, so read `mf_get_state` before
editing existing rules. An unchecked rule remains saved but is not applied.

Configuration tools synchronously persist the inspected origin's localStorage
and return `reloadRequired: true`. They do not reload inside the tool invocation,
which could destroy its response before the agent receives it. The agent should
finish configuration, reload through browser navigation, then call `mf_get_state`
to verify. Saved configuration is distinct from the currently running runtime.
Eager React shares may cause one additional automatic refresh while the existing
Fast Refresh plugin records their version and share scopes.

React 19 development replacement is pinned to the same pair used by Divebell:
`umd-react@19.2.4/dist/react.development.js` and
`umd-react@19.2.4/dist/react-dom.development.js` from unpkg. All `19.x` React,
ReactDOM and `react-dom/client` registrations use version `19.2.4` while HMR is
enabled. The client entry reuses ReactDOM's development bundle. Both async and
eager loading initialize React before ReactDOM; React 19 eager shares can load
synchronously without the first-discovery refresh. React 17/18 keep their existing
official development UMD URLs. Disabling HMR preserves the application's providers.

The UI reads the same page configuration; opening it does not replay a stale
global HMR preference or trigger a reload. Open extension views receive a snapshot
notification after a tool changes configuration. Settings are origin-scoped and
persist across navigation; they are not isolated to one tab of the same origin.

The tools expose only named diagnostic operations, not arbitrary script execution,
arbitrary storage access or extension APIs. Page CSP, CORS and certificate checks
still apply. In particular, HTTPS sites whose CSP excludes local HTTP resources
need a permitted remote endpoint; WebMCP does not bypass that policy.

## Validation

```sh
pnpm --filter @module-federation/devtools run test
pnpm --filter @module-federation/devtools run build
pnpm --filter @module-federation/devtools run build:devtool
PLAYWRIGHT_BROWSERS_PATH=0 pnpm --filter @module-federation/devtools exec playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=0 pnpm --filter @module-federation/devtools exec playwright test e2e/webmcp.spec.ts --workers=1
```

The WebMCP E2E fixture loads both real unpacked extensions in Chromium, with a
host-API test double. It verifies early injection, persisted configuration across
reloads, tool execution, and popup layout. It does not claim to validate native
WebMCP discovery in Codex or another embedded browser.
