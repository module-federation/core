---
"@module-federation/sdk": patch
"@module-federation/enhanced": patch
"@module-federation/node": patch
---

Support relocated Webpack 5.112 internals while preserving older Webpack layouts, and handle hashed output filenames during runtime generation in the federation runtime and the Node chunk loading and public path runtime modules. Choose the internal layout inside the Webpack copy the calling package resolves, so internals never come from an older Webpack hoisted above it. Resolve the active compiler in CommonJS and ES modules. `getWebpackPath` now returns the entry of the Webpack package that contains the compiler, and an empty string for a bundled compiler. Keep the SDK browser entry free of Node-only resolver dependencies.
