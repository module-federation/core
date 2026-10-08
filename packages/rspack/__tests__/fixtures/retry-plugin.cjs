const assert = require('node:assert/strict');
const { writeFileSync } = require('node:fs');
const path = require('node:path');
const { rspack } = require('@rspack/core');
const { ModuleFederationPlugin } = require('../..');

async function main() {
  const directory = process.argv[2];
  assert.ok(directory, 'The test must provide its output directory');
  const originalFetch = global.fetch;
  let compiler;
  try {
    writeFileSync(
      path.join(directory, 'entry.js'),
      `import { getInstance } from '@module-federation/runtime';
       export const loadRemote = () => import('remote/Component');
       export const fetchManifest = (url) =>
         getInstance().loaderHook.lifecycle.fetch.emit(url, { cache: 'no-store' });`,
    );
    compiler = rspack({
      mode: 'development',
      target: 'node',
      context: path.resolve(__dirname, '..'),
      entry: path.join(directory, 'entry.js'),
      output: {
        path: directory,
        filename: 'bundle.js',
        library: { type: 'commonjs2' },
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'retry_plugin_host',
          dts: false,
          manifest: false,
          remotes: {
            remote: 'remote@https://example.com/mf-manifest.json',
          },
          runtimePlugins: [
            [
              require.resolve('@module-federation/retry-plugin'),
              { retryTimes: 1, retryDelay: 0, addQuery: true },
            ],
          ],
        }),
      ],
    });
    await new Promise((resolve, reject) => {
      compiler.run((error, stats) => {
        if (error) return reject(error);
        if (stats.hasErrors()) return reject(new Error(stats.toString()));
        resolve();
      });
    });

    const response = new Response('{}', {
      headers: { 'content-type': 'application/json' },
    });
    const calls = [];
    let failures = 1;
    global.fetch = async (...args) => {
      calls.push(args);
      if (calls.length <= failures) throw new Error('Network error');
      return response;
    };
    const { fetchManifest } = require(path.join(directory, 'bundle.js'));

    assert.equal(
      await fetchManifest('https://example.com/mf-manifest.json'),
      response,
    );
    assert.equal(calls.length, 2);
    assert.equal(calls[0][0], 'https://example.com/mf-manifest.json');
    assert.equal(
      calls[1][0],
      'https://example.com/mf-manifest.json?retryCount=1',
    );
    assert.equal(calls[0][1].cache, 'no-store');
    assert.equal(calls[1][1].cache, 'no-store');

    calls.length = 0;
    failures = Infinity;
    await assert.rejects(
      fetchManifest('https://example.com/mf-manifest.json'),
      /RUNTIME-008/,
    );
    assert.equal(calls.length, 2);
  } finally {
    global.fetch = originalFetch;
    if (compiler) {
      await new Promise((resolve, reject) => {
        compiler.close((error) => (error ? reject(error) : resolve()));
      });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
