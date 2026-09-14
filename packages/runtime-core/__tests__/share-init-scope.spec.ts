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
});
