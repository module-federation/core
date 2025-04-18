/**
 * Entry point for React 18 specific bridge components
 */
import React from 'react';
import { createRoot as createReactRoot, hydrateRoot } from 'react-dom/client';
import { createBaseBridgeComponent } from './bridge-base';
import type { ProviderFnParams } from '../../types';

export interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown, errorInfo: unknown) => void;
}

export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

export function createReact18Root(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  return createReactRoot(container, options);
}

export function hydrateReact18Root(
  container: Element | DocumentFragment,
  initialChildren: React.ReactNode,
  options?: CreateRootOptions,
) {
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
    createRoot: createReact18Root,
    ...bridgeInfo,
  } as unknown as ProviderFnParams<T>;

  return createBaseBridgeComponent(fullBridgeInfo);
}
