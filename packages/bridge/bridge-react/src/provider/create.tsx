import * as React from 'react';
import ReactDOM from 'react-dom';
import type {
  ProviderParams,
  RenderFnParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
} from '../types';
import { ErrorBoundary } from 'react-error-boundary';
import { RouterContext } from './context';
import { LoggerInstance } from '../utils';
import { federationRuntime } from './plugin';
import { createRoot as defaultCreateRoot } from './compat';

export function createBridgeComponent<T>({
  createRoot = defaultCreateRoot,
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

    return {
      async render(info: RenderParams) {
        LoggerInstance.debug(`createBridgeComponent render Info`, info);
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          fallback,
          ...propsInfo
        } = info;

        const beforeBridgeRenderRes =
          instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(info) || {};

        const rootComponentWithErrorBoundary = (
          <ErrorBoundary FallbackComponent={fallback}>
            <RawComponent
              appInfo={{
                moduleName,
                basename,
                memoryRoute,
              }}
              propsInfo={
                { ...propsInfo, ...beforeBridgeRenderRes?.extraProps } as T
              }
            />
          </ErrorBoundary>
        );

        if (bridgeInfo.render) {
          await Promise.resolve(
            bridgeInfo.render(rootComponentWithErrorBoundary, dom),
          ).then((root: RootType) => rootMap.set(info.dom, root));
        } else {
          let root = rootMap.get(info.dom);
          // do not call createRoot multiple times
          if (!root) {
            root = createRoot(info.dom);
            rootMap.set(info.dom, root);
          }

          if ('render' in root) {
            root.render(rootComponentWithErrorBoundary);
          }
        }

        instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info) || {};
      },

      destroy(info: DestroyParams) {
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(info.dom);
        if (root) {
          if ('unmount' in root) {
            root.unmount();
          } else {
            ReactDOM.unmountComponentAtNode(root as HTMLElement);
          }
          rootMap.delete(info.dom);
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
      },
    };
  };
}
