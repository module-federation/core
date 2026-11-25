import { beforeEach, describe, expect, it } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import type { ModuleFederationRuntimePlugin } from '../src/type';

const createVersionFirstHost = (plugins?: ModuleFederationRuntimePlugin[]) =>
  new ModuleFederation({
    name: 'share-init-scope-host',
    remotes: [],
    shareStrategy: 'version-first',
    plugins,
    shared: {
      'shared-one': {
        version: '1.0.0',
        lib: () => ({ value: 'one' }),
      },
    },
  });

/**
 * Registers a remote whose entry loading is stubbed locally (no network)
 * and returns a handle counting getEntry invocations. Mutate `behavior` to
 * change what getEntry returns/throws.
 */
function stubRemote(mf: ModuleFederation, getEntry?: () => Promise<any>) {
  mf.registerRemotes([
    {
      name: 'remote1',
      entry: 'https://example.com/remoteEntry.js',
      shareScope: 'default',
    },
  ]);
  const module = mf.initRawContainer(
    'remote1',
    'https://example.com/remoteEntry.js',
    {},
  ) as any;
  const state = {
    getEntryCalls: 0,
    behavior: getEntry,
  };
  module.getEntry = async () => {
    state.getEntryCalls += 1;
    return state.behavior ? state.behavior() : {};
  };
  return state;
}

