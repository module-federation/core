import React, { useContext } from 'react';
// The upper alias react-router-dom$ into this file avoids the loop
import * as ReactRouterDom from 'react-router-dom/';
import { RouterContext } from '../provider/context';
import { LoggerInstance } from '../utils';

function WrapperRouter(
  props:
    | Parameters<typeof ReactRouterDom.BrowserRouter>[0]
    | Parameters<typeof ReactRouterDom.MemoryRouter>[0],
) {
  const { basename, ...propsRes } = props;
  const routerContextProps = useContext(RouterContext) || {};

  LoggerInstance.debug(`WrapperRouter info >>>`, {
    ...routerContextProps,
    routerContextProps,
    WrapperRouterProps: props,
  });

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

function WrapperRouterProvider(
  props: Parameters<typeof ReactRouterDom.RouterProvider>[0],
) {
  const { router, ...propsRes } = props;
  const routerContextProps = useContext(RouterContext) || {};
  const routers = router.routes;
  LoggerInstance.debug(`WrapperRouterProvider info >>>`, {
    ...routerContextProps,
    routerContextProps,
    WrapperRouterProviderProps: props,
    router,
  });
  const RouterProvider = (ReactRouterDom as any)['Router' + 'Provider'];
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
      basename: routerContextProps.basename || router?.basename,
      future: router.future,
      window: router.window,
    });
    return <RouterProvider {...propsRes} router={BrowserRouterInstance} />;
  }
}

export * from 'react-router-dom/';

export { WrapperRouter as BrowserRouter };
export { WrapperRouterProvider as RouterProvider };
