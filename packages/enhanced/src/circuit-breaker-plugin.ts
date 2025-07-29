/**
 * Circuit Breaker Plugin for Module Federation
 *
 * Implements circuit breaker patterns to prevent cascading failures when
 * manifest.json or remote modules are unavailable. This helps maintain
 * application stability by failing fast and providing fallbacks.
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export interface CircuitBreakerConfig {
  /** Number of failures before circuit opens */
  failureThreshold?: number;
  /** Time window for counting failures (ms) */
  windowTime?: number;
  /** Time to wait before trying again (ms) */
  openDuration?: number;
  /** Time to wait in half-open state before closing (ms) */
  halfOpenTimeout?: number;
  /** Custom health check function */
  healthCheck?: (url: string) => Promise<boolean>;
  /** Fallback strategy when circuit is open */
  fallbackStrategy?: 'fail-fast' | 'return-mock' | 'return-cached' | 'custom';
  /** Custom fallback handler */
  customFallback?: (url: string, error: Error) => Promise<any> | any;
  /** Enable detailed logging */
  enableLogging?: boolean;
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  totalRequests: number;
  windowStart: number;
}

/**
 * Circuit breaker implementation for individual URLs/modules
 */
class Circuit {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private lastSuccessTime = 0;
  private totalRequests = 0;
  private windowStart = Date.now();
  private nextAttemptTime = 0;
  private halfOpenTimer?: NodeJS.Timeout;

  constructor(
    public readonly url: string,
    private readonly config: Required<CircuitBreakerConfig>,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        if (this.config.enableLogging) {
          console.warn(
            `[CircuitBreaker] Circuit OPEN for ${this.url}, failing fast`,
          );
        }
        throw new Error(`Circuit breaker is OPEN for ${this.url}`);
      } else {
        // Try to transition to HALF_OPEN
        this.state = 'HALF_OPEN';
        if (this.config.enableLogging) {
          console.log(
            `[CircuitBreaker] Circuit transitioning to HALF_OPEN for ${this.url}`,
          );
        }
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successCount++;
    this.lastSuccessTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Successful call in HALF_OPEN state - close the circuit
      this.state = 'CLOSED';
      this.resetCounts();
      if (this.config.enableLogging) {
        console.log(
          `[CircuitBreaker] Circuit CLOSED for ${this.url} after successful recovery`,
        );
      }
    } else if (this.state === 'CLOSED') {
      // Reset failure count on success in normal operation
      this.resetWindowIfNeeded();
    }

    if (this.halfOpenTimer) {
      clearTimeout(this.halfOpenTimer);
      this.halfOpenTimer = undefined;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.resetWindowIfNeeded();

    if (this.state === 'CLOSED' && this.shouldOpenCircuit()) {
      this.openCircuit();
    } else if (this.state === 'HALF_OPEN') {
      this.openCircuit();
    }
  }

  private shouldOpenCircuit(): boolean {
    return this.failureCount >= this.config.failureThreshold;
  }

  private openCircuit(): void {
    this.state = 'OPEN';
    this.nextAttemptTime = Date.now() + this.config.openDuration;

    if (this.config.enableLogging) {
      console.error(
        `[CircuitBreaker] Circuit OPENED for ${this.url} (failures: ${this.failureCount})`,
      );
    }

    // Set up automatic transition to HALF_OPEN
    if (this.halfOpenTimer) {
      clearTimeout(this.halfOpenTimer);
    }

    this.halfOpenTimer = setTimeout(() => {
      if (this.state === 'OPEN') {
        this.state = 'HALF_OPEN';
        if (this.config.enableLogging) {
          console.log(
            `[CircuitBreaker] Circuit auto-transitioning to HALF_OPEN for ${this.url}`,
          );
        }
      }
    }, this.config.openDuration);
  }

  private resetWindowIfNeeded(): void {
    const now = Date.now();
    if (now - this.windowStart >= this.config.windowTime) {
      this.windowStart = now;
      this.failureCount = 0;
      this.successCount = 0;
    }
  }

  private resetCounts(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.windowStart = Date.now();
  }

