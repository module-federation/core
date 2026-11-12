---
'@module-federation/sdk': patch
'@module-federation/manifest': patch
'@module-federation/rspack': patch
'@module-federation/enhanced': patch
'@module-federation/rsbuild-plugin': patch
---

Identify completed builds by emitted asset content so fixed filenames and unchanged package versions still support update detection. Preserve explicit release versions and combine browser and Node identities when merging SSR manifests without mutating retained compiler outputs or requiring peer rebuilds.
