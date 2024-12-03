import { it, expect, describe } from 'vitest';
import { patchMFConfig, patchBundlerConfig, getIPV4 } from './utils';

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
describe('patchMFConfig', async () => {
  it('patchMFConfig: server', async () => {
    const patchedConfig = JSON.parse(JSON.stringify(mfConfig));
    patchMFConfig(patchedConfig, true);
    const ipv4 = getIPV4();

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
        remote: `http://${ipv4}:3000/remoteEntry.js`,
      },
      remoteType: 'script',
      runtimePlugins: [
        require.resolve('@module-federation/modern-js/shared-strategy'),
        require.resolve('@module-federation/node/runtimePlugin'),
        require.resolve('@module-federation/modern-js/inject-node-fetch'),
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
    const ipv4 = getIPV4();

    expect(patchedConfig).toStrictEqual({
      filename: 'remoteEntry.js',
      name: 'host',
      remotes: {
        remote: `http://${ipv4}:3000/remoteEntry.js`,
      },
      remoteType: 'script',
      runtimePlugins: [
        require.resolve('@module-federation/modern-js/shared-strategy'),
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
          runtimePkgs: ['@modern-js/runtime/mf'],
        },
      },
    });
  });
});

describe('patchBundlerConfig', async () => {
  it('patchBundlerConfig: server', async () => {
    const bundlerConfig = {
      output: {
        publicPath: 'auto',
      },
    };
    patchBundlerConfig<'webpack'>({
      bundlerType: 'webpack',
      bundlerConfig,
      isServer: true,
      modernjsConfig: {
        server: {
          ssr: {
            mode: 'stream',
          },
        },
      },
      mfConfig,
    });

    const expectedConfig = {
      output: {
        chunkLoadingGlobal: 'chunk_host',
        publicPath: 'auto',
        uniqueName: 'host',
      },
    };
    // @ts-ignore temp ignore

    delete bundlerConfig?.ignoreWarnings;
    // patchIgnoreWarning(expectedConfig as BundlerConfig<'webpack'>);
    expect(bundlerConfig).toStrictEqual(expectedConfig);
  });

  it('patchBundlerConfig: client', async () => {
    const bundlerConfig = {
      output: {
        publicPath: 'auto',
      },
    };
    patchBundlerConfig<'webpack'>({
      bundlerType: 'webpack',
      bundlerConfig,
      isServer: false,
      modernjsConfig: {
        server: {
          ssr: {
            mode: 'stream',
          },
        },
      },
      mfConfig,
    });

    const expectedConfig = {
      output: {
        chunkLoadingGlobal: 'chunk_host',
        publicPath: 'auto',
        uniqueName: 'host',
      },
    };
    // @ts-ignore temp ignore
    delete bundlerConfig?.ignoreWarnings;

    // patchIgnoreWarning(expectedConfig as BundlerConfig<'webpack'>);
    expect(bundlerConfig).toStrictEqual(expectedConfig);
  });
});
