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

const { join } = require('node:path');
const { pathToFileURL } = require('node:url');
const { registerNativeHttpLoader } = require('./loader-hooks/register.js');

registerNativeHttpLoader({
  hooksUrl: pathToFileURL(join(__dirname, 'loader-hooks', 'hooks.mjs')).href,
});
