import { expectTypeOf, describe, it, vi, expect } from 'vitest';
import { init, loadRemote, loadShare, loadShareSync } from '../src/index';
import { getInfoWithoutType } from '@module-federation/runtime-core';

describe('global', () => {
  it('inject mode', () => {
    globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = vi.fn();
    const injectArgs = {
      name: '@federation/inject-mode',
      remotes: [],
    };
    const GM = init(injectArgs);
    expect(GM.constructor).toBe(
      globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__,
    );
    expect(globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__).toBeCalledWith(
      injectArgs,
    );
  });

  it('getInfoWithoutType', () => {
    const snapshot = {
      '@federation/app1': 1,
      '@federation/app2': 2,
      'app:@federation/app3': 3,
      'npm:@federation/app4': 4,
    };

    const res = getInfoWithoutType(snapshot, '@federation/app1');
    expect(res).toMatchObject({
      key: '@federation/app1',
      value: 1,
    });

    const res2 = getInfoWithoutType(snapshot, '@federation/app3' as any);
    expect(res2).toMatchObject({
      key: 'app:@federation/app3',
      value: 3,
    });

    const res3 = getInfoWithoutType(snapshot, '@federation/app4' as any);
    expect(res3).toMatchObject({
      key: 'npm:@federation/app4',
      value: 4,
    });
  });

  describe('global types (generic)', () => {
    it('loadRemote', async () => {
      const typedLoadRemote: typeof loadRemote<string> = loadRemote;
      expectTypeOf(typedLoadRemote).returns.toMatchTypeOf<
        Promise<string | null>
      >();
      expectTypeOf(typedLoadRemote).returns.not.toMatchTypeOf<Promise<null>>();
    });

    it('loadShare', async () => {
      const typedLoadShare: typeof loadShare<string> = loadShare;
      expectTypeOf(typedLoadShare).returns.toMatchTypeOf<
        Promise<false | (() => string | undefined)>
      >();
      expectTypeOf(typedLoadShare).returns.not.toMatchTypeOf<
        Promise<false | (() => undefined)>
      >();
    });

    it('loadShareSync', () => {
      const typedLoadShareSync: typeof loadShareSync<string> = loadShareSync;
      expectTypeOf(typedLoadShareSync).returns.toMatchTypeOf<
        () => string | never
      >();
      expectTypeOf(typedLoadShareSync).returns.not.toMatchTypeOf<() => never>();
    });
  });
});
