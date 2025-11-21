export { createBridgeComponent } from './provider/versions/legacy';

// Export router-free versions of remote component creators
export {
  createRemoteComponent,
  createRemoteAppComponent,
} from './remote/base-component';
export type { LazyRemoteComponentInfo } from './remote/base-component';

// Export all lazy loading and data fetching utilities (no router dependencies)
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
} from './lazy';

export { lazyLoadComponentPlugin } from './plugins/lazy-load-component-plugin';

// Export all types
export type { CreateRootOptions, Root } from './provider/versions/legacy';
export type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  RemoteComponentParams,
  RenderFnParams,
  RemoteComponentProps,
  RemoteModule,
} from './types';
export type {
  DataFetchParams,
  NoSSRRemoteInfo,
  CollectSSRAssetsOptions,
  CreateLazyComponentOptions,
  CacheStatus,
  CacheStatsInfo,
} from './lazy';
