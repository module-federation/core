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

async function buildDynamicImportApp(runtimeChunk: RuntimeSetting) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-dynamic-test-'));
  tempDirs.push(tempDir);

  const outputPath = path.join(tempDir, 'dist');

  fs.writeFileSync(
    path.join(tempDir, 'main.js'),
    `export async function loadLazy() {
  const mod = await import('./lazy');
  return mod.remoteFeature();
}
`,
  );

  fs.writeFileSync(
    path.join(tempDir, 'lazy.js'),
    `export function remoteFeature() {
  return import('remoteApp/feature');
}
`,
  );

  fs.writeFileSync(
    path.join(tempDir, 'package.json'),
    JSON.stringify({ name: 'dynamic-host', version: '1.0.0' }),
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

  const lazyChunk = chunks.find((chunk) => {
    for (const module of chunkGraph.getChunkModulesIterable(chunk)) {
      if (module.resource && module.resource.endsWith('lazy.js')) {
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
      isLazyChunk: chunk === lazyChunk,
      hasRemoteRuntime: runtimeModules.some((runtimeModule) =>
        runtimeModule.constructor?.name?.includes('RemoteRuntimeModule'),
      ),
    };
  });

  return {
    runtimeInfo,
    lazyChunk,
    normalizedRuntimeChunk: compiler.options.optimization?.runtimeChunk,
  };
}

describe('Module Federation dynamic import runtime integration', () => {
  it('clones shared runtime helpers into lazy chunk when using a single runtime chunk', async () => {
    const { runtimeInfo, lazyChunk, normalizedRuntimeChunk } =
      await buildDynamicImportApp({ name: 'mf-runtime' });

    expect(lazyChunk).toBeDefined();
    expect(typeof (normalizedRuntimeChunk as any)?.name).toBe('function');
    expect((normalizedRuntimeChunk as any)?.name({ name: 'main' })).toBe(
      'mf-runtime',
    );

    const sharedRuntime = runtimeInfo.find((info) => info.hasRuntime);
    expect(sharedRuntime).toBeDefined();
    expect(sharedRuntime?.hasRemoteRuntime).toBe(true);
  });

  it('keeps lazy chunk lean when runtimeChunk creates per-entry runtimes', async () => {
    const { runtimeInfo, lazyChunk, normalizedRuntimeChunk } =
      await buildDynamicImportApp(true);

    expect(lazyChunk).toBeDefined();
    expect(typeof normalizedRuntimeChunk).toBe('object');

    const sharedRuntime = runtimeInfo.find((info) => info.hasRuntime);
    expect(sharedRuntime).toBeDefined();
    expect(sharedRuntime?.hasRemoteRuntime).toBe(true);

    const lazyRuntimeInfo = runtimeInfo.find((info) => info.isLazyChunk);
    expect(lazyRuntimeInfo).toBeDefined();
    expect(lazyRuntimeInfo?.hasRemoteRuntime).toBe(false);
  });
});
