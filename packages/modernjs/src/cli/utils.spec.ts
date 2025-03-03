import { it, expect, describe } from 'vitest';
import { patchMFConfig, getIPV4 } from './utils';

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
