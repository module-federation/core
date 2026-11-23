import { initializeSharing } from '../src/initializeSharing';

type Scope = string | string[];
type InitCall = { pool: unknown; keys: unknown; map: unknown; args: number };

// A container as a host sees it. It records what `init` received.
function container(run?: (...args: any[]) => unknown) {
  const calls: InitCall[] = [];
  return {
    calls,
    init(...args: any[]) {
      calls.push({
        pool: args[0],
        keys: args[2]?.shareScopeKeys,
        map: args[2]?.shareScopeMap,
        args: args.length,
      });
      return run?.(...args);
    },
  };
}

// A host runtime with non-script remotes. `remotes` maps an import id to the
// share scope the build declared for it and the external it resolves to.
function host(
  remotes: Record<string, [Scope, unknown]>,
  { declared = true }: { declared?: boolean } = {},
) {
  const S: Record<string, any> = {};
  const externals = new Map<string, unknown>();
  const idToRemoteMap: Record<string, any> = {};
  const idToExternalAndNameMapping: Record<string, any> = {};
  for (const [id, [scope, external]] of Object.entries(remotes)) {
    const externalId = [...externals].find(([, value]) => value === external);
    const key = externalId ? externalId[0] : `external:${id}`;
    externals.set(key, external);
    idToRemoteMap[id] = [{ externalType: 'commonjs-module', name: '' }];
    idToExternalAndNameMapping[id] = [scope, './module', key];
  }
  const webpackRequire: any = (id: string) => externals.get(id);
  webpackRequire.S = S;
  webpackRequire.federation = {
    instance: {
      name: 'host',
      options: { shareStrategy: 'version-first' },
      shareScopeMap: S,
      initializeSharing(scope: string) {
        S[scope] ||= {};
        return [];
      },
    },
    ...(declared ? { shareScopeDispatch: 'declared' } : {}),
    bundlerRuntimeOptions: {
      remotes: { idToRemoteMap, idToExternalAndNameMapping },
    },
  };
  const initPromises = {};
  const initTokens = {};
  const I = (shareScopeName: Scope, initScope: any[] = []) =>
    initializeSharing({
      shareScopeName,
      webpackRequire,
      initPromises,
      initTokens,
      initScope,
    });
  return { I, S, webpackRequire };
}

const settles = (promise: unknown) =>
  Promise.race([
    Promise.resolve(promise).then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 50)),
  ]);

