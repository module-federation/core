---
'@module-federation/runtime-core': patch
'@module-federation/sdk': patch
'@module-federation/webpack-bundler-runtime': patch
---

Preserve same-scope, same-version shared layer variants during runtime registration, selection, remote replacement, and snapshot asset matching. Keep unlayered share-scope entries compatible with older runtimes; layered requests prefer an exact layer and use an unlayered provider only when the requested layer is absent.
