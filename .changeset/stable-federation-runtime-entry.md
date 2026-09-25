---
'@module-federation/enhanced': patch
---

Make the generated federation runtime entry stable and valid. When
`output.uniqueName` is empty, the fallback container name no longer contains
the build time. It is now derived from the compiler name and context, so it is
the same on every build of the same checkout but differs between machines, and
the build emits a warning that asks for `output.uniqueName` or a plugin `name`.
Relative `runtimePlugins` paths now resolve against the compiler `context`. A
path that only exists relative to the working directory still loads, with a
warning that asks you to update it. Paths that contain a quote no longer break
the generated entry.
