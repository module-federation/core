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
  BridgeComponentInstance,
} from '../../types';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { RouterContext } from '../context';
import { LoggerInstance } from '../../utils';
import { federationRuntime } from '../plugin';

export function createBaseBridgeComponent<T>({
  createRoot,
  defaultRootOptions,
  ...bridgeInfo
}: ProviderFnParams<T>) {
  return (): BridgeComponentInstance => {
    const rootMap = new Map<any, RootType>();
    const propsStateMap = new Map<any, { props: T; setState: (props: T) => void }>();
    const instance = federationRuntime.instance;
    LoggerInstance.debug(
      `createBridgeComponent instance from props >>>`,
      instance,
    );

    // Stateful wrapper component that can be updated without recreating the root
    const StatefulBridgeWrapper = ({ 
      initialProps, 
      appInfo, 
      fallback 
    }: { 
      initialProps: T; 
      appInfo: ProviderParams; 
      fallback?: React.ComponentType<FallbackProps>;
    }) => {
      const [props, setProps] = React.useState<T>(initialProps);
      const { moduleName, memoryRoute, basename = '/' } = appInfo;

      // Store the setState function for external updates
      React.useEffect(() => {
        const domElement = document.querySelector(`[data-module-name="${moduleName}"]`);
        if (domElement) {
          propsStateMap.set(domElement, { props, setState: setProps });
        }
      }, [moduleName, props]);

      const RawComponent = () => (
        <RouterContext.Provider value={{ moduleName, basename, memoryRoute }}>
          <bridgeInfo.rootComponent
            {...props}
            basename={basename}
          />
        </RouterContext.Provider>
      );

      return (
        <ErrorBoundary
          FallbackComponent={fallback as React.ComponentType<FallbackProps>}
        >
          <RawComponent />
        </ErrorBoundary>
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

        const finalProps = {
          ...propsInfo,
          basename,
          ...(beforeBridgeRenderRes as any)?.extraProps,
        } as T;

        // Add data attribute to identify the module
        dom.setAttribute('data-module-name', moduleName || 'unknown');

        // Check if we already have a root and can use rerender
        const existingState = propsStateMap.get(dom);
        if (existingState && bridgeInfo.rerender) {
          LoggerInstance.debug(`Using custom rerender for ${moduleName}`);
          bridgeInfo.rerender(finalProps);
          return;
        } else if (existingState) {
          LoggerInstance.debug(`Using state update for efficient rerender of ${moduleName}`);
          existingState.setState(finalProps);
          return;
        }

        // First render - create the root and component
        const rootComponentWithErrorBoundary = (
          <StatefulBridgeWrapper 
            initialProps={finalProps}
            appInfo={{ moduleName, basename, memoryRoute }}
            fallback={fallback as React.ComponentType<FallbackProps>}
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
        
        // Clean up state management
        propsStateMap.delete(dom);
        
        const root = rootMap.get(dom);
        if (root) {
          if ('unmount' in root) {
            root.unmount();
          } else {
            LoggerInstance.warn('Root does not have unmount method');
          }
          rootMap.delete(dom);
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
      },

      rerender(props: T) {
        LoggerInstance.debug(`Bridge rerender called with props:`, props);
        
        // If custom rerender is provided, use it
        if (bridgeInfo.rerender) {
          bridgeInfo.rerender(props);
          return;
        }

        // Otherwise, update all active instances
        propsStateMap.forEach(({ setState }) => {
          setState(props);
        });
      },
    };
  };
}
