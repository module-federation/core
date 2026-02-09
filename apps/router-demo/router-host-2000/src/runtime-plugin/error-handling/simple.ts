/**
 * Simple Error Handling Strategy
 *
 * This implementation provides a straightforward approach to error handling
 * by using a single fallback component for all types of errors.
 *
 * Benefits:
 * - Simple to understand and implement
 * - Consistent error presentation
 * - Requires minimal configuration
 *
 * Use this when you don't need different handling strategies for different error types.
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

interface SimpleConfig {
  errorMessage?: string;
}

export const createSimplePlugin = (
  config: SimpleConfig = {},
): ModuleFederationRuntimePlugin => {
  const { errorMessage = 'Module loading failed, please try again later' } =
    config;

  return {
    name: 'simple-fallback-plugin',
    async errorLoadRemote() {
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
          // Keep copy in sync with cypress expectations.
          React.createElement('p', null, 'Something went wrong'),
          React.createElement('pre', null, errorMessage),
        );
      });

      FallbackComponent.displayName = 'ErrorFallbackComponent';

      return () => ({
        __esModule: true,
        default: FallbackComponent,
      });
    },
  };
};