describe('share re-registration guard', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it('registers the host share table only once across repeated share consumptions', async () => {
    let afterRegisterShareCount = 0;
    const countingPlugin: ModuleFederationRuntimePlugin = {
      name: 'after-register-share-counter',
      afterRegisterShare() {
        afterRegisterShareCount += 1;
      },
    };

    const mf = new ModuleFederation({
      name: 'share-init-scope-host',
      remotes: [],
      plugins: [countingPlugin],
      shared: {
        'shared-one': {
          version: '1.0.0',
          lib: () => ({ value: 'one' }),
        },
        'shared-two': {
          version: '1.0.0',
          lib: () => ({ value: 'two' }),
        },
      },
    });

    // Construction registers the share table once: one afterRegisterShare
    // emission per shared entry per scope.
    const countAfterConstruction = afterRegisterShareCount;
    expect(countAfterConstruction).toBe(2);

    // The first consumption runs the one-time scope initialization for the
    // default scope: one more emission round per shared entry.
    await mf.loadShare('shared-one');
    const countAfterFirstLoad = afterRegisterShareCount;
    expect(countAfterFirstLoad).toBe(countAfterConstruction + 2);

    // Subsequent consumptions must not re-run share registration.
    await mf.loadShare('shared-two');
    mf.loadShareSync('shared-one');
    await mf.loadShare('shared-one');
    mf.loadShareSync('shared-two');

    expect(afterRegisterShareCount).toBe(countAfterFirstLoad);
  });

  it('does not re-register on repeated loadShareSync consumptions and keeps resolving the share', () => {
    let afterRegisterShareCount = 0;
    const countingPlugin: ModuleFederationRuntimePlugin = {
      name: 'after-register-share-counter',
      afterRegisterShare() {
        afterRegisterShareCount += 1;
      },
    };

    const mf = new ModuleFederation({
      name: 'share-init-scope-sync-host',
      remotes: [],
      plugins: [countingPlugin],
      shared: {
        'shared-one': {
          version: '1.0.0',
          lib: () => ({ value: 'one' }),
        },
      },
    });

    const countAfterConstruction = afterRegisterShareCount;

    const first = mf.loadShareSync<{ value: string }>('shared-one');
    const countAfterFirstSyncLoad = afterRegisterShareCount;

    mf.loadShareSync('shared-one');
    mf.loadShareSync('shared-one');

    expect(afterRegisterShareCount).toBe(countAfterFirstSyncLoad);
    expect(countAfterFirstSyncLoad).toBeGreaterThan(countAfterConstruction);
    expect(first()).toEqual({ value: 'one' });
  });

  it('awaits in-flight remote initialization when concurrent loadShare calls hit the init-token guard', async () => {
    const mf = createVersionFirstHost();

    let resolveEntry: () => void = () => {};
    stubRemote(
      mf,
      () =>
        new Promise<void>((resolve) => {
          resolveEntry = resolve;
        }),
    );

    const firstLoad = mf.loadShare<{ value: string }>('shared-one');
    // Second concurrent consumption hits the init-token guard: it must
    // await the same remote-initialization promises as the first call
    // instead of resolving against the share map immediately.
    const secondLoad = mf.loadShare<{ value: string }>('shared-one');

    let secondLoadDone = false;
    secondLoad.then(() => {
      secondLoadDone = true;
    });

    // let the event loop turn a few times while the remote entry is still
    // loading
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(secondLoadDone).toBe(false);

    resolveEntry();
    const [firstResult, secondResult] = await Promise.all([
      firstLoad,
      secondLoad,
    ]);

    expect(firstResult?.()).toEqual({ value: 'one' });
    expect(secondResult?.()).toEqual({ value: 'one' });
  });

  it('re-initializes the share scope after registerRemotes adds a remote', async () => {
    const mf = createVersionFirstHost();

    // Consume a share once: the scope is now marked as initialized.
    await mf.loadShare('shared-one');

    const remote = stubRemote(mf);
    await mf.loadShare('shared-one');

    expect(remote.getEntryCalls).toBe(1);
  });

  it('initializes remotes for a later version-first consumer when a loaded-first consumer initialized the scope first', async () => {
    // Mixed strategies within one share scope: the first consumer is
    // loaded-first, so the scope is marked initialized without fetching any
    // remote entries. The second consumer is version-first and must still
    // initialize the scope's remotes so remote-provided shares join version
    // selection.
    const mf = new ModuleFederation({
      name: 'mixed-strategy-host',
      remotes: [],
      shared: {
        react: {
          version: '18.2.0',
          strategy: 'loaded-first',
          lib: () => ({ name: 'host-react' }),
        },
        lodash: {
          version: '4.17.20',
          strategy: 'version-first',
          get: () => Promise.resolve(() => ({ version: 'host-4.17.20' })),
        },
      },
    });

    mf.registerRemotes([
      {
        name: 'remote1',
        entry: 'https://example.com/remoteEntry.js',
        shareScope: 'default',
      },
    ]);
    const module = mf.initRawContainer(
      'remote1',
      'https://example.com/remoteEntry.js',
      {},
    ) as any;

    const state = { initCalls: 0 };
    module.getEntry = async () => ({
      init: (shareScope: Record<string, any>) => {
        state.initCalls += 1;
        // Register the remote's share into the host's share scope, like a
        // real remote entry does during container init.
        shareScope.lodash = shareScope.lodash || {};
        shareScope.lodash['4.17.21'] = {
          version: '4.17.21',
          scope: ['default'],
          from: 'remote1',
          get: () => () => ({ version: 'remote-4.17.21' }),
        };
      },
    });

    // loaded-first consumer: pushes the init token without remote init.
    await mf.loadShare('react');
    expect(state.initCalls).toBe(0);

    // version-first consumer: the guard must not hide the missing remote
    // initialization from the first (loaded-first) run.
    const lodash = await mf.loadShare<{ version: string }>('lodash');

    expect(state.initCalls).toBe(1);
    // The remote-provided higher version participates in resolution.
    expect(lodash?.()).toEqual({ version: 'remote-4.17.21' });
  });

  it('retries share scope initialization after a failed initialization', async () => {
    const mf = createVersionFirstHost([
      {
        name: 'rethrow-error-load-remote',
        errorLoadRemote(args) {
          throw args.error;
        },
      },
    ]);

    const remote = stubRemote(mf, async () => {
      throw new Error('entry failed');
    });

    await expect(mf.loadShare('shared-one')).rejects.toThrow('entry failed');
    expect(remote.getEntryCalls).toBe(1);

    // the failed initialization must not be cached: the next loadShare
    // re-runs initialization instead of replaying the cached rejection
    remote.behavior = async () => ({});
    const result = await mf.loadShare<{ value: string }>('shared-one');

    expect(remote.getEntryCalls).toBe(2);
    expect(result?.()).toEqual({ value: 'one' });
  });

  it('does not hand cached remote-init promises to foreign init scopes (recursive container init)', async () => {
    // Recursive/nested container initialization passes its own initScope
    // down. If such a foreign scope already contains the init token, the
    // call must fall through to the old, safe behavior (return its local
    // promises array) instead of the owning run's remote-init promises:
    // in a circular remote graph those promises resolve only when the
    // in-flight remote finishes, which would deadlock.
    const mf = createVersionFirstHost();
    stubRemote(mf);

    // Initialize the scope once so the cache is populated.
    await mf.loadShare('shared-one');
    const handler = (mf as any).sharedHandler;
    expect(handler.shareInitPromises.default.length).toBeGreaterThan(0);

    const token = handler.initTokens.default;
    const foreignScope = [token];
    const result = await handler.initializeSharing('default', {
      initScope: foreignScope,
    });

    // Must be the call's own local promises array, not the cached one.
    expect(result).toEqual([]);
    expect(result).not.toBe(handler.shareInitPromises.default);
  });
});
