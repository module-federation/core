import { describe, it, expect, rs, beforeEach, afterEach } from '@rstest/core';
import { loadModule } from '../src/utils/blobLoad';
import { __loadEntryDomForTest } from '../src/utils/load';

// Create a mocked fetch lifecycle loader hook
function createLoaderHook(hasFetchListener: boolean) {
  const listeners = new Set<any>();
  if (hasFetchListener) {
    listeners.add(() => undefined);
  }
  return {
    lifecycle: {
      fetch: { emit: rs.fn(), listeners },
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
  let originalFetch: typeof globalThis.fetch;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let fetchMock: ReturnType<typeof rs.fn>;

  beforeEach(() => {
    rs.clearAllMocks();
    loadModule.clearCache();
    originalFetch = globalThis.fetch;
    originalCreateObjectURL = URL.createObjectURL;
    fetchMock = rs.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve('export const ok = 1;'),
    });
    globalThis.fetch = fetchMock as any;
    URL.createObjectURL = rs.fn(
      () => 'data:text/javascript,export const ok = 1;',
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    URL.createObjectURL = originalCreateObjectURL;
  });

  it('uses the blob loader for module remotes when a fetch hook is registered', async () => {
    const loaderHook = createLoaderHook(true);
    const resourceContext: any = {
      initiator: 'loadRemote',
      id: 'a/say',
      resourceType: 'remoteEntry',
    };
    const result = await __loadEntryDomForTest({
      remoteInfo: createRemoteInfo('a', 'http://x/e.js'),
      loaderHook,
      resourceContext,
    });
    expect(fetchMock).toHaveBeenCalledWith('http://x/e.js', expect.anything());
    // The loader's customFetch forwards remoteInfo and resourceContext as
    // additional arguments so the plugin can add different headers per remote/resource.
    expect(loaderHook.lifecycle.fetch.emit).toHaveBeenCalledWith(
      'http://x/e.js',
      { headers: {} },
      expect.objectContaining({ name: 'a' }),
      resourceContext,
    );
    expect(result).toEqual(expect.objectContaining({ ok: 1 }));
  });

  it('wraps blob loader failures as RUNTIME_008 so loadEntryError recovery can fire', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve(''),
    });
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
    const loaderHook = createLoaderHook(false);
    await __loadEntryDomForTest({
      remoteInfo: createRemoteInfo('b', 'http://x/e2.js'),
      loaderHook,
    }).catch(() => undefined);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(loaderHook.lifecycle.fetch.emit).not.toHaveBeenCalled();
  });
});
