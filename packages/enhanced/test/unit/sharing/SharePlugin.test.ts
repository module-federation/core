/*
 * @rstest-environment node
 */

import { rs } from '@rstest/core';
import type { Compiler, Compilation } from 'webpack';
import { SyncHook, AsyncSeriesHook, HookMap } from 'tapable';

type ShareEntryConfig = {
  shareScope?: string | string[];
  requiredVersion?: string;
  singleton?: boolean;
  eager?: boolean;
  import?: boolean | string;
  version?: string;
  include?: Record<string, unknown>;
  exclude?: Record<string, unknown>;
};

type ShareConfigRecord = Record<string, ShareEntryConfig>;

const findShareConfig = (
  records: ShareConfigRecord[],
  key: string,
): ShareEntryConfig | undefined => {
  const record = records.find((entry) =>
    Object.prototype.hasOwnProperty.call(entry, key),
  );
  return record ? record[key] : undefined;
};

const loadMockedSharePlugin = () => {
  const normalizeWebpackPathMock = rs.fn((path: string) => path);
  const getWebpackPathMock = rs.fn(() => 'mocked-webpack-path');

  rs.doMock('@module-federation/sdk/normalize-webpack-path', () => ({
    normalizeWebpackPath: normalizeWebpackPathMock,
    getWebpackPath: getWebpackPathMock,
  }));

  rs.doMock('@module-federation/sdk', () => ({
    isRequiredVersion: rs.fn(
      (version: unknown) =>
        typeof version === 'string' && version.startsWith('^'),
    ),
  }));

  const ConsumeSharedPluginMock = rs
    .fn()
    .mockImplementation((options) => ({ options, apply: rs.fn() }));
  rs.doMock('../../../src/lib/sharing/ConsumeSharedPlugin', () => ({
    __esModule: true,
    default: ConsumeSharedPluginMock,
  }));

  const ProvideSharedPluginMock = rs
    .fn()
    .mockImplementation((options) => ({ options, apply: rs.fn() }));
  rs.doMock('../../../src/lib/sharing/ProvideSharedPlugin', () => ({
    __esModule: true,
    default: ProvideSharedPluginMock,
  }));

  let SharePlugin: any;
  let shareUtils: any;

  rs.resetModules();
  SharePlugin = require('../../../src/lib/sharing/SharePlugin').default;
  shareUtils = require('./utils');

  return {
    SharePlugin,
    shareScopes: shareUtils.shareScopes,
    createMockCompiler: shareUtils.createMockCompiler,
    ConsumeSharedPluginMock,
    ProvideSharedPluginMock,
    getWebpackPath: getWebpackPathMock,
  };
};

// Load the real SharePlugin immediately, before any mocks are set up
// This avoids the issue where mocked tests interfere with integration tests
// and also avoids duplicate serializer registration errors
const loadRealSharePluginOnce = () => {
  // Mock FederationRuntimePlugin to avoid loading the full federation runtime
  rs.doMock(
    '../../../src/lib/container/runtime/FederationRuntimePlugin',
    () => ({
      __esModule: true,
      default: rs.fn().mockImplementation(() => ({ apply: rs.fn() })),
    }),
  );

  // Load the real SharePlugin (which will use real ConsumeSharedPlugin
  // and ProvideSharedPlugin, but mocked FederationRuntimePlugin)
  return require('../../../src/lib/sharing/SharePlugin').default;
};

// Load the real SharePlugin once at module load time
const RealSharePlugin = loadRealSharePluginOnce();

const loadRealSharePlugin = () => {
  return { SharePlugin: RealSharePlugin };
};

