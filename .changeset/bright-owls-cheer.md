---
"@module-federation/dts-plugin": patch
---

Fix Windows TypeScript type generation by invoking the compiler with
`execFile` and properly quoted project paths.
