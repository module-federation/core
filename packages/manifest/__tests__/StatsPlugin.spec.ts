import type { Compiler } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

jest.mock(
  '@module-federation/sdk',
  () => ({
    bindLoggerToCompiler: jest.fn(),
    moduleFederationPlugin: {},
  }),
  { virtual: true },
);

jest.mock('../src/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

jest.mock('../src/StatsManager', () => ({
  StatsManager: class {
    fileName = 'mf-stats.json';

    init = jest.fn();
    validate = jest.fn(() => true);
    updateStats = jest.fn((stats) => stats);
    generateStats = jest.fn(async () => ({ generatedBy: 'webpack' }));
    getPublicPath = jest.fn(() => '/');
  },
}));

jest.mock('../src/ManifestManager', () => ({
  ManifestManager: class {
    fileName = 'mf-manifest.json';

    init = jest.fn();
    updateManifest = jest.fn(() => ({ generatedBy: 'rspack' }));
    generateManifest = jest.fn(() => ({ generatedBy: 'webpack' }));
  },
}));

import { StatsPlugin } from '../src/StatsPlugin';

const createCompiler = (rspackVersion?: string) => {
  class RawSource {
    constructor(readonly value: string) {}
  }

  return {
    webpack: {
      rspackVersion,
      sources: { RawSource },
    },
    options: {
      output: { publicPath: 'auto' },
    },
    hooks: {
      thisCompilation: {
        tap: jest.fn(),
      },
    },
  } as unknown as Compiler;
};

const createPlugin = (
  bundler: 'webpack' | 'rspack',
  manifest: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'] = true,
) =>
  new StatsPlugin(
    {
      name: 'host',
      manifest,
    },
    {
      pluginVersion: '1.0.0',
      bundler,
    },
  );

const getProcessAssetsHandler = (compiler: Compiler, getAsset: jest.Mock) => {
  const processAssets = {
    tapPromise: jest.fn(),
  };
  const compilation = {
    constructor: {
      PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER: 100,
    },
    hooks: { processAssets },
    getAsset,
    updateAsset: jest.fn(),
    emitAsset: jest.fn(),
  };

  const thisCompilationHandler = (
    compiler.hooks.thisCompilation.tap as jest.Mock
  ).mock.calls[0][1];
  thisCompilationHandler(compilation);

  return {
    compilation,
    handler: processAssets.tapPromise.mock.calls[0][1] as () => Promise<void>,
  };
};

describe('StatsPlugin', () => {
  it.each(['1.3.9', '1.7.11', '1.7.12-beta.0', '2.0.0-beta.1'])(
    'requires a Rspack upgrade when manifest is enabled on %s',
    (version) => {
      const compiler = createCompiler(version);

      expect(() => createPlugin('rspack').apply(compiler)).toThrow(
        /upgrade to Rspack 1\.7\.12 or 2\.0\.0 and above\.$/,
      );
    },
  );

  it.each(['1.7.12', '1.8.0', '2.0.0', '2.1.2'])(
    'accepts Rspack %s built-in manifest support',
    (version) => {
      const compiler = createCompiler(version);

      expect(() => createPlugin('rspack').apply(compiler)).not.toThrow();
      expect(compiler.hooks.thisCompilation.tap).toHaveBeenCalledTimes(1);
    },
  );

  it('does not require a supported Rspack version when manifest is disabled', () => {
    const compiler = createCompiler('1.3.9');

    expect(() => createPlugin('rspack', false).apply(compiler)).not.toThrow();
  });

  it('does not apply the Rspack version requirement to webpack', () => {
    const compiler = createCompiler();

    expect(() => createPlugin('webpack').apply(compiler)).not.toThrow();
  });

  it('uses Rspack built-in stats without running the webpack generator', async () => {
    const compiler = createCompiler('1.7.12');
    createPlugin('rspack').apply(compiler);
    const source = {
      source: () => JSON.stringify({ generatedBy: 'rspack' }),
    };
    const { compilation, handler } = getProcessAssetsHandler(
      compiler,
      jest.fn(() => ({ source })),
    );

    await handler();

    expect(compilation.updateAsset).toHaveBeenCalledTimes(2);
    expect(compilation.emitAsset).not.toHaveBeenCalled();
  });

  it('does not fall back when Rspack built-in stats are missing', async () => {
    const compiler = createCompiler('2.0.0');
    createPlugin('rspack').apply(compiler);
    const { compilation, handler } = getProcessAssetsHandler(
      compiler,
      jest.fn(() => undefined),
    );

    await expect(handler()).rejects.toThrow(
      /Rspack's built-in manifest did not emit mf-stats\.json/,
    );
    expect(compilation.emitAsset).not.toHaveBeenCalled();
  });

  it('keeps webpack manifest generation unchanged', async () => {
    const compiler = createCompiler();
    createPlugin('webpack').apply(compiler);
    const { compilation, handler } = getProcessAssetsHandler(
      compiler,
      jest.fn(() => undefined),
    );

    await handler();

    expect(compilation.emitAsset).toHaveBeenCalledTimes(2);
  });
});
