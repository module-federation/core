/**
 * Base bridge component implementation
 * This file contains bridge component logic shared across all React versions
 */
import * as React from 'react';
import type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  CreateRootOptions,
  ErrorFallbackProps,
} from '../../types';
import { ErrorBoundary } from '../../error-boundary';
import { RouterContext } from '../context';
import { LoggerInstance } from '../../utils';
import { federationRuntime } from '../plugin';
import {
  bridgeRegistry,
  refreshAllBridges as _refreshAllBridges,
  resolveRootComponent,
} from './hmr-runtime';

export function createBaseBridgeComponent<T>({
  createRoot,
  defaultRootOptions,
  ...bridgeInfo
}: ProviderFnParams<T>) {
  return () => {
    const rootMap = new Map<any, RootType>();
    const instance = federationRuntime.instance;
    LoggerInstance.debug(
      `createBridgeComponent instance from props >>>`,
      instance,
    );

    const callerKey = bridgeInfo.__callerKey;
    const fallbackGetter = bridgeInfo.rootComponentGetter;

    const RawComponent = (info: { propsInfo: T; appInfo: ProviderParams }) => {
      const { appInfo, propsInfo, ...restProps } = info;
      const { moduleName, memoryRoute, basename = '/' } = appInfo;
      const CurrentRoot = resolveRootComponent(
        callerKey,
        bridgeInfo.rootComponent,
        fallbackGetter as any,
      );
      return (
        <RouterContext.Provider value={{ moduleName, basename, memoryRoute }}>
          <CurrentRoot
            {...propsInfo}
            basename={basename}
            {...restProps}
          />
        </RouterContext.Provider>
      );
    };

    const DefaultFallback = ({ error }: ErrorFallbackProps) => (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre style={{ color: 'red' }}>
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );

    const omitHostFallback = <P extends Record<string, unknown>>(props: P) => {
      const nextProps = { ...props };
      delete nextProps.fallback;
      return nextProps;
    };

    const BridgeWrapper = ({
      basename,
      moduleName,
      memoryRoute,
      propsInfo,
    }: {
      basename?: string;
      moduleName?: string;
      memoryRoute?: any;
      propsInfo: T;
    }) => (
      <ErrorBoundary FallbackComponent={DefaultFallback}>
        <RawComponent
          appInfo={{
            moduleName,
            basename,
            memoryRoute,
          }}
          propsInfo={propsInfo}
        />
      </ErrorBoundary>
    );

    const ref: {
      dom: Element | null;
      info: any;
      rootRef: any;
      bridgeInfoKeyRef: { current: string | symbol | undefined };
      handleRef: { current: any | null };
    } = {
      dom: null,
      info: null,
      rootRef: rootMap as any,
      bridgeInfoKeyRef: { current: callerKey },
      handleRef: { current: null },
    };
    bridgeRegistry().add(ref as any);

    const handle = {
      async render(info: RenderParams) {
        LoggerInstance.debug(`createBridgeComponent render Info`, info);
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          rootOptions,
          ...propsInfo
        } = info;

        ref.dom = dom ?? null;
        ref.info = { ...info };

        const mergedRootOptions: CreateRootOptions | undefined = {
          ...defaultRootOptions,
          ...(rootOptions as CreateRootOptions),
        };

        const beforeBridgeRenderRes =
          instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(info) || {};

        const rootComponentWithErrorBoundary = (
          <BridgeWrapper
            basename={basename}
            moduleName={moduleName}
            memoryRoute={memoryRoute}
            propsInfo={
              {
                ...omitHostFallback(propsInfo as Record<string, unknown>),
                basename,
                ...(beforeBridgeRenderRes as any)?.extraProps,
              } as T
            }
          />
        );

        if (bridgeInfo.render) {
          await Promise.resolve(
            bridgeInfo.render(rootComponentWithErrorBoundary, dom),
          ).then((root: RootType) => rootMap.set(dom, root));
        } else {
          let root = rootMap.get(dom);
          // Do not call createRoot multiple times
          if (!root && createRoot) {
            root = createRoot(dom, mergedRootOptions);
            rootMap.set(dom, root as any);
          }

          if (root && 'render' in root) {
            root.render(rootComponentWithErrorBoundary);
          }
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info) || {};
      },

      destroy(info: DestroyParams) {
        const { dom } = info;
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(dom);
        if (root) {
          if ('unmount' in root) {
            root.unmount();
          } else {
            LoggerInstance.warn('Root does not have unmount method');
          }
          rootMap.delete(dom);
        }
        bridgeRegistry().delete(ref as any);
        if (ref.info?.dom === dom) ref.dom = null;
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
      },
    };

    ref.handleRef.current = handle;

    return handle;
  };
}

/**
 * Force every currently-mounted bridge to re-run its React root reconciliation.
 * Exposed so external tools / unit tests / custom HMR hooks can trigger updates
 * without waiting for the built-in global hooks. Returns the number of bridges
 * that were successfully re-rendered.
 */
export function refreshAllBridges(): number {
  return _refreshAllBridges();
}

