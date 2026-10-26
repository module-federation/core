---
'@module-federation/sdk': patch
---

Support webpack 5.112's relocated internal modules while preserving compatibility with earlier webpack versions and the selected compiler installation. Declare webpack as an optional SDK peer so isolated package installations can resolve relocated modules before compiler initialization.
