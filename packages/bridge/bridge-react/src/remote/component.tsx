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
      // Calculate dependencies based on disableRerender
      let effectDeps;
      if (disableRerender === true) {
        effectDeps = [initialized, moduleName];
      } else if (Array.isArray(disableRerender)) {
        // Watch only specified props
        const watchedValues = disableRerender.map((key) => props[key]);
        effectDeps = [initialized, moduleName, ...watchedValues];
      } else {
        effectDeps = 'all props';
      }

      LoggerInstance.debug(`RemoteAppWrapper useEffect triggered >>>`, {
        moduleName,
        initialized,
        hasProviderInfo: !!providerInfoRef.current,
        disableRerender,
        hasRenderedRef: hasRenderedRef.current,
        dependencies: effectDeps,
      });

      if (!initialized || !providerInfoRef.current) return;

      // Check if disableRerender is true and module has already been rendered using ref
      if (disableRerender === true && hasRenderedRef.current) {
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

      // Mark as rendered if disableRerender is true (not array)
      if (disableRerender === true) {
        hasRenderedRef.current = true;
        LoggerInstance.debug(
          `RemoteAppWrapper mark as rendered (disableRerender=true, hasRenderedRef set to true) >>>`,
          { moduleName, hasRendered: hasRenderedRef.current },
        );
      }
    },
    disableRerender === true
      ? [initialized, moduleName]
      : Array.isArray(disableRerender)
        ? [initialized, moduleName, ...disableRerender.map((key) => props[key])]
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

/**
 * Custom comparison function for React.memo to control re-rendering behavior
 * @param prevProps - Previous props
 * @param nextProps - Next props
 * @returns true to prevent re-render, false to allow re-render
 */
function shouldSkipRemoteAppUpdate(prevProps: any, nextProps: any): boolean {
  const { disableRerender } = nextProps;

  // Mode 3: Standard behavior - allow all re-renders
  if (!disableRerender) {
    return false;
  }

  // Essential props that always trigger re-render
  const essentialPropsChanged =
    prevProps.moduleName !== nextProps.moduleName ||
    prevProps.basename !== nextProps.basename ||
    prevProps.memoryRoute !== nextProps.memoryRoute;

  if (essentialPropsChanged) {
    return false; // Allow re-render for essential props
  }

  // Mode 1: Complete disable - prevent all re-renders
  if (disableRerender === true) {
    LoggerInstance.debug(
      `RemoteAppWrapper React.memo preventing re-render (disableRerender=true) >>>`,
      {
        moduleName: nextProps.moduleName,
        propsChanged: Object.keys(nextProps).filter(
          (key) => prevProps[key] !== nextProps[key],
        ),
      },
    );
    return true; // Prevent re-render
  }

  // Mode 2: Watch specific props - only check specified props
  if (Array.isArray(disableRerender)) {
    const watchedPropsChanged = disableRerender.some(
      (key) => prevProps[key] !== nextProps[key],
    );

    if (watchedPropsChanged) {
      LoggerInstance.debug(
        `RemoteAppWrapper React.memo allowing re-render (watched props changed) >>>`,
        {
          moduleName: nextProps.moduleName,
          watchedProps: disableRerender,
          changedProps: disableRerender.filter(
            (key) => prevProps[key] !== nextProps[key],
          ),
        },
      );
      return false; // Allow re-render
    }

    LoggerInstance.debug(
      `RemoteAppWrapper React.memo preventing re-render (watched props unchanged) >>>`,
      {
        moduleName: nextProps.moduleName,
        watchedProps: disableRerender,
        propsChanged: Object.keys(nextProps).filter(
          (key) => prevProps[key] !== nextProps[key],
        ),
      },
    );
    return true; // Prevent re-render
  }

  // Default: allow re-render
  return false;
}

// Use React.memo with custom comparison function to control re-rendering
const RemoteAppWrapper = React.memo(
  RemoteAppWrapperInner,
  shouldSkipRemoteAppUpdate,
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
