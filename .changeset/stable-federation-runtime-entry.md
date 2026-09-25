---
'@module-federation/enhanced': patch
---

Make the generated federation runtime entry deterministic and valid. The
fallback container name no longer contains the build time, so two identical
builds without `output.uniqueName` produce the same output. Relative
`runtimePlugins` paths now resolve against the compiler `context` instead of
the process working directory, and paths that contain a quote no longer break
the generated entry.
