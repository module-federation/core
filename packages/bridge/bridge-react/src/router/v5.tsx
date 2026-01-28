import React, { useContext } from 'react';
// The upper alias react-router-dom$ into this file avoids the loop
// @ts-ignore
import * as ReactRouterDom from 'react-router-dom/index.js';
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

// @ts-ignore
// because export directly from react-router-dom/index.js will cause build falied.
// it will be replace by react-router-dom/index.js in building phase
export * from 'react-router-dom/';

export { WraperRouter as BrowserRouter };
