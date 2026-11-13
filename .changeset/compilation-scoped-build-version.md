---
'@module-federation/sdk': patch
'@module-federation/manifest': patch
'@module-federation/rspack': patch
'@module-federation/enhanced': patch
'@module-federation/rsbuild-plugin': patch
'@module-federation/bridge-react': patch
'@module-federation/dts-plugin': patch
---

Use one build version per development compilation, shared by the manifest and compiled container runtime, including empty watch rebuilds. Production builds retain the environment, package version and local fallback priority. Remove the separate development revision.

Keep browser and Node build versions on their respective entries when merging manifests. Carry the Node build version through snapshots, development subscriptions and Bridge Service requests so server updates identify the actual server container.
