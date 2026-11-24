---
'@module-federation/enhanced': patch
'@module-federation/node': patch
---

Prefer `compiler.webpack` public APIs (webpack 5.113.0+ and future webpack 6) with feature-detected `normalizeWebpackPath` fallbacks for webpack 5.64.4–5.112.2, replace private `memoize`/`fs`/`ExternalsType.check.js` dependencies with local implementations, and bind `compiler.webpack` in `BaseWrapperPlugin` before lazily loading core modules.
