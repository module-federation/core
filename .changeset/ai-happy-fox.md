---
"@module-federation/nextjs-mf": minor
---

Refactor and enhance module federation support for Next.js.

- Introduced `getShareScope` function to dynamically generate the default share scope based on the client or server environment, replacing static DEFAULT_SHARE_SCOPE declarations.
- Implemented `RscManifestInterceptPlugin` to intercept and modify client reference manifests, ensuring proper prefix handling.
- Refined server-side externals handling to ensure shared federation modules are bundled.
- Simplified and modularized sharing logic by creating distinct functions for React, React DOM, React JSX Runtime, and React JSX Dev Runtime package configurations.
- Captured the original webpack public path for potential use in plugins and adjustments.
- Enhanced logging for debug tracing of shared module resolution processes in runtimePlugin.
