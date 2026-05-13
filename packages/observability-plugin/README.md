# @module-federation/observability-plugin

Runtime observability plugin for Module Federation loading flows.

This package is designed for Module Federation `2.5.0` and later. Older
projects can still use runtime error codes, but the full observability workflow
requires upgrading the MF runtime and installing this plugin.

This package is currently the minimal observability foundation. It records
structured in-memory loading events when the plugin is installed and not
disabled. Optional outputs are conservative by default: no browser global, no
Node file output, and no raw error stack in console output.

```ts
import { createInstance } from '@module-federation/runtime';
import { ObservabilityPlugin } from '@module-federation/observability-plugin';

createInstance({
  name: 'host',
  plugins: [
    ObservabilityPlugin({
      level: 'verbose',
      browser: {
        enabled: true,
        scope: 'host',
      },
    }),
  ],
  remotes: [],
});
```

The plugin does not upload data or expose a browser global by default. Reports
are kept in memory. Runtime request URLs, error messages, and stored error
stacks keep their original query/hash and error details because those values are
often needed for debugging. Large deployment locator fields such as
`publicPath` and `remoteEntry` are only length-limited.

## Safe Observability

Enable only the output channels that match the environment:

- Browser dev: use `browser.enabled: true` with a scoped reader such as
  `window.__FEDERATION__.__OBSERVABILITY__.host`.
- Agent-led browser dev: use `collector: true` to POST reports to the local
  skill collector on `127.0.0.1:17891`.
- Browser prod: set `browser.mode: "production"` so console output stays limited
  to `traceId` and known `errorCode`; export full reports only through explicit
  app-owned flows such as `exportReport()` or `onReport`.
- Node / SSR: use the Node entry
  `@module-federation/observability-plugin/node` and set `fileOutput: true` when
  local files are needed.
- Build: use `ObservabilityBuildPlugin` when build-side files are needed for
  later comparison.

Reports include the loading timeline, selected host/remote/shared facts,
original runtime URLs, original error message/stack, clipped deployment
`moduleInfo` when it is relevant, and user-provided observability
metadata with count and length limits. Reports do not collect request headers,
cookies, authorization values, remote response bodies, remote source, module
source, React props, full `moduleInfo.modules`, full `moduleInfo.shared`, or
asset lists from deployment `moduleInfo`.
Fields whose value is `undefined` are omitted from returned reports and events,
so missing fields should be read as "not observed or not relevant" instead of a
literal value.

Failure hints are printed with `console.error` so browser DevTools, CDP-based
agents, Node logs, and log collection systems can detect that a Module
Federation load failed and then use the printed `traceId` to fetch the full
report. Successful or recovered reports are still available through the reader
APIs and callbacks, but they are not promoted to console errors. When the
browser reader is enabled in development mode, the plugin prints a small
`console.info` line by default when a `loadRemote` or `loadShare` trace starts.
The line includes the `traceId` and read command so an agent can inspect pending
loading state before a timeout or error happens. In production browser mode,
start logs are disabled by default; set `trace.printStart: true` only when you
explicitly want them.

The runtime only exposes the loading lifecycle hooks needed to know whether the
main flow started, succeeded, or failed. This plugin listens to those hooks,
derives detailed reasons like shared version mismatch or eager boundary issues,
and exposes the final loading state through a small `summary` object:

- `runtime-loaded`: Module Federation finished loading the remote module.
- `component-loaded`: business code called `markComponentLoaded`, or a producer
  called the injected `onMFRemoteLoaded` callback.
- `failed`: the load failed and `failedPhase` points to the first specific
  failing phase.
- `recovered`: loading hit an error but a fallback/recovery path returned a
  result. For shared loading, the `custom-share-info-unmatched` reason means
  build-time `customShareInfo` did not match a registered provider, but the
  runtime handled it as a non-fatal result instead of a loading failure.

`summary.componentLoaded: false` only means no component-level ready signal was
observed. If `react.injectLoadedCallback: true` is enabled but this field is
still false, check whether the producer actually calls
`props.onMFRemoteLoaded?.(...)`. Without that producer call, the report can only
confirm that the remote resource loaded; it cannot prove whether the React
component reached the producer's business-ready point.

