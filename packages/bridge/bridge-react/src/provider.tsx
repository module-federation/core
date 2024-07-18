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

type RootType = HTMLElement | ReactDOMClient.Root;
type ProviderFnParams<T> = {
  rootComponent: React.ComponentType<T>;
  render?: (App: React.ReactElement, id?: HTMLElement | string) => RootType | Promise<RootType>;
};

export function createBridgeComponent<T>(bridgeInfo: ProviderFnParams<T>) {
  return () => {
    const rootMap = new Map<any, RootType>();
    const RawComponent = (info: { propsInfo: T; appInfo: ProviderParams }) => {
      const { appInfo, propsInfo, ...restProps } = info;
      const { name, memoryRoute, basename = '/' } = appInfo;

      return (
        <RouterContext.Provider value={{ name, basename, memoryRoute }}>
          <bridgeInfo.rootComponent {...propsInfo} basename={basename} {...restProps} />
        </RouterContext.Provider>
      );
    };

    return {
      async render(info: RenderFnParams & any) {
        LoggerInstance.log(`createBridgeComponent render Info`, info);
        const { name, basename, memoryRoute, ...propsInfo } = info;
        if (atLeastReact18(React)) {
          // render is provided by user
          if (bridgeInfo?.render) {
            Promise.resolve(bridgeInfo?.render(
              <RawComponent
                propsInfo={propsInfo}
                appInfo={{
                  name,
                  basename,
                  memoryRoute,
                }}
              />,
              info.dom
            )).then((root: RootType) => rootMap.set(info.dom, root));
          } else {
            const root: RootType = ReactDOMClient.createRoot(info.dom);
            root.render(
              <RawComponent
                propsInfo={propsInfo}
                appInfo={{
                  name,
                  basename,
                  memoryRoute,
                }}
              />,
            );
            rootMap.set(info.dom, root);
          }
        } else {
          const renderFunc = bridgeInfo?.render || ReactDOM.render;
          renderFunc(
            <RawComponent
              propsInfo={propsInfo}
              appInfo={{
                name,
                basename,
                memoryRoute,
              }}
            />,
            info.dom,
          );
        }
      },
      async destroy(info: { dom: HTMLElement }) {
        LoggerInstance.log(`createBridgeComponent destroy Info`, {
          dom: info.dom,
        });
        if (atLeastReact18(React)) {
          const root = rootMap.get(info.dom);
          (root as ReactDOMClient.Root)?.unmount();
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
