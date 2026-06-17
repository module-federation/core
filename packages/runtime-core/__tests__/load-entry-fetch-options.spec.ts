import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as sdk from '@module-federation/sdk';
import { __loadEntryDomForTest } from '../src/utils/load';

describe('loadEntryDom ESM fetchOptions gate', () => {
  const loaderHook: any = { lifecycle: { fetch: { emit: vi.fn() } } };
  let loadEsmEntryWithFetch: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on the sdk's blob loader. load.ts imports from the same module
    // namespace, so spying here intercepts the call it makes.
    loadEsmEntryWithFetch = vi
      .spyOn(sdk, 'loadEsmEntryWithFetch')
      .mockResolvedValue({ ok: 1 });
  });

  afterEach(() => {
    loadEsmEntryWithFetch.mockRestore();
  });

  it('uses the blob loader for module remotes carrying fetchOptions', async () => {
    const remoteInfo: any = {
      name: 'a',
      entry: 'http://x/e.js',
      type: 'module',
      entryGlobalName: 'a',
      shareScope: 'default',
      fetchOptions: { headers: { Authorization: 'Bearer t' } },
    };
    await __loadEntryDomForTest({ remoteInfo, loaderHook });
    expect(loadEsmEntryWithFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        entry: 'http://x/e.js',
        fetchOptions: remoteInfo.fetchOptions,
      }),
    );
  });

  it('wraps blob loader failures as RUNTIME_008 so loadEntryError recovery can fire', async () => {
    loadEsmEntryWithFetch.mockRejectedValueOnce(
      new Error('BlobLoaderNetworkError: 401 Unauthorized for http://x/e.js'),
    );
    const remoteInfo: any = {
      name: 'a',
      entry: 'http://x/e.js',
      type: 'module',
      entryGlobalName: 'a',
      shareScope: 'default',
      fetchOptions: { headers: { Authorization: 'Bearer t' } },
    };
    const err = await __loadEntryDomForTest({ remoteInfo, loaderHook }).then(
      () => undefined,
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(Error);
    // RUNTIME_008 = 'RUNTIME-008'; getRemoteEntry keys recovery off this code.
    expect((err as Error).message).toContain('RUNTIME-008');
    // The original failure is preserved for diagnostics.
    expect((err as Error).message).toContain('401 Unauthorized');
  });

  it('does NOT use the blob loader for module remotes without fetchOptions', async () => {
    const remoteInfo: any = {
      name: 'b',
      entry: 'http://x/e2.js',
      type: 'module',
      entryGlobalName: 'b',
      shareScope: 'default',
    };
    await __loadEntryDomForTest({ remoteInfo, loaderHook }).catch(
      () => undefined,
    );
    expect(loadEsmEntryWithFetch).not.toHaveBeenCalled();
  });
});
