/**
 * Base entry point for @module-federation/bridge-react without react-router-dom dependencies
 *
 * This entry point provides the same API as the default entry but WITHOUT:
 * - react-router-dom static imports
 * - Automatic router basename injection
 *
 * Use this entry when:
 * - Your application doesn't use react-router
 * - You want to minimize bundle size
 * - You want to manually control routing
 *
 * @example
 * ```typescript
 * // Instead of:
 * import { createRemoteComponent } from '@module-federation/bridge-react';
 *
 * // Use:
 * import { createRemoteComponent } from '@module-federation/bridge-react/base';
 *
 * // Note: You must manually provide basename if needed
 * <RemoteComponent basename="/my-app" />
 * ```
 */

// Export the same createBridgeComponent as default entry (no router dependency in this function)
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
