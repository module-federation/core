import { beforeEach, describe, expect, it } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import type { ModuleFederationRuntimePlugin } from '../src/type';

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
});
