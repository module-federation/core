import { describe, expect, it, rs } from '@rstest/core';
import { LynxCacheEventsPlugin } from '@lynx-js/cache-events-webpack-plugin';

import {
  LYNX_RUNTIME_PLUGIN,
  normalizeLynxExposes,
  normalizeLynxShared,
  pluginLynxModuleFederation,
} from './plugin';
import type {
  LynxModuleFederationAdapterOptions,
  LynxModuleFederationOptions,
} from './plugin';

const LAYERS = {
  BACKGROUND: 'background',
  MAIN_THREAD: 'main-thread',
};

type ModifyRspackConfig = (config: any, context: any) => any;
type ModifyEnvironmentConfig = (config: any, context: any) => any;

const setupPlugin = (
  options: LynxModuleFederationOptions,
  adapterOptions?: LynxModuleFederationAdapterOptions,
  layers: unknown = LAYERS,
) => {
  let modifyRspackConfig: ModifyRspackConfig | undefined;
  let modifyEnvironmentConfigCallback: ModifyEnvironmentConfig | undefined;
  const modifyEnvironmentConfig = rs.fn((callback: ModifyEnvironmentConfig) => {
    modifyEnvironmentConfigCallback = callback;
  });
  const plugin = pluginLynxModuleFederation(options, adapterOptions);

  plugin.setup!({
    modifyEnvironmentConfig,
    modifyRspackConfig(callback: ModifyRspackConfig) {
      modifyRspackConfig = callback;
    },
    useExposed(symbol: symbol) {
      return symbol === Symbol.for('LAYERS') ? layers : undefined;
    },
  } as any);

  return {
    modifyEnvironmentConfig,
    applyEnvironmentConfig: (config: any, environment = 'lynx') =>
      modifyEnvironmentConfigCallback!(config, { name: environment }),
    modifyRspackConfig: (config: any, environment = 'lynx') =>
      modifyRspackConfig!(config, { environment: { name: environment } }),
  };
};

const federationOptions = (plugin: unknown) => (plugin as any)._options;

