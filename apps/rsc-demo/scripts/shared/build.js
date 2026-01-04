'use strict';

const path = require('path');
const rimraf = require('rimraf');
const webpack = require('webpack');

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

async function runBuild({ clientConfig, serverConfig, ssrConfig, buildDir }) {
  if (!buildDir) {
    throw new Error('runBuild requires a buildDir');
  }
  rimraf.sync(buildDir);
  await runWebpack([clientConfig, serverConfig, ssrConfig]);
}

module.exports = { runBuild };

if (require.main === module) {
  const cwd = process.cwd();
  const clientConfig = require(path.join(cwd, 'scripts', 'client.build'));
  const serverConfig = require(path.join(cwd, 'scripts', 'server.build'));
  const ssrConfig = require(path.join(cwd, 'scripts', 'ssr.build'));
  const buildDir = path.join(cwd, 'build');
  runBuild({ clientConfig, serverConfig, ssrConfig, buildDir });
}
