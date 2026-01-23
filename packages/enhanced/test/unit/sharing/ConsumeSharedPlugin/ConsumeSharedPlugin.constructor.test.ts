/*
 * @rstest-environment node
 */

import {
  ConsumeSharedPlugin,
  shareScopes,
  mockConsumeSharedModule,
  resetAllMocks,
} from '../plugin-test-utils';
import { getConsumes, ConsumeEntry } from './helpers';

describe('ConsumeSharedPlugin', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with string shareScope', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
        },
      });

      // Test private property is set correctly
      const consumes = getConsumes(plugin);

      expect(consumes.length).toBe(1);
      expect(consumes[0][0]).toBe('react');
      expect(consumes[0][1]['shareScope']).toBe(shareScopes.string);
      expect(consumes[0][1]['requiredVersion']).toBe('^17.0.0');
    });

    it('should initialize with array shareScope', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.array,
        consumes: {
          react: '^17.0.0',
        },
      });

      const consumes = getConsumes(plugin);
      const [, config] = consumes[0];

      expect(config['shareScope']).toEqual(shareScopes.array);
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

      const consumes = getConsumes(plugin);
      const [, config] = consumes[0];

      expect(config['shareScope']).toBe(shareScopes.string);
      expect(config['requiredVersion']).toBe('^17.0.0');
      expect(config['strictVersion']).toBe(true);
      expect(config['singleton']).toBe(true);
      expect(config['eager']).toBe(false);
    });

    it('should handle consumes with custom shareScope', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: {
            shareScope: 'custom-scope',
            requiredVersion: '^17.0.0',
          },
        },
      });

      const consumes = getConsumes(plugin);
      const [, config] = consumes[0];

      expect(config['shareScope']).toBe('custom-scope');
    });

    it('should handle multiple consumed modules', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
          lodash: {
            requiredVersion: '^4.17.0',
            singleton: true,
          },
          'react-dom': {
            requiredVersion: '^17.0.0',
            shareScope: 'custom',
          },
        },
      });

      const consumes = getConsumes(plugin);

      expect(consumes.length).toBe(3);

      const reactEntry = consumes.find(
        ([key]: ConsumeEntry) => key === 'react',
      );
      const lodashEntry = consumes.find(
        ([key]: ConsumeEntry) => key === 'lodash',
      );
      const reactDomEntry = consumes.find(
        ([key]: ConsumeEntry) => key === 'react-dom',
      );

      expect(reactEntry).toBeDefined();
      expect(lodashEntry).toBeDefined();
      expect(reactDomEntry).toBeDefined();

      if (!reactEntry || !lodashEntry || !reactDomEntry) {
        throw new Error('Expected consume entries to be defined');
      }

      expect(reactEntry[1]['requiredVersion']).toBe('^17.0.0');
      expect(lodashEntry[1]['singleton']).toBe(true);
      expect(reactDomEntry[1]['shareScope']).toBe('custom');
    });

    it('should handle import:false configuration', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: {
            import: false,
            requiredVersion: '^17.0.0',
          },
        },
      });

      const consumes = getConsumes(plugin);
      const [, config] = consumes[0];

      expect(config['import']).toBeUndefined();
    });

    it('should handle layer configuration', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: {
            requiredVersion: '^17.0.0',
            layer: 'client',
          },
        },
      });

      const consumes = getConsumes(plugin);
      const [, config] = consumes[0];

      expect(config['layer']).toBe('client');
    });

    it('should handle include/exclude filters', () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: {
            requiredVersion: '^17.0.0',
            include: {
              version: '^17.0.0',
            },
            exclude: {
              version: '17.0.1',
            },
          },
        },
      });

      const consumes = getConsumes(plugin);
      const [, config] = consumes[0];

      expect(config['include']).toEqual({ version: '^17.0.0' });
      expect(config['exclude']).toEqual({ version: '17.0.1' });
    });

    it('should reject invalid consume definitions', () => {
      expect(
        () =>
          new ConsumeSharedPlugin({
            shareScope: 'default',
            consumes: {
              invalid: ['one', 'two'],
            },
          }),
      ).toThrow();
    });
  });

  describe('module creation', () => {
    it('should create ConsumeSharedModule with correct options', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: '^17.0.0',
        },
      });

      const context = '/test/context';
      const config = {
        shareScope: shareScopes.string,
        requiredVersion: '^17.0.0',
        request: 'react',
        shareKey: 'react',
        strictVersion: false,
        singleton: false,
        eager: false,
        packageName: undefined,
        issuerLayer: undefined,
        layer: undefined,
        import: undefined,
        include: undefined,
        exclude: undefined,
        allowNodeModulesSuffixMatch: undefined,
      };

      const mockCompilation = {
        resolverFactory: {
          get: rs.fn().mockReturnValue({
            resolve: rs
              .fn()
              .mockImplementation(
                (
                  context: string,
                  lookupStartPath: string,
                  request: string,
                  resolveContext: Record<string, unknown>,
                  callback: (err: Error | null, result?: string) => void,
                ) => {
                  callback(null, '/resolved/path');
                },
              ),
          }),
        },
        warnings: [],
        errors: [],
        contextDependencies: { addAll: rs.fn() },
        fileDependencies: { addAll: rs.fn() },
        missingDependencies: { addAll: rs.fn() },
        inputFileSystem: {},
        compiler: {
          context: '/test/context',
        },
      };

      // @ts-ignore - accessing private method for testing
      const result = await plugin.createConsumeSharedModule(
        mockCompilation,
        context,
        'react',
        config,
      );

      // Verify the result is a ConsumeSharedModule with correct options
      expect(result).toBeDefined();
      expect(result.options.shareScope).toBe(shareScopes.string);
      expect(result.options.requiredVersion).toBe('^17.0.0');
      expect(result.options.shareKey).toBe('react');
    });

    it('should handle eager modules correctly', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: {
            requiredVersion: '^17.0.0',
            eager: true,
          },
        },
      });

      const context = '/test/context';
      const [, config] = getConsumes(plugin)[0];

      const mockCompilation = {
        resolverFactory: {
          get: rs.fn().mockReturnValue({
            resolve: rs
              .fn()
              .mockImplementation(
                (
                  context: string,
                  lookupStartPath: string,
                  request: string,
                  resolveContext: Record<string, unknown>,
                  callback: (err: Error | null, result?: string) => void,
                ) => {
                  callback(null, '/resolved/path');
                },
              ),
          }),
        },
        warnings: [],
        errors: [],
        contextDependencies: { addAll: rs.fn() },
        fileDependencies: { addAll: rs.fn() },
        missingDependencies: { addAll: rs.fn() },
        inputFileSystem: {},
        compiler: {
          context: '/test/context',
        },
      };

      // @ts-ignore - accessing private method for testing
      const result = await plugin.createConsumeSharedModule(
        mockCompilation,
        context,
        'react',
        config,
      );

      expect(result.options.eager).toBe(true);
    });

    it('should handle singleton modules correctly', async () => {
      const plugin = new ConsumeSharedPlugin({
        shareScope: shareScopes.string,
        consumes: {
          react: {
            requiredVersion: '^17.0.0',
            singleton: true,
            strictVersion: true,
          },
        },
      });

      const context = '/test/context';
      const [, config] = getConsumes(plugin)[0];

      const mockCompilation = {
        resolverFactory: {
          get: rs.fn().mockReturnValue({
            resolve: rs
              .fn()
              .mockImplementation(
                (
                  context: string,
                  lookupStartPath: string,
                  request: string,
                  resolveContext: Record<string, unknown>,
                  callback: (err: Error | null, result?: string) => void,
                ) => {
                  callback(null, '/resolved/path');
                },
              ),
          }),
        },
        warnings: [],
        errors: [],
        contextDependencies: { addAll: rs.fn() },
        fileDependencies: { addAll: rs.fn() },
        missingDependencies: { addAll: rs.fn() },
        inputFileSystem: {},
        compiler: {
          context: '/test/context',
        },
      };

      // @ts-ignore - accessing private method for testing
      const result = await plugin.createConsumeSharedModule(
        mockCompilation,
        context,
        'react',
        config,
      );

      expect(result.options.singleton).toBe(true);
      expect(result.options.strictVersion).toBe(true);
    });
  });
});
