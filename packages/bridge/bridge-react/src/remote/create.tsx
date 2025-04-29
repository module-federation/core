import React, { forwardRef } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { LoggerInstance } from '../utils';
import RemoteApp from './component';
import {
  RemoteComponentParams,
  RemoteComponentProps,
  RemoteModule,
} from '../types';

type LazyRemoteComponentInfo<T, E extends keyof T> = RemoteComponentParams<T>;

function createLazyRemoteComponent<
  T = Record<string, unknown>,
  E extends keyof T = keyof T,
>(info: LazyRemoteComponentInfo<T, E>) {
  const exportName = info?.export || 'default';
  return React.lazy(async () => {
    LoggerInstance.debug(`createRemoteComponent LazyComponent create >>>`, {
      lazyComponent: info.loader,
      exportName,
    });

    try {
      const m = (await info.loader()) as RemoteModule;
      // @ts-ignore
      const moduleName = m && m[Symbol.for('mf_module_id')];
      LoggerInstance.debug(
        `createRemoteComponent LazyComponent loadRemote info >>>`,
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
          `createRemoteComponent LazyComponent module not found >>>`,
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
}

export function createRemoteComponent<
  T = Record<string, unknown>,
  E extends keyof T = keyof T,
>(info: LazyRemoteComponentInfo<T, E>) {
  const LazyComponent = createLazyRemoteComponent(info);
  return forwardRef<HTMLDivElement, RemoteComponentProps>((props, ref) => {
    return (
      <ErrorBoundary
        FallbackComponent={info.fallback as React.ComponentType<FallbackProps>}
      >
        <React.Suspense fallback={info.loading}>
          <LazyComponent {...props} ref={ref} />
        </React.Suspense>
      </ErrorBoundary>
    );
  });
}
