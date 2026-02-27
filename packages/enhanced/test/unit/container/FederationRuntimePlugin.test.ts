import FederationRuntimePlugin from '../../../src/lib/container/runtime/FederationRuntimePlugin';
import type { Compiler } from 'webpack';
import { rs, Mock } from '@rstest/core';

// Use rs.hoisted() to create mock functions that are hoisted along with rs.mock()
const mocks = rs.hoisted(() => ({
  mockGetWebpackPath: rs.fn(() => 'webpack'),
}));

rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: (path: string) => path,
  getWebpackPath: mocks.mockGetWebpackPath,
}));

describe('FederationRuntimePlugin runtimePluginCalls', () => {
  let compiler: any;
  let mockOptions: any;

  beforeEach(() => {
    compiler = {
      options: {
        context: '/test/path',
      },
      hooks: {
        thisCompilation: {
          tap: rs.fn(),
        },
        make: {
          tapAsync: rs.fn(),
        },
      },
    };

    mockOptions = {
      name: 'test-container',
      virtualRuntimeEntry: true,
    };

    // Mock process.cwd
    Object.defineProperty(process, 'cwd', {
      value: () => '/current/working/dir',
    });
  });

  afterEach(() => {
    rs.clearAllMocks();
  });

  describe('runtimePluginCalls array', () => {
    it('should create runtimePluginCalls when runtimePlugins is provided', () => {
      const optionsWithPlugins = {
        ...mockOptions,
        runtimePlugins: ['plugin1.js', 'plugin2.js'],
      };
      const template = FederationRuntimePlugin.getTemplate(
        compiler as Compiler,
        optionsWithPlugins,
        'bundler-runtime.js',
        {},
      );

      // 验证生成的模板中包含插件调用
      expect(template).toContain('plugin_0');
      expect(template).toContain('plugin_1');
      expect(template).toContain('pluginsToAdd = [');
    });

    it('should handle runtimePlugins with parameters', () => {
      const optionsWithPlugins = {
        ...mockOptions,
        runtimePlugins: [
          'plugin1.js',
          ['plugin2.js', { param1: 'value1', param2: 'value2' }],
        ],
      };

      const template = FederationRuntimePlugin.getTemplate(
        compiler as Compiler,
        optionsWithPlugins,
        'bundler-runtime.js',
        {},
      );

      // 验证生成的模板中包含带参数的插件调用
      expect(template).toContain('plugin_0');
      expect(template).toContain('plugin_1');
      expect(template).toContain('{"param1":"value1","param2":"value2"}');
    });

    it('should not include runtimePluginCalls when no runtimePlugins provided', () => {
      const template = FederationRuntimePlugin.getTemplate(
        compiler as Compiler,
        mockOptions,
        'bundler-runtime.js',
        {},
      );

      // 验证生成的模板中不包含插件调用相关代码
      expect(template).not.toContain('pluginsToAdd = [');
      expect(template).not.toContain('plugin_0');
    });

    it('should create empty runtimePluginCalls array when runtimePlugins is empty', () => {
      const optionsWithEmptyPlugins = {
        ...mockOptions,
        runtimePlugins: [],
      };

      const template = FederationRuntimePlugin.getTemplate(
        compiler as Compiler,
        optionsWithEmptyPlugins,
        'bundler-runtime.js',
        {},
      );

      // 验证生成的模板中不包含插件调用相关代码
      expect(template).not.toContain('pluginsToAdd = [');
      expect(template).not.toContain('plugin_0');
    });

    it('should handle absolute paths in runtimePlugins', () => {
      const optionsWithAbsolutePlugins = {
        ...mockOptions,
        runtimePlugins: ['/absolute/path/plugin1.js'],
      };

      const template = FederationRuntimePlugin.getTemplate(
        compiler as Compiler,
        optionsWithAbsolutePlugins,
        'bundler-runtime.js',
        {},
      );

      // 验证生成的模板中包含正确路径的插件
      expect(template).toContain("from '/absolute/path/plugin1.js'");
    });

    it('should handle relative paths in runtimePlugins', () => {
      const optionsWithRelativePlugins = {
        ...mockOptions,
        runtimePlugins: ['relative/path/plugin1.js'],
      };

      const template = FederationRuntimePlugin.getTemplate(
        compiler as Compiler,
        optionsWithRelativePlugins,
        'bundler-runtime.js',
        {},
      );

      // 验证生成的模板中包含正确路径的插件
      expect(template).toContain(
        "from '/current/working/dir/relative/path/plugin1.js'",
      );
    });

    it('should filter out false plugins in runtimePluginCalls', () => {
      const optionsWithFalsyPlugins = {
        ...mockOptions,
        runtimePlugins: ['plugin1.js', null as any, 'plugin2.js'],
      };

      const template = FederationRuntimePlugin.getTemplate(
        compiler as Compiler,
        optionsWithFalsyPlugins,
        'bundler-runtime.js',
        {},
      );

      // 验证生成的模板中包含filter(Boolean)调用
      expect(template).toContain('].filter(Boolean)');
    });

    it('should handle runtimePluginCalls with default export syntax', () => {
      const optionsWithPlugins = {
        ...mockOptions,
        runtimePlugins: ['plugin1.js'],
      };

      const template = FederationRuntimePlugin.getTemplate(
        compiler as Compiler,
        optionsWithPlugins,
        'bundler-runtime.js',
        {},
      );

      // 验证生成的模板中包含正确的插件调用语法
      expect(template).toContain('plugin_0 ? (plugin_0.default || plugin_0)');
    });
  });

  describe('runtime bootstrap guards', () => {
    it('rehydrates bundler runtime when runtime exists but bundlerRuntime is missing', () => {
      const template = FederationRuntimePlugin.getTemplate(
        compiler as Compiler,
        mockOptions,
        'bundler-runtime.js',
        {},
      );

      expect(template).toContain(
        'if(!__webpack_require__.federation.runtime || !__webpack_require__.federation.bundlerRuntime)',
      );
    });
  });

  describe('runtime module resolution compatibility', () => {
    const mockLegacyFallbackResolution = () => {
      const implementationPath = '/legacy/runtime-tools';
      const legacyRuntimePath = '/legacy/runtime/dist/index.esm.js';
      const originalResolve = require.resolve.bind(require);
      const resolveMock = rs.spyOn(require, 'resolve').mockImplementation(((
        request: string,
        options?: NodeJS.RequireResolveOptions,
      ) => {
        if (request === '@module-federation/runtime/dist/index.esm.js') {
          return legacyRuntimePath;
        }

        if (
          request === '@module-federation/runtime/dist/index.js' ||
          request === '@module-federation/runtime/dist/index.cjs' ||
          request === '@module-federation/runtime'
        ) {
          const error = new Error(`Cannot find module '${request}'`);
          (error as NodeJS.ErrnoException).code = 'MODULE_NOT_FOUND';
          throw error;
        }

        return originalResolve(
          request,
          options as NodeJS.RequireResolveOptions,
        );
      }) as typeof require.resolve);

      return { implementationPath, legacyRuntimePath, resolveMock };
    };

    it('prefers cjs runtime entry for non-module compiler output', () => {
      const { implementationPath, legacyRuntimePath, resolveMock } =
        mockLegacyFallbackResolution();

      try {
        const plugin = new FederationRuntimePlugin({
          implementation: implementationPath,
        } as any);
        const runtimePath = plugin.getRuntimeAlias({
          options: { resolve: { alias: {} }, output: {} },
        } as unknown as Compiler);

        expect(runtimePath).toBe(legacyRuntimePath);
        expect(
          resolveMock.mock.calls
            .map(([request]) => request)
            .filter((request) =>
              /^@module-federation\/runtime(?:\/|$)/.test(request),
            ),
        ).toEqual([
          '@module-federation/runtime/dist/index.cjs',
          '@module-federation/runtime/dist/index.js',
          '@module-federation/runtime',
          '@module-federation/runtime/dist/index.cjs.cjs',
          '@module-federation/runtime/dist/index.esm.js',
        ]);
      } finally {
        resolveMock.mockRestore();
      }
    });

    it('prefers esm runtime entry for module compiler output', () => {
      const { implementationPath, legacyRuntimePath, resolveMock } =
        mockLegacyFallbackResolution();

      try {
        const plugin = new FederationRuntimePlugin({
          implementation: implementationPath,
        } as any);
        const runtimePath = plugin.getRuntimeAlias({
          options: {
            resolve: { alias: {} },
            output: { module: true },
          },
        } as unknown as Compiler);

        expect(runtimePath).toBe(legacyRuntimePath);
        expect(
          resolveMock.mock.calls
            .map(([request]) => request)
            .filter((request) =>
              /^@module-federation\/runtime(?:\/|$)/.test(request),
            ),
        ).toEqual([
          '@module-federation/runtime/dist/index.js',
          '@module-federation/runtime/dist/index.cjs',
          '@module-federation/runtime',
          '@module-federation/runtime/dist/index.esm.js',
        ]);
      } finally {
        resolveMock.mockRestore();
      }
    });
  });
});
