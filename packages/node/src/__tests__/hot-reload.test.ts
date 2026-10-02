import crypto from 'crypto';
import { performReload } from '../utils/hot-reload';

describe('performReload', () => {
  afterEach(() => {
    delete (globalThis as any).__FEDERATION__;
    delete (globalThis as any).entryChunkCache;
  });

  it('clears federation caches when called outside a bundle', async () => {
    const moduleCache = new Map([
      ['shop', { remoteInfo: { name: 'shop', entryGlobalName: 'shop' } }],
    ]);
    (globalThis as any).__FEDERATION__ = {
      __INSTANCES__: [{ name: 'host', moduleCache }],
      __PRELOADED_ASSETS__: new Set(),
    };
    (globalThis as any).entryChunkCache = new Set();

    expect(typeof (globalThis as any).__webpack_require__).toBe('undefined');
    await expect(performReload(true)).resolves.toBe(true);
    expect(moduleCache.size).toBe(0);
  });
});

describe('fetchRemote', () => {
  it('detects the first change after the SSR runtime records an entry hash', async () => {
    const previousHashMap = globalThis.mfHashMap;
    delete globalThis.mfHashMap;
    try {
      let fetchRemote!: typeof import('../utils/hot-reload').fetchRemote;
      jest.isolateModules(() => {
        fetchRemote = require('../utils/hot-reload').fetchRemote;
      });
      globalThis.mfHashMap ||= {};
      globalThis.mfHashMap.shop = crypto
        .createHash('md5')
        .update('original entry')
        .digest('hex');

      const changed = await fetchRemote(
        { shop: { entry: 'http://localhost/remoteEntry.js' } },
        async () => ({ ok: true, text: async () => 'updated entry' }),
      );

      expect(changed).toBe(true);
    } finally {
      globalThis.mfHashMap = previousHashMap;
    }
  });
});
