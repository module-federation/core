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
const fs = require('fs');

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

/**
 * Inject SSR registry into ssr.js bundle post-build.
 * This must run after compiler.run() completes because ReactServerWebpackPlugin
 * writes the manifest during the 'done' hook, which runs after our webpack plugins.
 */
function injectSSRRegistry() {
  const buildDir = path.resolve(__dirname, '../build');
  const ssrManifestPath = path.join(buildDir, 'react-ssr-manifest.json');
  const ssrPath = path.join(buildDir, 'ssr.js');
  if (!fs.existsSync(ssrManifestPath) || !fs.existsSync(ssrPath)) return;

  try {
    const ssrManifest = JSON.parse(fs.readFileSync(ssrManifestPath, 'utf8'));
    const moduleMap = ssrManifest.moduleMap || {};
    const clientComponents = {};
    for (const [moduleId, exportsMap] of Object.entries(moduleMap)) {
      const anyExport = exportsMap['*'] || Object.values(exportsMap)[0];
      const specifier = anyExport?.specifier || moduleId;
      const ssrRequest = moduleId.replace(/^\(client\)/, '(ssr)');
      clientComponents[moduleId] = {
        moduleId,
        request: ssrRequest,
        ssrRequest,
        chunks: [],
        exports: Object.keys(exportsMap),
        filePath: specifier?.replace?.(/^file:\/\//, ''),
      };
    }
    const registryCode = `globalThis.__RSC_SSR_REGISTRY_INJECTED__=${JSON.stringify(clientComponents)};`;
    const ssrContent = fs.readFileSync(ssrPath, 'utf-8');
    fs.writeFileSync(ssrPath, registryCode + '\n' + ssrContent);
  } catch (e) {
    console.warn(
      '[injectSSRRegistry] best-effort injection failed:',
      e.message
    );
  }
}

(async () => {
  await runWebpack([clientConfig, serverConfig]);
  await runWebpack(ssrConfig);
  injectSSRRegistry();
})();
