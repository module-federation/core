/**
 * Global Error Handler for Module Federation
 *
 * Provides synchronous error handling that works before hooks are initialized.
 * This handler captures errors at the earliest possible point in the loading process
 * and provides fallback mechanisms that don't rely on the hook system.
 */

export interface GlobalErrorConfig {
  /** Enable console logging of errors */
  enableLogging?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retry attempts (ms) */
  retryDelay?: number;
  /** Fallback component factory for React components */
  fallbackComponentFactory?: (error: Error) => any;
  /** Global fallback manifest */
  fallbackManifest?: any;
  /** Custom error handlers by error type */
  errorHandlers?: {
    [key: string]: (error: Error, context: any) => any;
  };
}

/**
 * Error types that can occur before hooks are ready
 */
export type EarlyErrorType =
  | 'SCRIPT_LOAD_ERROR'
  | 'MANIFEST_FETCH_ERROR'
  | 'JSON_PARSE_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR';

/**
 * Context information for error handling
 */
export interface ErrorContext {
  url?: string;
  moduleName?: string;
  lifecycle?: string;
  timestamp: number;
  retryCount: number;
  originalError: Error;
  errorType: EarlyErrorType;
}

/**
 * Global error state management
 */
class GlobalErrorManager {
  private static instance: GlobalErrorManager;
  private config: Required<GlobalErrorConfig>;
  private errorQueue: ErrorContext[] = [];
  private retryCache = new Map<string, number>();
  private fallbackCache = new Map<string, any>();

  private constructor(config: GlobalErrorConfig = {}) {
    this.config = {
      enableLogging: true,
      maxRetries: 3,
      retryDelay: 1000,
      fallbackComponentFactory: this.defaultFallbackComponent,
      fallbackManifest: null,
      errorHandlers: {},
      ...config,
    };

    this.setupGlobalHandlers();
  }