For remote loading, the plugin listens to runtime lifecycle hooks such as
`beforeRequest`, `afterMatchRemote`, `onLoad`, `afterLoadRemote`,
`errorLoadRemote`, `loadEntry`, `afterLoadEntry`, `beforeInitRemote`,
`afterInitRemote`, `beforeGetExpose`, `afterGetExpose`,
`beforeExecuteFactory`, `afterExecuteFactory`, and snapshot resolve hooks. It
does not return a value from observer hooks, so it does not change fallback or
retry results from plugins such as `@module-federation/retry-plugin`.

Successful verbose reports include the key runtime stages: remote match,
manifest, remoteEntry load, remoteEntry init, expose resolution, module factory
execution, and final load completion. When a stage has matching start and end
events, the end event includes a bounded `duration` value.

The report also keeps compact loading state under `summary`. It contains the
final outcome, per-phase status and duration under `summary.phases`, safe
cache/recovery markers under `summary.flags`, and the last resolved shared
provider/version under `summary.shared` when a shared dependency was observed.
`level: "summary"` omits start events from the stored timeline but still keeps
the derived durations on the matching success/error events. `level: "verbose"`
keeps the full timeline.

Each report also includes a deterministic `diagnosis` object. It is generated
by engineering rules, not by an AI model. It keeps the final outcome, likely
owner, completed and pending phases, observability facts, documentation link when
a known runtime error code is present, and a short list of next checks. This is
the field a person or AI coding agent should read first before falling back to
the raw `events` timeline.

For agent-led debugging, use the repository's single `mf` skill entry with the
`observability` sub-command. The skill is the maintained guide for reading
reports and deciding the next debugging step.

`errorLoadShare` is used only for observation. Shared dependency miss, version
mismatch, and eager boundary errors are not retried by the retry plugin by
default because they are usually configuration or availability problems instead
of transient network failures. When a build plugin supplies `customShareInfo`
and the runtime reports a handled miss, the observability report uses a
recovered outcome instead of marking the trace as failed.

Business code can mark its own success condition with a fixed event. When React
callback injection is explicitly enabled, the wrapper injects an
`onMFRemoteLoaded` prop into the remote component. The producer can call it when
the component's own ready condition is met:

```tsx
import { useEffect } from 'react';
import type { OnMFRemoteLoaded } from '@module-federation/observability-plugin';

export default function RemotePanel({ onMFRemoteLoaded }: { onMFRemoteLoaded?: OnMFRemoteLoaded }) {
  useEffect(() => {
    onMFRemoteLoaded?.({
      metadata: {
        dataReady: true,
      },
    });
  }, [onMFRemoteLoaded]);

  return <section>Remote panel</section>;
}
```

If the app wants to mark readiness from the consumer side, it can still call the
instance method directly:

```ts
import { getInstance } from '@module-federation/runtime';
import '@module-federation/observability-plugin';

getInstance()?.markComponentLoaded({
  requestId: 'remote/Button',
  componentName: 'Button',
  metadata: {
    route: '/settings',
  },
});
```

Both paths record `component:business-loaded` on the same trace when possible.
Business metadata is optional. String values keep their original details and are
only length-limited, so user-provided metadata remains trustworthy. The instance
method is attached when the observability plugin is registered. If an
application uses multiple runtime instances, call it on the instance that
registered this plugin.

React callback injection is available only when explicitly enabled:

```ts
ObservabilityPlugin({
  level: 'verbose',
  react: {
    injectLoadedCallback: true,
    remoteIds: ['remote/Button'],
  },
});
```

When this option is enabled, the plugin tries to wrap remote function components
returned by `loadRemote`. The wrapper does not add DOM nodes. It injects the
`onMFRemoteLoaded` prop only. It does not observe React mount, render lifecycle,
or timeout. When the producer calls the callback, the report records
`component:business-loaded`. This option changes the component reference because
it returns a wrapper component, so use it as a temporary debugging switch and
remove it after the production issue is fixed.

