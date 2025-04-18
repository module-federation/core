/**
 * Entry point for React 19 specific bridge components
 * This file provides support for React 19 version, using the new ReactDOM.createRoot API
 */
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBaseBridgeComponent } from './bridge-base';
import type { ProviderFnParams } from '../../types';
export interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown, errorInfo: unknown) => void;
  transitionCallbacks?: unknown;
}

export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

export function createReact19Root(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  return createRoot(container as Element, options);
}

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

export function createBridgeComponent<T = any>(
  bridgeInfo: Omit<ProviderFnParams<T>, 'createRoot'>,
) {
  const fullBridgeInfo = {
    createRoot: createReact19Root,
    ...bridgeInfo,
  } as unknown as ProviderFnParams<T>;

  return createBaseBridgeComponent(fullBridgeInfo);
}
