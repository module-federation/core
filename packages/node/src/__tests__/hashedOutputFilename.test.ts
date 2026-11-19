import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Configuration, Stats } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import StreamingTargetPlugin from '../plugins/StreamingTargetPlugin';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const OWN_RUNTIME_MODULES = [
  'DynamicFilesystemChunkLoadingRuntimeModule',
  'AutoPublicPathRuntimeModule',
];

// These are real builds. Webpack generates each runtime module once for
// hashing, before chunk hashes exist, and once more for the emitted code.
describe(`hashed output filenames with Webpack ${webpack.version}`, () => {
  let context: string;

  beforeEach(() => {
    context = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-node-hashed-'));
    fs.writeFileSync(
      path.join(context, 'main.js'),
      "export const lazy = () => import('./lazy.js');",
    );
    fs.writeFileSync(path.join(context, 'lazy.js'), 'export default 1;');
  });

  afterEach(() => {
    fs.rmSync(context, { recursive: true, force: true });
  });

  const build = async (output: Configuration['output']) => {
    const emitted = new Map<string, string>();
    const compiler = webpack({
      mode: 'production',
      devtool: false,
      context,
      target: 'async-node',
      entry: { main: './main.js' },
      output: { path: path.join(context, 'dist'), ...output },
      // Keep [contenthash] as computed during the build, so the asset name
      // matches the name the runtime modules saw.
      optimization: { minimize: false, realContentHash: false },
      plugins: [new StreamingTargetPlugin({ name: 'host', remotes: {} })],
    });
    let mainFile: string;
    try {
      const stats = await new Promise<Stats>((resolve, reject) => {
        compiler.run((error, stats) => {
          if (error) reject(error);
          else if (stats) resolve(stats);
          else reject(new Error('Webpack returned no stats'));
        });
      });
      if (stats.hasErrors()) {
        throw new Error(stats.toString({ all: false, errors: true }));
      }
      const { chunks, chunkGraph } = stats.compilation;
      for (const chunk of chunks) {
        for (const module of chunkGraph.getChunkRuntimeModulesIterable(chunk)) {
          const name = module.constructor.name;
          if (OWN_RUNTIME_MODULES.includes(name)) {
            emitted.set(name, module.getGeneratedCode() || '');
          }
        }
      }
      const main = [...chunks].find((chunk) => chunk.name === 'main');
      [mainFile] = main ? [...main.files] : [];
    } finally {
      await new Promise<void>((resolve, reject) => {
        compiler.close((error) => (error ? reject(error) : resolve()));
      });
    }
    return { emitted, mainFile };
  };

  // The path back to the output root from the emitted entry file.
  const undoPath = (file: string) =>
    path.relative(path.dirname(path.join('dist', file)), 'dist') + '/';

  it.each([
    'static/js/[name].[contenthash:8].js',
    'static/js/[name].[chunkhash].js',
    'static/js/[name].js',
  ])(
    'generates the chunk loading and public path runtime for %s',
    async (filename) => {
      const { emitted, mainFile } = await build({ filename });

      expect(emitted.get(OWN_RUNTIME_MODULES[0])).toBeTruthy();
      expect(undoPath(mainFile)).toBe('../../');
      expect(emitted.get(OWN_RUNTIME_MODULES[1])).toContain(
        'scriptUrl + "../../"',
      );
    },
  );

  const RuntimeTemplate = require(
    normalizeWebpackPath('webpack/lib/RuntimeTemplate'),
  );
  // Webpack's own chunkRootOutputDir replaces hashes before measuring the
  // depth, so a digest containing `/` is off wherever webpack has it.
  if (typeof RuntimeTemplate.prototype.chunkRootOutputDir !== 'function') {
    it('resolves a base64 hash that contains a slash', async () => {
      for (let seed = 0; seed < 50; seed++) {
        fs.writeFileSync(
          path.join(context, 'main.js'),
          `export const lazy = () => import('./lazy.js'); export default ${seed};`,
        );
        const { emitted, mainFile } = await build({
          filename: 'static/[name].[contenthash].js',
          hashDigest: 'base64',
        });
        expect(emitted.get(OWN_RUNTIME_MODULES[1])).toContain(
          `scriptUrl + ${JSON.stringify(undoPath(mainFile))}`,
        );
        if (mainFile.split('/').length > 2) return;
      }
      throw new Error('No seed produced a base64 hash containing "/"');
    });
  }
});
