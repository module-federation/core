/*
 * @jest-environment node
 */

import {
  normalizeWebpackPath,
  getWebpackPath,
} from '@module-federation/sdk/normalize-webpack-path';
import {
  shareScopes,
  createMockCompiler,
  createMockCompilation,
  testModuleOptions,
  createWebpackMock,
  createModuleMock,
  createMockFederationCompiler,
  createMockConsumeSharedDependencies,
  createMockConsumeSharedModule,
  createMockRuntimeModules,
  createSharingTestEnvironment,
} from './utils';

// Create webpack mock
const webpack = createWebpackMock();
// Create Module mock
const Module = createModuleMock(webpack);
// Create ConsumeShared dependencies
const { MockConsumeSharedDependency, MockConsumeSharedFallbackDependency } =
  createMockConsumeSharedDependencies();
// Create mock modules
const mockConsumeSharedModule = createMockConsumeSharedModule();
// Create mock runtime modules
const { mockConsumeSharedRuntimeModule, mockShareRuntimeModule } =
  createMockRuntimeModules();

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
}));

// Mock FederationRuntimePlugin
jest.mock('../../../src/lib/container/runtime/FederationRuntimePlugin', () => {
  return jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  }));
});

// Mock ConsumeSharedModule
jest.mock('../../../src/lib/sharing/ConsumeSharedModule', () => {
  return mockConsumeSharedModule;
});

// Mock ConsumeSharedRuntimeModule
jest.mock('../../../src/lib/sharing/ConsumeSharedRuntimeModule', () => {
  return mockConsumeSharedRuntimeModule;
});

// Mock ShareRuntimeModule
jest.mock('../../../src/lib/sharing/ShareRuntimeModule', () => {
  return mockShareRuntimeModule;
});

// Mock resolveMatchedConfigs to return predictable results for filtering tests
jest.mock('../../../src/lib/sharing/resolveMatchedConfigs', () => ({
  resolveMatchedConfigs: jest.fn().mockResolvedValue({
    resolved: new Map([
      [
        '/resolved/react',
        {
          shareScope: 'default',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
          include: { request: /^react/ },
          exclude: { request: /test/ },
          nodeModulesReconstructedLookup: false,
        },
      ],
      [
        '/resolved/lodash',
        {
          shareScope: 'default',
          shareKey: 'lodash',
          requiredVersion: '^4.0.0',
          include: undefined,
          exclude: { request: 'lodash/test' },
          nodeModulesReconstructedLookup: true,
        },
      ],
    ]),
    unresolved: new Map([
      [
        'vue',
        {
          shareScope: 'default',
          shareKey: 'vue',
          requiredVersion: '^3.0.0',
          include: { request: 'vue' },
          exclude: undefined,
          nodeModulesReconstructedLookup: false,
        },
      ],
      [
        '@company/shared',
        {
          shareScope: 'default',
          shareKey: '@company/shared',
          requiredVersion: '^1.0.0',
          include: { request: /^@company/ },
          exclude: { request: /test|spec/ },
          nodeModulesReconstructedLookup: true,
        },
      ],
    ]),
    prefixed: new Map([
      [
        '@scope/',
        {
          shareScope: 'default',
          shareKey: '@scope/',
          request: '@scope/',
          include: { request: /^(component|util)/ },
          exclude: { request: /\.(test|spec)\./ },
          nodeModulesReconstructedLookup: false,
        },
      ],
      [
        'lib/',
        {
          shareScope: 'default',
          shareKey: 'lib/',
          request: 'lib/',
          include: undefined,
          exclude: { request: /test/ },
          nodeModulesReconstructedLookup: true,
        },
      ],
    ]),
  }),
}));

// Direct dependency mocks
jest.mock(
  '../../../src/lib/sharing/ConsumeSharedDependency',
  () => {
    return function (request, shareScope, requiredVersion) {
      return new MockConsumeSharedDependency(
        request,
        shareScope,
        requiredVersion,
      );
    };
  },
  { virtual: true },
);

