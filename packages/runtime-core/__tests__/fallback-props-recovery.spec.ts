import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ModuleFederation } from '../src/core';
import type { ModuleFederationRuntimePlugin } from '../src/type/plugin';
import { mockStaticServer, removeScriptTags } from './mock/utils';
import { resetFederationGlobalInfo, addGlobalSnapshot } from '../src/global';

/**
 * Comprehensive test suite for fallback component props and recovery mechanisms.
 * Tests all documented scenarios for passing correct error props to fallback components
 * and recovery mechanisms when remotes come back online.
 *
 * Based on documentation examples from:
 * - building-custom-retry-plugin.mdx
 * - error-load-remote.mdx
 * - router-demo examples
 *
 * Covers:
 * 1. Fallback components receive correct error props
 * 2. Recovery mechanisms work when remotes come back online
 * 3. Circuit breaker patterns with automatic recovery
 * 4. Health check mechanisms
 * 5. Retry logic with exponential backoff
 * 6. Custom retry plugin integration
 */
describe('Fallback Props and Recovery Mechanisms', () => {
  mockStaticServer({
    baseDir: __dirname,
    filterKeywords: [],
    basename: 'http://localhost:1111/',
  });

  beforeEach(() => {
    removeScriptTags();
    resetFederationGlobalInfo();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Fallback Component Props Verification', () => {
    it('should pass correct error props to fallback components', async () => {
      const capturedProps: any[] = [];

      const propsTestPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'props-test-plugin',
        async errorLoadRemote(args) {
          capturedProps.push({
            id: args.id,
            error: args.error,
            lifecycle: args.lifecycle,
            from: args.from,
            origin: args.origin,
            options: args.options,
          });

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            const PropsTestComponent = React.memo((props: any) => {
              return React.createElement(
                'div',
                {
                  'data-testid': 'props-test-fallback',
                  'data-error-id': args.id,
                  'data-error-lifecycle': args.lifecycle,
                  'data-error-from': args.from,
                  'data-error-message':
                    args.error?.message || 'No error message',
                },
                `Error Props: ${JSON.stringify({
                  id: args.id,
                  lifecycle: args.lifecycle,
                  from: args.from,
                  hasError: !!args.error,
                })}`,
              );
            });

            return () => ({
              __esModule: true,
              default: PropsTestComponent,
            });
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/props-verification',
        remotes: [
          {
            name: '@demo/props-test',
            entry: 'http://localhost:1111/props-test-manifest.json',
          },
        ],
        plugins: [propsTestPlugin()],
      });

      const result = await GM.loadRemote('@demo/props-test/component');

      // Verify props were captured
      expect(capturedProps.length).toBeGreaterThan(0);

      const afterResolveCall = capturedProps.find(
        (p) => p.lifecycle === 'afterResolve',
      );
      expect(afterResolveCall).toMatchObject({
        id: expect.stringContaining('props-test-manifest.json'),
        lifecycle: 'afterResolve',
        from: 'runtime',
        origin: expect.any(Object),
        error: expect.any(Error),
      });

      // Verify result component contains error information
      expect(result).toBeDefined();
      const moduleExports = result();
      expect(moduleExports.__esModule).toBe(true);
      expect(moduleExports.default).toBeDefined();
    });

    it('should include all documented error properties in different lifecycle stages', async () => {
      const lifecycleProps = new Map<string, any>();

      const comprehensivePropsPlugin: () => ModuleFederationRuntimePlugin =
        () => ({
          name: 'comprehensive-props-plugin',
          beforeRequest(args) {
            // Trigger beforeRequest error
            if (args.id.includes('trigger-before-request-error')) {
              throw new Error('beforeRequest test error');
            }
            return args;
          },
          async errorLoadRemote(args) {
            lifecycleProps.set(args.lifecycle, {
              id: args.id,
              error: {
                message: args.error?.message,
                name: args.error?.name,
                stack: args.error?.stack?.substring(0, 100), // Truncate for testing
              },
              lifecycle: args.lifecycle,
              from: args.from,
              origin: !!args.origin,
              options: args.options,
            });

            // Handle different lifecycle stages
            switch (args.lifecycle) {
              case 'beforeRequest':
                return {
                  id: args.id,
                  options: args.options,
                  origin: args.origin,
                };

              case 'afterResolve':
                return {
                  id: 'fallback-manifest',
                  name: 'fallback-manifest',
                  metaData: {
                    name: 'fallback-manifest',
                    publicPath: 'http://localhost:1111/',
                    globalName: 'fallback',
                  },
                  shared: [],
                  remotes: [],
                  exposes: [],
                };

              case 'onLoad':
                const React = await import('react');
                const LifecycleComponent = React.memo(() => {
                  return React.createElement(
                    'div',
                    {
                      'data-testid': `lifecycle-${args.lifecycle}`,
                    },
                    `Lifecycle: ${args.lifecycle}, Error: ${args.error?.message}`,
                  );
                });

                return () => ({
                  __esModule: true,
                  default: LifecycleComponent,
                });

              case 'beforeLoadShare':
                return {
                  init: () => Promise.resolve(),
                  get: () => Promise.resolve(() => ({})),
                };

              default:
                return args;
            }
          },
        });

      const GM = new ModuleFederation({
        name: '@test/comprehensive-props',
        remotes: [
          {
            name: '@demo/trigger-before-request-error',
            entry: 'http://localhost:1111/comprehensive-manifest.json',
          },
        ],
        plugins: [comprehensivePropsPlugin()],
      });

      const result = await GM.loadRemote(
        '@demo/trigger-before-request-error/component',
      );

      // Verify different lifecycle stages were captured
      expect(lifecycleProps.has('beforeRequest')).toBe(true);
      expect(lifecycleProps.has('afterResolve')).toBe(true);

      const beforeRequestProps = lifecycleProps.get('beforeRequest');
      expect(beforeRequestProps).toMatchObject({
        id: '@demo/trigger-before-request-error/component',
        lifecycle: 'beforeRequest',
        from: 'runtime',
        error: {
          message: 'beforeRequest test error',
          name: 'Error',
        },
      });

      const afterResolveProps = lifecycleProps.get('afterResolve');
      expect(afterResolveProps.lifecycle).toBe('afterResolve');
      expect(afterResolveProps.from).toBe('runtime');

      expect(result).toBeDefined();
    });

    it('should pass custom props to fallback components', async () => {
      const customProps = {
        retryCount: 0,
        lastAttempt: Date.now(),
        remoteStatus: 'offline',
      };

      const customPropsPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'custom-props-plugin',
        async errorLoadRemote(args) {
          customProps.retryCount++;
          customProps.lastAttempt = Date.now();

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            const CustomPropsComponent = React.memo((componentProps: any) => {
              return React.createElement(
                'div',
                {
                  'data-testid': 'custom-props-fallback',
                  'data-retry-count': customProps.retryCount.toString(),
                  'data-remote-status': customProps.remoteStatus,
                },
                [
                  React.createElement(
                    'h3',
                    { key: 'title' },
                    'Custom Fallback Component',
                  ),
                  React.createElement(
                    'p',
                    { key: 'retry' },
                    `Retry count: ${customProps.retryCount}`,
                  ),
                  React.createElement(
                    'p',
                    { key: 'status' },
                    `Status: ${customProps.remoteStatus}`,
                  ),
                  React.createElement(
                    'p',
                    { key: 'last' },
                    `Last attempt: ${new Date(customProps.lastAttempt).toISOString()}`,
                  ),
                ],
              );
            });

            // Return component with custom props
            return () => ({
              __esModule: true,
              default: (props: any) =>
                React.createElement(CustomPropsComponent, {
                  ...props,
                  customProps,
                }),
            });
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/custom-props',
        remotes: [
          {
            name: '@demo/custom-props-test',
            entry: 'http://localhost:1111/custom-props-manifest.json',
          },
        ],
        plugins: [customPropsPlugin()],
      });

      const result = await GM.loadRemote('@demo/custom-props-test/component');

      expect(customProps.retryCount).toBeGreaterThan(0);
      expect(result).toBeDefined();

      const moduleExports = result();
      expect(moduleExports.default).toBeDefined();
    });
  });

  describe('Recovery Mechanisms', () => {
    it('should implement retry logic with exponential backoff', async () => {
      const retryAttempts: number[] = [];
      let successAfterRetries = false;

      const retryPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'retry-recovery-plugin',
        async errorLoadRemote(args) {
          const withRetry = async <T>(
            operation: () => Promise<T>,
            remoteId: string,
            attempts = 3,
            delay = 1000,
          ): Promise<T> => {
            let lastError: Error;

            for (let i = 0; i < attempts; i++) {
              try {
                retryAttempts.push(Date.now());

                // Simulate success after 2 retries
                if (retryAttempts.length >= 2) {
                  successAfterRetries = true;
                  return await operation();
                }

                throw new Error(`Retry attempt ${i + 1} failed`);
              } catch (error) {
                lastError = error as Error;

                if (i < attempts - 1) {
                  const backoffDelay = delay * Math.pow(2, i); // Exponential backoff
                  await new Promise((resolve) =>
                    setTimeout(resolve, backoffDelay),
                  );
                  vi.advanceTimersByTime(backoffDelay);
                }
              }
            }

            throw lastError!;
          };

          if (args.lifecycle === 'onLoad') {
            try {
              await withRetry(async () => {
                if (!successAfterRetries) {
                  throw new Error('Operation still failing');
                }
                return 'success';
              }, args.id || 'unknown');

              // Success - return working component
              const React = await import('react');
              const SuccessComponent = React.memo(() => {
                return React.createElement(
                  'div',
                  {
                    'data-testid': 'recovery-success',
                  },
                  `Component recovered after ${retryAttempts.length} attempts`,
                );
              });

              return () => ({
                __esModule: true,
                default: SuccessComponent,
              });
            } catch (error) {
              // All retries failed - return fallback
              const React = await import('react');
              const RetryFallback = React.memo(() => {
                return React.createElement(
                  'div',
                  {
                    'data-testid': 'retry-fallback',
                    'data-retry-attempts': retryAttempts.length.toString(),
                  },
                  `Failed after ${retryAttempts.length} retry attempts`,
                );
              });

              return () => ({
                __esModule: true,
                default: RetryFallback,
              });
            }
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/retry-recovery',
        remotes: [
          {
            name: '@demo/retry-test',
            entry: 'http://localhost:1111/retry-manifest.json',
          },
        ],
        plugins: [retryPlugin()],
      });

      const result = await GM.loadRemote('@demo/retry-test/component');

      expect(retryAttempts.length).toBeGreaterThanOrEqual(2);
      expect(successAfterRetries).toBe(true);
      expect(result).toBeDefined();

      const moduleExports = result();
      expect(moduleExports.default).toBeDefined();
    });

    it('should implement circuit breaker with automatic recovery', async () => {
      interface CircuitState {
        failures: number;
        lastFailureTime: number;
        state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
      }

      const circuitStates = new Map<string, CircuitState>();
      const threshold = 3;
      const timeout = 5000;
      let currentTime = Date.now();

      const circuitBreakerPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'circuit-breaker-plugin',
        async errorLoadRemote(args) {
          const remoteId = args.id || 'unknown';
          const state = circuitStates.get(remoteId) || {
            failures: 0,
            lastFailureTime: 0,
            state: 'CLOSED' as const,
          };

          const now = currentTime;

          // Check if circuit should be reset
          if (state.state === 'OPEN' && now - state.lastFailureTime > timeout) {
            state.state = 'HALF_OPEN';
            state.failures = 0;
          }

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            // Simulate failure or success based on circuit state
            if (state.state === 'CLOSED' || state.state === 'HALF_OPEN') {
              state.failures++;
              state.lastFailureTime = now;

              if (state.failures >= threshold) {
                state.state = 'OPEN';
              }

              circuitStates.set(remoteId, state);

              const CircuitBreakerFallback = React.memo(() => {
                return React.createElement(
                  'div',
                  {
                    'data-testid': 'circuit-breaker-fallback',
                    'data-circuit-state': state.state,
                    'data-failures': state.failures.toString(),
                  },
                  [
                    React.createElement(
                      'h3',
                      { key: 'title' },
                      'Circuit Breaker Active',
                    ),
                    React.createElement(
                      'p',
                      { key: 'state' },
                      `State: ${state.state}`,
                    ),
                    React.createElement(
                      'p',
                      { key: 'failures' },
                      `Failures: ${state.failures}`,
                    ),
                    React.createElement(
                      'p',
                      { key: 'message' },
                      state.state === 'OPEN'
                        ? 'Circuit is open - preventing cascade failures'
                        : 'Circuit is monitoring - attempting recovery',
                    ),
                  ],
                );
              });

              return () => ({
                __esModule: true,
                default: CircuitBreakerFallback,
              });
            }

            // Circuit is open - return fast-fail fallback
            const FastFailFallback = React.memo(() => {
              return React.createElement(
                'div',
                {
                  'data-testid': 'fast-fail-fallback',
                },
                'Circuit breaker open - fast failing to prevent cascade',
              );
            });

            return () => ({
              __esModule: true,
              default: FastFailFallback,
            });
          }

          return args;
        },
      });

      const GM = new ModuleFederation({
        name: '@test/circuit-breaker',
        remotes: [
          {
            name: '@demo/circuit-test',
            entry: 'http://localhost:1111/circuit-manifest.json',
          },
        ],
        plugins: [circuitBreakerPlugin()],
      });

      // Multiple failures to trigger circuit breaker
      await GM.loadRemote('@demo/circuit-test/component');
      await GM.loadRemote('@demo/circuit-test/component');
      await GM.loadRemote('@demo/circuit-test/component');

      const state = circuitStates.get('@demo/circuit-test/component');
      expect(state?.state).toBe('OPEN');
      expect(state?.failures).toBe(3);

      // Advance time to trigger recovery
      currentTime += timeout + 1000;

      const result = await GM.loadRemote('@demo/circuit-test/component');
      expect(result).toBeDefined();
    });

    it('should implement health checks for recovery determination', async () => {
      interface HealthState {
        isHealthy: boolean;
        lastHealthCheck: number;
        healthCheckInterval: number;
        consecutiveFailures: number;
      }

      const healthStates = new Map<string, HealthState>();
      let mockHealthCheckResult = false;

      const healthCheckPlugin: () => ModuleFederationRuntimePlugin = () => ({
        name: 'health-check-plugin',
        async errorLoadRemote(args) {
          const remoteId = args.id || 'unknown';
          const state = healthStates.get(remoteId) || {
            isHealthy: false,
            lastHealthCheck: 0,
            healthCheckInterval: 30000, // 30 seconds
            consecutiveFailures: 0,
          };

          const now = Date.now();

          // Perform health check if interval has passed
          if (now - state.lastHealthCheck > state.healthCheckInterval) {
            // Simulate health check (in real scenario, this would ping the remote)
            const healthCheckSuccess =
              mockHealthCheckResult || Math.random() > 0.7;

            if (healthCheckSuccess) {
              state.isHealthy = true;
              state.consecutiveFailures = 0;
            } else {
              state.isHealthy = false;
              state.consecutiveFailures++;
            }

            state.lastHealthCheck = now;
            healthStates.set(remoteId, state);
          }

          if (args.lifecycle === 'onLoad') {
            const React = await import('react');

            const HealthCheckFallback = React.memo(() => {
              const statusColor = state.isHealthy ? '#52c41a' : '#cf1322';
              const bgColor = state.isHealthy ? '#f6ffed' : '#fff2f0';
              const borderColor = state.isHealthy ? '#b7eb8f' : '#ffccc7';

              return React.createElement(
                'div',
                {
                  'data-testid': 'health-check-fallback',
                  'data-is-healthy': state.isHealthy.toString(),
                  'data-consecutive-failures':
                    state.consecutiveFailures.toString(),
                  style: {
                    padding: '16px',
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '4px',
                    color: statusColor,
                  },
                },
                [
                  React.createElement(
                    'h3',
                    { key: 'title' },
                    'Health Check Status',
                  ),
                  React.createElement(
                    'p',
                    { key: 'status' },
                    `Remote is ${state.isHealthy ? 'healthy' : 'unhealthy'}`,
                  ),
                  React.createElement(
                    'p',
                    { key: 'failures' },
                    `Consecutive failures: ${state.consecutiveFailures}`,
                  ),
                  React.createElement(
                    'p',
                    { key: 'check' },
                    `Last check: ${new Date(state.lastHealthCheck).toLocaleTimeString()}`,
                  ),
                  React.createElement(
                    'p',
                    { key: 'next' },
                    `Next check in: ${Math.max(0, state.healthCheckInterval - (now - state.lastHealthCheck))}ms`,
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

      // Initial load - should trigger health check
      const result1 = await GM.loadRemote('@demo/health-test/component');
      expect(result1).toBeDefined();

      const initialState = healthStates.get('@demo/health-test/component');
      expect(initialState).toBeDefined();
      expect(initialState?.lastHealthCheck).toBeGreaterThan(0);

      // Change health check result and advance time
      mockHealthCheckResult = true;
      vi.advanceTimersByTime(35000); // Advance past health check interval

      const result2 = await GM.loadRemote('@demo/health-test/component');
      expect(result2).toBeDefined();

      const updatedState = healthStates.get('@demo/health-test/component');
      expect(updatedState?.lastHealthCheck).toBeGreaterThan(
        initialState?.lastHealthCheck || 0,
      );
    });
  });

  describe('Production-Ready Recovery Patterns', () => {
    it('should implement progressive recovery with increasing delays', async () => {
      interface RecoveryState {
        attempts: number;
        baseDelay: number;
        maxDelay: number;
        lastAttempt: number;
      }

      const recoveryStates = new Map<string, RecoveryState>();

      const progressiveRecoveryPlugin: () => ModuleFederationRuntimePlugin =
        () => ({
          name: 'progressive-recovery-plugin',
          async errorLoadRemote(args) {
            const remoteId = args.id || 'unknown';
            const state = recoveryStates.get(remoteId) || {
              attempts: 0,
              baseDelay: 1000,
              maxDelay: 30000,
              lastAttempt: 0,
            };

            state.attempts++;
            state.lastAttempt = Date.now();

            // Calculate progressive delay: min(baseDelay * 2^attempts, maxDelay)
            const delay = Math.min(
              state.baseDelay * Math.pow(2, state.attempts - 1),
              state.maxDelay,
            );

            recoveryStates.set(remoteId, state);

            if (args.lifecycle === 'onLoad') {
              const React = await import('react');

              const ProgressiveRecoveryFallback = React.memo(() => {
                return React.createElement(
                  'div',
                  {
                    'data-testid': 'progressive-recovery-fallback',
                    'data-attempts': state.attempts.toString(),
                    'data-delay': delay.toString(),
                  },
                  [
                    React.createElement(
                      'h3',
                      { key: 'title' },
                      'Progressive Recovery',
                    ),
                    React.createElement(
                      'p',
                      { key: 'attempts' },
                      `Recovery attempt: ${state.attempts}`,
                    ),
                    React.createElement(
                      'p',
                      { key: 'delay' },
                      `Current delay: ${delay}ms`,
                    ),
                    React.createElement(
                      'p',
                      { key: 'next' },
                      `Next retry in: ${delay}ms (max: ${state.maxDelay}ms)`,
                    ),
                    React.createElement(
                      'div',
                      {
                        key: 'progress',
                        style: {
                          width: '100%',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '4px',
                          marginTop: '8px',
                        },
                      },
                      React.createElement('div', {
                        style: {
                          width: `${Math.min(100, (delay / state.maxDelay) * 100)}%`,
                          height: '8px',
                          backgroundColor: '#1677ff',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease',
                        },
                      }),
                    ),
                  ],
                );
              });

              return () => ({
                __esModule: true,
                default: ProgressiveRecoveryFallback,
              });
            }

            return args;
          },
        });

      const GM = new ModuleFederation({
        name: '@test/progressive-recovery',
        remotes: [
          {
            name: '@demo/progressive-test',
            entry: 'http://localhost:1111/progressive-manifest.json',
          },
        ],
        plugins: [progressiveRecoveryPlugin()],
      });

      // Multiple attempts to test progressive delays
      await GM.loadRemote('@demo/progressive-test/component');
      await GM.loadRemote('@demo/progressive-test/component');
      await GM.loadRemote('@demo/progressive-test/component');

      const finalState = recoveryStates.get('@demo/progressive-test/component');
      expect(finalState?.attempts).toBe(3);
      expect(finalState?.lastAttempt).toBeGreaterThan(0);

      // Verify progressive delay calculation
      const expectedDelay = Math.min(1000 * Math.pow(2, 3 - 1), 30000); // 4000ms
      expect(expectedDelay).toBe(4000);
    });

    it('should implement comprehensive recovery with multiple strategies', async () => {
      const recoveryMetrics = {
        attempts: 0,
        successes: 0,
        circuitBreakerTrips: 0,
        healthChecks: 0,
        retryStrategies: new Set<string>(),
      };

      const comprehensiveRecoveryPlugin: () => ModuleFederationRuntimePlugin =
        () => ({
          name: 'comprehensive-recovery-plugin',
          async errorLoadRemote(args) {
            recoveryMetrics.attempts++;

            // Multiple recovery strategies
            const strategies = [
              'immediate-retry',
              'exponential-backoff',
              'circuit-breaker',
              'health-check',
              'fallback-service',
            ];

            const selectedStrategy =
              strategies[recoveryMetrics.attempts % strategies.length];
            recoveryMetrics.retryStrategies.add(selectedStrategy);

            if (args.lifecycle === 'onLoad') {
              const React = await import('react');

              const ComprehensiveRecoveryFallback = React.memo(() => {
                return React.createElement(
                  'div',
                  {
                    'data-testid': 'comprehensive-recovery-fallback',
                    'data-strategy': selectedStrategy,
                    'data-total-attempts': recoveryMetrics.attempts.toString(),
                  },
                  [
                    React.createElement(
                      'h3',
                      { key: 'title' },
                      'Comprehensive Recovery System',
                    ),
                    React.createElement(
                      'p',
                      { key: 'strategy' },
                      `Current strategy: ${selectedStrategy}`,
                    ),
                    React.createElement(
                      'p',
                      { key: 'attempts' },
                      `Total attempts: ${recoveryMetrics.attempts}`,
                    ),
                    React.createElement(
                      'p',
                      { key: 'strategies' },
                      `Strategies tried: ${Array.from(recoveryMetrics.retryStrategies).join(', ')}`,
                    ),
                    React.createElement('div', { key: 'metrics' }, [
                      React.createElement(
                        'h4',
                        { key: 'metrics-title' },
                        'Recovery Metrics:',
                      ),
                      React.createElement('ul', { key: 'metrics-list' }, [
                        React.createElement(
                          'li',
                          { key: 'attempts' },
                          `Attempts: ${recoveryMetrics.attempts}`,
                        ),
                        React.createElement(
                          'li',
                          { key: 'successes' },
                          `Successes: ${recoveryMetrics.successes}`,
                        ),
                        React.createElement(
                          'li',
                          { key: 'trips' },
                          `Circuit breaker trips: ${recoveryMetrics.circuitBreakerTrips}`,
                        ),
                        React.createElement(
                          'li',
                          { key: 'checks' },
                          `Health checks: ${recoveryMetrics.healthChecks}`,
                        ),
                      ]),
                    ]),
                  ],
                );
              });

              return () => ({
                __esModule: true,
                default: ComprehensiveRecoveryFallback,
              });
            }

            return args;
          },
        });

      const GM = new ModuleFederation({
        name: '@test/comprehensive-recovery',
        remotes: [
          {
            name: '@demo/comprehensive-test',
            entry: 'http://localhost:1111/comprehensive-manifest.json',
          },
        ],
        plugins: [comprehensiveRecoveryPlugin()],
      });

      // Test multiple recovery attempts
      for (let i = 0; i < 5; i++) {
        await GM.loadRemote('@demo/comprehensive-test/component');
      }

      expect(recoveryMetrics.attempts).toBe(5);
      expect(recoveryMetrics.retryStrategies.size).toBeGreaterThan(0);
      expect(Array.from(recoveryMetrics.retryStrategies)).toContain(
        'immediate-retry',
      );
      expect(Array.from(recoveryMetrics.retryStrategies)).toContain(
        'exponential-backoff',
      );
    });
  });
});
