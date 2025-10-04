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

describe('Module Federation worker async runtime integration', () => {
  let tempDir: string;
  const tempDirs: string[] = [];

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-worker-test-'));
    tempDirs.push(tempDir);
  });

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

  it('keeps remote runtime helpers on both the shared runtime chunk and worker chunk', async () => {
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
        runtimeChunk: { name: 'mf-runtime' },
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'host',
          remotes: {
            remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js',
          },
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

    const compilation = stats.compilation;
    const { chunkGraph } = compilation;

    const runtimeChunk = Array.from(compilation.chunks).find(
      (chunk) => chunk.name === 'mf-runtime',
    );
    expect(runtimeChunk).toBeDefined();

    const workerChunk = Array.from(compilation.chunks).find((chunk) => {
      for (const module of chunkGraph.getChunkModulesIterable(chunk)) {
        if (module.resource && module.resource.endsWith('worker.js')) {
          return true;
        }
      }
      return false;
    });
    expect(workerChunk).toBeDefined();

    const runtimeModulesOnShared = Array.from(
      chunkGraph.getChunkRuntimeModulesIterable(runtimeChunk!),
    );
    expect(runtimeModulesOnShared.length).toBeGreaterThan(0);

    const sharedHasRemoteRuntime = runtimeModulesOnShared.some(
      (runtimeModule) =>
        runtimeModule.constructor?.name?.includes('RemoteRuntimeModule'),
    );
    expect(sharedHasRemoteRuntime).toBe(true);

    const runtimeModulesOnWorker = Array.from(
      chunkGraph.getChunkRuntimeModulesIterable(workerChunk!),
    );
    const workerHasRemoteRuntime = runtimeModulesOnWorker.some(
      (runtimeModule) =>
        runtimeModule.constructor?.name?.includes('RemoteRuntimeModule'),
    );
    expect(workerHasRemoteRuntime).toBe(true);
  });
});
