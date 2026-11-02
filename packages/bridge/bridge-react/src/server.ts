import { createBaseBridgeComponent } from './provider/versions/bridge-base';
import type { ProviderFnParams, BridgeProvider } from './types';
import { normalizeBridgeSSR } from './ssr-stream/producer.server';

/** The producer Node entry never loads react-dom/client. */
export function createBridgeComponent<T = any>(
  options: ProviderFnParams<T>,
): BridgeProvider<T, Promise<void>> {
  const factory = createBaseBridgeComponent(options);
  return () => {
    const provider = factory();
    const renderStream = provider.renderStream;
    if (renderStream) {
      provider.renderStream = async (info) =>
        normalizeBridgeSSR(await renderStream(info), info);
    }
    return provider;
  };
}

export type {
  BridgeProvider,
  BridgeProviderInstance,
  BridgeRendererContext,
  ProviderFnParams,
  HydrateParams,
  BridgeSSRRequest,
  BridgeSSRResult,
  BridgeSSRMessage,
  BridgeSSRMessageResult,
  ProviderParams,
  RootType,
  DestroyParams,
  RenderParams,
  CreateRootOptions,
  Root,
  BridgeNavigation,
} from './types';
export { useBridgeRouter } from './provider/context';
export { createBridgeRouterConnector } from './bridgeRouter';
export type {
  BridgeRouterAdapter,
  BridgeRouterConnector,
  BridgeRouterConnectorOptions,
  BridgeRouterLocation,
  BridgeRouterSnapshot,
} from './bridgeRouter';
