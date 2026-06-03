import path from 'path';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@module-federation/enhanced/rspack', () => ({
  ModuleFederationPlugin: class ModuleFederationPlugin {},
  TreeShakingSharedPlugin: class TreeShakingSharedPlugin {},
}));

vi.mock('@module-federation/node/universe-entry-chunk-tracker-plugin', () => ({
  default: class UniverseEntryChunkTrackerPlugin {},
}));

vi.mock('@module-federation/sdk', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
  ManifestFileName: 'mf-manifest.json',
  StatsFileName: 'mf-stats.json',
  simpleJoinRemoteEntry: (...segments: string[]) =>
    segments.filter(Boolean).join('/'),
}));

async function createPluginHarness(distOutputDir = '/project/dist') {
  const { moduleFederationSSRPlugin } = await import('./ssrPlugin');
  const pluginOptions = {
    assetFileNames: {},
    assetResources: {},
    csrConfig: {},
    distOutputDir,
    fetchServerQuery: undefined,
    secondarySharedTreeShaking: false,
    ssrConfig: {},
    userConfig: {
      ssr: {
        distOutputDir: '/project/dist/bundles',
      },
    },
  } as any;

  let onAfterBuild: (() => void) | undefined;
  let rsbuildPlugin: any;

  const api = {
    _internalRuntimePlugins: vi.fn(),
    _internalServerPlugins: vi.fn(),
    config: vi.fn((callback) => {
      const config = callback();
      rsbuildPlugin = config.builderPlugins[0];
    }),
    getAppContext: vi.fn(() => ({ bundlerType: 'rspack' })),
    getConfig: vi.fn(() => ({ server: { ssr: true } })),
    modifyBundlerChain: vi.fn(),
    onAfterBuild: vi.fn((callback) => {
      onAfterBuild = callback;
    }),
    onDevCompileDone: vi.fn(),
  };

  await moduleFederationSSRPlugin(pluginOptions).setup!(api as any);

  const rsbuildApi = {
    modifyEnvironmentConfig: vi.fn(),
    modifyRspackConfig: vi.fn(),
    processAssets: vi.fn(),
  };

  rsbuildPlugin.setup(rsbuildApi);

  return { onAfterBuild: onAfterBuild!, pluginOptions, rsbuildApi };
}

describe('moduleFederationSSRPlugin', () => {
  const configureOutputPaths = (rsbuildApi: any) => {
    const modifyEnvironmentConfig =
      rsbuildApi.modifyEnvironmentConfig.mock.calls[0][0];

    modifyEnvironmentConfig(
      {
        output: {
          distPath: { root: '/project/dist' },
          target: 'web',
        },
      },
      { name: 'web' },
    );
    modifyEnvironmentConfig(
      {
        output: {
          distPath: { root: '/project/dist/bundles' },
          target: 'node',
        },
      },
      { name: 'node' },
    );
  };

  const createJsonAsset = (content: unknown) => ({
    source: () => JSON.stringify(content),
  });

  const createManifestAsset = (publicPath: string) =>
    createJsonAsset({
      metaData: {
        publicPath,
        remoteEntry: {
          name: 'remoteEntry.js',
          path: '',
        },
      },
    });

  const createStatsAsset = (publicPath: string) =>
    createJsonAsset({
      metaData: {
        publicPath,
        remoteEntry: {
          name: 'remoteEntry.js',
          path: '',
        },
      },
    });

  it('does not register bundler publicPath mutation hooks for SSR output under bundles', async () => {
    const { rsbuildApi } = await createPluginHarness();
    configureOutputPaths(rsbuildApi);

    expect(rsbuildApi.modifyRspackConfig).not.toHaveBeenCalled();
  });

  it('updates SSR manifest publicPath for bundled SSR output', async () => {
    const { pluginOptions, rsbuildApi } = await createPluginHarness();
    configureOutputPaths(rsbuildApi);

    const processAssets = rsbuildApi.processAssets.mock.calls[0][1];
    processAssets({
      assets: {
        'mf-manifest.json': createManifestAsset(
          '/playlet-produce-migrate/static/',
        ),
        'mf-stats.json': createStatsAsset('/playlet-produce-migrate/static/'),
      },
      environment: { name: 'node' },
    });

    expect(
      pluginOptions.assetResources.node.manifest.data.metaData.publicPath,
    ).toBe('/playlet-produce-migrate/static/bundles/');
    expect(
      pluginOptions.assetResources.node.stats.data.metaData.publicPath,
    ).toBe('/playlet-produce-migrate/static/bundles/');
  });

  it('writes bundled SSR publicPath into the merged browser manifest', async () => {
    const outputDir = await mkdtemp(
      path.join(tmpdir(), 'modern-js-v3-ssr-manifest-'),
    );
    const { onAfterBuild, rsbuildApi } = await createPluginHarness(outputDir);
    configureOutputPaths(rsbuildApi);

    const processAssets = rsbuildApi.processAssets.mock.calls[0][1];
    processAssets({
      assets: {
        'mf-manifest.json': createManifestAsset(
          '/playlet-produce-migrate/static/',
        ),
        'mf-stats.json': createStatsAsset('/playlet-produce-migrate/static/'),
      },
      environment: { name: 'web' },
    });
    processAssets({
      assets: {
        'mf-manifest.json': createManifestAsset(
          '/playlet-produce-migrate/static/',
        ),
        'mf-stats.json': createStatsAsset('/playlet-produce-migrate/static/'),
      },
      environment: { name: 'node' },
    });

    try {
      onAfterBuild();

      const manifest = JSON.parse(
        await readFile(path.join(outputDir, 'mf-manifest.json'), 'utf-8'),
      );

      expect(manifest.metaData.ssrPublicPath).toBe(
        '/playlet-produce-migrate/static/bundles/',
      );
    } finally {
      await rm(outputDir, { force: true, recursive: true });
    }
  });
});
