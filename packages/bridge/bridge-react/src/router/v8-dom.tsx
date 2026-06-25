import React, { useContext } from 'react';
import * as ReactRouter from 'react-router';
import * as ReactRouterDom from 'react-router/dom';
import { RouterContext } from '../provider/context';
import { LoggerInstance } from '../utils';

function WrapperRouter(props: Record<string, unknown>) {
  const { basename, ...propsRes } = props;
  const routerContextProps = useContext(RouterContext) || {};
  const MemoryRouter =
    ReactRouter.MemoryRouter as unknown as React.ComponentType<any>;
  const BrowserRouter = (ReactRouterDom as any)
    .BrowserRouter as React.ComponentType<any>;

  LoggerInstance.debug(`WrapperRouter info >>>`, {
    ...routerContextProps,
    routerContextProps,
    WrapperRouterProps: props,
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

function WrapperRouterProvider(props: Record<string, unknown>) {
  const { router, ...propsRes } = props as { router: any };
  const routerContextProps = useContext(RouterContext) || {};
  const routers = router.routes;
  LoggerInstance.debug(`WrapperRouterProvider info >>>`, {
    ...routerContextProps,
    routerContextProps,
    WrapperRouterProviderProps: props,
    router,
  });
  const createMemoryRouter = (ReactRouter as any)['create' + 'MemoryRouter'];
  const createBrowserRouter = (ReactRouterDom as any)[
    'create' + 'BrowserRouter'
  ];

  if (routerContextProps.memoryRoute) {
    const MemoryRouterInstance = createMemoryRouter(routers, {
      initialEntries: [routerContextProps?.memoryRoute.entryPath],
    });
    return <ReactRouterDom.RouterProvider router={MemoryRouterInstance} />;
  } else {
    const BrowserRouterInstance = createBrowserRouter(routers, {
      // In host app, the routerContextProps is {}, so we should use router.basename as fallback
      basename: routerContextProps.basename || router.basename,
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

export * from 'react-router/dom';
export { WrapperRouter as BrowserRouter };
export { WrapperRouterProvider as RouterProvider };
