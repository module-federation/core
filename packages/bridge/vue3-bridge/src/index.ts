export { createBridgeComponent } from './provider';
export type { ProviderFnParams } from './provider';
export { createRemoteComponent, createRemoteAppComponent } from './create';
export type { RenderFnParams } from '@module-federation/bridge-shared';

export {
  autoFetchDataPlugin,
  cache,
  clearStore,
  configureCache,
  generateKey,
  prefetch,
  revalidateTag,
  CacheSize,
  CacheTime,
} from '@module-federation/data-fetch';

export type {
  CacheStatus,
  CacheStatsInfo,
  DataFetchParams,
  PrefetchOptions,
} from '@module-federation/data-fetch';
