import { MF_DOWNGRADE_TYPE, MF_DATA_FETCH_STATUS } from '../constant';

export type DataFetchParams = {
  isDowngrade: boolean;
} & Record<string, unknown>;
export type DataFetch<T> = (params?: DataFetchParams) => Promise<T>;
export type MF_DATA_FETCH_MAP_VALUE = [
  // getDataFetchGetter , getDataFetchPromise
  [
    () => Promise<DataFetch<unknown>>,
    MF_DOWNGRADE_TYPE,
    Promise<DataFetch<unknown>>?,
  ],
  // loading, resolve, reject
  [Promise<unknown>, ((data: unknown) => void)?, ((err: unknown) => void)?]?,
  MF_DATA_FETCH_STATUS?,
];
export type MF_DATA_FETCH_MAP = Record<string, MF_DATA_FETCH_MAP_VALUE>;
export type MF_SSR_DOWNGRADE = string[] | true | undefined;
