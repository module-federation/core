---
'@module-federation/sdk': patch
'@module-federation/managers': patch
'@module-federation/manifest': patch
---

Record each shared dependency's share scope in `mf-stats.json` and
`mf-manifest.json`. The scope is read from the module the bundler registered,
so a plugin-level `shareScope` is reflected instead of being reported as
`default`, and a package shared in more than one scope now produces one entry
per scope instead of collapsing to the first one.
