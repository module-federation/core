#!/usr/bin/env node
// Q2 prototype "fold at parse": inline the DefinePlugin checks at every use
// site so ConstPlugin (webpack) / the SWC const folder (rspack) drops the dead
// branch at parse time, and flag the runtime packages side-effect-free so an
// import that is only referenced inside a folded branch leaves the graph.
// Usage: node apply-proto.mjs /fast/worktrees/rfc-probe-main
import fs from 'node:fs';
import path from 'node:path';

const wt = process.argv[2];
if (!wt) throw new Error('worktree path required');

const NO_REMOTE = "(typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean' ? !FEDERATION_OPTIMIZE_NO_REMOTE : true)";
const NO_SHARED = "(typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean' ? !FEDERATION_OPTIMIZE_NO_SHARED : true)";
const NO_SNAPSHOT = "(typeof FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN === 'boolean' ? !FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN : true)";
const HAS_EXPOSES = "(typeof FEDERATION_HAS_EXPOSES === 'boolean' ? FEDERATION_HAS_EXPOSES : true)";

function edit(rel, replacements) {
  const file = path.join(wt, rel);
  let src = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) {
    if (!src.includes(from)) throw new Error(`${rel}: pattern not found:\n${from}`);
    src = src.split(from).join(to);
  }
  fs.writeFileSync(file, src);
}

function setSideEffects(rel, value) {
  const file = path.join(wt, rel);
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  const out = {};
  for (const [k, v] of Object.entries(pkg)) {
    out[k] = v;
    if (k === 'license') out.sideEffects = value;
  }
  if (!('sideEffects' in out)) out.sideEffects = value;
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
}

edit('packages/runtime-core/src/core.ts', [
  [
    `const USE_SNAPSHOT =
  typeof FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN
    : true; // Default to true (use snapshot) when not explicitly defined
const USE_REMOTE =
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_REMOTE
    : true;
const USE_SHARED =
  typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SHARED
    : true;
`,
    '',
  ],
  [`      USE_REMOTE && USE_SNAPSHOT\n`, `      ${NO_REMOTE} && ${NO_SNAPSHOT}\n`],
  [`      USE_REMOTE ? new SnapshotHandler(this)`, `      ${NO_REMOTE} ? new SnapshotHandler(this)`],
  [`      USE_SHARED ? new SharedHandler(this)`, `      ${NO_SHARED} ? new SharedHandler(this)`],
  [`      USE_REMOTE ? new RemoteHandler(this)`, `      ${NO_REMOTE} ? new RemoteHandler(this)`],
  [`    const shared = USE_SHARED\n`, `    const shared = ${NO_SHARED}\n`],
]);

edit('packages/webpack-bundler-runtime/src/index.ts', [
  [
    `const USE_REMOTE =
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_REMOTE
    : true;
const USE_SHARED =
  typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SHARED
    : true;
const USE_EXPOSES =
  typeof FEDERATION_HAS_EXPOSES === 'boolean' ? FEDERATION_HAS_EXPOSES : true;
`,
    '',
  ],
  [`  remotes: USE_REMOTE ? remotes : undefined,`, `  remotes: ${NO_REMOTE} ? remotes : undefined,`],
  [`  consumes: USE_SHARED ? consumes : undefined,`, `  consumes: ${NO_SHARED} ? consumes : undefined,`],
  [`  I: USE_SHARED ? initializeSharing : undefined,`, `  I: ${NO_SHARED} ? initializeSharing : undefined,`],
  [`  installInitialConsumes: USE_SHARED ? installInitialConsumes : undefined,`, `  installInitialConsumes: ${NO_SHARED} ? installInitialConsumes : undefined,`],
  [`  initContainerEntry: USE_EXPOSES ? initContainerEntry : undefined,`, `  initContainerEntry: ${HAS_EXPOSES} ? initContainerEntry : undefined,`],
  [`  getSharedFallbackGetter: USE_SHARED ? getSharedFallbackGetter : undefined,`, `  getSharedFallbackGetter: ${NO_SHARED} ? getSharedFallbackGetter : undefined,`],
]);

edit('packages/webpack-bundler-runtime/src/init.ts', [
  [
    `const USE_SHARED =
  typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SHARED
    : true;
`,
    '',
  ],
  [`  if (USE_SHARED) {`, `  if (${NO_SHARED}) {`],
]);

// Enhanced hoists every module reachable from the federation runtime entry into
// the runtime chunk without checking whether the connection is active, which
// re-adds modules that sideEffects pruning had removed. Skip inactive edges.
edit('packages/enhanced/src/lib/container/HoistContainerReferencesPlugin.ts', [
  [
    `      if (!connectedModule || visitedModules.has(connectedModule)) {
        continue;
      }
`,
    `      if (!connectedModule || visitedModules.has(connectedModule)) {
        continue;
      }
      if (connection.getActiveState(undefined) === false) {
        continue;
      }
`,
  ],
]);

// Only global.js (runtime-core) and index.js (runtime) run code at top level.
setSideEffects('packages/runtime-core/package.json', ['./dist/global.js', './dist/global.cjs']);
setSideEffects('packages/runtime/package.json', ['./dist/index.js', './dist/index.cjs']);
setSideEffects('packages/webpack-bundler-runtime/package.json', false);
setSideEffects('packages/runtime-tools/package.json', false);

console.log('prototype applied to', wt);
