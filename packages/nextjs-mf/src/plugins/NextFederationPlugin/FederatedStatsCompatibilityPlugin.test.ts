import type { Compiler } from 'webpack';
import type { Manifest } from '@module-federation/sdk';
import {
  createFederatedStats,
  FederatedStatsCompatibilityPlugin,
} from './FederatedStatsCompatibilityPlugin';

const manifest = {
  id: 'shop',
  name: 'shop',
  metaData: {
    name: 'shop',
    type: 'app',
    buildInfo: { buildVersion: '1.0.0', buildName: 'shop' },
    globalName: 'shop',
    publicPath: 'auto',
    remoteEntry: {
      path: 'static/chunks',
      name: 'remoteEntry.js',
      type: 'window',
    },
    types: { path: '', name: '', zip: '', api: '' },
  },
  shared: [],
  remotes: [],
  exposes: [
    {
      id: 'shop:Button',
      name: 'Button',
      path: './Button',
      assets: {
        js: { sync: ['static/chunks/button.js'], async: ['lazy.js'] },
        css: { sync: ['static/css/button.css'], async: ['lazy.css'] },
      },
    },
  ],
} satisfies Manifest;

describe('FederatedStatsCompatibilityPlugin', () => {
  it('creates the expose fields consumed by legacy flushChunks', () => {
    expect(createFederatedStats(manifest)).toEqual({
      sharedModules: [],
      federatedModules: [
        {
          remote: 'shop',
          entry: 'static/chunks/remoteEntry.js',
          sharedModules: [],
          exposes: {
            './Button': ['static/chunks/button.js', 'static/css/button.css'],
          },
          remoteModules: {},
        },
      ],
    });
  });

  it('reads a custom manifest asset and emits both legacy filenames', () => {
    let compilationHandler: ((compilation: any) => void) | undefined;
    let assetsHandler: (() => void) | undefined;
    let processAssetsOptions: Record<string, unknown> | undefined;
    const emitted = new Map<string, { source: () => string }>();
    const rawManifest = JSON.stringify(manifest);
    emitted.set('server/federated-stats.json', {
      source: () => 'stale',
    });
    const compilation = {
      hooks: {
        processAssets: {
          tap: (options: Record<string, unknown>, handler: () => void) => {
            processAssetsOptions = options;
            assetsHandler = handler;
          },
        },
      },
      getAsset: jest.fn((filename: string) => {
        if (filename === 'meta/custom.json') {
          return { source: { source: () => rawManifest } };
        }
        return emitted.get(filename);
      }),
      emitAsset: jest.fn((filename: string, source: { source: () => string }) =>
        emitted.set(filename, source),
      ),
      updateAsset: jest.fn(
        (filename: string, source: { source: () => string }) =>
          emitted.set(filename, source),
      ),
    };
    const compiler = {
      hooks: {
        thisCompilation: {
          tap: (_name: string, handler: (compilation: any) => void) => {
            compilationHandler = handler;
          },
        },
      },
      webpack: {
        Compilation: { PROCESS_ASSETS_STAGE_REPORT: 5000 },
        sources: {
          RawSource: class {
            constructor(private readonly value: string) {}
            source() {
              return this.value;
            }
          },
        },
      },
    } as unknown as Compiler;

    new FederatedStatsCompatibilityPlugin({
      filenames: [
        'static/chunks/federated-stats.json',
        'server/federated-stats.json',
      ],
      manifest: { filePath: 'meta', fileName: 'custom' },
    }).apply(compiler);
    compilationHandler?.(compilation);
    assetsHandler?.();

    expect(processAssetsOptions).toEqual({
      name: 'FederatedStatsCompatibilityPlugin',
      stage: 5000,
    });
    expect(compilation.getAsset).toHaveBeenCalledWith('meta/custom.json');
    expect(compilation.emitAsset).toHaveBeenCalledTimes(1);
    expect(compilation.updateAsset).toHaveBeenCalledTimes(1);
    expect(Array.from(emitted)).toHaveLength(2);
    expect(
      JSON.parse(emitted.get('server/federated-stats.json')!.source()),
    ).toEqual(createFederatedStats(manifest));
  });

  it('fails the build instead of omitting the compatibility asset', () => {
    let compilationHandler: ((compilation: any) => void) | undefined;
    let assetsHandler: (() => void) | undefined;
    const compilation = {
      hooks: {
        processAssets: {
          tap: (_options: unknown, handler: () => void) => {
            assetsHandler = handler;
          },
        },
      },
      getAsset: jest.fn(),
    };
    const compiler = {
      hooks: {
        thisCompilation: {
          tap: (_name: string, handler: (compilation: any) => void) => {
            compilationHandler = handler;
          },
        },
      },
      webpack: {
        Compilation: { PROCESS_ASSETS_STAGE_REPORT: 5000 },
      },
    } as unknown as Compiler;

    new FederatedStatsCompatibilityPlugin({
      filenames: ['federated-stats.json'],
      manifest: true,
    }).apply(compiler);
    compilationHandler?.(compilation);

    expect(assetsHandler).toThrow(
      'Cannot emit federated-stats.json because mf-manifest.json was not generated',
    );
  });
});
