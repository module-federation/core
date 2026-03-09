/*
 * @rstest-environment node
 */

import {
  ProvideSharedPlugin,
  shareScopes,
  testProvides,
  createTestConfig,
} from '../plugin-test-utils';

type ProvideFilterConfig = {
  version?: string;
  request?: string | RegExp;
  fallbackVersion?: string;
};

type ProvideConfig = {
  shareScope?: string | string[];
  shareKey?: string;
  version?: string;
  singleton?: boolean;
  eager?: boolean;
  include?: ProvideFilterConfig;
  exclude?: ProvideFilterConfig;
  layer?: string;
  allowNodeModulesSuffixMatch?: boolean;
  import?: string;
} & Record<string, unknown>;

type ProvideEntry = [string, ProvideConfig];

describe('ProvideSharedPlugin', () => {
  describe('constructor', () => {
    it('should initialize with string shareScope', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: {
            shareKey: 'react',
            shareScope: shareScopes.string,
            version: '17.0.2',
            eager: false,
          },
          lodash: {
            version: '4.17.21',
            singleton: true,
          },
        },
      });

      // Test private property is set correctly
      const provides = (plugin as unknown as { _provides: ProvideEntry[] })
        ._provides;
      expect(provides.length).toBe(2);

      // Check that provides are correctly set
      const reactEntry = provides.find(([key]) => key === 'react');
      const lodashEntry = provides.find(([key]) => key === 'lodash');

      expect(reactEntry).toBeDefined();
      expect(lodashEntry).toBeDefined();

      // Check first provide config
      const [, reactConfig] = reactEntry!;
      expect(reactConfig.shareScope).toBe(shareScopes.string);
      expect(reactConfig.version).toBe('17.0.2');
      expect(reactConfig.eager).toBe(false);

      // Check second provide config (should inherit shareScope)
      const [, lodashConfig] = lodashEntry!;
      expect(lodashConfig.shareScope).toBe(shareScopes.string);
      expect(lodashConfig.version).toBe('4.17.21');
      expect(lodashConfig.singleton).toBe(true);
    });

    it('should initialize with array shareScope', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.array,
        provides: {
          react: {
            version: '17.0.2',
          },
        },
      });

      const provides = (plugin as unknown as { _provides: ProvideEntry[] })
        ._provides;
      const [, config] = provides[0];

      expect(config.shareScope).toEqual(shareScopes.array);
    });

    it('should handle shorthand provides syntax', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          react: '17.0.2', // Shorthand syntax
        },
      });

      const provides = (plugin as unknown as { _provides: ProvideEntry[] })
        ._provides;
      const [key, config] = provides[0];

      // In ProvideSharedPlugin's implementation, for shorthand syntax like 'react: "17.0.2"':
      // - The key correctly becomes 'react'
      // - But shareKey becomes the version string ('17.0.2')
      // - And version becomes undefined
      expect(key).toBe('react');
      expect(config.shareKey).toBe('17.0.2');
      expect(config.version).toBeUndefined();
    });

    it('should handle complex provides configuration', () => {
      const plugin = new ProvideSharedPlugin(createTestConfig());

      const provides = (plugin as unknown as { _provides: ProvideEntry[] })
        ._provides;
      expect(provides.length).toBe(3);

      // Verify all entries are processed correctly
      const reactEntry = provides.find(([key]) => key === 'react');
      const lodashEntry = provides.find(([key]) => key === 'lodash');
      const vueEntry = provides.find(([key]) => key === 'vue');

      expect(reactEntry).toBeDefined();
      expect(lodashEntry).toBeDefined();
      expect(vueEntry).toBeDefined();
    });

    it('should handle empty provides', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {},
      });

      const provides = (plugin as unknown as { _provides: ProvideEntry[] })
        ._provides;
      expect(provides.length).toBe(0);
    });

    it('should normalize provides configurations', () => {
      const plugin = new ProvideSharedPlugin({
        shareScope: shareScopes.string,
        provides: {
          // Test various configuration formats
          'simple-version': '1.0.0',
          'with-config': {
            version: '2.0.0',
            singleton: true,
          },
          'with-layers': {
            version: '3.0.0',
            layer: 'client',
          },
          'with-filters': {
            version: '4.0.0',
            include: { version: '^4.0.0' },
            exclude: { request: /test/ },
          },
        },
      });

      const provides = (plugin as unknown as { _provides: ProvideEntry[] })
        ._provides;
      expect(provides.length).toBe(4);

      // Verify all configurations are preserved
      const withFiltersEntry = provides.find(([key]) => key === 'with-filters');
      expect(withFiltersEntry).toBeDefined();
      const [, withFiltersConfig] = withFiltersEntry!;
      expect(withFiltersConfig.include).toEqual({ version: '^4.0.0' });
      expect(withFiltersConfig.exclude).toEqual({ request: /test/ });
    });
  });
});
