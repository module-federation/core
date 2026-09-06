---
'@module-federation/sdk': patch
'@module-federation/runtime-core': patch
'@module-federation/runtime': patch
---

Add `compileCommonJsModule` (a `vm.Script`-backed compile helper with a `new Function` fallback for runtimes without `vm`), `buildCommonJsWrapper` and `withRemoteCompilationPolicy` to the sdk, re-exported from the runtime packages. `loadScriptNode` now compiles remote entries with V8's compilation cache switched off for the duration of the synchronous compile call. V8 keeps the source and compiled code of every distinct script in an isolate-wide cache that is only evicted when the heap nears V8's own limit, so a long-running SSR host that force-registers a new remote build on every refresh accumulated one full copy of each build until the container was killed. Remote code is exactly the code that changes per deployment, so it no longer enters the cache; everything else keeps it. The toggle is skipped when the process already runs with `--no-compilation-cache`. Set `FEDERATION_REMOTE_COMPILATION_CACHE=default` to leave V8's cache policy untouched (the default is `disable`).
