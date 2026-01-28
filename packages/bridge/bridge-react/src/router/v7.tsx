import React, { useContext } from 'react';
// The upper alias react-router$ into this file avoids the loop
// React Router v7 uses different dist structure, we'll import from the main entry
import * as ReactRouterDom from 'react-router';
import { RouterContext } from '../provider/context';
import { LoggerInstance } from '../utils';

function WraperRouter(
  props: Record<string, unknown>,
) {
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

  if (routerContextProps?.memoryRoute) {
    return (
      <MemoryRouter
        {...props}
        initialEntries={[routerContextProps?.memoryRoute.entryPath]}
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

function WraperRouterProvider(
  props: Record<string, unknown>,
) {
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

  if (routerContextProps.memoryRoute) {
    const MemeoryRouterInstance = createMemoryRouter(routers, {
      initialEntries: [routerContextProps?.memoryRoute.entryPath],
    });
    return <RouterProvider router={MemeoryRouterInstance} />;
  } else {
    const BrowserRouterInstance = createBrowserRouter(routers, {
      // In host app, the routerContextProps is {}, so we should use router.basename as fallback
      basename: routerContextProps.basename || router.basename,
      future: router.future,
      window: router.window,
    });
    return <RouterProvider {...propsRes} router={BrowserRouterInstance} />;
  }
}

// Export all from react-router for v7 compatibility
export * from 'react-router';
export { WraperRouter as BrowserRouter };
export { WraperRouterProvider as RouterProvider };
