import { it, expect, describe } from 'vitest';
import { patchMFConfig } from './configPlugin';
import { getIPV4 } from './utils';
import path from 'path';

const resolvePluginPath = (
  request: string,
  workspaceRelativeFallback: string,
) => {
  try {
    return require.resolve(request);
  } catch {
    return path.resolve(process.cwd(), workspaceRelativeFallback);
  }
};

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
        resolvePluginPath(
          '@module-federation/modern-js/shared-strategy',
          'packages/modernjs/src/cli/mfRuntimePlugins/shared-strategy.ts',
        ),
        resolvePluginPath(
          '@module-federation/node/runtimePlugin',
          'packages/node/src/runtimePlugin.ts',
        ),
        resolvePluginPath(
          '@module-federation/modern-js/inject-node-fetch',
          'packages/modernjs/src/cli/mfRuntimePlugins/inject-node-fetch.ts',
        ),
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
        resolvePluginPath(
          '@module-federation/modern-js/shared-strategy',
          'packages/modernjs/src/cli/mfRuntimePlugins/shared-strategy.ts',
        ),
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
