import { it, expect, describe, rs, afterEach } from '@rstest/core';
import {
  moduleFederationConfigPlugin,
  patchBundlerConfig,
  patchMFConfig,
  setDefaultOptimizationTarget,
} from './configPlugin';
import logger from '../logger';

const mfConfig = {
  name: 'host',
  filename: 'remoteEntry.js',
  remotes: {
    remote: 'http://localhost:3000/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
  },
};

const getModernJsConfig = async (
  moduleFederationConfig: Record<string, unknown>,
  modernjsConfig: Record<string, unknown> = {},
) => {
  const configCallbacks: Array<() => unknown> = [];
  const plugin = moduleFederationConfigPlugin({
    originPluginOptions: {
      config: moduleFederationConfig,
    },
    userConfig: {},
  } as any);

  await plugin.setup!({
    config: rs.fn((callback) => {
      configCallbacks.push(callback);
    }),
    getConfig: rs.fn(() => modernjsConfig),
    modifyBundlerChain: rs.fn(),
  } as any);

  return configCallbacks[0]();
};

const createBundlerChain = (splitChunkConfig: Record<string, unknown>): any => {
  const outputValues = new Map<string, unknown>();
  const fallback = {
    set: rs.fn(() => fallback),
  };

  return {
    get: rs.fn((key: string) => (key === 'ignoreWarnings' ? [] : undefined)),
    ignoreWarnings: rs.fn(),
    optimization: {
      delete: rs.fn(),
      splitChunks: {
        entries: rs.fn(() => splitChunkConfig),
      },
      usedExports: rs.fn(),
    },
    output: {
      chunkFilename: rs.fn(),
      chunkLoadingGlobal: rs.fn((value: string) => {
        outputValues.set('chunkLoadingGlobal', value);
      }),
      get: rs.fn((key: string) => outputValues.get(key)),
      publicPath: rs.fn(),
      uniqueName: rs.fn((value: string) => {
        outputValues.set('uniqueName', value);
      }),
    },
    resolve: {
      fallback,
    },
  };
};

const patchClientBundlerConfig = (
  splitChunkConfig: Record<string, unknown>,
) => {
  patchBundlerConfig({
    chain: createBundlerChain(splitChunkConfig),
    enableSSR: true,
    isServer: false,
    modernjsConfig: {},
    mfConfig: {
      name: 'host',
    },
  } as any);
};

afterEach(() => {
  rs.restoreAllMocks();
});

describe('patchMFConfig', async () => {
  it('patchMFConfig: server', async () => {
    const patchedConfig = JSON.parse(JSON.stringify(mfConfig));
    patchMFConfig(patchedConfig, true);

    expect(patchedConfig).toStrictEqual({
      dev: false,
      dts: false,
      filename: 'remoteEntry.js',
      library: {
        name: 'host',
        type: 'commonjs-module',
      },
      name: 'host',
      remotes: {
        remote: `http://localhost:3000/remoteEntry.js`,
      },
      remoteType: 'script',
      runtimePlugins: [
        require.resolve('@module-federation/modern-js-v3/shared-strategy'),
        require.resolve('@module-federation/node/runtimePlugin'),
        require.resolve('@module-federation/modern-js-v3/inject-node-fetch'),
      ],
      shared: {
        react: {
          eager: true,
          singleton: true,
        },
        'react-dom': {
          eager: true,
          singleton: true,
        },
      },
    });
  });

  it('patchMFConfig: client', async () => {
    const patchedConfig = JSON.parse(JSON.stringify(mfConfig));
    patchMFConfig(patchedConfig, false);

    expect(patchedConfig).toStrictEqual({
      filename: 'remoteEntry.js',
      name: 'host',
      remotes: {
        remote: `http://localhost:3000/remoteEntry.js`,
      },
      remoteType: 'script',
      runtimePlugins: [
        require.resolve('@module-federation/modern-js-v3/shared-strategy'),
      ],
      shared: {
        react: {
          eager: true,
          singleton: true,
        },
        'react-dom': {
          eager: true,
          singleton: true,
        },
      },
      dts: {
        consumeTypes: {
          runtimePkgs: ['@module-federation/modern-js-v3/runtime'],
        },
      },
    });
  });
});

