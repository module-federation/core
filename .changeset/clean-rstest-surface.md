---
'@module-federation/rstest': patch
---

Slim the public API to `federation`, `FEDERATION_PLUGIN_NAME`, and the option types: drop the `pluginModuleFederation` alias and stop re-exporting the internal `shouldKeepBundledForFederation` predicate.
