---
'@module-federation/dts-plugin': patch
---

Fix dts-plugin expose resolution for extensionless multi-dot paths like `foo.generated` so they correctly infer supported source files such as `.ts`, `.tsx`, `.vue`, `.js`, and `.jsx`, while preserving explicit extensions and directory `index` fallback behavior.
