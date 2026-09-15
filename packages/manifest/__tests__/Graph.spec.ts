/** @jest-environment node */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Stats } from 'webpack';
import { StatsPlugin } from '../src/StatsPlugin';
import { collectGraph } from '../src/collectGraph';
import { ModuleHandler } from '../src/ModuleHandler';

const webpack = process.getBuiltinModule('module').createRequire(__filename)(
  'webpack',
);

it.each(['exposes', 'plain-shared', 'enhanced-prefix'])(
  'collects %s with multiple runtimes',
  async (mode) => {
    const prefix = mode === 'enhanced-prefix';
    const shared = mode !== 'exposes';
    const directory = await mkdtemp(path.join(tmpdir(), 'mf-graph-'));
    try {
      await writeFile(
        path.join(directory, 'entry.js'),
        prefix
          ? 'module.exports = require("prefix/subpath");'
          : 'module.exports = require("./shared.js");',
      );
      await writeFile(
        path.join(directory, 'shared.js'),
        'module.exports = "shared";',
      );
      await writeFile(
        path.join(directory, 'package.json'),
        JSON.stringify({ name: 'prefix', version: '1.0.0' }),
      );
      const options = {
        name: 'plain',
        filename: 'container.js',
        library: { type: 'commonjs-module' },
        exposes: { './Entry': './entry.js' },
        shared: prefix
          ? {
              'prefix/': {
                packageName: path.join(directory, 'shared.js'),
                import: false as const,
                requiredVersion: '^1.0.0',
              },
            }
          : shared
            ? { './shared.js': { version: '1.0.0', requiredVersion: '1.0.0' } }
            : {},
      };
      const Plugin = prefix
        ? process
            .getBuiltinModule('module')
            .createRequire(
              path.resolve(__dirname, '../../enhanced/package.json'),
            )('@module-federation/enhanced').ModuleFederationPlugin
        : webpack.container.ModuleFederationPlugin;
      const compiler = webpack({
        context: directory,
        mode: 'development',
        entry: { first: './entry.js', second: './entry.js' },
        optimization: { runtimeChunk: 'multiple' },
        output: { path: directory, publicPath: '/', filename: '[name].js' },
        plugins: [
          new Plugin(prefix ? { ...options, manifest: false } : options),
        ],
      });
      new StatsPlugin(options, {
        pluginVersion: 'test',
        bundler: 'webpack',
      }).apply(compiler);
      const stats = await new Promise<Stats>((resolve, reject) => {
        compiler.run((error, stats) =>
          compiler.close((closeError) => {
            if (error || closeError) reject(error || closeError);
            else if (stats.hasErrors()) reject(new Error(stats.toString()));
            else resolve(stats);
          }),
        );
      });
      const graph = collectGraph(stats.compilation, options);
      if (prefix) {
        const reader = new ModuleHandler(
          options,
          stats.toJson({ all: false, modules: true }).modules || [],
          { bundler: 'webpack' },
        );
        expect(reader.collect().sharedMap['prefix/subpath']?.version).toBe(
          '1.0.0',
        );
        expect(graph?.sharedMap['prefix/subpath']?.version).toBe('1.0.0');
      } else if (shared) expect(graph).toBeUndefined();
      else
        expect(
          graph?.exposesMap['./Entry'].assets.js.sync.length,
        ).toBeGreaterThan(0);
      const artifact = JSON.parse(
        await readFile(path.join(directory, 'mf-stats.json'), 'utf8'),
      );
      expect(artifact.exposes).toHaveLength(1);
      expect(artifact.shared).toHaveLength(shared ? 1 : 0);
      if (shared) expect(artifact.shared[0].version).toBe('1.0.0');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);
