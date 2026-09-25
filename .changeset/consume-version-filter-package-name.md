---
'@module-federation/enhanced': patch
---

Apply `include.version` and `exclude.version` on consumed shared modules by the
version of the package that owns the resolved fallback. Prefix consumes such as
`'lib/'` matched against `lib/sub`, aliases, relative or absolute requests, and
nested `package.json` files without a name previously skipped the filter and
were always consumed.
