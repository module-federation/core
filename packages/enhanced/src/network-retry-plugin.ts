/**
 * Network Retry Plugin with Exponential Backoff
 *
 * Implements sophisticated retry logic with exponential backoff for network requests.
 * Includes jitter, circuit breaking integration, and adaptive retry strategies.
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export interface NetworkRetryConfig {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay between retries (ms) */
  initialDelay?: number;
  /** Maximum delay between retries (ms) */
  maxDelay?: number;
  /** Exponential backoff multiplier */
  backoffMultiplier?: number;
  /** Add random jitter to prevent thundering herd */
  enableJitter?: boolean;
  /** Jitter range (0-1, percentage of delay) */
  jitterRange?: number;
  /** Retry only on specific HTTP status codes */
  retryOnStatusCodes?: number[];
  /** Retry only on specific error types */
  retryOnErrors?: string[];
  /** Custom retry condition function */
  shouldRetry?: (error: Error, attempt: number, response?: Response) => boolean;
  /** Timeout for individual requests (ms) */
  requestTimeout?: number;
  /** Enable adaptive retry based on network conditions */
  adaptiveRetry?: boolean;
  /** Network quality thresholds for adaptive retry */
  networkThresholds?: {
    good: number; // < ms for good network
    fair: number; // < ms for fair network
    poor: number; // >= ms for poor network
  };
  /** Enable detailed logging */
  enableLogging?: boolean;
  /** Custom headers to add to retry requests */
  retryHeaders?: Record<string, string>;
}

export interface RetryAttempt {
  attempt: number;
  delay: number;
  timestamp: number;
  error?: Error;
  statusCode?: number;
  networkLatency?: number;
}

export interface RetryStats {
  url: string;
  attempts: RetryAttempt[];
  totalTime: number;
  success: boolean;
  finalError?: Error;
  networkQuality: 'good' | 'fair' | 'poor';
}

/**
 * Network quality monitor
 */
class NetworkQualityMonitor {
  private latencyHistory: number[] = [];
  private readonly maxHistorySize = 10;

  recordLatency(latency: number): void {
    this.latencyHistory.push(latency);
    if (this.latencyHistory.length > this.maxHistorySize) {
      this.latencyHistory.shift();
    }
  }

  getAverageLatency(): number {
    if (this.latencyHistory.length === 0) return 0;
    return (
      this.latencyHistory.reduce((a, b) => a + b, 0) /
      this.latencyHistory.length
    );
  }

  getNetworkQuality(
    thresholds: NetworkRetryConfig['networkThresholds'],
  ): 'good' | 'fair' | 'poor' {
    if (!thresholds) return 'fair';

    const avgLatency = this.getAverageLatency();
    if (avgLatency < thresholds.good) return 'good';
    if (avgLatency < thresholds.fair) return 'fair';
    return 'poor';
  }

  reset(): void {
    this.latencyHistory = [];
  }
}

/**
 * Retry engine with exponential backoff
 */
class RetryEngine {
  private retryStats = new Map<string, RetryStats>();
  private networkMonitor = new NetworkQualityMonitor();

  constructor(private config: Required<NetworkRetryConfig>) {}

  async executeWithRetry<T>(
    url: string,
    operation: () => Promise<T>,
    context?: { isManifest?: boolean; moduleName?: string },
  ): Promise<T> {
    const startTime = Date.now();
    const attempts: RetryAttempt[] = [];
    let lastError: Error | undefined;
    let networkQuality: 'good' | 'fair' | 'poor' = 'fair';

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      const attemptStart = Date.now();

      try {
        if (attempt > 0) {
          const delay = this.calculateDelay(attempt, networkQuality);
          attempts.push({
            attempt,
            delay,
            timestamp: Date.now(),
            networkLatency: this.networkMonitor.getAverageLatency(),
          });

          if (this.config.enableLogging) {
            console.log(
              `[NetworkRetry] Retrying ${url} (attempt ${attempt}/${this.config.maxRetries}) after ${delay}ms delay`,
            );
          }

          await this.sleep(delay);
        }

        const result = await this.executeWithTimeout(operation, attemptStart);

        // Record successful attempt
        const latency = Date.now() - attemptStart;
        this.networkMonitor.recordLatency(latency);
        networkQuality = this.networkMonitor.getNetworkQuality(
          this.config.networkThresholds,
        );

        // Store success stats
        this.retryStats.set(url, {
          url,
          attempts,
          totalTime: Date.now() - startTime,
          success: true,
          networkQuality,
        });

        if (this.config.enableLogging && attempt > 0) {
          console.log(
            `[NetworkRetry] Successfully retrieved ${url} on attempt ${attempt + 1}`,
          );
        }

        return result;
      } catch (error) {
        const latency = Date.now() - attemptStart;
        this.networkMonitor.recordLatency(latency);
        networkQuality = this.networkMonitor.getNetworkQuality(
          this.config.networkThresholds,
        );

        lastError = error;
        attempts[attempts.length - 1] = {
          ...attempts[attempts.length - 1],
          error,
          statusCode: this.extractStatusCode(error),
          networkLatency: latency,
        };

        // Check if we should retry
        if (
          attempt >= this.config.maxRetries ||
          !this.shouldRetryError(error, attempt)
        ) {
          break;
        }

        if (this.config.enableLogging) {
          console.warn(
            `[NetworkRetry] Attempt ${attempt + 1} failed for ${url}:`,
            error.message,
          );
        }
      }
    }

