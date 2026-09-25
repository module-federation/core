// Side-effect type import so data-fetch global augmentations apply to consumers.
import type {} from '@module-federation/data-fetch';

export { createBridgeComponent } from './provider';
export type { ProviderFnParams } from './provider';
export { createRemoteComponent, createRemoteAppComponent } from './create';
export type { RenderFnParams } from '@module-federation/bridge-shared';

export {
  autoFetchDataPlugin,
  callDataFetch,
  cache,
  clearStore,
  configureCache,
  flushDataFetch,
  generateKey,
  prefetch,
  revalidateTag,
  setSSREnv,
  CacheSize,
  CacheTime,
} from '@module-federation/data-fetch';

export type {
  CacheStatus,
  CacheStatsInfo,
  DataFetchParams,
  NoSSRRemoteInfo,
  PrefetchOptions,
} from '@module-federation/data-fetch';
