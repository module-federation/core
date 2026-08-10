// Side-effect type import so data-fetch global augmentations apply to consumers.
import type {} from '@module-federation/data-fetch';

export type {
  DataFetchParams,
  NoSSRRemoteInfo,
  CollectSSRAssetsOptions,
  CreateLazyComponentOptions,
  CacheStatus,
  CacheStatsInfo,
  PrefetchOptions,
} from './lazy';

export {
  ERROR_TYPE,
  createLazyComponent,
  collectSSRAssets,
  callDataFetch,
  setSSREnv,
  autoFetchDataPlugin,
  CacheSize,
  CacheTime,
  configureCache,
  generateKey,
  cache,
  revalidateTag,
  clearStore,
  prefetch,
  flushDataFetch,
} from './lazy';

export { lazyLoadComponentPlugin } from './plugins/lazy-load-component-plugin';
