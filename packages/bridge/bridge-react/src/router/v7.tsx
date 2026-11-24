import React, { useContext, useMemo } from 'react';
// The upper alias react-router$ into this file avoids the loop
// React Router v7 uses different dist structure, we'll import from the main entry
import * as ReactRouterDom from 'react-router';
import { RouterContext } from '../provider/context';
import { normalizeBridgeMemoryRoute } from '../memoryRoute';
import { LoggerInstance } from '../utils';

function WraperRouter(props: Record<string, unknown>) {
  const { basename, ...propsRes } = props;
  const routerContextProps = useContext(RouterContext) || {};
  const MemoryRouter =
    ReactRouterDom.MemoryRouter as unknown as React.ComponentType<any>;
  const BrowserRouter =
    ReactRouterDom.BrowserRouter as unknown as React.ComponentType<any>;

  LoggerInstance.debug(`WraperRouter info >>>`, {
    ...routerContextProps,
    routerContextProps,
    WraperRouterProps: props,
  });

  const normalizedMemory = normalizeBridgeMemoryRoute(
    routerContextProps?.memoryRoute,
  );
  if (normalizedMemory) {
    return (
      <MemoryRouter
        {...propsRes}
        basename={
          normalizedMemory.basename !== '/'
            ? normalizedMemory.basename
            : undefined
        }
        initialEntries={normalizedMemory.initialEntries}
        initialIndex={normalizedMemory.initialIndex}
      />
    );
  }
  return (
    <BrowserRouter
      {...propsRes}
      basename={routerContextProps?.basename || basename}
    />
  );
}

function WraperRouterProvider(props: Record<string, unknown>) {
  const { router, ...propsRes } = props as { router: any };
  const routerContextProps = useContext(RouterContext) || {};
  const routers = router.routes;
  LoggerInstance.debug(`WraperRouterProvider info >>>`, {
    ...routerContextProps,
    routerContextProps,
    WraperRouterProviderProps: props,
    router,
  });
  const RouterProvider = (ReactRouterDom as any)[
    'Router' + 'Provider'
  ] as React.ComponentType<any>;
  const createMemoryRouter = (ReactRouterDom as any)['create' + 'MemoryRouter'];
  const createBrowserRouter = (ReactRouterDom as any)[
    'create' + 'BrowserRouter'
  ];

  const normalizedMemory = normalizeBridgeMemoryRoute(
    routerContextProps.memoryRoute,
  );
  const memoryKey = normalizedMemory ? JSON.stringify(normalizedMemory) : '';
  const basename = routerContextProps.basename || router.basename;

  const routerInstance = useMemo(() => {
    if (normalizedMemory) {
      return createMemoryRouter(routers, {
        basename: normalizedMemory.basename,
        initialEntries: normalizedMemory.initialEntries,
        initialIndex: normalizedMemory.initialIndex,
        ...(router.hydrationData
          ? { hydrationData: router.hydrationData }
          : {}),
      });
    }
    return createBrowserRouter(routers, {
      // In host app, the routerContextProps is {}, so we should use router.basename as fallback
      basename,
      future: router.future,
      window: router.window,
      ...(router.hydrationData ? { hydrationData: router.hydrationData } : {}),
    });
  }, [routers, memoryKey, basename, router.future, router.window]);

  return <RouterProvider {...propsRes} router={routerInstance} />;
}

// Export all from react-router for v7 compatibility
export * from 'react-router';
export { WraperRouter as BrowserRouter };
export { WraperRouterProvider as RouterProvider };
