// Memory retained by module-scope side-effects (setInterval, process.on), with
// and without side-effect scope disposal on remote removal.
// Run from repo root:
//
//   node --expose-gc packages/node/__benchmarks__/remote-side-effects-memory.mjs
//
import {
  withSideEffectScope,
  disposeRemoteSideEffects,
} from '../../sdk/dist/index.js';

if (typeof globalThis.gc !== 'function') {
  console.error('run with --expose-gc');
  process.exit(1);
}

const REFRESHES = 40;
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const simulateRemoteExecution = (remoteName, index) => {
  // Simulate a 2MB chunk data retained by top-level listener/interval closures
  const largeChunkData = 'x'.repeat(2 * 1024 * 1024);

  withSideEffectScope(remoteName, () => {
    // Evaluation-time side effects (e.g. APM, logging, polling libraries)
    const interval = setInterval(() => {
      // Retains largeChunkData
      if (largeChunkData.length === 0) console.log('impossible');
    }, 3600000);

    const listener = () => {
      // Retains largeChunkData
      if (largeChunkData.length === 0) console.log('impossible');
    };
    process.on('warning', listener);
  });
};

const heapAfterGc = () => {
  globalThis.gc();
  globalThis.gc();
  return process.memoryUsage().heapUsed;
};

const run = (label, dispose) => {
  const remoteName = `remote-${label.replace(/\s+/g, '-')}`;
  const before = heapAfterGc();

  for (let index = 0; index < REFRESHES; index++) {
    if (dispose) {
      disposeRemoteSideEffects(remoteName);
    }
    simulateRemoteExecution(remoteName, index);
  }

  const after = heapAfterGc();
  const listenersCount = process.listeners('warning').length;
  console.log(
    `${label.padEnd(20)} heapUsed ${mb(before)} -> ${mb(after)} (delta ${mb(after - before)}), warning listeners: ${listenersCount}`,
  );

  // Clean up any remaining listeners
  if (!dispose) {
    disposeRemoteSideEffects(remoteName);
    process.removeAllListeners('warning');
  }
};

run('with disposal', true);
run('without disposal', false);
