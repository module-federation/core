/**
 * Fallback Mechanisms for Module Federation
 *
 * Provides comprehensive fallback strategies when JSON remotes are unavailable.
 * Includes graceful degradation, mock services, cached responses, and alternative
 * remote loading strategies.
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export interface FallbackConfig {
  /** Enable automatic fallback detection */
  autoDetect?: boolean;
  /** Fallback remote URLs in priority order */
  fallbackRemotes?: string[];
  /** Local cached manifests */
  cachedManifests?: Record<string, any>;
  /** Mock component factory */
  mockComponentFactory?: (moduleName: string, error?: Error) => any;
  /** Alternative loading strategies */
  loadingStrategies?: ('cdn' | 'local' | 'mirror' | 'embedded')[];
  /** CDN configuration */
  cdnConfig?: {
    baseUrl: string;
    fallbackPaths: string[];
  };
  /** Local fallback directory */
  localFallbackDir?: string;
  /** Mirror server configuration */
  mirrorServers?: string[];
  /** Embedded fallbacks for critical modules */
  embeddedFallbacks?: Record<string, any>;
  /** Grace period before activating fallbacks (ms) */
  gracePeriod?: number;
  /** Enable logging */
  enableLogging?: boolean;
}

export type FallbackStrategy =
  | 'graceful-degradation'
  | 'alternative-source'
  | 'mock-service'
  | 'cached-response'
  | 'embedded-fallback';

export interface FallbackContext {
  originalUrl: string;
  moduleName: string;
  error: Error;
  attemptCount: number;
  strategy: FallbackStrategy;
  timestamp: number;
}

/**
 * Fallback manager for handling unavailable remotes
 */
class FallbackManager {
  private fallbackCache = new Map<string, any>();
  private attemptCounts = new Map<string, number>();
  private lastAttempts = new Map<string, number>();
  private embeddedComponents = new Map<string, any>();

  constructor(private config: Required<FallbackConfig>) {
    this.initializeEmbeddedFallbacks();
  }

  private initializeEmbeddedFallbacks(): void {
    if (this.config.embeddedFallbacks) {
      for (const [moduleName, fallback] of Object.entries(
        this.config.embeddedFallbacks,
      )) {
        this.embeddedComponents.set(moduleName, fallback);
      }
    }
  }

  async handleFallback(context: FallbackContext): Promise<any> {
    const { originalUrl, moduleName, error, strategy } = context;

    if (this.config.enableLogging) {
      console.warn(
        `[FallbackManager] Handling fallback for ${moduleName} using strategy: ${strategy}`,
        {
          url: originalUrl,
          error: error.message,
          attempt: context.attemptCount,
        },
      );
    }

    this.updateAttemptCount(originalUrl);

    switch (strategy) {
      case 'graceful-degradation':
        return this.handleGracefulDegradation(context);
      case 'alternative-source':
        return this.handleAlternativeSource(context);
      case 'mock-service':
        return this.handleMockService(context);
      case 'cached-response':
        return this.handleCachedResponse(context);
      case 'embedded-fallback':
        return this.handleEmbeddedFallback(context);
      default:
        throw new Error(`Unknown fallback strategy: ${strategy}`);
    }
  }

  private async handleGracefulDegradation(
    context: FallbackContext,
  ): Promise<any> {
    const { moduleName } = context;

    // Return a graceful fallback component that shows loading state
    if (this.config.mockComponentFactory) {
      return this.config.mockComponentFactory(moduleName, context.error);
    }

    // Default graceful degradation
    return this.createGracefulFallbackComponent(moduleName, context.error);
  }

