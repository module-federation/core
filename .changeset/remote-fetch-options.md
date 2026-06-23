---
'@module-federation/runtime-core': minor
'@module-federation/sdk': minor
---

Enable header-authenticated ESM remote loading through the existing runtime `fetch` hook. When a `fetch` hook plugin is registered, `module`/`esm` remotes load their remote entry and manifest-declared CSS via a fetch + blob import-rewriting loader (instead of native `import()` / `<link>`), so custom HTTP headers (e.g. `Authorization`) be applied on every asset request. The hook receives `remoteInfo`, so headers can be decided per remote and support dynamic cases such as token refresh. Remote registration is unchanged and no new remote config is introduced; remotes load as before when no `fetch` hook is present.
