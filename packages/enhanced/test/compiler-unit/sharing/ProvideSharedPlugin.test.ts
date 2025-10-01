/*
 * @jest-environment node
 */
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Configuration } from 'webpack';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { shareScopes } from './utils';
import ProvideSharedPlugin from '../../../src/lib/sharing/ProvideSharedPlugin';
import FederationRuntimePlugin from '../../../src/lib/container/runtime/FederationRuntimePlugin';
const webpack = require(normalizeWebpackPath('webpack'));

// Add compile helper function
const compile = (compiler: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    compiler.run((err: Error | null | undefined, stats: any) => {
      if (err) reject(err);
      else resolve(stats);
    });
  });
};

// Factory function to create webpack compiler
interface CompilerFactoryOptions {
  testDir: string;
  srcDir: string;
  entryPath?: string;
  outputPath?: string;
  plugins: any[];
  resolveOptions?: Record<string, any>;
  additionalConfig?: Partial<Configuration>;
}

const createCompiler = ({
  testDir,
  srcDir,
  entryPath,
  outputPath,
  plugins,
  resolveOptions = {
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.js', '.json'],
  },
  additionalConfig = {},
}: CompilerFactoryOptions) => {
  const config: Configuration = {
    mode: 'development',
    context: testDir,
    entry: entryPath || path.join(srcDir, 'index.js'),
    output: {
      path: outputPath || path.join(testDir, 'dist'),
      filename: 'bundle.js',
      publicPath: 'auto',
    },
    resolve: resolveOptions,
    plugins,
    ...additionalConfig,
  };

  return webpack(config);
};

