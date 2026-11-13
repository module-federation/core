---
'@module-federation/sdk': patch
'@module-federation/manifest': patch
'@module-federation/rspack': patch
'@module-federation/enhanced': patch
'@module-federation/rsbuild-plugin': patch
'@module-federation/bridge-react': patch
'@module-federation/dts-plugin': patch
---

Preserve build versions from the environment, package version or local fallback. Detect development updates with a monotonic compilation revision without scanning emitted assets. Merge browser and Node revisions without changing release identity or mutating retained compiler outputs. Resolve compiled runtime IDs from the same compiler context as the manifest.

Carry development revisions through build subscriptions and snapshots. Bridge Service requests use the development revision when present to reject stale browser descriptors after a rebuild.
