---
'@module-federation/sdk': patch
'@module-federation/node': patch
---

Compile remote entries (`loadScriptNode`) and remotely fetched chunks with V8's compilation cache switched off for the duration of the compile call. V8 keeps the source and compiled code of every distinct script in an isolate-wide cache that is only evicted when the heap nears V8's own limit, so a long-running SSR host that force-registers a new remote build on every refresh accumulated one full copy of each build until the container was killed. Remote code is exactly the code that changes per deployment, so it no longer enters the cache; everything else keeps it. Set `FEDERATION_KEEP_COMPILATION_CACHE=true` to restore the previous behavior.
