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
  if (!routerContextProps) return <ReactRouterDom.RouterProvider {...props} />;
  if (routerContextProps.memoryRoute) {
    const MemeoryRouterInstance = ReactRouterDom.createMemoryRouter(routers, {
      initialEntries: [routerContextProps?.memoryRoute.entryPath],
    });
    return <ReactRouterDom.RouterProvider router={MemeoryRouterInstance} />;
  } else {
    const BrowserRouterInstance = ReactRouterDom.createBrowserRouter(routers, {
      basename: routerContextProps.basename,
      future: router.future,
      window: router.window,
    });
    return (
      <ReactRouterDom.RouterProvider
        {...propsRes}
        router={BrowserRouterInstance}
      />
    );
  }
}

export * from 'react-router-dom/';

export { WraperRouter as BrowserRouter };
export { WraperRouterProvider as RouterProvider };
