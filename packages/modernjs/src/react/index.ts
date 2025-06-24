export {
  ERROR_TYPE,
  createLazyComponent,
  collectSSRAssets,
  wrapNoSSR,
  CacheSize,
  CacheTime,
  configureCache,
  generateKey,
  cache,
  revalidateTag,
  clearStore,
  prefetch,
} from '@module-federation/bridge-react';

export type {
  DataFetchParams,
  CacheStatus,
  CacheStatsInfo,
} from '@module-federation/bridge-react';
