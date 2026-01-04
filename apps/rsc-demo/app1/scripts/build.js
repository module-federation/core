/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
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

function handleStats(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    process.exit(1);
  }
  const info = stats.toJson({ all: false, errors: true, warnings: true });
  if (stats.hasErrors()) {
    console.log('Finished running webpack with errors.');
    if (Array.isArray(info.errors)) {
      info.errors.forEach((e) => console.error(e));
    }
    if (Array.isArray(info.children)) {
      info.children.forEach((child) => {
        if (Array.isArray(child?.errors) && child.errors.length > 0) {
          console.error(`\n[${child.name || 'child'}]`);
          child.errors.forEach((e) => console.error(e));
        }
      });
    }
    process.exit(1);
  } else {
    console.log('Finished running webpack.');
  }
}

function runWebpack(configs) {
  return new Promise((resolve) => {
    const compiler = webpack(configs);
    compiler.run((err, stats) => {
      handleStats(err, stats);
      compiler.close(() => resolve(stats));
    });
  });
}

(async () => {
  await runWebpack([clientConfig, serverConfig, ssrConfig]);
})();
