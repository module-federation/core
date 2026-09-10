// Node 24 hook for integration tools which import Rspack through either ESM or CJS.
// Unlike patching Module._resolveFilename, this also covers Rslib's ESM imports.
const { registerHooks } = require('node:module');
const { pathToFileURL } = require('node:url');
const { isAbsolute } = require('node:path');
const entry = process.env.SSR_CACHE_RSPACK_ENTRY;
if (!entry || !isAbsolute(entry)) {
  throw new Error(
    'SSR_CACHE_RSPACK_ENTRY must be an absolute built Rspack entry',
  );
}
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '@rspack/core' || specifier === '@rspack-canary/core') {
      return { url: pathToFileURL(entry).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
