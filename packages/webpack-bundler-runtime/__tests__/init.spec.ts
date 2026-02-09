jest.mock('@module-federation/runtime', () => ({
  init: jest.fn(),
}));

import { init as runtimeInit } from '@module-federation/runtime';
import { init } from '../src/init';

describe('init', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('attaches webpackRequire to runtime instance using internal symbol', () => {
    const instance = {};
    (runtimeInit as jest.Mock).mockReturnValue(instance);

    const webpackRequire: any = {
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
        libraryType: 'var',
      },
    };

    const result = init({ webpackRequire });

    expect(result).toBe(instance);
    expect(
      (instance as Record<symbol, unknown>)[Symbol.for('mf_webpack_require')],
    ).toBe(webpackRequire);
  });

  test('preserves init behavior while appending runtime plugins', () => {
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
    expect(calledOptions.plugins).toHaveLength(3);
    expect(typeof calledOptions.plugins[1].beforeInit).toBe('function');
    expect(calledOptions.plugins[2].name).toBe('unload-remote-plugin');
  });
});
