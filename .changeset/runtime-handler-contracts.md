---
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

Disabled handlers keep the same errors and empty results. Their types no longer
claim they are the enabled handler classes. Remote entry loading and the
tree-shaking share plugin use the same package selectors as the other runtime
modules.
