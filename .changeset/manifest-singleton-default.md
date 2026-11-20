---
'@module-federation/managers': patch
---

Default `singleton` to `false` when normalizing shared options, matching the
runtime. A shared dependency configured without `singleton` was reported as
`singleton: true` in `mf-stats.json` and `mf-manifest.json` while the runtime
registered it as non-singleton.
