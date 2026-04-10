import { it, expect, describe, vi } from 'vitest';

vi.mock('fs/promises', () => ({
  access: () => Promise.resolve(),
  lstat: () =>
    Promise.resolve({
      mtimeMs: Date.now(),
      size: 4,
    }),
  readFile: () => Promise.resolve('test'),
}));

import { FileCache } from './fileCache';

describe('modern serve static file cache', async () => {
  it('should cache file', async () => {
    const cache = new FileCache();
    const result = await cache.getFile('test.txt');
    expect(result?.content).toBe('test');
  });
});
