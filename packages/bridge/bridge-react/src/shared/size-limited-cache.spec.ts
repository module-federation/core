import { describe, expect, it } from '@rstest/core';
import { SizeLimitedCache } from './size-limited-cache';

describe('SizeLimitedCache', () => {
  it('evicts the least recently used entries by total size', () => {
    const cache = new SizeLimitedCache<string, string>({
      maxSize: 6,
      sizeCalculation: (value) => value.length,
    });

    cache.set('first', 'aaa').set('second', 'bbb');
    expect(cache.get('first')).toBe('aaa');

    cache.set('third', 'ccc');

    expect(cache.has('first')).toBe(true);
    expect(cache.has('second')).toBe(false);
    expect(cache.has('third')).toBe(true);
    expect(cache.calculatedSize).toBe(6);
  });

  it('updates size when replacing an entry', () => {
    const cache = new SizeLimitedCache<string, string>({ maxSize: 5 });

    cache.set('entry', 'first', { size: 2 });
    cache.set('entry', 'second', { size: 4 });

    expect(cache.get('entry')).toBe('second');
    expect(cache.size).toBe(1);
    expect(cache.calculatedSize).toBe(4);
  });

  it('removes an existing entry when its replacement is oversized', () => {
    const cache = new SizeLimitedCache<string, string>({ maxSize: 5 });

    cache.set('entry', 'first', { size: 2 });
    cache.set('entry', 'oversized', { size: 6 });

    expect(cache.has('entry')).toBe(false);
    expect(cache.calculatedSize).toBe(0);
  });

  it('deletes and clears entries while keeping size accurate', () => {
    const cache = new SizeLimitedCache<string, string>({ maxSize: 5 });

    cache.set('first', 'a', { size: 2 });
    cache.set('second', 'b', { size: 3 });
    expect(cache.delete('first')).toBe(true);
    expect(cache.calculatedSize).toBe(3);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.calculatedSize).toBe(0);
  });

  it('can evict an undefined key', () => {
    const cache = new SizeLimitedCache<string | undefined, string>({
      maxSize: 2,
    });

    cache.set(undefined, 'first', { size: 2 });
    cache.set('second', 'second', { size: 2 });

    expect(cache.has(undefined)).toBe(false);
    expect(cache.get('second')).toBe('second');
  });

  it('rejects invalid limits and entry sizes', () => {
    expect(() => new SizeLimitedCache({ maxSize: 0 })).toThrow(TypeError);

    const cache = new SizeLimitedCache<string, string>({ maxSize: 5 });
    expect(() => cache.set('entry', 'value', { size: 0 })).toThrow(TypeError);
  });
});
