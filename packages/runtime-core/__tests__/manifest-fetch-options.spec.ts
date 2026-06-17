import { describe, it, expect, vi, afterEach } from 'vitest';
import { ModuleFederation } from '../src';
import { resetFederationGlobalInfo } from '../src/global';

describe('manifest fetch carries fetchOptions', () => {
  afterEach(() => {
    resetFederationGlobalInfo();
    vi.restoreAllMocks();
  });

  it('passes the remote fetchOptions to the manifest fetch hook', async () => {
    const fetchOptions: RequestInit = {
      headers: { Authorization: 'Bearer token-123' },
    };
    const manifestUrl =
      'http://localhost:1111/resources/snapshot/remote1/federation-manifest.json';

    const mf = new ModuleFederation({
      name: '@manifest-fetch-options/host',
      remotes: [],
    });

    const emitSpy = vi.spyOn(mf.loaderHook.lifecycle.fetch, 'emit');

    mf.registerRemotes(
      [
        {
          name: '@snapshot/remote1',
          entry: manifestUrl,
        },
      ],
      { fetchOptions },
    );

    await mf
      .loadRemote<() => string>('@snapshot/remote1/say')
      .catch(() => undefined);

    const manifestCall = emitSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0] === manifestUrl,
    );

    expect(manifestCall).toBeTruthy();
    // 2nd argument is the request options threaded from the remote.
    expect(manifestCall?.[1]).toEqual(fetchOptions);
    // 3rd argument is remoteInfo, and should carry the fetchOptions too.
    expect((manifestCall?.[2] as any)?.fetchOptions).toEqual(fetchOptions);
  });
});
