---
'@module-federation/bridge-react-webpack-plugin': patch
'@module-federation/bridge-react': patch
---

Resolve React Router 8, whose package has no `main` entry, by pointing the bridge router alias at the entry file for the current build mode, and accept `react-router` ^8 as a peer.
