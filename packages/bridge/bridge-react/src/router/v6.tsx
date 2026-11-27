import React, { useContext, useMemo } from 'react';
// The upper alias react-router-dom$ into this file avoids the loop
import * as ReactRouterDom from 'react-router-dom/dist/index.js';
import { RouterContext } from '../provider/context';
import { normalizeBridgeMemoryRoute } from '../memoryRoute';
import { LoggerInstance } from '../utils';

function WraperRouter(
  props:
    | Parameters<typeof ReactRouterDom.BrowserRouter>[0]
    | Parameters<typeof ReactRouterDom.MemoryRouter>[0],
) {
  const { basename, ...propsRes } = props;
  const routerContextProps = useContext(RouterContext) || {};

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
      <ReactRouterDom.MemoryRouter
        {...propsRes}
        basename={
          normalizedMemory.basename !== '/'
            ? normalizedMemory.basename
            : undefined
        }
        initialEntries={normalizedMemory.initialEntries as any}
        initialIndex={normalizedMemory.initialIndex}
      />
    );
  }
  return (
    <ReactRouterDom.BrowserRouter
      {...propsRes}
      basename={routerContextProps?.basename || basename}
    />
  );
}

function WraperRouterProvider(
  props: Parameters<typeof ReactRouterDom.RouterProvider>[0],
) {
  const { router, ...propsRes } = props;
  const routerContextProps = useContext(RouterContext) || {};
  const routers = router.routes;
  LoggerInstance.debug(`WraperRouterProvider info >>>`, {
    ...routerContextProps,
    routerContextProps,
    WraperRouterProviderProps: props,
    router,
  });
  const RouterProvider = (ReactRouterDom as any)['Router' + 'Provider'];
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
        ...((router as any).hydrationData
          ? { hydrationData: (router as any).hydrationData }
          : {}),
      });
    }
    return createBrowserRouter(routers, {
      // In host app, the routerContextProps is {}, so we should use router.basename as fallback
      basename,
      future: router.future,
      window: router.window,
      ...((router as any).hydrationData
        ? { hydrationData: (router as any).hydrationData }
        : {}),
    });
  }, [routers, memoryKey, basename, router.future, router.window]);

  return <RouterProvider {...propsRes} router={routerInstance} />;
}

// export * from 'react-router-dom/dist/index.js';
export * from 'react-router-dom/';
export { WraperRouter as BrowserRouter };
export { WraperRouterProvider as RouterProvider };
