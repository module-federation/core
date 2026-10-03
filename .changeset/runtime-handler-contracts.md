---
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

The tree-shaking share plugin moves behind a package selector and still
patches tree-shaking status when no bundler runtime is present. The public
`getRemoteEntry` behavior is unchanged. Selector tests check the result of
each call and that disabled code is absent from webpack and Rspack bundles.
