#!/usr/bin/env node
// Q1: can @module-federation/rspack redirect the native plugin's absolute
// webpack-bundler-runtime/dist/index.cjs import to a composed entry (virtual
// module or real file) via resolve.alias, and does persistent cache stay fresh?
// Q2: what does compiler.resolverFactory resolve package exports subpaths to,
// per dependencyType, from afterEnvironment vs make?
// Usage: node run.mjs [--core=2.1.8,2.1.10]. Each build runs in its own process.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const DIR = path.dirname(SELF);
const WT = '/fast/worktrees/rfc-probe-main';
const APP = path.join(DIR, 'app');
const CORES = {
  '2.1.8': path.join(WT, 'node_modules/.pnpm/@rspack+core@2.1.8_@module-federation+runtime-tools@2.9.0_@swc+helpers@0.5.23/node_modules/@rspack/core/dist/index.js'),
  '2.1.10': '/fast/worktrees/context-build-truncation/node_modules/.pnpm/@rspack+core@2.1.10_@swc+helpers@0.5.23/node_modules/@rspack/core/dist/index.js',
};
const require = createRequire(path.join(WT, 'package.json'));
// Same computation as the native plugin's `paths()`: the "require" condition wins.
const WBR_CJS = require.resolve('@module-federation/webpack-bundler-runtime', { paths: [path.join(WT, 'packages/runtime-tools/dist/bundler.js')] });
const WBR_ESM = path.join(WT, 'packages/webpack-bundler-runtime/dist/index.js');
const RUNTIME_ESM = path.join(WT, 'packages/runtime/dist/index.js');
const MF_OPTS = { name: 'rfcprobe', filename: 'remoteEntry.js', dts: false, manifest: false, exposes: { './Button': './src/button.js' }, experiments: { optimization: { disableShared: true, disableRemote: true, disableSnapshot: true, target: 'web' } } };

function composed(tag, pathMode) {
  const content = `import federation from ${JSON.stringify(WBR_ESM)};\nglobalThis.__MF_COMPOSED_TAG__ = ${JSON.stringify(tag)};\nexport default federation;\n`;
  const sha = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const file = path.join(APP, 'node_modules/.federation/rspack', pathMode === 'hash' ? `host.${sha}.mjs` : 'host.mjs');
  return { content, sha, file };
}

// Mirrors what the wrapper would do: register the composed entry during apply,
// then alias the absolute .cjs to it from an afterPlugins tap.
class ComposedEntryWrapper {
  constructor(MF, entry, how, prune) { Object.assign(this, { MF, entry, how, prune }); }
  apply(compiler) {
    new this.MF(structuredClone(MF_OPTS)).apply(compiler);
    const { file, content } = this.entry;
    if (this.how === 'virtual') new compiler.rspack.experiments.VirtualModulesPlugin({ [file]: content }).apply(compiler);
    else {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      if (this.prune) for (const f of fs.readdirSync(path.dirname(file))) if (f !== path.basename(file)) fs.rmSync(path.join(path.dirname(file), f));
      const tmp = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, content);
      fs.renameSync(tmp, file);
    }
    compiler.hooks.afterPlugins.tap('ComposedEntryAlias', () => {
      compiler.options.resolve.alias = { ...compiler.options.resolve.alias, [WBR_CJS]: file, '@module-federation/runtime': RUNTIME_ESM };
    });
  }
}

