// Run after building @module-federation/enhanced and its workspace dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const root =
  process.env.MF_REPRO_BUILD_ROOT || path.resolve(__dirname, '../..');
const legacy = process.env.MF_REPRO_LEGACY === '1';
const publicPathControl = process.argv.includes('--public-path-control');
const webpack = require(require.resolve('webpack', { paths: [root] }));
const { ModuleFederationPlugin } = require(
  path.join(root, 'packages/enhanced'),
);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-shared-platform-'));
const requests = [];
const assets = new Map();
const server = http.createServer((req, res) => {
  requests.push(req.url);
  const asset = assets.get(req.url.split('?')[0]);
  if (asset === undefined) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.end(asset);
});
let compiler;
async function main() {
  fs.mkdirSync(path.join(dir, 'src/node_modules/shared-lib'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(dir, 'src/node_modules/shared-lib/package.json'),
    JSON.stringify({ name: 'shared-lib', version: '1.0.0', main: 'index.js' }),
  );
  fs.writeFileSync(
    path.join(dir, 'src/node_modules/shared-lib/index.js'),
    "module.exports = { token: 'secondary-shared-fallback' };",
  );
  fs.writeFileSync(
    path.join(dir, 'src/index.js'),
    (publicPathControl
      ? 'globalThis.__mfPublicPathControl = __webpack_public_path__;\n'
      : '') +
      "function discoverShared() { return import('shared-lib'); } module.exports = Promise.resolve().then(async () => { const f = __webpack_require__.federation; const getter = f.bundlerRuntime.getSharedFallbackGetter({ shareKey: 'shared-lib', version: '1.0.0', webpackRequire: __webpack_require__, libraryType: 'commonjs-module', factory: () => { throw new Error('unexpected local fallback'); } }); const factory = await getter(); return { value: factory().token, remoteRejected: f.instance.loadRemote('unavailable/thing').then(() => false, e => e.message.includes('Remote loading is disabled')) }; });",
  );
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  compiler = webpack({
    mode: 'development',
    target: 'async-node',
    context: path.join(dir, 'src'),
    entry: './index.js',
    devtool: false,
    cache: false,
    optimization: {
      minimize: false,
      concatenateModules: false,
      usedExports: false,
      sideEffects: false,
    },
    output: {
      path: path.join(dir, 'dist'),
      filename: 'main.cjs',
      chunkFilename: '[id].js',
      publicPath: `http://127.0.0.1:${server.address().port}/`,
      library: { type: 'commonjs-module' },
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      new ModuleFederationPlugin({
        name: 'shared_platform_proof',
        dts: false,
        manifest: false,
        library: { type: 'commonjs-module' },
        shared: {
          'shared-lib': {
            requiredVersion: '*',
            version: '1.0.0',
            treeShaking: { mode: 'runtime-infer' },
          },
        },
        experiments: {
          composedRuntime: !legacy,
          optimization: {
            disableRemote: !legacy,
            disableSnapshot: true,
            target: 'node',
          },
        },
      }),
    ],
  });
  const stats = await new Promise((resolve, reject) =>
    compiler.run((error, result) => (error ? reject(error) : resolve(result))),
  );
  assert.equal(
    stats.hasErrors(),
    false,
    stats.toString({ errors: true, warnings: true }),
  );
  const nonInitialChunks = [...stats.compilation.chunks].filter(
    (chunk) => !chunk.canBeInitial(),
  );
  assert.equal(
    nonInitialChunks.length,
    0,
    'main compilation must have no asynchronous chunks',
  );
  const files = [...stats.compilation.modules]
    .map((m) => m.resource || '')
    .filter(Boolean);
  const outputPath = compiler.options.output.path;
  for (const entry of fs.readdirSync(outputPath, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    const url = '/' + path.relative(outputPath, file).split(path.sep).join('/');
    assets.set(url, fs.readFileSync(file));
  }
  for (const requestPath of [
    '/../src/node_modules/shared-lib/index.js',
    '/%2e%2e/src/node_modules/shared-lib/index.js',
    '/missing.js',
    '/independent-packages/',
  ]) {
    const status = await new Promise((resolve, reject) => {
      http
        .get(
          {
            hostname: '127.0.0.1',
            port: server.address().port,
            path: requestPath,
          },
          (response) => {
            response.resume();
            response.on('end', () => resolve(response.statusCode));
            response.on('error', reject);
          },
        )
        .on('error', reject);
    });
    assert.equal(status, 404, requestPath);
  }
  const result = await require(path.join(dir, 'dist/main.cjs'));
  if (publicPathControl)
    assert.equal(
      globalThis.__mfPublicPathControl,
      compiler.options.output.publicPath,
    );
  assert.equal(result.value, 'secondary-shared-fallback');
  assert.equal(await result.remoteRejected, !legacy);
  assert.equal(
    requests.some((url) => url.endsWith('/share-entry.js')),
    true,
    JSON.stringify(requests),
  );
  if (!legacy)
    assert.equal(
      files.some((file) =>
        /runtime-core[\\/]dist[\\/]platform[\\/]node\./.test(file),
      ),
      true,
    );
  if (!legacy)
    assert.equal(
      files.some((file) =>
        /runtime-core[\\/]dist[\\/]remote[\\/]capability\./.test(file),
      ),
      false,
    );
  if (!legacy)
    assert.equal(
      files.some((file) =>
        /runtime-core[\\/]dist[\\/]plugins[\\/]snapshot[\\/]capability\./.test(
          file,
        ),
      ),
      false,
    );
  process.stdout.write(
    JSON.stringify(
      {
        value: result.value,
        requests,
        remoteDisabled: !legacy,
        configuredPlatform: 'node',
        platformNodeModule: files.some((file) =>
          /runtime-core[\\/]dist[\\/]platform[\\/]node\./.test(file),
        ),
        nonInitialChunks: nonInitialChunks.length,
        remoteCapability: legacy ? 'legacy full runtime' : false,
        snapshotCapability: legacy ? 'legacy full runtime' : false,
      },
      null,
      2,
    ) + '\n',
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (compiler)
      await new Promise((resolve, reject) =>
        compiler.close((error) => (error ? reject(error) : resolve())),
      ).catch((error) => {
        console.error(error);
        process.exitCode = 1;
      });
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  });
