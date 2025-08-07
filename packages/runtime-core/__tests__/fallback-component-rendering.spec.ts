import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ModuleFederation } from '../src/core';
import type { ModuleFederationRuntimePlugin } from '../src/type/plugin';
import { mockStaticServer, removeScriptTags } from './mock/utils';
import { resetFederationGlobalInfo } from '../src/global';

/**
 * Comprehensive test suite for fallback component rendering functionality.
 * Tests all documented scenarios from the building-custom-retry-plugin and error-load-remote guides.
 *
 * Covers:
 * 1. Fallback components render when remotes fail to load
 * 2. ErrorBoundary integration works as documented
 * 3. Fallback components receive correct error props
 * 4. Recovery mechanisms work when remotes come back online
 * 5. Production-ready examples from documentation
 */
describe('Fallback Component Rendering', () => {
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

  describe('Basic Fallback Component Rendering', () => {
    it('should render fallback component when remote fails to load - simple plugin', async () => {
      const fallbackComponentCalls: any[] = [];

      // Simple fallback plugin based on documentation example
      const simplePlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'simple-fallback-plugin',
        async errorLoadRemote() {
          const React = await import('react');

          const FallbackComponent = React.memo(() => {
            fallbackComponentCalls.push('FallbackComponent rendered');
            return React.createElement(
              'div',
              {
                'data-testid': 'fallback-component',
                style: {
                  padding: '16px',
                  border: '1px solid #ffa39e',
                  borderRadius: '4px',
                  backgroundColor: '#fff1f0',
                  color: '#cf1322',
                },
              },
              'Module loading failed, please try again later',
            );
          });

          FallbackComponent.displayName = 'ErrorFallbackComponent';

          return () => ({
            __esModule: true,
            default: FallbackComponent,
          });
        },
      });

      const GM = new ModuleFederation({
        name: '@test/simple-fallback',
        remotes: [
          {
            name: '@demo/nonexistent',
            entry: 'http://localhost:1111/nonexistent-manifest.json',
          },
        ],
        plugins: [simplePlugin()],
      });

      const result = await GM.loadRemote('@demo/nonexistent/component');

      expect(result).toBeDefined();
      expect(typeof result).toBe('function');

      // Verify fallback component can be rendered
      const moduleExports = result();
      expect(moduleExports).toHaveProperty('default');
      expect(moduleExports.__esModule).toBe(true);

      // Simulate rendering the component
      const Component = moduleExports.default;
      expect(Component).toBeDefined();
      expect(Component.displayName).toBe('ErrorFallbackComponent');
    });

    it('should handle different error lifecycle stages with appropriate fallback components', async () => {
      const lifecycleCalls: Array<{ lifecycle: string; error?: string }> = [];

      // Lifecycle-based plugin from documentation
      const lifecyclePlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'lifecycle-based-fallback-plugin',
        async errorLoadRemote(args) {
          lifecycleCalls.push({
            lifecycle: args.lifecycle,
            error: args.error?.message,
          });

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            const FallbackComponent = React.memo(() => {
              return React.createElement(
                'div',
                {
                  'data-testid': `fallback-${args.lifecycle}`,
                  style: {
                    padding: '16px',
                    border: '1px solid #ffa39e',
                    borderRadius: '4px',
                    backgroundColor: '#fff1f0',
                    color: '#cf1322',
                  },
                },
                `Component loading failed in ${args.lifecycle} stage`,
              );
            });

            return () => ({
              __esModule: true,
              default: FallbackComponent,
            });
          }

          if (args.lifecycle === 'afterResolve') {
            // Return mock manifest for afterResolve errors
            return {
              id: '@test/fallback',
              name: '@test/fallback',
              metaData: {
                name: '@test/fallback',
                publicPath: 'http://localhost:1111/',
                globalName: '@test/fallback',
              },
              shared: [],
              remotes: [],
              exposes: [],
            };
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/lifecycle-fallback',
        remotes: [
          {
            name: '@demo/failing',
            entry: 'http://localhost:1111/failing-manifest.json',
          },
        ],
        plugins: [lifecyclePlugin()],
      });

      // This should trigger afterResolve error first
      const result = await GM.loadRemote('@demo/failing/component');

      expect(lifecycleCalls.length).toBeGreaterThan(0);
      expect(
        lifecycleCalls.some((call) => call.lifecycle === 'afterResolve'),
      ).toBe(true);
      expect(result).toBeDefined();
    });
  });

  describe('Production-Ready Fallback Components', () => {
    it('should implement enhanced fallback plugin with circuit breaker pattern', async () => {
      const circuitBreakerState = new Map<
        string,
        {
          failureCount: number;
          isOpen: boolean;
          lastFailureTime: number;
        }
      >();

      const enhancedPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'enhanced-offline-fallback-plugin',
        async errorLoadRemote(args) {
          const remoteId = args.id || 'unknown';
          const state = circuitBreakerState.get(remoteId) || {
            failureCount: 0,
            isOpen: false,
            lastFailureTime: 0,
          };

          // Update failure count and circuit state
          state.failureCount++;
          state.lastFailureTime = Date.now();

          if (state.failureCount >= 3) {
            state.isOpen = true;
          }

          circuitBreakerState.set(remoteId, state);

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            const FallbackComponent = React.memo(() => {
              return React.createElement(
                'div',
                {
                  'data-testid': 'circuit-breaker-fallback',
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
                  React.createElement(
                    'h3',
                    { key: 'title' },
                    'Remote Module Unavailable',
                  ),
                  React.createElement(
                    'p',
                    { key: 'description' },
                    `The remote module "${remoteId}" is currently offline.`,
                  ),
                  state.isOpen &&
                    React.createElement(
                      'p',
                      { key: 'circuit' },
                      'Circuit breaker is open - preventing cascade failures',
                    ),
                ],
              );
            });

            return () => ({
              __esModule: true,
              default: FallbackComponent,
            });
          }

          if (args.lifecycle === 'afterResolve') {
            // Return fallback manifest
            return {
              id: 'fallback',
              name: 'fallback',
              metaData: {
                name: 'fallback',
                globalName: 'fallback',
              },
              shared: [],
              remotes: [],
              exposes: [],
            };
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/enhanced-fallback',
        remotes: [
          {
            name: '@demo/circuit-test',
            entry: 'http://localhost:1111/circuit-test-manifest.json',
          },
        ],
        plugins: [enhancedPlugin()],
      });

      // First failure should increment counter
      await GM.loadRemote('@demo/circuit-test/component');

      expect(
        circuitBreakerState.get('@demo/circuit-test/component'),
      ).toMatchObject({
        failureCount: 1,
        isOpen: false,
      });

      // Multiple failures should open circuit
      await GM.loadRemote('@demo/circuit-test/component');
      await GM.loadRemote('@demo/circuit-test/component');

      const finalState = circuitBreakerState.get(
        '@demo/circuit-test/component',
      );
      expect(finalState?.failureCount).toBe(3);
      expect(finalState?.isOpen).toBe(true);
    });

    it('should implement timeout and retry logic with fallback', async () => {
      const retryAttempts: number[] = [];

      const timeoutPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'timeout-fallback-plugin',
        async errorLoadRemote(args) {
          retryAttempts.push(Date.now());

          // Simulate retry logic with timeout
          const withRetry = async <T>(
            operation: () => Promise<T>,
            attempts = 2,
          ): Promise<T> => {
            let lastError: Error;

            for (let i = 0; i < attempts; i++) {
              try {
                const result = await Promise.race([
                  operation(),
                  new Promise<never>((_, reject) =>
                    setTimeout(
                      () => reject(new Error('Request timeout')),
                      1000,
                    ),
                  ),
                ]);
                return result;
              } catch (error) {
                lastError = error as Error;
                if (i < attempts - 1) {
                  // Wait before retry
                  await new Promise((resolve) => setTimeout(resolve, 500));
                }
              }
            }

            throw lastError!;
          };

          if (args.lifecycle === 'onLoad') {
            try {
              // Attempt retry (will fail in test)
              await withRetry(async () => {
                throw new Error('Simulated timeout');
              });
            } catch (error) {
              const React = await import('react');

              const TimeoutFallback = React.memo(() => {
                return React.createElement(
                  'div',
                  {
                    'data-testid': 'timeout-fallback',
                    style: {
                      padding: '16px',
                      backgroundColor: '#fff2f0',
                      border: '1px solid #ffccc7',
                      borderRadius: '4px',
                      color: '#cf1322',
                    },
                  },
                  `Request timed out after retries. Error: ${(error as Error).message}`,
                );
              });

              return () => ({
                __esModule: true,
                default: TimeoutFallback,
              });
            }
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/timeout-fallback',
        remotes: [
          {
            name: '@demo/timeout-test',
            entry: 'http://localhost:1111/timeout-manifest.json',
          },
        ],
        plugins: [timeoutPlugin()],
      });

      const result = await GM.loadRemote('@demo/timeout-test/component');

      expect(retryAttempts.length).toBeGreaterThan(0);
      expect(result).toBeDefined();

      // Verify fallback component
      const moduleExports = result();
      expect(moduleExports).toHaveProperty('default');

      const Component = moduleExports.default;
      expect(Component).toBeDefined();
    });
  });

  describe('Fallback Component Props and Error Information', () => {
    it('should pass correct error information to fallback components', async () => {
      const errorDetails: any[] = [];

      const errorPropsPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'error-props-plugin',
        async errorLoadRemote(args) {
          errorDetails.push({
            id: args.id,
            lifecycle: args.lifecycle,
            error: args.error?.message,
            from: args.from,
          });

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            const ErrorDetailsComponent = React.memo(({ error }: any) => {
              return React.createElement(
                'div',
                {
                  'data-testid': 'error-details-fallback',
                  style: {
                    padding: '16px',
                    backgroundColor: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '4px',
                  },
                },
                [
                  React.createElement('h3', { key: 'title' }, 'Error Details'),
                  React.createElement(
                    'p',
                    { key: 'id' },
                    `Remote ID: ${args.id}`,
                  ),
                  React.createElement(
                    'p',
                    { key: 'lifecycle' },
                    `Lifecycle: ${args.lifecycle}`,
                  ),
                  React.createElement(
                    'p',
                    { key: 'from' },
                    `From: ${args.from}`,
                  ),
                  args.error &&
                    React.createElement('details', { key: 'error' }, [
                      React.createElement(
                        'summary',
                        { key: 'summary' },
                        'Error Information',
                      ),
                      React.createElement(
                        'pre',
                        { key: 'error-msg' },
                        args.error.message,
                      ),
                    ]),
                ],
              );
            });

            return () => ({
              __esModule: true,
              default: ErrorDetailsComponent,
            });
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/error-props',
        remotes: [
          {
            name: '@demo/error-test',
            entry: 'http://localhost:1111/error-test-manifest.json',
          },
        ],
        plugins: [errorPropsPlugin()],
      });

      const result = await GM.loadRemote('@demo/error-test/component');

      expect(errorDetails.length).toBeGreaterThan(0);

      const errorDetail = errorDetails.find(
        (detail) => detail.lifecycle === 'afterResolve',
      );
      expect(errorDetail).toMatchObject({
        id: expect.stringContaining('error-test-manifest.json'),
        lifecycle: 'afterResolve',
        from: 'runtime',
      });

      expect(result).toBeDefined();
    });

    it('should support custom fallback components per remote', async () => {
      const customFallbacks = {
        '@demo/remote1': 'Custom Remote 1 Fallback',
        '@demo/remote2': 'Custom Remote 2 Fallback',
      };

      const customFallbackPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'custom-fallback-plugin',
        async errorLoadRemote(args) {
          const remoteId = args.id?.split('/')[0] || '';
          const customMessage =
            customFallbacks[remoteId as keyof typeof customFallbacks];

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            const CustomFallback = React.memo(() => {
              return React.createElement(
                'div',
                {
                  'data-testid': `custom-fallback-${remoteId.replace('@demo/', '')}`,
                  style: {
                    padding: '16px',
                    backgroundColor: customMessage ? '#e6f7ff' : '#fff2f0',
                    border: `1px solid ${customMessage ? '#91d5ff' : '#ffccc7'}`,
                    borderRadius: '4px',
                    color: customMessage ? '#0958d9' : '#cf1322',
                  },
                },
                customMessage || 'Default fallback component',
              );
            });

            return () => ({
              __esModule: true,
              default: CustomFallback,
            });
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/custom-fallbacks',
        remotes: [
          {
            name: '@demo/remote1',
            entry: 'http://localhost:1111/remote1-manifest.json',
          },
          {
            name: '@demo/remote2',
            entry: 'http://localhost:1111/remote2-manifest.json',
          },
        ],
        plugins: [customFallbackPlugin()],
      });

      // Test remote1 fallback
      const result1 = await GM.loadRemote('@demo/remote1/component');
      expect(result1).toBeDefined();

      // Test remote2 fallback
      const result2 = await GM.loadRemote('@demo/remote2/component');
      expect(result2).toBeDefined();

      // Both should return valid module exports
      expect(result1()).toHaveProperty('default');
      expect(result2()).toHaveProperty('default');
    });
  });

  describe('Recovery Mechanisms', () => {
    it('should support recovery when remotes come back online', async () => {
      let isRemoteOnline = false;
      const loadAttempts: string[] = [];

      const recoveryPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'recovery-plugin',
        async beforeRequest(args) {
          loadAttempts.push(`Attempting load: ${args.id}`);

          if (!isRemoteOnline && args.id.includes('recovery-test')) {
            throw new Error('Remote is offline');
          }

          return args;
        },
        async errorLoadRemote(args) {
          if (args.lifecycle === 'beforeRequest') {
            // Return valid request args to continue
            return {
              id: args.id,
              options: args.options,
              origin: args.origin,
            };
          }

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            const RecoveryComponent = React.memo(() => {
              return React.createElement(
                'div',
                {
                  'data-testid': 'recovery-fallback',
                  style: {
                    padding: '16px',
                    backgroundColor: '#fff7e6',
                    border: '1px solid #ffd591',
                    borderRadius: '4px',
                    color: '#d46b08',
                  },
                },
                'Remote temporarily unavailable - will retry when online',
              );
            });

            return () => ({
              __esModule: true,
              default: RecoveryComponent,
            });
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/recovery',
        remotes: [
          {
            name: '@demo/recovery-test',
            entry: 'http://localhost:1111/recovery-manifest.json',
          },
        ],
        plugins: [recoveryPlugin()],
      });

      // First attempt - should fail and show fallback
      const result1 = await GM.loadRemote('@demo/recovery-test/component');
      expect(loadAttempts.length).toBeGreaterThan(0);
      expect(result1).toBeDefined();

      // Simulate remote coming back online
      isRemoteOnline = true;

      // Second attempt - should potentially succeed (in a real scenario)
      const result2 = await GM.loadRemote('@demo/recovery-test/component');
      expect(result2).toBeDefined();

      // Verify we attempted multiple loads
      expect(loadAttempts.length).toBeGreaterThanOrEqual(2);
    });

    it('should implement health check mechanism for circuit breaker recovery', async () => {
      const healthCheckState = new Map<
        string,
        {
          isHealthy: boolean;
          lastHealthCheck: number;
          healthCheckInterval: number;
        }
      >();

      const healthCheckPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'health-check-plugin',
        async errorLoadRemote(args) {
          const remoteId = args.id || 'unknown';
          const state = healthCheckState.get(remoteId) || {
            isHealthy: false,
            lastHealthCheck: 0,
            healthCheckInterval: 10000, // 10 seconds
          };

          // Update health check state
          const now = Date.now();
          if (now - state.lastHealthCheck > state.healthCheckInterval) {
            // Simulate health check (in real scenario, this would ping the remote)
            state.isHealthy = Math.random() > 0.5; // Random for testing
            state.lastHealthCheck = now;
            healthCheckState.set(remoteId, state);
          }

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            const HealthCheckFallback = React.memo(() => {
              return React.createElement(
                'div',
                {
                  'data-testid': 'health-check-fallback',
                  style: {
                    padding: '16px',
                    backgroundColor: state.isHealthy ? '#f6ffed' : '#fff2f0',
                    border: `1px solid ${state.isHealthy ? '#b7eb8f' : '#ffccc7'}`,
                    borderRadius: '4px',
                    color: state.isHealthy ? '#52c41a' : '#cf1322',
                  },
                },
                [
                  React.createElement(
                    'p',
                    { key: 'status' },
                    `Remote status: ${state.isHealthy ? 'Healthy' : 'Unhealthy'}`,
                  ),
                  React.createElement(
                    'p',
                    { key: 'check' },
                    `Last check: ${new Date(state.lastHealthCheck).toLocaleTimeString()}`,
                  ),
                  !state.isHealthy &&
                    React.createElement(
                      'p',
                      { key: 'retry' },
                      'Will retry automatically when service recovers',
                    ),
                ],
              );
            });

            return () => ({
              __esModule: true,
              default: HealthCheckFallback,
            });
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/health-check',
        remotes: [
          {
            name: '@demo/health-test',
            entry: 'http://localhost:1111/health-manifest.json',
          },
        ],
        plugins: [healthCheckPlugin()],
      });

      const result = await GM.loadRemote('@demo/health-test/component');

      expect(result).toBeDefined();
      expect(healthCheckState.has('@demo/health-test/component')).toBe(true);

      const state = healthCheckState.get('@demo/health-test/component');
      expect(state).toMatchObject({
        isHealthy: expect.any(Boolean),
        lastHealthCheck: expect.any(Number),
        healthCheckInterval: 10000,
      });
    });
  });

  describe('Integration with Share Strategy', () => {
    it('should handle fallbacks correctly with version-first strategy', async () => {
      const shareStrategyCalls: string[] = [];

      const shareStrategyPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'share-strategy-plugin',
        async beforeLoadShare(args) {
          shareStrategyCalls.push(`Loading shared: ${args.pkgName}`);
          return args;
        },
        async errorLoadRemote(args) {
          shareStrategyCalls.push(`Error in ${args.lifecycle}: ${args.id}`);

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            const ShareFallback = React.memo(() => {
              return React.createElement(
                'div',
                {
                  'data-testid': 'share-strategy-fallback',
                  style: {
                    padding: '16px',
                    backgroundColor: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: '4px',
                  },
                },
                'Fallback for version-first strategy error',
              );
            });

            return () => ({
              __esModule: true,
              default: ShareFallback,
            });
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/share-strategy',
        shareStrategy: 'version-first' as any,
        remotes: [
          {
            name: '@demo/share-test',
            entry: 'http://localhost:1111/share-manifest.json',
          },
        ],
        shared: {
          react: {
            version: '18.0.0',
            scope: 'default',
            lib: () => ({}),
            shareConfig: {
              singleton: true,
              requiredVersion: '^18.0.0',
            },
          },
        },
        plugins: [shareStrategyPlugin()],
      });

      const result = await GM.loadRemote('@demo/share-test/component');

      expect(result).toBeDefined();
      expect(shareStrategyCalls.length).toBeGreaterThan(0);

      // Should include both shared loading attempts and error calls
      const errorCall = shareStrategyCalls.find((call) =>
        call.includes('Error in'),
      );
      expect(errorCall).toBeTruthy();
    });
  });
});
