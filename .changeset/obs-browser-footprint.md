---
"@module-federation/observability-plugin": patch
---

Reduce the browser bundle footprint by reusing the runtime semver matcher and loading Divebell only when enabled. `@module-federation/runtime` is now a peer dependency; install the optional `@divebell/core` peer to use Divebell reporting.
