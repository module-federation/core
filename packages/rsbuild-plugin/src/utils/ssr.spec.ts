import { afterEach, describe, it, expect, rs } from '@rstest/core';
import { createSSRMFConfig, patchSSRRspackConfig, SSR_DIR } from './ssr';
import type { Rspack } from '@rsbuild/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

const RECORD_DYNAMIC_REMOTE_ENTRY_HASH_PLUGIN_PATTERN =
  /record(?:-dynamic-remote-entry-hash-plugin|DynamicRemoteEntryHashPlugin)(\.js)?$/;

afterEach(() => {
  rs.unstubAllEnvs();
});

describe('createSSRMFConfig', () => {
  const baseMFConfig: moduleFederationPlugin.ModuleFederationPluginOptions = {
    name: 'testApp',
  };

  it('should correctly transform basic mfConfig for SSR', () => {
    const ssrMFConfig = createSSRMFConfig(baseMFConfig);
    expect(ssrMFConfig.name).toBe('testApp');
    expect(ssrMFConfig.library?.type).toBe('commonjs-module');
    expect(ssrMFConfig.library?.name).toBeUndefined();
    expect(ssrMFConfig.dts).toBe(false);
    expect(ssrMFConfig.dev).toBe(false);
    expect(ssrMFConfig.runtimePlugins).toHaveLength(1);
    expect(ssrMFConfig.runtimePlugins?.[0]).toMatch(/runtimePlugin(\.js)?$/);
  });

  it('should preserve a preconfigured library', () => {
    const mfConfigWithLibraryType: moduleFederationPlugin.ModuleFederationPluginOptions =
      {
        ...baseMFConfig,
        library: {
          name: 'customLibrary',
          type: 'umd',
        },
      };
    const ssrMFConfig = createSSRMFConfig(mfConfigWithLibraryType);
    expect(ssrMFConfig.library?.type).toBe('umd');
    expect(ssrMFConfig.library?.name).toBe('customLibrary');
  });

  it('should add record-dynamic-remote-entry-hash-plugin in development', () => {
    rs.stubEnv('NODE_ENV', 'development');
    const ssrMFConfig = createSSRMFConfig(baseMFConfig);
    expect(ssrMFConfig.runtimePlugins?.[0]).toMatch(/runtimePlugin(\.js)?$/);
    expect(ssrMFConfig.runtimePlugins?.[1]).toMatch(
      RECORD_DYNAMIC_REMOTE_ENTRY_HASH_PLUGIN_PATTERN,
    );
  });

  it('should not add record-dynamic-remote-entry-hash-plugin in production', () => {
    rs.stubEnv('NODE_ENV', 'production');
    const ssrMFConfig = createSSRMFConfig(baseMFConfig);
    expect(ssrMFConfig.runtimePlugins).toHaveLength(1);
    expect(ssrMFConfig.runtimePlugins?.[0]).toMatch(/runtimePlugin(\.js)?$/);
  });

  it('should initialize runtimePlugins if it is undefined', () => {
    rs.stubEnv('NODE_ENV', 'production');
    const mfConfigWithoutRuntimePlugins: moduleFederationPlugin.ModuleFederationPluginOptions =
      {
        name: 'testApp',
        runtimePlugins: undefined,
      };
    const ssrMFConfig = createSSRMFConfig(mfConfigWithoutRuntimePlugins);
    expect(ssrMFConfig.runtimePlugins).toHaveLength(1);
    expect(ssrMFConfig.runtimePlugins?.[0]).toMatch(/runtimePlugin(\.js)?$/);
  });
});

