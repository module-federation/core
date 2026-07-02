---
'@module-federation/runtime-core': minor
'@module-federation/sdk': minor
---

Support loading remote assets in the manifest with custom headers through the existing runtime `fetch` hook.

- When a `fetch` hook plugin is registered, `module`/`esm` remotes load their remote entry and manifest-declared CSS through a fetch + blob loader, instead of native `import()` / `<link>`.
- The hook receives `remoteInfo`, so headers can be set per remote and support dynamic cases such as token refresh.
- When no `fetch` hook is present, remotes load exactly as before.
