---
'@module-federation/runtime-core': patch
'@module-federation/sdk': patch
'@module-federation/retry-plugin': patch
---

Enable retry-plugin recovery for Node.js remote entry transport and non-success HTTP response failures while keeping remote entry execution errors non-retryable.
