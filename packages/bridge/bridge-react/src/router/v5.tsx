import React, { useContext } from 'react';
// The upper alias react-router-dom$ into this file avoids the loop
// @ts-ignore
import * as ReactRouterDom from 'react-router-dom/index.js';
import { RouterContext } from '../provider/context';
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

// @ts-ignore
// because export directly from react-router-dom/index.js will cause build falied.
// it will be replace by react-router-dom/index.js in building phase
export * from 'react-router-dom/';

export { WraperRouter as BrowserRouter };
