---
"@module-federation/sdk": patch
"@module-federation/enhanced": patch
"@module-federation/node": patch
---

Support webpack 5.112's relocated internals while preserving older layouts. Resolve each candidate through the caller's resolver and accept it only inside the caller's webpack package.

Resolve the active compiler in CommonJS and ES modules. `getWebpackPath` returns the entry of the webpack package that contains the compiler, or an empty string for a bundled compiler. Keep the SDK browser entry free of Node-only resolver dependencies.

Generate output paths with webpack's `chunkRootOutputDir` on 5.110 and later. On older webpack, use the real chunk filename so hashes containing `/` have the correct depth. This applies to the federation runtime and the Node chunk loading and public path runtime modules.

For async startup with ESM output, check `output.module` instead of `experiments.outputModule`, which webpack 5.112 ignores. Detect top-level await from `output.environment.topLevelAwait` on webpack 5.111 and later, and treat it as available on 5.102 to 5.110, where webpack removed `experiments.topLevelAwait`. Use namespace imports in independent shared builds so packages without a default export compile.
