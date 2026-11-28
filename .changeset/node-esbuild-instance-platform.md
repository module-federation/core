---
'@module-federation/node': patch
'@module-federation/esbuild': patch
---

Load remote entries through the instance platform's `loadScriptNode` when it has one, falling back to `federation.runtime.loadScriptNode`, and initialize esbuild containers through `bundlerRuntime.init`. Both work with the composed bundler runtime, whose `federation.runtime` has no `init`.
