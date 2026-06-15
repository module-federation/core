---
'@module-federation/metro': patch
---

fix(metro): normalize remaining Windows path comparisons in the resolver and babel plugin. The init-host/remote-entry origin-module checks, the patched HMRClient check, and the babel plugin's `blacklistedPaths`/`state.filename` check now compare POSIX-normalized paths so they match correctly on Windows, where Metro and `path.resolve` can disagree on path separators.