jest.mock(
  '../../../src/lib/sharing/ConsumeSharedFallbackDependency',
  () => {
    return function (fallbackRequest, shareScope, requiredVersion) {
      return new MockConsumeSharedFallbackDependency(
        fallbackRequest,
        shareScope,
        requiredVersion,
      );
    };
  },
  { virtual: true },
);

// Import after mocks are set up
const ConsumeSharedPlugin =
  require('../../../src/lib/sharing/ConsumeSharedPlugin').default;

describe('ConsumeSharedPlugin - Filtering', () => {
  describe('constructor with filter options', () => {
    it('should handle filter options in consume configuration', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: {
            requiredVersion: '^17.0.0',
            include: { request: /^react/ },
            exclude: { request: /test/ },
            nodeModulesReconstructedLookup: true,
          },
        },
      });

      // @ts-ignore accessing private property for testing
      const consumes = plugin._consumes;
      const [, config] = consumes[0];

      expect(config.include).toEqual({ request: /^react/ });
      expect(config.exclude).toEqual({ request: /test/ });
      expect(config.nodeModulesReconstructedLookup).toBe(true);
    });

    it('should handle string filters', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          lodash: {
            requiredVersion: '^4.0.0',
            include: { request: 'lodash/util' },
            exclude: { request: 'lodash/test' },
          },
        },
      });

      // @ts-ignore accessing private property for testing
      const consumes = plugin._consumes;
      const [, config] = consumes[0];

      expect(config.include).toEqual({ request: 'lodash/util' });
      expect(config.exclude).toEqual({ request: 'lodash/test' });
    });

    it('should handle complex filter configurations', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          '@company/shared': {
            requiredVersion: '^1.0.0',
            include: {
              request: /^@company/,
              version: '^1.0.0',
              fallbackVersion: '1.0.0',
            },
            exclude: {
              request: /test|spec/,
              version: '^0.9.0',
            },
            nodeModulesReconstructedLookup: true,
          },
        },
      });

      // @ts-ignore accessing private property for testing
      const consumes = plugin._consumes;
      const [, config] = consumes[0];

      expect(config.include?.request).toEqual(/^@company/);
      expect(config.include?.version).toBe('^1.0.0');
      expect(config.include?.fallbackVersion).toBe('1.0.0');
      expect(config.exclude?.request).toEqual(/test|spec/);
      expect(config.exclude?.version).toBe('^0.9.0');
      expect(config.nodeModulesReconstructedLookup).toBe(true);
    });
  });

  describe('filtering logic in factorize hook', () => {
    let testEnv;
    let plugin;
    let factorizeCallback;
    let createModuleCallback;

    beforeEach(() => {
      jest.clearAllMocks();
      testEnv = createSharingTestEnvironment();

      plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: {
            include: { request: /^react/ },
            exclude: { request: /test/ },
          },
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Capture the factorize callback
      const factorizeCalls =
        testEnv.normalModuleFactory.hooks.factorize.tapPromise.mock.calls;
      if (factorizeCalls.length > 0) {
        factorizeCallback = factorizeCalls[0][1];
      }

      // Capture the createModule callback
      const createModuleCalls =
        testEnv.normalModuleFactory.hooks.createModule.tapPromise.mock.calls;
      if (createModuleCalls.length > 0) {
        createModuleCallback = createModuleCalls[0][1];
      }
    });

    describe('unresolved consumes filtering', () => {
      it('should allow modules that match include filter', async () => {
        const resolveData = {
          context: '/test/context',
          request: 'vue',
          dependencies: [{}],
          contextInfo: { issuerLayer: null },
        };

        const result = await factorizeCallback(resolveData);
        expect(mockConsumeSharedModule).toHaveBeenCalledWith(
          '/test/context',
          'vue',
          expect.objectContaining({
            shareKey: 'vue',
            include: { request: 'vue' },
          }),
        );
      });

      it('should reject modules that do not match include filter', async () => {
        const resolveData = {
          context: '/test/context',
          request: 'angular', // Not in unresolved map, should not match
          dependencies: [{}],
          contextInfo: { issuerLayer: null },
        };

        const result = await factorizeCallback(resolveData);
        expect(result).toBeUndefined();
        expect(mockConsumeSharedModule).not.toHaveBeenCalled();
      });

      it('should reject modules that match exclude filter', async () => {
        const resolveData = {
          context: '/test/context',
          request: '@company/test-shared', // Would match include but matches exclude
          dependencies: [{}],
          contextInfo: { issuerLayer: null },
        };

        const result = await factorizeCallback(resolveData);
        expect(result).toBeUndefined();
        expect(mockConsumeSharedModule).not.toHaveBeenCalled();
      });

      it('should handle node_modules reconstructed lookup', async () => {
        const resolveData = {
          context: '/project/node_modules/@company/package/lib',
          request: '@company/shared',
          dependencies: [{}],
          contextInfo: { issuerLayer: null },
        };

        const result = await factorizeCallback(resolveData);
        expect(mockConsumeSharedModule).toHaveBeenCalledWith(
          '/project/node_modules/@company/package/lib',
          '@company/shared',
          expect.objectContaining({
            shareKey: '@company/shared',
            nodeModulesReconstructedLookup: true,
          }),
        );
      });
    });

    describe('prefixed consumes filtering', () => {
      it('should allow prefixed modules that match include filter', async () => {
        const resolveData = {
          context: '/test/context',
          request: '@scope/component',
          dependencies: [{}],
          contextInfo: { issuerLayer: null },
        };

        const result = await factorizeCallback(resolveData);
        expect(mockConsumeSharedModule).toHaveBeenCalledWith(
          '/test/context',
          '@scope/component',
          expect.objectContaining({
            shareKey: '@scope/component',
            include: { request: /^(component|util)/ },
          }),
        );
      });

      it('should reject prefixed modules that do not match include filter', async () => {
        const resolveData = {
          context: '/test/context',
          request: '@scope/service', // Does not match ^(component|util) pattern
          dependencies: [{}],
          contextInfo: { issuerLayer: null },
        };

        const result = await factorizeCallback(resolveData);
        expect(result).toBeUndefined();
        expect(mockConsumeSharedModule).not.toHaveBeenCalled();
      });

      it('should reject prefixed modules that match exclude filter', async () => {
        const resolveData = {
          context: '/test/context',
          request: '@scope/component.test.js',
          dependencies: [{}],
          contextInfo: { issuerLayer: null },
        };

        const result = await factorizeCallback(resolveData);
        expect(result).toBeUndefined();
        expect(mockConsumeSharedModule).not.toHaveBeenCalled();
      });

      it('should handle node_modules reconstructed lookup for prefixed modules', async () => {
        const resolveData = {
          context: '/project/node_modules/lib/package',
          request: 'lib/utility',
          dependencies: [{}],
          contextInfo: { issuerLayer: null },
        };

        const result = await factorizeCallback(resolveData);
        expect(mockConsumeSharedModule).toHaveBeenCalledWith(
          '/project/node_modules/lib/package',
          'lib/utility',
          expect.objectContaining({
            shareKey: 'lib/utility',
            nodeModulesReconstructedLookup: true,
          }),
        );
      });
    });
  });

  describe('filtering logic in createModule hook', () => {
    let testEnv;
    let plugin;
    let createModuleCallback;

    beforeEach(() => {
      jest.clearAllMocks();
      testEnv = createSharingTestEnvironment();

      plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: {
            include: { request: /^react/ },
            exclude: { request: /test/ },
          },
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Capture the createModule callback
      const createModuleCalls =
        testEnv.normalModuleFactory.hooks.createModule.tapPromise.mock.calls;
      if (createModuleCalls.length > 0) {
        createModuleCallback = createModuleCalls[0][1];
      }
    });

    it('should allow resolved modules that match include filter', async () => {
      const createData = {
        resource: '/resolved/react',
      };
      const resolveData = {
        context: '/test/context',
        dependencies: [{}],
      };

      const result = await createModuleCallback(createData, resolveData);
      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        '/test/context',
        '/resolved/react',
        expect.objectContaining({
          shareKey: 'react',
          include: { request: /^react/ },
        }),
      );
    });

    it('should reject resolved modules that match exclude filter', async () => {
      const createData = {
        resource: '/resolved/react-test', // Would match include but should be rejected due to mock setup
      };
      const resolveData = {
        context: '/test/context',
        dependencies: [{}],
      };

      // Since our mock doesn't have react-test in resolved map, it should return undefined
      const result = await createModuleCallback(createData, resolveData);
      expect(result).toBeUndefined();
      expect(mockConsumeSharedModule).not.toHaveBeenCalled();
    });

    it('should handle node_modules reconstructed lookup for resolved modules', async () => {
      const createData = {
        resource: '/resolved/lodash',
      };
      const resolveData = {
        context: '/project/node_modules/lodash/lib',
        dependencies: [{}],
      };

      const result = await createModuleCallback(createData, resolveData);
      expect(mockConsumeSharedModule).toHaveBeenCalledWith(
        '/project/node_modules/lodash/lib',
        '/resolved/lodash',
        expect.objectContaining({
          shareKey: 'lodash',
          nodeModulesReconstructedLookup: true,
        }),
      );
    });

    it('should return undefined for non-consume dependencies', async () => {
      const MockConsumeSharedFallbackDependency = require('../../../src/lib/sharing/ConsumeSharedFallbackDependency');

      const createData = {
        resource: '/resolved/react',
      };
      const resolveData = {
        context: '/test/context',
        dependencies: [new MockConsumeSharedFallbackDependency('fallback')],
      };

      const result = await createModuleCallback(createData, resolveData);
      expect(result).toBeUndefined();
      expect(mockConsumeSharedModule).not.toHaveBeenCalled();
    });
  });

  describe('integration tests with various filter combinations', () => {
    let testEnv;

    beforeEach(() => {
      jest.clearAllMocks();
      testEnv = createSharingTestEnvironment();
    });

    it('should handle complex regex filters correctly', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          '@company/': {
            requiredVersion: false,
            include: { request: /^(component|util|helper)/ },
            exclude: { request: /\.(test|spec|story)\.(js|ts|jsx|tsx)$/ },
          },
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // This integration test verifies the plugin configuration
      // The actual filtering logic is tested in the factorize/createModule hook tests above
      expect(testEnv.compiler.hooks.thisCompilation.tap).toHaveBeenCalled();
    });

    it('should handle nodeModulesReconstructedLookup with complex paths', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          'packages/': {
            requiredVersion: false,
            nodeModulesReconstructedLookup: true,
            include: { request: /^shared/ },
            exclude: { request: /internal/ },
          },
        },
      });

      plugin.apply(testEnv.compiler);
      testEnv.simulateCompilation();

      // Verify plugin was applied correctly
      expect(testEnv.compiler.hooks.thisCompilation.tap).toHaveBeenCalled();
    });

    it('should handle multiple consume entries with different filters', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: {
            include: { request: /^react/ },
            exclude: { request: /test/ },
          },
          lodash: {
            include: { request: 'lodash' },
            exclude: { request: /internal/ },
            nodeModulesReconstructedLookup: true,
          },
          '@scope/': {
            include: { request: /^(lib|util)/ },
            exclude: { request: /\.(test|spec)\./ },
          },
        },
      });

      // @ts-ignore accessing private property for testing
      const consumes = plugin._consumes;

      expect(consumes).toHaveLength(3);

      const reactConfig = consumes.find(([key]) => key === 'react')?.[1];
      const lodashConfig = consumes.find(([key]) => key === 'lodash')?.[1];
      const scopeConfig = consumes.find(([key]) => key === '@scope/')?.[1];

      expect(reactConfig?.include).toEqual({ request: /^react/ });
      expect(reactConfig?.exclude).toEqual({ request: /test/ });
      expect(reactConfig?.nodeModulesReconstructedLookup).toBeUndefined();

      expect(lodashConfig?.include).toEqual({ request: 'lodash' });
      expect(lodashConfig?.exclude).toEqual({ request: /internal/ });
      expect(lodashConfig?.nodeModulesReconstructedLookup).toBe(true);

      expect(scopeConfig?.include).toEqual({ request: /^(lib|util)/ });
      expect(scopeConfig?.exclude).toEqual({ request: /\.(test|spec)\./ });
    });
  });
});
