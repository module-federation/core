import React, { forwardRef } from 'react';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithComponent,
} from 'react-error-boundary';
import { LoggerInstance } from '../utils';
import RemoteApp from './component';
import type { ProviderParams } from '@module-federation/bridge-shared';

export interface RenderFnParams extends ProviderParams {
  dom?: any;
}

interface RemoteModule {
  provider: () => {
    render: (info: RenderFnParams) => void;
    destroy: (info: { dom: any }) => void;
  };
}

type LazyRemoteComponentInfo<T, E extends keyof T> = {
  loader: () => Promise<T>;
  loading: React.ReactNode;
  fallback: ErrorBoundaryPropsWithComponent['FallbackComponent'];
  export?: E;
};

function createLazyRemoteComponent<T, E extends keyof T>(
  info: LazyRemoteComponentInfo<T, E>,
) {
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
          {
            basename?: ProviderParams['basename'];
            memoryRoute?: ProviderParams['memoryRoute'];
          }
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

export function createRemoteComponent<T, E extends keyof T>(
  info: LazyRemoteComponentInfo<T, E>,
) {
  type ExportType = T[E] extends (...args: any) => any
    ? ReturnType<T[E]>
    : never;

  type RawComponentType = '__BRIDGE_FN__' extends keyof ExportType
    ? ExportType['__BRIDGE_FN__'] extends (...args: any) => any
      ? Parameters<ExportType['__BRIDGE_FN__']>[0]
      : {}
    : {};

  const LazyComponent = createLazyRemoteComponent(info);
  return forwardRef<HTMLDivElement, ProviderParams & RawComponentType>(
    (props, ref) => {
      return (
        <ErrorBoundary FallbackComponent={info.fallback}>
          <React.Suspense fallback={info.loading}>
            <LazyComponent {...props} ref={ref} />
          </React.Suspense>
        </ErrorBoundary>
      );
    },
  );
}
