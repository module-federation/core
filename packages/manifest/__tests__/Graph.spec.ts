/** @jest-environment node */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Stats } from 'webpack';
import { StatsPlugin } from '../src/StatsPlugin';

const nodeRequire = process
  .getBuiltinModule('module')
  .createRequire(__filename);
const webpack = nodeRequire('webpack');
const EnhancedPlugin = process
  .getBuiltinModule('module')
  .createRequire(path.resolve(__dirname, '../../enhanced/package.json'))(
  '@module-federation/enhanced',
).ModuleFederationPlugin;

it.each([
  'exposes',
  'native-shared',
  'enhanced-shared',
  'enhanced-prefix',
  'remotes',
])(
  'collects %s with multiple runtimes and supports explicit rollback',
  async (mode) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'mf-graph-'));
    const prefix = mode === 'enhanced-prefix';
    const shared = mode.includes('shared') || prefix;
    const native = mode === 'native-shared';
    try {
      await writeFile(
        path.join(directory, 'entry.js'),
        prefix
          ? 'module.exports = require("prefix/subpath");'
          : mode === 'remotes'
            ? 'module.exports = require("remote/nested/Button");'
            : 'module.exports = require("./shared.js");',
      );
      await writeFile(
        path.join(directory, 'shared.js'),
        'module.exports = "shared";',
      );
      await writeFile(
        path.join(directory, 'package.json'),
        JSON.stringify({ name: 'fixture', version: '1.0.0' }),
      );
      const artifacts = [];
      for (const useLegacyStats of [undefined, false, true]) {
        const additionalData = jest.fn(async ({ stats }) => stats);
        const options = {
          name: 'fixture',
          filename: 'container.js',
          library: { type: 'commonjs-module' },
          dts: false as const,
          remotes:
            mode === 'remotes'
              ? {
                  remote: 'remote@https://example.test/remote.js',
                  'remote/nested': 'nested@https://example.test/nested.js',
                  unused: 'unused@https://example.test/unused.js',
                }
              : {},
          exposes: { './Entry': { import: './entry.js', name: 'exposed' } },
          shared: prefix
            ? {
                'prefix/': {
                  packageName: path.join(directory, 'shared.js'),
                  import: false as const,
                  requiredVersion: '^1.0.0',
                },
              }
            : shared
              ? {
                  './shared.js': {
                    version: '1.0.0',
                    requiredVersion: '^1.0.0',
                  },
                }
              : {},
          manifest: { useLegacyStats, additionalData },
        };
        const compiler = webpack({
          context: directory,
          mode: 'development',
          cache: {
            type: 'filesystem',
            cacheDirectory: path.join(directory, 'cache'),
          },
          entry: { first: './entry.js', second: './entry.js' },
          optimization: { runtimeChunk: 'multiple' },
          output: { path: directory, publicPath: '/', filename: '[name].js' },
          plugins: [
            native
              ? new webpack.container.ModuleFederationPlugin({
                  name: options.name,
                  filename: options.filename,
                  library: options.library,
                  exposes: options.exposes,
                  shared: options.shared,
                })
              : new EnhancedPlugin({ ...options, manifest: false }),
          ],
        });
        const statsPlugin = new StatsPlugin(options, {
          pluginVersion: 'test',
          bundler: 'webpack',
        });
        statsPlugin.apply(compiler);
        const statsManager = statsPlugin['_statsManager'];
        const generateStats = statsManager.generateStats;
        let readerCalls = 0;
        const collect = jest
          .spyOn(statsManager, 'generateStats')
          .mockImplementation(async function (compiler, compilation) {
            const getStats = jest.spyOn(compilation, 'getStats');
            const identifiers =
              !native && !useLegacyStats
                ? [...compilation.modules].flatMap((module) => [
                    jest.spyOn(module, 'identifier').mockImplementation(() => {
                      throw new Error('identifier parsing');
                    }),
                    jest
                      .spyOn(module, 'readableIdentifier')
                      .mockImplementation(() => {
                        throw new Error('readable identifier parsing');
                      }),
                  ])
                : [];
            try {
              const result = await generateStats.call(
                this,
                compiler,
                compilation,
              );
              readerCalls += getStats.mock.calls.length;
              return result;
            } finally {
              getStats.mockRestore();
              identifiers.forEach((spy) => spy.mockRestore());
            }
          });
        try {
          const result = await new Promise<Stats>((resolve, reject) => {
            compiler.run((error, stats) =>
              compiler.close((closeError) => {
                if (error || closeError) reject(error || closeError);
                else if (stats.hasErrors()) reject(new Error(stats.toString()));
                else resolve(stats);
              }),
            );
          });
          if (useLegacyStats === false) {
            const modules =
              result.toJson({ all: false, modules: true, cachedModules: true })
                .modules || [];
            expect(
              modules.some(
                (module) =>
                  module.name?.endsWith('/entry.js') && module.built === false,
              ),
            ).toBe(true);
          }
        } finally {
          collect.mockRestore();
        }
        expect(readerCalls).toBe(native || useLegacyStats ? 1 : 0);
        expect(additionalData).toHaveBeenCalledTimes(1);
        const stats = JSON.parse(
          await readFile(path.join(directory, 'mf-stats.json'), 'utf8'),
        );
        const manifest = JSON.parse(
          await readFile(path.join(directory, 'mf-manifest.json'), 'utf8'),
        );
        expect(stats.exposes).toHaveLength(1);
        expect(stats.exposes[0].assets.js.sync.length).toBeGreaterThan(0);
        expect(stats.shared).toHaveLength(shared ? 1 : 0);
        if (shared) expect(stats.shared[0].version).toBe('1.0.0');
        expect(manifest.metaData.types).toEqual({
          path: '',
          name: '',
          zip: '',
          api: '',
        });
        artifacts.push({ stats, manifest });
      }
      expect(artifacts[0]).toEqual(artifacts[1]);
      if (mode === 'enhanced-shared') {
        expect(artifacts[0].stats.exposes[0].requires).toEqual(['./shared.js']);
        expect(artifacts[0].stats.shared[0].usedIn).toEqual(['./Entry']);
        expect(artifacts[2].stats.exposes[0].requires).toEqual([]);
        expect(artifacts[2].stats.shared[0].usedIn).toEqual([]);
        artifacts[2].stats.exposes[0].requires = ['./shared.js'];
        artifacts[2].stats.shared[0].usedIn = ['./Entry'];
      }
      expect(artifacts[0]).toEqual(artifacts[2]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
  60000,
);
