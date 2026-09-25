#!/usr/bin/env node
// RFC 5036 premise probe. Builds a tiny MF host with webpack + rspack across
// worktrees x profiles x modes and reports, per capability implementation,
// whether it is in the module graph and whether its marker string survives in
// the emitted JS. Usage: node run.mjs [--only=main|main-proto|07]
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROBE_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = path.join(PROBE_DIR, 'out');

const WORKTREES = {
  main: { dir: '/fast/worktrees/rfc-probe-main', ref: 'origin/main (baseline)' },
  'main-proto': { dir: '/fast/worktrees/rfc-probe-main', ref: 'rfc-probe/fold-at-parse (prototype)' },
  '07': { dir: '/fast/worktrees/rfc-probe-07', ref: 'origin/rfc5036/07-handler-contracts' },
  // rspack-only labels: same checkouts, plus the resolve.alias knob that makes
  // @rspack/core's native MF plugin consume the ESM runtime entries.
  'main-rspack-esm': { dir: '/fast/worktrees/rfc-probe-main', ref: 'origin/main + rspack ESM alias knob', branch: 'HEAD', rspackEsm: true, bundlers: ['rspack'], modes: ['M1', 'M2', 'M3+se'] },
  'proto-rspack-esm': { dir: '/fast/worktrees/rfc-probe-main', ref: 'rfc-probe/fold-at-parse + rspack ESM alias knob', branch: 'rfc-probe/fold-at-parse', rspackEsm: true, bundlers: ['rspack'], modes: ['M1', 'M2', 'M3+se'] },
  // Same, on @rspack/core 2.1.8 (ships a native HoistContainerReferencesPlugin; 1.3.9 has none).
  'proto-rspack2-esm': { dir: '/fast/worktrees/rfc-probe-main', ref: 'rfc-probe/fold-at-parse + rspack ESM alias knob, @rspack/core 2.1.8', branch: 'rfc-probe/fold-at-parse', rspackEsm: true, bundlers: ['rspack'], modes: ['M1', 'M2', 'M3+se'], rspackCore: '/fast/worktrees/rfc-probe-main/node_modules/.pnpm/@rspack+core@2.1.8_@module-federation+runtime-tools@2.9.0_@swc+helpers@0.5.23/node_modules/@rspack/core/dist/index.js' },
  'kernel-root': { dir: '/fast/worktrees/rfc-probe-main', ref: 'rfc-probe/kernel-split, root (legacy) bootstrap, @rspack/core 1.x default', branch: 'rfc-probe/kernel-split' },
  // Kernel-split prototype: both bootstraps' bundler-runtime import is aliased to
  // a hand-written composition file per profile (COMPOSE below).
  composed: { dir: '/fast/worktrees/rfc-probe-main', ref: 'rfc-probe/kernel-split (kernel + capability subpaths, composed bootstrap), @rspack/core 2.1.8', branch: 'rfc-probe/kernel-split', composed: true, rspackCore: '/fast/worktrees/rfc-probe-main/node_modules/.pnpm/@rspack+core@2.1.8_@module-federation+runtime-tools@2.9.0_@swc+helpers@0.5.23/node_modules/@rspack/core/dist/index.js' },
  // Like-for-like rspack baseline for composed: legacy bootstrap at the prototype's base, same @rspack/core 2.1.8, no ESM knob.
  'main-rspack2': { dir: '/fast/worktrees/rfc-probe-main', ref: 'origin/main base 6bd7ea0aa (legacy bootstrap), @rspack/core 2.1.8', branch: 'HEAD', bundlers: ['rspack'], rspackCore: '/fast/worktrees/rfc-probe-main/node_modules/.pnpm/@rspack+core@2.1.8_@module-federation+runtime-tools@2.9.0_@swc+helpers@0.5.23/node_modules/@rspack/core/dist/index.js' },
  // Same composition after the slots + attach commit; webpack only, M1 and M3.
  attach: { dir: '/fast/worktrees/rfc-probe-main', ref: 'rfc-probe/kernel-split + slots/attach (composed bootstrap)', branch: 'rfc-probe/kernel-split', composed: true, bundlers: ['webpack'], modes: ['M1', 'M3'] },
};

