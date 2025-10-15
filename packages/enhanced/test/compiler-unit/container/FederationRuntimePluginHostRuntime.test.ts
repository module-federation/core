// @ts-nocheck
/*
 * @jest-environment node
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import type { Stats } from 'webpack';

const TEMP_PROJECT_PREFIX = 'mf-host-runtime-';
const Module = require('module');
const writeFile = (filePath: string, contents: string) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
};

/**
 * Ensure Node can resolve workspace-bound packages (e.g. @module-federation/enhanced/webpack)
 * when running webpack programmatically from Jest.
 */
function registerModulePaths(projectRoot: string) {
  const additionalPaths = Module._nodeModulePaths(projectRoot);
  for (const candidate of additionalPaths) {
    if (!module.paths.includes(candidate)) {
      module.paths.push(candidate);
    }
  }
}

async function runWebpack(
  projectRoot: string,
  mode: 'development' | 'production' = 'development',
): Promise<{ stats: Stats; outputDir: string }> {
  registerModulePaths(projectRoot);
  const webpack = require('webpack');
  const configPath = path.join(projectRoot, 'webpack.config.js');
  const config = require(configPath);

  const outputDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'mf-host-runtime-output-'),
  );

  config.context = projectRoot;
  config.mode = mode;
  config.devtool = false;
  config.output = {
    ...(config.output || {}),
    path: outputDir,
    clean: true,
  };

  // Disable declaration fetching/manifest networking for test environment
  if (Array.isArray(config.plugins)) {
    for (const plugin of config.plugins) {
      if (
        plugin &&
        plugin.constructor &&
        plugin.constructor.name === 'ModuleFederationPlugin' &&
        plugin._options
      ) {
        plugin._options.dts = false;
        if (plugin._options.manifest !== false) {
          plugin._options.manifest = false;
        }
      }
    }
  }

  const compiler = webpack(config);
  const stats: Stats = await new Promise((resolve, reject) => {
    compiler.run((err: Error | null, result?: Stats) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result) {
        reject(new Error('Expected webpack stats result'));
        return;
      }
      resolve(result);
    });
  });

  await new Promise<void>((resolve) => compiler.close(() => resolve()));

  return { stats, outputDir };
}

describe('FederationRuntimePlugin host runtime integration', () => {
  jest.setTimeout(120000);

  const createdDirs: string[] = [];

  afterAll(() => {
    for (const dir of createdDirs) {
      if (fs.existsSync(dir)) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`Failed to remove temp dir ${dir}`, error);
        }
      }
    }
  });

  const createTempProject = () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), TEMP_PROJECT_PREFIX));
    createdDirs.push(tempDir);
    return tempDir;
  };

  it('attaches the federation runtime dependency to the host runtime chunk', async () => {
    const projectDir = createTempProject();
    const srcDir = path.join(projectDir, 'src');

    writeFile(
      path.join(srcDir, 'index.js'),
      `
import('./bootstrap');
`,
    );

    writeFile(
      path.join(srcDir, 'bootstrap.js'),
      `
import('remoteContainer/feature');

export const run = () => 'ok';
`,
    );

    writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify({ name: 'mf-host-runtime', version: '1.0.0' }),
    );

    writeFile(
      path.join(projectDir, 'webpack.config.js'),
      `
const path = require('path');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

module.exports = {
  mode: 'development',
  devtool: false,
  target: 'web',
  context: __dirname,
  entry: {
    main: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: 'auto',
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
        remoteContainer: 'remoteContainer@http://127.0.0.1:3006/remoteEntry.js',
      },
      exposes: {
        './feature': './src/index.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
      },
      dts: false,
    }),
  ],
};
`,
    );

    // Run webpack - should build successfully even with missing remote
    const { stats, outputDir } = await runWebpack(projectDir, 'development');
    createdDirs.push(outputDir);

    expect(stats.hasErrors()).toBe(false);

    // Verify the build includes federation runtime dependencies
    const mainBundlePath = path.join(outputDir, 'main.js');
    expect(fs.existsSync(mainBundlePath)).toBe(true);

    const mainContent = fs.readFileSync(mainBundlePath, 'utf-8');

    // Verify webpack-bundler-runtime is included (the federation runtime dependency)
    expect(mainContent).toContain('webpack-bundler-runtime');
    // Verify runtime modules are present
    expect(mainContent).toContain('/* webpack/runtime/federation runtime */');
  });

  it('generates main bundle with correct runtime module execution order', async () => {
    const projectDir = createTempProject();
    const srcDir = path.join(projectDir, 'src');

    writeFile(
      path.join(srcDir, 'index.js'),
      `
export const app = 'host-app';
`,
    );

    writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify({ name: 'mf-host-runtime-order', version: '1.0.0' }),
    );

    writeFile(
      path.join(projectDir, 'webpack.config.js'),
      `
const path = require('path');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

module.exports = {
  mode: 'development',
  devtool: false,
  target: 'web',
  context: __dirname,
  entry: {
    main: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: 'auto',
    environment: {
      asyncFunction: true,
    },
  },
  optimization: {
    runtimeChunk: false,
    minimize: false,
    moduleIds: 'named',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'runtime_order_test',
      filename: 'remoteEntry.js',
      experiments: { asyncStartup: true },
      exposes: {
        './app': './src/index.js',
      },
      dts: false,
      manifest: false,
    }),
  ],
};
`,
    );

    const { stats, outputDir } = await runWebpack(projectDir, 'development');
    createdDirs.push(outputDir);

    expect(stats.hasErrors()).toBe(false);

    const mainBundlePath = path.join(outputDir, 'main.js');
    expect(fs.existsSync(mainBundlePath)).toBe(true);

    const mainContent = fs.readFileSync(mainBundlePath, 'utf-8');

    // Verify federation runtime is embedded
    expect(mainContent).toContain('/* webpack/runtime/federation runtime */');

    // In host apps with asyncStartup, we may or may not have startup chunk dependencies
    // depending on whether there are async chunks, but EmbedFederation should always be present
    expect(mainContent).toContain('/* webpack/runtime/embed/federation */');

    // If both are present, verify correct order
    if (
      mainContent.includes('/* webpack/runtime/startup chunk dependencies */')
    ) {
      const startupDepsIndex = mainContent.indexOf(
        '/* webpack/runtime/startup chunk dependencies */',
      );
      const embedFederationIndex = mainContent.indexOf(
        '/* webpack/runtime/embed/federation */',
      );

      expect(startupDepsIndex).toBeGreaterThan(-1);
      expect(embedFederationIndex).toBeGreaterThan(-1);
      // EmbedFederation (stage 40) should appear AFTER StartupChunkDependencies (stage 20)
      expect(embedFederationIndex).toBeGreaterThan(startupDepsIndex);
    }

    // Verify the runtime includes startup execution
    // The key marker is the presence of __webpack_require__.x() calls which indicate
    // the embed federation runtime module is working
    expect(mainContent).toContain('__webpack_require__.x(');
  });
});
