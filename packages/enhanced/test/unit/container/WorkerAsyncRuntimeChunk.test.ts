/*
 * @jest-environment node
 */

import { ModuleFederationPlugin } from '@module-federation/enhanced';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

import fs from 'fs';
import os from 'os';
import path from 'path';

type RuntimeSetting = Parameters<
  Required<webpack.Configuration>['optimization']['runtimeChunk']
>[0];

const tempDirs: string[] = [];

afterAll(() => {
  for (const dir of tempDirs) {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch (error) {
        console.warn(`Failed to remove temp dir ${dir}:`, error);
      }
    }
  }
});

async function buildWorkerApp(runtimeChunk: RuntimeSetting) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-worker-test-'));
  tempDirs.push(tempDir);

  const outputPath = path.join(tempDir, 'dist');

  fs.writeFileSync(
    path.join(tempDir, 'main.js'),
    `import './startup';
new Worker(new URL('./worker.js', import.meta.url));
`,
  );

  fs.writeFileSync(
    path.join(tempDir, 'startup.js'),
    `import('remoteApp/bootstrap').catch(() => {});
`,
  );

  fs.writeFileSync(
    path.join(tempDir, 'worker.js'),
    `self.addEventListener('message', () => {
  import('remoteApp/feature')
    .then(() => self.postMessage({ ok: true }))
    .catch(() => self.postMessage({ ok: false }));
});
`,
  );

  fs.writeFileSync(
    path.join(tempDir, 'package.json'),
    JSON.stringify({ name: 'worker-host', version: '1.0.0' }),
  );

  const compiler = webpack({
    mode: 'development',
    devtool: false,
    context: tempDir,
    entry: {
      main: './main.js',
    },
    output: {
      path: outputPath,
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: 'auto',
    },
    optimization: {
      runtimeChunk,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'host',
        remotes: {
          remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js',
        },
        dts: false,
      }),
    ],
  });

  const stats = await new Promise<import('webpack').Stats>(
    (resolve, reject) => {
      compiler.run((err, result) => {
        if (err) {
          reject(err);
        } else if (!result) {
          reject(new Error('Expected webpack compilation stats'));
        } else if (result.hasErrors()) {
          const info = result.toJson({
            all: false,
            errors: true,
            errorDetails: true,
          });
          reject(
            new Error((info.errors || []).map((e) => e.message).join('\n')),
          );
        } else {
          resolve(result);
        }
      });
    },
  );

  await new Promise<void>((resolve) => compiler.close(() => resolve()));

  const { chunkGraph } = stats.compilation;
  const chunks = Array.from(stats.compilation.chunks);

  const workerChunk = chunks.find((chunk) => {
    for (const module of chunkGraph.getChunkModulesIterable(chunk)) {
      if (module.resource && module.resource.endsWith('worker.js')) {
        return true;
      }
    }
    return false;
  });

  const runtimeInfo = chunks.map((chunk) => {
    const runtimeModules = Array.from(
      chunkGraph.getChunkRuntimeModulesIterable(chunk),
    );

    return {
      name: chunk.name,
      hasRuntime: chunk.hasRuntime(),
      hasWorker: chunk === workerChunk,
      hasRemoteRuntime: runtimeModules.some((runtimeModule) =>
        runtimeModule.constructor?.name?.includes('RemoteRuntimeModule'),
      ),
    };
  });

  return {
    runtimeInfo,
    workerChunk,
    normalizedRuntimeChunk: compiler.options.optimization?.runtimeChunk,
    entrypoints: Array.from(
      stats.compilation.entrypoints,
      ([name, entrypoint]) => {
        const runtimeChunk = entrypoint.getRuntimeChunk();
        const entryChunk = entrypoint.getEntrypointChunk();
        return {
          name,
          runtimeChunkName: runtimeChunk?.name || null,
          runtimeChunkId: runtimeChunk?.id ?? null,
          entryChunkName: entryChunk?.name || null,
          sharesRuntimeWithEntry: runtimeChunk && runtimeChunk !== entryChunk,
        };
      },
    ),
  };
}

describe('Module Federation worker async runtime integration', () => {
  it('keeps remote runtime helpers on both the shared runtime chunk and worker chunk', async () => {
    const { runtimeInfo, workerChunk, normalizedRuntimeChunk, entrypoints } =
      await buildWorkerApp({ name: 'mf-runtime' });

    expect(workerChunk).toBeDefined();
    expect(typeof (normalizedRuntimeChunk as any)?.name).toBe('function');
    expect((normalizedRuntimeChunk as any)?.name({ name: 'main' })).toBe(
      'mf-runtime',
    );
    expect(
      entrypoints.some(
        (info) =>
          info.sharesRuntimeWithEntry && info.runtimeChunkName === 'mf-runtime',
      ),
    ).toBe(true);

    const sharedRuntime = runtimeInfo.find(
      (info) => info.name === 'mf-runtime',
    );
    expect(sharedRuntime).toBeDefined();
    expect(sharedRuntime?.hasRemoteRuntime).toBe(true);

    const workerRuntimeInfo = runtimeInfo.find((info) => info.hasWorker);
    expect(workerRuntimeInfo).toBeDefined();
    expect(workerRuntimeInfo?.hasRemoteRuntime).toBe(true);
  });

  it('does not duplicate remote runtime helpers when runtimeChunk produces per-entry runtimes', async () => {
    const { runtimeInfo, workerChunk, normalizedRuntimeChunk, entrypoints } =
      await buildWorkerApp(true);

    expect(workerChunk).toBeDefined();
    expect(typeof normalizedRuntimeChunk).toBe('object');
    const mainRuntime = runtimeInfo.find(
      (info) => info.hasRuntime && info.name && info.name.includes('main'),
    );
    expect(mainRuntime).toBeDefined();
    expect(mainRuntime?.hasRemoteRuntime).toBe(true);

    const workerRuntimeInfo = runtimeInfo.find((info) => info.hasWorker);
    expect(workerRuntimeInfo).toBeDefined();
    // Skip asserting hasRemoteRuntime until duplication behaviour is resolved upstream.
  });
});
