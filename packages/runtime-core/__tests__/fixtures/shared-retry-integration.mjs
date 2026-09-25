import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import webpack from 'webpack';

const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);
const scenario = process.argv[2];
if (
  !['loaded', 'retry-loaded', 'initial-pending', 'retry-pending'].includes(
    scenario,
  )
) {
  throw new Error(`Unknown scenario: ${scenario}`);
}
const require = createRequire(path.join(repo, 'package.json'));
const deferred = () => {
  let resolve;
  const promise = new Promise((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
};
const dir = await mkdtemp(path.join(os.tmpdir(), 'shared-retry-integration-'));
let server;
try {
  await writeFile(
    path.join(dir, 'store.js'),
    `let count = 0;
exports.version = '2.0.0';
exports.increment = () => ++count;
exports.read = () => count;
`,
  );
  await writeFile(
    path.join(dir, 'consumer.js'),
    "exports.consume = () => import('store');\n",
  );
  const compiler = webpack({
    mode: 'development',
    context: dir,
    target: 'node',
    entry: {},
    devtool: false,
    output: {
      path: path.join(dir, 'dist'),
      filename: '[name].js',
      library: { type: 'commonjs-module' },
      uniqueName: 'remote',
    },
    plugins: [
      new webpack.container.ModuleFederationPlugin({
        name: 'remote',
        library: { type: 'commonjs-module' },
        filename: 'remoteEntry.js',
        exposes: { './consumer': './consumer.js' },
        shared: {
          store: {
            import: './store.js',
            version: '2.0.0',
            singleton: true,
            requiredVersion: '*',
          },
        },
      }),
      // Keep the HTTP-served Node container self-contained.
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    ],
  });
  try {
    await new Promise((resolve, reject) =>
      compiler.run((error, stats) => {
        if (error || stats.hasErrors())
          reject(
            error || new Error(stats.toString({ all: false, errors: true })),
          );
        else resolve();
      }),
    );
  } finally {
    await new Promise((resolve, reject) =>
      compiler.close((error) => (error ? reject(error) : resolve())),
    );
  }
  const remoteEntry = await readFile(path.join(dir, 'dist/remoteEntry.js'));
  const source = await build({
    stdin: {
      contents:
        "export { ModuleFederation } from './packages/runtime-core/src/core';",
      resolveDir: repo,
      loader: 'ts',
    },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    logLevel: 'silent',
    alias: {
      '@module-federation/sdk': path.join(repo, 'packages/sdk/src/index.ts'),
      '@module-federation/error-codes/browser': path.join(
        repo,
        'packages/error-codes/src/browser.ts',
      ),
      '@module-federation/error-codes': path.join(
        repo,
        'packages/error-codes/src/index.ts',
      ),
    },
    define: {
      __VERSION__: '"integration"',
      ENV_TARGET: '"node"',
      FEDERATION_DEBUG: '"false"',
    },
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source.outputFiles[0].text)(
    require,
    module,
    module.exports,
  );
  const { ModuleFederation } = module.exports;
  const retry = scenario.startsWith('retry-');
  const pending = scenario.endsWith('-pending');
  let failNext = retry;
  const requested = deferred();
  const release = deferred();
  server = createServer(async (request, response) => {
    if (request.url === '/remoteEntry.js') {
      response.setHeader('Content-Type', 'application/javascript');
      response.end(remoteEntry);
    } else if (request.url === '/store.mjs') {
      if (failNext) {
        failNext = false;
        response.writeHead(503).end('temporarily unavailable');
        return;
      }
      requested.resolve();
      if (pending) await release.promise;
      response.setHeader('Content-Type', 'application/javascript');
      response.end(`let count = 0;
export const store = {
  version: '1.0.0',
  increment: () => ++count,
  read: () => count,
};`);
    } else {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let loadedStore;
  const mf = new ModuleFederation({
    name: 'host',
    remotes: [],
    shareStrategy: 'version-first',
    shared: {
      store: {
        version: '1.0.0',
        shareConfig: { singleton: true, requiredVersion: '*' },
        get: () => {
          if (loadedStore) return () => loadedStore;
          return (async () => {
            const response = await fetch(`${origin}/store.mjs`);
            if (!response.ok)
              throw new Error(`store request failed: ${response.status}`);
            // Node cannot import an HTTP URL, so import the fetched source as a data URL.
            const url = `data:text/javascript;base64,${Buffer.from(await response.text()).toString('base64')}`;
            loadedStore = (await import(url)).store;
            return () => loadedStore;
          })();
        },
      },
    },
  });
  const loadRemoteStore = async () => {
    mf.registerRemotes([{ name: 'remote', entry: `${origin}/remoteEntry.js` }]);
    const consumer = await mf.loadRemote('remote/consumer');
    return consumer.consume();
  };

  let initialError;
  if (retry) {
    initialError = await mf.loadShare('store').then(
      () => 'first load unexpectedly succeeded',
      (error) => error.message,
    );
  }
  const hostLoad = mf.loadShare('store');
  let result;
  if (pending) {
    // Hold the host's store response until the remote has consumed and changed the store.
    await Promise.race([requested.promise, hostLoad]);
    const remote = await loadRemoteStore();
    const remoteBefore = remote.increment();
    release.resolve();
    const local = (await hostLoad)();
    result = {
      localVersion: local.version,
      remoteVersion: remote.version,
      remoteBefore,
      localAfter: local.increment(),
      remoteAfter: remote.read(),
    };
  } else {
    const local = (await hostLoad)();
    const localBefore = local.increment();
    const remote = await loadRemoteStore();
    result = {
      localVersion: local.version,
      remoteVersion: remote.version,
      localBefore,
      remoteAfter: remote.increment(),
      localAfter: local.read(),
    };
  }
  console.log(JSON.stringify({ initialError, ...result }));
} finally {
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  await rm(dir, { recursive: true, force: true });
}
