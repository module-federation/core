---
'@module-federation/bridge-shared': minor
'@module-federation/bridge-react': minor
---

Share browser-connected application routing coordination across framework adapters. The connector reconciles initial redirects, avoids restarting a navigation already processing the same history entry, and cleans up subscriptions and queued work per mount. React Bridge exports the connector without requiring React Router. The connector uses one complete route URL and entry key with a fixed basename per mount. Framework consumers create a new mount when that basename changes, while ordinary props and navigation updates retain their state.
