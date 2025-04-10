/**
 * Entry point for React 16/17 (legacy) specific bridge components
 * This file provides support for React 16 and 17 versions, using the traditional ReactDOM.render API
 */
import type { ProviderFnParams } from '../../types';
import { createBaseBridgeComponent } from './bridge-base';
import ReactDOM from 'react-dom';

export interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown, errorInfo: unknown) => void;
}

export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

export function createReact16Or17Root(
  container: Element | DocumentFragment,
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

export function createBridgeComponent<T = any>(
  bridgeInfo: Omit<ProviderFnParams<T>, 'createRoot'>,
) {
  const fullBridgeInfo = {
    ...bridgeInfo,
    createRoot: createReact16Or17Root,
  } as unknown as ProviderFnParams<T>;

  return createBaseBridgeComponent(fullBridgeInfo);
}