  private async handleAlternativeSource(
    context: FallbackContext,
  ): Promise<any> {
    const { originalUrl, moduleName } = context;

    // Try CDN fallback first
    if (
      this.config.loadingStrategies.includes('cdn') &&
      this.config.cdnConfig
    ) {
      try {
        const cdnResult = await this.tryLoadFromCdn(moduleName, originalUrl);
        if (cdnResult) {
          if (this.config.enableLogging) {
            console.log(
              `[FallbackManager] Successfully loaded ${moduleName} from CDN`,
            );
          }
          return cdnResult;
        }
      } catch (cdnError) {
        if (this.config.enableLogging) {
          console.warn(
            `[FallbackManager] CDN fallback failed for ${moduleName}:`,
            cdnError.message,
          );
        }
      }
    }

    // Try mirror servers
    if (
      this.config.loadingStrategies.includes('mirror') &&
      this.config.mirrorServers.length > 0
    ) {
      for (const mirror of this.config.mirrorServers) {
        try {
          const mirrorResult = await this.tryLoadFromMirror(
            moduleName,
            originalUrl,
            mirror,
          );
          if (mirrorResult) {
            if (this.config.enableLogging) {
              console.log(
                `[FallbackManager] Successfully loaded ${moduleName} from mirror: ${mirror}`,
              );
            }
            return mirrorResult;
          }
        } catch (mirrorError) {
          if (this.config.enableLogging) {
            console.warn(
              `[FallbackManager] Mirror fallback failed for ${moduleName} (${mirror}):`,
              mirrorError.message,
            );
          }
        }
      }
    }

    // Try local fallback
    if (
      this.config.loadingStrategies.includes('local') &&
      this.config.localFallbackDir
    ) {
      try {
        const localResult = await this.tryLoadFromLocal(moduleName);
        if (localResult) {
          if (this.config.enableLogging) {
            console.log(
              `[FallbackManager] Successfully loaded ${moduleName} from local fallback`,
            );
          }
          return localResult;
        }
      } catch (localError) {
        if (this.config.enableLogging) {
          console.warn(
            `[FallbackManager] Local fallback failed for ${moduleName}:`,
            localError.message,
          );
        }
      }
    }

    throw new Error(`All alternative sources failed for ${moduleName}`);
  }

  private async handleMockService(context: FallbackContext): Promise<any> {
    const { moduleName } = context;

    if (this.config.mockComponentFactory) {
      return this.config.mockComponentFactory(moduleName, context.error);
    }

    return this.createMockService(moduleName);
  }

  private handleCachedResponse(context: FallbackContext): any {
    const { originalUrl, moduleName } = context;

    // Check runtime cache first
    if (this.fallbackCache.has(originalUrl)) {
      if (this.config.enableLogging) {
        console.log(
          `[FallbackManager] Using cached response for ${moduleName}`,
        );
      }
      return this.fallbackCache.get(originalUrl);
    }

    // Check configured cached manifests
    if (this.config.cachedManifests[moduleName]) {
      if (this.config.enableLogging) {
        console.log(
          `[FallbackManager] Using configured cached manifest for ${moduleName}`,
        );
      }
      return this.config.cachedManifests[moduleName];
    }

    throw new Error(`No cached response available for ${moduleName}`);
  }

  private handleEmbeddedFallback(context: FallbackContext): any {
    const { moduleName } = context;

    if (this.embeddedComponents.has(moduleName)) {
      if (this.config.enableLogging) {
        console.log(
          `[FallbackManager] Using embedded fallback for ${moduleName}`,
        );
      }
      return this.embeddedComponents.get(moduleName);
    }

    throw new Error(`No embedded fallback available for ${moduleName}`);
  }

  private async tryLoadFromCdn(
    moduleName: string,
    originalUrl: string,
  ): Promise<any> {
    const { cdnConfig } = this.config;
    if (!cdnConfig) return null;

    for (const fallbackPath of cdnConfig.fallbackPaths) {
      const cdnUrl = `${cdnConfig.baseUrl}${fallbackPath}/${moduleName}/mf-manifest.json`;
      try {
        const response = await fetch(cdnUrl, { cache: 'no-cache' });
        if (response.ok) {
          const manifest = await response.json();
          this.cacheResponse(originalUrl, manifest);
          return manifest;
        }
      } catch (error) {
        // Continue to next fallback path
      }
    }

    return null;
  }

  private async tryLoadFromMirror(
    moduleName: string,
    originalUrl: string,
    mirror: string,
  ): Promise<any> {
    try {
      // Replace the base URL with mirror URL
      const originalUrlObj = new URL(originalUrl);
      const mirrorUrl = originalUrl.replace(originalUrlObj.origin, mirror);

      const response = await fetch(mirrorUrl, { cache: 'no-cache' });
      if (response.ok) {
        const manifest = await response.json();
        this.cacheResponse(originalUrl, manifest);
        return manifest;
      }
    } catch (error) {
      // Mirror failed
    }

    return null;
  }