describe('patchBundlerConfig', () => {
  const warning =
    'Stream SSR requires async-only splitChunks; constraining chunk filters to async chunks';

  it.each([
    { chunks: undefined, warns: false },
    { chunks: 'async', warns: false },
    { chunks: 'all', warns: true },
    { chunks: 'initial', warns: true },
  ])(
    'normalizes stream SSR splitChunks from $chunks and warns: $warns',
    ({ chunks, warns }) => {
      const warnSpy = rs.spyOn(logger, 'warn').mockImplementation(() => {});
      const splitChunkConfig = {
        cacheGroups: {
          vendors: {},
        },
        chunks,
      };

      patchClientBundlerConfig(splitChunkConfig);

      expect(splitChunkConfig.chunks).toBe('async');
      if (warns) {
        expect(warnSpy).toHaveBeenCalledWith(warning);
      } else {
        expect(warnSpy).not.toHaveBeenCalledWith(warning);
      }
    },
  );

  it('normalizes stream SSR cache group chunks', () => {
    const warnSpy = rs.spyOn(logger, 'warn').mockImplementation(() => {});
    const splitChunkConfig = {
      cacheGroups: {
        vendors: {
          chunks: 'all',
        },
      },
      chunks: 'async',
    };

    patchClientBundlerConfig(splitChunkConfig);

    expect(splitChunkConfig.chunks).toBe('async');
    expect(splitChunkConfig.cacheGroups.vendors.chunks).toBe('async');
    expect(warnSpy).toHaveBeenCalledWith(warning);
  });

  it('normalizes stream SSR fallback cache group chunks', () => {
    const warnSpy = rs.spyOn(logger, 'warn').mockImplementation(() => {});
    const splitChunkConfig = {
      cacheGroups: {
        vendors: {},
      },
      chunks: 'async',
      fallbackCacheGroup: {
        chunks: 'initial',
      },
    };

    patchClientBundlerConfig(splitChunkConfig);

    expect(splitChunkConfig.chunks).toBe('async');
    expect(splitChunkConfig.fallbackCacheGroup.chunks).toBe('async');
    expect(warnSpy).toHaveBeenCalledWith(warning);
  });

  it('restricts function chunk filters to async chunks while preserving their selection', () => {
    const warnSpy = rs.spyOn(logger, 'warn').mockImplementation(() => {});
    const splitChunks = rs.fn(
      (chunk: { name: string }) => chunk.name === 'selected',
    );
    const cacheGroupChunks = rs.fn(
      (chunk: { name: string }) => chunk.name === 'selected',
    );
    const fallbackCacheGroupChunks = rs.fn(
      (chunk: { name: string }) => chunk.name === 'selected',
    );
    const splitChunkConfig = {
      cacheGroups: {
        vendors: {
          chunks: cacheGroupChunks,
        },
      },
      chunks: splitChunks,
      fallbackCacheGroup: {
        chunks: fallbackCacheGroupChunks,
      },
    };

    patchClientBundlerConfig(splitChunkConfig);

    const initialChunk = {
      name: 'selected',
      canBeInitial: () => true,
      isOnlyInitial: () => true,
    };
    const mixedChunk = {
      name: 'selected',
      canBeInitial: () => true,
      isOnlyInitial: () => false,
    };
    const selectedAsyncChunk = {
      name: 'selected',
      canBeInitial: () => false,
      isOnlyInitial: () => false,
    };
    const unselectedAsyncChunk = {
      ...selectedAsyncChunk,
      name: 'unselected',
    };

    for (const [filter, original] of [
      [splitChunkConfig.chunks, splitChunks],
      [splitChunkConfig.cacheGroups.vendors.chunks, cacheGroupChunks],
      [splitChunkConfig.fallbackCacheGroup.chunks, fallbackCacheGroupChunks],
    ]) {
      expect(original).not.toHaveBeenCalled();
      expect(filter(initialChunk)).toBe(false);
      expect(filter(mixedChunk)).toBe(false);
      expect(original).not.toHaveBeenCalled();
      expect(filter(selectedAsyncChunk)).toBe(true);
      expect(filter(unselectedAsyncChunk)).toBe(false);
      expect(original).toHaveBeenCalledTimes(2);
      expect(original).toHaveBeenNthCalledWith(1, selectedAsyncChunk);
      expect(original).toHaveBeenNthCalledWith(2, unselectedAsyncChunk);
    }
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(warning);
  });

  it.each([
    { enableSSR: false, isServer: false },
    { enableSSR: true, isServer: true },
  ])(
    'preserves function filters outside browser SSR: %j',
    ({ enableSSR, isServer }) => {
      const warnSpy = rs.spyOn(logger, 'warn').mockImplementation(() => {});
      const chunks = rs.fn(() => true);
      const splitChunkConfig = {
        chunks,
        cacheGroups: { vendors: { chunks } },
        fallbackCacheGroup: { chunks },
      };

      patchBundlerConfig({
        chain: createBundlerChain(splitChunkConfig),
        enableSSR,
        isServer,
        modernjsConfig: {},
        mfConfig: { name: 'host' },
      } as any);

      expect(splitChunkConfig.chunks).toBe(chunks);
      expect(splitChunkConfig.cacheGroups.vendors.chunks).toBe(chunks);
      expect(splitChunkConfig.fallbackCacheGroup.chunks).toBe(chunks);
      expect(warnSpy).not.toHaveBeenCalled();
    },
  );
});

