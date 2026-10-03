import FederationRuntimePlugin, {
  resolveRuntimePaths,
} from '../../../src/lib/container/runtime/FederationRuntimePlugin';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Compiler } from 'webpack';
import { rs } from '@rstest/core';

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

  describe('runtime module resolution', () => {
    const normalizePath = (filePath: string) => filePath.replace(/\\/g, '/');

    it('resolves the default runtime family to bundler entries', () => {
      const paths = resolveRuntimePaths();

      expect(normalizePath(paths.runtimePath)).toMatch(
        /\/runtime\/dist\/bundler\.js$/,
      );
      expect(normalizePath(paths.runtimeToolsPath)).toMatch(
        /\/runtime-tools\/dist\/bundler\.js$/,
      );
    });

    it('resolves runtime members from the runtime-tools install', () => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-runtime-tools-'));
      const writePackage = (dir: string, name: string) => {
        fs.mkdirSync(path.join(dir, 'dist'), { recursive: true });
        fs.writeFileSync(
          path.join(dir, 'package.json'),
          JSON.stringify({
            name,
            exports: { './bundler': './dist/bundler.js' },
          }),
        );
        fs.writeFileSync(path.join(dir, 'dist/bundler.js'), '');
      };
      const tools = path.join(
        root,
        'node_modules/@module-federation/runtime-tools',
      );
      writePackage(tools, '@module-federation/runtime-tools');
      for (const name of ['runtime', 'webpack-bundler-runtime']) {
        writePackage(
          path.join(tools, 'node_modules/@module-federation', name),
          `@module-federation/${name}`,
        );
      }
      try {
        const paths = resolveRuntimePaths(path.join(tools, 'dist/bundler.js'));
        expect(normalizePath(paths.runtimePath)).toBe(
          normalizePath(
            fs.realpathSync(
              path.join(
                tools,
                'node_modules/@module-federation/runtime/dist/bundler.js',
              ),
            ),
          ),
        );
        expect(normalizePath(paths.bundlerRuntimePath)).toContain(
          '/runtime-tools/node_modules/@module-federation/webpack-bundler-runtime/',
        );
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    });

    it('does not replace a missing custom family member from the workspace install', () => {
      const plugin = new FederationRuntimePlugin({
        implementation: '/legacy/runtime-tools',
      } as any);

      expect(() =>
        plugin.prepareRuntime({
          options: { target: 'web', resolve: { alias: {} }, output: {} },
        } as unknown as Compiler),
      ).toThrow(
        /No package\.json found|missing-anchor|ENOENT|Could not resolve/,
      );
    });

    it('keeps a preset runtime alias and aliases runtime-tools to the bundler entry', () => {
      const plugin = new FederationRuntimePlugin({} as any);
      const compiler = {
        options: {
          resolve: {
            alias: { '@module-federation/runtime$': '/custom/runtime' },
          },
          output: {},
        },
      } as unknown as Compiler;

      plugin.setRuntimeAlias(compiler);

      const alias = (compiler.options.resolve as any).alias;
      expect(alias['@module-federation/runtime$']).toBe('/custom/runtime');
      expect(normalizePath(alias['@module-federation/runtime-tools$'])).toMatch(
        /\/runtime-tools\/dist\/bundler\.js$/,
      );
    });
  });
});
