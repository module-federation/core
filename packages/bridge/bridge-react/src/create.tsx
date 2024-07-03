import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import type { ProviderParams } from '@module-federation/bridge-shared';
import { LoggerInstance, pathJoin } from './utils';
import { dispatchPopstateEnv } from '@module-federation/bridge-shared';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithComponent,
} from 'react-error-boundary';

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
  exportName: string | number | symbol;
}

const RemoteApp = ({
  name,
  memoryRoute,
  basename,
  providerInfo,
  ...resProps
}: RemoteAppParams & ProviderParams) => {
  const rootRef = useRef(null);
  const renderDom = useRef(null);
  const providerInfoRef = useRef<any>(null);

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

interface ExtraDataProps {
  basename?: string;
}

function withRouterData<P extends object>(
  WrappedComponent: React.ComponentType<P & ExtraDataProps>,
): React.FC<Omit<P, keyof ExtraDataProps>> {
  return (props: any) => {
    let enableDispathPopstate = false;
    let routerContextVal: any;
    try {
      ReactRouterDOM.useLocation();
      enableDispathPopstate = true;
    } catch {
      enableDispathPopstate = false;
    }
    let basename = '/';

    if (!props.basename && enableDispathPopstate) {
      const ReactRouterDOMAny: any = ReactRouterDOM;
      // Avoid building tools checking references
      const useRouteMatch = ReactRouterDOMAny['use' + 'RouteMatch']; //v5
      const useHistory = ReactRouterDOMAny['use' + 'History']; //v5
      const useHref = ReactRouterDOMAny['use' + 'Href'];
      const UNSAFE_RouteContext = ReactRouterDOMAny['UNSAFE_' + 'RouteContext'];

      if (UNSAFE_RouteContext /* react-router@6 */) {
        if (useHref) {
          basename = useHref?.('/');
        }
        routerContextVal = useContext(UNSAFE_RouteContext);
        if (
          routerContextVal &&
          routerContextVal.matches &&
          routerContextVal.matches.length > 0
        ) {
          const matchIndex = routerContextVal.matches.length - 1;
          const pathnameBase =
            routerContextVal.matches[matchIndex].pathnameBase;
          basename = pathJoin(basename, pathnameBase || '/');
        }
      } /* react-router@5 */ else {
        const match = useRouteMatch?.(); // v5
        if (useHistory /* react-router@5 */) {
          // there is no dynamic switching of the router version in the project
          // so hooks can be used in conditional judgment
          const history = useHistory?.();
          // To be compatible to history@4.10.1 and @5.3.0 we cannot write like this `history.createHref(pathname)`
          basename = history?.createHref?.({ pathname: '/' });
        }
        if (match /* react-router@5 */) {
          basename = pathJoin(basename, match?.path || '/');
        }
      }
    }
    if (enableDispathPopstate) {
      const location = ReactRouterDOM.useLocation();
      const [pathname, setPathname] = useState(location.pathname);

      useEffect(() => {
        if (pathname !== '' && pathname !== location.pathname) {
          LoggerInstance.log(`createRemoteComponent dispatchPopstateEnv >>>`, {
            name: props.name,
            pathname: location.pathname,
          });
          dispatchPopstateEnv();
        }
        setPathname(location.pathname);
      }, [location]);
    }

    // 将额外的数据通过 props 传递给被包裹的组件
    return <WrappedComponent {...(props as P)} basename={basename} />;
  };
}

export function createRemoteComponent<T, E extends keyof T>(info: {
  loader: () => Promise<T>;
  loading: React.ReactNode;
  fallback: ErrorBoundaryPropsWithComponent['FallbackComponent'];
  export?: E;
}) {
  type ExportType = T[E] extends (...args: any) => any
    ? ReturnType<T[E]>
    : never;
  type RawComponentType = '__BRIDGE_FN__' extends keyof ExportType
    ? ExportType['__BRIDGE_FN__'] extends (...args: any) => any
      ? Parameters<ExportType['__BRIDGE_FN__']>[0]
      : {}
    : {};
  const exportName = info?.export || 'default';

  const LazyComponent = React.lazy(async () => {
    LoggerInstance.log(`createRemoteComponent LazyComponent create >>>`, {
      lazyComponent: info.loader,
      exportName,
    });
    try {
      const m = (await info.loader()) as RemoteModule;
      // @ts-ignore
      const moduleName = m && m[Symbol.for('mf_module_id')];
      LoggerInstance.log(
        `createRemoteComponent LazyComponent loadRemote info >>>`,
        { name: moduleName, module: m, exportName },
      );

      // @ts-ignore
      const exportFn = m[exportName] as any;

      if (exportName in m && typeof exportFn === 'function') {
        const RemoteAppComponent = withRouterData(
          forwardRef<
            HTMLDivElement,
            {
              basename?: ProviderParams['basename'];
              memoryRoute?: ProviderParams['memoryRoute'];
            }
          >((props, ref) => {
            return (
              <RemoteApp
                name={moduleName}
                {...info}
                providerInfo={exportFn}
                exportName={info.export || 'default'}
                {...props}
              />
            );
          }),
        );

        return {
          default: RemoteAppComponent,
        };
      } else {
        LoggerInstance.log(
          `createRemoteComponent LazyComponent module not found >>>`,
          { name: moduleName, module: m, exportName },
        );
        throw Error(
          `Make sure that ${moduleName} has the correct export when export is ${String(
            exportName,
          )}`,
        );
      }
    } catch (error) {
      throw error;
    }
  });

  return (
    props: {
      basename?: ProviderParams['basename'];
      memoryRoute?: ProviderParams['memoryRoute'];
    } & RawComponentType,
  ) => {
    return (
      <ErrorBoundary FallbackComponent={info.fallback}>
        <React.Suspense fallback={info.loading}>
          <LazyComponent {...props} />
        </React.Suspense>
      </ErrorBoundary>
    );
  };
}
