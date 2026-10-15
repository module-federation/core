/** Node provider entry. Framework callbacks supply the server renderer. */
export { createBaseBridgeComponent as createBridgeComponent } from './provider/versions/bridge-base';
export type {
  CreateRootOptions,
  Root,
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  HydrateParams,
  BridgeSSRRequest,
  BridgeSSRResult,
} from './types';