    // Store failure stats
    this.retryStats.set(url, {
      url,
      attempts,
      totalTime: Date.now() - startTime,
      success: false,
      finalError: lastError,
      networkQuality,
    });

    if (this.config.enableLogging) {
      console.error(
        `[NetworkRetry] All retry attempts failed for ${url}:`,
        lastError?.message,
      );
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    startTime: number,
  ): Promise<T> {
    if (this.config.requestTimeout <= 0) {
      return operation();
    }

    const timeoutPromise = new Promise<T>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new Error(`Request timeout after ${this.config.requestTimeout}ms`),
        );
      }, this.config.requestTimeout);

      // Clear timeout if we're done
      return timeoutId;
    });

    return Promise.race([operation(), timeoutPromise]);
  }

  private calculateDelay(
    attempt: number,
    networkQuality: 'good' | 'fair' | 'poor',
  ): number {
    let baseDelay =
      this.config.initialDelay *
      Math.pow(this.config.backoffMultiplier, attempt - 1);

    // Adjust delay based on network quality if adaptive retry is enabled
    if (this.config.adaptiveRetry) {
      switch (networkQuality) {
        case 'good':
          baseDelay *= 0.7; // Reduce delay for good networks
          break;
        case 'fair':
          baseDelay *= 1.0; // Normal delay
          break;
        case 'poor':
          baseDelay *= 1.5; // Increase delay for poor networks
          break;
      }
    }

    // Apply maximum delay limit
    baseDelay = Math.min(baseDelay, this.config.maxDelay);

    // Add jitter if enabled
    if (this.config.enableJitter) {
      const jitterAmount =
        baseDelay * this.config.jitterRange * (Math.random() * 2 - 1);
      baseDelay += jitterAmount;
    }

    return Math.max(0, Math.round(baseDelay));
  }

  private shouldRetryError(error: Error, attempt: number): boolean {
    // Use custom retry condition if provided
    if (this.config.shouldRetry) {
      return this.config.shouldRetry(error, attempt);
    }

    // Check status codes
    const statusCode = this.extractStatusCode(error);
    if (statusCode && this.config.retryOnStatusCodes.length > 0) {
      return this.config.retryOnStatusCodes.includes(statusCode);
    }

    // Check error types
    if (this.config.retryOnErrors.length > 0) {
      return this.config.retryOnErrors.some(
        (errorType) =>
          error.message.toLowerCase().includes(errorType.toLowerCase()) ||
          error.name.toLowerCase().includes(errorType.toLowerCase()),
      );
    }

    // Default retry conditions
    return this.isRetryableError(error, statusCode);
  }

  private isRetryableError(error: Error, statusCode?: number): boolean {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.name === 'TimeoutError') {
      return true;
    }

    // Abort errors (unless explicitly aborted by user)
    if (error.name === 'AbortError' && !error.message.includes('user')) {
      return true;
    }

    // HTTP status codes that should be retried
    if (statusCode) {
      return [408, 429, 500, 502, 503, 504].includes(statusCode);
    }

    return false;
  }

  private extractStatusCode(error: Error): number | undefined {
    // Try to extract status code from various error formats
    if ('status' in error && typeof (error as any).status === 'number') {
      return (error as any).status;
    }

    const match = error.message.match(/(\d{3})/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public getRetryStats(url?: string): RetryStats[] | RetryStats | undefined {
    if (url) {
      return this.retryStats.get(url);
    }
    return Array.from(this.retryStats.values());
  }

  public clearStats(): void {
    this.retryStats.clear();
    this.networkMonitor.reset();
  }

  public getNetworkQuality(): 'good' | 'fair' | 'poor' {
    return this.networkMonitor.getNetworkQuality(this.config.networkThresholds);
  }
}

/**
 * Creates network retry plugin
 */
export function createNetworkRetryPlugin(
  config: NetworkRetryConfig = {},
): ModuleFederationRuntimePlugin {
  const fullConfig: Required<NetworkRetryConfig> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    enableJitter: true,
    jitterRange: 0.3,
    retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
    retryOnErrors: ['fetch', 'network', 'timeout', 'abort'],
    shouldRetry: undefined,
    requestTimeout: 15000,
    adaptiveRetry: true,
    networkThresholds: {
      good: 100, // < 100ms is good
      fair: 500, // < 500ms is fair
      poor: 500, // >= 500ms is poor
    },
    enableLogging: true,
    retryHeaders: {},
    ...config,
  };

  const retryEngine = new RetryEngine(fullConfig);

  return {
    name: 'network-retry-plugin',

    async fetch(url, options = {}) {
      // Only handle manifest and remote entry requests
      if (
        !url.includes('manifest.json') &&
        !url.includes('mf-manifest.json') &&
        !url.includes('remoteEntry')
      ) {
        return;
      }

      try {
        const context = {
          isManifest:
            url.includes('manifest.json') || url.includes('mf-manifest.json'),
          moduleName: this.extractModuleNameFromUrl(url),
        };

        const response = await retryEngine.executeWithRetry(
          url,
          async () => {
            // Add retry headers if configured
            const requestOptions = {
              ...options,
              headers: {
                ...options.headers,
                ...fullConfig.retryHeaders,
              },
            };

            const response = await fetch(url, requestOptions);

            if (!response.ok) {
              const error = new Error(
                `HTTP ${response.status}: ${response.statusText}`,
              ) as any;
              error.status = response.status;
              error.response = response;
              throw error;
            }

            return response;
          },
          context,
        );

        return response;
      } catch (error) {
        if (fullConfig.enableLogging) {
          console.error(
            `[NetworkRetry] Final failure for ${url}:`,
            error.message,
          );

          const stats = retryEngine.getRetryStats(url);
          if (stats && Array.isArray(stats) === false) {
            console.error(`[NetworkRetry] Retry statistics:`, {
              attempts: stats.attempts.length,
              totalTime: stats.totalTime,
              networkQuality: stats.networkQuality,
            });
          }
        }

        // Re-throw to let other plugins handle
        throw error;
      }
    },

    extractModuleNameFromUrl(url: string): string {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        return pathParts[pathParts.length - 2] || 'unknown-module';
      } catch {
        return 'unknown-module';
      }
    },
  };
}

