import { LynxCacheEventsPlugin } from '@lynx-js/cache-events-webpack-plugin';
import { describe, expect, it, rs } from '@rstest/core';

import type { LynxModuleFederationAdapterOptions } from './plugin';
import { federationOptions, LAYERS, setupPlugin } from './plugin.testUtils';

describe('pluginLynxModuleFederation remote bundles', () => {
  it('requires the ReactLynx lazy export condition for split remotes', async () => {
    const resolve = rs.fn(async (request: string) =>
      request === '@lynx-js/react'
        ? '/virtual/react/runtime/lib/index.js'
        : '/virtual/react/runtime/lazy/import.js',
    );
    const { modifyBundlerChain } = setupPlugin(
      { name: 'catalog', exposes: { './Card': './src/Card' } },
      { remoteBundle: { target: 'lynx' } },
      LAYERS,
      { resolve },
    );

    await expect(modifyBundlerChain()).rejects.toThrow(
      'pluginReactLynx({ experimental_isLazyBundle: true })',
    );
    expect(resolve).toHaveBeenCalledTimes(2);
  });

  it('accepts host-backed ReactLynx lazy exports for split remotes', async () => {
    const resolve = rs.fn(async (request: string) =>
      request === '@lynx-js/react'
        ? '/virtual/react/runtime/lazy/react.js'
        : '/virtual/react/runtime/lazy/import.js',
    );
    const { modifyBundlerChain } = setupPlugin(
      { name: 'catalog', exposes: { './Card': './src/Card' } },
      { remoteBundle: { target: 'web' } },
      LAYERS,
      { resolve },
    );

    await expect(modifyBundlerChain('web')).resolves.toBeUndefined();
    expect(resolve).toHaveBeenCalledTimes(2);
  });

  it('allows split remotes from non-React Lynx DSL plugins', async () => {
    const { modifyBundlerChain } = setupPlugin(
      { name: 'catalog', exposes: { './Card': './src/Card' } },
      { remoteBundle: { target: 'lynx' } },
    );

    await expect(modifyBundlerChain()).resolves.toBeUndefined();
  });

  it.each([
    ['host builds', undefined, 'lynx'],
    [
      'native single remotes',
      { remoteBundle: { target: 'lynx', chunking: 'single' } },
      'lynx',
    ],
    [
      'unselected environments',
      { environment: 'web', remoteBundle: { target: 'web' } },
      'lynx',
    ],
  ] as const)(
    'skips ReactLynx lazy-export validation for %s',
    async (_name, adapterOptions, environment) => {
      const resolve = rs.fn(async () => {
        throw new Error('unexpected ReactLynx resolver call');
      });
      const { modifyBundlerChain } = setupPlugin(
        { name: 'catalog', exposes: { './Card': './src/Card' } },
        adapterOptions as LynxModuleFederationAdapterOptions | undefined,
        LAYERS,
        { resolve },
      );

      await expect(modifyBundlerChain(environment)).resolves.toBeUndefined();
      expect(resolve).not.toHaveBeenCalled();
    },
  );

  it('builds background and main-thread containers into one external bundle', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'catalog',
        exposes: { './Card': './src/Card' },
        shared: { react: { singleton: true } },
      },
      {
        remoteBundle: {
          target: 'web',
          filename: 'catalog-custom.lynx.bundle',
          engineVersion: '3.6',
        },
      },
    );
    const config = await modifyRspackConfig({ plugins: [] });
    const [federationPlugin, , collector] = config.plugins;
    const remoteOptions = federationOptions(federationPlugin);

    expect(remoteOptions).toMatchObject({
      name: 'catalog',
      shareScope: [
        `default:${LAYERS.BACKGROUND}`,
        `default:${LAYERS.MAIN_THREAD}`,
      ],
      filename: 'catalog.js',
      manifest: true,
      runtime: false,
      exposes: {
        './Card': {
          import: './src/Card',
          layer: LAYERS.BACKGROUND,
          name: 'catalog__background_Card',
        },
        './Card__main_thread': {
          import: './src/Card',
          layer: LAYERS.MAIN_THREAD,
          name: 'catalog__main-thread__Card-main-thread',
        },
      },
      shared: [
        {
          react: {
            singleton: true,
            layer: LAYERS.BACKGROUND,
            issuerLayer: LAYERS.BACKGROUND,
            shareScope: [`default:${LAYERS.BACKGROUND}`],
          },
        },
      ],
    });

    const encoder = config.plugins.find(
      (plugin: any) => plugin.options?.bundleFileName,
    ) as any;

    expect(config.plugins).toHaveLength(5);
    expect(encoder.options).toMatchObject({
      bundleFileName: 'catalog-custom.lynx.bundle',
      engineVersion: '3.6',
    });

    const PROCESS_ASSETS_STAGE_ADDITIONS = -100;
    const PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE = 400;
    const processAssets = new Map<number, () => void>();
    let onCompilation: ((compilation: any) => void) | undefined;
    collector.apply({
      webpack: {
        Compilation: {
          PROCESS_ASSETS_STAGE_ADDITIONS,
          PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        },
        sources: {
          ConcatSource: class {
            private readonly parts: Array<string | { source(): string }>;

            constructor(...parts: Array<string | { source(): string }>) {
              this.parts = parts;
            }

            source() {
              return this.parts
                .map((part) =>
                  typeof part === 'string' ? part : part.source(),
                )
                .join('');
            }
          },
        },
      },
      hooks: {
        thisCompilation: {
          tap(_name: string, callback: (compilation: any) => void) {
            onCompilation = callback;
          },
        },
      },
    } as any);
    const emitAsset = rs.fn();
    const updateAsset = rs.fn();
    const nestedBackgroundChunk = {
      name: 'nested-activity-metadata',
      files: new Set(['nested-activity-metadata.js']),
      layers: [LAYERS.BACKGROUND],
      getAllAsyncChunks: () => new Set(),
    };
    const compilation = {
      chunks: [
        {
          name: 'catalog',
          files: new Set(['catalog.js']),
          layers: [LAYERS.BACKGROUND, LAYERS.MAIN_THREAD],
          getAllAsyncChunks: () => new Set(),
        },
        {
          name: 'catalog__main-thread__Card',
          files: new Set([
            'catalog__main-thread__Card-main-thread.js',
            'styles.css',
          ]),
          layers: [LAYERS.MAIN_THREAD],
          getAllAsyncChunks: () => new Set(),
        },
        {
          name: 'catalog__background_Card',
          files: new Set(['catalog__background_Card.js']),
          layers: [LAYERS.BACKGROUND],
          getAllAsyncChunks: () => new Set([nestedBackgroundChunk]),
        },
        nestedBackgroundChunk,
      ],
      chunkGraph: {
        getChunkModulesIterable(chunk: { layers: string[] }) {
          return chunk.layers.map((layer) => ({ layer }));
        },
      },
      emitAsset,
      updateAsset,
      getAsset(name: string) {
        if (name === 'catalog.js') {
          return { source: { source: () => 'container' }, info: {} };
        }
        if (name === 'catalog__background_Card.js') {
          return {
            source: { source: () => 'exports.ids = ["card"];' },
            info: { minimized: true },
          };
        }
        if (name === 'nested-activity-metadata.js') {
          return {
            source: { source: () => 'exports.ids = ["metadata"];' },
            info: { minimized: true },
          };
        }
        return undefined;
      },
      hooks: {
        processAssets: {
          tap(options: { stage: number }, callback: () => void) {
            processAssets.set(options.stage, callback);
          },
        },
      },
    };
    onCompilation!(compilation);
    const backgroundIdentityStage = PROCESS_ASSETS_STAGE_ADDITIONS + 1;
    const pairedBundleChunksStage = PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 2;
    processAssets.get(backgroundIdentityStage)!();
    processAssets.get(pairedBundleChunksStage)!();

    expect([...processAssets.keys()]).toEqual([
      backgroundIdentityStage,
      pairedBundleChunksStage,
    ]);
    expect(updateAsset).toHaveBeenCalled();
    const backgroundSource = updateAsset.mock.calls[0][1].source();
    expect(backgroundSource).toContain(
      'exports.__lynx_dynamic_component_entry__ = globDynamicComponentEntry;',
    );
    expect(updateAsset).toHaveBeenCalledWith(
      'catalog__background_Card.js',
      expect.any(Object),
      { minimized: true },
    );
    expect(updateAsset).toHaveBeenCalledWith(
      'nested-activity-metadata.js',
      expect.any(Object),
      { minimized: true },
    );
    expect(
      encoder.options.stateStore.for(compilation).pairedBundleChunks,
    ).toEqual(
      new Set([
        'catalog__main-thread.js',
        'catalog__main-thread__Card-main-thread.js',
        'catalog__background_Card.js',
        'nested-activity-metadata.js',
      ]),
    );
    expect(emitAsset).toHaveBeenCalledWith(
      'catalog__main-thread.js',
      expect.any(Object),
      {},
    );
    const mainThreadContainerSource = emitAsset.mock.calls[0][1].source();
    expect(mainThreadContainerSource).toContain(
      'globalThis.processEvalResultByHost',
    );
    expect(mainThreadContainerSource).toContain('__webpack_require__.C(chunk)');
  });

  it('configures cache events through the public chain slot for remote bundles', async () => {
    const { bundlerPluginUses, modifyBundlerChain } = setupPlugin(
      { name: 'catalog', exposes: { './Card': './src/Card' } },
      { remoteBundle: { target: 'web' } },
    );

    await modifyBundlerChain('web');

    const cacheEventsUse = bundlerPluginUses.get('lynx:cache-events')!;
    expect(cacheEventsUse).toEqual([
      LynxCacheEventsPlugin,
      [{ setupListTransformer: expect.any(Function) }],
    ]);
    expect(cacheEventsUse[1][0].setupListTransformer(['event'])).toEqual([]);
  });

  it('replaces the late Rspeedy cache-events plugin for remote bundles', async () => {
    const { modifyRspackConfig } = setupPlugin(
      { name: 'catalog', exposes: { './Card': './src/Card' } },
      { remoteBundle: { target: 'web' } },
    );
    const original = new LynxCacheEventsPlugin();

    const config = await modifyRspackConfig({ plugins: [original] }, 'web');
    const configured = config.plugins.find(
      (plugin: unknown) => plugin instanceof LynxCacheEventsPlugin,
    ) as unknown as {
      options: { setupListTransformer(setups: string[]): string[] };
    };

    expect(configured).not.toBe(original);
    expect(configured.options.setupListTransformer(['event'])).toEqual([]);
  });

  it('does not override cache events for hosts', async () => {
    const { bundlerPluginUses, modifyBundlerChain } = setupPlugin({
      name: 'host',
      exposes: { './Card': './src/Card' },
    });

    await modifyBundlerChain('web');

    expect(bundlerPluginUses.has('lynx:cache-events')).toBe(false);
  });

  it('builds a paired native remote with the official TASM encoder', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'catalog',
        exposes: { './Card': './src/Card' },
        shared: { '@lynx-js/react': { singleton: true } },
      },
      {
        remoteBundle: {
          target: 'lynx',
          filename: 'catalog-native.lynx.bundle',
          engineVersion: '3.6',
        },
      },
    );
    const config = await modifyRspackConfig({ plugins: [] });
    const remoteOptions = federationOptions(config.plugins[0]);
    const encoder = config.plugins.find(
      (plugin: any) => plugin.options?.bundleFileName,
    ) as any;

    expect(config.plugins).toHaveLength(5);
    expect(remoteOptions).toMatchObject({
      name: 'catalog',
      shareScope: [
        `default:${LAYERS.BACKGROUND}`,
        `default:${LAYERS.MAIN_THREAD}`,
      ],
      filename: 'catalog.js',
      manifest: true,
      runtime: false,
      exposes: {
        './Card': {
          import: './src/Card',
          layer: LAYERS.BACKGROUND,
          name: 'catalog__background_Card',
        },
        './Card__main_thread': {
          import: './src/Card',
          layer: LAYERS.MAIN_THREAD,
          name: 'catalog__main-thread__Card-main-thread',
        },
      },
      shared: [
        {
          '@lynx-js/react': {
            singleton: true,
            layer: LAYERS.BACKGROUND,
            issuerLayer: LAYERS.BACKGROUND,
            shareScope: [`default:${LAYERS.BACKGROUND}`],
          },
        },
      ],
    });
    expect(encoder.options).toMatchObject({
      bundleFileName: 'catalog-native.lynx.bundle',
      engineVersion: '3.6',
      entryAssets: ['catalog.js', 'catalog__main-thread.js'],
      stateStore: { for: expect.any(Function) },
    });
    expect(encoder.options.encode).toBeTypeOf('function');
    const { buffer } = await encoder.options.encode({
      compilerOptions: {
        enableFiberArch: true,
        useLepusNG: true,
        targetSdkVersion: '3.5',
        enableCSSInvalidation: true,
        enableCSSSelector: true,
      },
      sourceContent: { appType: 'DynamicComponent' },
      customSections: {
        catalog: {
          content: 'module.exports = { get() {}, init() {} };',
        },
      },
    });
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.byteLength).toBeGreaterThan(100);
  });

  it('derives paired chunk suffixes from custom DSL layers', async () => {
    const customLayers = {
      BACKGROUND: 'worker:realm',
      MAIN_THREAD: 'ui:realm',
    };
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'catalog',
        exposes: { './Card': './src/Card' },
      },
      { remoteBundle: { target: 'lynx' } },
      customLayers,
    );

    const config = await modifyRspackConfig({ plugins: [] });
    expect(federationOptions(config.plugins[0]).exposes).toMatchObject({
      './Card': {
        layer: customLayers.BACKGROUND,
        name: 'catalog__background_Card',
      },
      './Card__main_thread': {
        layer: customLayers.MAIN_THREAD,
        name: 'catalog__main-thread__Card-ui__realm',
      },
    });
  });

  it('inherits a custom top-level share scope for remote bundle shares', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'catalog',
        exposes: { './data': './src/data' },
        shareScope: 'application',
        shared: { state: { singleton: true } },
      },
      { remoteBundle: { target: 'lynx', chunking: 'single' } },
    );
    const config = await modifyRspackConfig({ plugins: [] });
    const remoteOptions = federationOptions(config.plugins[0]);

    expect(remoteOptions.shareScope).toEqual([
      `application:${LAYERS.BACKGROUND}`,
    ]);
    expect(remoteOptions.shared).toEqual([
      {
        state: {
          singleton: true,
          layer: LAYERS.BACKGROUND,
          issuerLayer: LAYERS.BACKGROUND,
          shareScope: [`application:${LAYERS.BACKGROUND}`],
        },
      },
    ]);
  });

  it('keeps native single bundles background-only', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'catalog',
        exposes: { './data': './src/data' },
        shared: { state: { singleton: true } },
      },
      { remoteBundle: { target: 'lynx', chunking: 'single' } },
    );
    const config = await modifyRspackConfig({ plugins: [] });
    const remoteOptions = federationOptions(config.plugins[0]);

    expect(config.plugins).toHaveLength(4);
    expect(remoteOptions.shareScope).toEqual([`default:${LAYERS.BACKGROUND}`]);
    expect(remoteOptions.exposes).toEqual({
      './data': {
        import: './src/data',
        layer: LAYERS.BACKGROUND,
        name: 'catalog__background_data',
      },
    });
    expect(remoteOptions.shared).toEqual([
      {
        state: {
          singleton: true,
          layer: LAYERS.BACKGROUND,
          issuerLayer: LAYERS.BACKGROUND,
          shareScope: [`default:${LAYERS.BACKGROUND}`],
        },
      },
    ]);
  });

  it('rejects main-thread shares in native single bundles', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'catalog',
        exposes: { './data': './src/data' },
        shared: {
          state: { realm: 'main-thread', singleton: true },
        },
      },
      { remoteBundle: { target: 'lynx', chunking: 'single' } },
    );

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(
      `shared module "state" uses inactive realm layer "${LAYERS.MAIN_THREAD}"`,
    );
  });

  it('preserves manifest file customization', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'catalog',
        exposes: { './Card': './src/Card' },
        manifest: {
          fileName: 'catalog-manifest.json',
        },
      },
      {
        remoteBundle: {
          target: 'web',
          filename: 'catalog.lynx.bundle',
        },
      },
    );
    const config = await modifyRspackConfig({ plugins: [] });
    const remoteOptions = federationOptions(config.plugins[0]);
    expect(remoteOptions.manifest).toEqual({
      fileName: 'catalog-manifest.json',
    });
    expect(config.plugins).toHaveLength(5);
  });

  it.each([
    ['catalog', 'catalog'],
    ['@scope/catalog', '@scope_catalog'],
    ['teams\\catalog', 'teams_catalog'],
    ['catalog?blue', 'catalog_blue'],
    ['catalog#blue', 'catalog_blue'],
    ['teams:catalog', 'teams_catalog'],
    ['___catalog___', 'catalog'],
    ['___', 'remote'],
    ['CON', '_CON'],
  ])(
    'derives safe remote bundle artifacts from federation name %s',
    async (name, outputName) => {
      const { modifyRspackConfig } = setupPlugin(
        { name, exposes: { './Card': './src/Card' } },
        { remoteBundle: { target: 'web' } },
      );
      const config = await modifyRspackConfig({ plugins: [] });
      const remoteOptions = federationOptions(config.plugins[0]);
      const encoder = config.plugins.find(
        (plugin: any) => plugin.options?.bundleFileName,
      ) as any;

      expect(remoteOptions).toMatchObject({
        name,
        filename: `${outputName}.js`,
      });
      expect(encoder.options).toMatchObject({
        bundleFileName: `${outputName}.lynx.bundle`,
        entryAssets: [`${outputName}.js`, `${outputName}__main-thread.js`],
        includedChunkPrefixes: [
          `${outputName}__background_`,
          `${outputName}__main-thread__`,
        ],
      });
    },
  );

  it('rejects nested remote bundle filenames', async () => {
    const { modifyRspackConfig } = setupPlugin(
      { name: 'catalog', exposes: { './Card': './src/Card' } },
      {
        remoteBundle: {
          target: 'web',
          filename: 'remotes/catalog.lynx.bundle',
        },
      },
    );

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(
      'must be a basename without path separators',
    );
  });

  it.each([
    [
      {
        name: 'catalog',
        exposes: { './Card': './src/Card' },
        filename: 'x.js',
      },
      'remove `options.filename`',
    ],
    [
      { name: 'catalog', exposes: { './Card': './src/Card' }, runtime: 'x' },
      'remove `options.runtime`',
    ],
    [
      {
        name: 'catalog',
        exposes: { './Card': './src/Card' },
        manifest: false,
      },
      'requires the Module Federation manifest',
    ],
    [
      {
        name: 'catalog',
        exposes: {
          './Card': { import: './src/Card', layer: LAYERS.MAIN_THREAD },
        },
      },
      'owns expose layers',
    ],
    [
      {
        name: 'catalog',
        exposes: {
          './Card__main_thread': './src/Card',
        },
      },
      'reserves expose keys ending in "__main_thread"',
    ],
  ])('rejects conflicting remote bundle options', async (options, message) => {
    const { modifyRspackConfig } = setupPlugin(options as any, {
      remoteBundle: { target: 'web' },
    });

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(message);
  });

  it('reserves internal main-thread expose keys for native remotes', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'catalog',
        exposes: { './Card__main_thread': './src/Card' },
      },
      { remoteBundle: { target: 'lynx' } },
    );

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(
      'reserves expose keys ending in "__main_thread"',
    );
  });

  it('requires exposes for a remote bundle', async () => {
    const { modifyRspackConfig } = setupPlugin(
      { name: 'catalog' },
      { remoteBundle: { target: 'web' } },
    );

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(
      'requires at least one expose',
    );
  });

  it('rejects expose keys that collide after chunk-name sanitization', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'catalog',
        exposes: {
          './profile/card': './src/Card',
          './profile?card': './src/OtherCard',
        },
      },
      { remoteBundle: { target: 'web' } },
    );

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(
      'both map to chunk name "profile_card"',
    );
  });

  it('rejects unknown remote bundle targets', async () => {
    const { modifyRspackConfig } = setupPlugin(
      { name: 'catalog', exposes: { './Card': './src/Card' } },
      {
        remoteBundle: { target: 'native' } as any,
      },
    );

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(
      'must be either `"lynx"` or `"web"`',
    );
  });

  it('rejects atomic web bundles because exposures require paired lazy roots', async () => {
    const { modifyRspackConfig } = setupPlugin(
      { name: 'catalog', exposes: { './Card': './src/Card' } },
      {
        remoteBundle: { target: 'web', chunking: 'single' } as any,
      },
    );

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(
      'one external bundle has only one main-thread root',
    );
  });

  it('rejects remote bundle filenames that the runtime cannot recognize', async () => {
    const { modifyRspackConfig } = setupPlugin(
      { name: 'catalog', exposes: { './Card': './src/Card' } },
      {
        remoteBundle: { target: 'web', filename: 'catalog.bin' },
      },
    );

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(
      'must end with `.lynx.bundle`',
    );
  });

  it('rejects remote bundle library types that contradict the manifest', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'catalog',
        exposes: { './Card': './src/Card' },
        library: { type: 'module' },
      },
      { remoteBundle: { target: 'web' } },
    );

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(
      'requires `library.type: "commonjs-module"`',
    );
  });
});
