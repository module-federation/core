---
'@module-federation/enhanced': patch
'@module-federation/manifest': patch
'@module-federation/sdk': patch
---

Preserve same-version shared implementations in different scalar share scopes during Webpack runtime registration and manifest generation. Keep each scope’s assets separate while retaining legacy public shared IDs. Resolve aliased shared configuration by share key, scope, and layer, and preserve disabled version requirements.