describe('SharePlugin (mocked dependencies)', () => {
  let SharePlugin: any;
  let shareScopesLocal: any;
  let createMockCompiler: () => any;
  let ConsumeSharedPluginMock: any;
  let ProvideSharedPluginMock: any;
  let getWebpackPath: any;

  beforeEach(() => {
    rs.resetModules();
    rs.clearAllMocks();
    delete process.env['FEDERATION_WEBPACK_PATH'];
    ({
      SharePlugin,
      shareScopes: shareScopesLocal,
      createMockCompiler,
      ConsumeSharedPluginMock,
      ProvideSharedPluginMock,
      getWebpackPath,
    } = loadMockedSharePlugin());
  });

  afterEach(() => {
    rs.resetModules();
  });

  describe('constructor', () => {
    it('should handle empty shared configuration', () => {
      expect(() => {
        new SharePlugin({
          shared: {},
        });
      }).not.toThrow();
    });

    it('should allow both include and exclude filters together', () => {
      expect(() => {
        new SharePlugin({
          shared: {
            react: {
              include: { version: '^17.0.0' },
              exclude: { version: '^16.0.0' },
            },
          },
        });
      }).not.toThrow();
    });

    it('should initialize with string shareScope', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopesLocal.string,
        shared: {
          react: '^17.0.0',
          lodash: {
            requiredVersion: '^4.17.0',
            singleton: true,
            eager: false,
          },
        },
      });

      expect(plugin._shareScope).toBe(shareScopesLocal.string);

      const consumes = plugin._consumes as ShareConfigRecord[];
      expect(consumes.length).toBe(2);

      const reactConsume = findShareConfig(consumes, 'react');
      expect(reactConsume?.requiredVersion).toBe('^17.0.0');

      const lodashConsume = findShareConfig(consumes, 'lodash');
      expect(lodashConsume?.singleton).toBe(true);

      const provides = plugin._provides as ShareConfigRecord[];
      expect(provides.length).toBe(2);
      expect(findShareConfig(provides, 'react')).toBeDefined();
      expect(findShareConfig(provides, 'lodash')?.singleton).toBe(true);
    });

    it('should initialize with array shareScope', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopesLocal.array,
        shared: {
          react: '^17.0.0',
        },
      });

      expect(plugin._shareScope).toEqual(shareScopesLocal.array);
      expect(findShareConfig(plugin._consumes, 'react')).toBeDefined();
      expect(findShareConfig(plugin._provides, 'react')).toBeDefined();
    });

    it('should handle mix of shareScope overrides', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopesLocal.string,
        shared: {
          react: '^17.0.0',
          lodash: {
            shareScope: 'custom',
            requiredVersion: '^4.17.0',
          },
          moment: {
            shareScope: shareScopesLocal.array,
            requiredVersion: '^2.29.0',
          },
        },
      });

      expect(plugin._shareScope).toBe(shareScopesLocal.string);

      expect(findShareConfig(plugin._consumes, 'react')).toBeDefined();
      expect(findShareConfig(plugin._consumes, 'lodash')?.shareScope).toBe(
        'custom',
      );
      expect(findShareConfig(plugin._consumes, 'moment')?.shareScope).toEqual(
        shareScopesLocal.array,
      );

      expect(findShareConfig(plugin._provides, 'lodash')?.shareScope).toBe(
        'custom',
      );
      expect(findShareConfig(plugin._provides, 'moment')?.shareScope).toEqual(
        shareScopesLocal.array,
      );
    });

    it('should handle import false correctly', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopesLocal.string,
        shared: {
          react: {
            import: false,
            requiredVersion: '^17.0.0',
          },
        },
      });

      expect(plugin._provides).toHaveLength(0);
      expect(findShareConfig(plugin._consumes, 'react')?.import).toBe(false);
    });
  });

  describe('internal state access', () => {
    let plugin: any;

    beforeEach(() => {
      plugin = new SharePlugin({
        shareScope: 'test-scope',
        shared: {
          react: '^17.0.0',
          lodash: {
            import: false,
            requiredVersion: '^4.17.0',
          },
          utils: {
            version: '1.0.0',
          },
        },
      });
    });

    it('should store share scope', () => {
      expect(plugin._shareScope).toBe('test-scope');
    });

    it('should store consumes configurations', () => {
      expect(plugin._consumes).toBeInstanceOf(Array);
      expect(plugin._consumes.length).toBe(3);
    });

    it('should store provides configurations', () => {
      expect(plugin._provides).toBeInstanceOf(Array);
      expect(plugin._provides.length).toBe(2);
    });
  });

  describe('apply', () => {
    let mockCompiler: any;

    beforeEach(() => {
      mockCompiler = createMockCompiler();
      ConsumeSharedPluginMock.mockClear();
      ProvideSharedPluginMock.mockClear();
      getWebpackPath.mockClear();
    });

    it('should apply both consume and provide plugins', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopesLocal.string,
        shared: {
          react: '^17.0.0',
        },
      });

      plugin.apply(mockCompiler);

      expect(process.env['FEDERATION_WEBPACK_PATH']).toBe(
        'mocked-webpack-path',
      );
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);

      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      expect(consumeOptions.shareScope).toBe(shareScopesLocal.string);
      expect(consumeOptions.consumes).toBeInstanceOf(Array);

      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      expect(provideOptions.shareScope).toBe(shareScopesLocal.string);
      expect(provideOptions.provides).toBeInstanceOf(Array);
    });

    it('should handle array shareScope when applying plugins', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopesLocal.array,
        shared: {
          react: '^17.0.0',
        },
      });

      plugin.apply(mockCompiler);

      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];

      expect(consumeOptions.shareScope).toEqual(shareScopesLocal.array);
      expect(provideOptions.shareScope).toEqual(shareScopesLocal.array);
    });

    it('should handle mixed shareScopes when applying plugins', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopesLocal.string,
        shared: {
          react: '^17.0.0',
          lodash: {
            shareScope: shareScopesLocal.array,
            requiredVersion: '^4.17.0',
          },
        },
      });

      plugin.apply(mockCompiler);

      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];

      expect(consumeOptions.shareScope).toBe(shareScopesLocal.string);
      expect(provideOptions.shareScope).toBe(shareScopesLocal.string);

      const consumes = consumeOptions.consumes as ShareConfigRecord[];
      const provides = provideOptions.provides as ShareConfigRecord[];

      expect(consumes.length).toBe(2);
      expect(provides.length).toBe(2);

      expect(findShareConfig(consumes, 'lodash')?.shareScope).toEqual(
        shareScopesLocal.array,
      );
      expect(findShareConfig(provides, 'lodash')?.shareScope).toEqual(
        shareScopesLocal.array,
      );
    });
  });
});

