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

type ProviderFnParams<T> = {
  rootComponent: React.ComponentType<T>;
};

interface Provider<T> {
  render(info: any): void;
  destroy(info: { dom: HTMLElement }): void;
  rawComponent: React.ComponentType;
  __BRIDGE_FN__: (_args: T) => void;
}

export function createBridgeComponent<T>(bridgeInfo: ProviderFnParams<T>) {
  let provider: Provider<T>;

  return () => {
    const rootMap = new Map<any, ReactDOMClient.Root>();

    const RawComponent = (info: { propsInfo: T; appInfo: ProviderParams }) => {
      const { appInfo, propsInfo } = info;
      const { name, memoryRoute, basename = '/' } = appInfo;

      return (
        <RouterContext.Provider value={{ name, basename, memoryRoute }}>
          <bridgeInfo.rootComponent {...propsInfo} basename={basename} />
        </RouterContext.Provider>
      );
    };

    if (!provider) {
      provider = {
        render(info: RenderFnParams & any) {
          LoggerInstance.log(`createBridgeComponent render Info`, info);
          const { name, basename, memoryRoute, ...propsInfo } = info;

          if (atLeastReact18(React)) {
            const root = ReactDOMClient.createRoot(info.dom);
            rootMap.set(info.dom, root);
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
          } else {
            ReactDOM.render(
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
        destroy(info: { dom: HTMLElement }) {
          LoggerInstance.log(`createBridgeComponent destroy Info`, {
            dom: info.dom,
          });
          if (atLeastReact18(React)) {
            const root = rootMap.get(info.dom);
            root?.unmount();
          } else {
            ReactDOM.unmountComponentAtNode(info.dom);
          }
        },
        rawComponent: bridgeInfo.rootComponent,
        __BRIDGE_FN__: (_args: T) => {},
      };
    }
    return provider;
  };
}

export function ShadowRoot(info: { children: () => JSX.Element }) {
  const [root] = useState(null);
  const domRef = useRef(null);
  useLayoutEffect(() => {});

  return <div ref={domRef}>{root && <info.children />}</div>;
}

// function ShadowContent() {}