describe('pluginLynxModuleFederation', () => {
  it('defaults exposes and shared modules to the background layer', () => {
    expect(
      normalizeLynxExposes(
        {
          './Button': './src/Button',
          './Card': {
            import: './src/Card',
            layer: 'custom-layer',
          },
        },
        LAYERS.BACKGROUND,
      ),
    ).toEqual({
      './Button': { import: './src/Button', layer: LAYERS.BACKGROUND },
      './Card': { import: './src/Card', layer: 'custom-layer' },
    });

    expect(
      normalizeLynxShared(
        {
          react: '^19.0.0',
          '@lynx-js/react': {
            singleton: true,
            layer: 'custom-layer',
          },
        },
        LAYERS.BACKGROUND,
      ),
    ).toEqual({
      react: {
        import: 'react',
        requiredVersion: '^19.0.0',
        layer: LAYERS.BACKGROUND,
        issuerLayer: LAYERS.BACKGROUND,
      },
      '@lynx-js/react': {
        singleton: true,
        layer: 'custom-layer',
        issuerLayer: LAYERS.BACKGROUND,
      },
    });
  });

  it('preserves duplicate shared array entries and explicit layers', () => {
    expect(
      normalizeLynxShared(
        [
          { react: '^19.0.0' },
          {
            react: {
              singleton: true,
              layer: 'provided-layer',
              issuerLayer: 'consumer-layer',
            },
          },
        ],
        LAYERS.BACKGROUND,
      ),
    ).toEqual([
      {
        react: {
          import: 'react',
          requiredVersion: '^19.0.0',
          layer: LAYERS.BACKGROUND,
          issuerLayer: LAYERS.BACKGROUND,
        },
      },
      {
        react: {
          singleton: true,
          layer: 'provided-layer',
          issuerLayer: 'consumer-layer',
        },
      },
    ]);
  });

  it('installs the Rspack plugin with Lynx output and layer defaults', async () => {
    const { modifyEnvironmentConfig, modifyRspackConfig } = setupPlugin({
      name: 'lynx_host',
      exposes: { './App': './src/App' },
      runtimePlugins: ['custom-runtime-plugin'],
    });
    const config = await modifyRspackConfig({ plugins: [] });
    const federationPlugin = config.plugins[0];

    expect(config.output).toEqual({
      chunkLoading: 'lynx',
      chunkFormat: 'commonjs',
      iife: false,
      uniqueName: 'lynx_host',
    });
    expect(config.experiments.layers).toBe(true);
    expect(federationOptions(federationPlugin)).toMatchObject({
      name: 'lynx_host',
      filename: 'remoteEntry.js',
      library: { type: 'commonjs-module' },
      remoteType: 'script',
      runtimePlugins: ['custom-runtime-plugin', LYNX_RUNTIME_PLUGIN],
      exposes: {
        './App': { import: './src/App', layer: LAYERS.BACKGROUND },
      },
    });
    expect(modifyEnvironmentConfig).toHaveBeenCalledTimes(1);
  });

  it('keeps unqualified host shares in the background realm', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        remotes: { catalog: 'catalog@catalog.lynx.bundle' },
        shared: [{ react: '^19.0.0' }, { react: { singleton: true } }],
        runtimePlugins: ['custom-runtime-plugin'],
      },
      {
        mainThread: true,
        runtimePluginOptions: { timeout: 2_000 },
      },
    );
    const config = await modifyRspackConfig({ plugins: [] });

    expect(config.plugins).toHaveLength(2);
    expect(federationOptions(config.plugins[0])).toMatchObject({
      name: 'lynx_host',
      shareScope: [
        `default:${LAYERS.BACKGROUND}`,
        `default:${LAYERS.MAIN_THREAD}`,
      ],
      runtimePlugins: [
        ['custom-runtime-plugin', {}],
        [LYNX_RUNTIME_PLUGIN, { timeout: 2_000 }],
      ],
      shared: [
        {
          react: {
            import: 'react',
            requiredVersion: '^19.0.0',
            layer: LAYERS.BACKGROUND,
            issuerLayer: LAYERS.BACKGROUND,
            shareScope: [`default:${LAYERS.BACKGROUND}`],
          },
        },
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
  });

  it('maps semantic shared realms to exposed Lynx layers', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        shared: {
          'main-thread-state': {
            realm: 'main-thread',
            singleton: true,
          },
        },
      },
      { mainThread: true },
    );
    const config = await modifyRspackConfig({ plugins: [] });

    expect(federationOptions(config.plugins[0]).shared).toEqual([
      {
        'main-thread-state': {
          singleton: true,
          layer: LAYERS.MAIN_THREAD,
          issuerLayer: LAYERS.MAIN_THREAD,
          shareScope: [`default:${LAYERS.MAIN_THREAD}`],
        },
      },
    ]);
  });

  it('does not duplicate an explicitly issuer-layered shared entry', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        shared: {
          react: {
            layer: LAYERS.MAIN_THREAD,
            issuerLayer: LAYERS.MAIN_THREAD,
          },
        },
      },
      { mainThread: true },
    );
    const config = await modifyRspackConfig({ plugins: [] });

    expect(federationOptions(config.plugins[0]).shared).toEqual([
      {
        react: {
          layer: LAYERS.MAIN_THREAD,
          issuerLayer: LAYERS.MAIN_THREAD,
          shareScope: [`default:${LAYERS.MAIN_THREAD}`],
        },
      },
    ]);
  });

  it('does not duplicate an explicit entry beside a default shared entry', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        shared: {
          react: {
            layer: LAYERS.MAIN_THREAD,
            issuerLayer: LAYERS.MAIN_THREAD,
          },
          lodash: { singleton: true },
        },
      },
      { mainThread: true },
    );
    const config = await modifyRspackConfig({ plugins: [] });

    expect(federationOptions(config.plugins[0]).shared).toEqual([
      {
        react: {
          layer: LAYERS.MAIN_THREAD,
          issuerLayer: LAYERS.MAIN_THREAD,
          shareScope: [`default:${LAYERS.MAIN_THREAD}`],
        },
        lodash: {
          singleton: true,
          layer: LAYERS.BACKGROUND,
          issuerLayer: LAYERS.BACKGROUND,
          shareScope: [`default:${LAYERS.BACKGROUND}`],
        },
      },
    ]);
  });

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
          name: 'catalog__main-thread__Card',
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

    let collectAssets: (() => void) | undefined;
    let processAssetsStage: number | undefined;
    let onCompilation: ((compilation: any) => void) | undefined;
    collector.apply({
      webpack: {
        Compilation: { PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE: 400 },
        sources: { ConcatSource: class {} },
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
    onCompilation!({
      chunks: [
        {
          files: new Set(['catalog.js']),
          layers: [LAYERS.BACKGROUND, LAYERS.MAIN_THREAD],
        },
        {
          files: new Set(['catalog__main-thread__Card.js', 'styles.css']),
          layers: [LAYERS.MAIN_THREAD],
        },
        {
          files: new Set(['catalog__background_Card.js']),
          layers: [LAYERS.BACKGROUND],
        },
      ],
      chunkGraph: {
        getChunkModulesIterable(chunk: { layers: string[] }) {
          return chunk.layers.map((layer) => ({ layer }));
        },
      },
      emitAsset,
      getAsset(name: string) {
        return name === 'catalog.js'
          ? { source: { source: () => 'container' }, info: {} }
          : undefined;
      },
      hooks: {
        processAssets: {
          tap(options: { stage: number }, callback: () => void) {
            processAssetsStage = options.stage;
            collectAssets = callback;
          },
        },
      },
    });
    collectAssets!();

    expect(processAssetsStage).toBe(402);
    expect(encoder.options.mainThreadChunks).toEqual([
      'catalog__main-thread.js',
      'catalog__main-thread__Card.js',
    ]);
    expect(emitAsset).toHaveBeenCalledWith(
      'catalog__main-thread.js',
      expect.any(Object),
      {},
    );
  });

  it('disables app event caching in external remote entry runtimes', async () => {
    const original = new LynxCacheEventsPlugin({ existing: true });
    const { modifyRspackConfig } = setupPlugin(
      { name: 'catalog', exposes: { './Card': './src/Card' } },
      { remoteBundle: { target: 'web' } },
    );
    const config = await modifyRspackConfig({ plugins: [original] }, 'web');
    const replacement = config.plugins[0] as LynxCacheEventsPlugin & {
      options: Record<string, unknown>;
    };

    expect(replacement).toBeInstanceOf(LynxCacheEventsPlugin);
    expect(replacement).not.toBe(original);
    expect(replacement.options.existing).toBe(true);
    expect(replacement.options.setupListTransformer).toEqual(
      expect.any(Function),
    );
    expect(
      (replacement.options.setupListTransformer as () => unknown[])(),
    ).toEqual([]);
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
          name: 'catalog__main-thread__Card',
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
      entryAssets: ['catalog.js'],
      mainThreadChunks: [],
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
    expect(remoteOptions.exposes).toEqual({
      './data': {
        import: './src/data',
        layer: LAYERS.BACKGROUND,
        name: 'catalog__background_data',
      },
    });
    expect(remoteOptions.shared).toEqual({
      state: {
        singleton: true,
        layer: LAYERS.BACKGROUND,
        issuerLayer: LAYERS.BACKGROUND,
      },
    });
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
          filename: 'remotes/catalog.lynx.bundle',
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

  it('only applies to configured environments', async () => {
    const { applyEnvironmentConfig, modifyRspackConfig } = setupPlugin(
      { name: 'lynx_host' },
      { environment: 'lynx' },
    );
    const config = { plugins: [] };
    const environmentConfig = { source: { include: [] } };

    expect(await modifyRspackConfig(config, 'web')).toBe(config);
    expect(config.plugins).toHaveLength(0);
    expect(applyEnvironmentConfig(environmentConfig, 'web')).toBe(
      environmentConfig,
    );
    expect(environmentConfig.source.include).toEqual([]);
  });

  it('fails clearly when the Lynx DSL exposes invalid layers', async () => {
    const { modifyRspackConfig } = setupPlugin(
      { name: 'lynx_host' },
      undefined,
      { BACKGROUND: 'background' },
    );

    await expect(modifyRspackConfig({})).rejects.toThrow(
      'distinct string `BACKGROUND` and `MAIN_THREAD` values',
    );
  });
});
