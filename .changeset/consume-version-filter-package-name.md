---
'@module-federation/enhanced': patch
---

Read the version for `include.version` and `exclude.version` on consumed
shared modules from the `package.json` whose `name` matches the consumed
package. Prefix consumes such as `'lib/'` matched against `lib/sub`, scoped
packages, and `node_modules` suffix matches previously skipped the filter
and were always consumed. Relative, absolute, and aliased consume configs
are unchanged unless `packageName` is set.