describe('ProvideSharedPlugin', () => {
  let testDir: string;
  let srcDir: string;
  let nodeModulesDir: string;
  let satisfySpy: jest.SpyInstance;

  beforeEach(() => {
    // Create temp directory for test files
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-test-'));
    srcDir = path.join(testDir, 'src');
    nodeModulesDir = path.join(testDir, 'node_modules');

    // Create necessary directories
    fs.mkdirSync(srcDir, { recursive: true });
    fs.mkdirSync(path.join(nodeModulesDir, 'react'), { recursive: true });

    // Create index.js that imports React
    fs.writeFileSync(
      path.join(srcDir, 'index.js'),
      `
      import React from 'react';
      console.log(React.version);
    `,
    );

    // Spy on satisfy function for verification
    satisfySpy = jest.spyOn(
      require('@module-federation/runtime-tools/runtime-core'),
      'satisfy',
    );
  });

  afterEach(() => {
    // Clean up test directory
    fs.rmSync(testDir, { recursive: true, force: true });
    satisfySpy.mockRestore();
  });

  describe('plugin behavior', () => {
    it('should process modules during compilation', async () => {
      // Setup root node_modules React v17.0.2
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/package.json'),
        JSON.stringify({
          name: 'react',
          version: '17.0.2',
        }),
      );
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/index.js'),
        'module.exports = { createElement: () => {} };',
      );

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
          shared: {
            react: {
              singleton: false,
              requiredVersion: '17.0.2',
              eager: true,
              version: '17.0.2',
            },
          },
        }),
        new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              version: '17.0.2',
              eager: true,
              singleton: false,
              requiredVersion: '17.0.2',
            },
          },
        }),
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      if (!stats) {
        throw new Error('Compilation failed: stats is undefined');
      }

      expect(stats.hasErrors()).toBe(false);
    });

    it('should handle request exclusion with spy verification', async () => {
      // Setup scoped package structure
      const scopeDir = path.join(testDir, 'node_modules/@scope/prefix');
      fs.mkdirSync(path.join(scopeDir, 'excluded-path'), { recursive: true });
      fs.mkdirSync(path.join(scopeDir, 'included-path'), { recursive: true });

      // Create package.json files
      fs.writeFileSync(
        path.join(scopeDir, 'package.json'),
        JSON.stringify({
          name: '@scope/prefix',
          version: '1.0.0',
        }),
      );

      fs.writeFileSync(
        path.join(scopeDir, 'excluded-path/package.json'),
        JSON.stringify({
          name: '@scope/prefix/excluded-path',
          version: '1.0.0',
        }),
      );

      fs.writeFileSync(
        path.join(scopeDir, 'included-path/package.json'),
        JSON.stringify({
          name: '@scope/prefix/included-path',
          version: '1.0.0',
        }),
      );

      // Create module files
      fs.writeFileSync(
        path.join(scopeDir, 'excluded-path/index.js'),
        'module.exports = { excluded: true };',
      );
      fs.writeFileSync(
        path.join(scopeDir, 'included-path/index.js'),
        'module.exports = { included: true };',
      );

      // Update test entry file
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `
        import excluded from "@scope/prefix/excluded-path";
        import included from "@scope/prefix/included-path";
        console.log(excluded, included);
      `,
      );

      // Create plugin with request exclusion
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          '@scope/prefix/': {
            version: '1.0.0',
            shareKey: '@scope/prefix/',
            request: '@scope/prefix/',
            exclude: {
              request: /excluded-path$/,
            },
          },
        },
      });

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);

      // Get the compilation output
      const output = stats.toJson({
        all: false,
        modules: true,
        moduleTrace: true,
      });

      // Verify excluded module is not shared
      const excludedModule = output.modules?.find(
        (m) =>
          m.name?.includes('excluded-path') &&
          m.name?.includes('provide shared module'),
      );
      expect(excludedModule).toBeUndefined();

      // Verify included module is shared
      const includedModule = output.modules?.find(
        (m) =>
          m.name?.includes('included-path') &&
          m.name?.includes('provide shared module'),
      );
      expect(includedModule).toBeDefined();
    });

    it('should handle multiple React versions from nested node_modules', async () => {
      const rootVersion = '17.0.2';
      const nestedVersion = '16.0.0';

      // Setup root node_modules React v17.0.2
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/package.json'),
        JSON.stringify({
          name: 'react',
          version: rootVersion,
        }),
      );
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/index.js'),
        `module.exports = { version: "${rootVersion}" };`,
      );

      // Setup nested package
      const nestedPackageDir = path.join(testDir, 'node_modules/some-package');
      const nestedReactDir = path.join(nestedPackageDir, 'node_modules/react');
      fs.mkdirSync(nestedReactDir, { recursive: true });

      // Write nested package.json files
      fs.writeFileSync(
        path.join(nestedReactDir, 'package.json'),
        JSON.stringify({ name: 'react', version: nestedVersion }),
      );
      fs.writeFileSync(
        path.join(nestedReactDir, 'index.js'),
        `module.exports = { version: "${nestedVersion}" };`,
      );

      // Write some-package's own index.js AFTER its dependencies are set up
      fs.writeFileSync(
        path.join(nestedPackageDir, 'index.js'),
        'import React from "react"; export default React;',
      );

      // Create test entry file that uses both
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        'import RootReact from "react"; import NestedReactPkg from "some-package"; console.log(RootReact.version, NestedReactPkg.version);',
      );

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
          shared: {
            react: {
              requiredVersion: '^17.0.0',
              singleton: false,
            },
          },
        }),
        new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              shareKey: 'react',
              singleton: false,
              eager: false,
            },
          },
        }),
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);

      const output = stats.toJson({ modules: true });
      const sharedModules =
        output.modules?.filter(
          (m) =>
            m.name?.includes('react') &&
            m.name?.includes('provide shared module'),
        ) || [];

      expect(sharedModules.length).toBe(2);
      expect(sharedModules.some((m) => m.name?.includes(rootVersion))).toBe(
        true,
      );
      expect(sharedModules.some((m) => m.name?.includes(nestedVersion))).toBe(
        true,
      );
    });

    it('should exclude nested React version when version matches exclusion', async () => {
      // Setup versions
      const rootVersion = '17.0.2';
      const nestedVersion = '16.0.0';
      const excludeRange = '^16.0.0';

      // Setup root node_modules React
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/package.json'),
        JSON.stringify({ name: 'react', version: rootVersion }),
      );
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/index.js'),
        `module.exports = { version: "${rootVersion}" };`,
      );

      // Setup nested node_modules React
      const nestedPackageDir = path.join(testDir, 'node_modules/some-package');
      const nestedNodeModulesDir = path.join(
        nestedPackageDir,
        'node_modules/react',
      );
      fs.mkdirSync(nestedNodeModulesDir, { recursive: true });
      fs.writeFileSync(
        path.join(nestedPackageDir, 'package.json'),
        JSON.stringify({
          name: 'some-package',
          version: '1.0.0',
          dependencies: { react: nestedVersion },
        }),
      );
      fs.writeFileSync(
        path.join(nestedNodeModulesDir, 'package.json'),
        JSON.stringify({ name: 'react', version: nestedVersion }),
      );
      fs.writeFileSync(
        path.join(nestedNodeModulesDir, 'index.js'),
        `module.exports = { version: "${nestedVersion}" };`,
      );

      // Create test files that import both versions
      fs.writeFileSync(
        path.join(srcDir, 'root-import.js'),
        `import React from 'react'; export default React;`,
      );
      fs.writeFileSync(
        path.join(nestedPackageDir, 'nested-import.js'),
        `import React from 'react'; export default React;`,
      );
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `import RootReact from './root-import'; import NestedReact from 'some-package/nested-import'; console.log(RootReact.version, NestedReact.version);`,
      );

      // Create plugin with version exclusion
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            shareKey: 'react',
            exclude: {
              version: excludeRange,
            },
          },
        },
      });

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);

      // Get the compilation output
      const output = stats.toJson({ modules: true });

      // Find shared modules for React
      const sharedModules =
        output.modules?.filter(
          (m) =>
            m.name?.includes('react') &&
            m.name?.includes('provide shared module'),
        ) || [];

      // Should have only one shared module (rootVersion) because nestedVersion was excluded by the real satisfy
      expect(sharedModules.length).toBe(1);
      // Ensure the remaining shared module contains the root version in its name
      expect(sharedModules[0].name).toContain(rootVersion);

      // Verify satisfySpy was called for both versions against the exclude range
      const satisfyCalls = satisfySpy.mock.calls;

      // Use expect.arrayContaining because the order of module processing isn't guaranteed
      expect(satisfyCalls).toEqual(
        expect.arrayContaining([
          [nestedVersion, excludeRange],
          [rootVersion, excludeRange],
        ]),
      );
      expect(satisfyCalls.length).toBe(2);
    });

    it('should SHARE module when version does NOT match exclusion', async () => {
      const reactVersion = '17.0.2';
      const excludeRange = '^16.0.0';

      // Create plugin with version exclusion
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            shareKey: 'react',
            exclude: {
              version: excludeRange,
            },
          },
        },
      });

      // Create test files
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/package.json'),
        JSON.stringify({
          name: 'react',
          version: reactVersion,
        }),
      );
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/index.js'),
        `module.exports = { version: "${reactVersion}" };`,
      );
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        'import React from "react"; console.log(React);',
      );

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);

      // Verify the real satisfy was called correctly
      expect(satisfySpy).toHaveBeenCalledWith(reactVersion, excludeRange);

      // Get the compilation output
      const output = stats.toJson({ modules: true });

      // Verify the shared module WAS created (real satisfy returns false)
      const sharedModules =
        output.modules?.filter(
          (m) =>
            m.name?.includes('react') &&
            m.name?.includes('provide shared module'),
        ) || [];

      expect(sharedModules.length).toBe(1);
      expect(sharedModules[0].name).toContain(reactVersion);
    });

    it('should EXCLUDE module when version matches exclusion', async () => {
      const reactVersion = '16.8.0';
      const excludeRange = '^16.0.0';

      // Create plugin with version exclusion
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            shareKey: 'react',
            singleton: false,
            exclude: {
              version: excludeRange,
            },
          },
        },
      });

      // Create test files
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/package.json'),
        JSON.stringify({
          name: 'react',
          version: reactVersion,
        }),
      );
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/index.js'),
        `module.exports = { version: "${reactVersion}" };`,
      );
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        'import React from "react"; console.log(React);',
      );

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);

      // Verify the real satisfy was called correctly
      expect(satisfySpy).toHaveBeenCalledWith(reactVersion, excludeRange);

      // Get the compilation output
      const output = stats.toJson({ modules: true });

      // Verify the shared module WAS NOT created (real satisfy returns false)
      const sharedModules =
        output.modules?.filter(
          (m) =>
            m.name?.includes('react') &&
            m.name?.includes('provide shared module'),
        ) || [];

      expect(sharedModules.length).toBe(0);
    });
  });

  // --- Tests for include.version ---
  describe('include.version behavior', () => {
    it('should SHARE module when version MATCHES include.version range', async () => {
      const reactVersion = '17.0.2';
      const includeRange = '^17.0.0'; // Module version 17.0.2 satisfies ^17.0.0

      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            shareKey: 'react',
            include: {
              version: includeRange,
            },
          },
        },
      });

      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/package.json'),
        JSON.stringify({ name: 'react', version: reactVersion }),
      );
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/index.js'),
        `module.exports = { version: "${reactVersion}" };`,
      );
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        'import React from "react"; console.log(React);',
      );

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);
      expect(satisfySpy).toHaveBeenCalledWith(reactVersion, includeRange);

      const output = stats.toJson({ modules: true });
      const sharedModules =
        output.modules?.filter(
          (m: any) =>
            m.name?.includes('react') &&
            m.name?.includes('provide shared module'),
        ) || [];

      expect(sharedModules.length).toBe(1); // Module should be shared
      expect(sharedModules[0].name).toContain(reactVersion);
    });

    it('should NOT SHARE module when version does NOT MATCH include.version range', async () => {
      const reactVersion = '16.0.0';
      const includeRange = '^17.0.0'; // Module version 16.0.0 does NOT satisfy ^17.0.0

      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            shareKey: 'react',
            include: {
              version: includeRange,
            },
          },
        },
      });

      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/package.json'),
        JSON.stringify({ name: 'react', version: reactVersion }),
      );
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/index.js'),
        `module.exports = { version: "${reactVersion}" };`,
      );
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        'import React from "react"; console.log(React);',
      );

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);
      expect(satisfySpy).toHaveBeenCalledWith(reactVersion, includeRange);

      const output = stats.toJson({ modules: true });
      const sharedModules =
        output.modules?.filter(
          (m: any) =>
            m.name?.includes('react') &&
            m.name?.includes('provide shared module'),
        ) || [];

      expect(sharedModules.length).toBe(0); // Module should NOT be shared
    });
  });
  // --- End Tests for include.version ---

  // --- Tests for include.request ---
  describe('include.request behavior', () => {
    it('should SHARE module when resource MATCHES include.request string', async () => {
      const reactVersion = '17.0.2';
      const reactImportName = 'react';
      const shareScope = shareScopes.string; // 'default'

      const tempReactPackageJsonPath = path.join(
        nodeModulesDir,
        reactImportName,
        'package.json',
      );
      const tempReactIndexPath = path.join(
        nodeModulesDir,
        reactImportName,
        'index.js',
      );
      fs.mkdirSync(path.dirname(tempReactIndexPath), { recursive: true });
      fs.writeFileSync(
        tempReactPackageJsonPath,
        JSON.stringify({ name: reactImportName, version: reactVersion }),
      );
      fs.writeFileSync(
        tempReactIndexPath,
        `module.exports = { version: "${reactVersion}" };`,
      );
      const realReactIndexPath = fs
        .realpathSync(tempReactIndexPath)
        .replace(/\\/g, '/'); // Normalize to forward slashes

      const plugin = new ProvideSharedPlugin({
        shareScope: shareScope,
        provides: {
          [reactImportName]: {
            shareKey: reactImportName,
            include: {
              request: realReactIndexPath,
            },
          },
        },
      });

      // Entry file imports 'react' by its name
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `import React from '${reactImportName}'; console.log(React);
      `,
      );

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);
      const output = stats.toJson({ modules: true });

      const expectedIdentifier = `provide module (${shareScope}) ${reactImportName}@${reactVersion} = ${realReactIndexPath}`;

      const sharedModules =
        output.modules?.filter((m) => {
          return (
            m.moduleType === 'provide-module' &&
            m.identifier === expectedIdentifier
          );
        }) || [];
      expect(sharedModules.length).toBe(1);
    });

    it('should NOT SHARE module when resource does NOT MATCH include.request string', async () => {
      const reactVersion = '17.0.2';
      const reactImportName = 'react';
      const anotherPath = path.join(nodeModulesDir, 'another-module/index.js'); // A path that won't match

      const tempReactPackageJsonPath = path.join(
        nodeModulesDir,
        reactImportName,
        'package.json',
      );
      const tempReactIndexPath = path.join(
        nodeModulesDir,
        reactImportName,
        'index.js',
      );
      fs.mkdirSync(path.dirname(tempReactIndexPath), { recursive: true });
      fs.writeFileSync(
        tempReactPackageJsonPath,
        JSON.stringify({ name: reactImportName, version: reactVersion }),
      );
      fs.writeFileSync(
        tempReactIndexPath,
        `module.exports = { version: "${reactVersion}" };`,
      );
      // realReactIndexPath is not strictly needed for include check if it's a non-matching path

      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          [reactImportName]: {
            shareKey: reactImportName,
            include: {
              request: anotherPath, // This path will not match react's resolved resource
            },
          },
        },
      });

      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `import React from '${reactImportName}'; console.log(React);
      `,
      );

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);
      expect(stats.hasErrors()).toBe(false);
      const output = stats.toJson({ modules: true });
      const sharedModules =
        output.modules?.filter((m) => {
          return (
            m.moduleType === 'provide-module' &&
            typeof m.identifier === 'string' &&
            m.identifier.startsWith(
              `provide module default react@${reactVersion} = `,
            )
          );
        }) || [];
      expect(sharedModules.length).toBe(0);
    });

    it('should SHARE module when resource MATCHES include.request RegExp', async () => {
      const reactVersion = '17.0.2';
      const reactImportName = 'react';
      const shareScope = shareScopes.string;

      const tempReactPackageJsonPath = path.join(
        nodeModulesDir,
        reactImportName,
        'package.json',
      );
      const tempReactIndexPath = path.join(
        nodeModulesDir,
        reactImportName,
        'index.js',
      );
      fs.mkdirSync(path.dirname(tempReactIndexPath), { recursive: true });
      fs.writeFileSync(
        tempReactPackageJsonPath,
        JSON.stringify({ name: reactImportName, version: reactVersion }),
      );
      fs.writeFileSync(
        tempReactIndexPath,
        `module.exports = { version: "${reactVersion}" };`,
      );
      const realReactIndexPath = fs
        .realpathSync(tempReactIndexPath)
        .replace(/\\/g, '/');

      const plugin = new ProvideSharedPlugin({
        shareScope: shareScope,
        provides: {
          [reactImportName]: {
            shareKey: reactImportName,
            include: {
              request: /react\/index\.js$/,
            },
          },
        },
      });

      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `import React from '${reactImportName}'; console.log(React);
      `,
      );
      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];
      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });
      const stats = await compile(compiler);
      expect(stats.hasErrors()).toBe(false);
      const output = stats.toJson({ modules: true });
      const expectedIdentifier = `provide module (${shareScope}) ${reactImportName}@${reactVersion} = ${realReactIndexPath}`;

      const sharedModules =
        output.modules?.filter((m) => {
          return (
            m.moduleType === 'provide-module' &&
            m.identifier === expectedIdentifier
          );
        }) || [];
      expect(sharedModules.length).toBe(1);
    });

    it('should NOT SHARE module when resource does NOT MATCH include.request RegExp', async () => {
      const reactVersion = '17.0.2';
      const reactImportName = 'react';

      const tempReactPackageJsonPath = path.join(
        nodeModulesDir,
        reactImportName,
        'package.json',
      );
      const tempReactIndexPath = path.join(
        nodeModulesDir,
        reactImportName,
        'index.js',
      );
      fs.mkdirSync(path.dirname(tempReactIndexPath), { recursive: true });
      fs.writeFileSync(
        tempReactPackageJsonPath,
        JSON.stringify({ name: reactImportName, version: reactVersion }),
      );
      fs.writeFileSync(
        tempReactIndexPath,
        `module.exports = { version: "${reactVersion}" };`,
      );
      // const realReactIndexPath = fs.realpathSync(tempReactIndexPath);

      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          [reactImportName]: {
            shareKey: reactImportName,
            include: {
              request: /some-other-module\/index\.js$/,
            },
          },
        },
      });
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `import React from '${reactImportName}'; console.log(React);
      `,
      );
      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];
      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });
      const stats = await compile(compiler);
      expect(stats.hasErrors()).toBe(false);
      const output = stats.toJson({ modules: true });
      const sharedModules =
        output.modules?.filter((m) => {
          return (
            m.moduleType === 'provide-module' &&
            typeof m.identifier === 'string' &&
            m.identifier.startsWith(
              `provide module default react@${reactVersion} = `,
            )
          );
        }) || [];
      expect(sharedModules.length).toBe(0);
    });

    it('should SHARE module with prefix provide when remainder MATCHES include.request string', async () => {
      const version = '1.0.0';
      const includedPath = 'included-path';
      const shareScope = 'default';
      const baseShareKey = '@scope/prefix/';
      const finalExpectedShareKey = baseShareKey + includedPath;

      const tempPrefixResourcePath = path.join(
        nodeModulesDir,
        '@scope/prefix',
        includedPath,
        'index.js',
      );
      fs.mkdirSync(path.dirname(tempPrefixResourcePath), { recursive: true });
      fs.writeFileSync(
        tempPrefixResourcePath,
        'module.exports = { included: true };',
      );
      const prefixResourcePath = fs
        .realpathSync(tempPrefixResourcePath)
        .replace(/\\/g, '/');

      // Entry file importing the module
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `import val from '@scope/prefix/included-path'; console.log(val);`,
      );

      // The remainder after the prefix is 'included-path', so include.request must be 'included-path'
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScope,
        provides: {
          '@scope/prefix/': {
            shareKey: '@scope/prefix/',
            version,
            include: {
              request: 'included-path', // Must match the remainder after the prefix
            },
          },
        },
      });
      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];
      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });
      const stats = await compile(compiler);
      expect(stats.hasErrors()).toBe(false);
      const output = stats.toJson({ modules: true });
      const expectedIdentifier = `provide module (${shareScope}) ${finalExpectedShareKey}@${version} = ${prefixResourcePath}`;

      const sharedModules =
        output.modules?.filter((m) => {
          return (
            m.moduleType === 'provide-module' &&
            m.identifier === expectedIdentifier
          );
        }) || [];
      expect(sharedModules.length).toBe(1);
    });

    it('should NOT SHARE module with prefix provide when remainder does NOT MATCH include.request string', async () => {
      const version = '1.0.0';
      const actualImportPath = 'actual-import';
      const prefixRequest = '@scope/prefix/actual-import';
      const tempActualResourcePath = path.join(
        nodeModulesDir,
        '@scope/prefix',
        actualImportPath,
        'index.js',
      );
      fs.mkdirSync(path.dirname(tempActualResourcePath), { recursive: true });
      fs.writeFileSync(
        tempActualResourcePath,
        'module.exports = { actual: true };',
      );
      const actualResourcePath = fs.realpathSync(tempActualResourcePath);

      // package.json for the @scope/prefix package
      fs.writeFileSync(
        path.join(nodeModulesDir, '@scope/prefix/package.json'),
        JSON.stringify({ name: '@scope/prefix', version }),
      );

      // Entry file importing the module
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `import val from '@scope/prefix/actual-import'; console.log(val);`,
      );

      // The remainder after the prefix is 'actual-import', so include.request is set to 'not-this-one' to ensure it does NOT match
      const plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {
          '@scope/prefix/': {
            shareKey: '@scope/prefix/',
            version,
            include: {
              request: 'not-this-one', // Does not match 'actual-import'
            },
          },
        },
      });
      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];
      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });
      const stats = await compile(compiler);
      expect(stats.hasErrors()).toBe(false);
      const output = stats.toJson({ modules: true });
      const sharedModules =
        output.modules?.filter((m) => {
          return (
            m.moduleType === 'provide-module' &&
            typeof m.identifier === 'string' &&
            m.identifier.startsWith(
              `provide module default @scope/prefix/actual-import@${version} = `,
            )
          );
        }) || [];
      expect(sharedModules.length).toBe(0);
    });
  });
  // --- End Tests for include.request ---

  describe('exclude with singleton validation', () => {
    it('should warn when using singleton with version exclusion', async () => {
      const reactVersion = '17.0.2';
      const excludeRange = '^16.0.0'; // Will exclude React 16.x

      // Create test files
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/package.json'),
        JSON.stringify({
          name: 'react',
          version: reactVersion,
        }),
      );
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/index.js'),
        `module.exports = { version: "${reactVersion}" };`,
      );
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `import React from 'react'; console.log(React.version);`,
      );

      // Create plugin with version exclusion and singleton
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            shareKey: 'react',
            singleton: true, // Setting singleton to true
            exclude: {
              version: excludeRange,
            },
          },
        },
      });

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);

      // Check for warnings about singleton with exclude.version
      const warnings = stats.compilation.warnings;
      const hasSingletonWarning = warnings.some(
        (warning) =>
          warning.message.includes('singleton: true') &&
          warning.message.includes('exclude.version') &&
          warning.message.includes('react'),
      );

      expect(hasSingletonWarning).toBe(true);

      const output = stats.toJson({ modules: true });

      // Check that the shared module is properly provided despite the warning
      const sharedModules =
        output.modules?.filter((m) => {
          return (
            m.moduleType === 'provide-module' &&
            typeof m.identifier === 'string' &&
            m.identifier.startsWith(
              `provide module (${shareScopes.string}) react@${reactVersion}`,
            )
          );
        }) || [];

      // Module should be shared because v17 doesn't match the exclude range of ^16
      expect(sharedModules.length).toBe(1);
    });

    it('should warn when using singleton with version inclusion', async () => {
      const reactVersion = '17.0.2';
      const includeRange = '^17.0.0'; // Will include React 17.x

      // Create test files
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/package.json'),
        JSON.stringify({
          name: 'react',
          version: reactVersion,
        }),
      );
      fs.writeFileSync(
        path.join(nodeModulesDir, 'react/index.js'),
        `module.exports = { version: "${reactVersion}" };`,
      );
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `import React from 'react'; console.log(React.version);`,
      );

      // Create plugin with version inclusion and singleton
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            shareKey: 'react',
            singleton: true, // Setting singleton to true
            include: {
              version: includeRange,
            },
          },
        },
      });

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);

      // Check for warnings about singleton with include.version
      const warnings = stats.compilation.warnings;
      const hasSingletonWarning = warnings.some(
        (warning) =>
          warning.message.includes('singleton: true') &&
          warning.message.includes('include.version') &&
          warning.message.includes('react'),
      );

      expect(hasSingletonWarning).toBe(true);

      const output = stats.toJson({ modules: true });

      // Check that the shared module is properly provided despite the warning
      const sharedModules =
        output.modules?.filter((m) => {
          return (
            m.moduleType === 'provide-module' &&
            typeof m.identifier === 'string' &&
            m.identifier.startsWith(
              `provide module (${shareScopes.string}) react@${reactVersion}`,
            )
          );
        }) || [];

      // Module should be shared because v17 matches the include range of ^17
      expect(sharedModules.length).toBe(1);
    });

    it('should not warn when using singleton with request exclusion', async () => {
      // Setup scoped package structure
      const scopeDir = path.join(nodeModulesDir, '@scope/prefix');
      fs.mkdirSync(path.join(scopeDir, 'excluded-path'), { recursive: true });
      fs.mkdirSync(path.join(scopeDir, 'included-path'), { recursive: true });

      // Create package.json files
      fs.writeFileSync(
        path.join(scopeDir, 'package.json'),
        JSON.stringify({
          name: '@scope/prefix',
          version: '1.0.0',
        }),
      );

      fs.writeFileSync(
        path.join(scopeDir, 'excluded-path/package.json'),
        JSON.stringify({
          name: '@scope/prefix/excluded-path',
          version: '1.0.0',
        }),
      );

      fs.writeFileSync(
        path.join(scopeDir, 'included-path/package.json'),
        JSON.stringify({
          name: '@scope/prefix/included-path',
          version: '1.0.0',
        }),
      );

      // Create module files
      fs.writeFileSync(
        path.join(scopeDir, 'excluded-path/index.js'),
        'module.exports = { excluded: true };',
      );
      fs.writeFileSync(
        path.join(scopeDir, 'included-path/index.js'),
        'module.exports = { included: true };',
      );

      // Update test entry file
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `
        import included from "@scope/prefix/included-path";
        console.log(included);
      `,
      );

      // Create plugin with request exclusion and singleton
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          '@scope/prefix/': {
            shareKey: '@scope/prefix/',
            singleton: true, // Setting singleton to true
            exclude: {
              request: /excluded-path$/,
            },
          },
        },
      });

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);

      // Check for warnings about singleton with exclude.request (should not warn)
      const warnings = stats.compilation.warnings;
      const hasSingletonWarning = warnings.some(
        (warning) =>
          warning.message.includes('singleton: true') &&
          warning.message.includes('exclude.request') &&
          warning.message.includes('@scope/prefix/'),
      );

      expect(hasSingletonWarning).toBe(false);
    });

    it('should not warn when using singleton with request inclusion', async () => {
      // Setup scoped package structure
      const scopeDir = path.join(nodeModulesDir, '@scope/prefix');
      fs.mkdirSync(path.join(scopeDir, 'included-path'), { recursive: true });

      // Create package.json files
      fs.writeFileSync(
        path.join(scopeDir, 'package.json'),
        JSON.stringify({
          name: '@scope/prefix',
          version: '1.0.0',
        }),
      );

      fs.writeFileSync(
        path.join(scopeDir, 'included-path/package.json'),
        JSON.stringify({
          name: '@scope/prefix/included-path',
          version: '1.0.0',
        }),
      );

      // Create module files
      fs.writeFileSync(
        path.join(scopeDir, 'included-path/index.js'),
        'module.exports = { included: true };',
      );

      // Update test entry file
      fs.writeFileSync(
        path.join(srcDir, 'index.js'),
        `
        import included from "@scope/prefix/included-path";
        console.log(included);
      `,
      );

      // Create plugin with request inclusion and singleton
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          '@scope/prefix/': {
            shareKey: '@scope/prefix/',
            singleton: true, // Setting singleton to true
            include: {
              request: 'included-path',
            },
          },
        },
      });

      const plugins = [
        new FederationRuntimePlugin({
          name: 'test',
          filename: 'remoteEntry.js',
        }),
        plugin,
      ];

      const compiler = createCompiler({
        testDir,
        srcDir,
        plugins,
      });

      const stats = await compile(compiler);

      expect(stats.hasErrors()).toBe(false);

      // Check for warnings about singleton with include.request (should not warn)
      const warnings = stats.compilation.warnings;
      const hasSingletonWarning = warnings.some(
        (warning) =>
          warning.message.includes('singleton: true') &&
          warning.message.includes('include.request') &&
          warning.message.includes('@scope/prefix/'),
      );

      expect(hasSingletonWarning).toBe(false);
    });
  });
});
