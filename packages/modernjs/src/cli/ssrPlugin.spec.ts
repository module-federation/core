import { describe, expect, it, vi } from 'vitest';

const createPluginHarness = async () => {
  const { moduleFederationSSRPlugin } = await import('./ssrPlugin');
  const pluginOptions = {
    assetFileNames: {},
    assetResources: {},
    csrConfig: {},
    distOutputDir: '/project/dist',
    fetchServerQuery: undefined,
    secondarySharedTreeShaking: false,
    ssrConfig: {},
    userConfig: {
      ssr: {
        distOutputDir: '/project/dist/bundles',
      },
    },
  } as any;

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
    onAfterBuild: vi.fn(),
    onDevCompileDone: vi.fn(),
  };

  await moduleFederationSSRPlugin(pluginOptions).setup!(api as any);

  const rsbuildApi = {
    modifyEnvironmentConfig: vi.fn(),
    modifyRspackConfig: vi.fn(),
    modifyWebpackConfig: vi.fn(),
    processAssets: vi.fn(),
  };

  rsbuildPlugin.setup(rsbuildApi);

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

  return { rsbuildApi };
};

describe('moduleFederationSSRPlugin', () => {
  it('preserves the browser publicPath for static asset generators when bundling SSR output', async () => {
    const browserPublicPath = 'https://cdn.example.com/app/';
    const ssrPublicPath = `${browserPublicPath}bundles/`;
    const { rsbuildApi } = await createPluginHarness();

    for (const hookName of ['modifyWebpackConfig', 'modifyRspackConfig']) {
      const config: any = {
        output: {
          publicPath: browserPublicPath,
        },
        module: {},
      };
      const hook = rsbuildApi[hookName].mock.calls[0][0];

      hook(config, { environment: { name: 'node' } });

      expect(config.output.publicPath).toBe(ssrPublicPath);
      expect(config.module.generator.asset.publicPath).toBe(browserPublicPath);
      expect(config.module.generator['asset/resource'].publicPath).toBe(
        browserPublicPath,
      );
    }
  });
});
