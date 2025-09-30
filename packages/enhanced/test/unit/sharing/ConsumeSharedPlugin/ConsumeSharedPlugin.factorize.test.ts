/*
 * @jest-environment node
 */

import ConsumeSharedPlugin from '../../../../src/lib/sharing/ConsumeSharedPlugin';
import ConsumeSharedModule from '../../../../src/lib/sharing/ConsumeSharedModule';
import { resolveMatchedConfigs } from '../../../../src/lib/sharing/resolveMatchedConfigs';
import ConsumeSharedFallbackDependency from '../../../../src/lib/sharing/ConsumeSharedFallbackDependency';
import ProvideForSharedDependency from '../../../../src/lib/sharing/ProvideForSharedDependency';

// Define ResolveData type inline since it's not exported
interface ResolveData {
  context: string;
  request: string;
  contextInfo: { issuerLayer?: string };
  dependencies: any[];
  resolveOptions: any;
  fileDependencies: { addAll: Function };
  missingDependencies: { addAll: Function };
  contextDependencies: { addAll: Function };
  createData: any;
  cacheable: boolean;
}

// Mock resolveMatchedConfigs to control test data
jest.mock('../../../../src/lib/sharing/resolveMatchedConfigs');

// Mock ConsumeSharedModule
jest.mock('../../../../src/lib/sharing/ConsumeSharedModule');

// Mock FederationRuntimePlugin
jest.mock(
  '../../../../src/lib/container/runtime/FederationRuntimePlugin',
  () => {
    return jest.fn().mockImplementation(() => ({
      apply: jest.fn(),
    }));
  },
);

