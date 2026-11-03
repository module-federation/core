export { ERROR_TYPE } from './constant';
export type {
  DataFetchParams,
  NoSSRRemoteInfo,
} from '@module-federation/data-fetch';
export type {
  CreateLazyComponentOptions,
  IProps as CollectSSRAssetsOptions,
} from './createLazyComponent';

export { createLazyComponent, collectSSRAssets } from './createLazyComponent';

export {
  injectDataFetch,
  callDataFetch,
  CacheSize,
  CacheTime,
  configureCache,
  generateKey,
  cache,
  revalidateTag,
  clearStore,
  prefetch,
  setSSREnv,
  autoFetchDataPlugin,
  flushDataFetch,
} from '@module-federation/data-fetch';

export type {
  CacheStatus,
  CacheStatsInfo,
  PrefetchOptions,
} from '@module-federation/data-fetch';
