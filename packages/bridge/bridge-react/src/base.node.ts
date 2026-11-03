export { createBridgeComponent } from './server';

// Export router-free versions of remote component creators
export {
  createRemoteComponent,
  createRemoteAppComponent,
} from './remote/base-component/create.node';
export type { LazyRemoteComponentInfo } from './remote/base-component/create.node';

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

export { createReactRemote, ReactRemote } from './reactRemote.node';
export type {
  CreateReactRemoteOptions,
  ReactRemoteProps,
  ReactRemoteErrorInfo,
} from './reactRemoteTypes';

export { useBridgeRouter } from './provider/context';
export type { BridgeNavigation } from './types';

export type { BridgeProvider } from './types';
export type {
  CreateReactRemote,
  ReactRemoteComponent,
  RemoteSource,
  RemoteExportName,
  InferRemoteProps,
} from './reactRemoteTypes';

export { createBridgeRouterConnector } from './bridgeRouter';
export type {
  BridgeRouterAdapter,
  BridgeRouterConnector,
  BridgeRouterConnectorOptions,
  BridgeRouterLocation,
  BridgeRouterSnapshot,
} from './bridgeRouter';

export type {
  BridgeProviderInstance,
  BridgeRendererContext,
  HydrateParams,
  BridgeSSRRequest,
  BridgeSSRResult,
  BridgeSSRMessage,
  BridgeSSRMessageResult,
} from './types';
