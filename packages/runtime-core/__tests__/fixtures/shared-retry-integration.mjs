import { execFileSync } from 'node:child_process';
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
const revision = process.argv[3];
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
    plugins: revision
      ? [
          {
            name: 'compare-revision',
            setup(build) {
              build.onLoad(
                {
                  filter:
                    /packages\/(runtime-core|sdk|error-codes)\/src\/.*\.ts$/,
                },
                (args) => ({
                  contents: execFileSync(
                    'git',
                    ['show', `${revision}:${path.relative(repo, args.path)}`],
                    { cwd: repo, encoding: 'utf8' },
                  ),
                  loader: 'ts',
                  resolveDir: path.dirname(args.path),
                }),
              );
            },
          },
        ]
      : [],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source.outputFiles[0].text)(
    require,
    module,
    module.exports,
  );
  const { ModuleFederation } = module.exports;
  let failNext = scenario.startsWith('retry-');
  let delayed = scenario.endsWith('-pending');
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
      if (delayed) await release.promise;
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
            // Node does not import HTTP URLs directly. Evaluate the fetched
            // ESM through its native loader, preserving normal module caching.
            const url = `data:text/javascript;base64,${Buffer.from(await response.text()).toString('base64')}`;
            loadedStore = (await import(url)).store;
            return () => loadedStore;
          })();
        },
      },
    },
  });
  let initialError;
  if (scenario.startsWith('retry-')) {
    try {
      await mf.loadShare('store');
    } catch (error) {
      initialError = error.message;
    }
  }
  const first = mf.loadShare('store').then(
    (factory) => ({ store: factory() }),
    (error) => ({ error: error.message }),
  );
  if (delayed) {
    const outcome = await Promise.race([
      requested.promise.then(() => 'requested'),
      first.then(() => 'finished'),
    ]);
    if (outcome === 'finished') {
      console.log(
        JSON.stringify({ initialError, retryError: (await first).error }),
      );
    } else {
      mf.registerRemotes([
        { name: 'remote', entry: `${origin}/remoteEntry.js` },
      ]);
      const consumer = await mf.loadRemote('remote/consumer');
      const remote = await consumer.consume();
      const remoteBefore = remote.increment();
      delayed = false;
      release.resolve();
      const { store: local } = await first;
      const localAfter = local.increment();
      console.log(
        JSON.stringify({
          initialError,
          localVersion: local.version,
          remoteVersion: remote.version,
          remoteBefore,
          localAfter,
          remoteAfter: remote.read(),
        }),
      );
    }
  } else {
    const { store: local, error } = await first;
    if (error) {
      console.log(JSON.stringify({ initialError, retryError: error }));
    } else {
      const localBefore = local.increment();
      mf.registerRemotes([
        { name: 'remote', entry: `${origin}/remoteEntry.js` },
      ]);
      const consumer = await mf.loadRemote('remote/consumer');
      const remote = await consumer.consume();
      console.log(
        JSON.stringify({
          initialError,
          localVersion: local.version,
          remoteVersion: remote.version,
          localBefore,
          remoteAfter: remote.increment(),
          localAfter: local.read(),
        }),
      );
    }
  }
} finally {
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  await rm(dir, { recursive: true, force: true });
}
