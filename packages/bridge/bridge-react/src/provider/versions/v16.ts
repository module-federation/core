/**
 * Entry point for React 16/17 specific bridge components
 */
import type { ProviderFnParams } from '../../types';
import { createBaseBridgeComponent } from './bridge-base';
import ReactDOM from 'react-dom';

// 定义接口
export interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown, errorInfo: unknown) => void;
}

export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

/**
 * Creates a root for React 16/17 using legacy APIs
 */
export function createReact16Or17Root(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
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
 * 创建React 16/17桥接组件
 */
export function createBridgeComponent<T = any>(
  bridgeInfo: Omit<ProviderFnParams<T>, 'createRoot'>,
) {
  // 使用类型断言来处理createRoot
  const fullBridgeInfo = {
    ...bridgeInfo,
    createRoot: createReact16Or17Root,
  } as unknown as ProviderFnParams<T>;

  return createBaseBridgeComponent(fullBridgeInfo);
}
