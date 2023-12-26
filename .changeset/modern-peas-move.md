---
'@module-federation/webpack-bundler-runtime': patch
'@module-federation/nextjs-mf': patch
'@module-federation/runtime': patch
'@module-federation/sdk': patch
---

Support offline remotes recovery in errorLoadRemote. Allows hook to return a Module / factory / fallback mock when a request fails or container cannot be accessed