  public static getInstance(config?: GlobalErrorConfig): GlobalErrorManager {
    if (!GlobalErrorManager.instance) {
      GlobalErrorManager.instance = new GlobalErrorManager(config);
    }
    return GlobalErrorManager.instance;
  }

  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason;
        if (this.isModuleFederationError(error)) {
          this.handleError(error, {
            errorType: 'NETWORK_ERROR',
            timestamp: Date.now(),
            retryCount: 0,
            originalError: error,
          });
          event.preventDefault();
        }
      });

      // Handle script loading errors
      window.addEventListener(
        'error',
        (event) => {
          if (event.target && (event.target as any).tagName === 'SCRIPT') {
            const script = event.target as HTMLScriptElement;
            const error = new Error(`Script load failed: ${script.src}`);

            this.handleError(error, {
              url: script.src,
              errorType: 'SCRIPT_LOAD_ERROR',
              timestamp: Date.now(),
              retryCount: 0,
              originalError: error,
            });
          }
        },
        true,
      );
    }

    // Monkey patch fetch for early interception
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        try {
          const response = await originalFetch(input, init);
          const url = typeof input === 'string' ? input : input.toString();

          // Intercept manifest requests
          if (
            url.includes('manifest.json') ||
            url.includes('mf-manifest.json')
          ) {
            if (!response.ok) {
              const error = new Error(
                `Manifest fetch failed: ${response.status} ${response.statusText}`,
              );
              return this.handleManifestError(error, url, response);
            }
          }

          return response;
        } catch (error) {
          const url = typeof input === 'string' ? input : input.toString();
          if (
            url.includes('manifest.json') ||
            url.includes('mf-manifest.json')
          ) {
            return this.handleManifestError(error, url);
          }
          throw error;
        }
      };
    }
  }

  private isModuleFederationError(error: any): boolean {
    if (!error || typeof error !== 'object') return false;

    const errorStr = error.toString().toLowerCase();
    return (
      errorStr.includes('manifest') ||
      errorStr.includes('federation') ||
      errorStr.includes('remote') ||
      errorStr.includes('mf-') ||
      (error.message && error.message.includes('RUNTIME_'))
    );
  }

  private async handleManifestError(
    error: any,
    url: string,
    response?: Response,
  ): Promise<Response> {
    const context: ErrorContext = {
      url,
      errorType: 'MANIFEST_FETCH_ERROR',
      timestamp: Date.now(),
      retryCount: this.retryCache.get(url) || 0,
      originalError: error,
    };

    if (this.config.enableLogging) {
      console.error(
        '[GlobalErrorHandler] Manifest error:',
        error.message,
        'URL:',
        url,
      );
    }

    // Try custom handler first
    const customHandler = this.config.errorHandlers['MANIFEST_FETCH_ERROR'];
    if (customHandler) {
      try {
        const result = await customHandler(error, context);
        if (result && typeof result.json === 'function') {
          return result;
        } else if (result) {
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (handlerError) {
        console.error(
          '[GlobalErrorHandler] Custom handler failed:',
          handlerError,
        );
      }
    }

    // Try fallback manifest
    if (this.config.fallbackManifest) {
      console.log('[GlobalErrorHandler] Using fallback manifest for:', url);
      return new Response(JSON.stringify(this.config.fallbackManifest), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If we have a response but it's not ok, try to create a minimal manifest
    if (response && !response.ok) {
      const minimalManifest = this.createMinimalManifest(url);
      return new Response(JSON.stringify(minimalManifest), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Re-throw the error if no fallbacks work
    throw error;
  }

  private createMinimalManifest(url: string): any {
    const moduleName = this.extractModuleNameFromUrl(url);
    return {
      id: moduleName,
      name: moduleName,
      metaData: {
        name: moduleName,
        type: 'app',
        buildInfo: {
          buildVersion: 'unknown',
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
        pluginVersion: '0.0.0',
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
      return pathParts[pathParts.length - 2] || 'unknown-module';
    } catch {
      return 'unknown-module';
    }
  }

  private defaultFallbackComponent(error: Error): any {
    // This will be used when React is available
    const createElement = (globalThis as any).React?.createElement;
    if (createElement) {
      return createElement(
        'div',
        {
          style: {
            padding: '16px',
            border: '1px solid #ff4d4f',
            borderRadius: '4px',
            backgroundColor: '#fff2f0',
            color: '#cf1322',
            fontFamily: 'Arial, sans-serif',
          },
        },
        `Module loading failed: ${error.message}`,
      );
    }

    // Fallback for non-React environments
    return {
      __esModule: true,
      default: () => `Module loading failed: ${error.message}`,
    };
  }

  public handleError(error: Error, context: ErrorContext): any {
    this.errorQueue.push(context);

    if (this.config.enableLogging) {
      console.error('[GlobalErrorHandler]', {
        type: context.errorType,
        message: error.message,
        url: context.url,
        retryCount: context.retryCount,
      });
    }

    // Try custom handler
    const customHandler = this.config.errorHandlers[context.errorType];
    if (customHandler) {
      try {
        return customHandler(error, context);
      } catch (handlerError) {
        console.error(
          '[GlobalErrorHandler] Custom handler failed:',
          handlerError,
        );
      }
    }

    // Default handling based on error type
    switch (context.errorType) {
      case 'SCRIPT_LOAD_ERROR':
        return this.handleScriptError(error, context);
      case 'MANIFEST_FETCH_ERROR':
        return this.config.fallbackManifest || null;
      case 'JSON_PARSE_ERROR':
        return this.createMinimalManifest(context.url || 'unknown');
      default:
        return this.config.fallbackComponentFactory(error);
    }
  }

  private handleScriptError(error: Error, context: ErrorContext): any {
    // For script errors, return a fallback component
    return this.config.fallbackComponentFactory(error);
  }

  public getErrorQueue(): ErrorContext[] {
    return [...this.errorQueue];
  }

  public clearErrorQueue(): void {
    this.errorQueue = [];
  }

  public updateConfig(newConfig: Partial<GlobalErrorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Initialize global error handling
 */
export function initializeGlobalErrorHandler(
  config: GlobalErrorConfig = {},
): GlobalErrorManager {
  return GlobalErrorManager.getInstance(config);
}

/**
 * Get the current global error handler instance
 */
export function getGlobalErrorHandler(): GlobalErrorManager | null {
  return (GlobalErrorManager as any).instance || null;
}

/**
 * Synchronous error boundary for immediate error handling
 */
export function createSynchronousErrorBoundary(
  fallbackFactory?: (error: Error) => any,
) {
  const errorHandler = getGlobalErrorHandler();

  return function synchronousErrorBoundary<T>(
    fn: () => T,
    context?: Partial<ErrorContext>,
  ): T | any {
    try {
      return fn();
    } catch (error) {
      const errorContext: ErrorContext = {
        timestamp: Date.now(),
        retryCount: 0,
        originalError: error,
        errorType: 'VALIDATION_ERROR',
        ...context,
      };

      if (errorHandler) {
        return errorHandler.handleError(error, errorContext);
      }

      if (fallbackFactory) {
        return fallbackFactory(error);
      }

      // Last resort - re-throw
      throw error;
    }
  };
}

// Initialize the global error handler by default
if (typeof window !== 'undefined') {
  initializeGlobalErrorHandler();
}
