/*
 * @jest-environment node
 */

import ProvideSharedPlugin from '../../../../src/lib/sharing/ProvideSharedPlugin';
import { vol } from 'memfs';
import { SyncHook, AsyncSeriesHook } from 'tapable';

// Mock file system for controlled integration testing
jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  getWebpackPath: jest.fn(() => 'webpack'),
  normalizeWebpackPath: jest.fn((value: string) => value),
}));

jest.mock(
  '../../../../src/lib/container/runtime/FederationRuntimePlugin',
  () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      apply: jest.fn(),
    })),
  }),
);

jest.mock('webpack/lib/util/fs', () => ({
  join: (_fs: unknown, ...segments: string[]) =>
    require('path').join(...segments),
  dirname: (_fs: unknown, filePath: string) =>
    require('path').dirname(filePath),
  readJson: (
    _fs: unknown,
    filePath: string,
    callback: (err: any, data?: any) => void,
  ) => {
    const memfs = require('memfs').fs;
    memfs.readFile(filePath, 'utf8', (error: any, content: string) => {
      if (error) return callback(error);
      try {
        callback(null, JSON.parse(content));
      } catch (parseError) {
        callback(parseError);
      }
    });
  },
}));

const createRealCompiler = () => {
  const compiler = {
    hooks: {
      compilation: new SyncHook<[unknown, unknown]>(['compilation', 'params']),
      thisCompilation: new SyncHook<[unknown, unknown]>([
        'compilation',
        'params',
      ]),
      finishMake: new AsyncSeriesHook<[unknown]>(['compilation']),
      make: new AsyncSeriesHook<[unknown]>(['compilation']),
      environment: new SyncHook<[]>([]),
      afterEnvironment: new SyncHook<[]>([]),
      afterPlugins: new SyncHook<[unknown]>(['compiler']),
      afterResolvers: new SyncHook<[unknown]>(['compiler']),
    },
    context: '/test-project',
    options: {
      plugins: [],
      resolve: { alias: {} },
    },
  };

  return compiler as any;
};

const createMockCompilation = () => {
  return {
    dependencyFactories: new Map(),
    hooks: {
      additionalTreeRuntimeRequirements: { tap: jest.fn() },
      finishModules: { tap: jest.fn(), tapAsync: jest.fn() },
      seal: { tap: jest.fn() },
    },
    addRuntimeModule: jest.fn(),
    contextDependencies: { addAll: jest.fn() },
    fileDependencies: { addAll: jest.fn() },
    missingDependencies: { addAll: jest.fn() },
    warnings: [],
    errors: [],
    addInclude: jest.fn(),
    resolverFactory: {
      get: jest.fn(() => ({
        resolve: jest.fn(
          (
            _context: unknown,
            lookupStartPath: string,
            request: string,
            _resolveContext: unknown,
            callback: (err: any, result?: string) => void,
          ) => callback(null, `${lookupStartPath}/${request}`),
        ),
      })),
    },
  };
};

const createMockNormalModuleFactory = () => ({
  hooks: {
    module: { tap: jest.fn() },
    factorize: { tapPromise: jest.fn() },
    createModule: { tapPromise: jest.fn() },
  },
});

describe('ProvideSharedPlugin integration scenarios', () => {
  beforeEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  it('applies plugin and registers hooks without throwing', () => {
    const plugin = new ProvideSharedPlugin({
      shareScope: 'default',
      provides: {
        react: '^17.0.0',
        lodash: { version: '^4.17.21', singleton: true },
      },
    });

    const compiler = createRealCompiler();
    expect(() => plugin.apply(compiler)).not.toThrow();

    expect(compiler.hooks.compilation.taps.length).toBeGreaterThan(0);
    expect(compiler.hooks.finishMake.taps.length).toBeGreaterThan(0);
  });

  it('executes compilation hooks without errors', async () => {
    const plugin = new ProvideSharedPlugin({
      shareScope: 'default',
      provides: {
        react: '^17.0.0',
        lodash: '^4.17.21',
      },
    });

    const compiler = createRealCompiler();
    plugin.apply(compiler);

    const compilation = createMockCompilation();
    const normalModuleFactory = createMockNormalModuleFactory();

    expect(() =>
      compiler.hooks.thisCompilation.call(compilation, {
        normalModuleFactory,
      }),
    ).not.toThrow();

    expect(() =>
      compiler.hooks.compilation.call(compilation, {
        normalModuleFactory,
      }),
    ).not.toThrow();

    await expect(
      compiler.hooks.finishMake.promise(compilation),
    ).resolves.toBeUndefined();
  });

  it('handles real module matching scenarios with memfs', () => {
    vol.fromJSON({
      '/test-project/src/components/Button.js':
        'export const Button = () => {};',
      '/test-project/src/utils/helpers.js': 'export const helper = () => {};',
      '/test-project/node_modules/lodash/index.js': 'module.exports = {};',
    });

    const plugin = new ProvideSharedPlugin({
      shareScope: 'default',
      provides: {
        './src/components/': { shareKey: 'components' },
        'lodash/': { shareKey: 'lodash' },
        './src/utils/helpers': { shareKey: 'helpers' },
      },
    });

    const compiler = createRealCompiler();
    plugin.apply(compiler);

    const compilation = createMockCompilation();
    const moduleHook = new SyncHook<[unknown, unknown, unknown]>([
      'module',
      'data',
      'resolveData',
    ]);
    const normalModuleFactory = {
      hooks: {
        module: moduleHook,
      },
    };

    compiler.hooks.compilation.call(compilation, { normalModuleFactory });

    expect(moduleHook.taps.length).toBeGreaterThan(0);
  });

  it('supports complex configuration patterns without errors', () => {
    const plugin = new ProvideSharedPlugin({
      shareScope: 'default',
      provides: {
        react: {
          version: '^17.0.0',
          singleton: true,
          eager: false,
          shareKey: 'react',
          shareScope: 'framework',
        },
        lodash: '^4.17.21',
        '@types/react': { version: '^17.0.0', singleton: false },
      },
    });

    const compiler = createRealCompiler();
    expect(() => plugin.apply(compiler)).not.toThrow();
  });
});
