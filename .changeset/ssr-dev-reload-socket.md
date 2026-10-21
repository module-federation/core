---
'@module-federation/modern-js-v3': patch
'@module-federation/node': patch
---

Check SSR remotes for changes in a dev-server middleware and reload open pages through the dev-server socket. The `ssr-dev-plugin` runtime plugin and its root wrapper are removed, so React no longer warns about a `<script>` tag rendered on the client. `performReload` from `@module-federation/node/utils` now also works outside a bundle.
