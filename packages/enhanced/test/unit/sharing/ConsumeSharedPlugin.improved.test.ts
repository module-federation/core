/*
 * @jest-environment node
 */

import ConsumeSharedPlugin from '../../../src/lib/sharing/ConsumeSharedPlugin';
import ConsumeSharedModule from '../../../src/lib/sharing/ConsumeSharedModule';
import { vol } from 'memfs';
import { SyncHook, AsyncSeriesHook } from 'tapable';

// Mock file system only for controlled testing
jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

// Mock webpack internals minimally
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  getWebpackPath: jest.fn((p) => p),
  normalizeWebpackPath: jest.fn((p) => p),
}));

describe('ConsumeSharedPlugin - Improved Quality Tests', () => {
  beforeEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  describe('Real webpack integration', () => {
    it('should apply plugin to webpack compiler and register hooks correctly', () => {
      // Create real tapable hooks
      const thisCompilationHook = new SyncHook(['compilation', 'params']);
      const compiler = {
        hooks: { thisCompilation: thisCompilationHook },
        context: '/test-project',
        options: {
          plugins: [], // Add empty plugins array to prevent runtime plugin error
          output: {
            uniqueName: 'test-app',
          },
        },
      };

      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: '^17.0.0',
          lodash: { requiredVersion: '^4.0.0' },
        },
      });

      // Track hook registration
      let compilationCallback: Function | null = null;
      const originalTap = thisCompilationHook.tap;
      thisCompilationHook.tap = jest.fn((name, callback) => {
        compilationCallback = callback;
        return originalTap.call(thisCompilationHook, name, callback);
      });

      // Apply plugin
      plugin.apply(compiler as any);

      // Verify hook was registered
      expect(thisCompilationHook.tap).toHaveBeenCalledWith(
        'ConsumeSharedPlugin',
        expect.any(Function),
      );

      // Test hook execution with real compilation-like object
      expect(compilationCallback).not.toBeNull();
      if (compilationCallback) {
        const factorizeHook = new AsyncSeriesHook(['resolveData']);
        const createModuleHook = new AsyncSeriesHook(['resolveData', 'module']);

        const mockCompilation = {
          dependencyFactories: new Map(),
          hooks: {
            additionalTreeRuntimeRequirements: new SyncHook(['chunk', 'set']),
          },
        };

        const mockNormalModuleFactory = {
          hooks: {
            factorize: factorizeHook,
            createModule: createModuleHook,
          },
        };

        // Execute the compilation hook
        expect(() => {
          compilationCallback(mockCompilation, {
            normalModuleFactory: mockNormalModuleFactory,
          });
        }).not.toThrow();

        // Verify dependency factory was set
        expect(mockCompilation.dependencyFactories.size).toBeGreaterThan(0);
      }
    });

    it('should handle real module resolution with package.json', async () => {
      // Setup realistic file system
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({
          name: 'test-app',
          version: '1.0.0',
          dependencies: {
            react: '^17.0.2',
            lodash: '^4.17.21',
          },
        }),
        '/test-project/node_modules/react/package.json': JSON.stringify({
          name: 'react',
          version: '17.0.2',
        }),
        '/test-project/node_modules/lodash/package.json': JSON.stringify({
          name: 'lodash',
          version: '4.17.21',
        }),
      });

      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          react: '^17.0.0',
          lodash: '^4.0.0',
        },
      });

      // Create realistic compilation context
      const mockCompilation = {
        compiler: { context: '/test-project' },
        resolverFactory: {
          get: () => ({
            resolve: (
              context: string,
              lookupStartPath: string,
              request: string,
              resolveContext: any,
              callback: Function,
            ) => {
              // Simulate real module resolution
              const resolvedPath = `/test-project/node_modules/${request}`;
              callback(null, resolvedPath);
            },
          }),
        },
        inputFileSystem: require('fs'),
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        warnings: [],
        errors: [],
      };

      // Test createConsumeSharedModule with real package.json reading
      const result = await plugin.createConsumeSharedModule(
        mockCompilation as any,
        '/test-project',
        'react',
        {
          import: undefined,
          shareScope: 'default',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
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

      expect(result).toBeInstanceOf(ConsumeSharedModule);
      expect(mockCompilation.warnings).toHaveLength(0);
      expect(mockCompilation.errors).toHaveLength(0);
    });

    it('should handle version conflicts correctly', async () => {
      // Setup conflicting versions
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

      const mockCompilation = {
        compiler: { context: '/test-project' },
        resolverFactory: {
          get: () => ({
            resolve: (
              context: string,
              lookupStartPath: string,
              request: string,
              resolveContext: any,
              callback: Function,
            ) => {
              callback(null, `/test-project/node_modules/${request}`);
            },
          }),
        },
        inputFileSystem: require('fs'),
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        warnings: [],
        errors: [],
      };

      const result = await plugin.createConsumeSharedModule(
        mockCompilation as any,
        '/test-project',
        'react',
        {
          import: undefined,
          shareScope: 'default',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
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

      // Should still create module but with warnings about version mismatch
      expect(result).toBeInstanceOf(ConsumeSharedModule);
      expect(mockCompilation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration parsing behavior', () => {
    it('should parse different consume configuration formats correctly', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          // String format
          react: '^17.0.0',
          // Object format
          lodash: {
            requiredVersion: '^4.0.0',
            singleton: true,
            strictVersion: false,
          },
          // Advanced format with custom request
          'my-lib': {
            import: './custom-lib',
            shareKey: 'my-shared-lib',
            requiredVersion: false,
          },
          // Layer-specific consumption
          'client-only': {
            issuerLayer: 'client',
            shareScope: 'client-scope',
          },
        },
      });

      // Access plugin internals to verify parsing (using proper method)
      const consumes = (plugin as any)._consumes;

      expect(consumes).toHaveLength(4);

      // Verify string format parsing
      const reactConfig = consumes.find(
        ([key]: [string, any]) => key === 'react',
      );
      expect(reactConfig).toBeDefined();
      expect(reactConfig[1].requiredVersion).toBe('^17.0.0');

      // Verify object format parsing
      const lodashConfig = consumes.find(
        ([key]: [string, any]) => key === 'lodash',
      );
      expect(lodashConfig).toBeDefined();
      expect(lodashConfig[1].singleton).toBe(true);
      expect(lodashConfig[1].strictVersion).toBe(false);

      // Verify advanced configuration
      const myLibConfig = consumes.find(
        ([key]: [string, any]) => key === 'my-lib',
      );
      expect(myLibConfig).toBeDefined();
      expect(myLibConfig[1].import).toBe('./custom-lib');
      expect(myLibConfig[1].shareKey).toBe('my-shared-lib');

      // Verify layer-specific configuration
      const clientOnlyConfig = consumes.find(
        ([key]: [string, any]) => key === 'client-only',
      );
      expect(clientOnlyConfig).toBeDefined();
      expect(clientOnlyConfig[1].issuerLayer).toBe('client');
      expect(clientOnlyConfig[1].shareScope).toBe('client-scope');
    });

    it('should handle invalid configurations gracefully', () => {
      expect(() => {
        new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            // @ts-ignore - intentionally testing invalid config
            invalid: ['array', 'not', 'allowed'],
          },
        });
      }).toThrow();
    });
  });

  describe('Layer-based consumption', () => {
    it('should handle layer-specific module consumption', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          'client-lib': { issuerLayer: 'client' },
          'server-lib': { issuerLayer: 'server' },
          'universal-lib': {}, // No layer restriction
        },
      });

      const consumes = (plugin as any)._consumes;

      const clientLib = consumes.find(
        ([key]: [string, any]) => key === 'client-lib',
      );
      const serverLib = consumes.find(
        ([key]: [string, any]) => key === 'server-lib',
      );
      const universalLib = consumes.find(
        ([key]: [string, any]) => key === 'universal-lib',
      );

      expect(clientLib[1].issuerLayer).toBe('client');
      expect(serverLib[1].issuerLayer).toBe('server');
      expect(universalLib[1].issuerLayer).toBeUndefined();
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle missing package.json gracefully', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        // No react package.json
      });

      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: { react: '^17.0.0' },
      });

      const mockCompilation = {
        compiler: { context: '/test-project' },
        resolverFactory: {
          get: () => ({
            resolve: (
              context: string,
              lookupStartPath: string,
              request: string,
              resolveContext: any,
              callback: Function,
            ) => {
              callback(null, `/test-project/node_modules/${request}`);
            },
          }),
        },
        inputFileSystem: require('fs'),
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        warnings: [],
        errors: [],
      };

      const result = await plugin.createConsumeSharedModule(
        mockCompilation as any,
        '/test-project',
        'react',
        {
          import: undefined,
          shareScope: 'default',
          shareKey: 'react',
          requiredVersion: '^17.0.0',
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

      expect(result).toBeInstanceOf(ConsumeSharedModule);
      expect(mockCompilation.warnings.length).toBeGreaterThan(0);
    });
  });
});
