---
'@module-federation/node': patch
---

Compile remotely fetched chunks through the sdk's `compileCommonJsModule` under `withRemoteCompilationPolicy` (reached via the bundled runtime, like `loadScriptNode`) instead of direct `eval`. Functions created by direct eval capture the enclosing scope, which kept a second full copy of every chunk's source text alive for as long as the chunk was loaded and doubled the memory retained per live remote in long-running SSR hosts. Stack traces now carry the chunk URL as the script filename. Hosts bundled with an older runtime that lacks the helpers fall back to `new Function` with no cache policy.
