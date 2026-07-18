import * as React from 'react';
import { ErrorBoundary } from '../../error-boundary';
import type {
  ErrorFallbackProps,
  ProviderFnParams,
  ProviderParams,
} from '../../types';
import { RouterContext } from '../context';

export function omitHostFallback<P extends Record<string, unknown>>(props: P) {
  const next = { ...props };
  delete next.fallback;
  return next;
}

export function createBridgeReactElement<T>({
  rootComponent: RootComponent,
  basename,
  moduleName,
  memoryRoute,
  ssrLocation,
  propsInfo,
}: {
  rootComponent: ProviderFnParams<T>['rootComponent'];
  basename?: string;
  moduleName?: string;
  memoryRoute?: ProviderParams['memoryRoute'];
  ssrLocation?: string;
  propsInfo: T;
}) {
  const DefaultFallback = ({ error }: ErrorFallbackProps) => (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  );

  return (
    <ErrorBoundary FallbackComponent={DefaultFallback}>
      <RouterContext.Provider
        value={{
          moduleName,
          basename: basename || '/',
          memoryRoute,
          ssrLocation,
        }}
      >
        <RootComponent {...propsInfo} basename={basename || '/'} />
      </RouterContext.Provider>
    </ErrorBoundary>
  );
}
