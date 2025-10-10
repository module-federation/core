// @ts-nocheck
/*
 * @jest-environment node
 */

import { ModuleFederationPlugin } from '@module-federation/enhanced';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import fs from 'fs';
import os from 'os';
import path from 'path';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

type Chunk = import('webpack').Chunk;
type Module = import('webpack').Module;

const TEMP_PROJECT_PREFIX = 'mf-worker-integration-';

describe('FederationRuntimePlugin worker integration', () => {
  const tempDirs: string[] = [];

  afterAll(() => {
    for (const dir of tempDirs) {
      if (fs.existsSync(dir)) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`Failed to clean temp directory ${dir}:`, error);
        }
      }
    }
  });

  let projectDir: string;
  let allTempDirs: string[] = [];

  beforeAll(() => {
    allTempDirs = [];
  });

  beforeEach(() => {
    projectDir = fs.mkdtempSync(path.join(os.tmpdir(), TEMP_PROJECT_PREFIX));
    fs.mkdirSync(projectDir, { recursive: true });
    allTempDirs.push(projectDir);
  });

  afterEach((done) => {
    if (projectDir && fs.existsSync(projectDir)) {
      setTimeout(() => {
        try {
          fs.rmSync(projectDir, { recursive: true, force: true });
          done();
        } catch (error) {
          console.warn(`Failed to remove temp dir ${projectDir}:`, error);
          try {
            fs.rmdirSync(projectDir, { recursive: true });
            done();
          } catch (fallbackError) {
            console.error(
              `Fallback cleanup failed for ${projectDir}:`,
              fallbackError,
            );
            done();
          }
        }
      }, 100);
    } else {
      done();
    }
  });

  afterAll(() => {
    allTempDirs.forEach((dir) => {
      if (fs.existsSync(dir)) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch (error) {
          console.warn(`Final cleanup failed for ${dir}:`, error);
        }
      }
    });
    allTempDirs = [];
  });

  it('emits federation runtime helpers into the runtime and worker chunks', async () => {
    const tempProjectDir = projectDir;

    fs.writeFileSync(
      path.join(tempProjectDir, 'main.js'),
      `import './bootstrap';

const worker = new Worker(new URL('./worker.js', import.meta.url));
worker.postMessage({ type: 'ping' });
`,
    );

    fs.writeFileSync(
      path.join(tempProjectDir, 'bootstrap.js'),
      `import('remoteApp/bootstrap').catch(() => {
  // ignore remote load errors in tests
});
`,
    );

    fs.writeFileSync(
      path.join(tempProjectDir, 'worker.js'),
      `self.addEventListener('message', async () => {
  try {
    await import('remoteApp/feature');
    self.postMessage({ ok: true });
  } catch (err) {
    self.postMessage({ ok: false, message: err && err.message });
  }
});
`,
    );

    fs.writeFileSync(
      path.join(tempProjectDir, 'package.json'),
      JSON.stringify({ name: 'mf-worker-host', version: '1.0.0' }),
    );

    const outputPath = path.join(tempProjectDir, 'dist');

    const compiler = webpack({
      mode: 'development',
      devtool: false,
      context: tempProjectDir,
      entry: { main: './main.js' },
      output: {
        path: outputPath,
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: 'auto',
      },
      optimization: {
        runtimeChunk: { name: 'mf-runtime' },
        chunkIds: 'named',
        moduleIds: 'named',
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
            return;
          }
          if (!result) {
            reject(new Error('Expected webpack stats result'));
            return;
          }
          if (result.hasErrors()) {
            const info = result.toJson({
              errors: true,
              warnings: false,
              all: false,
              errorDetails: true,
            });
            reject(
              new Error(
                (info.errors || [])
                  .map(
                    (e) => `${e.message}${e.details ? `\n${e.details}` : ''}`,
                  )
                  .join('\n') || 'Webpack compilation failed',
              ),
            );
            return;
          }
          resolve(result);
        });
      },
    );

    await new Promise<void>((resolve) => compiler.close(() => resolve()));

    const { compilation } = stats;
    const { chunkGraph } = compilation;

    const chunks = Array.from(compilation.chunks as Iterable<Chunk>);
    const runtimeChunk = chunks.find((chunk) => chunk.name === 'mf-runtime');
    expect(runtimeChunk).toBeDefined();

    const workerChunk = chunks.find((chunk) => {
      for (const module of chunkGraph.getChunkModulesIterable(
        chunk,
      ) as Iterable<Module>) {
        if (module.resource && module.resource.endsWith('worker.js')) {
          return true;
        }
      }
      return false;
    });
    expect(workerChunk).toBeDefined();

    const mainChunk = chunks.find((chunk) => chunk.name === 'main');

    const runtimeRuntimeModules = Array.from(
      chunkGraph.getChunkRuntimeModulesIterable(runtimeChunk!) || [],
    );
    const workerRuntimeModules = Array.from(
      chunkGraph.getChunkRuntimeModulesIterable(workerChunk!) || [],
    );
    const mainRuntimeModules = mainChunk
      ? Array.from(chunkGraph.getChunkRuntimeModulesIterable(mainChunk) || [])
      : [];

    const hasFederationRuntimeModule = runtimeRuntimeModules.some(
      (mod) => mod.constructor?.name === 'FederationRuntimeModule',
    );
    expect(hasFederationRuntimeModule).toBe(true);

    expect(
      runtimeRuntimeModules.filter(
        (mod) => mod.constructor?.name === 'FederationRuntimeModule',
      ).length,
    ).toBe(1);

    const workerHasFederationRuntimeModule = workerRuntimeModules.some(
      (mod) => mod.constructor?.name === 'FederationRuntimeModule',
    );
    expect(workerHasFederationRuntimeModule).toBe(true);

    expect(
      workerRuntimeModules.filter(
        (mod) => mod.constructor?.name === 'FederationRuntimeModule',
      ).length,
    ).toBe(1);

    const workerHasRemoteRuntimeModule = workerRuntimeModules.some((mod) =>
      mod.constructor?.name?.includes('RemoteRuntimeModule'),
    );
    expect(workerHasRemoteRuntimeModule).toBe(true);

    if (mainChunk) {
      const mainHasFederationRuntimeModule = mainRuntimeModules.some(
        (mod) => mod.constructor?.name === 'FederationRuntimeModule',
      );
      expect(mainHasFederationRuntimeModule).toBe(false);
      const mainHasRemoteRuntimeModule = mainRuntimeModules.some((mod) =>
        mod.constructor?.name?.includes('RemoteRuntimeModule'),
      );
      expect(mainHasRemoteRuntimeModule).toBe(false);
    }

    const runtimeRemoteRuntimeModules = runtimeRuntimeModules.filter((mod) =>
      mod.constructor?.name?.includes('RemoteRuntimeModule'),
    );
    expect(runtimeRemoteRuntimeModules.length).toBeGreaterThan(0);
    runtimeRemoteRuntimeModules.forEach((mod) => {
      expect(chunkGraph.isModuleInChunk(mod as any, runtimeChunk!)).toBe(true);
    });

    const runtimeHasRemoteRuntimeModule = runtimeRuntimeModules.some((mod) =>
      mod.constructor?.name?.includes('RemoteRuntimeModule'),
    );
    expect(runtimeHasRemoteRuntimeModule).toBe(true);

    const runtimeFiles = Array.from(runtimeChunk!.files);
    expect(runtimeFiles.length).toBeGreaterThan(0);
    const runtimeFilePath = path.join(outputPath, runtimeFiles[0]);
    expect(fs.existsSync(runtimeFilePath)).toBe(true);
    const runtimeSource = fs.readFileSync(runtimeFilePath, 'utf-8');
    expect(runtimeSource).toContain('bundlerRuntime.remotes');
    expect(runtimeSource).toContain('bundlerRuntimeOptions');

    const workerFiles = Array.from(workerChunk!.files);
    expect(workerFiles.length).toBeGreaterThan(0);
    const workerFilePath = path.join(outputPath, workerFiles[0]);
    expect(fs.existsSync(workerFilePath)).toBe(true);
    const workerSource = fs.readFileSync(workerFilePath, 'utf-8');
    expect(workerSource).toContain('bundlerRuntime.remotes');

    // Ensure the runtime chunk references the worker chunk via ensureChunkHandlers setup
    const ensureChunkHandlersRuntimeModules = runtimeRuntimeModules.filter(
      (mod) => mod.constructor?.name?.includes('RemoteRuntimeModule'),
    );
    expect(ensureChunkHandlersRuntimeModules.length).toBeGreaterThan(0);
  });
});
