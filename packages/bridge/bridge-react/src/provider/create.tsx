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
 * 默认的createRoot函数，会自动检测React版本并使用相应的API
 *
 * 注意：用户也可以通过以下方式直接导入特定版本的桥接组件：
 * - import { createBridgeComponent } from '@module-federation/bridge-react/v16'
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
  // 检测React版本
  const reactVersion = ReactDOM.version || '';
  const isReact19 = reactVersion.startsWith('19');
  const isReact18 = reactVersion.startsWith('18');

  // 对于React 19，尝试使用react-dom/client
  if (isReact19) {
    try {
      // 动态导入react-dom/client
      // 注意：这里使用了一个技巧来避免在编译时静态分析这个导入
      const ReactDOMClient = Function('return import("react-dom/client")')();
      return {
        render(children: React.ReactNode) {
          ReactDOMClient.then((client: any) => {
            const root = client.createRoot(container, options);
            root.render(children);
          });
        },
        unmount() {
          ReactDOMClient.then((client: any) => {
            const root = client.createRoot(container, options);
            root.unmount();
          });
        },
      };
    } catch (e) {
      console.warn(
        'Failed to import react-dom/client, falling back to React 18 API',
        e,
      );
    }
  }

  // 对于React 18，使用createRoot API
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

  // 对于React 16/17，使用legacy API
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
        // do not call createRoot multiple times
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
