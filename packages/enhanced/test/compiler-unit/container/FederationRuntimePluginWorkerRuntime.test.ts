// @ts-nocheck
/*
 * @jest-environment node
 */

import { ModuleFederationPlugin } from '@module-federation/enhanced';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import fs from 'fs';
import os from 'os';
import path from 'path';

const webpack = require(normalizeWebpackPath('webpack'));

const TEMP_PROJECT_PREFIX = 'mf-worker-integration-';

describe('FederationRuntimePlugin worker integration', () => {
  jest.setTimeout(30000);

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

    const compilation = stats.compilation;
    const { chunkGraph } = compilation;

    const chunks: any[] = [];
    for (const chunk of compilation.chunks || []) {
      chunks.push(chunk);
    }

    const runtimeChunk = chunks.find(
      (chunk) => chunk && chunk.name === 'mf-runtime',
    );
    if (!runtimeChunk) {
      throw new Error('Runtime chunk not found');
    }

    let workerChunk: any | undefined;
    for (const chunk of chunks) {
      const modulesInChunk = chunkGraph.getChunkModulesIterable
        ? chunkGraph.getChunkModulesIterable(chunk)
        : [];
      for (const module of modulesInChunk || []) {
        if (
          module &&
          typeof module.resource === 'string' &&
          module.resource.endsWith('worker.js')
        ) {
          workerChunk = chunk;
          break;
        }
      }
      if (workerChunk) {
        break;
      }
    }
    if (!workerChunk) {
      throw new Error('Worker chunk not found');
    }

    const collectRuntimeModuleNames = (chunk: any) => {
      const runtimeIterable = chunkGraph.getChunkRuntimeModulesIterable
        ? chunkGraph.getChunkRuntimeModulesIterable(chunk)
        : [];
      const names: string[] = [];
      for (const runtimeModule of runtimeIterable || []) {
        if (
          runtimeModule &&
          runtimeModule.constructor &&
          runtimeModule.constructor.name
        ) {
          names.push(runtimeModule.constructor.name);
        }
      }
      return names;
    };

    const runtimeModuleNames = collectRuntimeModuleNames(runtimeChunk);
    const workerRuntimeModuleNames = collectRuntimeModuleNames(workerChunk);

    expect(runtimeModuleNames.includes('FederationRuntimeModule')).toBe(true);
    expect(workerRuntimeModuleNames.includes('FederationRuntimeModule')).toBe(
      true,
    );

    const getIdentifier = (module: any) => {
      if (!module) return '';
      if (typeof module.identifier === 'function') {
        try {
          return module.identifier();
        } catch {
          return '';
        }
      }
      if (typeof module.identifier === 'string') {
        return module.identifier;
      }
      if (typeof module.resource === 'string') {
        return module.resource;
      }
      return '';
    };

    let bundlerModule: any | undefined;
    for (const module of compilation.modules || []) {
      const identifier = getIdentifier(module);
      if (identifier.includes('webpack-bundler-runtime/dist/index.esm.js')) {
        bundlerModule = module;
        break;
      }
    }
    expect(bundlerModule).toBeDefined();

    const moduleId =
      bundlerModule && chunkGraph.getModuleId
        ? chunkGraph.getModuleId(bundlerModule)
        : undefined;
    expect(moduleId === null || moduleId === undefined).toBe(false);

    const moduleChunks = new Set<any>();
    if (chunkGraph.getModuleChunksIterable && bundlerModule) {
      for (const chunk of chunkGraph.getModuleChunksIterable(bundlerModule) ||
        []) {
        moduleChunks.add(chunk);
      }
    }

    expect(moduleChunks.size).toBeGreaterThan(0);
    expect(moduleChunks.has(runtimeChunk)).toBe(true);
  });
});

