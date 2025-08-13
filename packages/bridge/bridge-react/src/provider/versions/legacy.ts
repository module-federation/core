/**
 * Entry point for React 16/17 (legacy) specific bridge components
 * This file provides support for React 16 and 17 versions, using the traditional ReactDOM.render API
 */
import type { ProviderFnParams } from '../../types';
import { createBaseBridgeComponent } from './bridge-base';
import ReactDOM from 'react-dom';
import React from 'react';

export interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown, errorInfo: unknown) => void;
}

export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

/**
 * Default createRoot function that automatically detects React version and uses the appropriate API(only support React 16/17, 18)
 *
 * Note: Users can also directly import version-specific bridge components:
 * - import { createBridgeComponent } from '@module-federation/bridge-react'
 * - import { createBridgeComponent } from '@module-federation/bridge-react/v18'
 * - import { createBridgeComponent } from '@module-federation/bridge-react/v19'
 */

export function createReact16Or17Root(
  container: Element | DocumentFragment,
): Root {
  /**
   * Detect React version
   */
  const reactVersion = ReactDOM.version || '';
  const isReact18Plus =
    reactVersion.startsWith('18') || reactVersion.startsWith('19');

  if (isReact18Plus) {
    // For React 18+, use the modern createRoot API
    let modernRoot: any = null;

    return {
      render(children: React.ReactNode) {
        if (!modernRoot) {
          try {
            // Import createRoot dynamically to avoid issues if not available
            const { createRoot } = require('react-dom/client');
            modernRoot = createRoot(container);
          } catch (error) {
            // Fallback to legacy API if createRoot is not available
            // @ts-ignore - React 17's render method is deprecated but still functional
            ReactDOM.render(children, container);
            return;
          }
        }
        modernRoot.render(children);
      },
      unmount() {
        if (modernRoot) {
          modernRoot.unmount();
        } else {
          ReactDOM.unmountComponentAtNode(container as Element);
        }
      },
    };
  }

  // For React 16/17, use the legacy API
  return {
    render(children: React.ReactNode) {
      /**
       * Provide warning for non-test environments to suggest version-specific imports
       */
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          `[Bridge-React] React 16/17 detected. ` +
            `For better compatibility, consider using version-specific imports: ` +
            `import { createBridgeComponent } from '@module-federation/bridge-react/v18' or v19`,
        );
      }

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
    createRoot: createReact16Or17Root,
    ...bridgeInfo,
  } as unknown as ProviderFnParams<T>;

  return createBaseBridgeComponent(fullBridgeInfo);
}
