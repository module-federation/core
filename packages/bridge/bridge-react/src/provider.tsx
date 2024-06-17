import React, { useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterContext } from './context';
import type {
  ProviderParams,
  RenderFnParams,
} from '@module-federation/bridge-shared';
import { LoggerInstance } from './utils';

type ProviderFnParams<T> = {
  rootComponent: React.ComponentType<T>;
};

export function createBridgeComponent<T>(bridgeInfo: ProviderFnParams<T>) {
  return () => {
    const rootMap = new Map<any, ReactDOM.Root>();

    const RawComponent = (info: { propsInfo: T; appInfo: ProviderParams }) => {
      const { appInfo, propsInfo } = info;
      const { name, memoryRoute, basename = '/' } = appInfo;

      return (
        <RouterContext.Provider value={{ name, basename, memoryRoute }}>
          <bridgeInfo.rootComponent {...propsInfo} basename={basename} />
        </RouterContext.Provider>
      );
    };

    return {
      render(info: RenderFnParams & any) {
        LoggerInstance.log(`createBridgeComponent render Info`, info);
        const root = ReactDOM.createRoot(info.dom);
        rootMap.set(info.dom, root);
        const { name, basename, memoryRoute, ...propsInfo } = info;
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
      },
      destroy({ dom }: any) {
        LoggerInstance.log(`createBridgeComponent destroy Info`, { dom });
        const root = rootMap.get(dom);
        root?.unmount();
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

// function ShadowContent() {}
