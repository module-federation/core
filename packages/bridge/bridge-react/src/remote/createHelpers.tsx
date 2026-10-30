import React, { forwardRef } from 'react';
import { ErrorBoundary } from '../error-boundary';
import { LoggerInstance } from '../utils';
import type { RemoteAppWrapperProps } from './RemoteAppWrapper';
import {
  ErrorFallbackProps,
  RemoteComponentParams,
  RemoteComponentProps,
  RemoteModule,
} from '../types';

export type LazyRemoteComponentInfo<
  T,
  _E extends keyof T,
> = RemoteComponentParams<T>;

export type RemoteAppComponentCreator = <
  T = Record<string, unknown>,
  E extends keyof T = keyof T,
>(
  info: LazyRemoteComponentInfo<T, E>,
) => React.ForwardRefExoticComponent<
  React.PropsWithoutRef<RemoteComponentProps> &
    React.RefAttributes<HTMLDivElement>
>;

export type LazyRemoteComponentCreator = <
  T = Record<string, unknown>,
  E extends keyof T = keyof T,
>(
  info: LazyRemoteComponentInfo<T, E>,
) => React.LazyExoticComponent<ReturnType<RemoteAppComponentCreator>>;

/**
 * Creates a factory function for creating lazy remote components
 * @param RemoteApp The RemoteAppWrapper component to use (with or without router)
 */
export function createLazyRemoteComponentFactory(
  RemoteApp: React.ComponentType<
    RemoteAppWrapperProps & React.RefAttributes<HTMLDivElement>
  >,
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
            const {
              basename,
              memoryRoute,
              className,
              style,
              fallback = info.fallback,
              loading = info.loading,
              ...remoteProps
            } = props;
            return (
              <RemoteApp
                moduleName={moduleName}
                providerInfo={exportFn}
                instance={info.instance}
                routing={{
                  basename:
                    typeof basename === 'string' ? basename : info.basename,
                  memoryRoute: (memoryRoute as any) ?? info.memoryRoute,
                  navigation: info.navigation,
                }}
                remoteProps={remoteProps}
                fallback={fallback as React.ComponentType<ErrorFallbackProps>}
                loading={loading}
                className={className as string | undefined}
                style={style as React.CSSProperties | undefined}
                ref={ref}
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
  RemoteApp: React.ComponentType<
    RemoteAppWrapperProps & React.RefAttributes<HTMLDivElement>
  >,
) {
  const createLazyRemoteComponent = createLazyRemoteComponentFactory(RemoteApp);

  return function createRemoteAppComponent<
    T = Record<string, unknown>,
    E extends keyof T = keyof T,
  >(info: LazyRemoteComponentInfo<T, E>) {
    const LazyComponent = createLazyRemoteComponent(info);
    return forwardRef<HTMLDivElement, RemoteComponentProps>((props, ref) => {
      return (
        <ErrorBoundary
          FallbackComponent={
            info.fallback as React.ComponentType<ErrorFallbackProps>
          }
        >
          <React.Suspense fallback={info.loading}>
            <LazyComponent {...props} ref={ref} />
          </React.Suspense>
        </ErrorBoundary>
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