  private async tryLoadFromLocal(moduleName: string): Promise<any> {
    if (!this.config.localFallbackDir) return null;

    try {
      // In a real implementation, this would load from local filesystem or bundled resources
      // For now, we'll simulate it by checking if we have local data
      const localPath = `${this.config.localFallbackDir}/${moduleName}/manifest.json`;

      // This is a placeholder - in real usage, you'd implement actual local loading
      if (
        typeof window !== 'undefined' &&
        (window as any).__MF_LOCAL_FALLBACKS__
      ) {
        const localFallbacks = (window as any).__MF_LOCAL_FALLBACKS__;
        if (localFallbacks[moduleName]) {
          return localFallbacks[moduleName];
        }
      }
    } catch (error) {
      // Local loading failed
    }

    return null;
  }

  private createGracefulFallbackComponent(
    moduleName: string,
    error?: Error,
  ): any {
    // This creates a component that can gracefully handle the missing module
    const fallbackComponent = {
      __esModule: true,
      default: function GracefulFallback(props: any = {}) {
        const message = `Module "${moduleName}" is temporarily unavailable`;

        // Try to use React if available
        if (typeof window !== 'undefined' && (window as any).React) {
          const React = (window as any).React;
          return React.createElement(
            'div',
            {
              className: 'mf-fallback mf-graceful',
              style: {
                padding: '16px',
                border: '1px dashed #d9d9d9',
                borderRadius: '4px',
                backgroundColor: '#fafafa',
                color: '#666',
                textAlign: 'center' as const,
                fontFamily: 'Arial, sans-serif',
              },
            },
            [
              React.createElement(
                'div',
                { key: 'message', style: { marginBottom: '8px' } },
                message,
              ),
              React.createElement(
                'small',
                { key: 'detail' },
                'The content will load when the service is available.',
              ),
            ],
          );
        }

        // Fallback for non-React environments
        return {
          render: () => `<div class="mf-fallback mf-graceful">${message}</div>`,
          message,
        };
      },
    };

    return fallbackComponent;
  }

  private createMockService(moduleName: string): any {
    return {
      __esModule: true,
      default: function MockService(props: any = {}) {
        if (typeof window !== 'undefined' && (window as any).React) {
          const React = (window as any).React;
          return React.createElement(
            'div',
            {
              className: 'mf-fallback mf-mock',
              style: {
                padding: '16px',
                border: '1px solid #ffa39e',
                borderRadius: '4px',
                backgroundColor: '#fff1f0',
                color: '#cf1322',
              },
            },
            `Mock service for ${moduleName}`,
          );
        }

        return {
          render: () =>
            `<div class="mf-fallback mf-mock">Mock service for ${moduleName}</div>`,
          moduleName,
        };
      },
    };
  }

  private updateAttemptCount(url: string): void {
    const current = this.attemptCounts.get(url) || 0;
    this.attemptCounts.set(url, current + 1);
    this.lastAttempts.set(url, Date.now());
  }

  private cacheResponse(url: string, response: any): void {
    this.fallbackCache.set(url, response);
  }

  public getAttemptCount(url: string): number {
    return this.attemptCounts.get(url) || 0;
  }

  public clearCache(): void {
    this.fallbackCache.clear();
    this.attemptCounts.clear();
    this.lastAttempts.clear();
  }

  public getStats(): {
    cachedResponses: number;
    totalAttempts: number;
    embeddedFallbacks: number;
  } {
    return {
      cachedResponses: this.fallbackCache.size,
      totalAttempts: Array.from(this.attemptCounts.values()).reduce(
        (a, b) => a + b,
        0,
      ),
      embeddedFallbacks: this.embeddedComponents.size,
    };
  }
}

/**
 * Creates comprehensive fallback mechanism plugin
 */