describe('setDefaultOptimizationTarget', () => {
  it('defaults to web when SSR is disabled', () => {
    const config = { name: 'host' };

    setDefaultOptimizationTarget(config, false, false);

    expect(config).toMatchObject({
      experiments: { optimization: { target: 'web' } },
    });
  });

  it('defaults to web for the browser target when SSR is enabled', () => {
    const config = { name: 'host' };

    setDefaultOptimizationTarget(config, true, false);

    expect(config).toMatchObject({
      experiments: { optimization: { target: 'web' } },
    });
  });

  it('defaults to node for the server target when SSR is enabled', () => {
    const config = { name: 'host' };

    setDefaultOptimizationTarget(config, true, true);

    expect(config).toMatchObject({
      experiments: { optimization: { target: 'node' } },
    });
  });

  it('preserves an explicitly configured target', () => {
    const config = {
      name: 'host',
      experiments: { optimization: { target: 'web' as const } },
    };

    setDefaultOptimizationTarget(config, true, true);

    expect(config.experiments.optimization.target).toBe('web');
  });

  it('does not set a target when autoOptimization is disabled', () => {
    const config = { name: 'host' };

    setDefaultOptimizationTarget(config, true, true, false);

    expect(config).toStrictEqual({ name: 'host' });
  });
});

describe('moduleFederationConfigPlugin', async () => {
  it('disables lazyCompilation when the project is a producer', async () => {
    const warnSpy = rs.spyOn(logger, 'warn').mockImplementation(() => {});
    const modernJsConfig = await getModernJsConfig(
      {
        name: 'remote',
        exposes: {
          './Button': './src/Button',
        },
      },
      {
        tools: {
          devServer: {
            headers: {},
          },
        },
      },
    );

    expect(modernJsConfig).toMatchObject({
      dev: {
        assetPrefix: 'auto',
        lazyCompilation: false,
      },
    });
    expect(warnSpy).toHaveBeenCalledWith(
      'Detected exposes in the Module Federation config. The Modern.js v3 Module Federation plugin will set dev.lazyCompilation to false for producer apps.',
    );
  });

  it('keeps lazyCompilation unchanged when the project is not a producer', async () => {
    const warnSpy = rs.spyOn(logger, 'warn').mockImplementation(() => {});
    const modernJsConfig = await getModernJsConfig(
      {
        name: 'host',
        remotes: {
          remote: 'http://localhost:3000/remoteEntry.js',
        },
      },
      {
        dev: {
          assetPrefix: 'http://localhost:3001/',
          lazyCompilation: true,
        },
      },
    );

    expect(modernJsConfig).toMatchObject({
      dev: {
        assetPrefix: 'http://localhost:3001/',
        lazyCompilation: true,
      },
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
