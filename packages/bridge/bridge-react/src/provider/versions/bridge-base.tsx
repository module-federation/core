/**
 * Base bridge component implementation
 * This file contains bridge component logic shared across all React versions
 */
import * as React from 'react';
import type { BridgeOperationContext } from '@module-federation/bridge-shared';
import type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  CreateRootOptions,
  ErrorFallbackProps,
  HydrateParams,
  BridgeSSRRequest,
} from '../../types';
import { ErrorBoundary } from '../../error-boundary';
import { RouterContext } from '../context';
import { LoggerInstance } from '../../utils';
import { federationRuntime } from '../plugin';

export function createBaseBridgeComponent<T>({
  createRoot,
  hydrateRoot,
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

    const RawComponent = (info: { propsInfo: T; appInfo: ProviderParams }) => {
      const { appInfo, propsInfo, ...restProps } = info;
      const { moduleName, memoryRoute, basename = '/' } = appInfo;
      return (
        <RouterContext.Provider value={{ moduleName, basename, memoryRoute }}>
          <bridgeInfo.rootComponent
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

    // Keep the producer tree identical across stream rendering, hydration and
    // later updates. Framework renderers receive this tree, never a Host element.
    const createElement = (
      info: ProviderParams,
      propsInfo: Record<string, unknown>,
      eventInfo: RenderParams | BridgeSSRRequest,
      operationContext: BridgeOperationContext,
    ) => {
      const { basename, moduleName, memoryRoute } = info;
      const beforeBridgeRenderRes =
        instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
          eventInfo,
          operationContext,
        ) || {};
      return (
        <BridgeWrapper
          basename={basename}
          moduleName={moduleName}
          memoryRoute={memoryRoute}
          propsInfo={
            {
              ...omitHostFallback(propsInfo),
              basename,
              ...(beforeBridgeRenderRes as any)?.extraProps,
            } as T
          }
        />
      );
    };

    const render = async (info: RenderParams, hydrate = false) => {
      LoggerInstance.debug(`createBridgeComponent render Info`, info);
      const {
        moduleName,
        dom,
        basename,
        memoryRoute,
        rootOptions,
        snapshot: _snapshot,
        updates: _updates,
        signal,
        ...propsInfo
      } = info;
      if (signal?.aborted) return;
      const operationContext: BridgeOperationContext = {
        side: 'producer',
        framework: 'react',
        operation: rootMap.has(dom) ? 'update' : 'render',
        reason: 'direct',
      };

      const mergedRootOptions: CreateRootOptions | undefined = {
        ...defaultRootOptions,
        ...(rootOptions as CreateRootOptions),
      };
      const rootComponentWithErrorBoundary = createElement(
        { moduleName, basename, memoryRoute },
        propsInfo,
        info,
        operationContext,
      );

      if (hydrate && !rootMap.has(dom)) {
        let root: RootType;
        if (bridgeInfo.hydrate) {
          root = await bridgeInfo.hydrate(
            rootComponentWithErrorBoundary,
            dom,
            info as HydrateParams,
          );
          if (signal?.aborted) {
            if ('unmount' in root) root.unmount();
            return;
          }
        } else if (hydrateRoot) {
          root = hydrateRoot(
            dom,
            rootComponentWithErrorBoundary,
            mergedRootOptions,
          );
        } else {
          throw new Error(
            'This Bridge provider does not support hydration. Use the React 18 or React 19 entry point.',
          );
        }
        rootMap.set(dom, root);
      } else if (bridgeInfo.render) {
        const root = await Promise.resolve(
          bridgeInfo.render(rootComponentWithErrorBoundary, dom, info),
        );
        if (signal?.aborted) {
          if (root && 'unmount' in root) root.unmount();
          return;
        }
        rootMap.set(dom, root as RootType);
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
      instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info, {
        context: operationContext,
      }) || {};
    };

    return {
      render,
      hydrate: (info: HydrateParams) => render(info, true),
      // Absent for CSR-only providers: consumers use this capability to choose
      // SSR/fallback. The framework owns stream cancellation and data snapshots.
      ...(bridgeInfo.renderStream && {
        async renderStream(info: BridgeSSRRequest) {
          if (info.signal.aborted) throw info.signal.reason;
          const operationContext: BridgeOperationContext = {
            side: 'producer',
            framework: 'react',
            operation: 'render',
            reason: 'direct',
          };
          const app = createElement(info, info.props, info, operationContext);
          const result = await bridgeInfo.renderStream!(app, info);
          instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info, {
            context: operationContext,
          });
          return result;
        },
      }),

      destroy(info: DestroyParams) {
        const { dom } = info;
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(dom);
        const operationContext: BridgeOperationContext = {
          side: 'producer',
          framework: 'react',
          operation: 'destroy',
          reason: 'direct',
        };

        instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
          info,
          operationContext,
        );
        if (root) {
          if ('unmount' in root) {
            root.unmount();
          } else {
            LoggerInstance.warn('Root does not have unmount method');
          }
          rootMap.delete(dom);
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info, {
          context: operationContext,
        });
      },
    };
  };
}
