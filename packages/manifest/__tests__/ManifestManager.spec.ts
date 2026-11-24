import type { Stats, StatsShared } from '@module-federation/sdk';
import type { Compilation, Compiler } from 'webpack';

jest.mock(
  '@module-federation/dts-plugin/core',
  () => ({
    isTSProject: () => false,
    retrieveTypesAssetsInfo: () => ({}) as const,
  }),
  { virtual: true },
);

import { ManifestManager } from '../src/ManifestManager';

const sharedEntry = (overrides: Partial<StatsShared>): StatsShared => ({
  id: 'host:react',
  name: 'react',
  version: '18.3.1',
  singleton: true,
  requiredVersion: '^18.0.0',
  hash: '',
  assets: {
    js: { async: [], sync: [] },
    css: { async: [], sync: [] },
  },
  deps: [],
  usedIn: [],
  usedExports: [],
  fallback: '',
  fallbackName: '',
  fallbackType: 'global',
  ...overrides,
});

describe('ManifestManager', () => {
  it('copies the share scope of each shared entry into the manifest', () => {
    const stats = {
      id: 'host',
      name: 'host',
      metaData: {
        name: 'host',
        globalName: 'host',
        buildInfo: { buildVersion: '1.0.0', buildName: 'host' },
        remoteEntry: { name: 'remoteEntry.js', path: '', type: 'global' },
        types: { path: '', name: '', api: '', zip: '' },
        publicPath: 'auto',
      },
      shared: [
        sharedEntry({ shareScope: 'default' }),
        sharedEntry({
          id: 'host:react@legacy',
          version: '17.0.2',
          shareScope: 'legacy',
        }),
        sharedEntry({
          id: 'host:react-dom',
          name: 'react-dom',
          shareScope: ['default', 'custom'],
        }),
      ],
      remotes: [],
      exposes: [],
    } as unknown as Stats;

    const manager = new ManifestManager();
    manager.init({ name: 'host' });
    const manifest = manager.generateManifest({
      stats,
      publicPath: 'auto',
      bundler: 'rspack',
      compilation: {} as Compilation,
      compiler: { options: {} } as Compiler,
    });

    expect(
      manifest.shared.map(({ name, version, shareScope }) => ({
        name,
        version,
        shareScope,
      })),
    ).toEqual([
      { name: 'react', version: '18.3.1', shareScope: 'default' },
      { name: 'react', version: '17.0.2', shareScope: 'legacy' },
      {
        name: 'react-dom',
        version: '18.3.1',
        shareScope: ['default', 'custom'],
      },
    ]);
  });
});
