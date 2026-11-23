import { ModuleFederation } from '@module-federation/runtime';
import type { RemoteEntryInitOptions } from '@module-federation/runtime/types';
import { attachShareScopeMap } from '../src/attachShareScopeMap';
import { initContainerEntry } from '../src/initContainerEntry';
import type {
  InitContainerEntryOptions,
  ShareScopeMap,
  WebpackRequire,
} from '../src/types';

function setup(shareScopeKey: string | string[] = 'container', optedIn = true) {
  const registered: string[] = [];
  const bound: string[] = [];
  const name = 'receiver';
  const instance = new ModuleFederation({
    name,
    remotes: [],
    shareStrategy: 'version-first',
    shared: {
      widget: {
        version: '1.0.0',
        scope: ['container', 'host', 'extra', 'missing', 'private'],
        get: () => () => 'widget',
      },
    },
    plugins: [
      {
        name: 'record-sharing',
        initContainerShareScopeMap(args) {
          bound.push(args.scopeName);
          return args;
        },
        afterRegisterShare({ scope }) {
          registered.push(scope);
        },
      },
    ],
  });
  // Start with empty pools so the test observes registrations during init.
  Object.keys(instance.shareScopeMap).forEach((scope) => {
    delete instance.shareScopeMap[scope];
  });
  registered.length = 0;
  const I = jest.fn((scope: string) => {
    instance.initializeSharing(scope, { from: 'build' });
    return true as boolean | Promise<boolean>;
  });
  const webpackRequire = {
    S: instance.shareScopeMap,
    I,
    federation: {
      instance,
      initOptions: { name },
      attachShareScopeMap,
      ...(optedIn && { shareScopeDispatch: 'declared' }),
    },
  } as unknown as WebpackRequire;
  function init(
    shareScope: ShareScopeMap[string],
    initScope: InitContainerEntryOptions['initScope'],
    remoteEntryInitOptions?: RemoteEntryInitOptions,
    additionalShareScopeKeys?: string[],
  ) {
    return initContainerEntry({
      webpackRequire,
      shareScopeKey,
      shareScope,
      initScope,
      remoteEntryInitOptions,
      additionalShareScopeKeys,
    });
  }
  return { init, instance, I, S: instance.shareScopeMap, registered, bound };
}

function hostOptions(
  shareScopeKeys: string | string[],
  shareScopeMap: ShareScopeMap,
) {
  return Object.freeze(
    Object.defineProperty({ version: '', shareScopeKeys }, 'shareScopeMap', {
      value: shareScopeMap,
    }),
  ) as RemoteEntryInitOptions;
}

