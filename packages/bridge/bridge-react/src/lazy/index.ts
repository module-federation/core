import autoFetchDataPlugin from './data-fetch/runtime-plugin';

export { ERROR_TYPE } from './constant';
export type { DataFetchParams, NoSSRRemoteInfo } from './types';
export type {
  CreateLazyComponentOptions,
  IProps as CollectSSRAssetsOptions,
} from './createLazyComponent';

export { createLazyComponent, collectSSRAssets } from './createLazyComponent';

// export { wrapNoSSR } from './wrapNoSSR';

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
} from './data-fetch';

export { setSSREnv } from './utils';

export { autoFetchDataPlugin };

export type {
  CacheStatus,
  CacheStatsInfo,
  PrefetchOptions,
} from './data-fetch';
