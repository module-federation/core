---
'@module-federation/rstest': patch
---

With `experiments.composedRuntime`, keep the bundler runtime path that the rspack wrapper aliases to the composed bootstrap bundled, instead of externalizing a file that only exists as a virtual module.
