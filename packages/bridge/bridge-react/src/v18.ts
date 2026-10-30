export { createBridgeComponent } from './provider/versions/v18';
export type { CreateRootOptions, Root } from './provider/versions/v18';
export type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
} from './types';

export { useBridgeRouter } from './provider/context';
export type { BridgeNavigation } from './types';

export type { BridgeProvider } from './types';

export { createBridgeRouterConnector } from './bridgeRouter';
export type {
  BridgeRouterAdapter,
  BridgeRouterConnector,
  BridgeRouterConnectorOptions,
  BridgeRouterLocation,
  BridgeRouterSnapshot,
} from './bridgeRouter';
