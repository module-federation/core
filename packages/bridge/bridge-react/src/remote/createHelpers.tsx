import React, { forwardRef } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { LoggerInstance } from '../utils';
import {
  RemoteComponentParams,
  RemoteComponentProps,
  RemoteModule,
} from '../types';

export type LazyRemoteComponentInfo<
  T,
  _E extends keyof T,
> = RemoteComponentParams<T>;

/**
 * Creates a factory function for creating lazy remote components
 * @param RemoteApp The RemoteAppWrapper component to use (with or without router)
 */
export function createLazyRemoteComponentFactory(
  RemoteApp: React.ComponentType<any>,
) {
  return function createLazyRemoteComponent<
    T = Record<string, unknown>,
    E extends keyof T = keyof T,
  >(info: LazyRemoteComponentInfo<T, E>) {
    const exportName = info?.export || 'default';
    return React.lazy(async () => {
      LoggerInstance.debug(
        `createRemoteAppComponent LazyComponent create >>>`,
        {
          lazyComponent: info.loader,
          exportName,
        },
      );

      try {
        const m = (await info.loader()) as RemoteModule;
        // @ts-ignore
        const moduleName = m && m[Symbol.for('mf_module_id')];
        LoggerInstance.debug(
          `createRemoteAppComponent LazyComponent loadRemote info >>>`,
          { name: moduleName, module: m, exportName },
        );

        // @ts-ignore
        const exportFn = m[exportName];
        if (exportName in m && typeof exportFn === 'function') {
          const RemoteAppComponent = forwardRef<
            HTMLDivElement,
            RemoteComponentProps
          >((props, ref) => {
            return (
              <RemoteApp
                // change `name` key to `moduleName` to avoid same property `name` passed by user's props which may cause unexpected issues.
                moduleName={moduleName}
                providerInfo={exportFn}
                exportName={info.export || 'default'}
                fallback={info.fallback}
                loading={info.loading}
                ref={ref}
                {...props}
              />
            );
          });

          return {
            default: RemoteAppComponent,
          };
        } else {
          LoggerInstance.debug(
            `createRemoteAppComponent LazyComponent module not found >>>`,
            { name: moduleName, module: m, exportName },
          );
          throw Error(
            `Make sure that ${moduleName} has the correct export when export is ${String(
              exportName,
            )}`,
          );
        }
      } catch (error) {
        throw error;
      }
    });
  };
}

/**
 * Creates a factory function for creating remote app components
 * @param RemoteApp The RemoteAppWrapper component to use (with or without router)
 */
export function createRemoteAppComponentFactory(
  RemoteApp: React.ComponentType<any>,
) {
  const ErrorBoundaryComponent =
    ErrorBoundary as unknown as React.ComponentType<any>;
  const createLazyRemoteComponent = createLazyRemoteComponentFactory(RemoteApp);

  return function createRemoteAppComponent<
    T = Record<string, unknown>,
    E extends keyof T = keyof T,
  >(info: LazyRemoteComponentInfo<T, E>) {
    const LazyComponent = createLazyRemoteComponent(info);
    return forwardRef<HTMLDivElement, RemoteComponentProps>((props, ref) => {
      return (
        <ErrorBoundaryComponent
          FallbackComponent={
            info.fallback as React.ComponentType<FallbackProps>
          }
        >
          <React.Suspense fallback={info.loading}>
            <LazyComponent {...props} ref={ref} />
          </React.Suspense>
        </ErrorBoundaryComponent>
      );
    });
  };
}

/**
 * Creates the deprecated createRemoteComponent function
 */
export function createDeprecatedRemoteComponentFactory<
  T = Record<string, unknown>,
  E extends keyof T = keyof T,
>(createFn: (info: LazyRemoteComponentInfo<T, E>) => any) {
  return function createRemoteComponent(info: LazyRemoteComponentInfo<T, E>) {
    LoggerInstance.warn(
      `createRemoteComponent is deprecated, please use createRemoteAppComponent instead!`,
    );
    return createFn(info);
  };
}
