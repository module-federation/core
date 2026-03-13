---
"@module-federation/bridge-react": patch
"@module-federation/sdk": minor
"@module-federation/runtime-core": minor
---

Add `isBrowserEnvValue` as a tree-shakable ENV_TARGET-aware constant while
preserving the `isBrowserEnv()` function. Internal runtime and bridge callers
use the constant to enable bundler dead-code elimination without breaking the
public API.
