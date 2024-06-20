import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import type { ProviderParams } from '@module-federation/bridge-shared';
import { LoggerInstance } from './utils';
import { dispatchPopstateEnv } from '@module-federation/bridge-shared';

declare const __APP_VERSION__: string;

export interface RenderFnParams extends ProviderParams {
  dom?: any;
}

interface RemoteModule {
  provider: () => {
    render: (
      info: ProviderParams & {
        dom: any;
      },
    ) => void;
    destroy: (info: { dom: any }) => void;
  };
}

interface RemoteAppParams {
  name: string;
  providerInfo: NonNullable<RemoteModule['provider']>;
  dispathPopstate: boolean;
}

const RemoteApp = ({
  name,
  memoryRoute,
  basename,
  providerInfo,
  dispathPopstate,
  ...resProps
}: RemoteAppParams & ProviderParams) => {
  const rootRef = useRef(null);
  const renderDom = useRef(null);
  const providerInfoRef = useRef<any>(null);
  if (dispathPopstate) {
    const location = ReactRouterDOM.useLocation();
    const [pathname, setPathname] = useState(location.pathname);

    useEffect(() => {
      if (pathname !== '' && pathname !== location.pathname) {
        LoggerInstance.log(`createRemoteComponent dispatchPopstateEnv >>>`, {
          name,
          pathname: location.pathname,
        });
        dispatchPopstateEnv();
      }
      setPathname(location.pathname);
    }, [location]);
  }

  useEffect(() => {
    const renderTimeout = setTimeout(() => {
      const providerReturn = providerInfo();
      providerInfoRef.current = providerReturn;
      const renderProps = {
        name,
        dom: rootRef.current,
        basename,
        memoryRoute,
        ...resProps,
      };
      renderDom.current = rootRef.current;
      LoggerInstance.log(
        `createRemoteComponent LazyComponent render >>>`,
        renderProps,
      );
      providerReturn.render(renderProps);
    });

    return () => {
      clearTimeout(renderTimeout);
      setTimeout(() => {
        if (providerInfoRef.current?.destroy) {
          LoggerInstance.log(
            `createRemoteComponent LazyComponent destroy >>>`,
            { name, basename, dom: renderDom.current },
          );
          providerInfoRef.current?.destroy({
            dom: renderDom.current,
          });
        }
      });
    };
  }, []);

  //@ts-ignore
  return <div ref={rootRef}></div>;
};

(RemoteApp as any)['__APP_VERSION__'] = __APP_VERSION__;

export function createRemoteComponent<T, E extends keyof T>(
  lazyComponent: () => Promise<T>,
  info?: {
    export?: E;
  },
) {
  type ExportType = T[E] extends (...args: any) => any
    ? ReturnType<T[E]>
    : never;
  type RawComponentType = '__BRIDGE_FN__' extends keyof ExportType
    ? ExportType['__BRIDGE_FN__'] extends (...args: any) => any
      ? Parameters<ExportType['__BRIDGE_FN__']>[0]
      : {}
    : {};

  return (
    props: {
      basename?: ProviderParams['basename'];
      memoryRoute?: ProviderParams['memoryRoute'];
      fallback: ReactNode;
    } & RawComponentType,
  ) => {
    const exportName = info?.export || 'default';
    let basename = '/';
    let enableDispathPopstate = false;
    let routerContextVal: any;
    try {
      ReactRouterDOM.useLocation();
      enableDispathPopstate = true;
    } catch {
      enableDispathPopstate = false;
    }

    if (ReactRouterDOM.UNSAFE_RouteContext && enableDispathPopstate) {
      routerContextVal = useContext(ReactRouterDOM.UNSAFE_RouteContext);
      if (
        routerContextVal &&
        routerContextVal.matches &&
        routerContextVal.matches[0] &&
        routerContextVal.matches[0].pathnameBase
      ) {
        basename = routerContextVal.matches[0].pathnameBase;
      }
      enableDispathPopstate =
        routerContextVal?.matches && routerContextVal?.matches.length > 0;
    }

    const LazyComponent = useMemo(() => {
      //@ts-ignore
      return React.lazy(async () => {
        LoggerInstance.log(`createRemoteComponent LazyComponent create >>>`, {
          basename,
          lazyComponent,
          exportName,
          props,
          routerContextVal,
        });
        const m = (await lazyComponent()) as RemoteModule;
        // @ts-ignore
        const moduleName = m && m[Symbol.for('mf_module_id')];
        LoggerInstance.log(
          `createRemoteComponent LazyComponent loadRemote info >>>`,
          { basename, name: moduleName, module: m, exportName, props },
        );

        // @ts-ignore
        const exportFn = m[exportName] as any;

        if (exportName in m && typeof exportFn === 'function') {
          return {
            default: () => (
              <RemoteApp
                name={moduleName}
                dispathPopstate={enableDispathPopstate}
                {...info}
                {...props}
                providerInfo={exportFn}
                basename={basename}
              />
            ),
          };
        }

        throw Error('module not found');
      });
    }, [exportName, basename, props.memoryRoute]);

    //@ts-ignore
    return (
      <React.Suspense fallback={props.fallback}>
        <LazyComponent />
      </React.Suspense>
    );
  };
}
