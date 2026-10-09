---
'@module-federation/webpack-bundler-runtime': minor
---

Add `createFederation` at `./compose` and four adapters at `./adapters/remotes`, `./adapters/consumes`, `./adapters/share-scope`, and `./adapters/container`, so a generated bootstrap can import only the bundler runtime parts a build uses. The root export is rebuilt from the same adapters and keeps its keys and `federation.runtime`.
