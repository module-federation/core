/**
 * Base bridge component implementation
 * This file contains bridge component logic shared across all React versions
 */
import * as React from 'react';
import type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  CreateRootOptions,
} from '../../types';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { RouterContext } from '../context';
import { LoggerInstance } from '../../utils';
import { federationRuntime } from '../plugin';

export function createBaseBridgeComponent<T>({
  createRoot,
  defaultRootOptions,
  ...bridgeInfo
}: ProviderFnParams<T>) {
  return () => {
    const rootMap = new Map<any, RootType>();
    const instance = federationRuntime.instance;
    LoggerInstance.debug(
      `createBridgeComponent instance from props >>>`,
      instance,
    );

    const RawComponent = (info: { propsInfo: T; appInfo: ProviderParams }) => {
      const { appInfo, propsInfo, ...restProps } = info;
      const { moduleName, memoryRoute, basename = '/' } = appInfo;
      return (
        <RouterContext.Provider value={{ moduleName, basename, memoryRoute }}>
          <bridgeInfo.rootComponent
            {...propsInfo}
            basename={basename}
            {...restProps}
          />
        </RouterContext.Provider>
      );
    };

    const DefaultFallback = ({ error }: FallbackProps) => (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre style={{ color: 'red' }}>{error.message}</pre>
      </div>
    );

    const ErrorBoundaryComponent =
      ErrorBoundary as unknown as React.ComponentType<any>;

    const BridgeWrapper = ({
      basename,
      moduleName,
      memoryRoute,
      propsInfo,
      fallback,
    }: {
      basename?: string;
      moduleName?: string;
      memoryRoute?: any;
      propsInfo: T;
      fallback?: React.ComponentType<FallbackProps>;
    }) => (
      <ErrorBoundaryComponent FallbackComponent={fallback || DefaultFallback}>
        <RawComponent
          appInfo={{
            moduleName,
            basename,
            memoryRoute,
          }}
          propsInfo={propsInfo}
        />
      </ErrorBoundaryComponent>
    );

    return {
      async render(info: RenderParams) {
        LoggerInstance.debug(`createBridgeComponent render Info`, info);
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          fallback,
          rootOptions,
          ...propsInfo
        } = info;

        const mergedRootOptions: CreateRootOptions | undefined = {
          ...defaultRootOptions,
          ...(rootOptions as CreateRootOptions),
        };

        const beforeBridgeRenderRes =
          instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(info) || {};

        const rootComponentWithErrorBoundary = (
          <BridgeWrapper
            basename={basename}
            moduleName={moduleName}
            memoryRoute={memoryRoute}
            fallback={fallback as React.ComponentType<FallbackProps>}
            propsInfo={
              {
                ...propsInfo,
                basename,
                ...(beforeBridgeRenderRes as any)?.extraProps,
              } as T
            }
          />
        );

        if (bridgeInfo.render) {
          await Promise.resolve(
            bridgeInfo.render(rootComponentWithErrorBoundary, dom),
          ).then((root: RootType) => rootMap.set(dom, root));
        } else {
          let root = rootMap.get(dom);
          // Do not call createRoot multiple times
          if (!root && createRoot) {
            root = createRoot(dom, mergedRootOptions);
            rootMap.set(dom, root as any);
          }

          if (root && 'render' in root) {
            root.render(rootComponentWithErrorBoundary);
          }
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info) || {};
      },

      destroy(info: DestroyParams) {
        const { dom } = info;
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(dom);
        if (root) {
          if ('unmount' in root) {
            root.unmount();
          } else {
            LoggerInstance.warn('Root does not have unmount method');
          }
          rootMap.delete(dom);
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
      },
    };
  };
}
