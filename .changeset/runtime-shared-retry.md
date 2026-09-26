---
"@module-federation/runtime-core": patch
---

`loadShare` retries an async shared module whose previous load failed, instead of returning that load's rejected promise.
