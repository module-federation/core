---
'@module-federation/dts-plugin': patch
---

fix(dts-plugin): execute an absolute `compilerInstance` path directly instead of splitting it into shell-style arguments and running it through the package manager, so native compiler binaries such as `tsgo` work from paths containing spaces or Windows backslashes
