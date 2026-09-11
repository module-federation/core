---
'@module-federation/sdk': patch
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

Preserve the manifest provider identity independently of registration and container global names during SSR cache invalidation. Keep live shared providers intact and avoid deleting business globals that happen to match a remote registration name.
