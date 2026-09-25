// Find which resolve knob makes @rspack/core's native MF plugin consume the ESM
// runtime entries. Usage: node knob.mjs <worktree> <knob>
// knobs: none | alias-wbr-abs | alias-wbr-abs+runtime | alias-all
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [wt, knob = 'none'] = process.argv.slice(2);
const require = createRequire(path.join(wt, 'package.json'));
const rspack = require(require.resolve('@rspack/core', { paths: [path.join(wt, 'packages/rspack')] }));
const { ModuleFederationPlugin } = require(path.join(wt, 'packages/rspack'));
const app = path.join(wt, 'apps', 'rfc-probe');
const outDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'out', 'knob', knob);

const pkg = (n) => path.join(wt, 'packages', n);
const wbrCjs = require.resolve('@module-federation/webpack-bundler-runtime', { paths: [path.join(wt, 'packages/runtime-tools/dist/bundler.js')] });
const aliases = {
  none: {},
  'alias-wbr-abs': { [wbrCjs]: path.join(pkg('webpack-bundler-runtime'), 'dist/index.js') },
  'alias-wbr-abs+runtime': {
    [wbrCjs]: path.join(pkg('webpack-bundler-runtime'), 'dist/index.js'),
    '@module-federation/runtime': path.join(pkg('runtime'), 'dist/index.js'),
  },
  'alias-all': {
    [wbrCjs]: path.join(pkg('webpack-bundler-runtime'), 'dist/index.js'),
    '@module-federation/runtime': path.join(pkg('runtime'), 'dist/index.js'),
    '@module-federation/runtime-core$': path.join(pkg('runtime-core'), 'dist/index.js'),
    '@module-federation/sdk$': path.join(pkg('sdk'), 'dist/index.js'),
  },
};

const config = {
  context: app,
  mode: 'production',
  target: 'web',
  devtool: false,
  entry: './src/index.js',
  output: { path: outDir, publicPath: 'auto', clean: true, uniqueName: 'rfcprobe' },
  resolve: { modules: [path.join(wt, 'node_modules'), 'node_modules'], alias: aliases[knob] },
  optimization: { minimize: false },
  plugins: [new ModuleFederationPlugin({ name: 'rfcprobe', filename: 'remoteEntry.js', dts: false, manifest: false, experiments: { optimization: { disableShared: true, disableRemote: true, disableSnapshot: true, target: 'web' } } })],
  infrastructureLogging: { level: 'error' },
  stats: 'none',
};

const stats = await new Promise((res, rej) => rspack(config, (e, s) => (e ? rej(e) : res(s))));
const json = stats.toJson({ all: false, errors: true });
if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('\n'));
const mods = new Set();
const add = (m) => {
  const s = (typeof m.nameForCondition === 'function' ? m.nameForCondition() : m.nameForCondition) || m.identifier();
  if (/packages\/(runtime|sdk|webpack-bundler-runtime|runtime-tools|error-codes)/.test(s)) mods.add(s.replace(/.*\/packages\//, ''));
};
for (const chunk of stats.compilation.chunks) for (const m of stats.compilation.chunkGraph.getChunkModulesIterable(chunk)) { add(m); if (m.modules) for (const inner of m.modules) add(inner); }
const list = [...mods].sort();
console.log(`knob=${knob} alias=${JSON.stringify(aliases[knob])}`);
console.log(`federation modules: ${list.length}  cjs=${list.filter((m) => m.endsWith('.cjs')).length} esm=${list.filter((m) => m.endsWith('.js')).length}`);
console.log(list.filter((m) => /shared\/index|remote\/index|snapshot\/index|initContainerEntry|generate-preload/.test(m)).join('\n'));
const main = fs.readFileSync(path.join(outDir, 'main.js'), 'utf8');
console.log(`main.js bytes=${main.length} markers: shared=${main.includes('Ensure the shared config for')} remote=${main.includes('preloadRemote failed to load')} container=${main.includes('initOptions.shared')}`);
