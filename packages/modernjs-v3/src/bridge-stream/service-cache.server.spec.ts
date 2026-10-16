import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import {
  createBridgeServiceCache,
  type BridgeServiceCacheOptions,
} from './service-cache.server';

const transcript = (text: string) => [new TextEncoder().encode(text)];
const read = (chunks: Uint8Array[] | undefined) =>
  chunks && new TextDecoder().decode(Buffer.concat(chunks));

afterEach(() => rstest.restoreAllMocks());

describe('Bridge service transcript cache', () => {
  it('evicts the least recently read entry when the entry limit is reached', () => {
    const cache = createBridgeServiceCache({ maxAgeMs: 1000, maxEntries: 2 });
    cache.set('a', transcript('first'));
    cache.set('b', transcript('second'));
    expect(read(cache.get('a'))).toBe('first');
    cache.set('c', transcript('third'));
    expect(cache.get('b')).toBeUndefined();
    expect(read(cache.get('a'))).toBe('first');
    expect(read(cache.get('c'))).toBe('third');
  });

  it('counts all chunk bytes and evicts until the total byte limit fits', () => {
    const cache = createBridgeServiceCache({ maxAgeMs: 1000, maxBytes: 6 });
    cache.set('a', transcript('aa'));
    cache.set('b', transcript('bb'));
    cache.set('c', transcript('cc'));
    cache.get('a');
    expect(cache.set('d', [...transcript('dd'), ...transcript('dd')])).toBe(
      true,
    );
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBeUndefined();
    expect(read(cache.get('a'))).toBe('aa');
    expect(read(cache.get('d'))).toBe('dddd');
  });

  it('rejects oversized entries without evicting a valid entry or replacement', () => {
    const cache = createBridgeServiceCache({
      maxAgeMs: 1000,
      maxBytes: 5,
      maxEntryBytes: 3,
    });
    expect(cache.set('a', transcript('abc'))).toBe(true);
    expect(cache.set('a', transcript('abcd'))).toBe(false);
    expect(cache.set('b', [...transcript('ab'), ...transcript('cd')])).toBe(
      false,
    );
    expect(read(cache.get('a'))).toBe('abc');
    expect(cache.get('b')).toBeUndefined();
  });

  it('releases replaced entry bytes and refreshes its LRU position', () => {
    const cache = createBridgeServiceCache({ maxAgeMs: 1000, maxBytes: 5 });
    cache.set('a', transcript('aaa'));
    cache.set('b', transcript('bb'));
    cache.set('a', transcript('a'));
    cache.set('c', transcript('cc'));
    expect(read(cache.get('b'))).toBe('bb');
    expect(read(cache.get('a'))).toBe('a');
    cache.set('d', transcript('dd'));
    expect(cache.get('c')).toBeUndefined();
    expect(read(cache.get('d'))).toBe('dd');
  });

  it('starts TTL on commit and reads do not extend it', () => {
    const now = rstest.spyOn(Date, 'now').mockReturnValue(100);
    const cache = createBridgeServiceCache({ maxAgeMs: 1000 });
    now.mockReturnValue(2000);
    cache.set('a', transcript('a'));
    now.mockReturnValue(2999);
    expect(read(cache.get('a'))).toBe('a');
    now.mockReturnValue(3000);
    expect(cache.get('a')).toBeUndefined();
  });

  it('removes expired entries before evicting live entries regardless of LRU order', () => {
    const now = rstest.spyOn(Date, 'now').mockReturnValue(100);
    const cache = createBridgeServiceCache({ maxAgeMs: 1000, maxEntries: 2 });
    cache.set('expired', transcript('old'));
    now.mockReturnValue(500);
    cache.set('live', transcript('live'));
    cache.get('expired');
    now.mockReturnValue(1100);
    cache.set('new', transcript('new'));
    expect(cache.get('expired')).toBeUndefined();
    expect(read(cache.get('live'))).toBe('live');
    expect(read(cache.get('new'))).toBe('new');
  });

  it('refreshes TTL when a completed entry is replaced', () => {
    const now = rstest.spyOn(Date, 'now').mockReturnValue(100);
    const cache = createBridgeServiceCache({ maxAgeMs: 1000 });
    cache.set('a', transcript('old'));
    now.mockReturnValue(500);
    cache.set('a', transcript('new'));
    now.mockReturnValue(1100);
    expect(read(cache.get('a'))).toBe('new');
    now.mockReturnValue(1500);
    expect(cache.get('a')).toBeUndefined();
  });

  it('copies Buffer views on commit and returns independent chunks for every replay', () => {
    const cache = createBridgeServiceCache({ maxAgeMs: 1000 });
    const source = Buffer.from('abcdef');
    const chunks = [source.subarray(1, 3), source.subarray(3, 5)];
    cache.set('a', chunks);
    source.fill(0);
    chunks.splice(0, chunks.length);
    const first = cache.get('a')!;
    const second = cache.get('a')!;
    expect(first.map((chunk) => chunk.length)).toEqual([2, 2]);
    expect(read(first)).toBe('bcde');
    first[0].fill(0);
    first.pop();
    expect(read(second)).toBe('bcde');
    expect(read(cache.get('a'))).toBe('bcde');
  });

  it('skips an oversized replay without consuming the entry or refreshing its LRU position', () => {
    const cache = createBridgeServiceCache({ maxAgeMs: 1000, maxEntries: 2 });
    cache.set('a', [...transcript('ab'), ...transcript('cd')]);
    expect(cache.get('a', 3)).toBeUndefined();
    expect(read(cache.get('a', 4))).toBe('abcd');
    cache.set('b', transcript('b'));
    expect(cache.get('a', 3)).toBeUndefined();
    cache.set('c', transcript('c'));
    expect(cache.get('a')).toBeUndefined();
    expect(read(cache.get('b'))).toBe('b');
  });

  it('hashes the entire serialized request including identity and opaque inputs', () => {
    const cache = createBridgeServiceCache({ maxAgeMs: 1000 });
    const input = {
      protocol: 'mf-bridge-service/1',
      revision: 'v1',
      hydration: 'progressive',
      request: {
        instanceId: 'render-0',
        identifierPrefix: 'render-0-',
        nonce: 'nonce',
        url: 'https://host.example/page?a=1',
        headers: { cookie: 'tenant=a' },
        moduleName: 'app/remote',
        basename: '/app',
        memoryRoute: { entryPath: '/a' },
        props: { value: '秘密' },
      },
    };
    const serialized = JSON.stringify(input);
    const key = cache.key(serialized);
    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(cache.key(serialized)).toBe(key);
    for (const name of Object.keys(input)) {
      expect(
        cache.key(JSON.stringify({ ...input, [name]: 'changed' })),
      ).not.toBe(key);
    }
    for (const name of Object.keys(input.request)) {
      expect(
        cache.key(
          JSON.stringify({
            ...input,
            request: { ...input.request, [name]: 'changed' },
          }),
        ),
      ).not.toBe(key);
    }
    expect(
      cache.key(JSON.stringify({ ...input, extra: 'unknown future field' })),
    ).not.toBe(key);
  });

  it('keeps exact serialized identity instead of silently canonicalizing input', () => {
    const cache = createBridgeServiceCache({ maxAgeMs: 1000 });
    expect(cache.key('{"a":1,"b":2}')).not.toBe(cache.key('{"b":2,"a":1}'));
  });

  it('uses bounded defaults and fits the default entry limit into a smaller total', () => {
    expect(createBridgeServiceCache({ maxAgeMs: 1000 }).maxEntryBytes).toBe(
      1024 * 1024,
    );
    const cache = createBridgeServiceCache({ maxAgeMs: 1000, maxBytes: 10 });
    expect(cache.maxEntryBytes).toBe(10);
    expect(cache.set('full', transcript('1234567890'))).toBe(true);
    expect(cache.set('large', transcript('12345678901'))).toBe(false);
  });

  it('rejects invalid cache limits at configuration time', () => {
    for (const name of [
      'maxAgeMs',
      'maxEntries',
      'maxBytes',
      'maxEntryBytes',
    ]) {
      for (const value of [
        0,
        -1,
        1.5,
        NaN,
        Infinity,
        Number.MAX_SAFE_INTEGER + 1,
      ]) {
        expect(() =>
          createBridgeServiceCache({
            maxAgeMs: 1000,
            [name]: value,
          } as BridgeServiceCacheOptions),
        ).toThrow(name);
      }
    }
    expect(() =>
      createBridgeServiceCache({
        maxAgeMs: 1000,
        maxBytes: 10,
        maxEntryBytes: 11,
      }),
    ).toThrow('maxEntryBytes');
  });
});
