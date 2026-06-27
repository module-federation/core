import { it, expect, describe, vi, afterEach } from 'vitest';
import {
  moduleFederationConfigPlugin,
  patchBundlerConfig,
  patchMFConfig,
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
    config: vi.fn((callback) => {
      configCallbacks.push(callback);
    }),
    getConfig: vi.fn(() => modernjsConfig),
    modifyBundlerChain: vi.fn(),
  } as any);

  return configCallbacks[0]();
};

const createBundlerChain = (splitChunkConfig: Record<string, unknown>): any => {
  const outputValues = new Map<string, unknown>();
  const fallback = {
    set: vi.fn(() => fallback),
  };

  return {
    get: vi.fn((key: string) => (key === 'ignoreWarnings' ? [] : undefined)),
    ignoreWarnings: vi.fn(),
    optimization: {
      delete: vi.fn(),
      splitChunks: {
        entries: vi.fn(() => splitChunkConfig),
      },
      usedExports: vi.fn(),
    },
    output: {
      chunkFilename: vi.fn(),
      chunkLoadingGlobal: vi.fn((value: string) => {
        outputValues.set('chunkLoadingGlobal', value);
      }),
      get: vi.fn((key: string) => outputValues.get(key)),
      publicPath: vi.fn(),
      uniqueName: vi.fn((value: string) => {
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
  vi.restoreAllMocks();
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
    'splitChunks.chunks = async is not allowed with stream SSR mode, it will auto changed to "async"';

  it.each([
    { chunks: 'async', warns: false },
    { chunks: 'all', warns: true },
  ])(
    'normalizes stream SSR splitChunks from $chunks and warns: $warns',
    ({ chunks, warns }) => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
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
});

describe('moduleFederationConfigPlugin', async () => {
  it('disables lazyCompilation when the project is a producer', async () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
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
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
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
