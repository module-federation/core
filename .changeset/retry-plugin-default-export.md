---
'@module-federation/retry-plugin': patch
---

Export `RetryPlugin` as the default export so the package can be listed directly in `runtimePlugins` with JSON-serializable options without a wrapper file.
