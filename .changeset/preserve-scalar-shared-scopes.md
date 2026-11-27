---
'@module-federation/enhanced': patch
'@module-federation/manifest': patch
'@module-federation/managers': patch
'@module-federation/sdk': patch
---

Preserve same-version shared implementations in different scalar share scopes during Webpack runtime registration and manifest generation. Keep each scope’s assets separate while retaining legacy public shared IDs. Resolve aliased shared configuration by share key, scope, and layer, and preserve disabled version requirements. Emit the public share key in `mf-stats.json` and `mf-manifest.json` even when `disableAssetsAnalyze` is enabled.

Shares without their own scope inherit the plugin's scope. Both manifest readers use the matching prefix's options for subpath shares in default and custom scopes.
