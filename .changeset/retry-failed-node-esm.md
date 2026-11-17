---
'@module-federation/sdk': patch
---

Stop caching Node ESM remote modules that fail to link, so one failed request for a statically imported chunk no longer breaks the importing module until the process restarts.
