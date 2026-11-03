import React, { useContext, forwardRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { pathJoin } from '../../utils';
import type { RemoteAppWrapperProps } from '../RemoteAppWrapper';

const MissingRouteContext = React.createContext<any>(null);

/** Legacy React Router integration, shared by old and unified default entries. */
export function createRouterMount(
  WrappedComponent: React.ComponentType<
    RemoteAppWrapperProps & React.RefAttributes<HTMLDivElement>
  >,
  useRouteSync: (value: {
    current?: string;
    basename: string;
    automatic: boolean;
    props: RemoteAppWrapperProps;
  }) => void = () => {},
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
    useRouteSync({ current, basename, automatic, props });
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
