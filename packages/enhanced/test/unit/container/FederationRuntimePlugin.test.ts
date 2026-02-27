import FederationRuntimePlugin from '../../../src/lib/container/runtime/FederationRuntimePlugin';
import type { Compiler } from 'webpack';
import { rs } from '@rstest/core';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

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

  describe('runtime bootstrap template and runtime path preference', () => {
    it('should preserve the previous federation bootstrap merge semantics', () => {
      const optionsWithPlugins = {
        ...mockOptions,
        runtimePlugins: ['plugin1.js'],
      };
      const template = FederationRuntimePlugin.getTemplate(
        compiler as Compiler,
        optionsWithPlugins,
        '/runtime/dist/index.cjs',
      );

      expect(template).toContain(
        'if(!__webpack_require__.federation.runtime || !__webpack_require__.federation.bundlerRuntime){',
      );
      expect(template).toContain(
        'var prevFederation = __webpack_require__.federation;',
      );
      expect(template).not.toContain(
        '__webpack_require__.federation.initOptions = __webpack_require__.federation.initOptions || {};',
      );
    });

    it('should fall back to index.js when index.esm.js does not exist', () => {
      const tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'mf-runtime-path-test-'),
      );
      const runtimeDir = path.join(tempDir, 'runtime', 'dist');
      fs.mkdirSync(runtimeDir, { recursive: true });
      const runtimeIndexPath = path.join(runtimeDir, 'index.js');
      fs.writeFileSync(runtimeIndexPath, 'module.exports = {};');

      try {
        const template = FederationRuntimePlugin.getTemplate(
          compiler as Compiler,
          mockOptions,
          path.join(runtimeDir, 'index.cjs'),
        );

        expect(template).toContain(
          `import federation from '${runtimeIndexPath.replace(/\\/g, '/')}';`,
        );
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});
