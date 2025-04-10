/**
 * Entry point for React 18 specific bridge components
 */
import type { ProviderFnParams } from '../../types';
import { createBaseBridgeComponent } from './bridge-base';
import ReactDOM from 'react-dom';

// 定义接口
export interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown) => void;
  transitionCallbacks?: unknown;
}

export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

/**
 * Creates a root for React 18 using ReactDOM.createRoot
 */
export function createReact18Root(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  // @ts-ignore - Types will be available in React 18
  return (ReactDOM as any).createRoot(container, options);
}

/**
 * 创建React 18桥接组件
 */
export function createBridgeComponent<T = any>(
  bridgeInfo: Omit<ProviderFnParams<T>, 'createRoot'>,
) {
  const fullBridgeInfo = {
    ...bridgeInfo,
    createRoot: createReact18Root,
  } as unknown as ProviderFnParams<T>;

  return createBaseBridgeComponent(fullBridgeInfo);
}
