/**
 * Build script for app2 (remote)
 *
 * app2 builds three separate webpack compilations:
 * - client (browser)
 * - rsc (server, react-server condition)
 * - ssr (server HTML from Flight; must not use react-server condition at runtime)
 *
 * Keep configs split per-layer for parity with app1.
 */

'use strict';

const path = require('path');
const rimraf = require('rimraf');
const webpack = require('webpack');

// Clean build directory before starting
rimraf.sync(path.resolve(__dirname, '../build'));

const clientConfig = require('./client.build');
const serverConfig = require('./server.build');
const ssrConfig = require('./ssr.build');

// =====================================================================================
function handleStats(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    process.exit(1);
  }
  const info = stats.toJson();
  if (stats.hasErrors()) {
    console.log('Finished running webpack with errors.');
    info.errors.forEach((e) => console.error(e));
    process.exit(1);
  } else {
    console.log('Finished running webpack.');
  }
}

function runWebpack(config) {
  return new Promise((resolve) => {
    const compiler = webpack(config);
    compiler.run((err, stats) => {
      handleStats(err, stats);
      compiler.close(() => resolve(stats));
    });
  });
}

(async () => {
  await runWebpack(clientConfig);
  await runWebpack(serverConfig);
  await runWebpack(ssrConfig);
})();
