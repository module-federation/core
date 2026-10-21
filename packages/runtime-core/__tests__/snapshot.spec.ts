import { assert, describe, it, rs } from '@rstest/core';
import { ModuleFederation } from '../src';
import { getGlobalSnapshot, resetFederationGlobalInfo } from '../src/global';

describe('snapshot', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it('The host snapshot is automatically completed', async () => {
    const Remote1Entry =
      'http://localhost:1111/resources/snapshot/remote1/federation-manifest.json';
    const Remote2Entry =
      'http://localhost:1111/resources/snapshot/remote2/federation-manifest.json';
    const FM1 = new ModuleFederation({
      name: '@snapshot/host',
      version: '0.0.3',
      remotes: [
        {
          name: '@snapshot/remote1',
          entry: Remote1Entry,
        },
        {
          name: '@snapshot/remote2',
          entry: Remote2Entry,
        },
      ],
    });

    const module = await FM1.loadRemote<() => string>('@snapshot/remote1/say');
    assert(module);
    expect(module()).toBe('hello world "@snapshot/remote1"');

    const module2 = await FM1.loadRemote<() => string>('@snapshot/remote2/say');
    assert(module2);
    expect(module2()).toBe('hello world "@snapshot/remote2"');

    const globalSnapshot = getGlobalSnapshot();

    assert(globalSnapshot['@snapshot/host']);
    expect(globalSnapshot['@snapshot/host']).toMatchObject({
      version: '0.0.3',
      remotesInfo: {
        '@snapshot/remote1': { matchedVersion: Remote1Entry },
        '@snapshot/remote2': { matchedVersion: Remote2Entry },
      },
    });
  });
  describe('manifest fetch and loadEntryTimeout', () => {
    const Remote1Entry =
      'http://localhost:1111/resources/snapshot/remote1/federation-manifest.json';

    const withFetchSpy = async (
      loadEntryTimeout: number | undefined,
      run: (seen: Array<RequestInit | undefined>) => Promise<void>,
    ) => {
      const originalFetch = global.fetch;
      const seen: Array<RequestInit | undefined> = [];
      global.fetch = ((url: RequestInfo | URL, init?: RequestInit) => {
        seen.push(init);
        return originalFetch(url, init);
      }) as typeof fetch;
      try {
        const FM = new ModuleFederation({
          name: '@snapshot/host-timeout',
          remotes: [{ name: '@snapshot/remote1', entry: Remote1Entry }],
          ...(loadEntryTimeout === undefined ? {} : { loadEntryTimeout }),
        });
        await FM.loadRemote<() => string>('@snapshot/remote1/say');
        await run(seen);
      } finally {
        global.fetch = originalFetch;
      }
    };

    it('bounds the manifest fetch with loadEntryTimeout', async () => {
      const setTimeoutSpy = rs.spyOn(globalThis, 'setTimeout');
      try {
        await withFetchSpy(4321, async (seen) => {
          expect(seen.length).toBeGreaterThan(0);
          expect(seen[0]?.signal).toBeInstanceOf(AbortSignal);
          expect(setTimeoutSpy).toHaveBeenCalledWith(
            expect.any(Function),
            4321,
          );
        });
      } finally {
        setTimeoutSpy.mockRestore();
      }
    });

    it('leaves the manifest fetch unbounded without loadEntryTimeout', async () => {
      await withFetchSpy(undefined, async (seen) => {
        expect(seen.length).toBeGreaterThan(0);
        expect(seen[0]?.signal).toBeUndefined();
      });
    });
  });
});
