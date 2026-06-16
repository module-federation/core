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
