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
});
