---
"@module-federation/manifest": patch
"@module-federation/sdk": patch
"@module-federation/enhanced": patch
---

Collect Webpack federation manifest data from the compilation graph when supported, including direct exposed-module shared relationships. Add `manifest.useLegacyStats` to force the existing stats reader for rollback.
