import React, { useContext, useEffect, useRef, useState, forwardRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import type { ProviderParams } from '@module-federation/bridge-shared';
import { LoggerInstance, pathJoin } from '../utils';
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
  exportName: string | number | symbol;
}

const RemoteAppWrapper = forwardRef(function (props: RemoteAppParams & ProviderParams, ref) {
  const RemoteApp = () => {
    const {
      name,
      memoryRoute,
      basename,
      providerInfo,
      ...resProps
    } = props;

    const rootRef: React.MutableRefObject<HTMLElement | null> = ref && 'current' in ref ? ref as React.MutableRefObject<HTMLElement | null> : useRef(null);
    const renderDom: React.MutableRefObject<HTMLElement | null> = useRef(null);
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
  }

  (RemoteApp as any)['__APP_VERSION__'] = __APP_VERSION__;
  return <RemoteApp />
});

interface ExtraDataProps {
  basename?: string;
}

export function withRouterData<P extends Parameters<typeof RemoteAppWrapper>[0]>(
  WrappedComponent: React.ComponentType<P & ExtraDataProps>,
): React.FC<Omit<P, keyof ExtraDataProps>> {
  
  const Component = forwardRef(function (props: any, ref) {
    let enableDispathPopstate = false
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

    LoggerInstance.log(`createRemoteComponent withRouterData >>>`, {
      ...props,
      basename,
      routerContextVal,
      enableDispathPopstate,
    });

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

    return <WrappedComponent {...(props as P)} basename={basename} ref={ref} />;
  });

  return forwardRef(function (props, ref) {
    return <Component {...props} ref={ref} />
  }) as any;
}

export default withRouterData(RemoteAppWrapper);
