// Memory retained by V8's compilation cache for remote code, with and without
// the sdk's remote compilation policy. Not part of CI. Run from the repo root:
//
//   pnpm --filter @module-federation/sdk build
//   node --expose-gc packages/node/__benchmarks__/remote-compilation-memory.mjs
//
// Each mode compiles 40 unique ~2 MB CommonJS-shaped scripts, drops every
// reference, forces a gc() and prints heapUsed. Expected on Node 22: "with
// policy" stays roughly flat (a few MB of noise); "without policy" grows by
// about 170 MB because the cache keeps each script's source and code alive.
import {
  compileCommonJsModule,
  withRemoteCompilationPolicy,
} from '../../sdk/dist/index.js';

if (typeof globalThis.gc !== 'function') {
  console.error('run with --expose-gc');
  process.exit(1);
}

const SCRIPTS = 40;
const PARAMETERS = ['exports', 'require', '__dirname', '__filename'];
const PADDING_LINES = 20_000;
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const makeSource = (label, index) => {
  const lines = [`exports.id = ${JSON.stringify(`${label}-${index}`)};`];
  for (let line = 0; line < PADDING_LINES; line++) {
    lines.push(
      `exports.m${line} = function () { return "${label}-${index}-${line}-${'x'.repeat(64)}"; };`,
    );
  }
  return lines.join('\n');
};

const heapAfterGc = () => {
  globalThis.gc();
  globalThis.gc();
  return process.memoryUsage().heapUsed;
};

const run = (label, wrap) => {
  const before = heapAfterGc();
  let sourceBytes = 0;
  for (let index = 0; index < SCRIPTS; index++) {
    const source = makeSource(label, index);
    sourceBytes += source.length;
    const chunk = wrap(() =>
      compileCommonJsModule({
        source,
        filename: `${label}-${index}.js`,
        parameters: PARAMETERS,
      }),
    );
    chunk({}, () => ({}), '/remote', `${label}-${index}.js`);
  }
  const after = heapAfterGc();
  console.log(
    `${label.padEnd(15)} heapUsed ${mb(before)} -> ${mb(after)} (delta ${mb(after - before)}, ${mb(sourceBytes)} of source compiled)`,
  );
};

run('with policy', (compile) => withRemoteCompilationPolicy(compile));
run('without policy', (compile) => compile());
