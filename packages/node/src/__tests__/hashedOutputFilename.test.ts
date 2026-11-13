import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Stats } from 'webpack';
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

  const build = async (filename: string) => {
    const generated = new Map<string, string[]>();
    const generationErrors: unknown[] = [];
    const compiler = webpack({
      mode: 'production',
      devtool: false,
      context,
      target: 'async-node',
      entry: { main: './main.js' },
      output: { path: path.join(context, 'dist'), filename },
      optimization: { minimize: false },
      plugins: [
        new StreamingTargetPlugin({ name: 'host', remotes: {} }),
        {
          apply(compiler) {
            compiler.hooks.thisCompilation.tap('HashedOutputTest', (c) => {
              c.hooks.runtimeModule.tap('HashedOutputTest', (module) => {
                // Skip Webpack's own runtime modules. Before 5.112 its node
                // chunk loading throws for hashes during the hash pass.
                const name = module.constructor.name;
                if (!OWN_RUNTIME_MODULES.includes(name)) return;
                // Webpack before 5.112 swallows a failing hash-pass generate,
                // so record it to catch the regression on every compiler.
                const generate = module.generate.bind(module);
                module.generate = () => {
                  try {
                    const code = generate();
                    const all = generated.get(name) || [];
                    all.push(code || '');
                    generated.set(name, all);
                    return code;
                  } catch (error) {
                    generationErrors.push(error);
                    throw error;
                  }
                };
              });
            });
          },
        },
      ],
    });
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
    } finally {
      await new Promise<void>((resolve, reject) => {
        compiler.close((error) => (error ? reject(error) : resolve()));
      });
    }
    expect(generationErrors).toEqual([]);
    return generated;
  };

  it.each([
    'static/js/[name].[contenthash:8].js',
    'static/js/[name].[chunkhash].js',
    'static/js/[name].js',
  ])(
    'generates the chunk loading and public path runtime for %s',
    async (filename) => {
      const generated = await build(filename);

      const chunkLoading = generated.get(OWN_RUNTIME_MODULES[0]);
      expect(chunkLoading?.length).toBeGreaterThan(0);

      const publicPath = generated.get(OWN_RUNTIME_MODULES[1]);
      expect(publicPath?.length).toBeGreaterThan(0);
      for (const code of publicPath || []) {
        // The entry is two directories below the output root.
        expect(code).toContain('scriptUrl + "../../"');
      }
    },
  );
});