describe('additional container share scopes', () => {
  it.each<[string, string[] | undefined, boolean]>([
    ['absent', undefined, true],
    ['empty', [], true],
    ['not opted in', ['extra'], false],
    ['only owned', ['container'], true],
  ])(
    'keeps the synchronous primary binding when the extra list is %s',
    (_label, list, optedIn) => {
      const { init, S, bound, registered } = setup('container', optedIn);
      const map = { host: {} };
      expect(init(map.host, [], hostOptions('host', map), list)).toBe(true);
      expect(S['container']).toBe(map.host);
      expect(Object.keys(S)).toEqual(['container']);
      expect(Object.keys(map)).toEqual(['host']);
      expect(bound).toEqual(['container']);
      expect(registered).toEqual(['container']);
    },
  );

  it('keeps a two-argument host call on its original pool without inventing a map', () => {
    const receiver = setup();
    const pool = {};
    const init = (shareScope: ShareScopeMap[string], chain: []) =>
      receiver.init(shareScope, chain, undefined, ['extra']);
    expect(init(pool, [])).toBe(true);
    expect(receiver.S['container']).toBe(pool);
    expect(Object.keys(receiver.S)).toEqual(['container']);
    expect(receiver.registered).toEqual(['container']);
  });

  it('keeps the scalar alias and binds only the listed pools by name', async () => {
    const { init, S, bound, registered } = setup();
    const map: ShareScopeMap = { host: {}, extra: {} };
    const options = hostOptions('host', map);
    const ready = init(map['host'], [], options, [
      'container',
      'extra',
      'missing',
    ]);
    expect(ready).toBeInstanceOf(Promise);
    await ready;
    expect(S['container']).toBe(map['host']);
    expect(S['host']).toBeUndefined();
    expect(S['extra']).toBe(map['extra']);
    expect(map['missing']).toBeDefined();
    expect(S['missing']).toBe(map['missing']);
    expect(Object.keys(map).sort()).toEqual(['extra', 'host', 'missing']);
    expect(bound).toEqual(['container', 'extra', 'missing']);
    expect(registered).toEqual(['container', 'extra', 'missing']);
    expect(Object.keys(map['extra'])).toContain('widget');
    expect(options.shareScopeKeys).toBe('host');
    expect(
      Object.getOwnPropertyDescriptor(options, 'shareScopeMap')?.enumerable,
    ).toBe(false);
  });

  it('binds the scalar host name separately when it is also listed as additional', async () => {
    const { init, S, registered } = setup();
    const map = { host: {} };
    await init(map.host, [], hostOptions('host', map), ['host']);
    expect(S['container']).toBe(map.host);
    expect(S['host']).toBe(map.host);
    expect(registered).toEqual(['container', 'host']);
  });

  it.each([false, true])(
    'registers only the requested array extras without rebinding existing scopes (primary first: %s)',
    async (primaryFirst) => {
      const { init, S, bound, registered } = setup();
      const map = { container: {}, extra: {}, unrelated: {} };
      if (primaryFirst) init(map.container, [], hostOptions('container', map));
      const ready = init(
        map.extra,
        [],
        hostOptions(['extra', 'unrelated'], map),
        ['container', 'extra', 'private'],
      );
      expect(ready).toBeInstanceOf(Promise);
      await ready;
      expect(S['extra']).toBe(map.extra);
      expect(S['unrelated']).toBe(map.unrelated);
      expect(S['container']).not.toBe(map.extra);
      if (primaryFirst) expect(S['container']).toBe(map.container);
      expect(Object.keys(map).sort()).toEqual([
        'container',
        'extra',
        'unrelated',
      ]);
      expect(bound.filter((scope) => scope === 'extra')).toHaveLength(1);
      expect(registered.filter((scope) => scope !== 'container')).toEqual([
        'extra',
      ]);
    },
  );

  it('binds requested extras alongside the scopes owned by an array container', async () => {
    const { init, S, bound, registered } = setup(['container', 'host']);
    const map = { container: {}, host: {}, extra: {} };
    await init(map.host, [], hostOptions(['host', 'extra'], map), [
      'host',
      'extra',
      'private',
    ]);
    expect(S['container']).toBe(map.container);
    expect(S['host']).toBe(map.host);
    expect(S['extra']).toBe(map.extra);
    expect(Object.keys(map).sort()).toEqual(['container', 'extra', 'host']);
    expect(bound).toEqual(['container', 'host', 'extra']);
    expect(registered).toEqual(['container', 'host', 'extra']);
  });

  it('starts additional registration after primary initialization and waits for its promises', async () => {
    const { init, instance, I, registered } = setup();
    let finishPrimary!: (ready: boolean) => void;
    let finishExtra!: () => void;
    I.mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        finishPrimary = resolve;
      }),
    );
    const extra = new Promise<void>((resolve) => {
      finishExtra = resolve;
    });
    const register = instance.initializeSharing.bind(instance);
    const sharing = jest
      .spyOn(instance, 'initializeSharing')
      .mockImplementation((scope, options) => [
        ...register(scope, options),
        extra,
      ]);
    const chain = [{ visit: {} }];
    const map = { host: {}, extra: {} };
    const ready = init(map.host, chain, hostOptions('host', map), ['extra']);
    expect(ready).toBeInstanceOf(Promise);
    expect(registered).toEqual([]);
    finishPrimary(true);
    const settled = jest.fn();
    const completion = Promise.resolve(ready).then(settled);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(registered).toEqual(['extra']);
    expect(sharing).toHaveBeenCalledTimes(1);
    expect(sharing).toHaveBeenCalledWith('extra', {
      from: 'build',
      strategy: 'version-first',
      initScope: chain,
      context: { shareScopeDispatch: 'declared' },
    });
    expect(sharing.mock.calls[0][1]?.initScope).toBe(chain);
    expect(I).toHaveBeenCalledTimes(1);
    expect(settled).not.toHaveBeenCalled();
    finishExtra();
    await completion;
    expect(settled).toHaveBeenCalledTimes(1);
  });
});