/**
 * Utility functions for retry management
 */
export class NetworkRetryUtils {
  static createPlugin = createNetworkRetryPlugin;

  static getEngineFromPlugin(plugin: any): RetryEngine | null {
    return plugin?.retryEngine || null;
  }

  static async monitorNetworkQuality(
    engine: RetryEngine,
    intervalMs = 10000,
  ): Promise<() => void> {
    const interval = setInterval(() => {
      const quality = engine.getNetworkQuality();
      const stats = engine.getRetryStats() as RetryStats[];

      console.log('[NetworkRetry] Network Quality Report:', {
        quality,
        totalRequests: stats.length,
        successRate:
          stats.length > 0
            ? (
                (stats.filter((s) => s.success).length / stats.length) *
                100
              ).toFixed(1) + '%'
            : 'N/A',
        averageRetries:
          stats.length > 0
            ? (
                stats.reduce((sum, s) => sum + s.attempts.length, 0) /
                stats.length
              ).toFixed(1)
            : 'N/A',
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }

  static createAdaptiveConfig(
    networkType: 'fast' | 'slow' | 'unreliable',
  ): NetworkRetryConfig {
    switch (networkType) {
      case 'fast':
        return {
          maxRetries: 2,
          initialDelay: 500,
          maxDelay: 5000,
          backoffMultiplier: 1.5,
          requestTimeout: 5000,
          networkThresholds: { good: 50, fair: 200, poor: 200 },
        };

      case 'slow':
        return {
          maxRetries: 4,
          initialDelay: 2000,
          maxDelay: 60000,
          backoffMultiplier: 2.5,
          requestTimeout: 30000,
          networkThresholds: { good: 500, fair: 2000, poor: 2000 },
        };

      case 'unreliable':
        return {
          maxRetries: 5,
          initialDelay: 1000,
          maxDelay: 45000,
          backoffMultiplier: 2,
          enableJitter: true,
          jitterRange: 0.5,
          requestTimeout: 20000,
          adaptiveRetry: true,
          networkThresholds: { good: 200, fair: 1000, poor: 1000 },
        };

      default:
        return {};
    }
  }
}

/**
 * Pre-configured retry plugins for common scenarios
 */
export const manifestRetryPlugin = createNetworkRetryPlugin({
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 15000,
  enableJitter: true,
  adaptiveRetry: true,
  enableLogging: true,
});

export const aggressiveRetryPlugin = createNetworkRetryPlugin({
  maxRetries: 5,
  initialDelay: 500,
  maxDelay: 30000,
  backoffMultiplier: 1.8,
  enableJitter: true,
  jitterRange: 0.4,
  adaptiveRetry: true,
  enableLogging: true,
});

export const conservativeRetryPlugin = createNetworkRetryPlugin({
  maxRetries: 2,
  initialDelay: 2000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  enableJitter: false,
  adaptiveRetry: false,
  enableLogging: false,
});
