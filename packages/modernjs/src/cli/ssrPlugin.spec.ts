import path from 'node:path';
import { beforeEach, describe, expect, it, rs } from '@rstest/core';

const fsMocks = rs.hoisted(() => ({
  statSync: rs.fn(),
  createReadStream: rs.fn(() => ({ pipe: rs.fn() })),
}));

rs.mock('fs', () => ({
  default: fsMocks,
  ...fsMocks,
}));

beforeEach(() => {
  rs.clearAllMocks();
});

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
  let devServerMiddleware: any;
  const api = {
    _internalRuntimePlugins: rs.fn(),
    _internalServerPlugins: rs.fn(),
    config: rs.fn((callback) => {
      const config = callback();
      rsbuildPlugin = config.builderPlugins[0];
      devServerMiddleware = config.tools.devServer.before[0];
    }),
    getAppContext: rs.fn(() => ({ bundlerType: 'rspack' })),
    getConfig: rs.fn(() => ({ server: { ssr: true } })),
    modifyBundlerChain: rs.fn(),
    onAfterBuild: rs.fn(),
    onDevCompileDone: rs.fn(),
  };

  await moduleFederationSSRPlugin(pluginOptions).setup!(api as any);

  const rsbuildApi = {
    modifyEnvironmentConfig: rs.fn(),
    modifyRspackConfig: rs.fn(),
    modifyWebpackConfig: rs.fn(),
    processAssets: rs.fn(),
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

  return { rsbuildApi, devServerMiddleware };
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
  }, 10_000);

  it('serves JSON assets with query and hash suffixes, including ..-prefixed names', async () => {
    const { devServerMiddleware } = await createPluginHarness();
    const response = { setHeader: rs.fn() };
    const stream = { pipe: rs.fn() };
    (fsMocks.createReadStream as any).mockReturnValue(stream);

    for (const requestPath of [
      '/..manifest.json?query=value#hash',
      '/nested/..generated/app.json',
    ]) {
      const next = rs.fn();

      await devServerMiddleware({ url: requestPath }, response, next);

      expect(next).not.toHaveBeenCalled();
    }

    expect(fsMocks.statSync).toHaveBeenNthCalledWith(
      1,
      path.resolve(process.cwd(), 'dist', '..manifest.json'),
    );
    expect(fsMocks.statSync).toHaveBeenNthCalledWith(
      2,
      path.resolve(process.cwd(), 'dist', 'nested/..generated/app.json'),
    );
    expect(stream.pipe).toHaveBeenCalledTimes(2);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*',
    );
  });

  it('passes through non-JSON and traversal requests', async () => {
    const { devServerMiddleware } = await createPluginHarness();

    for (const requestPath of [
      '/manifest.js?query=value#hash',
      '/../outside.json?query=value#hash',
    ]) {
      const next = rs.fn();

      await devServerMiddleware(
        { url: requestPath },
        { setHeader: rs.fn() },
        next,
      );

      expect(next).toHaveBeenCalledOnce();
    }

    expect(fsMocks.statSync).not.toHaveBeenCalled();
    expect(fsMocks.createReadStream).not.toHaveBeenCalled();
  });
});
