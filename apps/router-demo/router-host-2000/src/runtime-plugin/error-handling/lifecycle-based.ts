/**
 * Lifecycle-based Error Handling Strategy
 *
 * This implementation demonstrates a more granular approach to error handling
 * by responding differently based on the lifecycle stage where the error occurred.
 *
 * Two main stages are handled:
 * 1. Component Loading (onLoad): Provides a UI fallback for component rendering failures
 * 2. Entry File Loading (afterResolve): Attempts to load from a backup service
 */

import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

interface LifecycleBasedConfig {
  backupEntryUrl?: string;
  errorMessage?: string;
}

export const createLifecycleBasedPlugin = (
  config: LifecycleBasedConfig = {},
): FederationRuntimePlugin => {
  const {
    backupEntryUrl = 'http://localhost:2002/mf-manifest.json',
    errorMessage = 'Module loading failed, please try again later',
  } = config;

  return {
    name: 'lifecycle-based-fallback-plugin',
    async errorLoadRemote(args) {
      // Handle component loading errors
      if (args.lifecycle === 'onLoad') {
        const React = await import('react');

        // Create a fallback component with error message
        const FallbackComponent = React.memo(() => {
          return React.createElement(
            'div',
            {
              style: {
                padding: '16px',
                border: '1px solid #ffa39e',
                borderRadius: '4px',
                backgroundColor: '#fff1f0',
                color: '#cf1322',
              },
            },
            errorMessage,
          );
        });

        FallbackComponent.displayName = 'ErrorFallbackComponent';

        return () => ({
          __esModule: true,
          default: FallbackComponent,
        });
      }

      // Handle entry file loading errors
      if (args.lifecycle === 'afterResolve') {
        try {
          // Try to load backup service
          const response = await fetch(backupEntryUrl);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch backup entry: ${response.statusText}`,
            );
          }
          const backupManifest = await response.json();
          console.info('Successfully loaded backup manifest');
          return backupManifest;
        } catch (error) {
          console.error('Failed to load backup manifest:', error);
          // If backup service also fails, return original error
          return args;
        }
      }

      return args;
    },
  };
};
