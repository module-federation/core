# @module-federation/observability-plugin

## 2.6.0

### Minor Changes

- df8b40f: Add Divebell synchronization on `@divebell/core` 0.0.23 and safe multi-instance runtime state with stable report and relationship association.

### Patch Changes

- df8b40f: Extend the existing Bridge render and destroy hooks with semantic context, add a route synchronization hook, and keep timing, sanitization, and correlation in the observability plugin.
- df8b40f: Extend the semantic shared registration and resolution hooks with explicit load context, re-export the shared-version `satisfy` helper, and keep provider, candidate, and selection diagnostics in the observability plugin while ignoring legacy share-scope metadata.
- df8b40f: Extend the semantic manifest, remote entry, and preload hooks with resource context and results, while keeping cache, timing, timeout, failure, and recovery diagnostics in the observability plugin.
  - @module-federation/sdk@2.9.0

## 2.5.6

### Patch Changes

- @module-federation/sdk@2.8.2

## 2.5.5

### Patch Changes

- Updated dependencies [d901e2c]
  - @module-federation/sdk@2.8.1

## 2.5.4

### Patch Changes

- Updated dependencies [ea490ae]
  - @module-federation/sdk@2.8.0

## 2.5.3

### Patch Changes

- Updated dependencies [dcc640b]
- Updated dependencies [9958086]
  - @module-federation/sdk@2.7.0

## 2.5.2

### Patch Changes

- @module-federation/sdk@2.6.0

## 2.5.1

### Patch Changes

- Updated dependencies [b9b3b8c]
  - @module-federation/sdk@2.5.1

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
