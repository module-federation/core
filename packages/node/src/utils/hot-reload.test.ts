import {
  checkFakeRemote,
  checkMedusaConfigChange,
  fetchRemote,
} from './hot-reload';

describe('hot-reload utilities', () => {
  beforeEach(() => {
    globalThis.mfHashMap = {};
  });

  it('detects medusa config version changes asynchronously', async () => {
    const remoteScope = {
      _medusa: {
        'https://example.com/medusa.json': { version: '1.0.0' },
      },
    };
    const fetchModule = jest.fn().mockResolvedValue({
      json: async () => ({ version: '1.1.0' }),
    });

    await expect(
      checkMedusaConfigChange(remoteScope, fetchModule),
    ).resolves.toBe(true);
  });

  it('resolves async fake remote factories', async () => {
    const remoteScope = {
      _config: {
        shop: async () => ({ fake: true }),
      },
    };

    await expect(checkFakeRemote(remoteScope)).resolves.toBe(true);
  });

  it('skips malformed remotes without entry url', async () => {
    const fetchModule = jest.fn();

    await expect(fetchRemote({ invalid: {} }, fetchModule)).resolves.toBe(
      false,
    );
    expect(fetchModule).not.toHaveBeenCalled();
  });

  it('marks reload when a remote entry hash changes', async () => {
    const remoteScope = {
      shop: { entry: 'https://example.com/remoteEntry.js' },
    };
    const fetchModule = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'remote-entry-v1',
        headers: { get: () => 'text/javascript' },
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'remote-entry-v2',
        headers: { get: () => 'text/javascript' },
      });

    await expect(fetchRemote(remoteScope, fetchModule)).resolves.toBe(false);
    await expect(fetchRemote(remoteScope, fetchModule)).resolves.toBe(true);
  });
});
