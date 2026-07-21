import type { Stats, moduleFederationPlugin } from '@module-federation/sdk';
import type { Compiler } from 'webpack';

jest.mock(
  '@module-federation/dts-plugin/core',
  () => ({
    isTSProject: () => false,
    retrieveTypesAssetsInfo: () => ({}) as const,
  }),
  { virtual: true },
);

jest.mock(
  '@module-federation/managers',
  () => ({
    ContainerManager: class {
      init() {}
    },
    RemoteManager: class {
      init() {}
    },
    SharedManager: class {
      init() {}
    },
    PKGJsonManager: class {},
    UNKNOWN_MODULE_NAME: 'unknown',
    utils: {},
  }),
  { virtual: true },
);

import { StatsManager } from '../src/StatsManager';

describe('StatsManager', () => {
  it.each([
    {
      description:
        'reconciles pre-emitted Rspack metadata to the configured ESM library type',
      library: { type: 'module' },
      emittedType: 'global',
      expectedType: 'module',
    },
    {
      description:
        'preserves pre-emitted Rspack metadata without a configured library type',
      library: undefined,
      emittedType: 'system',
      expectedType: 'system',
    },
  ] as const)('$description', ({ library, emittedType, expectedType }) => {
    const manager = new StatsManager();
    manager.init(
      {
        name: 'esm_remote',
        library,
        exposes: { './App': './src/App' },
      } as moduleFederationPlugin.ModuleFederationPluginOptions,
      { pluginVersion: 'test', bundler: 'rspack' },
    );
    const stats = {
      id: 'esm_remote',
      name: 'esm_remote',
      metaData: {
        name: 'esm_remote',
        globalName: 'esm_remote',
        buildInfo: { buildVersion: '1.0.0', buildName: 'esm_remote' },
        remoteEntry: {
          name: 'remoteEntry.mjs',
          path: '',
          type: emittedType,
        },
        types: { path: '', name: '', api: '', zip: '' },
        pluginVersion: 'test',
      },
      exposes: [],
      shared: [],
      remotes: [],
    } as unknown as Stats;
    const compiler = {
      context: process.cwd(),
      options: { output: { publicPath: 'auto' } },
    } as unknown as Compiler;

    const updated = manager.updateStats(stats, compiler);

    expect(updated.metaData.remoteEntry.type).toBe(expectedType);
  });
});
