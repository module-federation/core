---
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

Disabled handlers keep the same errors and empty results, and their own
classes are typed honestly. The public `ModuleFederation` field types and the
public `getRemoteEntry` behavior are unchanged. The tree-shaking share plugin
moves behind a package selector and still patches tree-shaking status when no
bundler runtime is present. Selector tests check the result of each call and
that disabled code is absent from webpack and Rspack bundles.
