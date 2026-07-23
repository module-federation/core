import { describe, expect, it, rs } from '@rstest/core';

import { LYNX_REACT_RUNTIME_PLUGIN, LYNX_RUNTIME_PLUGIN } from './plugin';
import type { LynxModuleFederationAdapterOptions } from './plugin';
import { federationOptions, LAYERS, setupPlugin } from './plugin.testUtils';

describe('pluginLynxModuleFederation host adapter', () => {
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
      runtimePlugins: [
        ['custom-runtime-plugin', {}],
        [
          LYNX_RUNTIME_PLUGIN,
          {
            realmLayers: {
              background: LAYERS.BACKGROUND,
              'main-thread': LAYERS.MAIN_THREAD,
            },
          },
        ],
      ],
      exposes: {
        './App': { import: './src/App', layer: LAYERS.BACKGROUND },
      },
    });
    expect(modifyEnvironmentConfig).toHaveBeenCalledTimes(1);
  });

  it('merges resolved options into an explicitly registered runtime plugin', async () => {
    const customLayers = {
      BACKGROUND: 'worker:realm',
      MAIN_THREAD: 'ui:realm',
    };
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        runtimePlugins: [[LYNX_RUNTIME_PLUGIN, { timeout: 500 }]],
      },
      { runtimePluginOptions: { timeout: 2_000 } },
      customLayers,
    );
    const config = await modifyRspackConfig({ plugins: [] });

    expect(federationOptions(config.plugins[0]).runtimePlugins).toEqual([
      [
        LYNX_RUNTIME_PLUGIN,
        {
          timeout: 2_000,
          realmLayers: {
            background: customLayers.BACKGROUND,
            'main-thread': customLayers.MAIN_THREAD,
          },
        },
      ],
    ]);
  });

  it('bootstraps the ReactLynx lazy-bundle loader before federation startup', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        runtimePlugins: ['custom-runtime-plugin'],
      },
      undefined,
      LAYERS,
      { resolve: async (request) => request },
    );
    const config = await modifyRspackConfig({ plugins: [] });

    expect(federationOptions(config.plugins[0]).runtimePlugins).toEqual([
      [LYNX_REACT_RUNTIME_PLUGIN, {}],
      ['custom-runtime-plugin', {}],
      [
        LYNX_RUNTIME_PLUGIN,
        {
          realmLayers: {
            background: LAYERS.BACKGROUND,
            'main-thread': LAYERS.MAIN_THREAD,
          },
        },
      ],
    ]);
  });

  it('keeps unqualified host shares in the default background share scope', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        remotes: { catalog: 'catalog@catalog.lynx.bundle' },
        shared: [{ react: '^19.0.0' }, { react: { singleton: true } }],
        runtimePlugins: ['custom-runtime-plugin'],
      },
      {
        runtimePluginOptions: { timeout: 2_000 },
      },
    );
    const config = await modifyRspackConfig({ plugins: [] });

    expect(config.plugins).toHaveLength(2);
    expect(federationOptions(config.plugins[0])).toMatchObject({
      name: 'lynx_host',
      shareScope: [`default:${LAYERS.BACKGROUND}`],
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

  it('inherits a custom top-level share scope for host shares', async () => {
    const { modifyRspackConfig } = setupPlugin({
      name: 'lynx_host',
      shareScope: 'application',
      shared: { state: { singleton: true } },
    });
    const config = await modifyRspackConfig({ plugins: [] });
    const options = federationOptions(config.plugins[0]);

    expect(options.shareScope).toEqual([`application:${LAYERS.BACKGROUND}`]);
    expect(options.shared).toEqual([
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

  it('inherits multiple top-level share scopes for each enabled realm', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        shareScope: ['application', 'vendor'],
        shared: { state: { singleton: true } },
      },
      { mainThread: true },
    );
    const config = await modifyRspackConfig({ plugins: [] });
    const options = federationOptions(config.plugins[0]);

    expect(options.shareScope).toEqual([
      `application:${LAYERS.BACKGROUND}`,
      `application:${LAYERS.MAIN_THREAD}`,
      `vendor:${LAYERS.BACKGROUND}`,
      `vendor:${LAYERS.MAIN_THREAD}`,
    ]);
    expect(options.shared).toEqual([
      {
        state: {
          singleton: true,
          layer: LAYERS.BACKGROUND,
          issuerLayer: LAYERS.BACKGROUND,
          shareScope: [
            `application:${LAYERS.BACKGROUND}`,
            `vendor:${LAYERS.BACKGROUND}`,
          ],
        },
      },
    ]);
  });

  it('qualifies advanced remote share scopes for each enabled realm', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        remotes: {
          catalog: {
            external: 'catalog@catalog.lynx.bundle',
            shareScope: 'application',
          },
          analytics: {
            external: ['analytics@analytics.lynx.bundle'],
            shareScope: ['vendor', 'application'],
          },
        },
      },
      { mainThread: true },
    );
    const config = await modifyRspackConfig({ plugins: [] });

    expect(federationOptions(config.plugins[0]).remotes).toEqual({
      catalog: {
        external: 'catalog@catalog.lynx.bundle',
        shareScope: [
          `application:${LAYERS.BACKGROUND}`,
          `application:${LAYERS.MAIN_THREAD}`,
        ],
      },
      analytics: {
        external: ['analytics@analytics.lynx.bundle'],
        shareScope: [
          `vendor:${LAYERS.BACKGROUND}`,
          `vendor:${LAYERS.MAIN_THREAD}`,
          `application:${LAYERS.BACKGROUND}`,
          `application:${LAYERS.MAIN_THREAD}`,
        ],
      },
    });
  });

  it('lets a shared item override the top-level share scope', async () => {
    const { modifyRspackConfig } = setupPlugin({
      name: 'lynx_host',
      shareScope: 'application',
      shared: {
        state: { shareScope: 'isolated', singleton: true },
      },
    });
    const config = await modifyRspackConfig({ plugins: [] });
    const options = federationOptions(config.plugins[0]);

    expect(options.shareScope).toEqual([`application:${LAYERS.BACKGROUND}`]);
    expect(options.shared).toEqual([
      {
        state: {
          singleton: true,
          layer: LAYERS.BACKGROUND,
          issuerLayer: LAYERS.BACKGROUND,
          shareScope: [`isolated:${LAYERS.BACKGROUND}`],
        },
      },
    ]);
  });

  it('adds the main-thread share scope only when that realm is enabled', async () => {
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        shared: { react: { singleton: true } },
      },
      { mainThread: true },
    );
    const config = await modifyRspackConfig({ plugins: [] });

    expect(federationOptions(config.plugins[0])).toMatchObject({
      shareScope: [
        `default:${LAYERS.BACKGROUND}`,
        `default:${LAYERS.MAIN_THREAD}`,
      ],
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
  });

  it('keeps custom compiler layers separate from runtime share scopes', async () => {
    const customLayer = 'custom-layer';
    const { modifyRspackConfig } = setupPlugin(
      {
        name: 'lynx_host',
        shared: { state: { singleton: true } },
      },
      { layer: customLayer },
    );
    const config = await modifyRspackConfig({ plugins: [] });

    expect(federationOptions(config.plugins[0])).toMatchObject({
      shareScope: [`default:${LAYERS.BACKGROUND}`],
      shared: [
        {
          state: {
            singleton: true,
            layer: customLayer,
            issuerLayer: customLayer,
            shareScope: [`default:${LAYERS.BACKGROUND}`],
          },
        },
      ],
    });
  });

  it('rejects shared modules assigned to a disabled host realm', async () => {
    const { modifyRspackConfig } = setupPlugin({
      name: 'lynx_host',
      shared: {
        state: { realm: 'main-thread', singleton: true },
      },
    });

    await expect(modifyRspackConfig({ plugins: [] })).rejects.toThrow(
      `shared module "state" uses inactive realm layer "${LAYERS.MAIN_THREAD}"`,
    );
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
