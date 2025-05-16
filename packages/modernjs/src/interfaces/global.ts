export type MF_DATA_FETCH_MAP_VALUE = [
  // getDataFetchGetter , getDataFetchPromise
  [() => Promise<() => Promise<unknown>>, Promise<() => Promise<unknown>>?],
  [Promise<unknown>, ((data: unknown) => void)?, ((err: unknown) => void)?]?,
  1?,
];
export type MF_DATA_FETCH_MAP = Map<string, MF_DATA_FETCH_MAP_VALUE>;
export type MF_SSR_DOWNGRADE = string[] | true | undefined;
