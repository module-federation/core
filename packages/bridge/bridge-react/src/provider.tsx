import * as React from 'react';
import ReactDOM from 'react-dom';
import type {
  ProviderParams,
  RenderFnParams,
} from '@module-federation/bridge-shared';
import { ErrorBoundary } from 'react-error-boundary';
import { RouterContext } from './context';
import { LoggerInstance } from './utils';
import { federationRuntime } from './plugin';
import { createRoot } from './compat';

type RenderParams = RenderFnParams & {
  [key: string]: unknown;
};
type DestroyParams = {
  moduleName: string;
  dom: HTMLElement;
};
type RootType = HTMLElement | ReturnType<typeof createRoot>;

export type ProviderFnParams<T> = {
  rootComponent: React.ComponentType<T>;
  render?: (
    App: React.ReactElement,
    id?: HTMLElement | string,
  ) => RootType | Promise<RootType>;
};

export function createBridgeComponent<T>(bridgeInfo: ProviderFnParams<T>) {
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

        if (bridgeInfo?.render) {
          // in case bridgeInfo?.render is an async function, resolve this to promise
          Promise.resolve(
            bridgeInfo?.render(rootComponentWithErrorBoundary, dom),
          ).then((root: RootType) => rootMap.set(info.dom, root));
        } else {
          // Dynamically import react-dom/client
          import('react-dom/client').then(
            (ReactDOMClient: typeof import('react-dom/client')) => {
              const root = ReactDOMClient.createRoot(info.dom);
              root.render(rootComponentWithErrorBoundary);
              rootMap.set(info.dom, root);
            },
          );
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
        instance?.bridgeHook?.lifecycle?.destroyBridge?.emit(info);
      },
    };
  };
}
