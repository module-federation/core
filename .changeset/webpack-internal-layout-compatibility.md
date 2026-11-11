---
"@module-federation/sdk": patch
"@module-federation/enhanced": patch
---

Support relocated Webpack 5.112 internals while preserving older Webpack layouts, and handle hashed output filenames during federation runtime generation. Resolve the active compiler in CommonJS and ES modules, and keep the SDK browser entry free of Node-only resolver dependencies.
