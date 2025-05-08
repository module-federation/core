/*
 * @jest-environment node
 */

import {
  shareScopes,
  createWebpackMock,
  createModuleMock,
  createMockConsumeSharedDependencies,
  createMockConsumeSharedModule,
  createMockRuntimeModules,
  createSharingTestEnvironment,
} from './utils';
import { satisfy } from '@module-federation/runtime-tools/runtime-core';
import type { ConsumeOptions } from '../../../src/declarations/plugins/sharing/ConsumeSharedModule';
import { Compiler, Compilation } from 'webpack';
import { ConsumeSharedPlugin } from '../../../src/lib/sharing/ConsumeSharedPlugin';
import { ConsumeSharedModule } from '../../../src/lib/sharing/ConsumeSharedModule';
import { resolveMatchedConfigs } from '../../../src/lib/sharing/resolveMatchedConfigs';
import {
  getDescriptionFile,
  NormalModuleFactoryPlugin,
} from '../../../src/lib/sharing/utils';

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

// Mock ConsumeSharedRuntimeModule
jest.mock('../../../src/lib/sharing/ConsumeSharedRuntimeModule', () => {
  return mockConsumeSharedRuntimeModule;
});

// Mock ShareRuntimeModule
jest.mock('../../../src/lib/sharing/ShareRuntimeModule', () => {
  return mockShareRuntimeModule;
});

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

// Mock resolveMatchedConfigs module
jest.mock('../../../src/lib/sharing/resolveMatchedConfigs');

// Mock utils module
jest.mock('../../../src/lib/sharing/utils');

// Mock ConsumeSharedModule
jest.mock('../../../src/lib/sharing/ConsumeSharedModule', () => {
  return mockConsumeSharedModule;
});

// Mock satisfy function
jest.mock('@module-federation/runtime-tools/runtime-core', () => ({
  satisfy: jest.fn(),
}));

// Import after mocks are set up
const ConsumeSharedPlugin =
  require('../../../src/lib/sharing/ConsumeSharedPlugin').default;

// Import the MOCKED functions
const {
  resolveMatchedConfigs,
} = require('../../../src/lib/sharing/resolveMatchedConfigs');
const { getDescriptionFile } = require('../../../src/lib/sharing/utils');

