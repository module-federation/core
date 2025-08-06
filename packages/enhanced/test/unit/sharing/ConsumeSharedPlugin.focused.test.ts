/*
 * @jest-environment node
 */

import ConsumeSharedPlugin from '../../../src/lib/sharing/ConsumeSharedPlugin';
import ConsumeSharedModule from '../../../src/lib/sharing/ConsumeSharedModule';
import { vol } from 'memfs';

// Mock file system for controlled testing
jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

// Mock webpack internals
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  getWebpackPath: jest.fn(() => 'webpack'),
  normalizeWebpackPath: jest.fn((p) => p),
}));

// Mock FederationRuntimePlugin to avoid complex dependencies
jest.mock('../../../src/lib/container/runtime/FederationRuntimePlugin', () => {
  return jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  }));
});

// Mock the webpack fs utilities that are used by getDescriptionFile
jest.mock('webpack/lib/util/fs', () => ({
  join: (fs: any, ...paths: string[]) => require('path').join(...paths),
  dirname: (fs: any, filePath: string) => require('path').dirname(filePath),
  readJson: (fs: any, filePath: string, callback: Function) => {
    const memfs = require('memfs').fs;
    memfs.readFile(filePath, 'utf8', (err: any, content: any) => {
      if (err) return callback(err);
      try {
        const data = JSON.parse(content);
        callback(null, data);
      } catch (e) {
        callback(e);
      }
    });
  },
}));

