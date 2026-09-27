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
