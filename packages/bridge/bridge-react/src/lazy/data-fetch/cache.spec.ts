import { beforeEach, describe, expect, it, rs } from '@rstest/core';
import { cache, clearStore, configureCache } from './cache';

describe('data fetch size-limited cache', () => {
  beforeEach(() => {
    globalThis.__MF_DATA_FETCH_CACHE__ = undefined;
  });

  it('evicts the least recently used result when full', async () => {
    const dataFetch = rs.fn(async ({ key }) => key);
    const cachedDataFetch = cache(dataFetch, {
      getKey: (...args: any[]) => args[0].key,
    });
    configureCache({ maxSize: 28 });

    await cachedDataFetch({ _id: 'id', isDowngrade: false, key: 'a' });
    await cachedDataFetch({ _id: 'id', isDowngrade: false, key: 'b' });
    await cachedDataFetch({ _id: 'id', isDowngrade: false, key: 'a' });
    await cachedDataFetch({ _id: 'id', isDowngrade: false, key: 'c' });
    await cachedDataFetch({ _id: 'id', isDowngrade: false, key: 'b' });

    expect(dataFetch).toHaveBeenCalledTimes(4);
  });

  it('does not retain a result larger than the configured limit', async () => {
    const dataFetch = rs.fn(async () => 'large result');
    const cachedDataFetch = cache(dataFetch, {
      getKey: () => 'large',
    });
    configureCache({ maxSize: 10 });

    await cachedDataFetch({ _id: 'id', isDowngrade: false });
    await cachedDataFetch({ _id: 'id', isDowngrade: false });

    expect(dataFetch).toHaveBeenCalledTimes(2);
  });

  it('clears cached results', async () => {
    const dataFetch = rs.fn(async () => 'result');
    const cachedDataFetch = cache(dataFetch);

    await cachedDataFetch({ _id: 'id', isDowngrade: false });
    clearStore();
    await cachedDataFetch({ _id: 'id', isDowngrade: false });

    expect(dataFetch).toHaveBeenCalledTimes(2);
  });
});
