---
'@module-federation/runtime-core': patch
---

Separate shared registry storage and cleanup from version selection so composed remotes-only runtimes exclude sharing and semver code, including in unoptimized builds. Preserve layered provider cleanup and the existing shared utility exports.
