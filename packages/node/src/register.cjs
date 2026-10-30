/**
 * Side-effect entry point (CommonJS) enabling the Module Federation native
 * HTTP(S) ESM loader:
 *
 *   node --import @module-federation/node/register app.mjs
 *   // or
 *   require('@module-federation/node/register');
 *
 * Shipped as a verbatim .cjs file (see register.mjs for the ESM variant);
 * both exist because locating the sibling hooks module portably requires
 * `__dirname` in CJS and `import.meta.url` in ESM.
 */
'use strict';

const { registerNativeHttpLoader } = require('./loader-hooks/register.js');

// The CJS build of register.ts resolves the sibling hooks.mjs itself via
// `__dirname` (see defaultHooksUrl), so no hooksUrl is needed here.
registerNativeHttpLoader();
