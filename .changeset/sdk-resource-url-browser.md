---
'@module-federation/sdk': minor
---

`getResourceUrl` takes an optional third argument that says whether the caller runs in a browser. It defaults to `isBrowserEnv()`, so existing callers keep today's behavior.
