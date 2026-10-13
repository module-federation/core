---
'@module-federation/webpack-bundler-runtime': patch
---

Fix a deadlock in `initializeSharing` when two remotes that list each other
initialize from two concurrent init chains, for example when a host loads both
while they use the default `version-first` share strategy.
