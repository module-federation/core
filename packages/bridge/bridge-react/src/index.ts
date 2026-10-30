/**
 * Entry point for React 16/17 (legacy) specific bridge components
 * This file provides support for React 16 and 17 versions, using the traditional ReactDOM.render API
 */
export { createBridgeComponent } from './provider/versions/legacy';
export {
  createRemoteComponent,
  createRemoteAppComponent,
} from './remote/router-component';
export type { LazyRemoteComponentInfo } from './remote/router-component';
export {
  ERROR_TYPE,
  createLazyComponent,
  collectSSRAssets,
  // wrapNoSSR,
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

export { createReactRemote, ReactRemote } from './remote/router-component';
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
  BridgeRouterHistory,
  BridgeRouterLocation,
  BridgeRouterSnapshot,
} from './bridgeRouter';
