import { describe, it, expect, vi } from 'vitest';
import { createSSRMFConfig, patchSSRRspackConfig, SSR_DIR } from './ssr'; // Assuming SSR_DIR is exported or mockable
import type { Rspack } from '@rsbuild/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

describe('createSSRMFConfig', () => {
  const baseMFConfig: moduleFederationPlugin.ModuleFederationPluginOptions = {
    name: 'testApp',
  };

  it('should correctly transform basic mfConfig for SSR', () => {
    const ssrMFConfig = createSSRMFConfig(baseMFConfig);
    expect(ssrMFConfig.name).toBe('testApp');
    expect(ssrMFConfig.library?.type).toBe('commonjs-module');
    expect(ssrMFConfig.dts).toBe(false);
    expect(ssrMFConfig.dev).toBe(false);
    expect(ssrMFConfig.runtimePlugins).toEqual([
      require.resolve('@module-federation/node/runtimePlugin'),
    ]);
  });

  it('should preserve library.type if already defined', () => {
    const mfConfigWithLibraryType: moduleFederationPlugin.ModuleFederationPluginOptions =
      {
        ...baseMFConfig,
        library: {
          name: 'testApp',
          type: 'umd',
        },
      };
    const ssrMFConfig = createSSRMFConfig(mfConfigWithLibraryType);
    expect(ssrMFConfig.library?.type).toBe('umd');
  });

  it('should add record-dynamic-remote-entry-hash-plugin in development', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const ssrMFConfig = createSSRMFConfig(baseMFConfig);
    expect(ssrMFConfig.runtimePlugins).toContain(
      require.resolve('@module-federation/node/runtimePlugin'),
    );
    expect(ssrMFConfig.runtimePlugins).toContain(
      require.resolve(
        '@module-federation/node/record-dynamic-remote-entry-hash-plugin',
      ),
    );
    process.env.NODE_ENV = originalNodeEnv; // Restore original NODE_ENV
  });

  it('should not add record-dynamic-remote-entry-hash-plugin in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const ssrMFConfig = createSSRMFConfig(baseMFConfig);
    expect(ssrMFConfig.runtimePlugins).toEqual([
      require.resolve('@module-federation/node/runtimePlugin'),
    ]);
    process.env.NODE_ENV = originalNodeEnv; // Restore original NODE_ENV
  });

  it('should initialize runtimePlugins if it is undefined', () => {
    const mfConfigWithoutRuntimePlugins: moduleFederationPlugin.ModuleFederationPluginOptions =
      {
        name: 'testApp',
        runtimePlugins: undefined,
      };
    const ssrMFConfig = createSSRMFConfig(mfConfigWithoutRuntimePlugins);
    expect(ssrMFConfig.runtimePlugins).toEqual([
      require.resolve('@module-federation/node/runtimePlugin'),
    ]);
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
    expect(() => patchSSRRspackConfig(config, baseMfConfig)).toThrow(
      'publicPath must be string!',
    );
  });

  it('should throw error if publicPath is "auto"', () => {
    const config = JSON.parse(JSON.stringify(baseConfig));
    config.output.publicPath = 'auto';
    expect(() => patchSSRRspackConfig(config, baseMfConfig)).toThrow(
      'publicPath can not be "auto"!',
    );
  });

  it('should update publicPath correctly', () => {
    const config = JSON.parse(JSON.stringify(baseConfig));
    const patchedConfig = patchSSRRspackConfig(config, baseMfConfig);
    expect(patchedConfig.output?.publicPath).toBe(`/test/${SSR_DIR}/`);
  });

  it('should set target to async-node', () => {
    const config = JSON.parse(JSON.stringify(baseConfig));
    const patchedConfig = patchSSRRspackConfig(config, baseMfConfig);
    expect(patchedConfig.target).toBe('async-node');
  });

  it('should add UniverseEntryChunkTrackerPlugin to plugins', () => {
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const config = JSON.parse(JSON.stringify(baseConfig));
    const patchedConfig = patchSSRRspackConfig(config, baseMfConfig);
    expect(patchedConfig.plugins).toHaveLength(1);
    // @ts-expect-error default is a class
    expect(patchedConfig.plugins?.[0].constructor.name).toBe(
      'UniverseEntryChunkTrackerPlugin',
    );
    process.env.NODE_ENV = env;
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
      const patchedConfig = patchSSRRspackConfig(config, mfConfig);
      expect(patchedConfig.output?.chunkFilename).toBe(
        'js/[name]myApp-[chunkhash].js',
      );
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
      const patchedConfig = patchSSRRspackConfig(config, mfConfig);
      expect(patchedConfig.output?.chunkFilename).toBe(
        'js/[name]myOutputUniqueName-[chunkhash].js',
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
      const patchedConfig = patchSSRRspackConfig(config, mfConfig);
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
      const patchedConfig = patchSSRRspackConfig(config, mfConfig);
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
      const patchedConfig = patchSSRRspackConfig(config, mfConfig);
      expect(patchedConfig.output?.chunkFilename).toBe('js/myApp-[name].js');
    });
  });
});
