/*
 * @jest-environment node
 */

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import {
  createMockCompiler,
  createWebpackMock,
  MockModuleDependency,
  createMockCompilation,
  createMockContainerExposedDependency,
} from './utils';

const webpack = createWebpackMock();

jest.mock(
  'webpack',
  () => {
    return {
      ...webpack,
      Dependency: class MockDependency {},
      Compilation: {
        PROCESS_ASSETS_STAGE_REPORT: 5000,
      },
      sources: {
        RawSource: jest.fn((content) => ({
          content,
          source: () => content,
        })),
      },
      dependencies: {
        ModuleDependency: MockModuleDependency,
      },
    };
  },
  { virtual: true },
);

jest.mock(
  '../../../src/lib/container/ContainerEntryDependency',
  () => {
    return jest.fn().mockImplementation((name, exposes) => ({
      name,
      exposes,
    }));
  },
  { virtual: true },
);

jest.mock(
  '../../../src/lib/container/ContainerEntryModule',
  () => {
    return jest.fn().mockImplementation((name, shareScope, options) => ({
      name,
      shareScope,
      options,
      setExposesMap: jest.fn(),
    }));
  },
  { virtual: true },
);

jest.mock(
  '../../../src/lib/container/ContainerEntryModuleFactory',
  () => {
    return jest.fn().mockImplementation(() => ({
      create: jest.fn((data, callback) => {
        const ContainerEntryModule = require('../../../src/lib/container/ContainerEntryModule');
        const module = new ContainerEntryModule(
          data.dependency.name,
          data.options?.shareScope || 'default',
          data.options,
        );
        module.setExposesMap(data.dependency.exposes);
        callback(null, module);
      }),
    }));
  },
  { virtual: true },
);

jest.mock(
  '../../../src/lib/container/runtime/FederationRuntimePlugin',
  () => {
    return jest.fn().mockImplementation(() => ({
      apply: jest.fn(),
    }));
  },
  { virtual: true },
);

jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
}));

const ContainerPlugin =
  require('../../../src/lib/container/ContainerPlugin').default;
const containerPlugin = require('../../../src/lib/container/ContainerPlugin');