describe('patchSSRRspackConfig', () => {
  const baseConfig: Rspack.Configuration = {
    output: {
      publicPath: '/test/',
      chunkFilename: 'chunks/[name].js',
    },
    plugins: [],
  };

  const baseMfConfig: moduleFederationPlugin.ModuleFederationPluginOptions = {
    name: 'testApp',
  };

  it('should throw error if publicPath is not a string', () => {
    const config = JSON.parse(JSON.stringify(baseConfig));
    config.output.publicPath = undefined;
    expect(() => patchSSRRspackConfig(config, baseMfConfig, 'ssr')).toThrow(
      'publicPath must be string!',
    );
  });

  it('should normalize "auto" publicPath for SSR node output', () => {
    const config = JSON.parse(JSON.stringify(baseConfig));
    config.output.publicPath = 'auto';
    const patchedConfig = patchSSRRspackConfig(config, baseMfConfig, 'ssr');
    expect(patchedConfig.output?.publicPath).toBe('');
    expect(patchedConfig.target).toBe('async-node');
  });

  it('should update publicPath correctly', () => {
    const config = JSON.parse(JSON.stringify(baseConfig));
    const patchedConfig = patchSSRRspackConfig(config, baseMfConfig, 'ssr');
    expect(patchedConfig.output?.publicPath).toBe(`/test/${SSR_DIR}/`);
  });

  it('should set target to async-node', () => {
    const config = JSON.parse(JSON.stringify(baseConfig));
    const patchedConfig = patchSSRRspackConfig(config, baseMfConfig, 'ssr');
    expect(patchedConfig.target).toBe('async-node');
  });

  it('should add UniverseEntryChunkTrackerPlugin to plugins', () => {
    rs.stubEnv('NODE_ENV', 'development');
    const config = JSON.parse(JSON.stringify(baseConfig));
    const patchedConfig = patchSSRRspackConfig(config, baseMfConfig, 'ssr');
    expect(patchedConfig.plugins).toHaveLength(1);
    // @ts-expect-error default is a class
    expect(patchedConfig.plugins?.[0].constructor.name).toBe(
      'UniverseEntryChunkTrackerPlugin',
    );
  });

  describe('chunkFilename modification', () => {
    it('should modify chunkFilename when conditions are met (uniqueName from mfConfig.name)', () => {
      const config: Rspack.Configuration = {
        output: {
          publicPath: '/test/',
          chunkFilename: 'js/[name].js',
        },
        plugins: [],
      };
      const mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions = {
        name: 'myApp',
      };
      const patchedConfig = patchSSRRspackConfig(config, mfConfig, 'ssr');
      expect(patchedConfig.output?.chunkFilename).toBe('js/[name]myApp.js');
    });

    it('should modify chunkFilename when conditions are met (uniqueName from config.output.uniqueName)', () => {
      const config: Rspack.Configuration = {
        output: {
          publicPath: '/test/',
          chunkFilename: 'js/[name].js',
          uniqueName: 'myOutputUniqueName',
        },
        plugins: [],
      };
      const mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions = {}; // No name in mfConfig
      const patchedConfig = patchSSRRspackConfig(config, mfConfig, 'ssr');
      expect(patchedConfig.output?.chunkFilename).toBe(
        'js/[name]myOutputUniqueName.js',
      );
    });

    it('should not modify chunkFilename if chunkFilename is not a string', () => {
      const config: Rspack.Configuration = {
        output: {
          publicPath: '/test/',
          chunkFilename: () => 'test.js',
        },
        plugins: [],
      };
      const mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions = {
        name: 'myApp',
      };
      const patchedConfig = patchSSRRspackConfig(config, mfConfig, 'ssr');
      expect(typeof patchedConfig.output?.chunkFilename).toBe('function');
    });

    it('should not modify chunkFilename if uniqueName is not present', () => {
      const config: Rspack.Configuration = {
        output: {
          publicPath: '/test/',
          chunkFilename: 'js/[name].js',
        },
        plugins: [],
      };
      const mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions = {}; // No name
      const patchedConfig = patchSSRRspackConfig(config, mfConfig, 'ssr');
      expect(patchedConfig.output?.chunkFilename).toBe('js/[name].js');
    });

    it('should not modify chunkFilename if it already includes uniqueName', () => {
      const config: Rspack.Configuration = {
        output: {
          publicPath: '/test/',
          chunkFilename: 'js/myApp-[name].js',
          uniqueName: 'myApp',
        },
        plugins: [],
      };
      const mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions = {
        name: 'myApp',
      };
      const patchedConfig = patchSSRRspackConfig(config, mfConfig, 'ssr');
      expect(patchedConfig.output?.chunkFilename).toBe('js/myApp-[name].js');
    });
  });
});
