import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  forwardRef,
} from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { dispatchPopstateEnv } from '@module-federation/bridge-shared';
import { LoggerInstance, pathJoin, getRootDomDefaultClassName } from '../utils';
import { federationRuntime } from '../provider/plugin';
import { RemoteComponentProps, RemoteAppParams } from '../types';

const RemoteAppWrapperInner = forwardRef(function (
  props: RemoteAppParams & RemoteComponentProps,
  ref,
) {
  const {
    moduleName,
    memoryRoute,
    basename,
    providerInfo,
    className,
    style,
    fallback,
    loading,
    disableRerender,
    ...resProps
  } = props;

  const instance = federationRuntime.instance;
  const rootRef: React.MutableRefObject<HTMLDivElement | null> =
    ref && 'current' in ref
      ? (ref as React.MutableRefObject<HTMLDivElement | null>)
      : useRef(null);

  const renderDom: React.MutableRefObject<HTMLElement | null> = useRef(null);
  const providerInfoRef = useRef<any>(null);
  const [initialized, setInitialized] = useState(false);
  const hasRenderedRef = useRef(false); // Track if component has rendered once

  LoggerInstance.debug(`RemoteAppWrapper instance from props >>>`, instance);

  // 初始化远程组件
  useEffect(() => {
    if (initialized) return;
    const providerReturn = providerInfo();
    providerInfoRef.current = providerReturn;
    setInitialized(true);

    return () => {
      if (providerInfoRef.current?.destroy) {
        LoggerInstance.debug(
          `createRemoteAppComponent LazyComponent destroy >>>`,
          { moduleName, basename, dom: renderDom.current },
        );

        instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit({
          moduleName,
          dom: renderDom.current,
          basename,
          memoryRoute,
          fallback,
          ...resProps,
        });

        providerInfoRef.current?.destroy({
          moduleName,
          dom: renderDom.current,
        });

        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit({
          moduleName,
          dom: renderDom.current,
          basename,
          memoryRoute,
          fallback,
          ...resProps,
        });
      }
    };
  }, [moduleName]);

  // trigger render after props updated
  useEffect(
    () => {
      LoggerInstance.debug(`RemoteAppWrapper useEffect triggered >>>`, {
        moduleName,
        initialized,
        hasProviderInfo: !!providerInfoRef.current,
        disableRerender,
        hasRenderedRef: hasRenderedRef.current,
        dependencies: disableRerender ? [initialized, moduleName] : 'all props',
      });

      if (!initialized || !providerInfoRef.current) return;

      // Check if disableRerender is enabled and module has already been rendered using ref
      if (disableRerender && hasRenderedRef.current) {
        LoggerInstance.debug(
          `RemoteAppWrapper skip re-render (disableRerender=true, hasRenderedRef=true) >>>`,
          { moduleName, hasRendered: hasRenderedRef.current },
        );
        return;
      }

      const renderProps = {
        moduleName,
        dom: rootRef.current,
        basename,
        memoryRoute,
        fallback,
        ...resProps,
      };
      renderDom.current = rootRef.current;

      const beforeBridgeRenderRes =
        instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
          renderProps,
        ) || {};

      // let provider render extend props
      const mergedRenderProps = {
        ...renderProps,
        // @ts-ignore
        ...beforeBridgeRenderRes.extraProps,
      };

      providerInfoRef.current.render(mergedRenderProps);
      instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(
        mergedRenderProps,
      );

      // Mark as rendered if disableRerender is enabled
      if (disableRerender) {
        hasRenderedRef.current = true;
        LoggerInstance.debug(
          `RemoteAppWrapper mark as rendered (disableRerender=true, hasRenderedRef set to true) >>>`,
          { moduleName, hasRendered: hasRenderedRef.current },
        );
      }
    },
    disableRerender
      ? [initialized, moduleName]
      : [initialized, ...Object.values(props)],
  );

  // bridge-remote-root
  const rootComponentClassName = `${getRootDomDefaultClassName(moduleName)} ${className || ''}`;
  return (
    <div className={rootComponentClassName} style={style} ref={rootRef}>
      {loading}
    </div>
  );
});

// Use React.memo to prevent component re-render when disableRerender is true
const RemoteAppWrapper = React.memo(
  RemoteAppWrapperInner,
  (prevProps, nextProps) => {
    // If disableRerender is enabled, prevent re-render entirely
    // Only allow re-render if essential props change
    if (nextProps.disableRerender) {
      const shouldNotRerender =
        prevProps.moduleName === nextProps.moduleName &&
        prevProps.basename === nextProps.basename &&
        prevProps.memoryRoute === nextProps.memoryRoute;

      if (shouldNotRerender) {
        LoggerInstance.debug(
          `RemoteAppWrapper React.memo preventing re-render (disableRerender=true) >>>`,
          {
            moduleName: nextProps.moduleName,
            propsChanged: Object.keys(nextProps).filter(
              (key) => prevProps[key] !== nextProps[key],
            ),
          },
        );
      }

      return shouldNotRerender;
    }
    // If disableRerender is disabled, allow re-render (return false)
    return false;
  },
);

interface ExtraDataProps {
  basename?: string;
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

    LoggerInstance.debug(`createRemoteAppComponent withRouterData >>>`, {
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

    return <WrappedComponent {...(props as P)} basename={basename} ref={ref} />;
  });

  return forwardRef(function (props, ref) {
    return <Component {...props} ref={ref} />;
  }) as any;
}

export default withRouterData(RemoteAppWrapper);
