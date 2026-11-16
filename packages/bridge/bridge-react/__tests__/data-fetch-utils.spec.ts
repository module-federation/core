import { MF_DATA_FETCH_STATUS, MF_DATA_FETCH_TYPE } from '../src/lazy/constant';
import { cache, clearStore } from '../src/lazy/data-fetch/cache';
import type { DataFetch, MF_DATA_FETCH_MAP } from '../src/lazy/types';
import { fetchData, resetDataFetchResult } from '../src/lazy/utils';

const dataFetchId = 'host:1.0.0:remote/component.data';

const setDataFetchItem = (
  dataFetchFn: DataFetch<unknown>,
  dataPromise?: Promise<unknown>,
) => {
  const getDataFetchFn = jest.fn().mockResolvedValue(dataFetchFn);
  globalThis.__MF_DATA_FETCH_MAP__ = {
    [dataFetchId]: [
      [
        getDataFetchFn,
        MF_DATA_FETCH_TYPE.FETCH_CLIENT,
        Promise.resolve(dataFetchFn),
      ],
      dataPromise ? [dataPromise] : undefined,
      dataPromise ? MF_DATA_FETCH_STATUS.LOADED : MF_DATA_FETCH_STATUS.AWAIT,
    ],
  } as MF_DATA_FETCH_MAP;
  return getDataFetchFn;
};

describe('data fetch result lifecycle', () => {
  beforeEach(() => {
    globalThis.__MF_DATA_FETCH_MAP__ = undefined;
    globalThis.__MF_DATA_FETCH_CACHE__ = undefined;
  });

  afterEach(() => {
    clearStore();
    globalThis.__MF_DATA_FETCH_MAP__ = undefined;
  });

  it('consumes injected data once without clearing the DataLoader function', async () => {
    const dataFetchFn = jest.fn().mockResolvedValue('fresh data');
    const dataFetchFnPromise = Promise.resolve(dataFetchFn);
    const injectedDataPromise = Promise.resolve('injected data');
    setDataFetchItem(dataFetchFn, injectedDataPromise);
    const dataFetchItem = globalThis.__MF_DATA_FETCH_MAP__![dataFetchId];
    dataFetchItem[0][2] = dataFetchFnPromise;

    await expect(fetchData(dataFetchId, { isDowngrade: false })).resolves.toBe(
      'injected data',
    );
    expect(dataFetchFn).not.toHaveBeenCalled();

    resetDataFetchResult(dataFetchId);

    expect(dataFetchItem[0][2]).toBe(dataFetchFnPromise);
    expect(dataFetchItem[1]).toBeUndefined();
    expect(dataFetchItem[2]).toBe(MF_DATA_FETCH_STATUS.AWAIT);
    await expect(fetchData(dataFetchId, { isDowngrade: false })).resolves.toBe(
      'fresh data',
    );
    expect(dataFetchFn).toHaveBeenCalledTimes(1);
  });

  it('keeps explicit DataLoader cache entries after resetting transport data', async () => {
    const request = jest.fn().mockResolvedValue('cached data');
    const cachedDataFetch = cache(request);
    setDataFetchItem(cachedDataFetch);

    await expect(fetchData(dataFetchId, { isDowngrade: false })).resolves.toBe(
      'cached data',
    );
    resetDataFetchResult(dataFetchId);
    await expect(fetchData(dataFetchId, { isDowngrade: false })).resolves.toBe(
      'cached data',
    );

    expect(request).toHaveBeenCalledTimes(1);
  });
});
