---
"@module-federation/sdk": major
"@module-federation/runtime-core": major
---

Change isBrowserEnv to a top-level boolean constant that honors ENV_TARGET,
so bundlers can tree-shake environment-specific branches. Update callers to
use `isBrowserEnv` instead of `isBrowserEnv()`.