  public getStats(): CircuitStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      windowStart: this.windowStart,
    };
  }

  public forceOpen(): void {
    this.state = 'OPEN';
    this.nextAttemptTime = Date.now() + this.config.openDuration;
    if (this.config.enableLogging) {
      console.warn(`[CircuitBreaker] Circuit manually OPENED for ${this.url}`);
    }
  }

  public forceClose(): void {
    this.state = 'CLOSED';
    this.resetCounts();
    if (this.halfOpenTimer) {
      clearTimeout(this.halfOpenTimer);
      this.halfOpenTimer = undefined;
    }
    if (this.config.enableLogging) {
      console.log(`[CircuitBreaker] Circuit manually CLOSED for ${this.url}`);
    }
  }

  public async healthCheck(): Promise<boolean> {
    if (this.config.healthCheck) {
      try {
        return await this.config.healthCheck(this.url);
      } catch {
        return false;
      }
    }

    // Default health check - simple fetch test
    try {
      const response = await fetch(this.url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Circuit breaker manager
 */
class CircuitBreakerManager {
  private circuits = new Map<string, Circuit>();
  private mockCache = new Map<string, any>();
  private realCache = new Map<string, any>();

  constructor(private config: Required<CircuitBreakerConfig>) {}

  getCircuit(url: string): Circuit {
    if (!this.circuits.has(url)) {
      this.circuits.set(url, new Circuit(url, this.config));
    }
    return this.circuits.get(url)!;
  }

  async executeWithCircuitBreaker<T>(
    url: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const circuit = this.getCircuit(url);

    try {
      return await circuit.execute(operation);
    } catch (error) {
      // Circuit is open or operation failed
      return this.handleCircuitBreakerFallback(url, error);
    }
  }

  private async handleCircuitBreakerFallback<T>(
    url: string,
    error: Error,
  ): Promise<T> {
    if (this.config.enableLogging) {
      console.warn(
        `[CircuitBreaker] Handling fallback for ${url}:`,
        error.message,
      );
    }

    switch (this.config.fallbackStrategy) {
      case 'fail-fast':
        throw error;

      case 'return-mock':
        return this.getMockResponse(url) as T;

      case 'return-cached':
        const cached = this.realCache.get(url);
        if (cached) {
          if (this.config.enableLogging) {
            console.log(
              `[CircuitBreaker] Returning cached response for ${url}`,
            );
          }
          return cached;
        }
        throw new Error(`No cached response available for ${url}`);

      case 'custom':
        if (this.config.customFallback) {
          return await this.config.customFallback(url, error);
        }
        throw error;

      default:
        throw error;
    }
  }

  private getMockResponse(url: string): any {
    if (this.mockCache.has(url)) {
      return this.mockCache.get(url);
    }

    // Generate mock based on URL type
    if (url.includes('manifest.json') || url.includes('mf-manifest.json')) {
      const mockManifest = this.generateMockManifest(url);
      this.mockCache.set(url, mockManifest);
      return mockManifest;
    }

    // Default mock response
    const mock = { error: 'Circuit breaker fallback', url };
    this.mockCache.set(url, mock);
    return mock;
  }

  private generateMockManifest(url: string): any {
    const moduleName = this.extractModuleNameFromUrl(url);
    return {
      id: moduleName,
      name: moduleName,
      metaData: {
        name: moduleName,
        type: 'app',
        buildInfo: {
          buildVersion: 'circuit-breaker-mock',
          buildName: moduleName,
        },
        remoteEntry: {
          name: 'remoteEntry.js',
          path: '',
          type: 'esm',
        },
        types: {
          path: '',
          name: '',
          zip: '@mf-types.zip',
          api: '@mf-types.d.ts',
        },
        globalName: moduleName,
        pluginVersion: '0.0.0-mock',
        publicPath: 'auto',
      },
      shared: [],
      remotes: [],
      exposes: [],
    };
  }

  private extractModuleNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 2] || 'circuit-breaker-mock';
    } catch {
      return 'circuit-breaker-mock';
    }
  }

  cacheResponse(url: string, response: any): void {
    this.realCache.set(url, response);
  }

  getAllCircuitStats(): Map<string, CircuitStats> {
    const stats = new Map<string, CircuitStats>();
    for (const [url, circuit] of this.circuits) {
      stats.set(url, circuit.getStats());
    }
    return stats;
  }

  async performHealthChecks(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const promises = Array.from(this.circuits.entries()).map(
      async ([url, circuit]) => {
        const isHealthy = await circuit.healthCheck();
        results.set(url, isHealthy);
        return { url, isHealthy };
      },
    );

    await Promise.allSettled(promises);
    return results;
  }

  resetCircuit(url: string): void {
    const circuit = this.circuits.get(url);
    if (circuit) {
      circuit.forceClose();
    }
  }

  resetAllCircuits(): void {
    for (const circuit of this.circuits.values()) {
      circuit.forceClose();
    }
  }
}

