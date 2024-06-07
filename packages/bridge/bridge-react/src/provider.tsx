import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterContext } from './context';
import type {
  ProviderParams,
  RenderFnParams,
} from '@module-federation/bridge-shared';
import { LoggerInstance } from './utils';

export function createBridgeComponent<T>(Component: React.ComponentType<T>) {
  return () => {
    const rootMap = new Map<any, ReactDOM.Root>();

    const RawComponent = (info: T & ProviderParams) => {
      const { name, memoryRoute, basename = '/' } = info;

      return (
        <RouterContext.Provider value={{ name, basename, memoryRoute }}>
          <Component {...info} />
        </RouterContext.Provider>
      );
    };

    return {
      render(info: RenderFnParams & T) {
        LoggerInstance.log(`createBridgeComponent render Info`, info);
        const root = ReactDOM.createRoot(info.dom);
        rootMap.set(info.dom, root);
        root.render(
          <RawComponent
            name={info.name}
            basename={info.basename}
            memoryRoute={info.memoryRoute}
            {...info}
          />,
        );
      },
      destroy({ dom }: any) {
        LoggerInstance.log(`createBridgeComponent destroy Info`, { dom });
        const root = rootMap.get(dom);
        root?.unmount();
      },
      rawComponent: RawComponent,
    };
  };
}

export function ShadowRoot(info: { children: () => JSX.Element }) {
  const [root, setRoot] = useState(null);
  const domRef = useRef(null);
  useLayoutEffect(() => {});

  return <div ref={domRef}>{root && <info.children />}</div>;
}

function ShadowContent() {}
