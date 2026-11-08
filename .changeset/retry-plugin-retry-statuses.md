---
'@module-federation/retry-plugin': patch
---

Add a `retryStatuses` option. When set, only the listed HTTP statuses are retried and any other non-OK response fails at once, so a missing manifest (404) no longer waits through every retry.