const Q2_DIRS = { runtime: 'packages/runtime', wbr: 'packages/webpack-bundler-runtime', 'runtime-tools': 'packages/runtime-tools' };
const Q2_REQS = ['@module-federation/runtime', '@module-federation/runtime/core', '@module-federation/webpack-bundler-runtime', '@module-federation/webpack-bundler-runtime/bundler', '@module-federation/runtime-core'];
class ResolverProbe {
  constructor(hooks, out) { Object.assign(this, { hooks, out }); }
  apply(compiler) {
    const probe = (when) => {
      const byDep = compiler.options.resolve.byDependency || {};
      const variants = {
        esm: { dependencyType: 'esm' },
        commonjs: { dependencyType: 'commonjs' },
        none: {},
        'esm+byDependency.esm': { dependencyType: 'esm', ...byDep.esm },
        'commonjs+byDependency.commonjs': { dependencyType: 'commonjs', ...byDep.commonjs },
      };
      for (const [v, opts] of Object.entries(variants)) {
        const r = compiler.resolverFactory.get('normal', opts);
        for (const [d, rel] of Object.entries(Q2_DIRS)) for (const req of Q2_REQS) {
          let res;
          try { res = r.resolveSync({}, path.join(WT, rel), req); } catch (e) { res = `ERR ${String(e.message).split('\n')[0].slice(0, 80)}`; }
          this.out.push({ when, variant: v, from: d, req, res: typeof res === 'string' ? res.replace(`${WT}/`, '') : String(res) });
        }
      }
    };
    if (this.hooks.includes('afterEnvironment')) compiler.hooks.afterEnvironment.tap('ResolverProbe', () => probe('afterEnvironment'));
    if (this.hooks.includes('make')) compiler.hooks.make.tap('ResolverProbe', () => probe('make'));
  }
}

function writeFixture() {
  fs.mkdirSync(path.join(APP, 'src'), { recursive: true });
  fs.writeFileSync(path.join(APP, 'src/index.js'), "import('./button.js').then((m) => console.log(m.default()));\n");
  fs.writeFileSync(path.join(APP, 'src/button.js'), "export default function Button() { return 'button'; }\n");
}