describe('ConsumeSharedPlugin - Focused Quality Tests', () => {
  beforeEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  describe('Configuration behavior tests', () => {
    it('should parse consume configurations correctly and preserve semantic meaning', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          // Test different configuration formats
          'string-version': '^1.0.0',
          'object-config': {
            requiredVersion: '^2.0.0',
            singleton: true,
            strictVersion: false,
            eager: true,
          },
          'custom-import': {
            import: './custom-path',
            shareKey: 'custom-key',
            requiredVersion: false,
          },
          'layered-module': {
            issuerLayer: 'client',
            shareScope: 'client-scope',
          },
          'complex-config': {
            import: './src/lib',
            shareKey: 'shared-lib',
            requiredVersion: '^3.0.0',
            singleton: true,
            strictVersion: true,
            eager: false,
            issuerLayer: 'server',
            include: { version: '^3.0.0' },
            exclude: { request: /test/ },
          },
        },
      });

      // Access internal _consumes to verify parsing (this is legitimate for testing plugin behavior)
      const consumes = (plugin as any)._consumes;
      expect(consumes).toHaveLength(5);

      // Verify string version parsing
      const stringConfig = consumes.find(
        ([key]: [string, any]) => key === 'string-version',
      );
      expect(stringConfig).toBeDefined();
      expect(stringConfig[1]).toMatchObject({
        shareKey: 'string-version',
        requiredVersion: '^1.0.0',
        shareScope: 'default',
        singleton: false,
        strictVersion: false,
        eager: false,
      });

      // Verify object configuration parsing
      const objectConfig = consumes.find(
        ([key]: [string, any]) => key === 'object-config',
      );
      expect(objectConfig[1]).toMatchObject({
        requiredVersion: '^2.0.0',
        singleton: true,
        strictVersion: false,
        eager: true,
        shareScope: 'default',
      });

      // Verify custom import configuration
      const customConfig = consumes.find(
        ([key]: [string, any]) => key === 'custom-import',
      );
      expect(customConfig[1]).toMatchObject({
        import: './custom-path',
        shareKey: 'custom-key',
        requiredVersion: false,
      });

      // Verify layered configuration
      const layeredConfig = consumes.find(
        ([key]: [string, any]) => key === 'layered-module',
      );
      expect(layeredConfig[1]).toMatchObject({
        issuerLayer: 'client',
        shareScope: 'client-scope',
      });

      // Verify complex configuration with filters
      const complexConfig = consumes.find(
        ([key]: [string, any]) => key === 'complex-config',
      );
      expect(complexConfig[1]).toMatchObject({
        import: './src/lib',
        shareKey: 'shared-lib',
        requiredVersion: '^3.0.0',
        singleton: true,
        strictVersion: true,
        eager: false,
        issuerLayer: 'server',
      });
      expect(complexConfig[1].include?.version).toBe('^3.0.0');
      expect(complexConfig[1].exclude?.request).toBeInstanceOf(RegExp);
    });

    it('should validate configurations and reject invalid inputs', () => {
      // Test invalid array configuration
      expect(() => {
        new ConsumeSharedPlugin({
          shareScope: 'default',
          consumes: {
            // @ts-ignore - intentionally testing invalid input
            invalid: ['should', 'not', 'work'],
          },
        });
      }).toThrow();

      // Test valid edge cases
      expect(() => {
        new ConsumeSharedPlugin({
          shareScope: 'test',
          consumes: {
            'empty-config': {},
            'false-required': { requiredVersion: false },
            'false-import': { import: false },
          },
        });
      }).not.toThrow();
    });
  });

  describe('Real module creation behavior', () => {
    it('should create ConsumeSharedModule with real package.json data', async () => {
      // Setup realistic file system with package.json
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
          main: 'index.js',
        }),
      });

      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: { react: '^17.0.0' },
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
              // Simulate successful resolution
              callback(null, `/test-project/node_modules/${request}`);
            },
          }),
        },
        inputFileSystem: require('fs'), // Use memfs
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

      // Verify real module creation
      expect(result).toBeInstanceOf(ConsumeSharedModule);
      expect(mockCompilation.warnings).toHaveLength(0);
      expect(mockCompilation.errors).toHaveLength(0);

      // Verify the module has correct properties
      expect(result.shareScope).toBe('default');
      expect(result.shareKey).toBe('react');
    });

    it('should handle version mismatches appropriately', async () => {
      // Setup with version conflict
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({
          name: 'test-app',
          dependencies: { oldLib: '^1.0.0' },
        }),
        '/test-project/node_modules/oldLib/package.json': JSON.stringify({
          name: 'oldLib',
          version: '1.5.0', // Available version
        }),
      });

      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          oldLib: {
            requiredVersion: '^2.0.0', // Required version (conflict!)
            strictVersion: false, // Not strict, should still work
          },
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
        'oldLib',
        {
          import: undefined,
          shareScope: 'default',
          shareKey: 'oldLib',
          requiredVersion: '^2.0.0',
          strictVersion: false,
          packageName: 'oldLib',
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'oldLib',
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        },
      );

      // Should create module despite version mismatch (strictVersion: false)
      expect(result).toBeInstanceOf(ConsumeSharedModule);

      // Should generate warning about version mismatch
      expect(mockCompilation.warnings.length).toBeGreaterThan(0);
      expect(mockCompilation.warnings[0].message).toContain('version');
    });

    it('should handle missing package.json files gracefully', async () => {
      // Setup with missing package.json
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

      // Should still create module
      expect(result).toBeInstanceOf(ConsumeSharedModule);

      // Should generate warning about missing package.json
      expect(mockCompilation.warnings.length).toBeGreaterThan(0);
      expect(mockCompilation.warnings[0].message).toContain('description file');
    });
  });

  describe('Include/exclude filtering behavior', () => {
    it('should apply version filtering correctly', async () => {
      vol.fromJSON({
        '/test-project/package.json': JSON.stringify({ name: 'test-app' }),
        '/test-project/node_modules/testLib/package.json': JSON.stringify({
          name: 'testLib',
          version: '1.5.0',
        }),
      });

      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: {
          includedLib: {
            requiredVersion: '^1.0.0',
            include: { version: '^1.0.0' }, // Should include (1.5.0 matches ^1.0.0)
          },
          excludedLib: {
            requiredVersion: '^1.0.0',
            exclude: { version: '^1.0.0' }, // Should exclude (1.5.0 matches ^1.0.0)
          },
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
              callback(null, `/test-project/node_modules/testLib`);
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

      // Test include filter - should create module
      const includedResult = await plugin.createConsumeSharedModule(
        mockCompilation as any,
        '/test-project',
        'includedLib',
        {
          import: undefined,
          shareScope: 'default',
          shareKey: 'includedLib',
          requiredVersion: '^1.0.0',
          strictVersion: false,
          packageName: 'testLib',
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'includedLib',
          include: { version: '^1.0.0' },
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        },
      );

      expect(includedResult).toBeInstanceOf(ConsumeSharedModule);

      // Test exclude filter - should not create module
      const excludedResult = await plugin.createConsumeSharedModule(
        mockCompilation as any,
        '/test-project',
        'excludedLib',
        {
          import: undefined,
          shareScope: 'default',
          shareKey: 'excludedLib',
          requiredVersion: '^1.0.0',
          strictVersion: false,
          packageName: 'testLib',
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'excludedLib',
          include: undefined,
          exclude: { version: '^1.0.0' },
          nodeModulesReconstructedLookup: undefined,
        },
      );

      expect(excludedResult).toBeUndefined();
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle resolver errors gracefully', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: 'default',
        consumes: { failingModule: '^1.0.0' },
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
              // Simulate resolver failure
              callback(new Error('Resolution failed'), null);
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
        'failingModule',
        {
          import: './failing-path',
          shareScope: 'default',
          shareKey: 'failingModule',
          requiredVersion: '^1.0.0',
          strictVersion: false,
          packageName: undefined,
          singleton: false,
          eager: false,
          issuerLayer: undefined,
          layer: undefined,
          request: 'failingModule',
          include: undefined,
          exclude: undefined,
          nodeModulesReconstructedLookup: undefined,
        },
      );

      // Should create module despite resolution failure
      expect(result).toBeInstanceOf(ConsumeSharedModule);

      // Should report error
      expect(mockCompilation.errors).toHaveLength(1);
      expect(mockCompilation.errors[0].message).toContain('Resolution failed');
    });
  });
});
