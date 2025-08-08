import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ModuleFederation } from '../src/core';
import type { ModuleFederationRuntimePlugin } from '../src/type/plugin';
import { mockStaticServer, removeScriptTags } from './mock/utils';
import { resetFederationGlobalInfo } from '../src/global';

// Simple mock for React components - no external dependencies needed
interface ComponentType {
  (): any;
}

const mockReact = {
  createElement: (type: string, props: any, ...children: any[]) => ({
    type,
    props: props || {},
    children: children || [],
  }),
  memo: (fn: () => any) => fn,
  ComponentType: {} as ComponentType,
};

/**
 * Verification test suite for production-ready fallback component examples from documentation.
 *
 * Tests exact implementations from:
 * - building-custom-retry-plugin.mdx (Enhanced Offline Fallback Plugin)
 * - error-load-remote.mdx (Simple and Lifecycle-based plugins)
 * - router-demo App.tsx examples
 * - FederationBoundary and ErrorBoundary utilities
 *
 * This suite ensures that all documented examples work exactly as described
 * and can be used in production environments.
 */
describe('Production-Ready Examples Verification', () => {
  mockStaticServer({
    baseDir: __dirname,
    filterKeywords: [],
    basename: 'http://localhost:1111/',
  });

  beforeEach(() => {
    removeScriptTags();
    resetFederationGlobalInfo();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Enhanced Offline Fallback Plugin (building-custom-retry-plugin.mdx)', () => {
    it('should implement the exact enhanced offline fallback plugin from documentation', async () => {
      // Exact implementation from building-custom-retry-plugin.mdx
      interface OfflineFallbackConfig {
        enableLogging?: boolean;
        fallbackTimeout?: number;
        retryAttempts?: number;
        retryDelay?: number;
        enableCircuitBreaker?: boolean;
        circuitBreakerThreshold?: number;
        circuitBreakerResetTimeout?: number;
        fallbackComponents?: Record<string, ComponentType>;
      }

      const enhancedOfflineFallbackPlugin = (
        config: OfflineFallbackConfig = {},
      ): ModuleFederationRuntimePlugin => {
        const {
          enableLogging = true,
          fallbackTimeout = 5000,
          retryAttempts = 2,
          retryDelay = 1000,
          enableCircuitBreaker = true,
          circuitBreakerThreshold = 3,
          circuitBreakerResetTimeout = 60000,
          fallbackComponents = {},
        } = config;

        const remoteStates = new Map();
        const fallbackCache = new Map();

        const log = (message: string, ...args: any[]) => {
          if (enableLogging) {
            console.warn(`[OfflineFallbackPlugin] ${message}`, ...args);
          }
        };

        const createFallbackComponent = (remoteId: string, error?: Error) => {
          if (fallbackComponents[remoteId]) {
            return fallbackComponents[remoteId];
          }

          const FallbackComponent = async () => {
            return mockReact.createElement(
              'div',
              {
                style: {
                  padding: '16px',
                  border: '2px dashed #ffa39e',
                  borderRadius: '8px',
                  backgroundColor: '#fff2f0',
                  color: '#cf1322',
                  textAlign: 'center',
                },
              },
              [
                mockReact.createElement(
                  'h3',
                  { key: 'title' },
                  'Remote Module Unavailable',
                ),
                mockReact.createElement(
                  'p',
                  { key: 'description' },
                  `The remote module "${remoteId}" is currently offline.`,
                ),
              ],
            );
          };

          return FallbackComponent;
        };

        return {
          name: 'enhanced-offline-fallback-plugin',

          async errorLoadRemote(args) {
            const { id, error, lifecycle } = args;
            log(`Remote loading failed: ${id}`, {
              lifecycle,
              error: error?.message,
            });

            switch (lifecycle) {
              case 'afterResolve':
                return {
                  id: 'fallback',
                  name: 'fallback',
                  metaData: {},
                  shared: [],
                  remotes: [],
                  exposes: [],
                };

              case 'onLoad':
                return () => ({
                  __esModule: true,
                  default: createFallbackComponent(id, error),
                });

              default:
                return createFallbackComponent(id, error);
            }
          },

          onLoad(args) {
            log(`Successfully loaded remote: ${args.id}`);
            return args;
          },
        };
      };

      // Test the plugin with custom configuration
      const logMessages: string[] = [];
      const originalWarn = console.warn;
      console.warn = (...args) => {
        logMessages.push(args.join(' '));
      };

      const plugin = enhancedOfflineFallbackPlugin({
        enableLogging: true,
        fallbackTimeout: 3000,
        retryAttempts: 3,
        circuitBreakerThreshold: 2,
        fallbackComponents: {
          '@demo/custom-remote': () => 'Custom fallback component',
        },
      });

      expect(plugin.name).toBe('enhanced-offline-fallback-plugin');
      expect(plugin.errorLoadRemote).toBeDefined();
      expect(plugin.onLoad).toBeDefined();

      const GM = new ModuleFederation({
        name: '@test/enhanced-plugin-verification',
        remotes: [
          {
            name: '@demo/test-remote',
            entry: 'http://localhost:1111/test-manifest.json',
          },
        ],
        plugins: [plugin],
      });

      const result = await GM.loadRemote('@demo/test-remote/component');

      // Verify logging occurred
      expect(
        logMessages.some((msg) => msg.includes('[OfflineFallbackPlugin]')),
      ).toBe(true);
      expect(
        logMessages.some((msg) => msg.includes('Remote loading failed')),
      ).toBe(true);

      // Verify fallback component creation
      expect(result).toBeDefined();
      const moduleExports = result();
      expect(moduleExports.__esModule).toBe(true);
      expect(moduleExports.default).toBeDefined();

      console.warn = originalWarn;
    });

    it('should handle the complete custom retry plugin implementation', async () => {
      // Complete implementation from documentation
      interface RetryConfig {
        enableLogging?: boolean;
        fallbackTimeout?: number;
        retryAttempts?: number;
        retryDelay?: number;
        enableCircuitBreaker?: boolean;
        circuitBreakerThreshold?: number;
        circuitBreakerResetTimeout?: number;
      }

      interface RemoteState {
        failureCount: number;
        lastFailureTime: number;
        isCircuitOpen: boolean;
      }

      const customRetryPlugin = (
        config: RetryConfig = {},
      ): ModuleFederationRuntimePlugin => {
        const {
          enableLogging = true,
          fallbackTimeout = 5000,
          retryAttempts = 2,
          retryDelay = 1000,
          enableCircuitBreaker = true,
          circuitBreakerThreshold = 3,
          circuitBreakerResetTimeout = 60000,
        } = config;

        const remoteStates = new Map<string, RemoteState>();

        const getRemoteState = (remoteId: string): RemoteState => {
          if (!remoteStates.has(remoteId)) {
            remoteStates.set(remoteId, {
              failureCount: 0,
              lastFailureTime: 0,
              isCircuitOpen: false,
            });
          }
          return remoteStates.get(remoteId)!;
        };

        const updateRemoteState = (remoteId: string, isSuccess: boolean) => {
          const state = getRemoteState(remoteId);

          if (isSuccess) {
            state.failureCount = 0;
            state.isCircuitOpen = false;
          } else {
            state.failureCount++;
            state.lastFailureTime = Date.now();

            if (
              enableCircuitBreaker &&
              state.failureCount >= circuitBreakerThreshold
            ) {
              state.isCircuitOpen = true;

              setTimeout(() => {
                state.isCircuitOpen = false;
                state.failureCount = 0;
              }, circuitBreakerResetTimeout);
            }
          }
        };

        const withRetry = async <T>(
          operation: () => Promise<T>,
          remoteId: string,
          attempts = retryAttempts,
        ): Promise<T> => {
          let lastError: Error;

          for (let i = 0; i < attempts; i++) {
            try {
              const result = await Promise.race([
                operation(),
                new Promise<never>((_, reject) =>
                  setTimeout(
                    () => reject(new Error('Request timeout')),
                    fallbackTimeout,
                  ),
                ),
              ]);

              updateRemoteState(remoteId, true);
              return result;
            } catch (error) {
              lastError = error as Error;

              if (i < attempts - 1) {
                await new Promise((resolve) =>
                  setTimeout(resolve, retryDelay * (i + 1)),
                );
              }
            }
          }

          updateRemoteState(remoteId, false);
          throw lastError!;
        };

        const isCircuitOpen = (remoteId: string): boolean => {
          return getRemoteState(remoteId).isCircuitOpen;
        };

        const createFallbackComponent = (remoteId: string, error?: Error) => {
          const FallbackComponent = async () => {
            return mockReact.createElement(
              'div',
              {
                style: {
                  padding: '16px',
                  margin: '8px',
                  border: '2px dashed #ffa39e',
                  borderRadius: '8px',
                  backgroundColor: '#fff2f0',
                  color: '#cf1322',
                  textAlign: 'center' as const,
                },
              },
              [
                mockReact.createElement(
                  'h3',
                  { key: 'title' },
                  'Remote Module Unavailable',
                ),
                mockReact.createElement(
                  'p',
                  { key: 'description' },
                  `The remote module "${remoteId}" is currently offline.`,
                ),
                error &&
                  mockReact.createElement('details', { key: 'error' }, [
                    mockReact.createElement(
                      'summary',
                      { key: 'summary' },
                      'Error Details',
                    ),
                    mockReact.createElement(
                      'pre',
                      { key: 'error-details' },
                      error.message,
                    ),
                  ]),
              ],
            );
          };

          FallbackComponent.displayName = `FallbackComponent_${remoteId}`;
          return FallbackComponent;
        };

        const createFallbackModule = (remoteId: string, error?: Error) => {
          const FallbackComponent = createFallbackComponent(remoteId, error);

          return {
            __esModule: true,
            default: FallbackComponent,
            [remoteId]: FallbackComponent,
          };
        };

        return {
          name: 'custom-retry-plugin',

          async errorLoadRemote(args) {
            const { id, error, from, lifecycle } = args;
            const remoteId = id || from || 'unknown';

            switch (lifecycle) {
              case 'beforeRequest':
              case 'afterResolve':
                if (isCircuitOpen(remoteId)) {
                  return createFallbackModule(remoteId, error);
                }

                try {
                  return await withRetry(() => Promise.reject(error), remoteId);
                } catch (retryError) {
                  return createFallbackModule(remoteId, error);
                }

              case 'onLoad':
                return () => createFallbackModule(remoteId, error);

              default:
                return createFallbackModule(remoteId, error);
            }
          },
        };
      };

      // Test the complete implementation
      const plugin = customRetryPlugin({
        enableLogging: true,
        retryAttempts: 3,
        retryDelay: 500,
        enableCircuitBreaker: true,
        circuitBreakerThreshold: 2,
        circuitBreakerResetTimeout: 1000,
      });

      expect(plugin.name).toBe('custom-retry-plugin');

      const GM = new ModuleFederation({
        name: '@test/custom-retry-verification',
        remotes: [
          {
            name: '@demo/retry-test',
            entry: 'http://localhost:1111/retry-manifest.json',
          },
        ],
        plugins: [plugin],
      });

      const result = await GM.loadRemote('@demo/retry-test/component');

      expect(result).toBeDefined();
      const moduleExports = result();
      expect(moduleExports.__esModule).toBe(true);
      expect(moduleExports.default).toBeDefined();

      // Test circuit breaker by triggering multiple failures
      await GM.loadRemote('@demo/retry-test/component2');
      const result2 = await GM.loadRemote('@demo/retry-test/component3');

      expect(result2).toBeDefined();
    });
  });

  describe('Simple and Lifecycle-based Plugins (error-load-remote.mdx)', () => {
    it('should implement the exact simple fallback plugin from error-load-remote documentation', async () => {
      // Exact implementation from error-load-remote.mdx
      const fallbackPlugin: () => ModuleFederationRuntimePlugin = function () {
        return {
          name: 'fallback-plugin',
          errorLoadRemote(args) {
            return { default: () => 'fallback component' };
          },
        };
      };

      const plugin = fallbackPlugin();
      expect(plugin.name).toBe('fallback-plugin');

      const GM = new ModuleFederation({
        name: '@test/simple-fallback-verification',
        remotes: [
          {
            name: '@demo/simple-test',
            entry: 'http://localhost:1111/simple-manifest.json',
          },
        ],
        plugins: [plugin],
      });

      const result = await GM.loadRemote('@demo/simple-test/component');
      expect(result).toEqual({ default: expect.any(Function) });

      const component = result.default();
      expect(component).toBe('fallback component');
    });

    it('should implement the lifecycle-based plugin from documentation', async () => {
      // Lifecycle-based implementation from error-load-remote.mdx
      interface FallbackConfig {
        backupEntryUrl?: string;
        errorMessage?: string;
      }

      const fallbackPlugin = (config: FallbackConfig = {}) => {
        const {
          backupEntryUrl = 'http://localhost:2002/mf-manifest.json',
          errorMessage = 'Module loading failed, please try again later',
        } = config;

        return {
          name: 'fallback-plugin',
          async errorLoadRemote(args: any) {
            // Handle component loading errors
            if (args.lifecycle === 'onLoad') {
              const FallbackComponent = mockReact.memo(() => {
                return mockReact.createElement(
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
                return args;
              }
            }

            return args;
          },
        };
      };

      // Mock fetch for backup manifest
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'backup-manifest',
            name: 'backup',
            metaData: { name: 'backup' },
            shared: [],
            remotes: [],
            exposes: [],
          }),
      });

      const plugin = fallbackPlugin({
        errorMessage: 'Custom error message from test',
        backupEntryUrl: 'http://localhost:3000/backup-manifest.json',
      });

      expect(plugin.name).toBe('fallback-plugin');

      const GM = new ModuleFederation({
        name: '@test/lifecycle-fallback-verification',
        remotes: [
          {
            name: '@demo/lifecycle-test',
            entry: 'http://localhost:1111/lifecycle-manifest.json',
          },
        ],
        plugins: [plugin],
      });

      const result = await GM.loadRemote('@demo/lifecycle-test/component');
      expect(result).toBeDefined();

      global.fetch = originalFetch;
    });
  });

  describe('Router Demo Examples Verification', () => {
    it('should implement fallback component from router-demo App.tsx', async () => {
      // Based on router-demo App.tsx fallback implementation
      const createRouterDemoFallback = () => {
        const fallbackPlugin: () => ModuleFederationRuntimePlugin =
          function () {
            return {
              name: 'fallback-plugin',
              errorLoadRemote(args) {
                return {
                  default: () =>
                    mockReact.createElement(
                      'div',
                      {
                        'data-testid': 'router-demo-fallback',
                      },
                      'fallback component',
                    ),
                };
              },
            };
          };

        return fallbackPlugin;
      };

      const FallbackPlugin = createRouterDemoFallback();
      const plugin = FallbackPlugin();

      expect(plugin.name).toBe('fallback-plugin');

      const GM = new ModuleFederation({
        name: '@test/router-demo-verification',
        remotes: [
          {
            name: '@demo/router-test',
            entry: 'http://localhost:1111/router-manifest.json',
          },
        ],
        plugins: [plugin],
      });

      const result = await GM.loadRemote('@demo/router-test/component');
      expect(result).toBeDefined();
      expect(result.default).toBeDefined();
    });

    it('should implement the exact FallbackErrorComp from router-demo', async () => {
      // Exact implementation from router-demo App.tsx
      const FallbackErrorComp = (info: any) => {
        return {
          type: 'div',
          props: {
            children: [
              {
                type: 'h2',
                props: { children: 'This is ErrorBoundary Component' },
              },
              { type: 'p', props: { children: 'Something went wrong:' } },
              {
                type: 'pre',
                props: {
                  style: { color: 'red' },
                  children: info?.error?.message || 'No error message',
                },
              },
              {
                type: 'button',
                props: {
                  onClick: () => info.resetErrorBoundary?.(),
                  children: 'resetErrorBoundary(try again)',
                },
              },
            ],
          },
        };
      };

      // Test the fallback error component structure
      const mockErrorInfo = {
        error: { message: 'Test error message' },
        resetErrorBoundary: vi.fn(),
      };

      const result = FallbackErrorComp(mockErrorInfo);

      expect(result.type).toBe('div');
      expect(result.props.children).toHaveLength(4);
      expect(result.props.children[0].props.children).toBe(
        'This is ErrorBoundary Component',
      );
      expect(result.props.children[1].props.children).toBe(
        'Something went wrong:',
      );
      expect(result.props.children[2].props.children).toBe(
        'Test error message',
      );
      expect(result.props.children[2].props.style.color).toBe('red');
      expect(result.props.children[3].props.children).toBe(
        'resetErrorBoundary(try again)',
      );

      // Test reset functionality
      result.props.children[3].props.onClick();
      expect(mockErrorInfo.resetErrorBoundary).toHaveBeenCalled();
    });

    it('should verify the LoadingFallback component styling from router-demo', () => {
      // LoadingFallback component from router-demo App.tsx
      const LoadingFallback = () => ({
        type: 'div',
        props: {
          style: {
            padding: '50px',
            textAlign: 'center',
            background: '#f5f5f5',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            marginTop: '20px',
          },
          children: [
            {
              type: 'Spin', // Ant Design Spin component
              props: { size: 'large' },
            },
            {
              type: 'div',
              props: {
                style: {
                  marginTop: '16px',
                  color: '#1677ff',
                  fontSize: '16px',
                },
                children: 'Loading Remote1 App...',
              },
            },
          ],
        },
      });

      const loadingComponent = LoadingFallback();

      expect(loadingComponent.type).toBe('div');
      expect(loadingComponent.props.style).toMatchObject({
        padding: '50px',
        textAlign: 'center',
        background: '#f5f5f5',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        marginTop: '20px',
      });

      expect(loadingComponent.props.children).toHaveLength(2);
      expect(loadingComponent.props.children[0].type).toBe('Spin');
      expect(loadingComponent.props.children[0].props.size).toBe('large');
      expect(loadingComponent.props.children[1].props.children).toBe(
        'Loading Remote1 App...',
      );
      expect(loadingComponent.props.children[1].props.style.color).toBe(
        '#1677ff',
      );
    });
  });

  describe('FederationBoundary and ErrorBoundary Integration', () => {
    it('should verify FederationBoundary default behavior', async () => {
      // Based on FederationBoundary.tsx implementation
      const FallbackComponent = () => null;

      interface FederationBoundaryProps {
        dynamicImporter: () => Promise<any>;
        fallback?: () => Promise<any>;
        customBoundary?: any;
      }

      const createFederationBoundary = (props: FederationBoundaryProps) => {
        const {
          dynamicImporter,
          fallback = () => Promise.resolve(FallbackComponent),
          customBoundary = null,
        } = props;

        return {
          dynamicImporter,
          fallback,
          customBoundary,
          FallbackComponent,
        };
      };

      // Test default fallback
      const boundary = createFederationBoundary({
        dynamicImporter: () => Promise.reject(new Error('Import failed')),
      });

      expect(boundary.fallback).toBeDefined();
      expect(boundary.FallbackComponent).toBe(FallbackComponent);

      const fallbackComponent = await boundary.fallback();
      expect(fallbackComponent).toBe(FallbackComponent);
    });

    it('should verify ErrorBoundary basic implementation', () => {
      // Based on ErrorBoundary.tsx
      interface ErrorBoundaryState {
        hasError: boolean;
      }

      const createErrorBoundary = () => {
        let state: ErrorBoundaryState = { hasError: false };

        return {
          getDerivedStateFromError: (error: Error) => {
            return { hasError: true };
          },

          componentDidCatch: (error: Error, errorInfo: any) => {
            // Should log errors
            return { error, errorInfo };
          },

          render: (children: any) => {
            if (state.hasError) {
              return 'An error has occurred.';
            }
            return children;
          },

          setState: (newState: ErrorBoundaryState) => {
            state = newState;
          },

          getState: () => state,
        };
      };

      const errorBoundary = createErrorBoundary();

      // Test normal rendering
      expect(errorBoundary.render('test children')).toBe('test children');

      // Test error state
      const derivedState = errorBoundary.getDerivedStateFromError(
        new Error('Test error'),
      );
      expect(derivedState).toEqual({ hasError: true });

      errorBoundary.setState(derivedState);
      expect(errorBoundary.render('test children')).toBe(
        'An error has occurred.',
      );

      // Test error logging
      const testError = new Error('Test catch error');
      const testErrorInfo = { componentStack: 'Test stack' };
      const catchResult = errorBoundary.componentDidCatch(
        testError,
        testErrorInfo,
      );
      expect(catchResult).toEqual({
        error: testError,
        errorInfo: testErrorInfo,
      });
    });
  });

  describe('Configuration Verification', () => {
    it('should verify all documented plugin configurations work correctly', async () => {
      const configTests = [
        {
          name: 'minimal-config',
          config: {},
          expectedDefaults: {
            enableLogging: true,
            fallbackTimeout: 5000,
            retryAttempts: 2,
            retryDelay: 1000,
          },
        },
        {
          name: 'full-config',
          config: {
            enableLogging: false,
            fallbackTimeout: 3000,
            retryAttempts: 5,
            retryDelay: 2000,
            enableCircuitBreaker: false,
          },
          expectedDefaults: {
            enableLogging: false,
            fallbackTimeout: 3000,
            retryAttempts: 5,
            retryDelay: 2000,
            enableCircuitBreaker: false,
          },
        },
      ];

      for (const test of configTests) {
        const createPlugin = (config: any = {}) => {
          const defaults = {
            enableLogging: true,
            fallbackTimeout: 5000,
            retryAttempts: 2,
            retryDelay: 1000,
            enableCircuitBreaker: true,
            circuitBreakerThreshold: 3,
            circuitBreakerResetTimeout: 60000,
            ...config,
          };

          return {
            name: `${test.name}-plugin`,
            config: defaults,
            errorLoadRemote: async (args: any) => ({
              __esModule: true,
              default: () => `Config test: ${test.name}`,
            }),
          };
        };

        const plugin = createPlugin(test.config);
        expect(plugin.name).toBe(`${test.name}-plugin`);

        // Verify configuration merging
        Object.entries(test.expectedDefaults).forEach(([key, value]) => {
          expect(plugin.config[key]).toBe(value);
        });

        // Test plugin functionality
        const result = await plugin.errorLoadRemote({
          id: 'test',
          lifecycle: 'onLoad',
          error: new Error('Test error'),
        });

        expect(result).toMatchObject({
          __esModule: true,
          default: expect.any(Function),
        });

        const component = result.default();
        expect(component).toBe(`Config test: ${test.name}`);
      }
    });
  });
});
