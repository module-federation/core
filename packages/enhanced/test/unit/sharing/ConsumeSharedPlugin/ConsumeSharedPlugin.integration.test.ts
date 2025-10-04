/*
 * @jest-environment node
 */

import ConsumeSharedPlugin from '../../../../src/lib/sharing/ConsumeSharedPlugin';
import ConsumeSharedModule from '../../../../src/lib/sharing/ConsumeSharedModule';
import { vol } from 'memfs';
import { SyncHook, AsyncSeriesHook } from 'tapable';
import { createMockCompilation } from '../plugin-test-utils';
import { toSemVerRange } from './helpers';

// Use memfs to isolate filesystem effects for integration-style tests
jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  getWebpackPath: jest.fn(() => 'webpack'),
  normalizeWebpackPath: jest.fn((value: string) => value),
}));

jest.mock(
  '../../../../src/lib/container/runtime/FederationRuntimePlugin',
  () => {
    return jest.fn().mockImplementation(() => ({
      apply: jest.fn(),
    }));
  },
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

const buildTestCompilation = () => {
  const { mockCompilation } = createMockCompilation();
  const compilation = mockCompilation;
  compilation.compiler = { context: '/test-project' };
  compilation.contextDependencies = { addAll: jest.fn() };
  compilation.fileDependencies = { addAll: jest.fn() };
  compilation.missingDependencies = { addAll: jest.fn() };
  compilation.warnings = [];
  compilation.errors = [];
  compilation.dependencyFactories = new Map();
  return compilation;
};

const createMemfsCompilation = () => {
  const compilation = buildTestCompilation();
  compilation.resolverFactory = {
    get: () => ({
      resolve: (
        _context: unknown,
        _lookupStartPath: string,
        request: string,
        _resolveContext: unknown,
        callback: (err: Error | null, result?: string) => void,
      ) => callback(null, `/test-project/node_modules/${request}`),
    }),
  };
  compilation.inputFileSystem = require('fs');
  return compilation;
};

describe('ConsumeSharedPlugin integration scenarios', () => {
  beforeEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  it('registers compiler hooks using real tapable instances', () => {
    const trackHook = <THook extends SyncHook<any> | AsyncSeriesHook<any>>(
      hook: THook,
    ) => {
      const tapCalls: Array<{ name: string; fn: unknown }> = [];
      const originalTap = hook.tap.bind(hook);
      hook.tap = ((name: string, fn: any) => {
        tapCalls.push({ name, fn });
        (hook as any).__tapCalls = tapCalls;
        return originalTap(name, fn);
      }) as any;

      if ('tapAsync' in hook && typeof hook.tapAsync === 'function') {
        const originalTapAsync = (hook.tapAsync as any).bind(hook);
        hook.tapAsync = ((name: string, fn: any) => {
          tapCalls.push({ name, fn });
          (hook as any).__tapCalls = tapCalls;
          return originalTapAsync(name, fn);
        }) as any;
      }

      if ('tapPromise' in hook && typeof hook.tapPromise === 'function') {
        const originalTapPromise = (hook.tapPromise as any).bind(hook);
        hook.tapPromise = ((name: string, fn: any) => {
          tapCalls.push({ name, fn });
          (hook as any).__tapCalls = tapCalls;
          return originalTapPromise(name, fn);
        }) as any;
      }

      return hook;
    };

    const thisCompilationHook = trackHook(new SyncHook<[unknown, unknown]>());
    const finishMakeHook = trackHook(new AsyncSeriesHook<[unknown]>());

    const compiler = {
      hooks: {
        thisCompilation: thisCompilationHook,
        compilation: new SyncHook<[unknown, unknown]>(),
        finishMake: finishMakeHook,
      },
      context: '/test-project',
      options: {
        plugins: [],
        output: { uniqueName: 'test-app' },
      },
    };

    const plugin = new ConsumeSharedPlugin({
      shareScope: 'default',
      consumes: { react: '^17.0.0' },
    });

    let tappedCompilationCallback:
      | ((compilation: unknown, params: unknown) => void)
      | null = null;
    const originalTap = thisCompilationHook.tap;
    thisCompilationHook.tap = jest.fn(
      (
        name: string,
        callback: (compilation: unknown, params: unknown) => void,
      ) => {
        tappedCompilationCallback = callback;
        return originalTap.call(thisCompilationHook, name, callback);
      },
    );

    plugin.apply(compiler as any);

    expect(
      (thisCompilationHook as any).__tapCalls?.length ?? 0,
    ).toBeGreaterThan(0);

    expect(tappedCompilationCallback).not.toBeNull();
    if (tappedCompilationCallback) {
      const compilation = buildTestCompilation();
      const moduleHook = new SyncHook<[unknown, unknown, unknown]>();
      const params = {
        normalModuleFactory: {
          hooks: {
            factorize: new AsyncSeriesHook<[unknown]>(),
            createModule: new AsyncSeriesHook<[unknown]>(),
            module: moduleHook,
          },
        },
      };

      expect(() =>
        tappedCompilationCallback!(compilation, params),
      ).not.toThrow();
      expect(compilation.dependencyFactories.size).toBeGreaterThan(0);
    }
  });

  it('creates real ConsumeSharedModule instances using memfs-backed package data', async () => {
    vol.fromJSON({
      '/test-project/package.json': JSON.stringify({
        name: 'test-app',
        version: '1.0.0',
        dependencies: {
          react: '^17.0.2',
        },
      }),
      '/test-project/node_modules/react/package.json': JSON.stringify({
        name: 'react',
        version: '17.0.2',
      }),
    });

    const plugin = new ConsumeSharedPlugin({
      shareScope: 'default',
      consumes: { react: '^17.0.0' },
    });

    const compilation = createMemfsCompilation();

    const module = await plugin.createConsumeSharedModule(
      compilation,
      '/test-project',
      'react',
      {
        import: undefined,
        shareScope: 'default',
        shareKey: 'react',
        requiredVersion: toSemVerRange('^17.0.0'),
        strictVersion: false,
        packageName: 'react',
        singleton: false,
        eager: false,
        issuerLayer: undefined,
        layer: undefined,
        request: 'react',
        include: undefined,
        exclude: undefined,
        nodeModulesReconstructedLookup: undefined,
      },
    );

    expect(module).toBeInstanceOf(ConsumeSharedModule);
    expect(compilation.errors).toHaveLength(0);
    expect(compilation.warnings).toHaveLength(0);
  });

  it('tolerates strict version mismatches by still generating modules', async () => {
    vol.fromJSON({
      '/test-project/package.json': JSON.stringify({
        name: 'test-app',
        dependencies: { react: '^16.0.0' },
      }),
      '/test-project/node_modules/react/package.json': JSON.stringify({
        name: 'react',
        version: '16.14.0',
      }),
    });

    const plugin = new ConsumeSharedPlugin({
      shareScope: 'default',
      consumes: {
        react: { requiredVersion: '^17.0.0', strictVersion: true },
      },
    });

    const compilation = createMemfsCompilation();

    const module = await plugin.createConsumeSharedModule(
      compilation,
      '/test-project',
      'react',
      {
        import: undefined,
        shareScope: 'default',
        shareKey: 'react',
        requiredVersion: toSemVerRange('^17.0.0'),
        strictVersion: true,
        packageName: 'react',
        singleton: false,
        eager: false,
        issuerLayer: undefined,
        layer: undefined,
        request: 'react',
        include: undefined,
        exclude: undefined,
        nodeModulesReconstructedLookup: undefined,
      },
    );

    expect(module).toBeInstanceOf(ConsumeSharedModule);
    expect(compilation.errors).toHaveLength(0);
  });

  it('handles missing package metadata gracefully', async () => {
    vol.fromJSON({
      '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
    });

    const plugin = new ConsumeSharedPlugin({
      shareScope: 'default',
      consumes: { react: '^17.0.0' },
    });

    const compilation = createMemfsCompilation();

    const module = await plugin.createConsumeSharedModule(
      compilation,
      '/test-project',
      'react',
      {
        import: undefined,
        shareScope: 'default',
        shareKey: 'react',
        requiredVersion: toSemVerRange('^17.0.0'),
        strictVersion: false,
        packageName: 'react',
        singleton: false,
        eager: false,
        issuerLayer: undefined,
        layer: undefined,
        request: 'react',
        include: undefined,
        exclude: undefined,
        nodeModulesReconstructedLookup: undefined,
      },
    );

    expect(module).toBeInstanceOf(ConsumeSharedModule);
    expect(compilation.errors).toHaveLength(0);
  });
});