describe('SharePlugin (integration)', () => {
  let SharePlugin: any;

  beforeEach(() => {
    // Don't call rs.resetModules() here as it causes duplicate serializer registration errors
    // The real plugins use webpack's makeSerializable which registers globally
    rs.clearAllMocks();
    delete process.env['FEDERATION_WEBPACK_PATH'];
    ({ SharePlugin } = loadRealSharePlugin());
  });

  afterEach(() => {
    // Clean up environment but don't reset modules
    delete process.env['FEDERATION_WEBPACK_PATH'];
  });

  const createRealWebpackCompiler = (): Compiler => {
    const trackHook = <THook extends SyncHook<any> | AsyncSeriesHook<any>>(
      hook: THook,
    ): THook => {
      const tapCalls: Array<{ name: string; fn: unknown }> = [];
      // Initialize __tapCalls immediately so it's always defined
      (hook as any).__tapCalls = tapCalls;

      const originalTap = hook.tap.bind(hook);
      (hook as any).tap = (
        nameOrOptions: string | { name: string },
        fn: any,
      ) => {
        const name =
          typeof nameOrOptions === 'string'
            ? nameOrOptions
            : nameOrOptions.name;
        tapCalls.push({ name, fn });
        return originalTap(nameOrOptions as string, fn);
      };

      if ('tapAsync' in hook && typeof hook.tapAsync === 'function') {
        const originalTapAsync = (hook.tapAsync as any).bind(hook);
        (hook as any).tapAsync = (
          nameOrOptions: string | { name: string },
          fn: any,
        ) => {
          const name =
            typeof nameOrOptions === 'string'
              ? nameOrOptions
              : nameOrOptions.name;
          tapCalls.push({ name, fn });
          return originalTapAsync(nameOrOptions, fn);
        };
      }

      if ('tapPromise' in hook && typeof hook.tapPromise === 'function') {
        const originalTapPromise = (hook.tapPromise as any).bind(hook);
        (hook as any).tapPromise = (
          nameOrOptions: string | { name: string },
          fn: any,
        ) => {
          const name =
            typeof nameOrOptions === 'string'
              ? nameOrOptions
              : nameOrOptions.name;
          tapCalls.push({ name, fn });
          return originalTapPromise(nameOrOptions, fn);
        };
      }

      return hook;
    };

    const compiler = {
      hooks: {
        thisCompilation: trackHook(
          new SyncHook<[unknown, unknown]>(['compilation', 'params']),
        ),
        compilation: trackHook(
          new SyncHook<[unknown, unknown]>(['compilation', 'params']),
        ),
        finishMake: trackHook(new AsyncSeriesHook<[unknown]>(['compilation'])),
        make: trackHook(new AsyncSeriesHook<[unknown]>(['compilation'])),
        environment: trackHook(new SyncHook<[]>([])),
        afterEnvironment: trackHook(new SyncHook<[]>([])),
        afterPlugins: trackHook(new SyncHook<[unknown]>(['compiler'])),
        afterResolvers: trackHook(new SyncHook<[unknown]>(['compiler'])),
      },
      context: '/test-project',
      options: {
        context: '/test-project',
        output: {
          path: '/test-project/dist',
          uniqueName: 'test-app',
        },
        plugins: [],
        resolve: {
          alias: {},
        },
      },
      webpack: {
        javascript: {
          JavascriptModulesPlugin: {
            getCompilationHooks: rs.fn(() => ({
              renderChunk: new SyncHook<[unknown, unknown]>([
                'source',
                'renderContext',
              ]),
              render: new SyncHook<[unknown, unknown]>([
                'source',
                'renderContext',
              ]),
              chunkHash: new SyncHook<[unknown, unknown, unknown]>([
                'chunk',
                'hash',
                'context',
              ]),
              renderStartup: new SyncHook<[unknown, unknown, unknown]>([
                'source',
                'module',
                'renderContext',
              ]),
            })),
          },
        },
      },
    };

    return compiler as unknown as Compiler;
  };

  const createMockCompilation = () => {
    const runtimeRequirementInTreeHookMap = new HookMap<
      SyncHook<[unknown, unknown, unknown]>
    >(
      () =>
        new SyncHook<[unknown, unknown, unknown]>(['chunk', 'set', 'context']),
    );

    return {
      context: '/test-project',
      compiler: {
        context: '/test-project',
      },
      dependencyFactories: new Map(),
      hooks: {
        additionalTreeRuntimeRequirements: { tap: rs.fn() },
        runtimeRequirementInTree: runtimeRequirementInTreeHookMap,
        finishModules: { tap: rs.fn(), tapAsync: rs.fn() },
        seal: { tap: rs.fn() },
      },
      addRuntimeModule: rs.fn(),
      contextDependencies: { addAll: rs.fn() },
      fileDependencies: { addAll: rs.fn() },
      missingDependencies: { addAll: rs.fn() },
      warnings: [],
      errors: [],
      addInclude: rs.fn(),
      resolverFactory: {
        get: rs.fn(() => ({
          resolve: rs.fn(
            (
              _context: unknown,
              path: string,
              _request: string,
              _resolveContext: unknown,
              callback: (err: unknown, result?: string) => void,
            ) => {
              callback(null, path);
            },
          ),
        })),
      },
    };
  };

  type NormalModuleFactoryLike = {
    hooks: {
      module: { tap: any };
      factorize: { tapPromise: any };
      createModule: { tapPromise: any };
    };
  };

  const createMockNormalModuleFactory = (): NormalModuleFactoryLike => ({
    hooks: {
      module: { tap: rs.fn() },
      factorize: { tapPromise: rs.fn() },
      createModule: { tapPromise: rs.fn() },
    },
  });

  const createCompilationParams = (
    normalModuleFactory: NormalModuleFactoryLike,
  ) => ({
    normalModuleFactory,
    contextModuleFactory: {} as Record<string, unknown>,
  });

  describe('plugin integration', () => {
    it('should integrate with webpack compiler for shared modules', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: '^17.0.0',
          lodash: {
            requiredVersion: '^4.17.21',
            singleton: true,
            eager: false,
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      expect(
        (compiler.hooks.thisCompilation as any).__tapCalls?.length ?? 0,
      ).toBeGreaterThan(0);
      expect(
        (compiler.hooks.compilation as any).__tapCalls?.length ?? 0,
      ).toBeGreaterThan(0);
      expect(
        (compiler.hooks.finishMake as any).__tapCalls?.length ?? 0,
      ).toBeGreaterThan(0);
    });

    it('should handle array shareScope configuration', () => {
      const plugin = new SharePlugin({
        shareScope: ['default', 'custom'],
        shared: {
          react: '^17.0.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();
      expect(
        (compiler.hooks.thisCompilation as any).__tapCalls?.length ?? 0,
      ).toBeGreaterThan(0);
    });

    it('should handle separate consumes and provides configurations', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: '^17.0.0',
          'external-lib': {
            requiredVersion: '^1.0.0',
            singleton: true,
          },
          'my-utils': {
            version: '1.0.0',
            shareKey: 'utils',
            import: 'my-utils',
          },
          'my-components': {
            version: '2.1.0',
            import: 'my-components',
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();
      expect(
        (compiler.hooks.compilation as any).__tapCalls?.length ?? 0,
      ).toBeGreaterThan(0);
    });
  });

  describe('webpack compilation integration', () => {
    it('should execute compilation hooks without errors', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: '^17.0.0',
          lodash: '^4.17.21',
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      const compilation = createMockCompilation();
      const normalModuleFactory = createMockNormalModuleFactory();
      const thisCompilationParams = createCompilationParams(
        normalModuleFactory,
      ) as unknown as Parameters<typeof compiler.hooks.thisCompilation.call>[1];
      const compilationParams = createCompilationParams(
        normalModuleFactory,
      ) as unknown as Parameters<typeof compiler.hooks.compilation.call>[1];

      expect(() =>
        compiler.hooks.thisCompilation.call(
          compilation as unknown as Compilation,
          thisCompilationParams,
        ),
      ).not.toThrow();

      expect(() =>
        compiler.hooks.compilation.call(
          compilation as unknown as Compilation,
          compilationParams,
        ),
      ).not.toThrow();
    });

    it('should handle finishMake hook execution', async () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: '^17.0.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      plugin.apply(compiler);

      const compilation = createMockCompilation();

      await expect(
        compiler.hooks.finishMake.promise(
          compilation as unknown as Compilation,
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('configuration handling', () => {
    it('should handle consumes-only configuration', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: '^17.0.0',
          lodash: {
            requiredVersion: '^4.17.21',
            singleton: true,
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();
      expect(
        (compiler.hooks.thisCompilation as any).__tapCalls?.length ?? 0,
      ).toBeGreaterThan(0);
    });

    it('should handle provides-only configuration', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          'my-utils': {
            version: '1.0.0',
            import: 'my-utils',
          },
          'my-components': {
            version: '2.0.0',
            shareKey: 'components',
            import: 'my-components',
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();
      expect(
        (compiler.hooks.compilation as any).__tapCalls?.length ?? 0,
      ).toBeGreaterThan(0);
    });

    it('should handle complex shared module configurations', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: {
            requiredVersion: '^17.0.0',
            version: '17.0.2',
            singleton: true,
            eager: false,
            shareKey: 'react',
            shareScope: 'framework',
          },
          lodash: '^4.17.21',
          '@types/react': {
            version: '^17.0.0',
            singleton: false,
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();
      expect(
        (compiler.hooks.compilation as any).__tapCalls?.length ?? 0,
      ).toBeGreaterThan(0);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty shared configuration', () => {
      expect(() => {
        new SharePlugin({
          shareScope: 'default',
          shared: {},
        });
      }).not.toThrow();
    });

    it('should handle missing shareScope with default fallback', () => {
      const plugin = new SharePlugin({
        shared: {
          react: '^17.0.0',
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();
    });

    it('should validate and apply comprehensive configuration', () => {
      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^17.0.0',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^17.0.0',
          },
          lodash: '^4.17.21',
          'external-utils': {
            shareScope: 'utils',
            requiredVersion: '^1.0.0',
          },
          'internal-components': {
            version: '2.0.0',
            shareKey: 'components',
            import: 'internal-components',
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();
      expect(
        (compiler.hooks.finishMake as any).__tapCalls?.length ?? 0,
      ).toBeGreaterThan(0);
    });
  });

  describe('real-world usage scenarios', () => {
    it('should support micro-frontend sharing patterns', () => {
      const plugin = new SharePlugin({
        shareScope: 'mf',
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^17.0.0',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^17.0.0',
          },
          lodash: {
            singleton: false,
            requiredVersion: '^4.17.0',
          },
          'design-system': {
            version: '1.5.0',
            shareKey: 'ds',
            import: 'design-system',
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();

      const compilation = createMockCompilation();
      const normalModuleFactory = createMockNormalModuleFactory();
      const microFrontendParams = createCompilationParams(
        normalModuleFactory,
      ) as unknown as Parameters<typeof compiler.hooks.thisCompilation.call>[1];

      expect(() =>
        compiler.hooks.thisCompilation.call(
          compilation as unknown as Compilation,
          microFrontendParams,
        ),
      ).not.toThrow();
    });

    it('should support development vs production sharing strategies', () => {
      const isProduction = false;

      const plugin = new SharePlugin({
        shareScope: 'default',
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^17.0.0',
            strictVersion: !isProduction,
          },
          'dev-tools': {
            ...(isProduction ? {} : { version: '1.0.0' }),
          },
        },
      });

      const compiler = createRealWebpackCompiler();
      expect(() => plugin.apply(compiler)).not.toThrow();
    });
  });
});
