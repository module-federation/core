---
"@module-federation/sdk": patch
"@module-federation/enhanced": patch
"@module-federation/node": patch
---

Support webpack 5.112's relocated internals while preserving older layouts. Resolve each candidate through the caller's resolver and accept it only inside the caller's webpack package.

Resolve the active compiler in CommonJS and ES modules. `getWebpackPath` returns the entry of the webpack package that contains the compiler, or an empty string for a bundled compiler. Keep the SDK browser entry free of Node-only resolver dependencies.

Generate output paths with webpack's `chunkRootOutputDir` on 5.110 and later. On older webpack, use the real chunk filename so hashes containing `/` have the correct depth. This applies to the federation runtime and the Node chunk loading and public path runtime modules.

With top-level await and ESM output, check `output.module` for async startup instead of `experiments.outputModule`, which webpack 5.112 ignores. Use namespace imports in independent shared builds so packages without a default export compile.
