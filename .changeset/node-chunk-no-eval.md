---
'@module-federation/node': patch
---

Compile remotely fetched chunks with `vm.Script` (falling back to `new Function` on runtimes without `vm`) instead of direct `eval`. Functions created by direct eval capture the enclosing scope, which kept a second full copy of every chunk's source text alive for as long as the chunk was loaded and doubled the memory retained per live remote in long-running SSR hosts. Stack traces now also carry the chunk URL as the script filename.
