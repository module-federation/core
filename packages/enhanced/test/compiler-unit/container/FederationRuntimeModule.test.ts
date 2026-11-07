import FederationRuntimeModule from '../../../src/lib/container/runtime/FederationRuntimeModule';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import fs from 'fs';
import os from 'os';
import path from 'path';
import vm from 'vm';
import type { Chunk, Stats, WebpackOptionsNormalized } from 'webpack';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

type Output = WebpackOptionsNormalized['output'];

interface BuildOptions {
  filename: Output['filename'];
  chunkFilename: Output['chunkFilename'];
  publicPath?: string;
  entryName?: string;
  placement?: 'initial' | 'async';
  runtimeChunk?: 'single';
  withoutChunkRootOutputDir?: boolean;
}

describe('FederationRuntimeModule output paths', () => {
  let context: string;

  beforeEach(() => {
    context = fs.mkdtempSync(
      path.join(os.tmpdir(), 'federation-runtime-path-'),
    );
    fs.writeFileSync(
      path.join(context, 'main.js'),
      "import('./lazy.js'); export default 1;",
    );
    fs.writeFileSync(path.join(context, 'lazy.js'), 'export default 2;');
  });

  afterEach(() => {
    fs.rmSync(context, { recursive: true, force: true });
  });

  const build = async ({
    filename,
    chunkFilename,
    publicPath = './',
    entryName = 'main',
    placement = 'initial',
    runtimeChunk,
    withoutChunkRootOutputDir = false,
  }: BuildOptions) => {
    const outputPath = path.join(context, 'dist');
    const generationErrors: unknown[] = [];
    const compiler = webpack({
      mode: 'production',
      devtool: false,
      context,
      entry: { [entryName]: './main.js' },
      output: { path: outputPath, filename, chunkFilename, publicPath },
      optimization: { minimize: false, runtimeChunk },
      plugins: [
        {
          apply(compiler) {
            compiler.hooks.thisCompilation.tap(
              'FederationRuntimeModuleTest',
              (compilation) => {
                if (withoutChunkRootOutputDir) {
                  Object.defineProperty(
                    compilation.runtimeTemplate,
                    'chunkRootOutputDir',
                    { value: undefined },
                  );
                }
                const attach = (chunk: Chunk, requirements: Set<string>) => {
                  requirements.add(webpack.RuntimeGlobals.ensureChunkHandlers);
                  const runtimeModule = new FederationRuntimeModule(
                    requirements,
                    'host',
                    { name: 'host', remotes: [] },
                  );
                  // Webpack < 5.111 hides a failure during the hash pass, so
                  // record it to catch the regression on every compiler.
                  const generate = runtimeModule.generate.bind(runtimeModule);
                  runtimeModule.generate = () => {
                    try {
                      return generate();
                    } catch (error) {
                      generationErrors.push(error);
                      throw error;
                    }
                  };
                  compilation.addRuntimeModule(chunk, runtimeModule);
                };
                if (placement === 'async') {
                  compilation.hooks.additionalChunkRuntimeRequirements.tap(
                    'FederationRuntimeModuleTest',
                    (chunk, requirements) => {
                      if (!chunk.canBeInitial()) attach(chunk, requirements);
                    },
                  );
                } else {
                  compilation.hooks.additionalTreeRuntimeRequirements.tap(
                    'FederationRuntimeModuleTest',
                    attach,
                  );
                }
              },
            );
          },
        },
      ],
    });

    let stats: Stats | undefined;
    try {
      stats = await new Promise<Stats | undefined>((resolve, reject) => {
        compiler.run((error, result) =>
          error ? reject(error) : resolve(result),
        );
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        compiler.close((error) => (error ? reject(error) : resolve()));
      });
    }
    if (!stats) throw new Error('Webpack did not return stats');
    if (stats.hasErrors()) {
      throw new Error(stats.toString({ all: false, errors: true }));
    }
    expect(generationErrors).toEqual([]);

    const { compilation } = stats;
    const owners = [...compilation.chunks].filter((chunk) =>
      [...compilation.chunkGraph.getChunkRuntimeModulesIterable(chunk)].some(
        (module) => module.name === 'federation runtime',
      ),
    );
    expect(owners).toHaveLength(1);
    const owner = owners[0];
    expect(owner.canBeInitial()).toBe(placement === 'initial');
    const runtimeModule = [
      ...compilation.chunkGraph.getChunkRuntimeModulesIterable(owner),
    ].find((module) => module.name === 'federation runtime')!;

    const sandbox = { __webpack_require__: {} as any };
    vm.runInNewContext(runtimeModule.getGeneratedCode()!, sandbox);
    const { federation } = sandbox.__webpack_require__;

    const asyncChunks = [...compilation.chunks].filter(
      (chunk) => !chunk.canBeInitial(),
    );
    expect(asyncChunks).toHaveLength(1);
    expect(federation.chunkMatcher(asyncChunks[0].id)).toBe(true);
    const [asyncFile] = asyncChunks[0].files;
    expect(fs.existsSync(path.join(outputPath, asyncFile))).toBe(true);

    const [file] = owner.files;
    const emitted = fs.readFileSync(path.join(outputPath, file), 'utf8');
    expect(emitted).toContain(
      `rootOutputDir: ${JSON.stringify(federation.rootOutputDir)}`,
    );
    // The value is only correct if it leads from the asset back to output.path.
    expect(
      path.resolve(
        outputPath,
        path.dirname(file),
        federation.rootOutputDir || '.',
      ),
    ).toBe(outputPath);

    return {
      rootOutputDir: federation.rootOutputDir as string,
      file,
      asyncFile,
    };
  };

  const hashes = [
    '[contenthash:8]',
    '[contenthash]',
    '[chunkhash:8]',
    '[fullhash:8]',
  ];

  for (const hash of hashes) {
    for (const publicPath of ['', './', '../assets/', 'auto']) {
      const title = `${hash} and publicPath ${JSON.stringify(publicPath)}`;

      it(`resolves a nested hashed filename with ${title}`, async () => {
        const result = await build({
          filename: `static/js/[name].${hash}.js`,
          chunkFilename: `static/js/chunks/[name].${hash}.js`,
          publicPath,
        });
        expect(result.rootOutputDir).toBe('../../');
        expect(result.file).toMatch(/^static\/js\/main\.[a-f0-9]+\.js$/);
        expect(result.asyncFile).toMatch(
          /^static\/js\/chunks\/.+\.[a-f0-9]+\.js$/,
        );
      });

      it(`resolves a nested hashed chunkFilename with ${title}`, async () => {
        const result = await build({
          filename: 'static/js/[name].js',
          chunkFilename: `static/js/chunks/[name].${hash}.js`,
          publicPath,
          placement: 'async',
        });
        expect(result.rootOutputDir).toBe('../../../');
        expect(result.file).toMatch(/^static\/js\/chunks\/.+\.[a-f0-9]+\.js$/);
      });
    }
  }

  it('resolves a hashed runtime chunk', async () => {
    const result = await build({
      filename: 'static/js/[name].[contenthash:8].js',
      chunkFilename: 'static/js/chunks/[name].[contenthash:8].js',
      runtimeChunk: 'single',
    });
    expect(result.rootOutputDir).toBe('../../');
    expect(result.file).toMatch(/^static\/js\/runtime\.[a-f0-9]{8}\.js$/);
  });

  it('resolves a hashed file in the output root', async () => {
    const result = await build({
      filename: '[name].[contenthash:8].js',
      chunkFilename: '[name].[contenthash:8].js',
    });
    expect(result.rootOutputDir).toBe('');
  });

  it('resolves a hashed file outside output.path', async () => {
    const result = await build({
      filename: '../up/[name].[contenthash:8].js',
      chunkFilename: '../up/[name].[contenthash:8].js',
    });
    expect(result.rootOutputDir).toBe('../dist/');
  });

  it('resolves an entry name containing path segments', async () => {
    const result = await build({
      filename: 'js/[name].[contenthash:8].js',
      chunkFilename: 'js/[name].[contenthash:8].js',
      entryName: 'nested/deep/main',
    });
    expect(result.rootOutputDir).toBe('../../../');
  });

  it('supports filename functions returning hashed templates', async () => {
    const result = await build({
      filename: ({ chunk }) => `static/js/${chunk?.name}.[contenthash:8].js`,
      chunkFilename: 'static/js/chunks/[name].[contenthash:8].js',
    });
    expect(result.rootOutputDir).toBe('../../');
    expect(result.file).toMatch(/^static\/js\/main\.[a-f0-9]{8}\.js$/);
  });

  describe('without chunkRootOutputDir', () => {
    for (const hash of hashes) {
      it(`neutralizes ${hash} in a filename`, async () => {
        const result = await build({
          filename: `static/js/[name].${hash}.js`,
          chunkFilename: `static/js/chunks/[name].${hash}.js`,
          withoutChunkRootOutputDir: true,
        });
        expect(result.rootOutputDir).toBe('../../');
      });
    }

    it('neutralizes hashes in an async chunkFilename', async () => {
      const result = await build({
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/chunks/[name].[contenthash:8].js',
        placement: 'async',
        withoutChunkRootOutputDir: true,
      });
      expect(result.rootOutputDir).toBe('../../../');
    });

    it('neutralizes hashes returned by a filename function', async () => {
      const result = await build({
        filename: ({ chunk }) => `static/js/${chunk?.name}.[contenthash:8].js`,
        chunkFilename: 'static/js/chunks/[name].[contenthash:8].js',
        withoutChunkRootOutputDir: true,
      });
      expect(result.rootOutputDir).toBe('../../');
    });

    it('preserves unhashed filenames', async () => {
      const result = await build({
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/chunks/[name].js',
        withoutChunkRootOutputDir: true,
      });
      expect(result.rootOutputDir).toBe('../../');
      expect(result.file).toBe('static/js/main.js');
    });
  });
});
