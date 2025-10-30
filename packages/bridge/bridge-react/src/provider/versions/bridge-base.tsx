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

        const BridgeWrapper = ({ basename }: { basename?: string }) => (
          <ErrorBoundary
            FallbackComponent={fallback as React.ComponentType<FallbackProps>}
          >
            <RawComponent
              appInfo={{
                moduleName,
                basename,
                memoryRoute,
              }}
              propsInfo={
                {
                  ...propsInfo,
                  basename,
                  ...(beforeBridgeRenderRes as any)?.extraProps,
                } as T
              }
            />
          </ErrorBoundary>
        );

        const rootComponentWithErrorBoundary = (
          <BridgeWrapper basename={basename} />
        );

        if (bridgeInfo.render) {
          await Promise.resolve(
            bridgeInfo.render(rootComponentWithErrorBoundary, dom),
          ).then((root: RootType) => rootMap.set(dom, root));
        } else {
          let root = rootMap.get(dom);
          const existingComponent = componentStateMap.get(dom);

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

              // Store the new props but don't recreate the component
              propsStateMap.set(dom, info);
              componentStateMap.set(dom, rootComponentWithErrorBoundary);

              // Still need to call root.render to update the React tree with new props
              // but the custom rerender function can control how this happens
              if (root && 'render' in root) {
                root.render(rootComponentWithErrorBoundary);
              }
            } else {
              // Custom rerender function requested recreation - unmount and recreate
              LoggerInstance.debug(
                `createBridgeComponent recreating component due to shouldRecreate: true >>>`,
                info,
              );

              // Unmount the existing root to reset all state
              if (root && 'unmount' in root) {
                root.unmount();
                LoggerInstance.debug(
                  `createBridgeComponent unmounted existing root >>>`,
                  info,
                );
              }

              // Remove the old root from the map
              rootMap.delete(dom);

              // Create a fresh root
              if (createRoot) {
                const newRoot = createRoot(dom, mergedRootOptions);
                rootMap.set(dom, newRoot as any);
                LoggerInstance.debug(
                  `createBridgeComponent created fresh root >>>`,
                  info,
                );

                // Render with the new root
                if (newRoot && 'render' in newRoot) {
                  newRoot.render(rootComponentWithErrorBoundary);
                }
              }

              // Update state maps with new component
              componentStateMap.set(dom, rootComponentWithErrorBoundary);
              propsStateMap.set(dom, info);
            }
          } else {
            // Initial render or no custom rerender function
            // Do not call createRoot multiple times
            if (!root && createRoot) {
              root = createRoot(dom, mergedRootOptions);
              rootMap.set(dom, root as any);
            }

            if (root && 'render' in root) {
              root.render(rootComponentWithErrorBoundary);
            }

            // Store the component and props for future rerender detection
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
