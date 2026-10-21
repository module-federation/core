import { beforeEach, describe, expect, it, rs } from '@rstest/core';

rs.mock('fs/promises', () => ({
  access: () => Promise.resolve(),
  lstat: () =>
    Promise.resolve({
      mtimeMs: 1,
      size: 4,
    }),
  readFile: rs.fn(() => Promise.resolve('test')),
}));

import { readFile } from 'fs/promises';
import { FileCache } from './fileCache';

describe('modern serve static file cache', async () => {
  beforeEach(() => {
    rs.mocked(readFile).mockReset();
    rs.mocked(readFile).mockResolvedValue('test');
  });

  it('should cache file', async () => {
    const cache = new FileCache();
    const result = await cache.getFile('test.txt');
    expect(result?.content).toBe('test');

    await cache.getFile('test.txt');
    expect(readFile).toHaveBeenCalledTimes(1);
  });

  it('evicts the least recently used file when full', async () => {
    const cache = new FileCache(4);

    await cache.getFile('first.txt');
    await cache.getFile('second.txt');
    await cache.getFile('first.txt');

    expect(readFile).toHaveBeenCalledTimes(3);
  });

  it('accounts for UTF-8 bytes when evicting files', async () => {
    rs.mocked(readFile).mockImplementation((filepath) =>
      Promise.resolve(filepath === 'unicode.txt' ? '你' : 'a'),
    );
    const cache = new FileCache(3);

    await cache.getFile('unicode.txt');
    await cache.getFile('ascii.txt');
    await cache.getFile('unicode.txt');

    expect(readFile).toHaveBeenCalledTimes(3);
  });

  it('caches empty files without rejecting their cache entry', async () => {
    rs.mocked(readFile).mockResolvedValue('');
    const cache = new FileCache(1);

    const result = await cache.getFile('empty.txt');
    await cache.getFile('empty.txt');

    expect(result?.content).toBe('');
    expect(readFile).toHaveBeenCalledTimes(1);
  });
});
