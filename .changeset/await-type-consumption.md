---
'@module-federation/dts-plugin': patch
---

Make `consumeTypesAPI` resolve after remote types have been downloaded instead of as soon as the download starts, so `mf dts` and builds with `dts.generateTypes: false` wait for the fetch.
