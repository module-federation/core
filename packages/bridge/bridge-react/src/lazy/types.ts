import { MF_DATA_FETCH_TYPE, MF_DATA_FETCH_STATUS } from './constant';

export type dataFetchFunctionOptions = [
  id?: string,
  data?: unknown,
  downgrade?: boolean,
];

declare global {
  var _mfSSRDowngrade: string[] | true | undefined;
  var __MF_DATA_FETCH_MAP__: MF_DATA_FETCH_MAP | undefined;
  var FEDERATION_SERVER_QUERY: Record<string, unknown> | undefined;
  var FEDERATION_SSR: boolean | undefined;
  var _mfFSHref: string | undefined;
  var _mfDataFetch: Array<dataFetchFunctionOptions> | undefined;
}

export type DataFetchParams = {
  isDowngrade: boolean;
} & Record<string, unknown>;
export type DataFetch<T> = (params: DataFetchParams) => Promise<T>;

// loading, resolve, reject
export type MF_DATA_FETCH_MAP_VALUE_PROMISE_SET = [
  Promise<unknown>,
  ((data: unknown) => void)?,
  ((err: unknown) => void)?,
];
export type MF_DATA_FETCH_MAP_VALUE = [
  [
    // getDataFetchGetter
    () => Promise<DataFetch<unknown>>,
    MF_DATA_FETCH_TYPE,
    // getDataFetchPromise
    Promise<DataFetch<unknown>>?,
  ],
  MF_DATA_FETCH_MAP_VALUE_PROMISE_SET?,
  MF_DATA_FETCH_STATUS?,
];
export type MF_DATA_FETCH_MAP = Record<string, MF_DATA_FETCH_MAP_VALUE>;
export type MF_SSR_DOWNGRADE = string[] | true | undefined;

export type NoSSRRemoteInfo = {
  name: string;
  version: string;
  ssrPublicPath: string;
  ssrRemoteEntry: string;
  globalName: string;
};