// Per profile: which adapters and capabilities the composition file imports.
const COMPOSE = {
  'ALL-OFF': { adapters: [], caps: [] },
  'remotes-only': { adapters: ['remotes', 'share-scope'], caps: ['remote', 'platform/web'] },
  'ALL-OFF+expose': { adapters: ['container', 'share-scope'], caps: [] },
  DEFAULT: { adapters: ['remotes', 'consumes', 'share-scope', 'container'], caps: ['shared', 'remote', 'snapshot', 'platform/web'] },
};
const ADAPTER_EXPORT = { remotes: 'remotes', consumes: 'consumes', 'share-scope': 'shareScope', container: 'container' };
const CAP_FILE = { shared: ['shared', 'shared/capability.js'], remote: ['remote', 'remote/capability.js'], snapshot: ['snapshot', 'plugins/snapshot/capability.js'], 'platform/web': ['web', 'platform/web.js'] };

function writeComposition(wt, profile) {
  const { adapters, caps } = COMPOSE[profile];
  const wbr = path.join(wt, 'packages/webpack-bundler-runtime/dist');
  const rc = path.join(wt, 'packages/runtime-core/dist');
  const capKey = { shared: 'shared', remote: 'remote', snapshot: 'snapshot', 'platform/web': 'platform' };
  const src = [
    `import { createFederation } from '${wbr}/compose.js';`,
    ...adapters.map((a) => `import { ${ADAPTER_EXPORT[a]} } from '${wbr}/adapters/${a}.js';`),
    ...caps.map((c) => `import { ${CAP_FILE[c][0]} } from '${rc}/${CAP_FILE[c][1]}';`),
    `export default createFederation({`,
    `  capabilities: { ${caps.map((c) => `${capKey[c]}: ${CAP_FILE[c][0]}`).join(', ')} },`,
    `  adapters: [${adapters.map((a) => ADAPTER_EXPORT[a]).join(', ')}],`,
    `});`,
    '',
  ].join('\n');
  const file = path.join(wt, 'apps', 'rfc-probe', 'compose', `${profile}.js`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, src);
  return file;
}

// The path each bootstrap imports: enhanced's getTemplate emits resolveRuntimePaths().bundlerRuntimePath
// (the /bundler subpath from runtime-tools); @rspack/core 2.1.8 emits require.resolve() of the bare name (.cjs).
function composedAlias(wt, require, bundler, profile) {
  const file = writeComposition(wt, profile);
  if (bundler === 'webpack') {
    const tools = require.resolve('@module-federation/runtime-tools/bundler', { paths: [path.join(wt, 'packages/enhanced')] });
    return { [require.resolve('@module-federation/webpack-bundler-runtime/bundler', { paths: [tools] })]: file };
  }
  const wbrCjs = require.resolve('@module-federation/webpack-bundler-runtime', { paths: [path.join(wt, 'packages/runtime-tools/dist/bundler.js')] });
  return { [wbrCjs]: file, '@module-federation/runtime': path.join(wt, 'packages/runtime/dist/index.js') };
}

// The native plugin's generated entry imports the absolute path that Node's
// require.resolve('@module-federation/webpack-bundler-runtime') returns (the
// "require" condition, so dist/index.cjs) and aliases '@module-federation/runtime'
// to the .cjs the same way. Aliasing that absolute .cjs path to dist/index.js and
// overriding the non-$ runtime alias flips the whole chain to ESM; runtime-core
// and sdk then resolve through the "import" condition on their own.
function rspackEsmAlias(wt, require) {
  const wbrCjs = require.resolve('@module-federation/webpack-bundler-runtime', { paths: [path.join(wt, 'packages/runtime-tools/dist/bundler.js')] });
  return {
    [wbrCjs]: path.join(wt, 'packages/webpack-bundler-runtime/dist/index.js'),
    '@module-federation/runtime': path.join(wt, 'packages/runtime/dist/index.js'),
  };
}

const SELECTOR_CONDITIONS = [
  'module-federation:no-shared',
  'module-federation:no-remote',
  'module-federation:no-snapshot-plugins',
  'module-federation:no-container-entry',
  'module-federation:target-web',
];

