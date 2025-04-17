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
  return {
    render(children: React.ReactNode) {
      /**
       * Detect React version
       */
      const reactVersion = ReactDOM.version || '';
      const isReact18 = reactVersion.startsWith('18');
      const isReact19 = reactVersion.startsWith('19');

      /**
       * Throw error for React 19
       *
       * Note: Due to Module Federation sharing mechanism, the actual version detected here
       * might be 18 or 19, even if the application itself uses React 16/17.
       * This happens because in MF environments, different remote modules may share different React versions.
       * The console may throw warnings about version and API mismatches. If you need to resolve these issues,
       * consider disabling the shared configuration for React.
       */
      if (isReact19) {
        throw new Error(
          `React 19 detected in legacy mode. This is not supported. ` +
            `Please use the version-specific import: ` +
            `import { createBridgeComponent } from '@module-federation/bridge-react/v19'`,
        );
      }

      /**
       * Provide warning for React 18
       */
      if (isReact18) {
        console.warn(
          `[Bridge-React] React 18 detected in legacy mode. ` +
            `For better compatibility, please use the version-specific import: ` +
            `import { createBridgeComponent } from '@module-federation/bridge-react/v18'`,
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
