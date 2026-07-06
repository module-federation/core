import { describe, it, rs, expect } from '@rstest/core';
import { init, loadRemote, loadShare, loadShareSync } from '../src/index';
import { getInfoWithoutType } from '@module-federation/runtime-core';

describe('global', () => {
  it('inject mode', () => {
    globalThis.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = rs.fn();
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
      type LoadRemoteReturn = ReturnType<typeof typedLoadRemote>;
      const _acceptsStringOrNull: Promise<string | null> =
        null as never as LoadRemoteReturn;
      void _acceptsStringOrNull;
    });

    it('loadShare', async () => {
      const typedLoadShare: typeof loadShare<string> = loadShare;
      type LoadShareReturn = ReturnType<typeof typedLoadShare>;
      const _acceptsStringFactory: Promise<false | (() => string | undefined)> =
        null as never as LoadShareReturn;
      void _acceptsStringFactory;
    });

    it('loadShareSync', () => {
      const typedLoadShareSync: typeof loadShareSync<string> = loadShareSync;
      type LoadShareSyncReturn = ReturnType<typeof typedLoadShareSync>;
      const _acceptsStringFactory: () => string | never =
        null as never as LoadShareSyncReturn;
      void _acceptsStringFactory;
    });
  });
});
