import React, { useContext } from 'react';
// The upper alias react-router-dom$ into this file avoids the loop
import * as ReactRouterDom from 'react-router-dom/';

import { RouterContext } from './context';
import { LoggerInstance } from './utils';

function WraperRouter(
  props:
    | Parameters<typeof ReactRouterDom.BrowserRouter>[0]
    | Parameters<typeof ReactRouterDom.MemoryRouter>[0],
) {
  const { basename, ...propsRes } = props;
  const routerContextProps = useContext(RouterContext) || {};

  LoggerInstance.log(`WraperRouter info >>>`, {
    ...routerContextProps,
    routerContextProps,
    WraperRouterProps: props,
  });
  if (!routerContextProps) return <ReactRouterDom.BrowserRouter {...props} />;

  if (routerContextProps?.memoryRoute) {
    return (
      <ReactRouterDom.MemoryRouter
        {...props}
        initialEntries={[routerContextProps?.memoryRoute.entryPath]}
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
  LoggerInstance.log(`WraperRouterProvider info >>>`, {
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
  console.log('=======resolve to v5!!');
  if (!routerContextProps) return <RouterProvider {...props} />;

  console.log('=======resolve to v6!!');

  if (routerContextProps.memoryRoute) {
    const MemeoryRouterInstance = createMemoryRouter(routers, {
      initialEntries: [routerContextProps?.memoryRoute.entryPath],
    });
    return <RouterProvider router={MemeoryRouterInstance} />;
  } else {
    console.log('=======createBrowserRouter routers', routers);
    console.log(
      '=======createBrowserRouter routerContextProps.basename',
      routerContextProps.basename,
    );
    const BrowserRouterInstance = createBrowserRouter(routers, {
      basename: routerContextProps.basename,
      future: router.future,
      window: router.window,
    });
    return <RouterProvider {...propsRes} router={BrowserRouterInstance} />;
  }
}

export * from 'react-router-dom/';

export { WraperRouter as BrowserRouter };
export { WraperRouterProvider as RouterProvider };
