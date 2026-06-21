import React, { useContext, useEffect, useState, forwardRef } from 'react';
import { dispatchPopstateEnv } from '@module-federation/bridge-shared';
import {
  readReactRouter,
  type ReactRouterModule,
} from '@module-federation/bridge-react/router-runtime';
import { LoggerInstance, pathJoin } from '../../utils';
import { RemoteAppWrapper } from '../RemoteAppWrapper';

interface ExtraDataProps {
  basename?: string;
}

interface RouterDataComponentProps<P> {
  WrappedComponent: React.ComponentType<P & ExtraDataProps>;
  props: P;
  forwardedRef: React.ForwardedRef<unknown>;
  ReactRouter: ReactRouterModule;
}

interface RouterResolvedComponentProps<P> {
  WrappedComponent: React.ComponentType<P & ExtraDataProps>;
  props: P;
  forwardedRef: React.ForwardedRef<unknown>;
}

function RouterDataComponent<P extends Parameters<typeof RemoteAppWrapper>[0]>({
  WrappedComponent,
  props,
  forwardedRef,
  ReactRouter,
}: RouterDataComponentProps<P>) {
  let enableDispathPopstate = false;
  let routerContextVal: any;
  try {
    if (typeof ReactRouter?.useLocation === 'function') {
      ReactRouter.useLocation();
      enableDispathPopstate = true;
    }
  } catch {
    enableDispathPopstate = false;
  }
  let basename = '/';

  if (!props.basename && enableDispathPopstate) {
    const ReactRouterAny: any = ReactRouter || {};
    // Avoid building tools checking references
    const useRouteMatch = ReactRouterAny['use' + 'RouteMatch']; //v5
    const useHistory = ReactRouterAny['use' + 'History']; //v5
    const useHref = ReactRouterAny['use' + 'Href'];
    const UNSAFE_RouteContext = ReactRouterAny['UNSAFE_' + 'RouteContext'];

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
        const pathnameBase = routerContextVal.matches[matchIndex].pathnameBase;
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

  LoggerInstance.debug(`createRemoteAppComponent withRouterData >>>`, {
    ...props,
    basename,
    routerContextVal,
    enableDispathPopstate,
  });

  if (enableDispathPopstate) {
    const location = ReactRouter.useLocation();
    const [pathname, setPathname] = useState(location.pathname);

    useEffect(() => {
      if (pathname !== '' && pathname !== location.pathname) {
        LoggerInstance.debug(
          `createRemoteAppComponent dispatchPopstateEnv >>>`,
          {
            name: props.name,
            pathname: location.pathname,
          },
        );
        dispatchPopstateEnv();
      }
      setPathname(location.pathname);
    }, [location]);
  }

  return (
    <WrappedComponent
      {...(props as P)}
      basename={basename}
      ref={forwardedRef}
    />
  );
}

function RouterResolvedComponent<
  P extends Parameters<typeof RemoteAppWrapper>[0],
>({ WrappedComponent, props, forwardedRef }: RouterResolvedComponentProps<P>) {
  const ReactRouter = readReactRouter();

  if (ReactRouter) {
    return (
      <RouterDataComponent
        WrappedComponent={WrappedComponent}
        props={props}
        forwardedRef={forwardedRef}
        ReactRouter={ReactRouter}
      />
    );
  }

  return <WrappedComponent {...(props as P)} basename="/" ref={forwardedRef} />;
}

export function withRouterData<
  P extends Parameters<typeof RemoteAppWrapper>[0],
>(
  WrappedComponent: React.ComponentType<P & ExtraDataProps>,
): React.FC<Omit<P, keyof ExtraDataProps>> {
  const Component = forwardRef(function (props: any, ref) {
    if (props?.basename) {
      return (
        <WrappedComponent {...props} basename={props.basename} ref={ref} />
      );
    }

    return (
      <React.Suspense fallback={props?.loading || null}>
        <RouterResolvedComponent
          WrappedComponent={WrappedComponent}
          props={props as P}
          forwardedRef={ref}
        />
      </React.Suspense>
    );
  });

  return forwardRef(function (props, ref) {
    return <Component {...props} ref={ref} />;
  }) as any;
}

export default withRouterData(RemoteAppWrapper);
