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

    // Add a project-level package.json to testDir
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'test-nested-include',
          version: '1.0.0',
          dependencies: {
            react: '16.8.0',
            'some-package': '1.0.0',
          },
          devDependencies: {
            jest: '^29.0.0',
            webpack: '^5.0.0',
          },
        },
        null,
        2,
      ),
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

        // Create a root package.json for the test project with react dependency
        fs.writeFileSync(
          path.join(testDir, 'package.json'),
          JSON.stringify(
            {
              name: 'test-project',
              version: '1.0.0',
              dependencies: {
                react: '16.8.0',
              },
            },
            null,
            2,
          ),
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
                  requiredVersion: '^16.0.0', // Explicitly set requiredVersion
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
        expect(stats.hasWarnings()).toBe(false); // Assert no warnings

        const output = stats.toJson();
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

  describe('include functionality', () => {
    describe('version-based inclusion', () => {
      it('should include module when version matches include.version', async () => {
        // Setup React v17.0.2 which should be included
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

        // Create a root package.json for the test project with react dependency
        fs.writeFileSync(
          path.join(testDir, 'package.json'),
          JSON.stringify(
            {
              name: 'test-project',
              version: '1.0.0',
              dependencies: {
                react: '17.0.2',
              },
            },
            null,
            2,
          ),
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
                  requiredVersion: '^17.0.0',
                  include: {
                    version: '^17.0.0', // Should include React 17.x.x
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
        expect(stats.hasWarnings()).toBe(false);

        const output = stats.toJson();
        console.log(output);
        const consumeSharedModules = output.modules?.filter(
          (m) =>
            m.moduleType === 'consume-shared-module' &&
            m.name?.includes('react'),
        );
        console.log(consumeSharedModules);
        // Module should be included since version matches include pattern
        expect(consumeSharedModules).toBeDefined();
        expect(consumeSharedModules?.length).toBeGreaterThan(0);
        // There should be at least one module
        expect(consumeSharedModules.length).toBeGreaterThan(0);
        // All included modules should point to the correct fallback path (react@17.0.2)
        consumeSharedModules.forEach((module) => {
          expect(module.identifier).toContain('node_modules/react/index.js');
          expect(module.identifier).not.toContain('16.');
        });
      });

      it('should include only root module when version matches include.version', async () => {
        // Setup React v17.0.2 in the root node_modules (should be included)
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

        // Setup React v16.8.0 in a nested node_modules (should be excluded)
        const nestedPackageDir = path.join(nodeModulesDir, 'some-package');
        const nestedReactDir = path.join(
          nestedPackageDir,
          'node_modules/react',
        );
        fs.mkdirSync(nestedReactDir, { recursive: true });
        fs.writeFileSync(
          path.join(nestedReactDir, 'package.json'),
          JSON.stringify({
            name: 'react',
            version: '16.8.0',
          }),
        );
        fs.writeFileSync(
          path.join(nestedReactDir, 'index.js'),
          'module.exports = { version: "16.8.0" };',
        );
        fs.writeFileSync(
          path.join(nestedPackageDir, 'package.json'),
          JSON.stringify({
            name: 'some-package',
            version: '1.0.0',
            dependencies: { react: '^16.0.0' },
          }),
        );
        // Ensure some-package/index.js imports its own local react
        fs.writeFileSync(
          path.join(nestedPackageDir, 'index.js'),
          'import React from "react"; export default React;',
        );

        // Create entry file that imports from both paths
        fs.writeFileSync(
          path.join(srcDir, 'index.js'),
          `
          import RootReact from "react";
          import NestedReactPkg from "some-package";
          console.log(RootReact.version, NestedReactPkg.default.version);
        `,
        );

        const config = {
          mode: 'development',
          context: testDir,
          entry: path.join(srcDir, 'index.js'),
          output: {
            path: path.join(testDir, 'dist'),
            filename: 'bundle.js',
          },
          resolve: {
            extensions: ['.js', '.json'],
            modules: ['node_modules', path.join(testDir, 'node_modules')],
          },
          plugins: [
            new FederationRuntimePlugin({
              name: 'consumer',
              filename: 'remoteEntry.js',
            }),
            new ConsumeSharedPlugin({
              consumes: {
                react: {
                  shareKey: 'react',
                  shareScope: 'default',
                  include: {
                    version: '^17.0.0', // Should only include React 17.x.x
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
        expect(stats.hasWarnings()).toBe(false);

        const output = stats.toJson({ modules: true });
        const consumeSharedModules =
          output.modules?.filter(
            (m) =>
              m.moduleType === 'consume-shared-module' &&
              m.name?.includes('react'),
          ) || [];
        // There should be at least one module for the correct version (root)
        expect(
          consumeSharedModules.some(
            (m) =>
              m.identifier.includes('node_modules/react/index.js') &&
              !m.identifier.includes('some-package'),
          ),
        ).toBe(true);
        // There should be no modules for the nested version (16.x.x)
        expect(
          consumeSharedModules.some((m) =>
            m.identifier.includes('some-package/node_modules/react/index.js'),
          ),
        ).toBe(false);
      });

      it('should include only nested module when version matches include.version (multi-version structure)', async () => {
        // Setup shared@1.0.0 in the root node_modules (should be excluded)
        const sharedRootDir = path.join(nodeModulesDir, 'shared');
        fs.mkdirSync(sharedRootDir, { recursive: true });
        fs.writeFileSync(
          path.join(sharedRootDir, 'package.json'),
          JSON.stringify({ name: 'shared', version: '1.0.0' }),
        );
        fs.writeFileSync(
          path.join(sharedRootDir, 'index.js'),
          'module.exports = { version: "1.0.0" };',
        );

        // Add a base package.json to testDir to avoid missing dependency warnings
        fs.writeFileSync(
          path.join(testDir, 'package.json'),
          JSON.stringify(
            {
              name: 'test-multi-version-include',
              version: '1.0.0',
              dependencies: {
                shared: '1.0.0',
                'my-module': '1.0.0',
              },
            },
            null,
            2,
          ),
        );

        // Setup my-module with its own node_modules/shared@2.0.0 (should be included)
        const myModuleDir = path.join(nodeModulesDir, 'my-module');
        const myModuleNodeModules = path.join(myModuleDir, 'node_modules');
        const sharedNestedDir = path.join(myModuleNodeModules, 'shared');
        fs.mkdirSync(sharedNestedDir, { recursive: true });
        fs.writeFileSync(
          path.join(sharedNestedDir, 'package.json'),
          JSON.stringify({ name: 'shared', version: '2.0.0' }),
        );
        fs.writeFileSync(
          path.join(sharedNestedDir, 'index.js'),
          'module.exports = { version: "2.0.0" };',
        );
        fs.writeFileSync(
          path.join(myModuleDir, 'package.json'),
          JSON.stringify({
            name: 'my-module',
            version: '1.0.0',
            dependencies: { shared: '^2.0.0' },
          }),
        );
        fs.writeFileSync(
          path.join(myModuleDir, 'index.js'),
          'import shared from "shared"; export const version = shared.version;',
        );

        // Create entry file that imports from both paths
        fs.writeFileSync(
          path.join(srcDir, 'index.js'),
          `
          import shared from "shared";
          import * as myModule from "my-module";
          console.log(shared.version, myModule.version);
        `,
        );

        const config = {
          mode: 'development',
          context: testDir,
          entry: path.join(srcDir, 'index.js'),
          output: {
            path: path.join(testDir, 'dist'),
            filename: 'bundle.js',
          },
          resolve: {
            extensions: ['.js', '.json'],
            modules: ['node_modules', path.join(testDir, 'node_modules')],
          },
          plugins: [
            new FederationRuntimePlugin({
              name: 'consumer',
              filename: 'remoteEntry.js',
            }),
            new ConsumeSharedPlugin({
              consumes: {
                shared: {
                  shareKey: 'shared',
                  shareScope: 'default',
                  include: {
                    version: '^2.0.0', // Should only include shared@2.0.0
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
        expect(stats.hasWarnings()).toBe(false);

        const output = stats.toJson({ modules: true });
        const consumeSharedModules =
          output.modules?.filter(
            (m) =>
              m.moduleType === 'consume-shared-module' &&
              m.name?.includes('shared'),
          ) || [];
        // --- DEBUG LOGGING ---
        console.log(
          'DEBUG: consumeSharedModules:',
          consumeSharedModules.map((m) => ({
            identifier: m.identifier,
            version: m.version,
          })),
        );
        // There should be at least one module for the correct version (nested)
        expect(
          consumeSharedModules.some((m) =>
            m.identifier.includes('my-module/node_modules/shared/index.js'),
          ),
        ).toBe(true);
        // There should be no modules for the root version (1.0.0)
        expect(
          consumeSharedModules.some(
            (m) =>
              m.identifier.includes('node_modules/shared/index.js') &&
              !m.identifier.includes('my-module'),
          ),
        ).toBe(false);
      });
    });
  });

  it('should reconstruct node_modules path and share submodules with nodeModulesReconstructedLookup experiment', async () => {
    // Setup shared@1.0.0 in the root node_modules
    const sharedRootDir = path.join(nodeModulesDir, 'shared');
    const sharedDir = path.join(sharedRootDir, 'directory');
    fs.mkdirSync(sharedDir, { recursive: true });
    fs.writeFileSync(
      path.join(sharedRootDir, 'package.json'),
      JSON.stringify({ name: 'shared', version: '1.0.0' }),
    );
    // shared/directory/thing.js
    fs.writeFileSync(
      path.join(sharedDir, 'thing.js'),
      'module.exports = { thing: "hello from thing" };',
    );
    // shared/index.js imports ./directory/thing
    fs.writeFileSync(
      path.join(sharedRootDir, 'index.js'),
      'module.exports = { ...require("./directory/thing") };',
    );
    // Add a base package.json to testDir
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify(
        {
          name: 'test-reconstructed-lookup',
          version: '1.0.0',
          dependencies: { shared: '1.0.0' },
        },
        null,
        2,
      ),
    );
    // Entry file imports from shared
    fs.writeFileSync(
      path.join(srcDir, 'index.js'),
      'const shared = require("shared"); console.log(shared.thing);',
    );
    const config = {
      mode: 'development',
      context: testDir,
      entry: path.join(srcDir, 'index.js'),
      output: {
        path: path.join(testDir, 'dist'),
        filename: 'bundle.js',
      },
      resolve: {
        extensions: ['.js', '.json'],
        modules: ['node_modules', path.join(testDir, 'node_modules')],
      },
      plugins: [
        new FederationRuntimePlugin({
          name: 'consumer',
          filename: 'remoteEntry.js',
        }),
        new ConsumeSharedPlugin({
          consumes: {
            shared: {
              shareKey: 'shared',
              shareScope: 'default',
              singleton: false,
            },
            'shared/directory/': {
              shareKey: 'shared/directory/',
              shareScope: 'default',
              singleton: false,
            },
          },
          experiments: {
            nodeModulesReconstructedLookup: true,
          },
        }),
      ],
    };
    const compiler = webpack(config);
    const stats = await compile(compiler);
    expect(stats.hasErrors()).toBe(false);
    expect(stats.hasWarnings()).toBe(false);
    const output = stats.toJson({ modules: true });
    // Find consume-shared modules for both root and submodule
    const consumeSharedModules =
      output.modules?.filter(
        (m) =>
          m.moduleType === 'consume-shared-module' &&
          m.name?.includes('shared'),
      ) || [];
    // Should include the submodule (directory/thing)
    expect(
      consumeSharedModules.some((m) =>
        m.identifier.includes('shared/directory/thing.js'),
      ),
    ).toBe(true);
    // Should include the root module
    expect(
      consumeSharedModules.some((m) =>
        m.identifier.includes('shared/index.js'),
      ),
    ).toBe(true);
  });
});
