---
"@module-federation/runtime-core": patch
"@module-federation/webpack-bundler-runtime": patch
---

Preserve shared provider factories when removing a remote registered under a different name from its container. Resolve provider ownership using the container global name as well as the registration name, including already-detached provider runtimes.
