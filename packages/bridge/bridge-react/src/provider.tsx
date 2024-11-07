import { useLayoutEffect, useRef, useState } from 'react';
import * as React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import type {
  ProviderParams,
  RenderFnParams,
} from '@module-federation/bridge-shared';
import { ErrorBoundary } from 'react-error-boundary';
import { RouterContext } from './context';
import { LoggerInstance, atLeastReact18 } from './utils';

type RenderParams = RenderFnParams & any;
type DestroyParams = {
  dom: HTMLElement;
};
type RootType = HTMLElement | ReactDOMClient.Root;

type BridgeHooks = {
  beforeBridgeRender?: (params: RenderFnParams) => void | Record<string, any>;
  afterBridgeRender?: (params: RenderFnParams) => void | Record<string, any>;
  beforeBridgeDestroy?: (params: DestroyParams) => void | Record<string, any>;
  afterBridgeDestroy?: (params: DestroyParams) => void | Record<string, any>;
};

type ProviderFnParams<T> = {
  rootComponent: React.ComponentType<T>;
  render?: (
    App: React.ReactElement,
    id?: HTMLElement | string,
  ) => RootType | Promise<RootType>;
  hooks?: BridgeHooks;
};
export function createBridgeComponent<T>(bridgeInfo: ProviderFnParams<T>) {
  return (params?: { hooks?: BridgeHooks }) => {
    const rootMap = new Map<any, RootType>();
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
        LoggerInstance.log(`createBridgeComponent render Info`, info);
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          fallback,
          ...propsInfo
        } = info;

        const beforeBridgeRender =
          (bridgeInfo?.hooks && bridgeInfo?.hooks.beforeBridgeRender) ||
          params?.hooks?.beforeBridgeRender;

        // you can return a props object through beforeBridgeRender to pass additional props parameters
        const beforeBridgeRenderRes =
          beforeBridgeRender && beforeBridgeRender(info);
        const extraProps =
          beforeBridgeRenderRes &&
          typeof beforeBridgeRenderRes === 'object' &&
          beforeBridgeRenderRes?.extraProps
            ? beforeBridgeRenderRes?.extraProps
            : {};

        const rootComponentWithErrorBoundary = (
          // set ErrorBoundary for RawComponent rendering error, usually caused by user app rendering error
          <ErrorBoundary FallbackComponent={fallback}>
            <RawComponent
              appInfo={{
                moduleName,
                basename,
                memoryRoute,
              }}
              propsInfo={{ ...propsInfo, ...extraProps } as T}
            />
          </ErrorBoundary>
        );
        // call render function
        if (atLeastReact18(React)) {
          if (bridgeInfo?.render) {
            // in case bridgeInfo?.render is an async function, resolve this to promise
            Promise.resolve(
              bridgeInfo?.render(rootComponentWithErrorBoundary, dom),
            ).then((root: RootType) => rootMap.set(info.dom, root));
          } else {
            const root: RootType = ReactDOMClient.createRoot(info.dom);
            root.render(rootComponentWithErrorBoundary);
            rootMap.set(info.dom, root);
          }
        } else {
          // react 17 render
          const renderFn = bridgeInfo?.render || ReactDOM.render;
          renderFn?.(rootComponentWithErrorBoundary, info.dom);
        }

        const afterBridgeRender =
          (bridgeInfo?.hooks && bridgeInfo?.hooks.afterBridgeDestroy) ||
          params?.hooks?.afterBridgeRender;
        afterBridgeRender && afterBridgeRender(info);
      },

      async destroy(info: DestroyParams) {
        LoggerInstance.log(`createBridgeComponent destroy Info`, {
          dom: info.dom,
        });

        const beforeBridgeDestroy =
          (bridgeInfo?.hooks && bridgeInfo?.hooks.beforeBridgeDestroy) ||
          params?.hooks?.beforeBridgeDestroy;
        beforeBridgeDestroy && beforeBridgeDestroy(info);

        // call destroy function
        if (atLeastReact18(React)) {
          const root = rootMap.get(info.dom);
          (root as ReactDOMClient.Root)?.unmount();
          rootMap.delete(info.dom);
        } else {
          ReactDOM.unmountComponentAtNode(info.dom);
        }

        const afterBridgeDestroy =
          (bridgeInfo?.hooks && bridgeInfo?.hooks.afterBridgeDestroy) ||
          params?.hooks?.afterBridgeDestroy;
        afterBridgeDestroy && afterBridgeDestroy(info);
      },
      rawComponent: bridgeInfo.rootComponent,
      __BRIDGE_FN__: (_args: T) => {},
    };
  };
}

export function ShadowRoot(info: { children: () => JSX.Element }) {
  const [root] = useState(null);
  const domRef = useRef(null);
  useLayoutEffect(() => {});

  return <div ref={domRef}>{root && <info.children />}</div>;
}
