---
'@module-federation/dts-plugin': patch
---

Run `dts.generateTypes.compilerInstance` directly when it is an absolute path to an existing file (on Windows, an `.exe` file), so the path is no longer split at spaces or stripped of its backslashes. Other Windows paths are handled as before.
