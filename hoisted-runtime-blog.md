Module Federation now uses Rspack's runtime capabilities instead of patching user entry points, making federation available before entry point evaluation.

Previously, Module Federation was injected into user entry points as the first imported item. This approach caused several issues: federation runtime was duplicated across entry points when using a single runtime chunk, remote modules weren't available at startup unless entry points were loaded on the page, and programmatically created entry points like web workers weren't properly handled.

The new implementation adds a runtime module that initializes federation during Rspack's runtime phase, similar to webpack's v1 Module Federation. Federation runtime is hoisted into runtime chunks regardless of code splitting rules, ensuring it's eagerly available for startup.

This approach:
- Eliminates `"should have __webpack_require__.f.consumes"` errors and sharing initialization failures
- Prevents federation runtime duplication across entry points (~70kb savings per entry)  
- Fixes web worker compatibility issues by ensuring federation is in runtime, not entry points
- Resolves remote container availability problems that caused startup errors

For applications with multiple entry points using `runtimeChunk: 'single'`, this reduces federation overhead from 210kb to 70kb (67% reduction).

See [Module Federation optimization options](https://module-federation.io/configure/experiments.html#optimization) for further bundle size reductions.