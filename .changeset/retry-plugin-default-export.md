---
'@module-federation/retry-plugin': patch
---

Export `RetryPlugin` as the default export so it can be listed directly in `runtimePlugins` (for example `[require.resolve('@module-federation/retry-plugin'), { retryTimes: 2 }]`) without a wrapper file.
