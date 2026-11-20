import { beforeEach, describe, expect, it, rs } from '@rstest/core';
import { DevPlugin } from './DevPlugin';

const { createDevWorker } = rs.hoisted(() => ({ createDevWorker: rs.fn() }));
rs.mock('../dev-worker', () => ({ createDevWorker }));
rs.mock('./utils', () => ({ isDev: () => true }));

const flush = () => new Promise((resolve) => setImmediate(resolve));

function applyPlugin(generateTypesPromise: Promise<void> = Promise.resolve()) {
  const taps: Record<string, () => void> = {};
  const hook = (name: string) => ({
    tap(_plugin: string, callback: () => void) {
      taps[name] = callback;
    },
  });
  const compiler = {
    options: {},
    webpack: {
      DefinePlugin: class {
        apply() {}
      },
    },
    hooks: { afterEmit: hook('afterEmit'), shutdown: hook('shutdown') },
  } as any;
  // The plugin's process-wide handlers call process.exit, keep them out of the test process.
  const on = rs.spyOn(process, 'on').mockReturnValue(process);
  new DevPlugin(
    { name: 'app', dts: false, dev: { disableLiveReload: false } },
    {},
    generateTypesPromise,
    Promise.resolve(undefined),
  ).apply(compiler);
  on.mockRestore();
  return taps;
}

describe('DevPlugin compiler shutdown', () => {
  beforeEach(() => {
    rs.clearAllMocks();
  });

  it('stops the worker when the compiler shuts down, even while it is starting', async () => {
    let failStartup = (_error: Error) => {};
    const worker = {
      exit: rs.fn(() => failStartup(new Error('worker exited'))),
      controlledPromise: new Promise((_resolve, reject) => {
        failStartup = reject;
      }),
    };
    createDevWorker.mockReturnValue(worker);
    const unhandled = rs.fn();
    process.on('unhandledRejection', unhandled);
    try {
      const taps = applyPlugin();
      await flush();
      taps.shutdown?.();
      expect(worker.exit).toHaveBeenCalledOnce();
      await flush();
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });

  it('does not start a worker when type generation finishes after shutdown', async () => {
    let finishGeneration = () => {};
    const taps = applyPlugin(
      new Promise<void>((resolve) => {
        finishGeneration = resolve;
      }),
    );
    taps.shutdown?.();
    finishGeneration();
    await flush();
    expect(createDevWorker).not.toHaveBeenCalled();
  });
});
