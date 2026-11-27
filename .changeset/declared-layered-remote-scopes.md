---
'@module-federation/enhanced': patch
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

Initialize remotes in their declared share scopes when a build uses layered sharing and a scope list is involved. Layered containers can register providers in additional scopes supplied by the host. Unlayered builds keep the existing initialization behavior.
