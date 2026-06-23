import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as sdk from '@module-federation/sdk';
import { __loadEntryDomForTest } from '../src/utils/load';

// Create a mocked fetch lifecycle loader hook
function createLoaderHook(hasFetchListener: boolean) {
  const listeners = new Set<any>();
  if (hasFetchListener) {
    listeners.add(() => undefined);
  }
  return {
    lifecycle: {
      fetch: { emit: vi.fn(), listeners },
    },
  } as any;
}

// Create a mocked remote info
function createRemoteInfo(name: string, entry: string) {
  return {
    name,
    entry,
    type: 'module',
    entryGlobalName: name,
    shareScope: 'default',
  };
}

describe('loadEntryDom ESM with fetch lifecycle loader hook', () => {
  let loadEsmEntryWithFetch: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    loadEsmEntryWithFetch = vi
      .spyOn(sdk, 'loadEsmEntryWithFetch')
      .mockResolvedValue({ ok: 1 });
  });

  afterEach(() => {
    loadEsmEntryWithFetch.mockRestore();
  });

  it('uses the blob loader for module remotes when a fetch hook is registered', async () => {
    const loaderHook = createLoaderHook(true);
    const resourceContext: any = {
      initiator: 'loadRemote',
      id: 'a/say',
      resourceType: 'remoteEntry',
    };
    await __loadEntryDomForTest({
      remoteInfo: createRemoteInfo('a', 'http://x/e.js'),
      loaderHook,
      resourceContext,
    });
    expect(loadEsmEntryWithFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        entry: 'http://x/e.js',
        customFetch: expect.any(Function),
      }),
    );
    // The loader's customFetch accepts remoteInfo and resourceContext as
    // additional arguments so the plugin can add different headers per remote/resource.
    const { customFetch } = loadEsmEntryWithFetch.mock.calls[0][0] as any;
    await customFetch('http://x/e.js', { headers: {} });
    expect(loaderHook.lifecycle.fetch.emit).toHaveBeenCalledWith(
      'http://x/e.js',
      { headers: {} },
      expect.objectContaining({ name: 'a' }),
      resourceContext,
    );
  });

  it('wraps blob loader failures as RUNTIME_008 so loadEntryError recovery can fire', async () => {
    loadEsmEntryWithFetch.mockRejectedValueOnce(
      new Error('BlobLoaderNetworkError: 401 Unauthorized for http://x/e.js'),
    );
    const err = await __loadEntryDomForTest({
      remoteInfo: createRemoteInfo('a', 'http://x/e.js'),
      loaderHook: createLoaderHook(true),
    }).then(
      () => undefined,
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(Error);
    // RUNTIME_008 = 'RUNTIME-008'; getRemoteEntry keys recovery off this code.
    expect((err as Error).message).toContain('RUNTIME-008');
    // The original failure is preserved for diagnostics.
    expect((err as Error).message).toContain('401 Unauthorized');
  });

  it('does NOT use the blob loader for module remotes when no fetch hook is registered', async () => {
    await __loadEntryDomForTest({
      remoteInfo: createRemoteInfo('b', 'http://x/e2.js'),
      loaderHook: createLoaderHook(false),
    }).catch(() => undefined);
    expect(loadEsmEntryWithFetch).not.toHaveBeenCalled();
  });
});
