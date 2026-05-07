# @module-federation/diagnostics-plugin

Runtime diagnostics plugin for Module Federation loading flows.

This package is currently the minimal diagnostics foundation. It records
sanitized in-memory loading events only when `security.diagnostics.enabled` is
set on the runtime instance.

```ts
import { createInstance } from '@module-federation/runtime';
import { DiagnosticsPlugin } from '@module-federation/diagnostics-plugin';

const diagnostics = DiagnosticsPlugin({
  level: 'verbose',
  browser: {
    enabled: true,
    scope: 'host',
  },
});

createInstance({
  name: 'host',
  security: {
    diagnostics: {
      enabled: true,
      maxEvents: 100,
      browserGlobal: true,
    },
  },
  plugins: [diagnostics.plugin],
  remotes: [],
});

const report = diagnostics.getLatestReport();
```

The plugin does not upload data or expose a browser global by default. Reports
are kept in memory and URL query/hash data is removed before it is returned.
The runtime only exposes the loading lifecycle hooks needed to know whether the
main flow started, succeeded, or failed. This plugin listens to those hooks,
derives detailed reasons like shared version mismatch or eager boundary issues,
and exposes the final loading state through a small `summary` object:

- `runtime-loaded`: Module Federation finished loading the remote module.
- `component-loaded`: business code called `markComponentLoaded`.
- `failed`: the load failed and `failedPhase` points to the first specific
  failing phase.
- `recovered`: loading hit an error but a fallback/recovery path returned a
  result.

For remote loading, the plugin listens to runtime lifecycle hooks such as
`beforeRequest`, `onLoad`, `afterLoadRemote`, `errorLoadRemote`, `loadEntry`,
`afterLoadEntry`, and snapshot resolve hooks. It does not return a value from
observer hooks, so it does not change fallback or retry results from plugins
such as `@module-federation/retry-plugin`.

`errorLoadShare` is used only for diagnostics. Shared dependency miss, version
mismatch, and eager boundary errors are not retried by the retry plugin by
default because they are usually configuration or availability problems instead
of transient network failures.

Business code can mark its own success condition with a fixed event:

```ts
diagnostics.markComponentLoaded({
  requestId: 'remote/Button',
  componentName: 'Button',
});
```

This records `component:business-loaded` on the same trace when possible.

Optional outputs are gated twice:

- Plugin options request the output.
- `security.diagnostics` must allow the output.

When both sides allow browser output, the report can be read from:

```ts
window.__FEDERATION__.__DIAGNOSTICS__.host.getLatestReport();
window.__FEDERATION__.__DIAGNOSTICS__.host.getReport('mf-trace-id');
```

Node file output is provided by the Node-specific entry:

```ts
import { createInstance } from '@module-federation/runtime';
import { DiagnosticsPlugin } from '@module-federation/diagnostics-plugin/node';

const diagnostics = DiagnosticsPlugin({
  level: 'verbose',
  directory: '.mf/diagnostics',
});

createInstance({
  name: 'host',
  security: {
    diagnostics: {
      enabled: true,
      fileOutput: true,
    },
  },
  plugins: [diagnostics.plugin],
  remotes: [],
});
```

When both sides allow Node file output, the Node entry writes:

- `.mf/diagnostics/latest.json`: the latest sanitized report.
- `.mf/diagnostics/events.jsonl`: one sanitized event per line.

On errors, the plugin prints a small console hint with the `traceId` and the
available read path. The console hint is intentionally small and does not carry
the full report. The default browser/runtime entry does not include Node file
output code.

Shared dependency reports include only diagnostic fields such as package name,
share scope, requested version, available versions, selected provider, and a
reason like `missing-provider`, `version-mismatch`, or `sync-async-boundary`.
They do not include shared factories, module values, source, or business data.
