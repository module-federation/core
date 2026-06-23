import { describe, it, expect, vi, afterEach } from 'vitest';
import { ModuleFederation } from '../src';
import { resetFederationGlobalInfo } from '../src/global';

describe('manifest fetch goes through the fetch hook with remoteInfo', () => {
  afterEach(() => {
    resetFederationGlobalInfo();
    vi.restoreAllMocks();
  });

  // Header/auth customization is request behavior handled by the existing fetch
  // hook: the manifest request is emitted through it with the remote's
  // `remoteInfo`, so a plugin can attach headers (e.g. Authorization) per
  // remote without any extra remote-registration config.
  it('emits the manifest request with remoteInfo so a plugin can authenticate it', async () => {
    const manifestUrl =
      'http://localhost:1111/resources/snapshot/remote1/federation-manifest.json';

    const mf = new ModuleFederation({
      name: '@manifest-fetch-hook/host',
      remotes: [],
    });

    const emitSpy = vi.spyOn(mf.loaderHook.lifecycle.fetch, 'emit');

    mf.registerRemotes([
      {
        name: '@snapshot/remote1',
        entry: manifestUrl,
      },
    ]);

    await mf
      .loadRemote<() => string>('@snapshot/remote1/say')
      .catch(() => undefined);

    const manifestCall = emitSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0] === manifestUrl,
    );

    expect(manifestCall).toBeTruthy();
    // 3rd argument is remoteInfo for the remote being loaded — the hook keys
    // its header/auth decisions off this.
    expect((manifestCall?.[2] as any)?.name).toBe('@snapshot/remote1');
    expect((manifestCall?.[2] as any)?.entry).toBe(manifestUrl);
  });
});
