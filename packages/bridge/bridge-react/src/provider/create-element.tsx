import * as React from 'react';
import type { BridgeOperationContext } from '@module-federation/bridge-shared';
import type {
  ErrorFallbackProps,
  ProviderParams,
  RenderParams,
  BridgeSSRRequest,
} from '../types';
import { ErrorBoundary } from '../error-boundary';
import { RouterContext } from './context';
import type { federationRuntime } from './plugin';

/** The same pure React tree is used by browser rendering and Node streaming. */
export function createBridgeElement<T>(
  RootComponent: React.ComponentType<T>,
  instance: typeof federationRuntime.instance,
) {
  const RawComponent = (info: { propsInfo: T; appInfo: ProviderParams }) => {
    const { appInfo, propsInfo, ...restProps } = info;
    const { moduleName, memoryRoute, navigation, basename = '/' } = appInfo;
    return (
      <RouterContext.Provider
        value={{ moduleName, basename, memoryRoute, navigation }}
      >
        <RootComponent {...propsInfo} basename={basename} {...restProps} />
      </RouterContext.Provider>
    );
  };

  const DefaultFallback = ({ error }: ErrorFallbackProps) => (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  );

  const omitHostFallback = <P extends Record<string, unknown>>(props: P) => {
    const nextProps = { ...props };
    delete nextProps.fallback;
    return nextProps;
  };

  const BridgeWrapper = ({
    basename,
    moduleName,
    memoryRoute,
    navigation,
    propsInfo,
  }: {
    basename?: string;
    moduleName?: string;
    memoryRoute?: any;
    navigation?: ProviderParams['navigation'];
    propsInfo: T;
  }) => (
    <ErrorBoundary FallbackComponent={DefaultFallback}>
      <RawComponent
        appInfo={{
          moduleName,
          basename,
          memoryRoute,
          navigation,
        }}
        propsInfo={propsInfo}
      />
    </ErrorBoundary>
  );

  // Keep the producer tree identical across stream rendering, hydration and
  // later updates. Framework renderers receive this tree, never a Host element.
  const createElement = (
    info: ProviderParams,
    propsInfo: Record<string, unknown>,
    eventInfo: RenderParams | BridgeSSRRequest,
    operationContext: BridgeOperationContext,
  ) => {
    const { basename, moduleName, memoryRoute, navigation } = info;
    const beforeBridgeRenderRes =
      instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
        eventInfo,
        operationContext,
      ) || {};
    return (
      <BridgeWrapper
        basename={basename}
        moduleName={moduleName}
        memoryRoute={memoryRoute}
        navigation={navigation}
        propsInfo={
          {
            ...omitHostFallback(propsInfo),
            basename,
            ...(beforeBridgeRenderRes as any)?.extraProps,
          } as T
        }
      />
    );
  };

  return createElement;
}
