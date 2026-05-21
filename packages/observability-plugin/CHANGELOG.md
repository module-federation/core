# @module-federation/observability-plugin

## 2.5.0

### Minor Changes

- 41281f4: Add a Loading Trace panel that can configure and inject the observability plugin, reload the inspected page, stream loading events, and export collected reports.
- 41281f4: Add an opt-in observability plugin, a Chrome-extension-safe observability plugin entry with an independent name and fixed browser scope, a direct runtime plugin API with instance-bound component loaded marks, explicit temporary React `onMFRemoteLoaded` callback injection for matched remotes, opt-in start console traces for `loadRemote` and `loadShare`, a local collector mode for AI-assisted browser debugging, a Node-specific export for file reports, a build-specific export for build summaries and build error reports, remote and shared lifecycle hooks, console trace hints, safe browser/Node report outputs, configurable error stack capture with explicit console raw-stack opt-ins, shared/eager loading evidence gated to stable runtime `2.5.0+` for Chrome-extension compatibility, final loading outcome summaries for Module Federation loading reports including resolved shared dependencies, deterministic fact reports for runtime and build failures, no-op return handling for observer hooks, detailed remote match/init/expose/factory phase events with phase durations, compact phase summaries, cache/fallback markers, loaded-before evidence from existing federation instances when a remote load fails, length-limited business component metadata, clipped moduleInfo evidence with preserved deployment locator fields for snapshot-dependent failures, normalized runtime error summaries with error codes, owner hints, retryability, and safe context, dedicated runtime error codes for invalid manifests, missing exposes, and remote container init failures, plus MF skill guidance for reading and fixing observability reports.

### Patch Changes

- 0716c11: Track preload resource results and expose resource context to loader hooks.
- 328542c: Send configured local collector events outside debug mode while keeping failures quiet unless debug logging is enabled.
- Updated dependencies [5d4095d]
- Updated dependencies [0716c11]
  - @module-federation/sdk@2.5.0
