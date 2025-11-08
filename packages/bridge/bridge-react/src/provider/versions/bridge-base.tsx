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
} from '../../types';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { RouterContext } from '../context';
import { LoggerInstance } from '../../utils';
import { federationRuntime } from '../plugin';

export function createBaseBridgeComponent<T>({
  createRoot,
  defaultRootOptions,
  rerender,
  ...bridgeInfo
}: ProviderFnParams<T>) {
  return () => {
    const rootMap = new Map<any, RootType>();
    const componentStateMap = new Map<any, React.ReactElement>();
    const propsStateMap = new Map<any, any>();
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

    return {
      async render(info: RenderParams) {
        LoggerInstance.debug(`createBridgeComponent render Info`, info);
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          fallback,
          rootOptions,
          ...propsInfo
        } = info;

        const mergedRootOptions: CreateRootOptions | undefined = {
          ...defaultRootOptions,
          ...(rootOptions as CreateRootOptions),
        };

        const beforeBridgeRenderRes =
          instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(info) || {};
        const getExtraProps = (
          x: unknown,
        ): Record<string, unknown> | undefined => {
          if (x && typeof x === 'object' && 'extraProps' in (x as object)) {
            const { extraProps } = x as {
              extraProps?: Record<string, unknown>;
            };
            return extraProps;
          }
          return undefined;
        };

        // Build a stable element tree using stable component types
        const buildElement = (params: {
          moduleName: typeof moduleName;
          basename?: typeof basename;
          memoryRoute: typeof memoryRoute;
          fallback?: typeof fallback;
          propsInfo: typeof propsInfo;
        }) => (
          <ErrorBoundary
            FallbackComponent={
              params.fallback as React.ComponentType<FallbackProps>
            }
          >
            <RawComponent
              appInfo={{
                moduleName: params.moduleName,
                basename: params.basename,
                memoryRoute: params.memoryRoute,
              }}
              propsInfo={
                {
                  ...params.propsInfo,
                  basename: params.basename,
                  ...getExtraProps(beforeBridgeRenderRes),
                } as T
              }
            />
          </ErrorBoundary>
        );

        const rootComponentWithErrorBoundary = buildElement({
          moduleName,
          basename,
          memoryRoute,
          fallback,
          propsInfo,
        });

        // Determine if we already have a root for this DOM node
        let root = rootMap.get(dom);
        const hasRender = (
          r: RootType | undefined,
        ): r is RootType & { render: (children: React.ReactNode) => void } =>
          !!r && typeof (r as any).render === 'function';
        const existingComponent = componentStateMap.get(dom);

        if (!root) {
          // Initial render: create or obtain a root once
          if (bridgeInfo.render) {
            root = (await Promise.resolve(
              bridgeInfo.render(rootComponentWithErrorBoundary, dom),
            )) as RootType;
            rootMap.set(dom, root);
            // If the custom render implementation already performed a render,
            // do not call render again below when root lacks a render method.
            if (hasRender(root)) {
              root.render(rootComponentWithErrorBoundary);
            }
          } else {
            if (!root && createRoot) {
              root = createRoot(dom, mergedRootOptions);
              rootMap.set(dom, root as any);
            }

            if (hasRender(root)) {
              root.render(rootComponentWithErrorBoundary);
            }
          }

          // Store initial component and props for future rerender detection
          componentStateMap.set(dom, rootComponentWithErrorBoundary);
          propsStateMap.set(dom, info);
        } else {
          // Rerender path (we have an existing root)
          // Check if we have a custom rerender function and this is a rerender (not initial render)
          if (rerender && existingComponent && root) {
            LoggerInstance.debug(
              `createBridgeComponent custom rerender >>>`,
              info,
            );

            // Call the custom rerender function
            const rerenderResult = rerender(info);
            const shouldRecreate = rerenderResult?.shouldRecreate ?? false;

            if (!shouldRecreate) {
              // Use custom rerender logic - update props without recreating the component tree
              LoggerInstance.debug(
                `createBridgeComponent preserving component state >>>`,
                info,
              );

              // Build updated element with stable component identities
              const {
                moduleName: updatedModuleName,
                basename: updatedBasename,
                memoryRoute: updatedMemoryRoute,
                fallback: updatedFallback,
                ...updatedPropsInfo
              } = info;

              const updatedRootComponentWithErrorBoundary = buildElement({
                moduleName: updatedModuleName,
                basename: updatedBasename,
                memoryRoute: updatedMemoryRoute,
                fallback: updatedFallback,
                propsInfo: updatedPropsInfo,
              });

              // Store the new props and updated component
              propsStateMap.set(dom, info);
              componentStateMap.set(dom, updatedRootComponentWithErrorBoundary);

              // Update the React tree with new props.
              // Prefer root.render when available; otherwise fall back to invoking custom render again
              // to preserve compatibility with implementations that return a handle without `render`.
              if (hasRender(root)) {
                root.render(updatedRootComponentWithErrorBoundary);
              } else if (bridgeInfo.render) {
                const newRoot = (await Promise.resolve(
                  bridgeInfo.render(updatedRootComponentWithErrorBoundary, dom),
                )) as RootType;
                rootMap.set(dom, newRoot);
              }
            } else {
              // Custom rerender function requested recreation - unmount and recreate
              LoggerInstance.debug(
                `createBridgeComponent recreating component due to shouldRecreate: true >>>`,
                info,
              );

              // Emit destroy lifecycle hooks around recreation
              try {
                instance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
                  info,
                );
              } catch (e) {
                LoggerInstance.warn('beforeBridgeDestroy hook failed', e);
              }

              // Unmount the existing root to reset all state
              if (root && 'unmount' in root) {
                root.unmount();
                LoggerInstance.debug(
                  `createBridgeComponent unmounted existing root >>>`,
                  info,
                );
              }

              try {
                instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
              } catch (e) {
                LoggerInstance.warn('afterBridgeDestroy hook failed', e);
              }

              // Remove the old root from the map
              rootMap.delete(dom);

              // Create a fresh root
              let newRoot: RootType | null = null;
              const {
                moduleName: recreateModuleName,
                basename: recreateBasename,
                memoryRoute: recreateMemoryRoute,
                fallback: recreateFallback,
                ...recreatePropsInfo
              } = info;

              const recreateRootComponentWithErrorBoundary = buildElement({
                moduleName: recreateModuleName,
                basename: recreateBasename,
                memoryRoute: recreateMemoryRoute,
                fallback: recreateFallback,
                propsInfo: recreatePropsInfo,
              });

              if (bridgeInfo.render) {
                newRoot = (await Promise.resolve(
                  bridgeInfo.render(
                    recreateRootComponentWithErrorBoundary,
                    dom,
                  ),
                )) as RootType;
                rootMap.set(dom, newRoot);
                LoggerInstance.debug(
                  `createBridgeComponent created fresh root via custom render >>>`,
                  info,
                );
              } else if (createRoot) {
                newRoot = createRoot(dom, mergedRootOptions);
                rootMap.set(dom, newRoot);
                LoggerInstance.debug(
                  `createBridgeComponent created fresh root >>>`,
                  info,
                );
              }

              // Render with the new root
              if (hasRender(newRoot)) {
                newRoot.render(recreateRootComponentWithErrorBoundary);
              }

              // Update state maps with new component
              componentStateMap.set(
                dom,
                recreateRootComponentWithErrorBoundary,
              );
              propsStateMap.set(dom, info);
            }
          } else {
            // No custom rerender provided; render into existing root or
            // fall back to calling the custom render once more if the handle lacks `render`.
            if (hasRender(root)) {
              root.render(rootComponentWithErrorBoundary);
            } else if (bridgeInfo.render) {
              const refreshedRoot = (await Promise.resolve(
                bridgeInfo.render(rootComponentWithErrorBoundary, dom),
              )) as RootType;
              rootMap.set(dom, refreshedRoot);
            }

            // Update component/props state
            componentStateMap.set(dom, rootComponentWithErrorBoundary);
            propsStateMap.set(dom, info);
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
        // Clean up component state maps
        componentStateMap.delete(dom);
        propsStateMap.delete(dom);
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
      },
    };
  };
}
