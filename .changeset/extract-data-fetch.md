---
"@module-federation/data-fetch": patch
"@module-federation/bridge-react": patch
"@module-federation/bridge-vue3": patch
---

Extract data-fetch into the framework-agnostic `@module-federation/data-fetch` package. `@module-federation/bridge-react` and `@module-federation/bridge-vue3` continue to re-export data-fetch APIs for backward compatibility.
