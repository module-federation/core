import { it, expect, describe } from '@rstest/core';
import { patchMFConfig, setDefaultOptimizationTarget } from './configPlugin';
import { getIPV4 } from './utils';

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

    expect(patchedConfig).toStrictEqual({
      filename: 'remoteEntry.js',
      name: 'host',
      remotes: {
        remote: `http://localhost:3000/remoteEntry.js`,
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
          runtimePkgs: ['@module-federation/modern-js/runtime'],
        },
      },
    });
  });
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
