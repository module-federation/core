import { describe, it, expect, rs } from '@rstest/core';
import { init } from '../src/index';

describe('global', () => {
  it('inject mode', () => {
    globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = rs.fn() as any;
    const injectArgs = {
      name: '@federation/inject-mode',
      remotes: [],
    };
    const GM = init(injectArgs);
    expect(GM.constructor).toBe(
      globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__,
    );
    expect(globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__).toBeCalledWith({
      ...injectArgs,
      id: '',
    });
  });
});
