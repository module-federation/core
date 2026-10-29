import React, { useContext, useEffect, useRef, forwardRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import {
  dispatchPopstateEnv,
  type BridgeOperationContext,
} from '@module-federation/bridge-shared';
import { pathJoin } from '../../utils';
import { federationRuntime } from '../../provider/plugin';
import {
  RemoteAppWrapper,
  type RemoteAppWrapperProps,
} from '../RemoteAppWrapper';

const MissingRouteContext = React.createContext<any>(null);

/** Legacy React Router integration, shared by old and unified default entries. */
export function withRouterData(
  WrappedComponent: React.ComponentType<
    RemoteAppWrapperProps & React.RefAttributes<HTMLDivElement>
  >,
) {
  const AutomaticRouterMount = forwardRef<
    HTMLDivElement,
    RemoteAppWrapperProps
  >(function AutomaticRouterMount(props, ref) {
    const router: any = ReactRouterDOM;
    let location: ReturnType<typeof ReactRouterDOM.useLocation> | undefined;
    try {
      location = ReactRouterDOM.useLocation();
    } catch {
      // The router-aware entry also supports applications without a Host Router.
    }
    const routeContext: any = useContext(
      router.UNSAFE_RouteContext || MissingRouteContext,
    );
    let inferredBasename = '/';
    if (location) {
      if (router.UNSAFE_RouteContext) {
        const rootHref = router.useHref('/');
        const matches = routeContext?.matches;
        inferredBasename = pathJoin(
          rootHref,
          matches?.[matches.length - 1]?.pathnameBase || '/',
        );
      } else {
        const match = router.useRouteMatch?.();
        const history = router.useHistory?.();
        inferredBasename = pathJoin(
          history?.createHref?.({ pathname: '/' }) || '/',
          match?.url || '/',
        );
      }
    }
    const automatic = !(
      props.routing?.navigation ||
      props.routing?.memoryRoute ||
      props.remoteProps.memoryRoute
    );
    const explicit = props.routing?.basename ?? props.remoteProps.basename;
    const basename = typeof explicit === 'string' ? explicit : inferredBasename;
    const current = location
      ? `${location.pathname}${location.search}${location.hash}`
      : undefined;
    const previous = useRef(current);
    const instance = props.instance || federationRuntime.instance;
    useEffect(() => {
      const from = previous.current;
      previous.current = current;
      if (
        !automatic ||
        from === undefined ||
        current === undefined ||
        from === current
      )
        return;
      const context: BridgeOperationContext = {
        side: 'consumer',
        framework: 'react',
        operation: 'route-sync',
        moduleName: props.moduleName,
        route: {
          action: 'host-to-remote',
          mechanism: 'popstate',
          from,
          to: current,
          basename,
        },
      };
      dispatchPopstateEnv();
      instance?.bridgeHook?.lifecycle.afterBridgeRouteSync.emit({ context });
    }, [current, basename, instance, props.moduleName, automatic]);
    return (
      <WrappedComponent
        {...props}
        routing={automatic ? { ...props.routing, basename } : props.routing}
        ref={ref}
      />
    );
  });

  // Keep the same renderer in the tree when explicit controls are added or removed.
  return AutomaticRouterMount;
}

export default withRouterData(RemoteAppWrapper);
