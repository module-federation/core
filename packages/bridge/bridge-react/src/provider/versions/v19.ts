/**
 * Entry point for React 19 specific bridge components
 */
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBaseBridgeComponent } from './bridge-base';
import type { ProviderFnParams } from '../../types';

// 定义接口
export interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown, errorInfo: unknown) => void;
  transitionCallbacks?: unknown;
}

export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

/**
 * 创建React 19根节点
 *
 * 注意：React 19使用与React 18相同的API
 */
export function createReact19Root(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  // 使用类型断言解决DocumentFragment类型不兼容问题
  return createRoot(container as Element, options);
}

/**
 * 使用React 19的hydrateRoot进行水合
 */
export function hydrateReact19Root(
  container: Element | DocumentFragment,
  initialChildren: React.ReactNode,
  options?: CreateRootOptions,
): Root {
  return hydrateRoot(
    container as Element,
    initialChildren as React.ReactElement,
    options,
  );
}

/**
 * 创建React 19桥接组件
 *
 * 注意：此文件直接使用createBaseBridgeComponent，不再依赖version-specific.tsx
 */
export function createBridgeComponent<T = any>(
  bridgeInfo: Omit<ProviderFnParams<T>, 'createRoot'>,
) {
  // 使用类型断言来处理createRoot
  const fullBridgeInfo = {
    ...bridgeInfo,
    createRoot: createReact19Root,
  } as unknown as ProviderFnParams<T>;

  return createBaseBridgeComponent(fullBridgeInfo);
}
