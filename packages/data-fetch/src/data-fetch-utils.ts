export { callDataFetch } from './call-data-fetch';
export { injectDataFetch } from './inject-data-fetch';
export {
  CacheSize,
  CacheTime,
  configureCache,
  generateKey,
  cache,
  revalidateTag,
  clearStore,
} from './cache';

export type { CacheStatus, CacheStatsInfo } from './cache';

export type { PrefetchOptions } from './prefetch';
export { prefetch } from './prefetch';
