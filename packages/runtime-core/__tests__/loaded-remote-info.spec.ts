import { runInNewContext } from 'node:vm';
import { beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import type { ModuleInfo } from '@module-federation/sdk';

let sequence = 0;
function fixture(modules: Record<string, unknown>) {
  const name = `loaded_info_${++sequence}`;
  let version = 'v1';
  const afterResolve = rstest.fn((args) => ({
    ...args,
    remoteSnapshot: {
      version,
      modules: Object.keys(modules).map((modulePath) => ({
        modulePath,
        moduleName: modulePath.slice(2),
        render: 'component',
      })),
    } as ModuleInfo,
  }));
  const instance = new ModuleFederation({
    name: `${name}_host`,
    inBrowser: false,
    remotes: [{ name, alias: 'shop', entry: `https://${name}.test/entry.js` }],
    plugins: [
      {
        name: 'loaded-info-fixture',
        afterResolve,
        loadEntry: () => ({
          init() {},
          get: async (expose: string) => () => modules[expose],
        }),
      },
    ],
  });
  return {
    instance,
    afterResolve,
    setVersion: (next: string) => {
      version = next;
    },
  };
}

describe('loaded remote provenance', () => {
  beforeEach(() => resetFederationGlobalInfo());

  it('preserves frozen namespaces and exact function/object export references', async () => {
    const Component = () => null;
    const Memo = Object.freeze({
      $$typeof: Symbol.for('react.memo'),
      type: Component,
    });
    const raw = Object.freeze({ default: Component, Memo });
    const { instance, afterResolve } = fixture({ './Card': raw });
    expect(await instance.loadRemote('shop/Card')).toBe(raw);
    expect(Object.getOwnPropertySymbols(raw)).toEqual([]);
    const source = instance.remoteHandler.getLoadedRemoteInfo(raw)!;
    expect(source.isModule).toBe(true);
    expect(source.remoteMatchInfo.remoteSnapshot?.version).toBe('v1');
    expect(instance.remoteHandler.getLoadedRemoteInfo(Component)).toEqual({
      ...source,
      isModule: false,
    });
    expect(instance.remoteHandler.getLoadedRemoteInfo(Memo)).toEqual({
      ...source,
      isModule: false,
    });
    expect(afterResolve).toHaveBeenCalledTimes(1);
  });

  it('records deferred bundler factories when they actually execute', async () => {
    const Component = () => null;
    const raw = { default: Component };
    const { instance, afterResolve } = fixture({
      './Card': Promise.resolve(raw),
    });
    const factory = await instance.loadRemote<() => Promise<typeof raw>>(
      'shop/Card',
      { loadFactory: false },
    );
    expect(
      instance.remoteHandler.getLoadedRemoteInfo(Component),
    ).toBeUndefined();
    expect(await factory!()).toBe(raw);
    expect(
      instance.remoteHandler.getLoadedRemoteInfo(Component)?.remoteMatchInfo
        .expose,
    ).toBe('./Card');
    expect(afterResolve).toHaveBeenCalledTimes(1);
  });

  it('isolates concurrent loads and runtime instances', async () => {
    const A = () => null;
    const B = () => null;
    const first = fixture({ './A': { default: A }, './B': { default: B } });
    const second = fixture({ './Other': { default: A } });
    await Promise.all([
      first.instance.loadRemote('shop/A'),
      first.instance.loadRemote('shop/B'),
      second.instance.loadRemote('shop/Other'),
    ]);
    expect(
      first.instance.remoteHandler.getLoadedRemoteInfo(A)?.remoteMatchInfo
        .expose,
    ).toBe('./A');
    expect(
      first.instance.remoteHandler.getLoadedRemoteInfo(B)?.remoteMatchInfo
        .expose,
    ).toBe('./B');
    expect(
      second.instance.remoteHandler.getLoadedRemoteInfo(A)?.remoteMatchInfo
        .expose,
    ).toBe('./Other');
    expect(
      second.instance.remoteHandler.getLoadedRemoteInfo(B),
    ).toBeUndefined();
  });

  it('allows duplicate export names for one source but rejects ambiguous exposes', async () => {
    const Component = () => null;
    const raw = { default: Component, Named: Component };
    const { instance } = fixture({
      './Card': raw,
      './Other': { default: Component },
    });
    await instance.loadRemote('shop/Card');
    expect(
      instance.remoteHandler.getLoadedRemoteInfo(Component)?.remoteMatchInfo
        .expose,
    ).toBe('./Card');
    await instance.loadRemote('shop/Other');
    expect(() => instance.remoteHandler.getLoadedRemoteInfo(Component)).toThrow(
      'multiple expose or version identities',
    );
    expect(
      instance.remoteHandler.getLoadedRemoteInfo(raw)?.remoteMatchInfo.expose,
    ).toBe('./Card');
  });

  it('rejects one reference reused by different resolved versions', async () => {
    const Component = () => null;
    const { instance, setVersion } = fixture({
      './Card': { default: Component },
    });
    await instance.loadRemote('shop/Card');
    setVersion('v2');
    await instance.loadRemote('shop/Card');
    expect(() => instance.remoteHandler.getLoadedRemoteInfo(Component)).toThrow(
      'multiple expose or version identities',
    );
  });

  it('does not evaluate arbitrary getters or replace a module with a failing default getter', async () => {
    const named = rstest.fn(() => {
      throw new Error('named getter');
    });
    const defaultGetter = rstest.fn(() => {
      throw new Error('default getter');
    });
    const raw = Object.freeze(
      Object.defineProperties(
        {},
        {
          default: { get: defaultGetter, enumerable: true },
          Named: { get: named, enumerable: true },
        },
      ),
    );
    const { instance } = fixture({ './Card': raw });
    expect(await instance.loadRemote('shop/Card')).toBe(raw);
    expect(named).not.toHaveBeenCalled();
    expect(defaultGetter).toHaveBeenCalledTimes(1);
    expect(Object.getOwnPropertyDescriptor(raw, 'default')?.get).toBe(
      defaultGetter,
    );
  });

  it('keeps a successful Proxy result when export descriptor inspection throws', async () => {
    const Component = () => null;
    const raw = new Proxy(
      { default: Component },
      {
        ownKeys() {
          throw new Error('opaque export descriptors');
        },
      },
    );
    const { instance } = fixture({ './Card': raw });
    expect(await instance.loadRemote('shop/Card')).toBe(raw);
    expect(raw.default).toBe(Component);
    expect(
      instance.remoteHandler.getLoadedRemoteInfo(raw)?.remoteMatchInfo.expose,
    ).toBe('./Card');
    expect(
      instance.remoteHandler.getLoadedRemoteInfo(Component),
    ).toBeUndefined();
  });

  it.each(['sync', 'async', 'cross-realm'])(
    'records the final onLoad-decorated factory result (%s)',
    async (kind) => {
      const Original = () => null;
      const Decorated = () => null;
      const raw = { default: Original };
      const decorated = Object.freeze({ default: Decorated });
      const { instance, afterResolve } = fixture({ './Card': raw });
      const finalFactory = rstest.fn(function (
        this: { tag: string },
        argument: string,
      ) {
        expect(this.tag).toBe('context');
        expect(argument).toBe('argument');
        if (kind === 'async') return Promise.resolve(decorated);
        if (kind === 'cross-realm')
          return runInNewContext('Promise.resolve(value)', {
            value: decorated,
          });
        return decorated;
      });
      instance.registerPlugins([
        { name: 'decorate-final-factory', onLoad: () => finalFactory },
      ]);
      const factory = await instance.loadRemote<
        (...args: unknown[]) => unknown
      >('shop/Card', { loadFactory: false });
      expect(
        instance.remoteHandler.getLoadedRemoteInfo(Decorated),
      ).toBeUndefined();
      const returned = factory!.call({ tag: 'context' }, 'argument');
      if (kind === 'sync') expect(returned).toBe(decorated);
      expect(await returned).toBe(decorated);
      expect(
        instance.remoteHandler.getLoadedRemoteInfo(Decorated)?.remoteMatchInfo
          ?.expose,
      ).toBe('./Card');
      expect(
        instance.remoteHandler.getLoadedRemoteInfo(decorated)?.isModule,
      ).toBe(true);
      expect(
        instance.remoteHandler.getLoadedRemoteInfo(Original),
      ).toBeUndefined();
      expect(finalFactory).toHaveBeenCalledTimes(1);
      expect(afterResolve).toHaveBeenCalledTimes(1);
    },
  );

  it('records runtime recoveries separately from successful expose metadata', async () => {
    const Fallback = () => null;
    const raw = Object.freeze({ default: Fallback });
    const { instance } = fixture({ './Card': {} });
    instance.registerPlugins([
      {
        name: 'recover-missing-remote',
        errorLoadRemote: ({ lifecycle }) =>
          lifecycle === 'onLoad' ? raw : undefined,
      },
    ]);
    expect(await instance.loadRemote('missing/Card')).toBe(raw);
    expect(instance.remoteHandler.getLoadedRemoteInfo(Fallback)).toMatchObject({
      id: 'missing/Card',
      recovered: true,
      isModule: false,
    });
    expect(
      instance.remoteHandler.getLoadedRemoteInfo(raw)?.remoteMatchInfo,
    ).toBeUndefined();
  });

  it.each([false, true])(
    'returns a synchronous namespace with a business then export unchanged (spoofed tag: %s)',
    async (spoofedTag) => {
      const Component = () => null;
      const then = rstest.fn();
      const raw = Object.freeze({
        default: Component,
        then,
        ...(spoofedTag ? { [Symbol.toStringTag]: 'Promise' } : {}),
      });
      const { instance } = fixture({ './Card': raw });
      const factory = await instance.loadRemote<() => typeof raw>('shop/Card', {
        loadFactory: false,
      });
      const result = factory!();
      expect(result).toBe(raw);
      expect(result.then).toBe(then);
      expect(then).not.toHaveBeenCalled();
      expect(instance.remoteHandler.getLoadedRemoteInfo(raw)?.isModule).toBe(
        true,
      );
      expect(
        instance.remoteHandler.getLoadedRemoteInfo(Component)?.remoteMatchInfo
          ?.expose,
      ).toBe('./Card');
    },
  );
});
