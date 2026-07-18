import {
  BRIDGE_SSR_PROTOCOL_VERSION,
  type BridgeSSRPrepareResult,
  type BridgeSSRResult,
  type BridgeServerRenderContext,
} from '@module-federation/bridge-shared';
import type { ProviderFnParams, ProviderParams } from '../../types';
import { createBaseBridgeComponent } from './bridge-base';
import { createBridgeReactElement, omitHostFallback } from './bridge-render';

export function createServerBridgeComponent<T>(
  bridgeInfo: ProviderFnParams<T> & {
    serverRenderer: (
      element: React.ReactElement,
      options: { identifierPrefix: string },
    ) => string | Promise<string>;
  },
) {
  const { serverRenderer, ...clientInfo } = bridgeInfo;
  const createClientProvider = createBaseBridgeComponent(clientInfo);

  return () => {
    const provider = createClientProvider() as ReturnType<
      typeof createClientProvider
    > & {
      renderServer?: (
        context: BridgeServerRenderContext<T>,
      ) => Promise<BridgeSSRResult>;
    };
    if (!bridgeInfo.ssr) return provider;

    provider.renderServer = async (context) => {
      if (context.signal.aborted) throw context.signal.reason;
      const config =
        typeof bridgeInfo.ssr === 'object' ? bridgeInfo.ssr : undefined;
      const preparedValue = await config?.prepare?.(context);
      if (context.signal.aborted) throw context.signal.reason;
      const prepared = (preparedValue || {}) as BridgeSSRPrepareResult<T>;
      const renderInfo = (prepared.props ?? context.props) as T &
        ProviderParams;
      const { basename, memoryRoute, ...applicationProps } = renderInfo;
      delete (applicationProps as Record<string, unknown>).moduleName;
      const url = new URL(context.request.url);
      const element = createBridgeReactElement({
        rootComponent: bridgeInfo.rootComponent,
        basename,
        moduleName: context.moduleName,
        memoryRoute,
        ssrLocation: `${url.pathname}${url.search}`,
        propsInfo: {
          ...omitHostFallback(applicationProps as Record<string, unknown>),
          basename,
        } as T,
      });
      const html = await serverRenderer(element, {
        identifierPrefix: `mf-${encodeURIComponent(context.instanceId)}-`,
      });
      if (context.signal.aborted) throw context.signal.reason;
      return {
        protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
        moduleName: context.moduleName,
        instanceId: context.instanceId,
        html,
        dehydratedState: prepared.dehydratedState,
      };
    };
    return provider;
  };
}
