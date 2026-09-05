---
'@module-federation/sdk': patch
'@module-federation/runtime-core': patch
---

feat: `loadEntryTimeout` runtime option — how long a remote entry script may take to load before it fails with RUNTIME-008 (default 20000 ms, `Infinity` disables the timer); `createScript` / `loadScript` accept a `timeout` and a `createScript` hook return value still overrides it
