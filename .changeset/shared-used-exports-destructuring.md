---
"@module-federation/enhanced": patch
---

Record destructured properties of a shared module's default import as export names in tree-shaking `usedExports`. The plugin stored webpack's destructuring records, including source locations, in the injected runtime data and the stats manifest.
