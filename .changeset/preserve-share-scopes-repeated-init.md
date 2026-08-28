---
'@module-federation/webpack-bundler-runtime': patch
---

Preserve non-default share scopes on repeated container init. When a host re-initializes a remote container with an incomplete `shareScopeMap`, existing non-default scopes are no longer overwritten with empty objects.
