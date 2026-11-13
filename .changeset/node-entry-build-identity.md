---
'@module-federation/sdk': patch
'@module-federation/runtime-core': patch
'@module-federation/runtime': patch
---

Isolate Node remote containers by entry URL and build version, and return each script execution's exports directly so concurrent same-name providers cannot overwrite another caller's result. Preserve legacy unversioned preload support and expose the shared entry-key helper for cache owners.

Keep fetched ESM module graphs with their entry execution instead of a process-wide URL cache. Runtime entry promises retain same-build reuse, while retiring their containers no longer leaves every previous build strongly referenced by the SDK. Preserve cyclic and dynamic imports within each graph.