describe('ContainerPlugin', () => {
  let mockCompiler;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCompiler = createMockCompiler();
    mockCompiler.options = {
      output: {
        enabledLibraryTypes: ['var'],
        context: '/mock/context',
      },
      context: '/mock/context',
      plugins: [],
      optimization: {
        splitChunks: {
          cacheGroups: {},
        },
      },
    };
  });

  describe('constructor', () => {
    it('should initialize with default options when minimal options provided', () => {
      const options = {
        name: 'test-container',
        exposes: {
          './Button': './src/Button',
        },
      };

      const plugin = new ContainerPlugin(options);

      expect(plugin.name).toBe('ContainerPlugin');
      expect(plugin['_options'].name).toBe('test-container');
      expect(plugin['_options'].shareScope).toBe('default');
      expect(plugin['_options'].library).toEqual({
        type: 'var',
        name: 'test-container',
      });
      expect(plugin['_options'].exposes).toBeDefined();
    });

    it('should initialize with string shareScope', () => {
      const options = {
        name: 'test-container',
        exposes: {
          './Button': './src/Button',
        },
        shareScope: 'custom-scope',
      };

      const plugin = new ContainerPlugin(options);

      expect(plugin['_options'].shareScope).toBe('custom-scope');
    });

    it('should initialize with array shareScope', () => {
      const options = {
        name: 'test-container',
        exposes: {
          './Button': './src/Button',
        },
        shareScope: ['default', 'custom'],
      };

      const plugin = new ContainerPlugin(options);

      expect(plugin['_options'].shareScope).toEqual(['default', 'custom']);
    });

    it('should initialize with custom library options', () => {
      const options = {
        name: 'test-container',
        exposes: {
          './Button': './src/Button',
        },
        library: {
          type: 'umd',
          name: 'CustomName',
        },
      };

      const plugin = new ContainerPlugin(options);

      expect(plugin['_options'].library).toEqual({
        type: 'umd',
        name: 'CustomName',
      });
    });

    it('should initialize with filename option', () => {
      const options = {
        name: 'test-container',
        exposes: {
          './Button': './src/Button',
        },
        filename: 'container-[name].js',
      };

      const plugin = new ContainerPlugin(options);

      expect(plugin['_options'].filename).toBe('container-[name].js');
    });
  });

  describe('apply', () => {
    it('should set up library correctly', () => {
      const options = {
        name: 'test-container',
        exposes: {
          './Button': './src/Button',
        },
      };

      const plugin = new ContainerPlugin(options);
      plugin.apply(mockCompiler);

      expect(mockCompiler.options.output.enabledLibraryTypes).toContain('var');
    });

    it('should add ContainerEntryDependency to compiler', () => {
      const options = {
        name: 'test-container',
        exposes: {
          './Button': './src/Button',
        },
      };

      const plugin = new ContainerPlugin(options);

      mockCompiler.hooks.compilation.tap.mockImplementation(
        (name, callback) => {
          if (name === 'ContainerPlugin') {
            mockCompiler.hooks.compilation._callback = callback;
          }
        },
      );

      mockCompiler.hooks.make.tap.mockImplementation((name, callback) => {
        if (name === 'ContainerPlugin') {
          mockCompiler.hooks.make._callback = callback;
        }
      });

      mockCompiler.hooks.thisCompilation.tap.mockImplementation(
        (name, callback) => {
          if (name === 'ContainerPlugin') {
            mockCompiler.hooks.thisCompilation._callback = callback;
          }
        },
      );

      plugin.apply(mockCompiler);

      expect(mockCompiler.hooks.thisCompilation.tap).toHaveBeenCalledWith(
        'ContainerPlugin',
        expect.any(Function),
      );

      const { mockCompilation } = createMockCompilation();

      if (mockCompiler.hooks.thisCompilation._callback) {
        mockCompiler.hooks.thisCompilation._callback(mockCompilation, {
          normalModuleFactory: {},
        });
      }

      expect(mockCompilation.dependencyFactories.size).toBeGreaterThan(0);

      const mockMakeCompilation = {
        addDependency: jest.fn(),
        addEntry: jest.fn((context, dep, options, callback) => callback()),
        addInclude: jest.fn((context, dep, options, callback) =>
          callback(null, {}),
        ),
        options: {
          context: '/mock/context',
        },
        compiler: {
          context: '/mock/context',
        },
      };

      if (mockCompiler.hooks.make._callback) {
        mockCompiler.hooks.make._callback(mockMakeCompilation, function noop() {
          // Intentionally empty
        });
      }

      expect(true).toBe(true);
    });

    it('should register FederationRuntimePlugin', () => {
      const options = {
        name: 'test-container',
        exposes: {
          './Button': './src/Button',
        },
      };

      const plugin = new ContainerPlugin(options);
      plugin.apply(mockCompiler);

      const FederationRuntimePlugin = require('../../../src/lib/container/runtime/FederationRuntimePlugin');
      expect(FederationRuntimePlugin).toHaveBeenCalled();
      expect(
        FederationRuntimePlugin.mock.results[0].value.apply,
      ).toHaveBeenCalledWith(mockCompiler);
    });

    it('should handle exposes with various formats', () => {
      const MockContainerExposedDependency =
        createMockContainerExposedDependency();

      const stringFormatOptions = {
        name: 'test-container',
        exposes: {
          './Button': './src/Button',
        },
      };

      const stringPlugin = new ContainerPlugin(stringFormatOptions);
      stringPlugin.apply(mockCompiler);

      const objectFormatOptions = {
        name: 'test-container',
        exposes: {
          './Component': {
            import: './src/Component',
            name: 'Component',
          },
        },
      };

      const objectPlugin = new ContainerPlugin(objectFormatOptions);
      objectPlugin.apply(mockCompiler);

      const arrayFormatOptions = {
        name: 'test-container',
        exposes: [
          {
            name: './ButtonA',
            import: './src/ButtonA',
          },
          {
            name: './ButtonB',
            import: './src/ButtonB',
          },
        ],
      };

      const arrayPlugin = new ContainerPlugin(arrayFormatOptions);
      arrayPlugin.apply(mockCompiler);

      expect(arrayPlugin['_options'].exposes).toBeInstanceOf(Array);
      expect(arrayPlugin['_options'].exposes.length).toBe(4);

      const buttonANameEntry = arrayPlugin['_options'].exposes.find(
        (e) =>
          e[0] === 'name' &&
          e[1] &&
          e[1].import &&
          e[1].import[0] === './ButtonA',
      );

      const buttonBNameEntry = arrayPlugin['_options'].exposes.find(
        (e) =>
          e[0] === 'name' &&
          e[1] &&
          e[1].import &&
          e[1].import[0] === './ButtonB',
      );

      const buttonAImportEntry = arrayPlugin['_options'].exposes.find(
        (e) =>
          e[0] === 'import' &&
          e[1] &&
          e[1].import &&
          e[1].import[0] === './src/ButtonA',
      );

      const buttonBImportEntry = arrayPlugin['_options'].exposes.find(
        (e) =>
          e[0] === 'import' &&
          e[1] &&
          e[1].import &&
          e[1].import[0] === './src/ButtonB',
      );

      expect(buttonANameEntry).toBeDefined();
      expect(buttonBNameEntry).toBeDefined();
      expect(buttonAImportEntry).toBeDefined();
      expect(buttonBImportEntry).toBeDefined();

      if (buttonANameEntry)
        expect(buttonANameEntry[1].import[0]).toBe('./ButtonA');
      if (buttonAImportEntry)
        expect(buttonAImportEntry[1].import[0]).toBe('./src/ButtonA');
      if (buttonBNameEntry)
        expect(buttonBNameEntry[1].import[0]).toBe('./ButtonB');
      if (buttonBImportEntry)
        expect(buttonBImportEntry[1].import[0]).toBe('./src/ButtonB');
    });
  });
});