If `summary.componentLoaded` is still `false` after enabling this option, inspect
the producer first. If the producer has not called `onMFRemoteLoaded`, the report
only proves remote runtime loading, not component business readiness. If the
producer source is unavailable, ask the producer owner to confirm whether the
callback was added.

Use `react.remoteIds` to limit this behavior to the remote requests you are
actively debugging. If `remoteIds` is empty, the plugin wraps detected React
function components loaded by the runtime instance that registered it.

Browser output is available only when the plugin option explicitly enables it.
When browser output is enabled, the report can be read from:

```ts
window.__FEDERATION__.__OBSERVABILITY__.host.getLatestReport();
window.__FEDERATION__.__OBSERVABILITY__.host.getReport('mf-trace-id');
window.__FEDERATION__.__OBSERVABILITY__.host.getReports({ limit: 5 });
window.__FEDERATION__.__OBSERVABILITY__.host.findReports({ remote: 'remote1' });
window.__FEDERATION__.__OBSERVABILITY__.host.exportReport('mf-trace-id');
```

`getReports({ limit })` returns recent reports newest first. `findReports()` can
filter by `traceId`, `remote`, `expose`, `shared`, `status`, or `outcome`.
`exportReport()` returns a copied report object, using the latest report when no
`traceId` is provided.

For agent-led development debugging where a page may stay in a loading state,
enable the browser reader. Development browser mode prints start traces by
default:

```ts
ObservabilityPlugin({
  level: 'verbose',
  browser: {
    enabled: true,
    scope: 'host',
  },
});
```

This prints only `loadRemote` and `loadShare` start lines. It does not print a
line for every internal phase. Set `trace.printStart: false` to disable it in
development browser mode. In production browser mode, set
`trace.printStart: true` to opt in.

If the agent cannot execute JavaScript in the browser page, enable the local
collector and start the collector from the MF skill:

```ts
ObservabilityPlugin({
  level: 'verbose',
  collector: true,
});
```

`collector: true` posts event/report snapshots to:

```text
http://127.0.0.1:17891/__mf_observability
```

Use a custom local port only when the default port is occupied:

```ts
ObservabilityPlugin({
  collector: {
    enabled: true,
    port: 17892,
  },
});
```

The runtime plugin does not create a server. The MF skill starts a temporary
local Node collector, writes reports under `.mf/observability/collector`, and
the agent reads those files. The collector path is local-only and does not
execute code or control the page.

For browser production use, set `browser.mode: "production"` when the runtime
console must stay minimal:

```ts
ObservabilityPlugin({
  browser: {
    enabled: true,
    scope: 'host',
    mode: 'production',
  },
});
```

In production browser mode, the `console.error` hint only includes the `traceId`
and known `errorCode`. It does not print the report body, raw stack, request
URL, or `read:` command. Full reports are still available only through explicit
user choices such as `exportReport()` or an application-owned `onReport` upload.
Production applications that want richer observability should prefer
`onReport` / `onEvent` to forward reports to their own telemetry system instead
of exposing a public browser global.

Node file output is provided by the Node-specific entry:

```ts
import { createInstance } from '@module-federation/runtime';
import { ObservabilityPlugin } from '@module-federation/observability-plugin/node';

createInstance({
  name: 'host',
  plugins: [
    ObservabilityPlugin({
      level: 'verbose',
      fileOutput: true,
      directory: '.mf/observability',
    }),
  ],
  remotes: [],
});
```

When Node file output is explicitly enabled, the Node entry writes:

- `.mf/observability/latest.json`: a formatted copy of the latest complete
  report, including `traceId`, top-level status/error fields, `diagnosis`,
  `summary`, clipped `moduleInfo` when relevant, and the report's own `events`.
- `.mf/observability/events.jsonl`: append-only event stream. Each line is one
  JSON object for one runtime event and includes fields such as `traceId`,
  `timestamp`, `phase`, `status`, remote/shared/expose context, and error
  fields when present.

Read `latest.json` first. Use `events.jsonl` only when multiple traces must be
compared or when the full event ordering for a `traceId` is needed.

