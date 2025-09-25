/*
 * @jest-environment node
 */

import {
  normalizeWebpackPath,
  getWebpackPath,
} from '@module-federation/sdk/normalize-webpack-path';
import { shareScopes, createMockCompiler } from './utils';

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
}));

jest.mock('@module-federation/sdk', () => ({
  isRequiredVersion: jest.fn(
    (version) => typeof version === 'string' && version.startsWith('^'),
  ),
}));

// Mock plugin implementations first
const ConsumeSharedPluginMock = jest.fn().mockImplementation((options) => ({
  options,
  apply: jest.fn(),
}));

const ProvideSharedPluginMock = jest.fn().mockImplementation((options) => ({
  options,
  apply: jest.fn(),
}));

jest.mock('../../../src/lib/sharing/ConsumeSharedPlugin', () => {
  return ConsumeSharedPluginMock;
});

jest.mock('../../../src/lib/sharing/ProvideSharedPlugin', () => {
  return ProvideSharedPluginMock;
});

// Import after mocks are set up
const SharePlugin = require('../../../src/lib/sharing/SharePlugin').default;

describe('SharePlugin', () => {
  describe('constructor', () => {
    it('should handle empty shared configuration', () => {
      expect(() => {
        new SharePlugin({
          shared: {},
        });
      }).not.toThrow();
    });

    it('should allow both include and exclude filters together', () => {
      expect(() => {
        new SharePlugin({
          shared: {
            react: {
              include: { version: '^17.0.0' },
              exclude: { version: '^16.0.0' },
            },
          },
        });
      }).not.toThrow();
    });

    it('should initialize with string shareScope', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          react: '^17.0.0',
          lodash: {
            requiredVersion: '^4.17.0',
            singleton: true,
            eager: false,
          },
        },
      });

      // @ts-ignore accessing private properties for testing
      expect(plugin._shareScope).toBe(shareScopes.string);

      // @ts-ignore
      const consumes = plugin._consumes;
      expect(consumes.length).toBe(2);

      // First consume (shorthand)
      const reactConsume = consumes.find((consume) => 'react' in consume);
      expect(reactConsume).toBeDefined();
      expect(reactConsume.react.requiredVersion).toBe('^17.0.0');

      // Second consume (longhand)
      const lodashConsume = consumes.find((consume) => 'lodash' in consume);
      expect(lodashConsume).toBeDefined();
      expect(lodashConsume.lodash.singleton).toBe(true);

      // @ts-ignore
      const provides = plugin._provides;
      expect(provides.length).toBe(2);

      // Should create provides for both entries
      const reactProvide = provides.find((provide) => 'react' in provide);
      expect(reactProvide).toBeDefined();

      const lodashProvide = provides.find((provide) => 'lodash' in provide);
      expect(lodashProvide).toBeDefined();
      expect(lodashProvide.lodash.singleton).toBe(true);
    });

    it('should initialize with array shareScope', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.array,
        shared: {
          react: '^17.0.0',
        },
      });

      // @ts-ignore accessing private properties for testing
      expect(plugin._shareScope).toEqual(shareScopes.array);

      // @ts-ignore check consumes and provides
      const consumes = plugin._consumes;
      const provides = plugin._provides;

      // Check consume
      const reactConsume = consumes.find((consume) => 'react' in consume);
      expect(reactConsume).toBeDefined();

      // Check provide
      const reactProvide = provides.find((provide) => 'react' in provide);
      expect(reactProvide).toBeDefined();
    });

    it('should handle mix of shareScope overrides', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          // Uses default scope
          react: '^17.0.0',
          // Override with string scope
          lodash: {
            shareScope: 'custom',
            requiredVersion: '^4.17.0',
          },
          // Override with array scope
          moment: {
            shareScope: shareScopes.array,
            requiredVersion: '^2.29.0',
          },
        },
      });

      // @ts-ignore accessing private properties for testing
      expect(plugin._shareScope).toBe(shareScopes.string);

      // @ts-ignore check consumes
      const consumes = plugin._consumes;

      // Default scope comes from plugin level, not set on item
      const reactConsume = consumes.find((consume) => 'react' in consume);
      expect(reactConsume).toBeDefined();

      // Custom string scope should be set on item
      const lodashConsume = consumes.find((consume) => 'lodash' in consume);
      expect(lodashConsume).toBeDefined();
      expect(lodashConsume.lodash.shareScope).toBe('custom');

      // Array scope should be set on item
      const momentConsume = consumes.find((consume) => 'moment' in consume);
      expect(momentConsume).toBeDefined();
      expect(momentConsume.moment.shareScope).toEqual(shareScopes.array);

      // @ts-ignore check provides
      const provides = plugin._provides;

      // Default scope comes from plugin level, not set on item
      const reactProvide = provides.find((provide) => 'react' in provide);
      expect(reactProvide).toBeDefined();

      // Custom string scope should be set on item
      const lodashProvide = provides.find((provide) => 'lodash' in provide);
      expect(lodashProvide).toBeDefined();
      expect(lodashProvide.lodash.shareScope).toBe('custom');

      // Array scope should be set on item
      const momentProvide = provides.find((provide) => 'moment' in provide);
      expect(momentProvide).toBeDefined();
      expect(momentProvide.moment.shareScope).toEqual(shareScopes.array);
    });

    it('should handle import false correctly', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          react: {
            import: false, // No fallback
            requiredVersion: '^17.0.0',
          },
        },
      });

      // @ts-ignore check provides
      const provides = plugin._provides;

      // Should not create provides for import: false
      expect(provides.length).toBe(0);

      // @ts-ignore check consumes
      const consumes = plugin._consumes;

      // Should still create consume
      const reactConsume = consumes.find((consume) => 'react' in consume);
      expect(reactConsume).toBeDefined();
      expect(reactConsume.react.import).toBe(false);
    });
  });

  describe('internal state access', () => {
    let plugin: any;

    beforeEach(() => {
      plugin = new SharePlugin({
        shareScope: 'test-scope',
        shared: {
          react: '^17.0.0',
          lodash: {
            import: false,
            requiredVersion: '^4.17.0',
          },
          utils: {
            version: '1.0.0',
          },
        },
      });
    });

    it('should store share scope', () => {
      expect(plugin._shareScope).toBe('test-scope');
    });

    it('should store consumes configurations', () => {
      expect(plugin._consumes).toBeInstanceOf(Array);
      expect(plugin._consumes.length).toBe(3);
    });

    it('should store provides configurations', () => {
      expect(plugin._provides).toBeInstanceOf(Array);
      expect(plugin._provides.length).toBe(2); // lodash excluded due to import: false
    });
  });

  describe('apply', () => {
    let mockCompiler;

    beforeEach(() => {
      mockCompiler = createMockCompiler();

      // Reset mocks before each test
      ConsumeSharedPluginMock.mockClear();
      ProvideSharedPluginMock.mockClear();
    });

    it('should apply both consume and provide plugins', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          react: '^17.0.0',
        },
      });

      plugin.apply(mockCompiler);

      // Should call getWebpackPath
      expect(getWebpackPath).toHaveBeenCalled();

      // Should create and apply ConsumeSharedPlugin
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      expect(consumeOptions.shareScope).toBe(shareScopes.string);
      expect(consumeOptions.consumes).toBeInstanceOf(Array);

      // Should create and apply ProvideSharedPlugin
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      expect(provideOptions.shareScope).toBe(shareScopes.string);
      expect(provideOptions.provides).toBeInstanceOf(Array);
    });

    it('should handle array shareScope when applying plugins', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.array,
        shared: {
          react: '^17.0.0',
        },
      });

      plugin.apply(mockCompiler);

      // Should create ConsumeSharedPlugin with array shareScope
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      expect(consumeOptions.shareScope).toEqual(shareScopes.array);
      expect(consumeOptions.consumes).toBeInstanceOf(Array);

      // Should create ProvideSharedPlugin with array shareScope
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      expect(provideOptions.shareScope).toEqual(shareScopes.array);
      expect(provideOptions.provides).toBeInstanceOf(Array);
    });

    it('should handle mixed shareScopes when applying plugins', () => {
      const plugin = new SharePlugin({
        // Default scope
        shareScope: shareScopes.string,
        shared: {
          // Default scope
          react: '^17.0.0',
          // Override scope
          lodash: {
            shareScope: shareScopes.array,
            requiredVersion: '^4.17.0',
          },
        },
      });

      plugin.apply(mockCompiler);

      // Get ConsumeSharedPlugin options
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];

      // Default scope should be string at the plugin level
      expect(consumeOptions.shareScope).toBe(shareScopes.string);

      // Consumes should include both modules
      const consumes = consumeOptions.consumes;
      expect(consumes.length).toBe(2);

      const reactConsume = consumes.find(
        (consume) => Object.keys(consume)[0] === 'react',
      );
      expect(reactConsume).toBeDefined();

      const lodashConsume = consumes.find(
        (consume) => Object.keys(consume)[0] === 'lodash',
      );
      expect(lodashConsume).toBeDefined();
      expect(lodashConsume.lodash.shareScope).toEqual(shareScopes.array);

      // Similarly check ProvideSharedPlugin
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];

      // Default scope should be string at the plugin level
      expect(provideOptions.shareScope).toBe(shareScopes.string);

      // Provides should include both modules
      const provides = provideOptions.provides;
      expect(provides.length).toBe(2);

      const reactProvide = provides.find(
        (provide) => Object.keys(provide)[0] === 'react',
      );
      expect(reactProvide).toBeDefined();

      const lodashProvide = provides.find(
        (provide) => Object.keys(provide)[0] === 'lodash',
      );
      expect(lodashProvide).toBeDefined();
      expect(lodashProvide.lodash.shareScope).toEqual(shareScopes.array);
    });
  });

  describe('exclude functionality', () => {
    let mockCompiler;

    beforeEach(() => {
      mockCompiler = createMockCompiler();
      ConsumeSharedPluginMock.mockClear();
      ProvideSharedPluginMock.mockClear();
    });

    it('should handle version-based exclusion in consumes', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          react: {
            requiredVersion: '^17.0.0',
            exclude: {
              version: '^16.0.0',
            },
          },
        },
      });

      plugin.apply(mockCompiler);

      // Check ConsumeSharedPlugin options
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const reactConsume = consumeOptions.consumes.find(
        (consume) => Object.keys(consume)[0] === 'react',
      );
      expect(reactConsume.react.exclude).toEqual({ version: '^16.0.0' });
    });

    it('should handle request-based exclusion in consumes', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          '@scope/prefix/': {
            requiredVersion: '^1.0.0',
            exclude: {
              request: /excluded-path$/,
            },
          },
        },
      });

      plugin.apply(mockCompiler);

      // Check ConsumeSharedPlugin options
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const prefixConsume = consumeOptions.consumes.find(
        (consume) => Object.keys(consume)[0] === '@scope/prefix/',
      );
      expect(prefixConsume['@scope/prefix/'].exclude.request).toBeInstanceOf(
        RegExp,
      );
      expect(prefixConsume['@scope/prefix/'].exclude.request.source).toBe(
        'excluded-path$',
      );
    });

    it('should handle version-based exclusion in provides', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          react: {
            version: '17.0.2',
            exclude: {
              version: '^16.0.0',
            },
          },
        },
      });

      plugin.apply(mockCompiler);

      // Check ProvideSharedPlugin options
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      const reactProvide = provideOptions.provides.find(
        (provide) => Object.keys(provide)[0] === 'react',
      );
      expect(reactProvide.react.exclude).toEqual({ version: '^16.0.0' });
    });

    it('should handle request-based exclusion in provides', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          '@scope/prefix/': {
            version: '1.0.0',
            exclude: {
              request: /excluded-path$/,
            },
          },
        },
      });

      plugin.apply(mockCompiler);

      // Check ProvideSharedPlugin options
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      const prefixProvide = provideOptions.provides.find(
        (provide) => Object.keys(provide)[0] === '@scope/prefix/',
      );
      expect(prefixProvide['@scope/prefix/'].exclude.request).toBeInstanceOf(
        RegExp,
      );
      expect(prefixProvide['@scope/prefix/'].exclude.request.source).toBe(
        'excluded-path$',
      );
    });

    it('should handle both version and request exclusion together', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          '@scope/prefix/': {
            version: '1.0.0',
            exclude: {
              version: '^0.9.0',
              request: /excluded-path$/,
            },
          },
        },
      });

      plugin.apply(mockCompiler);

      // Check both plugins receive the complete exclude configuration
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];

      const prefixConsume = consumeOptions.consumes.find(
        (consume) => Object.keys(consume)[0] === '@scope/prefix/',
      );
      const prefixProvide = provideOptions.provides.find(
        (provide) => Object.keys(provide)[0] === '@scope/prefix/',
      );

      // Both should have version and request exclusion
      expect(prefixConsume['@scope/prefix/'].exclude).toEqual({
        version: '^0.9.0',
        request: expect.any(RegExp),
      });
      expect(prefixProvide['@scope/prefix/'].exclude).toEqual({
        version: '^0.9.0',
        request: expect.any(RegExp),
      });
    });

    it('should not create provides entry when import is false, but should keep exclude in consumes', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          react: {
            import: false,
            requiredVersion: '^17.0.0',
            exclude: {
              version: '^16.0.0',
            },
          },
        },
      });

      plugin.apply(mockCompiler);

      // Check ProvideSharedPlugin has no entries
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      expect(provideOptions.provides).toHaveLength(0);

      // Check ConsumeSharedPlugin still has the exclude config
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const reactConsume = consumeOptions.consumes.find(
        (consume) => Object.keys(consume)[0] === 'react',
      );
      expect(reactConsume.react.exclude).toEqual({ version: '^16.0.0' });
    });
  });

  describe('allowNodeModulesSuffixMatch functionality', () => {
    let mockCompiler;

    beforeEach(() => {
      mockCompiler = createMockCompiler();
      ConsumeSharedPluginMock.mockClear();
      ProvideSharedPluginMock.mockClear();
    });

    it('should pass allowNodeModulesSuffixMatch to both ConsumeSharedPlugin and ProvideSharedPlugin', () => {
      const plugin = new SharePlugin({
        shared: {
          react: {
            requiredVersion: '^17.0.0',
            allowNodeModulesSuffixMatch: true,
          },
        },
      });

      plugin.apply(mockCompiler);

      // Check ConsumeSharedPlugin receives allowNodeModulesSuffixMatch in config
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const reactConsume = consumeOptions.consumes.find(
        (consume) => Object.keys(consume)[0] === 'react',
      );
      expect(reactConsume.react.allowNodeModulesSuffixMatch).toBe(true);

      // Check ProvideSharedPlugin receives allowNodeModulesSuffixMatch in config
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      const reactProvide = provideOptions.provides.find(
        (provide) => Object.keys(provide)[0] === 'react',
      );
      expect(reactProvide.react.allowNodeModulesSuffixMatch).toBe(true);
    });
  });

  describe('include functionality', () => {
    let mockCompiler;

    beforeEach(() => {
      mockCompiler = createMockCompiler();
      ConsumeSharedPluginMock.mockClear();
      ProvideSharedPluginMock.mockClear();
    });

    it('should handle version-based inclusion in consumes', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          react: {
            requiredVersion: '^17.0.0',
            include: {
              version: '^17.0.0',
            },
          },
        },
      });

      plugin.apply(mockCompiler);

      // Check ConsumeSharedPlugin options
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const reactConsume = consumeOptions.consumes.find(
        (consume) => Object.keys(consume)[0] === 'react',
      );
      expect(reactConsume.react.include).toEqual({ version: '^17.0.0' });
    });

    it('should handle request-based inclusion in consumes', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          '@scope/prefix/': {
            requiredVersion: '^1.0.0',
            include: {
              request: /included-path$/,
            },
          },
        },
      });

      plugin.apply(mockCompiler);

      // Check ConsumeSharedPlugin options
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const prefixConsume = consumeOptions.consumes.find(
        (consume) => Object.keys(consume)[0] === '@scope/prefix/',
      );
      expect(prefixConsume['@scope/prefix/'].include.request).toBeInstanceOf(
        RegExp,
      );
      expect(prefixConsume['@scope/prefix/'].include.request.source).toBe(
        'included-path$',
      );
    });

    it('should handle version-based inclusion in provides', () => {
      const plugin = new SharePlugin({
        shareScope: shareScopes.string,
        shared: {
          react: {
            version: '17.0.2',
            include: {
              version: '^17.0.0',
              fallbackVersion: '16.14.0',
            },
          },
        },
      });

      plugin.apply(mockCompiler);

      // Check ProvideSharedPlugin options
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      const reactProvide = provideOptions.provides.find(
        (provide) => Object.keys(provide)[0] === 'react',
      );
      expect(reactProvide.react.include).toEqual({
        version: '^17.0.0',
        fallbackVersion: '16.14.0',
      });
    });
  });

  describe('default shareScope', () => {
    let mockCompiler;

    beforeEach(() => {
      mockCompiler = createMockCompiler();
      ConsumeSharedPluginMock.mockClear();
      ProvideSharedPluginMock.mockClear();
    });

    it('should use "default" as shareScope when none is provided', () => {
      const plugin = new SharePlugin({
        shared: {
          react: '^17.0.0',
        },
        // No shareScope provided
      });

      plugin.apply(mockCompiler);

      // Check ConsumeSharedPlugin receives default shareScope
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      expect(consumeOptions.shareScope).toBe('default');

      // Check ProvideSharedPlugin receives default shareScope
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      expect(provideOptions.shareScope).toBe('default');
    });
  });

  describe('schema validation', () => {
    beforeEach(() => {
      // Save original console.error to restore later
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
      // Restore console.error
      jest.restoreAllMocks();
    });

    it('should throw on invalid options', () => {
      expect(() => {
        // @ts-ignore - testing invalid types
        new SharePlugin({
          shared: 'not-an-object',
        });
      }).toThrow();

      expect(() => {
        // @ts-ignore - testing invalid types
        new SharePlugin({
          shareScope: 123,
          shared: { react: '^17.0.0' },
        });
      }).toThrow();
    });
  });

  describe('environment variable setting', () => {
    let mockCompiler;
    let originalEnv;

    beforeEach(() => {
      mockCompiler = createMockCompiler();
      ConsumeSharedPluginMock.mockClear();
      ProvideSharedPluginMock.mockClear();

      // Save original environment variable
      originalEnv = process.env['FEDERATION_WEBPACK_PATH'];
      // Clear environment variable for testing
      delete process.env['FEDERATION_WEBPACK_PATH'];
    });

    afterEach(() => {
      // Restore environment variable
      if (originalEnv) {
        process.env['FEDERATION_WEBPACK_PATH'] = originalEnv;
      } else {
        delete process.env['FEDERATION_WEBPACK_PATH'];
      }
    });

    it('should set FEDERATION_WEBPACK_PATH environment variable', () => {
      const plugin = new SharePlugin({
        shared: {
          react: '^17.0.0',
        },
      });

      plugin.apply(mockCompiler);

      // Should set environment variable
      expect(process.env['FEDERATION_WEBPACK_PATH']).toBe(
        'mocked-webpack-path',
      );

      // Should call getWebpackPath
      expect(getWebpackPath).toHaveBeenCalledWith(mockCompiler);
    });

    it('should not override existing FEDERATION_WEBPACK_PATH environment variable', () => {
      // Set environment variable
      process.env['FEDERATION_WEBPACK_PATH'] = 'existing-path';

      const plugin = new SharePlugin({
        shared: {
          react: '^17.0.0',
        },
      });

      plugin.apply(mockCompiler);

      // Should not change environment variable
      expect(process.env['FEDERATION_WEBPACK_PATH']).toBe('existing-path');
    });
  });

  describe('property transformation', () => {
    let mockCompiler;

    beforeEach(() => {
      mockCompiler = createMockCompiler();
      ConsumeSharedPluginMock.mockClear();
      ProvideSharedPluginMock.mockClear();
    });

    it('should transform all properties from SharedConfig to ConsumesConfig with exclude', () => {
      const sharedConfig = {
        import: './path/to/module',
        shareKey: 'customKey',
        shareScope: 'customScope',
        requiredVersion: '^1.0.0',
        strictVersion: true,
        singleton: true,
        packageName: 'my-package',
        eager: true,
        version: '1.0.0',
        issuerLayer: 'issuerLayer',
        layer: 'layer',
        request: 'custom-request',
        exclude: { version: '^0.9.0' },
      };

      const plugin = new SharePlugin({
        shared: {
          react: sharedConfig,
        },
      });

      plugin.apply(mockCompiler);

      // Check ConsumeSharedPlugin properties
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const reactConsume = consumeOptions.consumes.find(
        (consume) => Object.keys(consume)[0] === 'react',
      );

      // All expected properties should be passed through
      expect(reactConsume.react).toMatchObject({
        import: sharedConfig.import,
        shareKey: sharedConfig.shareKey,
        shareScope: sharedConfig.shareScope,
        requiredVersion: sharedConfig.requiredVersion,
        strictVersion: sharedConfig.strictVersion,
        singleton: sharedConfig.singleton,
        packageName: sharedConfig.packageName,
        eager: sharedConfig.eager,
        issuerLayer: sharedConfig.issuerLayer,
        layer: sharedConfig.layer,
        request: sharedConfig.request,
        exclude: sharedConfig.exclude,
      });
    });

    it('should transform all properties from SharedConfig to ConsumesConfig with include', () => {
      const sharedConfig = {
        import: './path/to/module',
        shareKey: 'customKey',
        shareScope: 'customScope',
        requiredVersion: '^1.0.0',
        strictVersion: true,
        singleton: true,
        packageName: 'my-package',
        eager: true,
        version: '1.0.0',
        issuerLayer: 'issuerLayer',
        layer: 'layer',
        request: 'custom-request',
        include: { version: '^1.0.0' },
      };

      const plugin = new SharePlugin({
        shared: {
          react: sharedConfig,
        },
      });

      plugin.apply(mockCompiler);

      // Check ConsumeSharedPlugin properties
      expect(ConsumeSharedPluginMock).toHaveBeenCalledTimes(1);
      const consumeOptions = ConsumeSharedPluginMock.mock.calls[0][0];
      const reactConsume = consumeOptions.consumes.find(
        (consume) => Object.keys(consume)[0] === 'react',
      );

      // All expected properties should be passed through
      expect(reactConsume.react).toMatchObject({
        import: sharedConfig.import,
        shareKey: sharedConfig.shareKey,
        shareScope: sharedConfig.shareScope,
        requiredVersion: sharedConfig.requiredVersion,
        strictVersion: sharedConfig.strictVersion,
        singleton: sharedConfig.singleton,
        packageName: sharedConfig.packageName,
        eager: sharedConfig.eager,
        issuerLayer: sharedConfig.issuerLayer,
        layer: sharedConfig.layer,
        request: sharedConfig.request,
        include: sharedConfig.include,
      });
    });

    it('should transform all properties from SharedConfig to ProvidesConfig with exclude', () => {
      const sharedConfig = {
        import: './path/to/module',
        shareKey: 'customKey',
        shareScope: 'customScope',
        version: '1.0.0',
        eager: true,
        requiredVersion: '^1.0.0',
        strictVersion: true,
        singleton: true,
        layer: 'layer',
        request: 'custom-request',
        exclude: { version: '^0.9.0' },
      };

      const plugin = new SharePlugin({
        shared: {
          react: sharedConfig,
        },
      });

      plugin.apply(mockCompiler);

      // Check ProvideSharedPlugin properties
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      const reactProvide = provideOptions.provides.find(
        (provide) => Object.keys(provide)[0] === './path/to/module',
      );

      // All expected properties should be passed through
      expect(reactProvide['./path/to/module']).toMatchObject({
        shareKey: sharedConfig.shareKey,
        shareScope: sharedConfig.shareScope,
        version: sharedConfig.version,
        eager: sharedConfig.eager,
        requiredVersion: sharedConfig.requiredVersion,
        strictVersion: sharedConfig.strictVersion,
        singleton: sharedConfig.singleton,
        layer: sharedConfig.layer,
        request: sharedConfig.request,
        exclude: sharedConfig.exclude,
      });
    });

    it('should transform all properties from SharedConfig to ProvidesConfig with include', () => {
      const sharedConfig = {
        import: './path/to/module',
        shareKey: 'customKey',
        shareScope: 'customScope',
        version: '1.0.0',
        eager: true,
        requiredVersion: '^1.0.0',
        strictVersion: true,
        singleton: true,
        layer: 'layer',
        request: 'custom-request',
        include: { version: '^1.0.0' },
      };

      const plugin = new SharePlugin({
        shared: {
          react: sharedConfig,
        },
      });

      plugin.apply(mockCompiler);

      // Check ProvideSharedPlugin properties
      expect(ProvideSharedPluginMock).toHaveBeenCalledTimes(1);
      const provideOptions = ProvideSharedPluginMock.mock.calls[0][0];
      const reactProvide = provideOptions.provides.find(
        (provide) => Object.keys(provide)[0] === './path/to/module',
      );

      // All expected properties should be passed through
      expect(reactProvide['./path/to/module']).toMatchObject({
        shareKey: sharedConfig.shareKey,
        shareScope: sharedConfig.shareScope,
        version: sharedConfig.version,
        eager: sharedConfig.eager,
        requiredVersion: sharedConfig.requiredVersion,
        strictVersion: sharedConfig.strictVersion,
        singleton: sharedConfig.singleton,
        layer: sharedConfig.layer,
        request: sharedConfig.request,
        include: sharedConfig.include,
      });
    });
  });
});
