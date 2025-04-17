/**
 * Entry point for React 16/17 (legacy) specific bridge components
 * This file provides support for React 16 and 17 versions, using the traditional ReactDOM.render API
 */
export { createBridgeComponent } from './provider/versions/legacy';
export { createRemoteComponent } from './remote/create';
export type { CreateRootOptions, Root } from './provider/versions/legacy';
export type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
} from './types';
