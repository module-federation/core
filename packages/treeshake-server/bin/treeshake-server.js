#!/usr/bin/env node
/**
 * Wrapper entry for the CLI.
 *
 * pnpm creates workspace bins during install. If the target is a build artifact
 * (e.g. dist/server.js) and the package hasn't been built yet, install fails
 * with ENOENT. This wrapper keeps installs clean, and still runs the built
 * server when it's available.
 */

const path = require('path');

const entry = path.join(__dirname, '..', 'dist', 'server.js');

try {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(entry);
} catch (err) {
  // If dist hasn't been built yet, show a helpful message and exit.
  if (err && (err.code === 'MODULE_NOT_FOUND' || err.code === 'ENOENT')) {
    // eslint-disable-next-line no-console
    console.error(
      [
        'treeshake-server: missing build output at dist/server.js.',
        '',
        'Run:',
        '  pnpm --filter @module-federation/treeshake-server build',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }

  throw err;
}
