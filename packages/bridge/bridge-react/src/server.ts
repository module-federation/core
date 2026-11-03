import type { BridgeOperationContext } from '@module-federation/bridge-shared';
import type {
  ProviderFnParams,
  BridgeProvider,
  BridgeSSRRequest,
} from './types';
import { normalizeBridgeSSR } from './ssr-stream/producer.server';
import { createBridgeElement } from './provider/create-element';
import { federationRuntime } from './provider/plugin';

/** Node providers share the React tree, never the browser lifecycle. */
export function createBridgeComponent<T = any>({
  rootComponent,
  renderStream,
}: ProviderFnParams<T>): BridgeProvider<T, Promise<void>> {
  return () => {
    const instance = federationRuntime.instance;
    const createElement = createBridgeElement(rootComponent, instance);
    return {
      // Keep the existing provider interface without importing DOM implementations.
      async render() {
        throw new Error('A Node Bridge provider cannot mount into a DOM.');
      },
      destroy() {
        throw new Error('A Node Bridge provider cannot destroy a DOM root.');
      },
      ...(renderStream && {
        async renderStream(info: BridgeSSRRequest) {
          if (info.signal.aborted) throw info.signal.reason;
          const operationContext: BridgeOperationContext = {
            side: 'producer',
            framework: 'react',
            operation: 'render',
            reason: 'direct',
          };
          const app = createElement(info, info.props, info, operationContext);
          const raw = await renderStream(app, { ...info, rootComponent });
          instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info, {
            context: operationContext,
          });
          return normalizeBridgeSSR(raw, info);
        },
      }),
    };
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
