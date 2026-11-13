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

Allow frameworks to assign one shared version before browser and Node compilation hooks run. Merged manifests, runtime snapshots, development subscriptions and Bridge Service requests use that single application version.
