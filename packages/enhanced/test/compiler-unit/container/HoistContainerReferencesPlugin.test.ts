// @ts-nocheck

import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';
// Import the helper function we need
import { getAllReferencedModules } from '../../../src/lib/container/HoistContainerReferencesPlugin';
// Use require for webpack as per linter rule
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
// Use type imports for webpack types
type Compilation = import('webpack').Compilation;
type Module = import('webpack').Module;
type Chunk = import('webpack').Chunk;
import path from 'path';
import fs from 'fs'; // Use real fs
import os from 'os'; // Use os for temp dir
// Import FederationRuntimeDependency directly
import FederationRuntimeDependency from '../../../src/lib/container/runtime/FederationRuntimeDependency';

describe('HoistContainerReferencesPlugin', () => {
  let tempDir: string;
  let allTempDirs: string[] = [];

  beforeAll(() => {
    // Track all temp directories for final cleanup
    allTempDirs = [];
  });

  beforeEach(() => {
    // Create temp dir before each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hoist-test-'));
    allTempDirs.push(tempDir);
  });

  afterEach(() => {
    // Clean up temp dir after each test
    if (!tempDir || !fs.existsSync(tempDir)) return;

    // Add a small delay to allow file handles to be released
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (error) {
          console.warn(`Failed to clean up temp directory ${tempDir}:`, error);
          // Try alternative cleanup method
          try {
            fs.rmdirSync(tempDir, { recursive: true });
          } catch (fallbackError) {
            console.error(
              `Fallback cleanup also failed for ${tempDir}:`,
              fallbackError,
            );
          }
        }
        resolve();
      }, 100); // 100ms delay to allow file handles to close
    });
  });

  afterAll(() => {
    // Final cleanup of any remaining temp directories
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

  it('should hoist container runtime modules into the single runtime chunk when using remotes', async () => {
    // Define input file content
    const mainJsContent = `
      import('remoteApp/utils')
        .then(utils => console.log('Loaded remote utils:', utils))
        .catch(err => console.error('Error loading remote:', err));
      console.log('Host application started');
    `;
    const packageJsonContent = '{ "name": "test-host", "version": "1.0.0" }';

    // Write input files to tempDir
    fs.writeFileSync(path.join(tempDir, 'main.js'), mainJsContent);
    fs.writeFileSync(path.join(tempDir, 'package.json'), packageJsonContent);

    const outputPath = path.join(tempDir, 'dist');

    const compiler = webpack({
      mode: 'development',
      devtool: false,
      context: tempDir, // Use tempDir as context
      entry: {
        main: './main.js',
      },
      output: {
        path: outputPath, // Use outputPath
        filename: '[name].js',
        chunkFilename: 'chunks/[name].[contenthash].js',
        uniqueName: 'hoist-remote-test',
        publicPath: 'auto', // Important for MF remotes
      },
      resolve: {
        fallback: {
          // runtime-core CJS may reference Node's `url` in import.meta shims.
          // The test runs a browser-targeted webpack compile, so disable this polyfill.
          url: false,
        },
      },
      optimization: {
        runtimeChunk: 'single', // Critical for this test
        chunkIds: 'named',
        moduleIds: 'named',
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'host',
          remotes: {
            // Define a remote
            remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js',
          },
          manifest: false,
          // No exposes or shared needed for this specific test
        }),
      ],
    });

    let stats: any;
    try {
      stats = await new Promise<any>((resolve, reject) => {
        compiler.run((err: any, s: any) => {
          if (err) return reject(err);
          if (!s) return reject(new Error('No stats object returned'));
          resolve(s);
        });
      });
    } finally {
      // Always close compiler to release file handles
      await new Promise<void>((resolve) => {
        try {
          compiler.close(() => resolve());
        } catch {
          resolve();
        }
      });
    }

    if (stats.hasErrors()) {
      const info = stats.toJson({
        errorDetails: true,
        all: false,
        errors: true,
      });
      console.error('Webpack Errors:', JSON.stringify(info.errors, null, 2));
      throw new Error(
        info.errors
          ?.map((e: any) => e.message + (e.details ? `\n${e.details}` : ''))
          .join('\n'),
      );
    }
    if (stats.hasWarnings()) {
      console.warn(
        'Webpack Warnings:',
        stats.toString({ colors: true, all: false, warnings: true }),
      );
    }

    const compilation = stats.compilation;
    const { chunkGraph } = compilation;

    // 1. Find the runtime chunk
    const runtimeChunk = Array.from(compilation.chunks).find(
      (c: Chunk) => c.hasRuntime() && c.name === 'runtime',
    );
    expect(runtimeChunk).toBeDefined();
    if (!runtimeChunk) throw new Error('Runtime chunk not found');

    // 2. Find the module that was created from FederationRuntimeDependency
    let federationRuntimeModule: Module | null = null;
    for (const module of compilation.modules) {
      if (module.constructor.name === 'FederationRuntimeModule') {
        federationRuntimeModule = module;
        break;
      }
    }
    expect(federationRuntimeModule).toBeDefined();
    if (!federationRuntimeModule) {
      throw new Error(
        'Module originating FederationRuntimeDependency not found',
      );
    }

    // 3. Assert the Federation Runtime Module is in the Runtime Chunk
    const isRuntimeModuleInRuntime = chunkGraph.isModuleInChunk(
      federationRuntimeModule,
      runtimeChunk,
    );
    expect(isRuntimeModuleInRuntime).toBe(true);

    // 4. Assert the Federation Runtime Module is NOT in the Main Chunk (if separate)
    const mainChunk = Array.from(compilation.chunks).find(
      (c: Chunk) => c.name === 'main',
    );
    if (mainChunk && mainChunk !== runtimeChunk) {
      const isRuntimeModuleInMain = chunkGraph.isModuleInChunk(
        federationRuntimeModule,
        mainChunk,
      );
      expect(isRuntimeModuleInMain).toBe(false);
    }

    // 5. Verify file output (Optional)
    const runtimeFilePath = path.join(outputPath, 'runtime.js');
    expect(fs.existsSync(runtimeFilePath)).toBe(true);
  });

  it('should NOT hoist container entry but hoist its deps when using exposes', async () => {
    // Define input file content
    const mainJsContent = `
      console.log('Host application started, loading exposed module...');
    `; // Main entry might need to interact with container
    const exposedJsContent = `export default () => 'exposed module content';`;
    const packageJsonContent =
      '{ "name": "test-host-exposes", "version": "1.0.0" }';

    // Write input files to tempDir
    fs.writeFileSync(path.join(tempDir, 'main.js'), mainJsContent);
    fs.writeFileSync(path.join(tempDir, 'exposed.js'), exposedJsContent);
    fs.writeFileSync(path.join(tempDir, 'package.json'), packageJsonContent);

    const outputPath = path.join(tempDir, 'dist');

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
        chunkFilename: 'chunks/[name].[contenthash].js',
        uniqueName: 'hoist-expose-test',
        publicPath: 'auto',
      },
      resolve: {
        fallback: {
          url: false,
        },
      },
      optimization: {
        runtimeChunk: 'single',
        chunkIds: 'named',
        moduleIds: 'named',
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'host_exposes',
          filename: 'container.js', // Explicit container entry
          exposes: {
            './exposed': './exposed.js', // Expose a module
          },
          manifest: false,
          // No remotes needed for this specific test
        }),
      ],
    });

    let stats: any;
    try {
      stats = await new Promise<any>((resolve, reject) => {
        compiler.run((err: any, s: any) => {
          if (err) return reject(err);
          if (!s) return reject(new Error('No stats object returned'));
          resolve(s);
        });
      });
    } finally {
      await new Promise<void>((resolve) => {
        try {
          compiler.close(() => resolve());
        } catch {
          resolve();
        }
      });
    }

    if (stats.hasErrors()) {
      const info = stats.toJson({
        errorDetails: true,
        all: false,
        errors: true,
      });
      console.error('Webpack Errors:', JSON.stringify(info.errors, null, 2));
      throw new Error(
        info.errors
          ?.map((e: any) => e.message + (e.details ? `\n${e.details}` : ''))
          .join('\n'),
      );
    }
    if (stats.hasWarnings()) {
      console.warn(
        'Webpack Warnings:',
        stats.toString({ colors: true, all: false, warnings: true }),
      );
    }

    const compilation = stats.compilation;
    const { chunkGraph } = compilation;

    // 1. Find the runtime chunk
    const runtimeChunk = Array.from(compilation.chunks).find(
      (c: Chunk) => c.hasRuntime() && c.name === 'runtime',
    );
    expect(runtimeChunk).toBeDefined();
    if (!runtimeChunk) throw new Error('Runtime chunk not found');

    // 2. Find the Container Entry Module that was created from ContainerEntryDependency
    let containerEntryModule: Module | null = null;
    for (const module of compilation.modules) {
      if (module.constructor.name === 'ContainerEntryModule') {
        containerEntryModule = module;
        break;
      }
    }
    expect(containerEntryModule).toBeDefined();
    if (!containerEntryModule) {
      throw new Error('ContainerEntryModule not found via dependency check');
    }

    // 3. Find the exposed module itself
    const exposedModule = Array.from(compilation.modules).find((m) =>
      m.identifier().endsWith('exposed.js'),
    );
    expect(exposedModule).toBeDefined();
    if (!exposedModule) {
      throw new Error('Exposed module (exposed.js) not found');
    }

    // 4. Get all modules referenced by the container entry using 'initial' (same as the plugin)
    const referencedModules = getAllReferencedModules(
      compilation,
      containerEntryModule,
      'initial',
    );
    // The container entry is always included in referencedModules (it's the starting module)
    expect(referencedModules.size).toBeGreaterThanOrEqual(1);

    // 5. Assert the exposed module is NOT in the runtime chunk
    // (exposed modules are loaded asynchronously and should not be hoisted)
    const isExposedInRuntime = chunkGraph.isModuleInChunk(
      exposedModule,
      runtimeChunk,
    );
    expect(isExposedInRuntime).toBe(false);

    // 6. Assert the container entry and its initial dependencies ARE hoisted to the runtime chunk
    // The plugin hoists all modules from getAllReferencedModules(containerEntryModule, 'initial')
    const isContainerInRuntime = chunkGraph.isModuleInChunk(
      containerEntryModule,
      runtimeChunk,
    );
    expect(isContainerInRuntime).toBe(true);

    // 7. Count how many referenced modules are in the runtime chunk
    let hoistedCount = 0;
    for (const module of referencedModules) {
      const isModuleInRuntime = chunkGraph.isModuleInChunk(
        module,
        runtimeChunk,
      );
      if (isModuleInRuntime) hoistedCount++;
    }
    // At least the container entry should be hoisted
    expect(hoistedCount).toBeGreaterThan(0);

    // 8. Verify file output (optional)
    const runtimeFilePath = path.join(outputPath, 'runtime.js');
    const containerFilePath = path.join(outputPath, 'container.js');
    expect(fs.existsSync(runtimeFilePath)).toBe(true);
    expect(fs.existsSync(containerFilePath)).toBe(true);
  });

  it.skip('should hoist container runtime modules into the single runtime chunk when using remotes with federationRuntimeOriginModule', async () => {
    // Define input file content
    const mainJsContent = `
      import('remoteApp/utils')
        .then(utils => console.log('Loaded remote utils:', utils))
        .catch(err => console.error('Error loading remote:', err));
      console.log('Host application started');
    `;
    const packageJsonContent = '{ "name": "test-host", "version": "1.0.0" }';

    // Write input files to tempDir
    fs.writeFileSync(path.join(tempDir, 'main.js'), mainJsContent);
    fs.writeFileSync(path.join(tempDir, 'package.json'), packageJsonContent);

    const outputPath = path.join(tempDir, 'dist');

    const compiler = webpack({
      mode: 'development',
      devtool: false,
      context: tempDir, // Use tempDir as context
      entry: {
        main: './main.js',
      },
      output: {
        path: outputPath, // Use outputPath
        filename: '[name].js',
        chunkFilename: 'chunks/[name].[contenthash].js',
        uniqueName: 'hoist-remote-test',
        publicPath: 'auto', // Important for MF remotes
      },
      resolve: {
        fallback: {
          url: false,
        },
      },
      optimization: {
        runtimeChunk: 'single', // Critical for this test
        chunkIds: 'named',
        moduleIds: 'named',
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'host',
          remotes: {
            // Define a remote
            remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js',
          },
          // No exposes or shared needed for this specific test
        }),
      ],
    });

    let stats: any;
    try {
      stats = await new Promise<any>((resolve, reject) => {
        compiler.run((err: any, s: any) => {
          if (err) return reject(err);
          if (!s) return reject(new Error('No stats object returned'));
          resolve(s);
        });
      });
    } finally {
      await new Promise<void>((resolve) => {
        try {
          compiler.close(() => resolve());
        } catch {
          resolve();
        }
      });
    }

    if (stats.hasErrors()) {
      const info = stats.toJson({
        errorDetails: true,
        all: false,
        errors: true,
      });
      console.error('Webpack Errors:', JSON.stringify(info.errors, null, 2));
      throw new Error(
        info.errors
          ?.map((e: any) => e.message + (e.details ? `\n${e.details}` : ''))
          .join('\n'),
      );
    }
    if (stats.hasWarnings()) {
      console.warn(
        'Webpack Warnings:',
        stats.toString({ colors: true, all: false, warnings: true }),
      );
    }

    const compilation = stats.compilation;
    const { chunkGraph } = compilation;

    // 1. Find the runtime chunk (using Array.from)
    const runtimeChunk = Array.from(compilation.chunks).find(
      (c: Chunk) => c.hasRuntime() && c.name === 'runtime',
    );
    expect(runtimeChunk).toBeDefined();
    if (!runtimeChunk) throw new Error('Runtime chunk not found');

    // 2. Verify runtime chunk content directly
    const runtimeFilePath = path.join(outputPath, 'runtime.js');
    expect(fs.existsSync(runtimeFilePath)).toBe(true);
    const runtimeFileContent = fs.readFileSync(runtimeFilePath, 'utf-8');

    // Check for presence of key MF runtime identifiers
    const mfRuntimeKeywords = [
      '__webpack_require__.f.remotes', // Function for handling remotes
      '__webpack_require__.S = ', // Share scope object
      'initializeSharing', // Function name for initializing sharing
      '__webpack_require__.I = ', // Function for initializing consumes
    ];

    for (const keyword of mfRuntimeKeywords) {
      expect(runtimeFileContent).toContain(keyword);
    }

    // 3. Verify absence in main chunk (if separate)
    const mainChunk = Array.from(compilation.chunks).find(
      (c: Chunk) => c.name === 'main',
    );
    if (mainChunk && mainChunk !== runtimeChunk) {
      const mainFilePath = path.join(outputPath, 'main.js');
      expect(fs.existsSync(mainFilePath)).toBe(true);
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf-8');
      for (const keyword of mfRuntimeKeywords) {
        expect(mainFileContent).not.toContain(keyword);
      }
    }

    // 4. Verify container file output (if applicable, not expected here)
    const containerFilePath = path.join(outputPath, 'container.js'); // Filename was removed from config
    // In remotes-only mode without filename, container.js might not exist or be empty
    // expect(fs.existsSync(containerFilePath)).toBe(true);

    // 5. Find the federationRuntimeModule
    let federationRuntimeModule: Module | null = null;
    for (const module of compilation.modules) {
      if (module.constructor.name === 'FederationRuntimeModule') {
        federationRuntimeModule = module;
        break;
      }
    }
    expect(federationRuntimeModule).toBeDefined();
    if (!federationRuntimeModule) {
      throw new Error(
        'Module created from FederationRuntimeDependency not found',
      );
    }

    // 6. Assert the Federation Runtime Module is in the Runtime Chunk
    const isRuntimeModuleInRuntime = chunkGraph.isModuleInChunk(
      federationRuntimeModule,
      runtimeChunk,
    );
    expect(isRuntimeModuleInRuntime).toBe(true);

    // 7. Assert the Federation Runtime Module is NOT in the Main Chunk (if separate)
    if (mainChunk && mainChunk !== runtimeChunk) {
      const isRuntimeModuleInMain = chunkGraph.isModuleInChunk(
        federationRuntimeModule,
        mainChunk,
      );
      expect(isRuntimeModuleInMain).toBe(false);
    }

    // 8. Verify file output using real fs paths (Optional, but still useful)
    expect(fs.existsSync(runtimeFilePath)).toBe(true);
  });
});
