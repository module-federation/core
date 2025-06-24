/**
 * Entry point for React 16/17 (legacy) specific bridge components
 * This file provides support for React 16 and 17 versions, using the traditional ReactDOM.render API
 */
export { createBridgeComponent } from './provider/versions/legacy';
export {
  createRemoteComponent,
  createRemoteAppComponent,
} from './remote/create';
export {
  ERROR_TYPE,
  createLazyComponent,
  collectSSRAssets,
  wrapNoSSR,
  callDataFetch,
  setSSREnv,
  autoFetchDataPlugin,
} from './lazy';

export type { CreateRootOptions, Root } from './provider/versions/legacy';
export type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
} from './types';
export type {
  DataFetchParams,
  NoSSRRemoteInfo,
  CollectSSRAssetsOptions,
  CreateLazyComponentOptions,
} from './lazy';
