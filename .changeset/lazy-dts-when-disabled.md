---
'@module-federation/manifest': patch
'@module-federation/rspack': patch
---

Load `@module-federation/dts-plugin` lazily so builds with `dts: false` no
longer import the DTS toolchain (and its TypeScript dependency) at module load
time.