// One row per implementation: where it lives in dist (both the main layout and
// the 07 selector layout) and a string literal unique to it that minifiers keep.
const IMPLS = [
  { key: 'shared', label: 'SharedHandler', mod: /runtime-core\/dist\/shared\/index\.(js|cjs)$/, marker: 'Ensure the shared config for' },
  { key: 'remote', label: 'RemoteHandler', mod: /runtime-core\/dist\/remote\/index\.(js|cjs)$/, marker: 'preloadRemote failed to load' },
  { key: 'module', label: 'Module (remote)', mod: /runtime-core\/dist\/module\/index\.(js|cjs)$/, marker: 'remoteEntryExports is undefined' },
  { key: 'snapshot', label: 'snapshotPlugin', mod: /runtime-core\/dist\/plugins\/snapshot\/index\.(js|cjs)$/, marker: '"snapshot-plugin"' },
  { key: 'preload', label: 'generatePreloadAssets', mod: /runtime-core\/dist\/plugins\/generate-preload-assets\.(js|cjs)$/, marker: 'generate-preload-assets-plugin' },
  { key: 'container', label: 'initContainerEntry', mod: /webpack-bundler-runtime\/dist\/initContainerEntry\.(js|cjs)$/, marker: 'initOptions.shared' },
  { key: 'sdknode', label: 'sdk node loader', mod: /sdk\/dist\/(node|selectors\/platform-loader\/node)\.(js|cjs)$/, marker: 'Script execution error' },
];
// Barrels that would pull capabilities back: graph-only columns (no marker).
const BARRELS = [
  { key: 'rcRoot', mod: /runtime-core\/dist\/index\.(js|cjs)$/ },
  { key: 'sdkRoot', mod: /sdk\/dist\/index\.(js|cjs)$/ },
  { key: 'rtRoot', mod: /packages\/runtime\/dist\/(index|bundler)\.(js|cjs)$/ },
  { key: 'wbrRoot', mod: /webpack-bundler-runtime\/dist\/(index|bundler)\.(js|cjs)$/ },
];