On errors, the plugin prints a small console hint with the `traceId` and the
available read path. The console hint is intentionally small and does not carry
the full report or the raw stack by default. If a user explicitly needs the
full stack, they can opt in with `printRawStack: true` or capture the original
error through `onRawError`. The default browser/runtime entry does not include
Node file output code.

Build-time observability is provided by the build-specific entry:

```js
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const { ObservabilityBuildPlugin } = require('@module-federation/observability-plugin/build');

const moduleFederationOptions = {
  name: 'host',
  remotes: {
    remote1: 'remote1@http://localhost:3001/mf-manifest.json',
  },
  exposes: {
    './Button': './src/Button',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
  },
};

module.exports = {
  plugins: [
    new ModuleFederationPlugin(moduleFederationOptions),
    new ObservabilityBuildPlugin({
      moduleFederation: moduleFederationOptions,
    }),
  ],
};
```

When this optional build plugin is installed, it writes
`.mf/observability/build-info.json`. The file is a summary of the Module
Federation build configuration and generated manifest/stats facts:
bundler name/version, Module Federation plugin version when available, build
version when available, remoteEntry file/type/publicPath mode, remotes,
exposes, and shared dependencies. It intentionally omits local expose source
paths, asset lists, source code, and environment variables. Remote URLs and the
`remoteEntry.publicPath` deployment locator keep query/hash data. If build
observability output fails, the build continues and a bundler warning is emitted.

When the build has compilation errors, or when the observability plugin cannot
write its own build output, the build plugin writes
`.mf/observability/build-report.json`. The report has the same high-level shape
as runtime reports: a `traceId`, `status`, `failedPhase`, `events`,
`summary.error`, `diagnosis`, and the top-level `build` object. Clean builds
remove the stale report file so readers do not mistake an old build error for
the current state.

Runtime reports do not include build facts. `summary` is only the loading-state
view. If debugging needs build-side evidence, read
`.mf/observability/build-info.json` or `.mf/observability/build-report.json`
separately and compare it with the runtime report.

For snapshot-dependent failures, such as `RUNTIME-007`, reports can also include
top-level `moduleInfo`. This field is collected only for failures that depend on
`__FEDERATION__.moduleInfo`. It is clipped by default: the plugin keeps matching
entries with only `name`, `publicPath`, `getPublicPath`, `remoteEntry`, and
`globalName`, keeps the deployment locator fields only length-limited, and
removes large fields such as `modules` and `shared`.

Runtime errors are normalized into stable fields on both events and reports:

- `errorCode`: for example `RUNTIME-003` or `RUNTIME-008` when the original
  error includes one.
- `failedPhase` and `lifecycle`: where the failure happened.
- `ownerHint`: a deterministic hint such as `host`, `remote`, `shared`, or
  `network`.
- `retryable`: whether the observed failure looks transient.
- `errorContext`: a context object with values such as manifest URL,
  remote name, `entryGlobalName`, request id, expose, or shared package.

The first batch includes specific diagnosis facts and actions for
`RUNTIME-001`, `RUNTIME-003`, `RUNTIME-004`, `RUNTIME-005`, `RUNTIME-006`, and
`RUNTIME-008`. `RUNTIME-008` is further classified as `network`, `timeout`,
`script-execution`, or `unknown` in `errorContext.resourceErrorType` and
`diagnosis.facts.resourceErrorType`.

Shared dependency reports include only evidence fields such as package name,
share scope, requested version, available versions, selected provider, and a
reason like `missing-provider`, `version-mismatch`, or `sync-async-boundary`.
They do not include shared factories, module values, source, or business data.

Shared observability is intentionally scoped to the Module Federation instance
that resolved the shared dependency. It can answer which MF instance loaded a
shared package, which registered provider/version was selected, and the related
scope/version/eager configuration. It does not guarantee a causal link from that
shared dependency back to a specific remote or expose, because shared resolution
can be triggered later by the bundler runtime while chunks and module factories
execute. When multiple shared dependencies are involved, read all
`phase: "shared"` events. `summary.shared` is only a compact last-observed
summary.
