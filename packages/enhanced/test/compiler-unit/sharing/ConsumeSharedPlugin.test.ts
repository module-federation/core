/*
 * @jest-environment node
 */
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Configuration } from 'webpack';
import path from 'path';
import fs from 'fs';
import os from 'os';
import ConsumeSharedPlugin from '../../../src/lib/sharing/ConsumeSharedPlugin';
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

describe('ConsumeSharedPlugin', () => {
  let testDir: string;
  let srcDir: string;
  let nodeModulesDir: string;

  beforeEach(() => {
    // Create temp directory for test files
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-test-consume-'));
    srcDir = path.join(testDir, 'src');
    nodeModulesDir = path.join(testDir, 'node_modules');

    // Create necessary directories
    fs.mkdirSync(srcDir, { recursive: true });
    fs.mkdirSync(path.join(nodeModulesDir, 'react'), { recursive: true });

    // Create dummy react package
    fs.writeFileSync(
      path.join(nodeModulesDir, 'react/package.json'),
      JSON.stringify({
        name: 'react',
        version: '17.0.2',
      }),
    );
    fs.writeFileSync(
      path.join(nodeModulesDir, 'react/index.js'),
      'module.exports = { version: "17.0.2" };',
    );
  });

  afterEach(() => {
    // Clean up test directory
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should create a ConsumeSharedModule for a configured consumed module', async () => {
    // Create entry file that consumes 'react'
    fs.writeFileSync(
      path.join(srcDir, 'index.js'),
      `
      import React from 'react';
      console.log('Consumed React version:', React.version);
    `,
    );

    const config: Configuration = {
      mode: 'development',
      context: testDir,
      entry: path.join(srcDir, 'index.js'),
      output: {
        path: path.join(testDir, 'dist'),
        filename: 'bundle.js',
      },
      resolve: {
        extensions: ['.js', '.json'],
      },
      plugins: [
        new FederationRuntimePlugin({
          name: 'consumer',
          filename: 'remoteEntry.js',
          shared: {
            react: {
              singleton: false,
              requiredVersion: '^17.0.0',
            },
          },
        }),
        new ConsumeSharedPlugin({
          consumes: {
            react: {
              import: 'react',
              shareKey: 'react',
              shareScope: 'default',
              requiredVersion: '^17.0.0',
              singleton: false,
            },
          },
        }),
      ],
    };

    const compiler = webpack(config);
    const stats = await compile(compiler);

    if (!stats) {
      throw new Error('Compilation failed: stats is undefined');
    }
    expect(stats.hasErrors()).toBe(false);
    expect(stats.hasWarnings()).toBe(false);

    const output = stats.toJson({ modules: true });

    // Find the ConsumeSharedModule for 'react'
    const consumeSharedModule = output.modules?.find(
      (m) =>
        m.moduleType === 'consume-shared-module' && m.name?.includes('react'),
    );

    expect(consumeSharedModule).toBeDefined();
    expect(consumeSharedModule?.name).toContain('consume shared module');
    expect(consumeSharedModule?.name).toContain('(default)');
    expect(consumeSharedModule?.name).toContain('react');
  });

  it('should handle eager consumption of shared modules', async () => {
    fs.writeFileSync(
      path.join(srcDir, 'index.js'),
      `
      import React from 'react';
      console.log('Eager React:', React.version);
    `,
    );

    const config: Configuration = {
      mode: 'development',
      context: testDir,
      entry: path.join(srcDir, 'index.js'),
      output: {
        path: path.join(testDir, 'dist'),
        filename: 'bundle.js',
      },
      resolve: {
        extensions: ['.js', '.json'],
      },
      plugins: [
        new FederationRuntimePlugin({
          name: 'consumer',
          filename: 'remoteEntry.js',
          shared: {
            react: {
              singleton: false,
              requiredVersion: '^17.0.0',
              eager: true,
            },
          },
        }),
        new ConsumeSharedPlugin({
          consumes: {
            react: {
              import: 'react',
              shareKey: 'react',
              shareScope: 'default',
              requiredVersion: '^17.0.0',
              singleton: false,
              eager: true,
            },
          },
        }),
      ],
    };

    const compiler = webpack(config);
    const stats = await compile(compiler);

    expect(stats.hasErrors()).toBe(false);
    expect(stats.hasWarnings()).toBe(false);

    const output = stats.toJson({ modules: true });
    const consumeSharedModule = output.modules?.find(
      (m) =>
        m.moduleType === 'consume-shared-module' && m.name?.includes('react'),
    );

    expect(consumeSharedModule).toBeDefined();
    expect(consumeSharedModule?.name).toContain('eager');
  });

  it('should handle strict version checking', async () => {
    fs.writeFileSync(
      path.join(srcDir, 'index.js'),
      `
      import React from 'react';
      console.log('Strict version React:', React.version);
    `,
    );

    const config: Configuration = {
      mode: 'development',
      context: testDir,
      entry: path.join(srcDir, 'index.js'),
      output: {
        path: path.join(testDir, 'dist'),
        filename: 'bundle.js',
      },
      resolve: {
        extensions: ['.js', '.json'],
      },
      plugins: [
        new FederationRuntimePlugin({
          name: 'consumer',
          filename: 'remoteEntry.js',
          shared: {
            react: {
              requiredVersion: '17.0.2', // Exact version required
              strictVersion: true,
              singleton: false,
            },
          },
        }),
        new ConsumeSharedPlugin({
          consumes: {
            react: {
              import: 'react',
              shareKey: 'react',
              shareScope: 'default',
              requiredVersion: '17.0.2',
              strictVersion: true,
              singleton: false,
            },
          },
        }),
      ],
    };

    const compiler = webpack(config);
    const stats = await compile(compiler);

    expect(stats.hasErrors()).toBe(false);

    const output = stats.toJson({ modules: true });
    const consumeSharedModule = output.modules?.find(
      (m) =>
        m.moduleType === 'consume-shared-module' && m.name?.includes('react'),
    );

    expect(consumeSharedModule).toBeDefined();
    expect(consumeSharedModule?.name).toContain('(strict)');
  });

  describe('exclude functionality', () => {
    describe('version-based exclusion', () => {
      it('should exclude module when version matches exclude.version', async () => {
        // Setup React v16.8.0 which should be excluded
        fs.writeFileSync(
          path.join(nodeModulesDir, 'react/package.json'),
          JSON.stringify({
            name: 'react',
            version: '16.8.0',
          }),
        );
        fs.writeFileSync(
          path.join(nodeModulesDir, 'react/index.js'),
          'module.exports = { version: "16.8.0" };',
        );

        // Create entry file
        fs.writeFileSync(
          path.join(srcDir, 'index.js'),
          `
          import React from 'react';
          console.log('React version:', React.version);
        `,
        );

        const config: Configuration = {
          mode: 'development',
          context: testDir,
          entry: path.join(srcDir, 'index.js'),
          output: {
            path: path.join(testDir, 'dist'),
            filename: 'bundle.js',
          },
          resolve: {
            extensions: ['.js', '.json'],
          },
          plugins: [
            new FederationRuntimePlugin({
              name: 'consumer',
              filename: 'remoteEntry.js',
            }),
            new ConsumeSharedPlugin({
              consumes: {
                react: {
                  import: 'react',
                  shareKey: 'react',
                  shareScope: 'default',
                  exclude: {
                    version: '^16.0.0', // Should exclude React 16.x.x
                  },
                  singleton: false,
                },
              },
            }),
          ],
        };

        const compiler = webpack(config);
        const stats = await compile(compiler);

        expect(stats.hasErrors()).toBe(false);

        const output = stats.toJson({ modules: true });
        const consumeSharedModule = output.modules?.find(
          (m) =>
            m.moduleType === 'consume-shared-module' &&
            m.name?.includes('react'),
        );

        // Module should be excluded since version matches exclude pattern
        expect(consumeSharedModule).toBeUndefined();
      });

      it('should not exclude module when version does not match exclude.version', async () => {
        // Setup React v17.0.2 which should not be excluded
        fs.writeFileSync(
          path.join(nodeModulesDir, 'react/package.json'),
          JSON.stringify({
            name: 'react',
            version: '17.0.2',
          }),
        );
        fs.writeFileSync(
          path.join(nodeModulesDir, 'react/index.js'),
          'module.exports = { version: "17.0.2" };',
        );

        // Create entry file
        fs.writeFileSync(
          path.join(srcDir, 'index.js'),
          `
          import React from 'react';
          console.log('React version:', React.version);
        `,
        );

        const config: Configuration = {
          mode: 'development',
          context: testDir,
          entry: path.join(srcDir, 'index.js'),
          output: {
            path: path.join(testDir, 'dist'),
            filename: 'bundle.js',
          },
          resolve: {
            extensions: ['.js', '.json'],
          },
          plugins: [
            new FederationRuntimePlugin({
              name: 'consumer',
              filename: 'remoteEntry.js',
            }),
            new ConsumeSharedPlugin({
              consumes: {
                react: {
                  import: 'react',
                  shareKey: 'react',
                  shareScope: 'default',
                  exclude: {
                    version: '^16.0.0', // Should not exclude React 17.x.x
                  },
                  singleton: false,
                },
              },
            }),
          ],
        };

        const compiler = webpack(config);
        const stats = await compile(compiler);

        expect(stats.hasErrors()).toBe(false);

        const output = stats.toJson({ modules: true });
        const consumeSharedModule = output.modules?.find(
          (m) =>
            m.moduleType === 'consume-shared-module' &&
            m.name?.includes('react'),
        );

        // Module should not be excluded since version doesn't match exclude pattern
        expect(consumeSharedModule).toBeDefined();
      });
    });

    describe('request-based exclusion', () => {
      it('should exclude modules matching exclude.request pattern', async () => {
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

        // Create module files
        fs.writeFileSync(
          path.join(scopeDir, 'excluded-path/index.js'),
          'module.exports = { excluded: true };',
        );
        fs.writeFileSync(
          path.join(scopeDir, 'included-path/index.js'),
          'module.exports = { included: true };',
        );

        // Create entry file that imports both paths
        fs.writeFileSync(
          path.join(srcDir, 'index.js'),
          `
          import excluded from "@scope/prefix/excluded-path";
          import included from "@scope/prefix/included-path";
          console.log(excluded, included);
        `,
        );

        const config: Configuration = {
          mode: 'development',
          context: testDir,
          entry: path.join(srcDir, 'index.js'),
          output: {
            path: path.join(testDir, 'dist'),
            filename: 'bundle.js',
          },
          resolve: {
            extensions: ['.js', '.json'],
          },
          plugins: [
            new FederationRuntimePlugin({
              name: 'consumer',
              filename: 'remoteEntry.js',
            }),
            new ConsumeSharedPlugin({
              consumes: {
                '@scope/prefix/': {
                  import: '@scope/prefix/',
                  shareKey: '@scope/prefix',
                  shareScope: 'default',
                  exclude: {
                    request: /excluded-path$/,
                  },
                  singleton: false,
                },
              },
            }),
          ],
        };

        const compiler = webpack(config);
        const stats = await compile(compiler);

        expect(stats.hasErrors()).toBe(false);

        const output = stats.toJson({ modules: true });

        // Find consume-shared modules
        const consumeSharedModules = output.modules?.filter(
          (m) =>
            m.moduleType === 'consume-shared-module' &&
            (m.name?.includes('excluded-path') ||
              m.name?.includes('included-path')),
        );

        // Should only find the included path as a consume-shared module
        expect(consumeSharedModules?.length).toBe(1);
        expect(consumeSharedModules?.[0].name).toContain('included-path');
        expect(
          consumeSharedModules?.some((m) => m.name?.includes('excluded-path')),
        ).toBe(false);
      });
    });
  });

  it('should handle consuming different versions non-singleton (duplicate check)', async () => {
    const rootVersion = '17.0.2';
    const nestedVersion = '16.0.0';

    // Setup identical to non-singleton test
    fs.writeFileSync(
      path.join(nodeModulesDir, 'react/package.json'),
      JSON.stringify({ name: 'react', version: rootVersion }),
    );
    fs.writeFileSync(
      path.join(nodeModulesDir, 'react/index.js'),
      `module.exports = { version: "${rootVersion}" };`,
    );
    const nestedPackageDir = path.join(testDir, 'node_modules/some-package');
    const nestedReactDir = path.join(nestedPackageDir, 'node_modules/react');
    fs.mkdirSync(nestedReactDir, { recursive: true });
    fs.writeFileSync(
      path.join(nestedReactDir, 'package.json'),
      JSON.stringify({ name: 'react', version: nestedVersion }),
    );
    fs.writeFileSync(
      path.join(nestedReactDir, 'index.js'),
      `module.exports = { version: "${nestedVersion}" };`,
    );
    fs.writeFileSync(
      path.join(nestedPackageDir, 'package.json'),
      JSON.stringify({
        name: 'some-package',
        version: '1.0.0',
        dependencies: { react: nestedVersion },
      }),
    );
    fs.writeFileSync(
      path.join(nestedPackageDir, 'index.js'),
      'import React from "react"; export default React;',
    );
    fs.writeFileSync(
      path.join(srcDir, 'index.js'),
      'import RootReact from "react"; import NestedReactPkg from "some-package"; console.log(RootReact.version, NestedReactPkg.default.version);',
    );

    const config: Configuration = {
      mode: 'development',
      context: testDir,
      entry: path.join(srcDir, 'index.js'),
      output: {
        path: path.join(testDir, 'dist'),
        filename: 'bundle.js',
      },
      resolve: {
        extensions: ['.js', '.json'],
      },
      plugins: [
        new FederationRuntimePlugin({
          name: 'consumer',
          filename: 'remoteEntry.js',
        }),
        new ConsumeSharedPlugin({
          consumes: {
            react: {
              import: 'react',
              shareKey: 'react',
              shareScope: 'default',
              requiredVersion: false, // Allow any version
              singleton: false, // Explicitly non-singleton
              eager: false,
            },
          },
        }),
      ],
    };

    const compiler = webpack(config);
    const stats = await compile(compiler);

    expect(stats.hasErrors()).toBe(false);

    const output = stats.toJson({ modules: true });
    const consumeSharedModules = output.modules?.filter(
      (m) =>
        m.moduleType === 'consume-shared-module' && m.name?.includes('react'),
    );

    // Check non-singleton case - expect at least one module
    expect(consumeSharedModules?.length).toBeGreaterThanOrEqual(1);
    // Basic check that a react consume module exists
    expect(consumeSharedModules?.[0]?.name).toContain('react');
    // Ensure singleton is NOT mentioned in the name for this non-singleton test
    expect(
      consumeSharedModules?.every((m) => !m.name?.includes('singleton')),
    ).toBe(true);
  });

  it('should exclude nested version when consuming with exclude.version', async () => {
    // Setup React v16.8.0 which should be excluded
    fs.writeFileSync(
      path.join(nodeModulesDir, 'react/package.json'),
      JSON.stringify({
        name: 'react',
        version: '16.8.0',
      }),
    );
    fs.writeFileSync(
      path.join(nodeModulesDir, 'react/index.js'),
      'module.exports = { version: "16.8.0" };',
    );

    // Create entry file
    fs.writeFileSync(
      path.join(srcDir, 'index.js'),
      `
      import React from 'react';
      console.log('React version:', React.version);
    `,
    );

    const config: Configuration = {
      mode: 'development',
      context: testDir,
      entry: path.join(srcDir, 'index.js'),
      output: {
        path: path.join(testDir, 'dist'),
        filename: 'bundle.js',
      },
      resolve: {
        extensions: ['.js', '.json'],
      },
      plugins: [
        new FederationRuntimePlugin({
          name: 'consumer',
          filename: 'remoteEntry.js',
        }),
        new ConsumeSharedPlugin({
          consumes: {
            react: {
              import: 'react',
              shareKey: 'react',
              shareScope: 'default',
              exclude: {
                version: '^16.0.0', // Should exclude React 16.x.x
              },
              singleton: false,
            },
          },
        }),
      ],
    };

    const compiler = webpack(config);
    const stats = await compile(compiler);

    expect(stats.hasErrors()).toBe(false);

    const output = stats.toJson({ modules: true });
    const consumeSharedModule = output.modules?.find(
      (m) =>
        m.moduleType === 'consume-shared-module' && m.name?.includes('react'),
    );

    // Module should be excluded since version matches exclude pattern
    expect(consumeSharedModule).toBeUndefined();
  });
});
