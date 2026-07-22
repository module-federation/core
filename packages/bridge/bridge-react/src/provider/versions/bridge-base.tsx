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
  completeBridgeOperation,
  attachBridgeOperationContext,
  createBridgeId,
  createBridgeOperationContext,
  emitBridgeLifecycle,
  getAttachedBridgeOperationContext,
} from '@module-federation/bridge-shared';

class BridgeCommitObserver extends React.Component<{
  children: React.ReactNode;
  onCommit: () => void;
}> {
  componentDidMount() {
    this.props.onCommit();
  }

  componentDidUpdate() {
    this.props.onCommit();
  }

  render() {
    return this.props.children;
  }
}

export function createBaseBridgeComponent<T>({
  createRoot,
  defaultRootOptions,
  ...bridgeInfo
}: ProviderFnParams<T>) {
  return () => {
    const rootMap = new Map<any, RootType>();
    const bridgeIds = new WeakMap<object, string>();
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

    return {
      async render(info: RenderParams) {
        LoggerInstance.debug(`createBridgeComponent render Info`, info);
        const parentContext = getAttachedBridgeOperationContext(info);
        const bridgeId =
          parentContext?.bridgeId ||
          bridgeIds.get(info.dom) ||
          createBridgeId();
        bridgeIds.set(info.dom, bridgeId);
        const operation =
          parentContext?.operation ||
          (rootMap.has(info.dom) ? 'update' : 'render');
        const operationContext = createBridgeOperationContext({
          side: 'producer',
          framework: 'react',
          operation,
          bridgeId,
          moduleName: info.moduleName,
          parent: parentContext,
          reason: parentContext?.reason || 'direct',
        });
        emitBridgeLifecycle(
          instance,
          'beforeBridgeOperation',
          operationContext,
        );
        attachBridgeOperationContext(info, operationContext);

        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          rootOptions,
          ...propsInfo
        } = info;

        const mergedRootOptions: CreateRootOptions | undefined = {
          ...defaultRootOptions,
          ...(rootOptions as CreateRootOptions),
        };

        let routeContext:
          | ReturnType<typeof createBridgeOperationContext>
          | undefined;
        if (memoryRoute?.entryPath || basename) {
          routeContext = createBridgeOperationContext({
            side: 'producer',
            framework: 'react',
            operation: 'route-sync',
            bridgeId,
            moduleName,
            route: memoryRoute?.entryPath
              ? {
                  action: 'memory-route-init',
                  to: memoryRoute.entryPath,
                  basename,
                }
              : { action: 'basename-init', to: basename, basename },
          });
          emitBridgeLifecycle(instance, 'beforeBridgeOperation', routeContext);
        }

        let commitEmitted = false;
        const emitCommit = () => {
          if (commitEmitted) {
            return;
          }
          commitEmitted = true;
          emitBridgeLifecycle(
            instance,
            'afterBridgeCommit',
            completeBridgeOperation(operationContext, 'success'),
          );
          if (routeContext) {
            emitBridgeLifecycle(
              instance,
              'afterBridgeOperation',
              completeBridgeOperation(routeContext, 'success'),
            );
          }
        };

        try {
          const beforeBridgeRenderRes =
            instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(info) ||
            {};

          const rootComponentWithErrorBoundary = (
            <BridgeCommitObserver onCommit={emitCommit}>
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
            </BridgeCommitObserver>
          );

          emitBridgeLifecycle(
            instance,
            'bridgeRenderInvoked',
            operationContext,
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
          emitBridgeLifecycle(
            instance,
            'afterBridgeOperation',
            completeBridgeOperation(operationContext, 'success'),
          );
        } catch (error) {
          if (routeContext) {
            emitBridgeLifecycle(
              instance,
              'afterBridgeOperation',
              completeBridgeOperation(routeContext, 'error', error),
            );
          }
          emitBridgeLifecycle(
            instance,
            'afterBridgeOperation',
            completeBridgeOperation(operationContext, 'error', error),
          );
          throw error;
        }
      },

      destroy(info: DestroyParams) {
        const { dom } = info;
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(dom);
        const parentContext = getAttachedBridgeOperationContext(info);
        const operationContext = createBridgeOperationContext({
          side: 'producer',
          framework: 'react',
          operation: 'destroy',
          bridgeId:
            parentContext?.bridgeId || bridgeIds.get(dom) || createBridgeId(),
          moduleName: info.moduleName,
          parent: parentContext,
          reason: parentContext?.reason || 'direct',
        });
        emitBridgeLifecycle(
          instance,
          'beforeBridgeOperation',
          operationContext,
        );
        attachBridgeOperationContext(info, operationContext);
        try {
          instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(info);
          let outcome: 'success' | 'skipped' = 'skipped';
          if (root) {
            if ('unmount' in root) {
              root.unmount();
              outcome = 'success';
            } else {
              LoggerInstance.warn('Root does not have unmount method');
            }
            rootMap.delete(dom);
          }
          instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
          emitBridgeLifecycle(
            instance,
            'afterBridgeOperation',
            completeBridgeOperation(operationContext, outcome),
          );
        } catch (error) {
          emitBridgeLifecycle(
            instance,
            'afterBridgeOperation',
            completeBridgeOperation(operationContext, 'error', error),
          );
          throw error;
        }
      },
    };
  };
}
