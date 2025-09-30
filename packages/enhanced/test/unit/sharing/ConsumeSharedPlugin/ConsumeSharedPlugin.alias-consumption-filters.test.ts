/*
 * @jest-environment node
 */

import {
  ConsumeSharedPlugin,
  mockGetDescriptionFile,
  resetAllMocks,
} from './shared-test-utils';

describe('ConsumeSharedPlugin alias consumption - version filters', () => {
  let plugin: ConsumeSharedPlugin;
  let mockCompilation: any;
  let mockResolver: any;

  beforeEach(() => {
    resetAllMocks();

    plugin = new ConsumeSharedPlugin({
      shareScope: 'default',
      consumes: {
        'next/dist/compiled/react': {
          import: 'next/dist/compiled/react',
          requiredVersion: false,
          // filters will be set per-test
        },
      },
    });

    mockResolver = {
      resolve: jest.fn(),
    };

    mockCompilation = {
      inputFileSystem: {},
      resolverFactory: {
        get: jest.fn(() => mockResolver),
      },
      warnings: [],
      errors: [],
      contextDependencies: { addAll: jest.fn() },
      fileDependencies: { addAll: jest.fn() },
      missingDependencies: { addAll: jest.fn() },
      compiler: {
        context: '/test/context',
      },
    };
  });

  it('excludes alias-resolved module when exclude.version matches (deep path request)', async () => {
    const config: any = {
      import: 'next/dist/compiled/react',
      shareScope: 'default',
      shareKey: 'next/dist/compiled/react',
      requiredVersion: false,
      strictVersion: false,
      singleton: false,
      eager: false,
      issuerLayer: undefined,
      layer: undefined,
      request: 'next/dist/compiled/react',
      exclude: { version: '^18.0.0' },
    };

    // Simulate resolved import path to compiled target (alias path)
    const importResolved = '/abs/node_modules/next/dist/compiled/react.js';
    mockResolver.resolve.mockImplementation((_c, _start, _req, _ctx, cb) =>
      cb(null, importResolved),
    );

    // Package.json belongs to "next" with version 18.2.0
    mockGetDescriptionFile.mockImplementation((_fs, _dir, _files, cb) => {
      cb(null, {
        data: { name: 'next', version: '18.2.0' },
        path: '/abs/node_modules/next/package.json',
      });
    });

    const result = await plugin.createConsumeSharedModule(
      mockCompilation,
      '/test/context',
      importResolved, // alias consumption passes resolved resource as request
      config,
    );

    expect(result).toBeUndefined();
  });

  it('includes alias-resolved module when include.version matches (deep path request)', async () => {
    const config: any = {
      import: 'next/dist/compiled/react',
      shareScope: 'default',
      shareKey: 'next/dist/compiled/react',
      requiredVersion: false,
      strictVersion: false,
      singleton: false,
      eager: false,
      issuerLayer: undefined,
      layer: undefined,
      request: 'next/dist/compiled/react',
      include: { version: '^18.0.0' },
    };

    const importResolved = '/abs/node_modules/next/dist/compiled/react.js';
    mockResolver.resolve.mockImplementation((_c, _start, _req, _ctx, cb) =>
      cb(null, importResolved),
    );

    mockGetDescriptionFile.mockImplementation((_fs, _dir, _files, cb) => {
      cb(null, {
        data: { name: 'next', version: '18.2.0' },
        path: '/abs/node_modules/next/package.json',
      });
    });

    const result = await plugin.createConsumeSharedModule(
      mockCompilation,
      '/test/context',
      importResolved,
      config,
    );

    expect(result).toBeDefined();
  });
});
