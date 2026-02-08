jest.mock('@module-federation/runtime', () => ({
  init: jest.fn(),
}));

import { init as runtimeInit } from '@module-federation/runtime';
import { init } from '../src/init';

describe('init', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('attaches internal symbols and clears matched remote module cache', () => {
    const instance = {};
    (runtimeInit as jest.Mock).mockReturnValue(instance);

    const targetMapping: any = ['default', './say', 'external-target'];
    targetMapping.p = Promise.resolve(1);
    const untouchedMapping: any = ['default', './say', 'external-untouched'];
    untouchedMapping.p = Promise.resolve(2);

    const webpackRequire: any = {
      c: {
        target: { id: 'target' },
        untouched: { id: 'untouched' },
      },
      m: {
        target: () => null,
        untouched: () => null,
      },
      federation: {
        initOptions: {
          name: 'host',
          remotes: [],
        },
        runtime: {
          init: runtimeInit,
        },
        sharedFallback: undefined,
        bundlerRuntime: {
          getSharedFallbackGetter: jest.fn(),
        },
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              target: [
                { externalType: 'script', name: '@register-remotes/app2' },
              ],
              untouched: [{ externalType: 'script', name: 'other-remote' }],
            },
            idToExternalAndNameMapping: {
              target: targetMapping,
              untouched: untouchedMapping,
            },
          },
        },
        libraryType: 'var',
      },
    };

    const result = init({ webpackRequire });

    expect(result).toBe(instance);
    expect(
      (instance as Record<symbol, unknown>)[Symbol.for('mf_webpack_require')],
    ).toBe(webpackRequire);

    const cleanup = (instance as Record<symbol, unknown>)[
      Symbol.for('mf_clear_bundler_remote_module_cache')
    ] as (remote: { name: string; alias?: string }) => void;
    expect(typeof cleanup).toBe('function');
    cleanup({ name: '@register-remotes/app2', alias: 'app2' });

    expect(webpackRequire.c.target).toBeUndefined();
    expect(webpackRequire.m.target).toBeUndefined();
    expect(targetMapping.p).toBeUndefined();
    expect(webpackRequire.c.untouched).toBeDefined();
    expect(webpackRequire.m.untouched).toBeDefined();
    expect(untouchedMapping.p).toBeDefined();
  });

  test('preserves init behavior while appending tree-shake plugin', () => {
    const instance = { foo: 'bar' };
    (runtimeInit as jest.Mock).mockReturnValue(instance);

    const existingPlugin = {
      name: 'existing-plugin',
      beforeInit: jest.fn((args) => args),
    };

    const webpackRequire: any = {
      federation: {
        initOptions: {
          name: 'host',
          remotes: [],
          plugins: [existingPlugin],
        },
        runtime: {
          init: runtimeInit,
        },
        sharedFallback: undefined,
        bundlerRuntime: {
          getSharedFallbackGetter: jest.fn(),
        },
        libraryType: 'var',
      },
    };

    const result = init({ webpackRequire });

    expect(result).toBe(instance);
    expect(runtimeInit).toHaveBeenCalledTimes(1);
    const calledOptions = (runtimeInit as jest.Mock).mock.calls[0][0];
    expect(calledOptions.plugins[0]).toBe(existingPlugin);
    expect(calledOptions.plugins).toHaveLength(2);
    expect(typeof calledOptions.plugins[1].beforeInit).toBe('function');
  });
});