const PROFILES = {
  'ALL-OFF': {
    mf: { experiments: { optimization: { disableShared: true, disableRemote: true, disableSnapshot: true, target: 'web' } } },
  },
  DEFAULT: {
    mf: {
      remotes: { remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js' },
      shared: { tslib: {} },
      exposes: { './Button': './src/button.js' },
    },
  },
  // rspack's default federation runtime only calls runtime.init when
  // initializeSharingData or initializeExposesData exists, so ALL-OFF never
  // creates an instance there. One expose gives the smoke an instance to inspect.
  'ALL-OFF+expose': {
    mf: { exposes: { './Button': './src/button.js' }, experiments: { optimization: { disableShared: true, disableRemote: true, disableSnapshot: true, target: 'web' } } },
  },
  'remotes-only': {
    mf: { remotes: { remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js' }, experiments: { optimization: { disableShared: true, disableSnapshot: true, target: 'web' } } },
  },
  'ALL-OFF+cond': {
    mf: { experiments: { optimization: { disableShared: true, disableRemote: true, disableSnapshot: true, target: 'web' } } },
    conditions: SELECTOR_CONDITIONS,
  },
};

const MODES = {
  M1: {},
  M2: { minimize: false },
  M3: { minimize: false, sideEffects: false, usedExports: false, concatenateModules: false, innerGraph: false },
  'M3+se': { minimize: false, sideEffects: true, usedExports: false, concatenateModules: false, innerGraph: false },
};

const MATRIX = {
  main: ['ALL-OFF', 'DEFAULT'],
  'main-proto': ['ALL-OFF', 'DEFAULT'],
  '07': ['ALL-OFF', 'ALL-OFF+cond', 'DEFAULT'],
  'main-rspack-esm': ['ALL-OFF', 'ALL-OFF+expose', 'DEFAULT'],
  'proto-rspack-esm': ['ALL-OFF', 'ALL-OFF+expose', 'DEFAULT'],
  'proto-rspack2-esm': ['ALL-OFF', 'ALL-OFF+expose', 'DEFAULT'],
  'kernel-root': ['ALL-OFF', 'DEFAULT'],
  composed: ['ALL-OFF', 'remotes-only', 'ALL-OFF+expose', 'DEFAULT'],
  attach: ['ALL-OFF', 'remotes-only', 'ALL-OFF+expose', 'DEFAULT'],
  'main-rspack2': ['ALL-OFF', 'remotes-only', 'DEFAULT'],
};

function writeFixture(wt) {
  const app = path.join(wt, 'apps', 'rfc-probe');
  fs.mkdirSync(path.join(app, 'src'), { recursive: true });
  fs.writeFileSync(path.join(app, 'src', 'index.js'), "import 'tslib';\nimport('./button.js').then((m) => console.log(m.default()));\n");
  fs.writeFileSync(path.join(app, 'src', 'button.js'), "export default function Button() { return 'button'; }\n");
  return app;
}

function flattenModules(mods, acc = []) {
  for (const m of mods || []) {
    acc.push(m);
    if (m.modules) flattenModules(m.modules, acc);
    if (m.children) flattenModules(m.children, acc);
  }
  return acc;
}

function modulePath(m) {
  const s = m.nameForCondition || m.identifier || m.name || '';
  const hit = s.match(/\/fast\/worktrees\/[^|?!\s]+/g);
  return hit ? hit[hit.length - 1] : s;
}

// For every tracked implementation or barrel in an emitted chunk, the shortest
// chain of active incoming connections back to a module with none (the entry).
function importChains(compilation) {
  const { moduleGraph, chunkGraph } = compilation;
  const pathOf = (m) => modulePath({ nameForCondition: (typeof m.nameForCondition === 'function' ? m.nameForCondition() : m.nameForCondition) || undefined, identifier: typeof m.identifier === 'function' ? m.identifier() : m.identifier, name: m.resource });
  const inChunk = (m) => { try { return chunkGraph.getNumberOfModuleChunks(m) > 0; } catch { return true; } };
  const incoming = (m) => {
    const out = [];
    for (const c of moduleGraph.getIncomingConnections(m) || []) {
      const o = c.originModule;
      if (!o || !inChunk(o)) continue;
      let active = true;
      try { active = typeof c.isActive === 'function' ? c.isActive(undefined) : c.active !== false; } catch {}
      if (!active) continue;
      out.push({ o, req: c.dependency?.request ?? c.dependency?.userRequest ?? '' });
    }
    return out;
  };
  const targets = [...IMPLS, ...BARRELS];
  const res = {};
  for (const m of compilation.modules) {
    const p = pathOf(m);
    const t = targets.find((x) => x.mod.test(p));
    if (!t || !inChunk(m)) continue;
    const seen = new Set([m]);
    const queue = [[m, [p.replace(/.*\/packages\//, '')]]];
    let chain = null;
    while (queue.length && !chain) {
      const [cur, trail] = queue.shift();
      const ins = incoming(cur);
      if (!ins.length) chain = trail;
      for (const { o, req } of ins) {
        if (seen.has(o)) continue;
        seen.add(o);
        queue.push([o, [`${pathOf(o).replace(/.*\/packages\//, '').replace(/.*\/apps\//, 'apps/')} --${req}-->`, ...trail]]);
      }
    }
    res[t.key] = chain || ['(no chain found)'];
  }
  return res;
}

async function buildCell({ wt, label, bundler, profile, mode }) {
  const require = createRequire(path.join(wt, 'package.json'));
  const app = writeFixture(wt);
  const outDir = path.join(OUT_ROOT, label, bundler, profile, mode);
  fs.rmSync(outDir, { recursive: true, force: true });
  const prof = PROFILES[profile];
  const isWebpack = bundler === 'webpack';
  const engine = isWebpack
    ? require(require.resolve('webpack', { paths: [path.join(wt, 'packages/enhanced')] }))
    : require(WORKTREES[label].rspackCore || require.resolve('@rspack/core', { paths: [path.join(wt, 'packages/rspack')] }));
  const { ModuleFederationPlugin } = require(path.join(wt, isWebpack ? 'packages/enhanced' : 'packages/rspack'));

  const config = {
    context: app,
    mode: 'production',
    target: 'web',
    devtool: false,
    entry: './src/index.js',
    output: { path: outDir, publicPath: 'auto', clean: true, uniqueName: WORKTREES[label].composed && profile === 'ALL-OFF+expose' ? 'remoteApp' : 'rfcprobe' },
    resolve: {
      modules: [path.join(wt, 'node_modules'), 'node_modules'],
      ...(prof.conditions ? { conditionNames: [...prof.conditions, '...'] } : {}),
      ...(WORKTREES[label].rspackEsm && !isWebpack ? { alias: rspackEsmAlias(wt, require) } : {}),
      ...(WORKTREES[label].composed ? { alias: composedAlias(wt, require, bundler, profile) } : {}),
    },
    optimization: { ...MODES[mode] },
    plugins: [
      new ModuleFederationPlugin({ name: WORKTREES[label].composed && profile === 'ALL-OFF+expose' ? 'remoteApp' : 'rfcprobe', filename: 'remoteEntry.js', dts: false, manifest: false, ...prof.mf }),
    ],
    infrastructureLogging: { level: 'error' },
    stats: 'none',
  };

  const stats = await new Promise((resolve, reject) => {
    engine(config, (err, st) => (err ? reject(err) : resolve(st)));
  });
  // Graph membership = the module is inside an emitted chunk, read from the
  // chunk graph itself. stats.modules also lists orphans that only an inactive
  // (side-effect-free) connection reaches, and stats chunk module lists collapse
  // children into filteredChildren.
  const json = stats.toJson({ all: false, assets: true, errors: true, warnings: false });
  if (json.errors?.length) throw new Error(`${label}/${bundler}/${profile}/${mode}: ${json.errors.map((e) => e.message).join('\n')}`);
  const { compilation } = stats;
  const mods = [];
  const add = (m) => {
    const id = typeof m.nameForCondition === 'function' ? m.nameForCondition() : m.nameForCondition;
    const ident = typeof m.identifier === 'function' ? m.identifier() : m.identifier;
    mods.push(modulePath({ nameForCondition: id || undefined, identifier: ident, name: m.resource }));
  };
  for (const chunk of compilation.chunks) {
    for (const m of compilation.chunkGraph.getChunkModulesIterable(chunk)) {
      add(m);
      if (m.modules) for (const inner of m.modules) add(inner);
    }
  }
  const isFed = (p) => /@module-federation|packages\/(runtime|sdk|webpack-bundler-runtime|runtime-tools|error-codes)/.test(p);
  const fedMods = [...new Set(mods.filter(isFed))].sort();
  fs.writeFileSync(path.join(outDir, 'modules.json'), JSON.stringify(fedMods, null, 2));
  // Built but in no chunk: the module was parsed, then every connection into it
  // went inactive (sideEffects pruning) and nothing hoisted it back.
  const inChunk = new Set(fedMods);
  const orphans = [];
  for (const m of compilation.modules) {
    const id = typeof m.nameForCondition === 'function' ? m.nameForCondition() : m.nameForCondition;
    const ident = typeof m.identifier === 'function' ? m.identifier() : m.identifier;
    const p = modulePath({ nameForCondition: id || undefined, identifier: ident, name: m.resource });
    if (isFed(p) && !inChunk.has(p)) orphans.push(p);
  }
  fs.writeFileSync(path.join(outDir, 'orphans.json'), JSON.stringify(orphans.sort(), null, 2));
  if (WORKTREES[label].composed) fs.writeFileSync(path.join(outDir, 'chains.json'), JSON.stringify(importChains(compilation), null, 2));

  const jsAssets = fs.readdirSync(outDir).filter((f) => f.endsWith('.js'));
  const contents = Object.fromEntries(jsAssets.map((f) => [f, fs.readFileSync(path.join(outDir, f), 'utf8')]));
  const allJs = Object.values(contents).join('\n');
  const mainName = jsAssets.find((f) => /^main\.(js|cjs)$/.test(f)) || jsAssets[0];

  const row = { label, bundler, profile, mode, graph: {}, emitted: {}, bytesTotal: allJs.length, bytesMain: contents[mainName]?.length ?? 0, assets: jsAssets.map((f) => `${f}=${contents[f].length}`), fedInChunks: fedMods.length, fedOrphans: orphans.length };
  row.barrels = Object.fromEntries(BARRELS.map((b) => [b.key, mods.some((p) => b.mod.test(p))]));
  for (const impl of IMPLS) {
    row.graph[impl.key] = mods.some((p) => impl.mod.test(p));
    row.emitted[impl.key] = allJs.includes(impl.marker);
    if (row.emitted[impl.key] && !row.graph[impl.key]) row.inconclusive = true;
  }
  return row;
}

async function runChild(label) {
  const wt = WORKTREES[label].dir;
  const rows = [];
  for (const profile of MATRIX[label]) {
    for (const bundler of WORKTREES[label].bundlers || ['webpack', 'rspack']) {
      for (const mode of WORKTREES[label].modes || Object.keys(MODES)) {
        rows.push(await buildCell({ wt, label, bundler, profile, mode }));
        process.stderr.write(`built ${label} ${bundler} ${profile} ${mode}\n`);
      }
    }
  }
  process.stdout.write(JSON.stringify(rows));
}

function cell(row, impl) {
  const g = row.graph[impl.key] ? 'G' : '-';
  const e = row.emitted[impl.key] ? 'E' : '-';
  return row.emitted[impl.key] && !row.graph[impl.key] ? `${g}${e}?` : `${g}${e}`;
}

function renderTable(label, rows) {
  const bar = WORKTREES[label].composed ? BARRELS : [];
  const head = `| bundler | profile | mode | ${IMPLS.map((i) => i.key).join(' | ')} | main bytes | total JS bytes | fed mods in chunks | fed orphans |${bar.map((b) => ` ${b.key} |`).join('')}`;
  const sep = `|${'---|'.repeat(IMPLS.length + 7 + bar.length)}`;
  const lines = rows.map((r) => `| ${r.bundler} | ${r.profile} | ${r.mode} | ${IMPLS.map((i) => cell(r, i)).join(' | ')} | ${r.bytesMain} | ${r.bytesTotal} | ${r.fedInChunks ?? ''} | ${r.fedOrphans ?? ''} |${bar.map((b) => ` ${r.barrels?.[b.key] ? 'G' : '-'} |`).join('')}`);
  return [`### ${label}  (${WORKTREES[label].ref})`, '', head, sep, ...lines, ''].join('\n');
}

async function main() {
  const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
  const child = process.argv.find((a) => a.startsWith('--child='));
  if (child) return runChild(child.slice(8));

  const labels = Object.keys(WORKTREES).filter((l) => !only || only.split(',').includes(l));
  // main and main-proto share one worktree at different checkouts, so results
  // accumulate across invocations: rerunning a label replaces only that label.
  const resultsPath = path.join(PROBE_DIR, 'results.json');
  const results = fs.existsSync(resultsPath) ? JSON.parse(fs.readFileSync(resultsPath, 'utf8')) : {};
  for (const label of labels) {
    const wt = WORKTREES[label].dir;
    const want = WORKTREES[label].branch ?? (label === 'main-proto' ? 'rfc-probe/fold-at-parse' : label === 'main' ? 'HEAD' : null);
    if (want) {
      const cur = spawnSync('git', ['-C', wt, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
      if (cur !== want) { console.error(`skip ${label}: worktree is on ${cur}, expected ${want} (checkout and rebuild first)`); continue; }
    }
    // Each worktree in its own process: two rspack native bindings in one process is asking for trouble.
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), `--child=${label}`], { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'inherit'] });
    if (r.status !== 0) { console.error(`child ${label} failed`); continue; }
    results[label] = JSON.parse(r.stdout);
  }

  const md = [
    '# RFC 5036 premise probe results',
    '',
    `Generated ${new Date().toISOString()} by probe/run.mjs. Cell legend: first char G = implementation module is in the module graph (resolved path from stats, nested/concatenated modules flattened), second char E = its marker string survives in emitted JS. \`--\` = absent from both.`,
    '',
    'Modes: M1 = production default; M2 = production, minimize:false; M3 = minimize:false, sideEffects:false, usedExports:false, concatenateModules:false, innerGraph:false (the RFC criterion); M3+se = M3 with optimization.sideEffects back on (the one pass fold-at-parse needs).',
    '',
    'Profiles: ALL-OFF = no remotes/shared/exposes + experiments.optimization {disableShared, disableRemote, disableSnapshot, target:web}; DEFAULT = one remote, shared tslib, one expose, no optimization flags; ALL-OFF+cond = ALL-OFF plus resolve.conditionNames = selector conditions + "..."; ALL-OFF+expose = ALL-OFF plus one expose (rspack only inits the runtime when shared or exposes data exists).',
    '',
    'Columns "fed mods in chunks" / "fed orphans": federation modules placed in an emitted chunk vs built but left out of every chunk (only inactive connections reach them). Empty on rows from before these columns existed.',
    '',
    'Markers: ' + IMPLS.map((i) => `${i.key} -> \`${i.marker}\` (${i.mod})`).join('; '),
    '',
    ...Object.keys(WORKTREES).filter((l) => results[l]).map((label) => renderTable(label, results[label])),
    '## Resolved federation modules per cell',
    '',
    ...Object.keys(WORKTREES).filter((l) => results[l]).flatMap((label) => results[label].map((r) => `- ${label}/${r.bundler}/${r.profile}/${r.mode}: ${r.assets.join(', ')} ; modules in out/${label}/${r.bundler}/${r.profile}/${r.mode}/modules.json`)),
    '',
    // Hand-written verdicts live in notes.md so a rerun regenerates the tables without losing them.
    ...(fs.existsSync(path.join(PROBE_DIR, 'notes.md')) ? [fs.readFileSync(path.join(PROBE_DIR, 'notes.md'), 'utf8')] : []),
  ].join('\n');
  fs.writeFileSync(path.join(PROBE_DIR, 'results.md'), md);
  fs.writeFileSync(path.join(PROBE_DIR, 'results.json'), JSON.stringify(results, null, 2));
  console.log(md);
}

main().catch((e) => { console.error(e); process.exit(1); });