async function child(spec) {
  const rspack = require(CORES[spec.core]);
  const { ModuleFederationPlugin } = require(path.join(WT, 'packages/rspack'));
  const entry = spec.tag ? composed(spec.tag, spec.pathMode) : null;
  const outDir = path.join(DIR, 'out', spec.core, spec.id);
  const q2 = [];
  const alias = {};
  const plugins = [];
  if (spec.strategy === 'virtual-user') {
    plugins.push(new rspack.experiments.VirtualModulesPlugin({ [entry.file]: entry.content }), new ModuleFederationPlugin(structuredClone(MF_OPTS)));
    Object.assign(alias, { [WBR_CJS]: entry.file, '@module-federation/runtime': RUNTIME_ESM });
  } else if (spec.strategy === 'file-user') {
    fs.mkdirSync(path.dirname(entry.file), { recursive: true });
    fs.writeFileSync(entry.file, entry.content);
    plugins.push(new ModuleFederationPlugin(structuredClone(MF_OPTS)));
    Object.assign(alias, { [WBR_CJS]: entry.file, '@module-federation/runtime': RUNTIME_ESM });
  } else if (spec.strategy.includes('-wrapper')) {
    plugins.push(new ComposedEntryWrapper(ModuleFederationPlugin, entry, spec.strategy.startsWith('virtual') ? 'virtual' : 'file', spec.strategy === 'file-prune-wrapper'));
  } else plugins.push(new ModuleFederationPlugin(structuredClone(MF_OPTS)));
  if (spec.q2) plugins.unshift(new ResolverProbe(spec.q2, q2));
  const config = {
    context: APP, mode: 'production', target: 'web', devtool: false, entry: './src/index.js',
    output: { path: outDir, publicPath: 'auto', clean: true, uniqueName: 'rfcprobe' },
    resolve: { modules: [path.join(WT, 'node_modules'), 'node_modules'], alias },
    optimization: spec.mode === 'M2' ? { minimize: false } : {},
    cache: spec.cacheDir ? { type: 'persistent', storage: { type: 'filesystem', directory: spec.cacheDir } } : false,
    plugins, infrastructureLogging: { level: 'error' }, stats: 'none',
  };
  const t0 = Date.now();
  const stats = await new Promise((res, rej) => rspack(config, (err, st) => (err ? rej(err) : res(st))));
  const ms = Date.now() - t0;
  const json = stats.toJson({ all: false, errors: true, modules: true });
  const { compilation } = stats;
  const ids = [];
  for (const chunk of compilation.chunks) for (const m of compilation.chunkGraph.getChunkModulesIterable(chunk)) {
    for (const x of [m, ...(m.modules || [])]) ids.push(String(x.nameForCondition?.() ?? x.identifier?.() ?? ''));
  }
  const fed = ids.filter((s) => /packages\/(runtime|runtime-core|sdk|webpack-bundler-runtime|error-codes)\/|\.federation\//.test(s));
  const js = fs.existsSync(outDir) ? fs.readdirSync(outDir).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(outDir, f), 'utf8')).join('\n') : '';
  const tagsInJs = [...new Set([...js.matchAll(/__MF_COMPOSED_TAG__ = "([^"]+)"/g)].map((m) => m[1]))];
  const smoke = fs.existsSync(path.join(outDir, 'remoteEntry.js')) ? runSmoke(path.join(outDir, 'remoteEntry.js')) : 'no remoteEntry.js';
  return {
    ...spec, ms, errors: (json.errors || []).map((e) => e.message.split('\n')[0]),
    composedPath: entry && entry.file.replace(`${APP}/`, ''), composedSha: entry?.sha,
    composedInGraph: fed.filter((s) => s.includes('.federation/')).map((s) => s.replace(/.*\.federation\//, '.federation/')),
    wbrCjsInGraph: ids.some((s) => s.includes('webpack-bundler-runtime/dist/index.cjs')),
    wbrEsmInGraph: ids.some((s) => s.includes('webpack-bundler-runtime/dist/index.js')),
    fedCjs: fed.filter((s) => s.endsWith('.cjs')).length, fedEsm: fed.filter((s) => /\.(js|mjs)$/.test(s)).length,
    builtModules: (json.modules || []).filter((m) => m.built).length, totalModules: (json.modules || []).length,
    tagsInJs, smoke, q2: spec.q2 ? q2 : undefined,
  };
}

const STUB = `
const el = () => ({ setAttribute() {}, appendChild() {}, addEventListener() {}, getAttribute() {}, removeAttribute() {}, tagName: 'SCRIPT', src: '' });
globalThis.window = globalThis; globalThis.self = globalThis;
globalThis.document = { createElement: el, head: el(), body: el(), getElementsByTagName: () => [el()], querySelector: () => null, currentScript: { src: 'http://localhost/remoteEntry.js', tagName: 'SCRIPT' }, baseURI: 'http://localhost/', defaultView: globalThis };
globalThis.location = { href: 'http://localhost/' }; globalThis.navigator = {};
try {
  require(process.argv[1]);
  const inst = globalThis.__FEDERATION__?.__INSTANCES__?.[0];
  console.log(inst ? 'ok instance=' + inst.name + ' sharedHandler=' + inst.sharedHandler.constructor.name + ' remoteHandler=' + inst.remoteHandler.constructor.name + ' tag=' + globalThis.__MF_COMPOSED_TAG__ : 'no federation instance tag=' + globalThis.__MF_COMPOSED_TAG__);
} catch (e) { console.log('THREW ' + String(e.message).split('\\n')[0]); }`;
function runSmoke(file) {
  const r = spawnSync(process.execPath, ['-e', STUB, file], { encoding: 'utf8', timeout: 10000 });
  return r.stdout.trim() || r.stderr.trim().split('\n')[0];
}

function spawnChild(spec) {
  const r = spawnSync(process.execPath, [SELF, `--child=${JSON.stringify(spec)}`], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const line = r.stdout.split('\n').find((l) => l.startsWith('RESULT '));
  if (!line) return { ...spec, crashed: (r.stderr || r.stdout).trim().split('\n').slice(0, 3).join(' | ') };
  return JSON.parse(line.slice(7));
}

function plan(core) {
  const rows = [];
  const cacheRoot = path.join(DIR, 'cache', core);
  fs.rmSync(cacheRoot, { recursive: true, force: true });
  fs.rmSync(path.join(APP, 'node_modules/.federation'), { recursive: true, force: true });
  const b = (spec) => rows.push(spawnChild({ core, mode: 'M2', ...spec }));
  b({ id: 'control-none', strategy: 'none' });
  b({ id: 'virtual-user-alias', strategy: 'virtual-user', tag: 'A', pathMode: 'hash' });
  for (const strategy of ['virtual-wrapper', 'file-wrapper', 'file-prune-wrapper', 'file-user']) {
    fs.rmSync(path.join(APP, 'node_modules/.federation'), { recursive: true, force: true });
    if (strategy.endsWith('-wrapper')) b({ id: `${strategy}-M1`, strategy, tag: 'A', pathMode: 'hash', mode: 'M1' });
    for (const pathMode of strategy === 'virtual-wrapper' || strategy === 'file-wrapper' ? ['hash', 'fixed'] : ['hash']) {
      const cacheDir = path.join(cacheRoot, `${strategy}-${pathMode}`);
      for (const [i, tag] of ['A', 'B', 'B', 'A'].entries()) b({ id: `${strategy}-${pathMode}-cache${i + 1}-${tag}`, strategy, tag, pathMode, cacheDir });
    }
  }
  b({ id: 'q2-afterEnvironment+make', strategy: 'none', q2: ['afterEnvironment', 'make'] });
  b({ id: 'q2-make-only', strategy: 'none', q2: ['make'] });
  return rows;
}

function render(results) {
  const out = ['# rspack composed-entry probe (Q1 alias to virtual/real file, Q2 resolverFactory conditions)', '', `Generated ${new Date().toISOString()} by probe/rspack-virtual/run.mjs. Profile ALL-OFF+expose, production. M2 = minimize:false. Smoke loads remoteEntry.js under a DOM stub.`, '', `Alias key (absolute, what the native plugin imports): \`${WBR_CJS}\``, ''];
  for (const [core, rows] of Object.entries(results)) {
    out.push(`## @rspack/core ${core}`, '', '| build | mode | composed path | in graph | wbr .cjs in graph | wbr .js in graph | fed cjs/esm | built/total | tag in JS | smoke | ms |', '|---|---|---|---|---|---|---|---|---|---|---|');
    for (const r of rows) {
      if (r.crashed || r.errors?.length) { out.push(`| ${r.id} | ${r.mode} | ${r.composedPath ?? ''} | ERROR ${(r.crashed || r.errors.join('; ')).replace(/\|/g, '/')} |||||||`); continue; }
      out.push(`| ${r.id} | ${r.mode} | ${r.composedPath ?? '-'} | ${r.composedInGraph.join(', ') || '-'} | ${r.wbrCjsInGraph} | ${r.wbrEsmInGraph} | ${r.fedCjs}/${r.fedEsm} | ${r.builtModules}/${r.totalModules} | ${r.tagsInJs.join(',') || '-'} | ${r.smoke.replace(/\|/g, '/')} | ${r.ms} |`);
    }
    out.push('');
    for (const r of rows.filter((x) => x.q2)) {
      out.push(`### ${r.id}`, '', '| when | variant | from | request | resolved |', '|---|---|---|---|---|');
      for (const q of r.q2 || []) out.push(`| ${q.when} | ${q.variant} | ${q.from} | ${q.req} | ${q.res} |`);
      if (r.crashed) out.push(`crashed: ${r.crashed}`);
      out.push('');
    }
  }
  const notes = path.join(DIR, 'notes.md');
  if (fs.existsSync(notes)) out.push(fs.readFileSync(notes, 'utf8'));
  return out.join('\n');
}

const childArg = process.argv.find((a) => a.startsWith('--child='));
if (childArg) {
  child(JSON.parse(childArg.slice(8))).then((r) => console.log(`RESULT ${JSON.stringify(r)}`), (e) => { console.error(e); process.exit(1); });
} else {
  writeFixture();
  const cores = ((process.argv.find((a) => a.startsWith('--core=')) || '--core=2.1.8,2.1.10').slice(7)).split(',');
  const results = {};
  for (const core of cores) results[core] = plan(core);
  fs.writeFileSync(path.join(DIR, 'results.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(DIR, 'results.md'), render(results));
  console.log(render(results));
}
