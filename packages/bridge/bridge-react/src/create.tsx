import React, { forwardRef } from 'react';
import type { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';
import type { ProviderParams } from '@module-federation/bridge-shared';
import { LoggerInstance } from './utils';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithComponent,
} from 'react-error-boundary';
import RemoteApp from './remote';

export interface RenderFnParams extends ProviderParams {
  dom?: any;
}
interface RemoteModule {
  provider: () => {
    render: (
      info: ProviderParams & {
        dom: any;
      },
    ) => void;
    destroy: (info: { dom: any }) => void;
  };
}

function createLazyRemoteComponent<T, E extends keyof T>(info: {
  loader: () => Promise<T>;
  loading: React.ReactNode;
  fallback: ErrorBoundaryPropsWithComponent['FallbackComponent'];
  export?: E;
}) {
  const exportName = info?.export || 'default';
  return React.lazy(async () => {
    LoggerInstance.log(`createRemoteComponent LazyComponent create >>>`, {
      lazyComponent: info.loader,
      exportName,
    });
    try {
      const m = (await info.loader()) as RemoteModule;
      // @ts-ignore
      const moduleName = m && m[Symbol.for('mf_module_id')];
      LoggerInstance.log(
        `createRemoteComponent LazyComponent loadRemote info >>>`,
        { name: moduleName, module: m, exportName },
      );

      // @ts-ignore
      const exportFn = m[exportName] as any;

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
              name={moduleName}
              providerInfo={exportFn}
              exportName={info.export || 'default'}
              ref={ref}
              {...props}
            />
          );
        });

        return {
          default: RemoteAppComponent,
        };
      } else {
        LoggerInstance.log(
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

export function createRemoteComponent<T, E extends keyof T>(info: {
  loader: () => Promise<T>;
  loading: React.ReactNode;
  fallback: ErrorBoundaryPropsWithComponent['FallbackComponent'];
  export?: E;
}): ForwardRefExoticComponent<PropsWithoutRef<ProviderParams> & RefAttributes<HTMLElement | HTMLDivElement>> {
  // type ExportType = T[E] extends (...args: any) => any
  //   ? ReturnType<T[E]>
  //   : never;
  // type RawComponentType = '__BRIDGE_FN__' extends keyof ExportType
  //   ? ExportType['__BRIDGE_FN__'] extends (...args: any) => any
  //     ? Parameters<ExportType['__BRIDGE_FN__']>[0]
  //     : {}
  //   : {};

  return forwardRef(function (props, ref) {
    const LazyComponent = createLazyRemoteComponent(info);
    return (
      <ErrorBoundary FallbackComponent={info.fallback}>
        <React.Suspense fallback={info.loading}>
          <LazyComponent {...props} ref={ref} />
        </React.Suspense>
      </ErrorBoundary>
    );
  });
}
