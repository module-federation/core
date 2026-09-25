import { describe, expect, it, rs } from '@rstest/core';

import {
  createLynxRemoteManifestPlugin,
  retargetRemoteEntry,
} from './remoteManifest';

const createManifest = () => ({
  id: 'catalog',
  metaData: {
    remoteEntry: {
      path: 'static/js/',
      name: 'catalog.js',
      type: 'global',
      extra: 'preserved',
    },
  },
  exposes: [
    {
      name: 'Card',
      requiredShared: [{ name: 'react' }],
      assets: {
        js: { sync: ['static/Card.js'], async: ['static/vendor.js'] },
        css: { sync: ['static/Card.css'], async: [] },
      },
    },
    {
      name: 'Card__main_thread',
      path: './Card__main_thread',
      assets: {
        js: { sync: ['static/Card.main.js'], async: [] },
        css: { sync: [], async: [] },
      },
    },
  ],
});

describe('Lynx remote manifest', () => {
  it('retargets the public remote entry to the external bundle', () => {
    const result = JSON.parse(
      retargetRemoteEntry(
        JSON.stringify(createManifest()),
        'mf-manifest.json',
        'remotes/catalog.lynx.bundle',
      ),
    );

    expect(result).toMatchObject({
      id: 'catalog',
      metaData: {
        remoteEntry: {
          path: 'remotes/',
          name: 'catalog.lynx.bundle',
          type: 'lynx',
          extra: 'preserved',
        },
      },
      exposes: [
        {
          name: 'Card',
          requiredShared: [{ name: 'react' }],
          assets: {
            js: { sync: [], async: [] },
            css: { sync: [], async: [] },
          },
        },
      ],
    });
  });

  it('does not advertise external bundle sections as browser assets', () => {
    const manifest = createManifest();
    const result = JSON.parse(
      retargetRemoteEntry(
        JSON.stringify(manifest),
        'mf-manifest.json',
        'catalog.lynx.bundle',
      ),
    );

    expect(result.exposes[0].assets).toEqual({
      js: { sync: [], async: [] },
      css: { sync: [], async: [] },
    });
    expect(result.exposes).toHaveLength(1);
    expect(manifest.exposes[0].assets.js.sync).toEqual(['static/Card.js']);
  });

  it.each([
    ['not JSON', 'could not parse'],
    [JSON.stringify({ metaData: {} }), 'has no metaData.remoteEntry'],
  ])('rejects an invalid generated asset', (source, message) => {
    expect(() =>
      retargetRemoteEntry(source, 'mf-manifest.json', 'catalog.lynx.bundle'),
    ).toThrow(message);
  });

  it('rewrites configured manifest and stats assets after generation', () => {
    const plugin = createLynxRemoteManifestPlugin(
      { filePath: 'metadata', fileName: 'catalog-manifest.json' },
      'catalog.lynx.bundle',
    );
    let rewriteAssets: (() => void) | undefined;
    const updateAsset = rs.fn();
    const compiler = {
      webpack: {
        Compilation: { PROCESS_ASSETS_STAGE_REPORT: 5_000 },
        sources: {
          RawSource: class {
            constructor(readonly value: string) {}
          },
        },
      },
      hooks: {
        emit: {
          tap(_name: string, callback: (compilation: any) => void) {
            rewriteAssets = () => callback(compilation);
          },
        },
      },
    };
    const source = JSON.stringify(createManifest());
    const compilation = {
      getAsset(name: string) {
        return [
          'metadata/catalog-manifest.json',
          'metadata/catalog-manifest-stats.json',
        ].includes(name)
          ? { source: { source: () => source } }
          : undefined;
      },
      updateAsset,
    };
    plugin.apply(compiler as any);
    rewriteAssets!();

    expect(updateAsset).toHaveBeenCalledTimes(2);
    expect(updateAsset.mock.calls.map((call) => call[0])).toEqual([
      'metadata/catalog-manifest.json',
      'metadata/catalog-manifest-stats.json',
    ]);
    for (const call of updateAsset.mock.calls) {
      expect(JSON.parse(call[1].value)).toMatchObject({
        metaData: {
          remoteEntry: {
            path: '',
            name: 'catalog.lynx.bundle',
            type: 'lynx',
          },
        },
      });
    }
  });
});
