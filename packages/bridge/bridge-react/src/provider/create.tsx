import * as React from 'react';
import ReactDOM from 'react-dom';
import type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  CreateRootOptions,
} from '../types';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { RouterContext } from './context';
import { LoggerInstance } from '../utils';
import { federationRuntime } from './plugin';

/**
 * Default createRoot function that automatically detects React version and uses the appropriate API(only support React 16/17, 18)
 *
 * Note: Users can also directly import version-specific bridge components:
 * - import { createBridgeComponent } from '@module-federation/bridge-react/legacy'
 * - import { createBridgeComponent } from '@module-federation/bridge-react/v18'
 * - import { createBridgeComponent } from '@module-federation/bridge-react/v19'
 */
function defaultCreateRoot(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): {
  render(children: React.ReactNode): void;
  unmount(): void;
} {
  const reactVersion = ReactDOM.version || '';
  const isReact18 = reactVersion.startsWith('18');
  const isReact19 = reactVersion.startsWith('19');

  // For React 19, throw error and suggest using version-specific import
  if (isReact19) {
    throw new Error(
      `React 19 detected. The default export is not compatible with React 19. ` +
        `Please use the version-specific import instead: ` +
        `import { createBridgeComponent } from '@module-federation/bridge-react/v19'`,
    );
  }

  // For React 18, use createRoot API
  if (isReact18) {
    try {
      // @ts-ignore - Types will be available in React 18
      return (ReactDOM as any).createRoot(container, options);
    } catch (e) {
      console.warn(
        'Failed to use React 18 createRoot API, falling back to legacy API',
        e,
      );
    }
  }

  // For React 16/17, use legacy API
  return {
    render(children: React.ReactNode) {
      // @ts-ignore - React 17's render method is deprecated but still functional
      ReactDOM.render(children, container);
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container as Element);
    },
  };
}

/**
 * Creates a bridge component factory that automatically detects and uses
 * the appropriate React version (16/17, 18, or 19)
 */
export function createBridgeComponent<T>({
  createRoot = defaultCreateRoot,
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

        // Merge default root options with render-specific root options
        const mergedRootOptions: CreateRootOptions | undefined = {
          ...defaultRootOptions,
          ...(rootOptions as CreateRootOptions),
        };

        const beforeBridgeRenderRes =
          instance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(info) || {};

        const rootComponentWithErrorBoundary = (
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
                  ...(beforeBridgeRenderRes as any)?.extraProps,
                } as T
              }
            />
          </ErrorBoundary>
        );

        let root = rootMap.get(dom);
        // Do not call createRoot multiple times
        if (!root) {
          root = createRoot(dom, mergedRootOptions);
          rootMap.set(dom, root);
        }

        if ('render' in root) {
          root.render(rootComponentWithErrorBoundary);
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
            ReactDOM.unmountComponentAtNode(dom as HTMLElement);
          }
          rootMap.delete(dom);
        }
        instance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
      },
    };
  };
}