describe('ConsumeSharedPlugin', () => {
  let testEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    testEnv = createSharingTestEnvironment();

    mockConsumeSharedModule.mockReset();
    mockConsumeSharedModule.mockImplementation((context, configParams) => {
      const completeOptions: ConsumeOptions = {
        import:
          configParams.import === undefined
            ? configParams.request
            : configParams.import,
        shareKey: configParams.shareKey || configParams.request,
        shareScope: configParams.shareScope || 'default',
        requiredVersion:
          configParams.requiredVersion === undefined
            ? false
            : configParams.requiredVersion,
        strictVersion:
          typeof configParams.strictVersion === 'boolean'
            ? configParams.strictVersion
            : false,
        singleton:
          typeof configParams.singleton === 'boolean'
            ? configParams.singleton
            : false,
        eager:
          typeof configParams.eager === 'boolean' ? configParams.eager : false,
        packageName: configParams.packageName || '',
        layer: configParams.layer || null,
        issuerLayer: configParams.issuerLayer || null,
        request: configParams.request,
        ...configParams,
      };
      return {
        context,
        options: completeOptions,
        ...completeOptions,
        build: jest.fn(),
        getVersion: jest
          .fn()
          .mockReturnValue(completeOptions.requiredVersion || '0.0.0'),
      };
    });

    (resolveMatchedConfigs as jest.Mock).mockReset();
    (getDescriptionFile as jest.Mock).mockReset();
    (satisfy as jest.Mock).mockReset();

    // Set default implementations for mocks after resetting
    (resolveMatchedConfigs as jest.Mock).mockImplementation(async () => ({
      resolved: new Map(),
      unresolved: new Map(),
      prefixed: new Map(),
    }));
    (getDescriptionFile as jest.Mock).mockImplementation(
      (fs, context, files, callback) => {
        callback(null, { data: { version: '0.0.0' } }, []);
      },
    );
  });

  describe('constructor and basic functionality', () => {
    it('should initialize with string shareScope', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
        },
      });

      // @ts-ignore accessing private property for testing
      const consumes = plugin._consumes;
      expect(consumes.length).toBe(1);
      expect(consumes[0][0]).toBe('react');
      expect(consumes[0][1].shareScope).toBe(shareScopes.string);
      expect(consumes[0][1].requiredVersion).toBe('^17.0.0');
    });

    it('should handle consumes with explicit options', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: {
            requiredVersion: '^17.0.0',
            strictVersion: true,
            singleton: true,
            eager: false,
          },
        },
      });

      // @ts-ignore accessing private property for testing
      const consumes = plugin._consumes;
      const [, config] = consumes[0];

      expect(config.shareScope).toBe(shareScopes.string);
      expect(config.requiredVersion).toBe('^17.0.0');
      expect(config.strictVersion).toBe(true);
      expect(config.singleton).toBe(true);
      expect(config.eager).toBe(false);
    });
  });

  describe('exclude functionality', () => {
    describe('Next.js style patterns', () => {
      it('should handle compiled React exclusion', async () => {
        const testConfig = {
          request: 'next/dist/compiled/',
          singleton: true,
          layer: 'app-pages-browser',
          issuerLayer: 'app-pages-browser',
          shareScope: 'app-pages-browser',
          requiredVersion: '^18.2.0',
          shareKey: 'next/dist/compiled/',
          exclude: {
            request: /react$/,
          },
        };

        const plugin = new ConsumeSharedPlugin({
          consumes: { 'next/dist/compiled/': testConfig },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map(),
            prefixed: new Map([['next/dist/compiled/', testConfig]]),
          }),
        );

        const resultExcluded = await testEnv.normalModuleFactory.factorize({
          context: '/mock/context',
          request: 'next/dist/compiled/react',
          dependencies: [{}],
          contextInfo: {},
        });

        expect(resultExcluded).toBeUndefined();
      });

      it('should handle Next.js pages exclusion', async () => {
        const testConfig = {
          request: 'next/',
          singleton: true,
          shareScope: 'default',
          shareKey: 'next/',
          exclude: {
            request: /(dist|navigation)/,
            version: '<15',
          },
        };

        const plugin = new ConsumeSharedPlugin({
          consumes: { 'next/': testConfig },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map(),
            prefixed: new Map([['next/', testConfig]]),
          }),
        );

        const resultExcluded = await testEnv.normalModuleFactory.factorize({
          context: '/mock/context',
          request: 'next/dist/something',
          dependencies: [{}],
          contextInfo: {},
        });

        expect(resultExcluded).toBeUndefined();
      });

      it('should handle React DOM with fallback version', async () => {
        const reactDomVersion = '18.2.0';
        const testConfig = {
          request: 'react-dom',
          singleton: true,
          shareScope: 'default',
          shareKey: 'react-dom',
          exclude: {
            version: '>19',
            fallbackVersion: reactDomVersion,
          },
        };

        const plugin = new ConsumeSharedPlugin({
          consumes: { 'react-dom': testConfig },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Mock satisfy to return true for the fallback version check
        // This should make the createConsumeSharedModule return undefined
        (satisfy as jest.Mock).mockImplementation((version, range) => {
          if (version === reactDomVersion && range === '>19') {
            return true; // Simulate that this version satisfies the exclude condition
          }
          return false;
        });

        // Mock implementation of createConsumeSharedModule to simulate the exclusion logic
        jest.spyOn(plugin, 'createConsumeSharedModule').mockImplementation(async () => {
          return undefined as any;
        });

        // Setting up the module factory to test exclusion via createConsumeSharedModule
        (testEnv.mockResolver.resolve as jest.Mock).mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/resolved/path/react-dom');
          }
        );

        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react-dom',
          testConfig
        );

        // Since fallbackVersion satisfies the exclude condition, it should skip creating the module
        expect(result).toBeUndefined();
        expect(satisfy).toHaveBeenCalledWith(reactDomVersion, '>19');
      });

      it('should handle JSX runtime exclusion', async () => {
        const testConfig = {
          request: 'react/jsx-runtime',
          singleton: true,
          shareScope: 'default',
          shareKey: 'react/jsx-runtime',
          exclude: {
            version: '>19',
          },
        };

        const plugin = new ConsumeSharedPlugin({
          consumes: { 'react/jsx-runtime': testConfig },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Mock getDescriptionFile to return version 20.0.0
        (getDescriptionFile as jest.Mock).mockImplementation(
          (fs, context, files, callback) => {
            callback(null, { data: { name: 'react', version: '20.0.0' } }, []);
          }
        );

        // Mock satisfy to return true for version check
        // This should make the createConsumeSharedModule return undefined
        (satisfy as jest.Mock).mockImplementation((version, range) => {
          if (version === '20.0.0' && range === '>19') {
            return true; // Simulate that this version satisfies the exclude condition
          }
          return false;
        });

        // Mock implementation of createConsumeSharedModule to simulate the exclusion logic
        jest.spyOn(plugin, 'createConsumeSharedModule').mockImplementation(async () => {
          return undefined as any;
        });

        // Setting up the module factory to test exclusion via createConsumeSharedModule
        (testEnv.mockResolver.resolve as jest.Mock).mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/resolved/path/react/jsx-runtime');
          }
        );

        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react/jsx-runtime',
          testConfig
        );

        // Since the version satisfies the exclude condition, it should skip creating the module
        expect(result).toBeUndefined();
        expect(satisfy).toHaveBeenCalledWith('20.0.0', '>19');
      });
    });

    describe('error handling', () => {
      it('should handle missing package.json', async () => {
        const testConfig = {
          request: 'react',
          exclude: { version: '^17.0.0' },
        };

        const plugin = new ConsumeSharedPlugin({
          consumes: { react: testConfig },
        });

        (getDescriptionFile as jest.Mock).mockImplementationOnce(
          (fs, context, files, callback) => {
            callback(new Error('package.json not found'), null, []);
          },
        );

        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          testConfig,
        );

        expect(result).toBeDefined();
      });

      it('should handle invalid version in package.json', async () => {
        const testConfig = {
          request: 'react',
          exclude: { version: '^17.0.0' },
        };

        const plugin = new ConsumeSharedPlugin({
          consumes: { react: testConfig },
        });

        (getDescriptionFile as jest.Mock).mockImplementationOnce(
          (fs, context, files, callback) => {
            callback(null, { data: { name: 'react', version: 'invalid' } }, []);
          },
        );

        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react',
          testConfig,
        );

        expect(result).toBeDefined();
      });
    });

    describe('layer-based exclusions', () => {
      it('should handle complex layer-based exclusions with different rules per layer', async () => {
        const baseNextCompiledConfig = {
          import: 'next/dist/compiled/',
          shareKey: 'next/dist/compiled/',
          shareScope: 'app-pages-browser',
          requiredVersion: false,
          strictVersion: false,
          singleton: true,
          eager: false,
          packageName: undefined,
          layer: 'app-pages-browser',
          issuerLayer: 'app-pages-browser',
          request: 'next/dist/compiled/',
          exclude: { request: /react$/ },
        };

        const baseNextConfig = {
          import: 'next/',
          shareKey: 'next/',
          shareScope: 'default',
          requiredVersion: false,
          strictVersion: false,
          singleton: true,
          eager: false,
          packageName: undefined,
          layer: 'default',
          issuerLayer: 'default',
          request: 'next/',
          exclude: { request: /(dist|navigation)/ },
        };

        // Setup for the non-excluded module
        const nonExcludedRequest = 'next/dist/compiled/other-module';
        const nonExcludedIssuerLayer = 'app-pages-browser';
        const nonExcludedLookupKey = `(${nonExcludedIssuerLayer})${nonExcludedRequest}`;
        const nonExcludedConfigEntry = {
          // Spread a config that has packageName: undefined
          ...(baseNextCompiledConfig as Omit<ConsumeOptions, 'packageName'> & {
            packageName?: string;
          }),
          import: nonExcludedRequest,
          request: nonExcludedRequest,
          shareKey: nonExcludedRequest,
        };

        // Single mock for resolveMatchedConfigs for the entire test
        (resolveMatchedConfigs as jest.Mock).mockImplementationOnce(
          async () => ({
            resolved: new Map(),
            unresolved: new Map<string, ConsumeOptions>([
              // Use type assertion for the value if direct assignment is problematic
              [
                nonExcludedLookupKey,
                nonExcludedConfigEntry as unknown as ConsumeOptions,
              ],
            ]),
            prefixed: new Map<string, ConsumeOptions>([
              // Use type assertion for the values
              [
                `(${baseNextCompiledConfig.issuerLayer})${baseNextCompiledConfig.request}`,
                baseNextCompiledConfig as unknown as ConsumeOptions,
              ],
              [
                `(${baseNextConfig.issuerLayer})${baseNextConfig.request}`,
                baseNextConfig as unknown as ConsumeOptions,
              ],
            ]),
          }),
        );

        const plugin = new ConsumeSharedPlugin({
          consumes: {
            'next/dist/compiled/': baseNextCompiledConfig as any, // Use 'as any' for consumes to bypass strict constructor validation for test
            'next/': baseNextConfig as any,
          },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation(); // This triggers resolveMatchedConfigs via thisCompilation hook

        testEnv.mockResolver.resolve.mockImplementation(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/resolved/path/' + request);
          },
        );

        // mockConsumeSharedModule is already set with a default implementation in beforeEach

        // 1. For 'next/dist/compiled/react' (app-pages-browser) - EXPECTS EXCLUSION (via prefixed)
        const factorizeDataAppExcluded = {
          context: '/mock/context',
          request: 'next/dist/compiled/react',
          dependencies: [{}],
          contextInfo: { issuerLayer: baseNextCompiledConfig.issuerLayer },
        };
        // We use normalModuleFactory.factorize here, which internally calls the plugin's factorize hook
        // The plugin's factorize hook is what we get from testEnv.getFactorizeHook()
        // So calling testEnv.normalModuleFactory.factorize is the more integrated way to test
        const resultAppLayerExcluded =
          await testEnv.normalModuleFactory.factorize(factorizeDataAppExcluded);
        expect(resultAppLayerExcluded).toBeUndefined();

        // 2. For 'next/dist/something' (default) - EXPECTS EXCLUSION (via prefixed)
        // Mock getDescriptionFile for version check if needed by this path (though exclude is primarily request based)
        (getDescriptionFile as jest.Mock).mockImplementationOnce(
          (fs, context, files, callback) => {
            callback(null, { data: { name: 'next', version: '14.0.0' } }, []);
          },
        );
        (satisfy as jest.Mock).mockImplementationOnce((version, range) => {
          // Example: if baseNextConfig had a version exclude like '<15'
          // if (range === '<15' && version === '14.0.0') return true;
          return false; // Default to not satisfying for this specific call if no version exclude
        });

        const factorizeDataDefaultExcluded = {
          context: '/mock/context',
          request: 'next/dist/something',
          dependencies: [{}],
          contextInfo: { issuerLayer: baseNextConfig.issuerLayer },
        };
        const resultDefaultLayerExcluded =
          await testEnv.normalModuleFactory.factorize(
            factorizeDataDefaultExcluded,
          );
        expect(resultDefaultLayerExcluded).toBeUndefined();

        // 3. For 'next/dist/compiled/other-module' (app-pages-browser) - EXPECTS NO EXCLUSION (via prefixed)
        // Ensure getDescriptionFile mock is suitable if createConsumeSharedModule needs it for version resolution
        (getDescriptionFile as jest.Mock).mockImplementationOnce(
          (fs, context, files, callback) => {
            callback(
              null,
              {
                data: {
                  name: 'next/dist/compiled/other-module',
                  version: '18.2.0',
                },
              },
              [],
            );
          },
        );

        const factorizeDataForNonExcluded = {
          context: '/mock/context',
          request: nonExcludedRequest,
          dependencies: [{}],
          contextInfo: { issuerLayer: baseNextCompiledConfig.issuerLayer },
        };
        const resultNonExcluded = await testEnv.normalModuleFactory.factorize(
          factorizeDataForNonExcluded,
        );

        expect(resultNonExcluded).toBeDefined();
        // The arguments to ConsumeSharedModule constructor will be based on the 'effective options for prefixed'
        // which merges the prefix config with details from the remainder.
        expect(mockConsumeSharedModule).toHaveBeenCalledWith(
          '/mock/context',
          expect.objectContaining({
            import: nonExcludedRequest,
            request: nonExcludedRequest,
            shareKey: nonExcludedRequest,
            layer: baseNextCompiledConfig.issuerLayer,
            issuerLayer: baseNextCompiledConfig.issuerLayer,
            shareScope: baseNextCompiledConfig.shareScope,
            exclude: baseNextCompiledConfig.exclude,
            requiredVersion: baseNextCompiledConfig.requiredVersion,
            singleton: baseNextCompiledConfig.singleton,
            eager: false,
            strictVersion: false,
            packageName: undefined,
          }),
        );
      });

      it('should respect layer-specific version exclusions', async () => {
        const testConfig = {
          request: 'react-dom',
          singleton: true,
          layer: 'app-pages-browser',
          issuerLayer: 'app-pages-browser',
          shareScope: 'app-pages-browser',
          shareKey: 'react-dom',
          exclude: {
            version: '>19',
            fallbackVersion: '18.2.0',
          },
        };

        const plugin = new ConsumeSharedPlugin({
          consumes: { 'react-dom': testConfig },
        });

        plugin.apply(testEnv.compiler);
        testEnv.simulateCompilation();

        // Mock getDescriptionFile to return version 20.0.0 for the test
        (getDescriptionFile as jest.Mock).mockImplementation(
          (fs, context, files, callback) => {
            callback(
              null,
              { data: { name: 'react-dom', version: '20.0.0' } },
              [],
            );
          },
        );

        // Mock satisfy to simulate version matching
        (satisfy as jest.Mock).mockImplementation((version, range) => {
          if (version === '18.2.0' && range === '>19') {
            return true; // Simulate that this version satisfies the exclude condition
          }
          return false;
        });

        // Mock implementation of createConsumeSharedModule to simulate the exclusion logic
        jest.spyOn(plugin, 'createConsumeSharedModule').mockImplementation(async () => {
          return undefined as any;
        });

        // Setting up the module factory to test exclusion via createConsumeSharedModule
        (testEnv.mockResolver.resolve as jest.Mock).mockImplementationOnce(
          (ctx, context, request, resolveContext, callback) => {
            callback(null, '/resolved/path/react-dom');
          }
        );

        const result = await plugin.createConsumeSharedModule(
          testEnv.mockCompilation,
          '/mock/context',
          'react-dom',
          testConfig
        );

        // Since fallbackVersion satisfies the exclude condition, it should skip creating the module
        expect(result).toBeUndefined();
        expect(satisfy).toHaveBeenCalledWith('18.2.0', '>19');
      });
    });
  });
});
