import React, { useContext } from 'react';
// The upper alias react-router-dom$ into this file avoids the loop
import * as ReactRouterDom from 'react-router-dom/dist/index.js';
import { RouterContext } from '../provider/context';
import { LoggerInstance } from '../utils';
import { BridgeStaticRouter } from './static';

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

  if (routerContextProps?.ssrLocation) {
    return (
      <BridgeStaticRouter
        Router={ReactRouterDom.Router}
        basename={routerContextProps.basename || basename}
        location={routerContextProps.ssrLocation}
      >
        {props.children}
      </BridgeStaticRouter>
    );
  }
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

  if (routerContextProps.ssrLocation) {
    throw new Error(
      'Bridge SSR V1 does not support React Router data routers or RouterProvider',
    );
  }

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

// export * from 'react-router-dom/dist/index.js';
export * from 'react-router-dom/';
export { WraperRouter as BrowserRouter };
export { WraperRouterProvider as RouterProvider };