describe('ConsumeSharedPlugin - factorize hook logic', () => {
  let plugin: ConsumeSharedPlugin;
  let factorizeCallback: Function;
  let mockCompilation: any;
  let mockResolvedConsumes: Map<string, any>;
  let mockUnresolvedConsumes: Map<string, any>;
  let mockPrefixedConsumes: Map<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup test consume maps
    mockResolvedConsumes = new Map();
    mockUnresolvedConsumes = new Map([
      [
        'react',
        {
          shareKey: 'react',
          shareScope: 'default',
          requiredVersion: '^17.0.0',
          singleton: false,
          eager: false,
        },
      ],
      [
        'lodash',
        {
          shareKey: 'lodash',
          shareScope: 'default',
          requiredVersion: '^4.0.0',
          singleton: true,
          eager: false,
        },
      ],
      [
        '(layer)layered-module',
        {
          shareKey: 'layered-module',
          shareScope: 'default',
          requiredVersion: '^1.0.0',
          issuerLayer: 'layer',
          singleton: false,
          eager: false,
        },
      ],
    ]);
    mockPrefixedConsumes = new Map([
      [
        'lodash/',
        {
          shareKey: 'lodash/', // Prefix shares should have shareKey ending with /
          shareScope: 'default',
          requiredVersion: '^4.0.0',
          request: 'lodash/',
          singleton: false,
          eager: false,
        },
      ],
    ]);

    // Mock resolveMatchedConfigs to return our test data
    (resolveMatchedConfigs as jest.Mock).mockResolvedValue({
      resolved: mockResolvedConsumes,
      unresolved: mockUnresolvedConsumes,
      prefixed: mockPrefixedConsumes,
    });

    // Create plugin instance
    plugin = new ConsumeSharedPlugin({
      shareScope: 'default',
      consumes: {
        react: '^17.0.0',
        lodash: '^4.0.0',
        'lodash/': {
          shareKey: 'lodash',
          requiredVersion: '^4.0.0',
        },
      },
    });

    // Mock compilation with required hooks
    mockCompilation = {
      compiler: { context: '/test-project' },
      dependencyFactories: new Map(),
      hooks: {
        additionalTreeRuntimeRequirements: {
          tap: jest.fn(),
        },
        // Provide the finishModules hook expected by the plugin during apply()
        finishModules: {
          tapAsync: jest.fn(),
        },
      },
      resolverFactory: {
        get: jest.fn(() => ({
          resolve: jest.fn(),
        })),
      },
      inputFileSystem: {},
      contextDependencies: { addAll: jest.fn() },
      fileDependencies: { addAll: jest.fn() },
      missingDependencies: { addAll: jest.fn() },
      warnings: [],
      errors: [],
    };

    // Mock ConsumeSharedModule constructor to track calls
    (ConsumeSharedModule as jest.Mock).mockImplementation((config) => ({
      isConsumeSharedModule: true,
      ...config,
    }));
  });

  describe('Direct module matching', () => {
    beforeEach(() => {
      // Capture the factorize hook callback
      const mockNormalModuleFactory = {
        hooks: {
          factorize: {
            tapPromise: jest.fn((name, callback) => {
              factorizeCallback = callback;
            }),
          },
          createModule: {
            tapPromise: jest.fn(),
          },
          afterResolve: {
            tapPromise: jest.fn(),
          },
        },
      };

      // Apply plugin to capture hooks
      const mockCompiler = {
        hooks: {
          thisCompilation: {
            tap: jest.fn((name, callback) => {
              callback(mockCompilation, {
                normalModuleFactory: mockNormalModuleFactory,
              });
            }),
          },
        },
        context: '/test-project',
      };

      plugin.apply(mockCompiler as any);
    });

    it('should match and consume shared module for direct request', async () => {
      const resolveData: ResolveData = {
        context: '/test-project/src',
        request: 'react',
        contextInfo: { issuerLayer: undefined },
        dependencies: [],
        resolveOptions: {},
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        contextDependencies: { addAll: jest.fn() },
        createData: {},
        cacheable: true,
      };

      // Bind createConsumeSharedModule to plugin instance
      plugin.createConsumeSharedModule = jest.fn().mockResolvedValue({
        isConsumeSharedModule: true,
        shareKey: 'react',
      });

      const result = await factorizeCallback(resolveData);

      expect(plugin.createConsumeSharedModule).toHaveBeenCalledWith(
        mockCompilation,
        '/test-project/src',
        'react',
        expect.objectContaining({
          shareKey: 'react',
          requiredVersion: '^17.0.0',
        }),
      );
      expect(result).toEqual({
        isConsumeSharedModule: true,
        shareKey: 'react',
      });
    });

    it('should not match module not in consumes', async () => {
      const resolveData: ResolveData = {
        context: '/test-project/src',
        request: 'vue',
        contextInfo: { issuerLayer: undefined },
        dependencies: [],
        resolveOptions: {},
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        contextDependencies: { addAll: jest.fn() },
        createData: {},
        cacheable: true,
      };

      plugin.createConsumeSharedModule = jest.fn();

      const result = await factorizeCallback(resolveData);

      expect(plugin.createConsumeSharedModule).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('Layer-based matching', () => {
    beforeEach(() => {
      const mockNormalModuleFactory = {
        hooks: {
          factorize: {
            tapPromise: jest.fn((name, callback) => {
              factorizeCallback = callback;
            }),
          },
          createModule: {
            tapPromise: jest.fn(),
          },
          afterResolve: {
            tapPromise: jest.fn(),
          },
        },
      };

      const mockCompiler = {
        hooks: {
          thisCompilation: {
            tap: jest.fn((name, callback) => {
              callback(mockCompilation, {
                normalModuleFactory: mockNormalModuleFactory,
              });
            }),
          },
        },
        context: '/test-project',
      };

      plugin.apply(mockCompiler as any);
    });

    it('should match module with correct issuerLayer', async () => {
      const resolveData: ResolveData = {
        context: '/test-project/src',
        request: 'layered-module',
        contextInfo: { issuerLayer: 'layer' },
        dependencies: [],
        resolveOptions: {},
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        contextDependencies: { addAll: jest.fn() },
        createData: {},
        cacheable: true,
      };

      plugin.createConsumeSharedModule = jest.fn().mockResolvedValue({
        isConsumeSharedModule: true,
        shareKey: 'layered-module',
      });

      const result = await factorizeCallback(resolveData);

      expect(plugin.createConsumeSharedModule).toHaveBeenCalledWith(
        mockCompilation,
        '/test-project/src',
        'layered-module',
        expect.objectContaining({
          shareKey: 'layered-module',
          issuerLayer: 'layer',
        }),
      );
      expect(result).toBeDefined();
    });

    it('should not match module with incorrect issuerLayer', async () => {
      const resolveData: ResolveData = {
        context: '/test-project/src',
        request: 'layered-module',
        contextInfo: { issuerLayer: 'different-layer' },
        dependencies: [],
        resolveOptions: {},
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        contextDependencies: { addAll: jest.fn() },
        createData: {},
        cacheable: true,
      };

      plugin.createConsumeSharedModule = jest.fn();

      const result = await factorizeCallback(resolveData);

      expect(plugin.createConsumeSharedModule).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('Prefix matching', () => {
    beforeEach(() => {
      const mockNormalModuleFactory = {
        hooks: {
          factorize: {
            tapPromise: jest.fn((name, callback) => {
              factorizeCallback = callback;
            }),
          },
          createModule: {
            tapPromise: jest.fn(),
          },
          afterResolve: {
            tapPromise: jest.fn(),
          },
        },
      };

      const mockCompiler = {
        hooks: {
          thisCompilation: {
            tap: jest.fn((name, callback) => {
              callback(mockCompilation, {
                normalModuleFactory: mockNormalModuleFactory,
              });
            }),
          },
        },
        context: '/test-project',
      };

      plugin.apply(mockCompiler as any);
    });

    it('should match prefixed request', async () => {
      const resolveData: ResolveData = {
        context: '/test-project/src',
        request: 'lodash/debounce',
        contextInfo: { issuerLayer: undefined },
        dependencies: [],
        resolveOptions: {},
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        contextDependencies: { addAll: jest.fn() },
        createData: {},
        cacheable: true,
      };

      plugin.createConsumeSharedModule = jest.fn().mockResolvedValue({
        isConsumeSharedModule: true,
        shareKey: 'lodash/debounce',
      });

      const result = await factorizeCallback(resolveData);

      expect(plugin.createConsumeSharedModule).toHaveBeenCalledWith(
        mockCompilation,
        '/test-project/src',
        'lodash/debounce',
        expect.objectContaining({
          shareKey: 'lodash/debounce', // The slash SHOULD be preserved
          requiredVersion: '^4.0.0',
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('Relative path handling', () => {
    beforeEach(() => {
      // Add relative path to unresolved consumes
      mockUnresolvedConsumes.set('/test-project/src/components/shared', {
        shareKey: 'shared-component',
        shareScope: 'default',
        requiredVersion: false,
        singleton: false,
        eager: false,
      });

      const mockNormalModuleFactory = {
        hooks: {
          factorize: {
            tapPromise: jest.fn((name, callback) => {
              factorizeCallback = callback;
            }),
          },
          createModule: {
            tapPromise: jest.fn(),
          },
          afterResolve: {
            tapPromise: jest.fn(),
          },
        },
      };

      const mockCompiler = {
        hooks: {
          thisCompilation: {
            tap: jest.fn((name, callback) => {
              callback(mockCompilation, {
                normalModuleFactory: mockNormalModuleFactory,
              });
            }),
          },
        },
        context: '/test-project',
      };

      plugin.apply(mockCompiler as any);
    });

    it('should reconstruct and match relative path', async () => {
      const resolveData: ResolveData = {
        context: '/test-project/src',
        request: './components/shared',
        contextInfo: { issuerLayer: undefined },
        dependencies: [],
        resolveOptions: {},
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        contextDependencies: { addAll: jest.fn() },
        createData: {},
        cacheable: true,
      };

      plugin.createConsumeSharedModule = jest.fn().mockResolvedValue({
        isConsumeSharedModule: true,
        shareKey: 'shared-component',
      });

      const result = await factorizeCallback(resolveData);

      expect(plugin.createConsumeSharedModule).toHaveBeenCalledWith(
        mockCompilation,
        '/test-project/src',
        '/test-project/src/components/shared',
        expect.objectContaining({
          shareKey: 'shared-component',
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('Special dependencies handling', () => {
    beforeEach(() => {
      const mockNormalModuleFactory = {
        hooks: {
          factorize: {
            tapPromise: jest.fn((name, callback) => {
              factorizeCallback = callback;
            }),
          },
          createModule: {
            tapPromise: jest.fn(),
          },
          afterResolve: {
            tapPromise: jest.fn(),
          },
        },
      };

      const mockCompiler = {
        hooks: {
          thisCompilation: {
            tap: jest.fn((name, callback) => {
              callback(mockCompilation, {
                normalModuleFactory: mockNormalModuleFactory,
              });
            }),
          },
        },
        context: '/test-project',
      };

      plugin.apply(mockCompiler as any);
    });

    it('should skip ConsumeSharedFallbackDependency', async () => {
      const mockDependency = Object.create(
        ConsumeSharedFallbackDependency.prototype,
      );

      const resolveData: ResolveData = {
        context: '/test-project/src',
        request: 'react',
        contextInfo: { issuerLayer: undefined },
        dependencies: [mockDependency],
        resolveOptions: {},
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        contextDependencies: { addAll: jest.fn() },
        createData: {},
        cacheable: true,
      };

      plugin.createConsumeSharedModule = jest.fn();

      const result = await factorizeCallback(resolveData);

      expect(plugin.createConsumeSharedModule).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should skip ProvideForSharedDependency', async () => {
      const mockDependency = Object.create(
        ProvideForSharedDependency.prototype,
      );

      const resolveData: ResolveData = {
        context: '/test-project/src',
        request: 'react',
        contextInfo: { issuerLayer: undefined },
        dependencies: [mockDependency],
        resolveOptions: {},
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        contextDependencies: { addAll: jest.fn() },
        createData: {},
        cacheable: true,
      };

      plugin.createConsumeSharedModule = jest.fn();

      const result = await factorizeCallback(resolveData);

      expect(plugin.createConsumeSharedModule).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('Node modules path extraction', () => {
    beforeEach(() => {
      // Add node_modules path to unresolved consumes
      mockUnresolvedConsumes.set('lodash/index.js', {
        shareKey: 'lodash',
        shareScope: 'default',
        requiredVersion: '^4.0.0',
        singleton: false,
        eager: false,
        allowNodeModulesSuffixMatch: true,
      });

      const mockNormalModuleFactory = {
        hooks: {
          factorize: {
            tapPromise: jest.fn((name, callback) => {
              factorizeCallback = callback;
            }),
          },
          createModule: {
            tapPromise: jest.fn(),
          },
          afterResolve: {
            tapPromise: jest.fn(),
          },
        },
      };

      const mockCompiler = {
        hooks: {
          thisCompilation: {
            tap: jest.fn((name, callback) => {
              callback(mockCompilation, {
                normalModuleFactory: mockNormalModuleFactory,
              });
            }),
          },
        },
        context: '/test-project',
      };

      plugin.apply(mockCompiler as any);
    });

    it('should extract and match node_modules path', async () => {
      const resolveData: ResolveData = {
        context: '/test-project/node_modules/lodash',
        request: './index.js',
        contextInfo: { issuerLayer: undefined },
        dependencies: [],
        resolveOptions: {},
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        contextDependencies: { addAll: jest.fn() },
        createData: {},
        cacheable: true,
      };

      plugin.createConsumeSharedModule = jest.fn().mockResolvedValue({
        isConsumeSharedModule: true,
        shareKey: 'lodash',
      });

      const result = await factorizeCallback(resolveData);

      expect(plugin.createConsumeSharedModule).toHaveBeenCalledWith(
        mockCompilation,
        '/test-project/node_modules/lodash',
        'lodash/index.js',
        expect.objectContaining({
          shareKey: 'lodash',
          allowNodeModulesSuffixMatch: true,
        }),
      );
      expect(result).toBeDefined();
    });
  });
});
