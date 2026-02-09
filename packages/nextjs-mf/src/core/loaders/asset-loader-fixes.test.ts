import type { LoaderContext } from 'webpack';
import { fixNextImageLoader } from './fixNextImageLoader';
import fixUrlLoader from './fixUrlLoader';

function createLoaderContext({
  compilerName = 'server',
  moduleExport = {
    src: '/_next/static/media/webpack.png',
    width: 200,
  },
}: {
  compilerName?: string;
  moduleExport?: unknown;
} = {}): {
  context: LoaderContext<Record<string, unknown>>;
  cacheable: jest.Mock;
  importModule: jest.Mock;
} {
  const cacheable = jest.fn();
  const importModule = jest.fn().mockResolvedValue({ default: moduleExport });

  const context = {
    cacheable,
    importModule,
    resourcePath: '/tmp/webpack.png',
    _compiler: {
      options: { name: compilerName },
      webpack: {
        RuntimeGlobals: {
          publicPath: '__webpack_require__.p',
        },
      },
    },
  } as unknown as LoaderContext<Record<string, unknown>>;

  return { context, cacheable, importModule };
}

describe('core/loaders asset prefix fixes', () => {
  it('injects federation-aware runtime prefix for url-loader exports', () => {
    const content = 'export default "/_next/static/media/webpack.svg";';
    const transformed = fixUrlLoader(content);

    expect(transformed).toContain('resolveFederatedAssetPrefix');
    expect(transformed).toContain("if (!hasRemoteEntry) return '';");
    expect(transformed).toContain(' + "/_next/static/media/webpack.svg";');
  });

  it('keeps non-matching url-loader output unchanged', () => {
    const content = 'module.exports = "/_next/static/media/webpack.svg";';
    expect(fixUrlLoader(content)).toBe(content);
  });

  it('generates server asset-prefix guards for next-image-loader modules', async () => {
    const { context, cacheable, importModule } = createLoaderContext({
      compilerName: 'server',
      moduleExport: {
        src: '/_next/static/media/webpack.png',
        width: 120,
      },
    });

    const transformed = await fixNextImageLoader.call(
      context,
      'next-image-loader?name=webpack.png',
    );

    expect(cacheable).toHaveBeenCalledWith(true);
    expect(importModule).toHaveBeenCalledTimes(1);
    expect(transformed).toContain('resolveServerAssetPrefix');
    expect(transformed).toContain("if (hasFederationInstance) return '';");
    expect(transformed).toContain(
      '__nextmf_asset_prefix__ + "/_next/static/media/webpack.png"',
    );
    expect(transformed).toContain('"width": 120');
  });

  it('generates client asset-prefix guards for next-image-loader modules', async () => {
    const { context } = createLoaderContext({
      compilerName: 'client',
      moduleExport: {
        src: '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fwebpack.png&w=384&q=75',
      },
    });

    const transformed = await fixNextImageLoader.call(
      context,
      'next-image-loader?name=webpack.png',
    );

    expect(transformed).toContain('resolveClientAssetPrefix');
    expect(transformed).toContain("if (hasFederationInstance) return '';");
    expect(transformed).toContain(
      'const currentScript = document.currentScript && document.currentScript.src;',
    );
    expect(transformed).toContain(
      '__nextmf_asset_prefix__ + "/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fwebpack.png&w=384&q=75"',
    );
  });

  it('passes through non-object next-image-loader exports', async () => {
    const { context } = createLoaderContext({
      moduleExport: '/_next/static/media/webpack.png',
    });

    const transformed = await fixNextImageLoader.call(
      context,
      'next-image-loader?name=webpack.png',
    );

    expect(transformed).toBe('export default "/_next/static/media/webpack.png";');
  });
});