describe('initializeSharing with declared share scope dispatch', () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  it('keeps the legacy walk for array requests if only the shared options have the flag', async () => {
    const a = container();
    const b = container();
    const { I, S, webpackRequire } = host(
      { a: [['a', 'b'], a], b: ['b', b] },
      { declared: false },
    );
    webpackRequire.federation.bundlerRuntimeOptions.shareScopeDispatch =
      'declared';
    const keys = ['a', 'c'];

    expect(await settles(I(keys))).toBe(true);

    const expected = [
      { pool: S.a, keys, map: S, args: 3 },
      { pool: S.c, keys, map: S, args: 3 },
    ];
    expect(a.calls).toEqual(expected);
    expect(b.calls).toEqual(expected);
  });

  it('initializes all scalar remotes with the scalar request, regardless of declaration', async () => {
    const a = container();
    const b = container();
    const { I, S } = host({ a: ['a', a], b: ['b', b] });

    await I('a');
    await I('b');

    const expected = [
      { pool: S.a, keys: 'a', map: S, args: 3 },
      { pool: S.b, keys: 'b', map: S, args: 3 },
    ];
    expect(a.calls).toEqual(expected);
    expect(b.calls).toEqual(expected);
  });

  it('skips an array remote that does not declare the requested scalar scope', async () => {
    const remote = container();
    const { I } = host({ remote: [['a', 'b'], remote] });

    expect(await settles(I('c'))).toBe(true);
    expect(remote.calls).toEqual([]);
  });

  it('initializes only the scalar remotes in an array request with their own pools', async () => {
    const a = container();
    const b = container();
    const c = container();
    const { I, S } = host({ a: ['a', a], b: ['b', b], c: ['c', c] });

    expect(await settles(I(['b', 'a']))).toBe(true);
    expect(a.calls).toEqual([{ pool: S.a, keys: 'a', map: S, args: 3 }]);
    expect(b.calls).toEqual([{ pool: S.b, keys: 'b', map: S, args: 3 }]);
    expect(c.calls).toEqual([]);
  });

  it.each([
    ['its second scope', ['b', 'a']],
    ['its first scope', ['a', 'b']],
    ['both scopes at once', [['b', 'a']]],
    ['an array overlapping only its second scope', [['c', 'b']]],
  ])(
    'initializes a remote with several scopes once, with its first pool, when %s initializes first',
    async (_label, requests) => {
      const remote = container();
      const { I, S } = host({ remote: [['a', 'b'], remote] });

      for (const request of requests) await I(request as Scope);

      expect(remote.calls).toEqual([
        { pool: S.a, keys: ['a', 'b'], map: S, args: 3 },
      ]);
    },
  );

  it('gives a remote the pool its first scope keeps, before that scope has initialized', async () => {
    const remote = container();
    const { I, S } = host({ remote: [['a', 'b'], remote] });

    await I('b');
    const received = remote.calls[0].pool;
    await I('a');

    expect(received).toBeDefined();
    expect(S.a).toBe(received);
  });

  it('initializes one external once for each scope contract that refers to it', async () => {
    const remote = container();
    const { I, S } = host({
      scalar: ['a', remote],
      ordered: [['a', 'b'], remote],
    });

    await I(['a', 'b']);

    expect(remote.calls).toEqual([
      { pool: S.a, keys: 'a', map: S, args: 3 },
      { pool: S.a, keys: ['a', 'b'], map: S, args: 3 },
    ]);
  });

  it('initializes a container that resolves asynchronously once', async () => {
    const remote = container();
    const { I, S } = host({ remote: [['a', 'b'], Promise.resolve(remote)] });

    await I(['a', 'b']);

    expect(remote.calls).toEqual([
      { pool: S.a, keys: ['a', 'b'], map: S, args: 3 },
    ]);
  });

  it('does not initialize a remote again when its init re-enters on the same chain', async () => {
    let reenter: (scope: string, chain: any[]) => unknown = () => undefined;
    const remote = container((_pool, chain) => reenter('b', chain));
    const { I } = host({ remote: [['a', 'b'], remote] });
    reenter = I;

    expect(await settles(I('a'))).toBe(true);
    expect(remote.calls).toHaveLength(1);
  });

  it('settles when a remote re-enters on the same chain after its init has returned', async () => {
    let reenter: (scope: string, chain: any[]) => unknown = () => undefined;
    const remote = container((_pool, chain) =>
      Promise.resolve().then(() => reenter('b', chain)),
    );
    const { I } = host({ remote: [['a', 'b'], remote] });
    reenter = I;

    expect(await settles(I('a'))).toBe(true);
    expect(remote.calls).toHaveLength(1);
  });

  it('skips a nested call made before init returns even if it passes a fresh chain', async () => {
    let reenter: (scope: string) => unknown = () => undefined;
    const remote = container(() => reenter('b'));
    const { I } = host({ remote: [['a', 'b'], remote] });
    reenter = I;

    expect(await settles(I('a'))).toBe(true);
    expect(remote.calls).toHaveLength(1);
  });

  it('does not wait for cached readiness when the same chain owns a running init', async () => {
    let revisit: unknown;
    const remote = container((_pool, chain) =>
      Promise.resolve().then(() => (revisit = I('b', chain))),
    );
    const { I } = host({ remote: [['a', 'b'], Promise.resolve(remote)] });

    const owner = I('a');
    const join = I('b');

    expect(await settles(Promise.all([owner, join]))).toBe(true);
    expect(await settles(revisit)).toBe(true);
    expect(remote.calls).toHaveLength(1);
  });

  it('keeps cached readiness pending for an independent chain after a nested call skips', async () => {
    let release!: () => void;
    let revisited!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const afterRevisit = new Promise<void>((resolve) => (revisited = resolve));
    const remote = container(async (_pool, chain) => {
      await I('b', chain);
      revisited();
      await gate;
    });
    const { I } = host({ remote: [['a', 'b'], remote] });

    const owner = I('a');
    expect(await settles(afterRevisit)).toBe(true);
    const join = I('b');
    try {
      expect(await settles(join)).toBe(false);
    } finally {
      release();
    }
    expect(await settles(Promise.all([owner, join]))).toBe(true);
    expect(remote.calls).toHaveLength(1);
  });

  it('still walks scalar remotes for a scalar request after an array request', async () => {
    const remote = container();
    const { I, S } = host({ remote: ['c', remote] });

    await I(['a', 'b']);
    expect(remote.calls).toEqual([]);
    await I('a');
    expect(remote.calls).toEqual([{ pool: S.a, keys: 'a', map: S, args: 3 }]);
  });

  it('includes a record started by an ordered request in cached scalar readiness', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const remote = container(() =>
      remote.calls.length === 1 ? undefined : gate,
    );
    const { I, S } = host({ remote: ['a', remote] });

    await I('a');
    const owner = I(['a']);
    expect(remote.calls).toEqual([
      { pool: S.a, keys: 'a', map: S, args: 3 },
      { pool: S.a, keys: 'a', map: S, args: 3 },
    ]);
    const join = I('a');
    try {
      expect(await settles(join)).toBe(false);
    } finally {
      release();
    }
    expect(await settles(Promise.all([owner, join]))).toBe(true);
  });

  it('waits for later scopes in the same ordered request', async () => {
    let releaseArray!: () => void;
    let releaseScalar!: () => void;
    const array = container(
      () => new Promise<void>((resolve) => (releaseArray = resolve)),
    );
    const scalar = container(
      () => new Promise<void>((resolve) => (releaseScalar = resolve)),
    );
    const { I, S } = host({
      array: [['a', 'b'], array],
      scalar: ['b', scalar],
    });

    const ready = I(['a', 'b']);
    releaseArray();
    try {
      expect(await settles(ready)).toBe(false);
    } finally {
      releaseScalar();
    }
    expect(await settles(ready)).toBe(true);
    expect(array.calls).toEqual([
      { pool: S.a, keys: ['a', 'b'], map: S, args: 3 },
    ]);
    expect(scalar.calls).toEqual([{ pool: S.b, keys: 'b', map: S, args: 3 }]);
  });

  it('makes a second chain wait for an init that is still running', async () => {
    let release: () => void = () => undefined;
    const remote = container(
      () => new Promise<void>((resolve) => (release = resolve)),
    );
    const { I } = host({ remote: [['a', 'b'], remote] });

    const first = I('a');
    const second = I('b');

    expect(await settles(second)).toBe(false);
    release();
    expect(await settles(Promise.all([first, second]))).toBe(true);
    expect(remote.calls).toHaveLength(1);
  });

  it.each([
    [
      'throws',
      () => {
        throw new Error('init failed');
      },
    ],
    ['rejects', () => Promise.reject(new Error('init failed'))],
  ])(
    'warns once and does not retry a remote whose init %s',
    async (_label, fail) => {
      const remote = container(fail);
      const { I } = host({ remote: [['a', 'b'], remote] });

      expect(await settles(I('a'))).toBe(true);
      expect(await settles(I('b'))).toBe(true);

      expect(remote.calls).toHaveLength(1);
      expect(warn).toHaveBeenCalledTimes(1);
    },
  );
});
