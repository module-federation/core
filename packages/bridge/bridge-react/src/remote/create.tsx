import React, { forwardRef, memo } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { LoggerInstance } from '../utils';
import RemoteApp from './component';
import {
  RemoteComponentParams,
  RemoteComponentProps,
  RemoteModule,
} from '../types';

export type LazyRemoteComponentInfo<
  T,
  _E extends keyof T,
> = RemoteComponentParams<T>;

const hasOwn = Object.prototype.hasOwnProperty;

function areRemoteComponentPropsEqual(
  prevProps: RemoteComponentProps,
  nextProps: RemoteComponentProps,
) {
  if (prevProps === nextProps) {
    return true;
  }

  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (let i = 0; i < prevKeys.length; i += 1) {
    const key = prevKeys[i];
    if (!hasOwn.call(nextProps, key)) {
      return false;
    }
    if (!Object.is(prevProps[key], nextProps[key])) {
      return false;
    }
  }

  return true;
}

function createLazyRemoteComponent<
  T = Record<string, unknown>,
  E extends keyof T = keyof T,
>(info: LazyRemoteComponentInfo<T, E>) {
  const exportName = info?.export || 'default';
  return React.lazy(async () => {
    LoggerInstance.debug(`createRemoteAppComponent LazyComponent create >>>`, {
      lazyComponent: info.loader,
      exportName,
    });

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
        const RemoteAppComponentInner = forwardRef<
          HTMLDivElement,
          RemoteComponentProps
        >((props, ref) => (
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
        ));

        RemoteAppComponentInner.displayName = `RemoteAppComponent(${
          moduleName || 'unknown'
        })`;

        const RemoteAppComponent = memo(
          RemoteAppComponentInner,
          areRemoteComponentPropsEqual,
        );

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
}

export function createRemoteAppComponent<
  T = Record<string, unknown>,
  E extends keyof T = keyof T,
>(info: LazyRemoteComponentInfo<T, E>) {
  const LazyComponent = createLazyRemoteComponent(info);
  const RemoteComponentWithBoundary = forwardRef<
    HTMLDivElement,
    RemoteComponentProps
  >((props, ref) => (
    <ErrorBoundary
      FallbackComponent={info.fallback as React.ComponentType<FallbackProps>}
    >
      <React.Suspense fallback={info.loading}>
        <LazyComponent {...props} ref={ref} />
      </React.Suspense>
    </ErrorBoundary>
  ));

  RemoteComponentWithBoundary.displayName = `RemoteAppBoundary(${
    (info?.export as string) || 'default'
  })`;

  const MemoRemoteComponentWithBoundary = memo(
    RemoteComponentWithBoundary,
    areRemoteComponentPropsEqual,
  );

  return MemoRemoteComponentWithBoundary as unknown as React.ForwardRefExoticComponent<
    RemoteComponentProps & React.RefAttributes<HTMLDivElement>
  >;
}

/**
 * @deprecated createRemoteAppComponent is deprecated, please use createRemoteAppComponent instead!
 */
export function createRemoteComponent<
  T = Record<string, unknown>,
  E extends keyof T = keyof T,
>(info: LazyRemoteComponentInfo<T, E>) {
  LoggerInstance.warn(
    `createRemoteComponent is deprecated, please use createRemoteAppComponent instead!`,
  );
  return createRemoteAppComponent(info);
}
