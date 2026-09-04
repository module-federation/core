---
"@module-federation/modern-js": patch
"@module-federation/modern-js-v3": patch
---

Constrain stream SSR splitChunks filters to async chunks, including explicit cache group and fallback cache group overrides. Wrap function filters to exclude initial chunks while preserving their custom selection of async chunks, and keep already-valid async settings quiet.