/**
 * Creates circuit breaker plugin
 */
export function createCircuitBreakerPlugin(
  config: CircuitBreakerConfig = {},
): ModuleFederationRuntimePlugin {
  const fullConfig: Required<CircuitBreakerConfig> = {
    failureThreshold: 5,
    windowTime: 60000, // 1 minute
    openDuration: 30000, // 30 seconds
    halfOpenTimeout: 5000, // 5 seconds
    healthCheck: undefined,
    fallbackStrategy: 'return-mock',
    customFallback: undefined,
    enableLogging: true,
    ...config,
  };

  const manager = new CircuitBreakerManager(fullConfig);

  return {
    name: 'circuit-breaker-plugin',

    async fetch(url, options) {
      // Only handle manifest and remote entry requests
      if (
        !url.includes('manifest.json') &&
        !url.includes('mf-manifest.json') &&
        !url.includes('remoteEntry.js')
      ) {
        return;
      }

      try {
        const response = await manager.executeWithCircuitBreaker(
          url,
          async () => {
            const response = await fetch(url, options);
            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`,
              );
            }

            // Cache successful responses
            if (
              url.includes('manifest.json') ||
              url.includes('mf-manifest.json')
            ) {
              const manifest = await response.clone().json();
              manager.cacheResponse(url, manifest);
            }

            return response;
          },
        );

        return response;
      } catch (error) {
        if (fullConfig.enableLogging) {
          console.error(
            `[CircuitBreaker] Failed to fetch ${url}:`,
            error.message,
          );
        }

        // Let the circuit breaker handle the fallback
        if (error.message.includes('Circuit breaker is OPEN')) {
          // Try to return a mock response directly
          if (
            url.includes('manifest.json') ||
            url.includes('mf-manifest.json')
          ) {
            const mockManifest = manager['getMockResponse'](url);
            return new Response(JSON.stringify(mockManifest), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }

        // Return undefined to let other plugins handle it
        return;
      }
    },

    async errorLoadRemote(args) {
      if (args.lifecycle === 'afterResolve' && args.id) {
        const circuit = manager.getCircuit(args.id);
        const stats = circuit.getStats();

        if (fullConfig.enableLogging) {
          console.error(`[CircuitBreaker] Remote load error for ${args.id}:`, {
            error: args.error?.message,
            circuitState: stats.state,
            failures: stats.failureCount,
          });
        }

        // If circuit is open, try fallback
        if (stats.state === 'OPEN') {
          try {
            const fallback = await manager['handleCircuitBreakerFallback'](
              args.id,
              args.error,
            );
            return fallback;
          } catch (fallbackError) {
            if (fullConfig.enableLogging) {
              console.error(
                `[CircuitBreaker] Fallback failed for ${args.id}:`,
                fallbackError.message,
              );
            }
          }
        }
      }

      return args;
    },
  };
}

/**
 * Utility functions for circuit breaker management
 */
export class CircuitBreakerUtils {
  static createPlugin = createCircuitBreakerPlugin;

  static getManagerFromPlugin(plugin: any): CircuitBreakerManager | null {
    return plugin?.manager || null;
  }

  static async monitorCircuits(
    manager: CircuitBreakerManager,
    intervalMs = 30000,
  ): Promise<() => void> {
    const interval = setInterval(async () => {
      const stats = manager.getAllCircuitStats();
      const healthChecks = await manager.performHealthChecks();

      console.log('[CircuitBreaker] Status Report:', {
        circuits: Array.from(stats.entries()).map(([url, stat]) => ({
          url,
          state: stat.state,
          failures: stat.failureCount,
          successes: stat.successCount,
          healthy: healthChecks.get(url) || false,
        })),
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

/**
 * Pre-configured circuit breaker for common scenarios
 */
export const manifestCircuitBreakerPlugin = createCircuitBreakerPlugin({
  failureThreshold: 3,
  windowTime: 30000, // 30 seconds
  openDuration: 15000, // 15 seconds
  fallbackStrategy: 'return-mock',
  enableLogging: true,
});
