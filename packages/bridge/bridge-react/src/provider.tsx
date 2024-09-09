import { useLayoutEffect, useRef, useState } from 'react';
import * as React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import { RouterContext } from './context';
import type {
  ProviderParams,
  RenderFnParams,
} from '@module-federation/bridge-shared';
import { LoggerInstance, atLeastReact18 } from './utils';
import { ErrorBoundary } from 'react-error-boundary';

type RootType = HTMLElement | ReactDOMClient.Root;
type ProviderFnParams<T> = {
  rootComponent: React.ComponentType<T>;
  render?: (
    App: React.ReactElement,
    id?: HTMLElement | string,
  ) => RootType | Promise<RootType>;
};

export function createBridgeComponent<T>(bridgeInfo: ProviderFnParams<T>) {
  return () => {
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
      async render(info: RenderFnParams & any) {
        LoggerInstance.log(`createBridgeComponent render Info`, info);
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          fallback,
          ...propsInfo
        } = info;
        const rootComponentWithErrorBoundary = (
          // set ErrorBoundary for RawComponent rendering error, usually caused by user app rendering error
          <ErrorBoundary FallbackComponent={fallback}>
            <RawComponent
              appInfo={{
                moduleName,
                basename,
                memoryRoute,
              }}
              propsInfo={propsInfo}
            />
          </ErrorBoundary>
        );

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
      },
      async destroy(info: { dom: HTMLElement }) {
        LoggerInstance.log(`createBridgeComponent destroy Info`, {
          dom: info.dom,
        });
        if (atLeastReact18(React)) {
          const root = rootMap.get(info.dom);
          (root as ReactDOMClient.Root)?.unmount();
          rootMap.delete(info.dom);
        } else {
          ReactDOM.unmountComponentAtNode(info.dom);
        }
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