describe('FederationRuntimePlugin host runtime integration', () => {
  jest.setTimeout(30000);

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

  const createTempProject = () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), TEMP_PROJECT_PREFIX));
    tempDirs.push(dir);
    return dir;
  };

  it('keeps the bundler runtime module attached to host runtime chunks', async () => {
    const projectDir = createTempProject();
    const srcDir = path.join(projectDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    fs.writeFileSync(
      path.join(srcDir, 'index.ts'),
      `import('./bootstrap');
`,
    );

    fs.writeFileSync(
      path.join(srcDir, 'bootstrap.ts'),
      `export const ready = true;`,
    );

    fs.writeFileSync(
      path.join(projectDir, 'package.json'),
      JSON.stringify({ name: 'mf-host-test', version: '1.0.0' }),
    );

    const compiler = webpack({
      mode: 'development',
      devtool: false,
      context: projectDir,
      entry: { main: './src/index.ts' },
      output: {
        path: path.join(projectDir, 'dist'),
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: 'auto',
      },
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
      module: {
        rules: [
          {
            test: /\.[jt]sx?$/,
            exclude: /node_modules/,
            use: {
              loader: require.resolve('swc-loader'),
              options: {
                swcrc: false,
                sourceMaps: false,
                jsc: {
                  parser: { syntax: 'typescript', tsx: false },
                  target: 'es2020',
                },
              },
            },
          },
        ],
      },
      optimization: {
        runtimeChunk: false,
        minimize: false,
        moduleIds: 'named',
        chunkIds: 'named',
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'runtime_host_test',
          filename: 'remoteEntry.js',
          experiments: { asyncStartup: true },
          remotes: {
            remoteContainer:
              'remoteContainer@http://127.0.0.1:3006/remoteEntry.js',
          },
          exposes: {
            './feature': './src/index.ts',
          },
          shared: {
            react: { singleton: true, requiredVersion: false },
            'react-dom': { singleton: true, requiredVersion: false },
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
            reject(new Error('Missing webpack result'));
            return;
          }
          if (result.hasErrors()) {
            const info = result.toJson({
              errors: true,
              warnings: false,
              all: false,
              errorDetails: true,
            });
            const formattedErrors = (info.errors || [])
              .map((error) =>
                [
                  error.message || '',
                  error.details ? `Details:\n${error.details}` : '',
                ]
                  .filter(Boolean)
                  .join('\n'),
              )
              .join('\n\n');
            reject(new Error(formattedErrors || 'Compilation failed'));
            return;
          }
          resolve(result);
        });
      },
    );

    await new Promise<void>((resolve) => compiler.close(() => resolve()));

    const compilation = stats.compilation;
    const { chunkGraph } = compilation;

    const getIdentifier = (module: any) => {
      if (!module) return '';
      if (typeof module.identifier === 'function') {
        try {
          return module.identifier();
        } catch {
          return '';
        }
      }
      if (typeof module.identifier === 'string') {
        return module.identifier;
      }
      if (typeof module.resource === 'string') {
        return module.resource;
      }
      return '';
    };

    let bundlerModule: any | undefined;
    for (const module of compilation.modules || []) {
      const identifier = getIdentifier(module);
      if (identifier.includes('webpack-bundler-runtime/dist/index.esm.js')) {
        bundlerModule = module;
        break;
      }
    }
    expect(bundlerModule).toBeDefined();

    const moduleId =
      bundlerModule && chunkGraph.getModuleId
        ? chunkGraph.getModuleId(bundlerModule)
        : undefined;
    expect(moduleId === null || moduleId === undefined).toBe(false);

    const runtimeChunks = new Set<any>();
    for (const chunk of compilation.chunks || []) {
      if (
        chunk &&
        typeof chunk.hasRuntime === 'function' &&
        chunk.hasRuntime()
      ) {
        runtimeChunks.add(chunk);
      }
    }
    expect(runtimeChunks.size).toBeGreaterThan(0);

    const moduleChunks = new Set<any>();
    if (chunkGraph.getModuleChunksIterable && bundlerModule) {
      for (const chunk of chunkGraph.getModuleChunksIterable(bundlerModule) ||
        []) {
        moduleChunks.add(chunk);
      }
    }

    expect(moduleChunks.size).toBeGreaterThan(0);
    runtimeChunks.forEach((chunk) => {
      expect(moduleChunks.has(chunk)).toBe(true);
    });
  });
});
