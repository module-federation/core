/**
 * Base bridge component implementation
 * This file contains bridge component logic shared across all React versions
 */
import * as React from 'react';
import {
  emitBridgeLifecycle,
  type BridgeOperationContext,
} from '@module-federation/bridge-shared';
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
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          rootOptions,
          ...propsInfo
        } = info;
        const operationContext: BridgeOperationContext = {
          side: 'producer',
          framework: 'react',
          operation: rootMap.has(dom) ? 'update' : 'render',
          target: dom,
          moduleName,
          reason: 'direct',
        };

        try {
          const mergedRootOptions: CreateRootOptions | undefined = {
            ...defaultRootOptions,
            ...(rootOptions as CreateRootOptions),
          };

          const beforeBridgeRenderRes =
            instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
              info,
              operationContext,
            ) || {};

          const rootComponentWithErrorBoundary = (
            <BridgeCommitObserver
              onCommit={() =>
                emitBridgeLifecycle(
                  instance,
                  'afterBridgeCommit',
                  operationContext,
                )
              }
            >
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

          let renderResult: unknown;
          if (bridgeInfo.render) {
            renderResult = await Promise.resolve(
              bridgeInfo.render(rootComponentWithErrorBoundary, dom),
            );
            rootMap.set(dom, renderResult as RootType);
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
            renderResult = root;
          }
          instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info, {
            context: operationContext,
            result: renderResult,
          }) || {};
        } catch (error) {
          try {
            instance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info, {
              context: operationContext,
              error,
            });
          } catch {
            // Preserve the original Bridge render error.
          }
          throw error;
        }
      },

      destroy(info: DestroyParams) {
        const { dom } = info;
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(dom);
        const operationContext: BridgeOperationContext = {
          side: 'producer',
          framework: 'react',
          operation: 'destroy',
          target: dom,
          moduleName: info.moduleName,
          reason: 'direct',
        };

        try {
          instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
            info,
            operationContext,
          );
          let destroyed = false;
          if (root) {
            if ('unmount' in root) {
              root.unmount();
              destroyed = true;
            } else {
              LoggerInstance.warn('Root does not have unmount method');
            }
            rootMap.delete(dom);
          }
          instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info, {
            context: operationContext,
            result: destroyed,
          });
        } catch (error) {
          try {
            instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info, {
              context: operationContext,
              error,
            });
          } catch {
            // Preserve the original Bridge destroy error.
          }
          throw error;
        }
      },
    };
  };
}