export function createFallbackMechanismsPlugin(
  config: FallbackConfig = {},
): ModuleFederationRuntimePlugin {
  const fullConfig: Required<FallbackConfig> = {
    autoDetect: true,
    fallbackRemotes: [],
    cachedManifests: {},
    mockComponentFactory: undefined,
    loadingStrategies: ['cdn', 'mirror', 'cached-response', 'mock-service'],
    cdnConfig: undefined,
    localFallbackDir: undefined,
    mirrorServers: [],
    embeddedFallbacks: {},
    gracePeriod: 5000,
    enableLogging: true,
    ...config,
  };

  const manager = new FallbackManager(fullConfig);
  const gracePeriodTimers = new Map<string, NodeJS.Timeout>();

  return {
    name: 'fallback-mechanisms-plugin',

    async fetch(url, options) {
      // Only handle manifest requests
      if (!url.includes('manifest.json') && !url.includes('mf-manifest.json')) {
        return;
      }

      const moduleName = extractModuleNameFromUrl(url);

      try {
        // Add grace period for initial requests
        if (fullConfig.gracePeriod > 0 && !gracePeriodTimers.has(url)) {
          const timer = setTimeout(() => {
            gracePeriodTimers.delete(url);
          }, fullConfig.gracePeriod);
          gracePeriodTimers.set(url, timer);

          // Try normal fetch first during grace period
          try {
            const response = (await Promise.race([
              fetch(url, options),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error('Grace period timeout')),
                  fullConfig.gracePeriod,
                ),
              ),
            ])) as Response;

            if (response.ok) {
              const manifest = await response.json();
              manager['cacheResponse'](url, manifest);
              return response;
            }
          } catch (graceError) {
            // Grace period failed, continue to fallbacks
            if (fullConfig.enableLogging) {
              console.warn(
                `[FallbackMechanisms] Grace period failed for ${url}:`,
                graceError.message,
              );
            }
          }
        }

        // If we reach here, try fallback strategies
        const context: FallbackContext = {
          originalUrl: url,
          moduleName,
          error: new Error('Primary source unavailable'),
          attemptCount: manager.getAttemptCount(url),
          strategy: 'alternative-source',
          timestamp: Date.now(),
        };

        const fallbackResult = await manager.handleFallback(context);

        if (fallbackResult) {
          return new Response(JSON.stringify(fallbackResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (error) {
        if (fullConfig.enableLogging) {
          console.error(
            `[FallbackMechanisms] All fallback strategies failed for ${url}:`,
            error.message,
          );
        }
      }

      // Return undefined to let other plugins handle
      return;
    },

    async errorLoadRemote(args) {
      if (args.lifecycle === 'onLoad') {
        // Component loading failed, provide graceful degradation
        const context: FallbackContext = {
          originalUrl: args.id || '',
          moduleName: args.id || 'unknown',
          error: args.error || new Error('Load failed'),
          attemptCount: 0,
          strategy: 'graceful-degradation',
          timestamp: Date.now(),
        };

        try {
          const fallback = await manager.handleFallback(context);
          return fallback;
        } catch (fallbackError) {
          if (fullConfig.enableLogging) {
            console.error(
              `[FallbackMechanisms] Graceful degradation failed:`,
              fallbackError.message,
            );
          }
        }
      }

      if (args.lifecycle === 'afterResolve') {
        // Manifest loading failed, try alternative sources
        const context: FallbackContext = {
          originalUrl: args.id || '',
          moduleName: extractModuleNameFromUrl(args.id || ''),
          error: args.error || new Error('Resolve failed'),
          attemptCount: manager.getAttemptCount(args.id || ''),
          strategy: 'alternative-source',
          timestamp: Date.now(),
        };

        try {
          const fallback = await manager.handleFallback(context);
          return fallback;
        } catch (fallbackError) {
          // Try cached response as last resort
          context.strategy = 'cached-response';
          try {
            return await manager.handleFallback(context);
          } catch (cacheError) {
            if (fullConfig.enableLogging) {
              console.error(
                `[FallbackMechanisms] All fallback strategies failed for afterResolve:`,
                cacheError.message,
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
 * Utility function to extract module name from URL
 */
function extractModuleNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts[pathParts.length - 2] || 'unknown-module';
  } catch {
    return 'unknown-module';
  }
}

/**
 * Pre-configured fallback plugin for common scenarios
 */
export const comprehensiveFallbackPlugin = createFallbackMechanismsPlugin({
  autoDetect: true,
  loadingStrategies: ['cdn', 'mirror', 'cached-response', 'mock-service'],
  gracePeriod: 3000,
  enableLogging: true,
  cdnConfig: {
    baseUrl: 'https://cdn.jsdelivr.net/npm',
    fallbackPaths: ['/dist', '/lib', '/build'],
  },
});
