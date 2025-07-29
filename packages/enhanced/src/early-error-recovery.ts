/**
 * Early Error Recovery Strategies
 *
 * Provides error recovery mechanisms that work before the Module Federation
 * hook system is fully initialized. Includes synchronous error handling,
 * immediate fallbacks, and bootstrap-level error recovery.
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export interface EarlyRecoveryConfig {
  /** Enable synchronous error recovery */
  enableSyncRecovery?: boolean;
  /** Enable pre-hook error handling */
  enablePreHookRecovery?: boolean;
  /** Enable bootstrap-level recovery */
  enableBootstrapRecovery?: boolean;
  /** Immediate fallback timeout (ms) */
  immediateFallbackTimeout?: number;
  /** Bootstrap error recovery strategies */
  bootstrapStrategies?: BootstrapRecoveryStrategy[];
  /** Synchronous fallback providers */
  syncFallbackProviders?: SyncFallbackProvider[];
  /** Pre-hook error handlers */
  preHookHandlers?: PreHookErrorHandler[];
  /** Enable graceful shutdown on critical errors */
  enableGracefulShutdown?: boolean;
  /** Critical error threshold before shutdown */
  criticalErrorThreshold?: number;
  /** Enable error recovery debugging */
  enableDebugging?: boolean;
  /** Custom error recovery logger */
  customLogger?: (level: string, message: string, data?: any) => void;
}

export type BootstrapRecoveryStrategy =
  | 'reload'
  | 'fallback-manifest'
  | 'safe-mode'
  | 'local-cache'
  | 'custom';

export interface SyncFallbackProvider {
  name: string;
  priority: number;
  canHandle: (error: Error, context: RecoveryContext) => boolean;
  provide: (error: Error, context: RecoveryContext) => any;
}

export interface PreHookErrorHandler {
  name: string;
  phase: 'init' | 'resolve' | 'load' | 'execute';
  handler: (error: Error, context: RecoveryContext) => Promise<any> | any;
}

export interface RecoveryContext {
  url?: string;
  moduleName?: string;
  phase: string;
  timestamp: number;
  attemptCount: number;
  originalError: Error;
  recoveryChain: string[];
}

export interface RecoveryResult {
  success: boolean;
  result?: any;
  fallbackUsed?: string;
  recoveryTime: number;
  error?: Error;
}

/**
 * Error recovery state manager
 */
class RecoveryStateManager {
  private errorCounts = new Map<string, number>();
  private recoveryHistory: RecoveryResult[] = [];
  private criticalErrors = 0;
  private isShuttingDown = false;

  recordError(key: string): number {
    const current = this.errorCounts.get(key) || 0;
    const newCount = current + 1;
    this.errorCounts.set(key, newCount);
    return newCount;
  }

  recordCriticalError(): void {
    this.criticalErrors++;
  }

  getCriticalErrorCount(): number {
    return this.criticalErrors;
  }

  recordRecovery(result: RecoveryResult): void {
    this.recoveryHistory.push(result);
    // Keep only last 100 recoveries
    if (this.recoveryHistory.length > 100) {
      this.recoveryHistory.shift();
    }
  }

  getErrorCount(key: string): number {
    return this.errorCounts.get(key) || 0;
  }

  getRecoveryHistory(): RecoveryResult[] {
    return [...this.recoveryHistory];
  }

  initiateShutdown(): void {
    this.isShuttingDown = true;
  }

  isInShutdown(): boolean {
    return this.isShuttingDown;
  }

  reset(): void {
    this.errorCounts.clear();
    this.recoveryHistory = [];
    this.criticalErrors = 0;
    this.isShuttingDown = false;
  }
}

/**
 * Synchronous error boundary for immediate recovery
 */
class SynchronousErrorBoundary {
  private fallbackProviders: SyncFallbackProvider[] = [];
  private logger: (level: string, message: string, data?: any) => void;

  constructor(
    providers: SyncFallbackProvider[],
    logger?: (level: string, message: string, data?: any) => void,
  ) {
    this.fallbackProviders = providers.sort((a, b) => b.priority - a.priority);
    this.logger = logger || this.defaultLogger;
  }

  private defaultLogger(level: string, message: string, data?: any): void {
    const logFn = console[level as keyof Console] || console.log;
    if (data) {
      (logFn as any)(`[EarlyRecovery] ${message}`, data);
    } else {
      (logFn as any)(`[EarlyRecovery] ${message}`);
    }
  }

  wrapSync<T>(
    operation: () => T,
    context: Partial<RecoveryContext> = {},
  ): T | any {
    const fullContext: RecoveryContext = {
      phase: 'sync-operation',
      timestamp: Date.now(),
      attemptCount: 0,
      originalError: new Error('Unknown error'),
      recoveryChain: [],
      ...context,
    };

    try {
      return operation();
    } catch (error) {
      fullContext.originalError = error;
      this.logger('error', 'Synchronous error caught', {
        error: error.message,
        context,
      });

      // Try fallback providers
      for (const provider of this.fallbackProviders) {
        if (provider.canHandle(error, fullContext)) {
          try {
            this.logger(
              'info',
              `Attempting sync recovery with provider: ${provider.name}`,
            );
            const result = provider.provide(error, fullContext);
            this.logger(
              'info',
              `Sync recovery successful with provider: ${provider.name}`,
            );
            return result;
          } catch (providerError) {
            this.logger(
              'warn',
              `Sync recovery failed with provider ${provider.name}`,
              providerError.message,
            );
            fullContext.recoveryChain.push(`${provider.name}:failed`);
          }
        }
      }

      // All providers failed, re-throw
      this.logger('error', 'All sync recovery providers failed');
      throw error;
    }
  }

  async wrapAsync<T>(
    operation: () => Promise<T>,
    context: Partial<RecoveryContext> = {},
  ): Promise<T | any> {
    const fullContext: RecoveryContext = {
      phase: 'async-operation',
      timestamp: Date.now(),
      attemptCount: 0,
      originalError: new Error('Unknown error'),
      recoveryChain: [],
      ...context,
    };

    try {
      return await operation();
    } catch (error) {
      fullContext.originalError = error;
      this.logger('error', 'Asynchronous error caught', {
        error: error.message,
        context,
      });

      // Try fallback providers (sync providers can handle async too)
      for (const provider of this.fallbackProviders) {
        if (provider.canHandle(error, fullContext)) {
          try {
            this.logger(
              'info',
              `Attempting async recovery with provider: ${provider.name}`,
            );
            const result = provider.provide(error, fullContext);
            this.logger(
              'info',
              `Async recovery successful with provider: ${provider.name}`,
            );
            return result;
          } catch (providerError) {
            this.logger(
              'warn',
              `Async recovery failed with provider ${provider.name}`,
              providerError.message,
            );
            fullContext.recoveryChain.push(`${provider.name}:failed`);
          }
        }
      }

      // All providers failed, re-throw
      this.logger('error', 'All async recovery providers failed');
      throw error;
    }
  }
}

/**
 * Bootstrap recovery manager
 */
class BootstrapRecoveryManager {
  private strategies: Map<
    BootstrapRecoveryStrategy,
    (error: Error, context: RecoveryContext) => Promise<any>
  > = new Map();
  private logger: (level: string, message: string, data?: any) => void;

  constructor(logger?: (level: string, message: string, data?: any) => void) {
    this.logger = logger || this.defaultLogger;
    this.initializeStrategies();
  }

  private defaultLogger(level: string, message: string, data?: any): void {
    const logFn = console[level as keyof Console] || console.log;
    if (data) {
      (logFn as any)(`[BootstrapRecovery] ${message}`, data);
    } else {
      (logFn as any)(`[BootstrapRecovery] ${message}`);
    }
  }

  private initializeStrategies(): void {
    this.strategies.set('reload', this.reloadStrategy.bind(this));
    this.strategies.set(
      'fallback-manifest',
      this.fallbackManifestStrategy.bind(this),
    );
    this.strategies.set('safe-mode', this.safeModeStrategy.bind(this));
    this.strategies.set('local-cache', this.localCacheStrategy.bind(this));
  }

  async executeRecovery(
    strategies: BootstrapRecoveryStrategy[],
    error: Error,
    context: RecoveryContext,
  ): Promise<RecoveryResult> {
    const startTime = Date.now();
    let lastError = error;

    for (const strategyName of strategies) {
      const strategy = this.strategies.get(strategyName);
      if (!strategy) {
        this.logger(
          'warn',
          `Unknown bootstrap recovery strategy: ${strategyName}`,
        );
        continue;
      }

      try {
        this.logger(
          'info',
          `Attempting bootstrap recovery with strategy: ${strategyName}`,
        );
        const result = await strategy(lastError, context);

        const recoveryTime = Date.now() - startTime;
        this.logger(
          'info',
          `Bootstrap recovery successful with strategy: ${strategyName}`,
          { recoveryTime },
        );

        return {
          success: true,
          result,
          fallbackUsed: strategyName,
          recoveryTime,
        };
      } catch (strategyError) {
        this.logger(
          'warn',
          `Bootstrap recovery failed with strategy ${strategyName}`,
          strategyError.message,
        );
        lastError = strategyError;
        context.recoveryChain.push(`${strategyName}:failed`);
      }
    }

    const recoveryTime = Date.now() - startTime;
    return {
      success: false,
      recoveryTime,
      error: lastError,
    };
  }

  private async reloadStrategy(
    error: Error,
    context: RecoveryContext,
  ): Promise<any> {
    if (typeof window !== 'undefined') {
      this.logger('info', 'Initiating page reload recovery');
      // Give some time for logging before reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return { strategy: 'reload', status: 'initiated' };
    }
    throw new Error('Reload strategy not available in non-browser environment');
  }

  private async fallbackManifestStrategy(
    error: Error,
    context: RecoveryContext,
  ): Promise<any> {
    // Create a minimal manifest that allows the app to continue
    const fallbackManifest = {
      id: context.moduleName || 'fallback-module',
      name: context.moduleName || 'fallback-module',
      metaData: {
        name: context.moduleName || 'fallback-module',
        type: 'fallback',
        buildInfo: {
          buildVersion: 'emergency-fallback',
          buildName: 'emergency',
        },
        remoteEntry: {
          name: 'fallback.js',
          path: '',
          type: 'esm',
        },
        types: {
          path: '',
          name: '',
          zip: '',
          api: '',
        },
        globalName: context.moduleName || 'FallbackModule',
        pluginVersion: '0.0.0-emergency',
        publicPath: 'auto',
      },
      shared: [],
      remotes: [],
      exposes: [
        {
          id: `${context.moduleName || 'fallback'}:emergency`,
          name: 'emergency',
          assets: { js: { sync: [], async: [] }, css: { sync: [], async: [] } },
          path: './Emergency',
        },
      ],
    };

    this.logger('info', 'Generated fallback manifest for emergency recovery');
    return fallbackManifest;
  }

  private async safeModeStrategy(
    error: Error,
    context: RecoveryContext,
  ): Promise<any> {
    // Return a safe mode component that displays error information
    const safeComponent = {
      __esModule: true,
      default: function SafeModeComponent(props: any = {}) {
        const message = `Application is running in safe mode due to: ${error.message}`;

        if (typeof window !== 'undefined' && (window as any).React) {
          const React = (window as any).React;
          return React.createElement(
            'div',
            {
              style: {
                padding: '20px',
                border: '2px solid #ff4d4f',
                borderRadius: '8px',
                backgroundColor: '#fff2f0',
                color: '#cf1322',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center' as const,
                maxWidth: '600px',
                margin: '20px auto',
              },
            },
            [
              React.createElement('h2', { key: 'title' }, 'Safe Mode'),
              React.createElement('p', { key: 'message' }, message),
              React.createElement('details', { key: 'details' }, [
                React.createElement(
                  'summary',
                  { key: 'summary' },
                  'Error Details',
                ),
                React.createElement(
                  'pre',
                  {
                    key: 'error',
                    style: { textAlign: 'left' as const, fontSize: '12px' },
                  },
                  JSON.stringify(
                    {
                      error: error.message,
                      context,
                      timestamp: new Date().toISOString(),
                    },
                    null,
                    2,
                  ),
                ),
              ]),
            ],
          );
        }

        return {
          render: () => `<div class="safe-mode-fallback">${message}</div>`,
          message,
          error: error.message,
        };
      },
    };

    this.logger('info', 'Generated safe mode component');
    return safeComponent;
  }

  private async localCacheStrategy(
    error: Error,
    context: RecoveryContext,
  ): Promise<any> {
    // Try to load from browser cache or local storage
    if (typeof window !== 'undefined') {
      const cacheKey = `mf_cache_${context.moduleName || 'unknown'}`;

      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          this.logger('info', `Loaded from local cache: ${cacheKey}`);
          return parsedCache;
        }
      } catch (cacheError) {
        this.logger('warn', 'Local cache strategy failed', cacheError.message);
      }
    }

    throw new Error('No local cache available');
  }
}

/**
 * Built-in sync fallback providers
 */
const BUILT_IN_SYNC_PROVIDERS: SyncFallbackProvider[] = [
  {
    name: 'json-parse-fallback',
    priority: 100,
    canHandle: (error) =>
      error.message.includes('JSON') || error.name === 'SyntaxError',
    provide: (error, context) => {
      return {
        error: 'Invalid JSON',
        message: 'The manifest could not be parsed as JSON',
        fallback: true,
        context,
      };
    },
  },
  {
    name: 'network-error-fallback',
    priority: 90,
    canHandle: (error) =>
      error.message.includes('fetch') || error.name === 'TypeError',
    provide: (error, context) => {
      return {
        error: 'Network Error',
        message: 'The manifest could not be loaded due to network issues',
        fallback: true,
        offline: !navigator.onLine,
        context,
      };
    },
  },
  {
    name: 'generic-error-fallback',
    priority: 10,
    canHandle: () => true, // Catch-all
    provide: (error, context) => {
      return {
        error: 'Generic Error',
        message: `An unexpected error occurred: ${error.message}`,
        fallback: true,
        context,
      };
    },
  },
];

/**
 * Early error recovery engine
 */
class EarlyErrorRecoveryEngine {
  private stateManager = new RecoveryStateManager();
  private syncBoundary: SynchronousErrorBoundary;
  private bootstrapManager: BootstrapRecoveryManager;
  private logger: (level: string, message: string, data?: any) => void;

  constructor(private config: Required<EarlyRecoveryConfig>) {
    this.logger = config.customLogger || this.defaultLogger;

    const allProviders = [
      ...BUILT_IN_SYNC_PROVIDERS,
      ...config.syncFallbackProviders,
    ];
    this.syncBoundary = new SynchronousErrorBoundary(allProviders, this.logger);
    this.bootstrapManager = new BootstrapRecoveryManager(this.logger);

    this.setupGlobalHandlers();
  }

  private defaultLogger(level: string, message: string, data?: any): void {
    if (!this.config.enableDebugging && level === 'debug') return;

    const logFn = console[level as keyof Console] || console.log;
    if (data) {
      (logFn as any)(`[EarlyRecovery] ${message}`, data);
    } else {
      (logFn as any)(`[EarlyRecovery] ${message}`);
    }
  }

  private setupGlobalHandlers(): void {
    if (typeof window === 'undefined') return;

    // Handle early errors before Module Federation is ready
    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (
        this.isModuleFederationError(
          error || new Error(message?.toString() || 'Unknown error'),
        )
      ) {
        this.handleEarlyError(
          error || new Error(message?.toString() || 'Unknown error'),
          {
            phase: 'early-script-error',
            source,
            lineno,
            colno,
          },
        );
      }

      if (originalError) {
        return originalError.call(
          window,
          message,
          source,
          lineno,
          colno,
          error,
        );
      }
      return false;
    };

    // Handle unhandled promise rejections
    const originalUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      if (this.isModuleFederationError(event.reason)) {
        this.handleEarlyError(event.reason, {
          phase: 'early-promise-rejection',
        });
        event.preventDefault();
      }

      if (originalUnhandledRejection) {
        return originalUnhandledRejection.call(window, event);
      }
    };
  }

  private isModuleFederationError(error: Error): boolean {
    if (!error) return false;

    const errorStr = error.toString().toLowerCase();
    const stackStr = error.stack?.toLowerCase() || '';

    return (
      errorStr.includes('manifest') ||
      errorStr.includes('federation') ||
      errorStr.includes('remote') ||
      errorStr.includes('mf-') ||
      stackStr.includes('module-federation') ||
      (error.message && error.message.includes('RUNTIME_'))
    );
  }

  private handleEarlyError(error: Error, context: any): void {
    const errorKey = `${context.phase}_${error.message}`;
    const errorCount = this.stateManager.recordError(errorKey);

    this.logger('error', `Early error detected (${errorCount})`, {
      error: error.message,
      context,
    });

    // Check for critical error threshold
    if (
      error.message.includes('critical') ||
      error.message.includes('RUNTIME_')
    ) {
      this.stateManager.recordCriticalError();

      if (
        this.stateManager.getCriticalErrorCount() >=
        this.config.criticalErrorThreshold
      ) {
        if (this.config.enableGracefulShutdown) {
          this.initiateGracefulShutdown();
          return;
        }
      }
    }

    // Try immediate recovery
    if (this.config.enableSyncRecovery) {
      try {
        const recoveryContext: RecoveryContext = {
          phase: context.phase || 'early-error',
          timestamp: Date.now(),
          attemptCount: errorCount,
          originalError: error,
          recoveryChain: [],
          ...context,
        };

        const result = this.syncBoundary.wrapSync(() => {
          throw error; // Let the boundary handle it
        }, recoveryContext);

        this.logger('info', 'Early error recovery successful');
        this.stateManager.recordRecovery({
          success: true,
          result,
          recoveryTime: Date.now() - recoveryContext.timestamp,
        });
      } catch (recoveryError) {
        this.logger(
          'error',
          'Early error recovery failed',
          recoveryError.message,
        );
        this.stateManager.recordRecovery({
          success: false,
          error: recoveryError,
          recoveryTime: Date.now() - Date.now(),
        });
      }
    }
  }

  private initiateGracefulShutdown(): void {
    if (this.stateManager.isInShutdown()) return;

    this.logger('error', 'Initiating graceful shutdown due to critical errors');
    this.stateManager.initiateShutdown();

    // Attempt to show user-friendly error message
    if (typeof window !== 'undefined') {
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          color: white;
          font-family: Arial, sans-serif;
          text-align: center;
        ">
          <div style="padding: 40px; background: #1a1a1a; border-radius: 8px; max-width: 500px;">
            <h2>Application Error</h2>
            <p>The application has encountered critical errors and needs to be reloaded.</p>
            <button onclick="window.location.reload()" style="
              padding: 10px 20px;
              background: #1890ff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 20px;
            ">Reload Application</button>
          </div>
        </div>
      `;
      document.body.appendChild(errorDiv);
    }
  }

  public wrapSync<T>(
    operation: () => T,
    context?: Partial<RecoveryContext>,
  ): T {
    if (!this.config.enableSyncRecovery) {
      return operation();
    }
    return this.syncBoundary.wrapSync(operation, context);
  }

  public async wrapAsync<T>(
    operation: () => Promise<T>,
    context?: Partial<RecoveryContext>,
  ): Promise<T> {
    if (!this.config.enableSyncRecovery) {
      return operation();
    }
    return this.syncBoundary.wrapAsync(operation, context);
  }

  public async recoverBootstrap(
    error: Error,
    context?: Partial<RecoveryContext>,
  ): Promise<RecoveryResult> {
    if (!this.config.enableBootstrapRecovery) {
      throw error;
    }

    const fullContext: RecoveryContext = {
      phase: 'bootstrap',
      timestamp: Date.now(),
      attemptCount: 1,
      originalError: error,
      recoveryChain: [],
      ...context,
    };

    return this.bootstrapManager.executeRecovery(
      this.config.bootstrapStrategies,
      error,
      fullContext,
    );
  }

  public getStats(): {
    errorCounts: Map<string, number>;
    recoveryHistory: RecoveryResult[];
    criticalErrors: number;
    isInShutdown: boolean;
  } {
    return {
      errorCounts: new Map(this.stateManager['errorCounts']),
      recoveryHistory: this.stateManager.getRecoveryHistory(),
      criticalErrors: this.stateManager.getCriticalErrorCount(),
      isInShutdown: this.stateManager.isInShutdown(),
    };
  }

  public reset(): void {
    this.stateManager.reset();
  }
}

/**
 * Creates early error recovery plugin
 */
export function createEarlyErrorRecoveryPlugin(
  config: EarlyRecoveryConfig = {},
): ModuleFederationRuntimePlugin {
  const fullConfig: Required<EarlyRecoveryConfig> = {
    enableSyncRecovery: true,
    enablePreHookRecovery: true,
    enableBootstrapRecovery: true,
    immediateFallbackTimeout: 1000,
    bootstrapStrategies: ['fallback-manifest', 'safe-mode'],
    syncFallbackProviders: [],
    preHookHandlers: [],
    enableGracefulShutdown: true,
    criticalErrorThreshold: 3,
    enableDebugging: false,
    customLogger: undefined,
    ...config,
  };

  const recoveryEngine = new EarlyErrorRecoveryEngine(fullConfig);

  return {
    name: 'early-error-recovery-plugin',

    async beforeInit(args) {
      // Wrap the initialization in recovery
      return recoveryEngine.wrapSync(
        () => {
          if (fullConfig.enableDebugging) {
            console.log(
              '[EarlyRecovery] Initializing with early error recovery',
            );
          }
          return args;
        },
        { phase: 'before-init' },
      );
    },

    async init(args) {
      return recoveryEngine.wrapAsync(
        async () => {
          return args;
        },
        { phase: 'init' },
      );
    },

    async errorLoadRemote(args) {
      if (args.lifecycle === 'beforeResolve' || args.lifecycle === 'init') {
        // This is an early error, try bootstrap recovery
        try {
          const recoveryResult = await recoveryEngine.recoverBootstrap(
            args.error,
            {
              moduleName: args.id,
              phase: args.lifecycle,
            },
          );

          if (recoveryResult.success) {
            return recoveryResult.result;
          }
        } catch (recoveryError) {
          if (fullConfig.enableDebugging) {
            console.error(
              '[EarlyRecovery] Bootstrap recovery failed:',
              recoveryError.message,
            );
          }
        }
      }

      return args;
    },
  };
}

/**
 * Utility functions for early recovery
 */
export class EarlyRecoveryUtils {
  static createPlugin = createEarlyErrorRecoveryPlugin;

  static createCustomSyncProvider(
    name: string,
    canHandle: (error: Error, context: RecoveryContext) => boolean,
    provide: (error: Error, context: RecoveryContext) => any,
    priority = 50,
  ): SyncFallbackProvider {
    return { name, priority, canHandle, provide };
  }

  static createPreHookHandler(
    name: string,
    phase: 'init' | 'resolve' | 'load' | 'execute',
    handler: (error: Error, context: RecoveryContext) => Promise<any> | any,
  ): PreHookErrorHandler {
    return { name, phase, handler };
  }

  static wrapFunction<T extends (...args: any[]) => any>(
    fn: T,
    recoveryEngine: any,
    context?: Partial<RecoveryContext>,
  ): T {
    return ((...args: Parameters<T>) => {
      return recoveryEngine.wrapSync(() => fn(...args), context);
    }) as T;
  }

  static wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    recoveryEngine: any,
    context?: Partial<RecoveryContext>,
  ): T {
    return (async (...args: Parameters<T>) => {
      return recoveryEngine.wrapAsync(() => fn(...args), context);
    }) as T;
  }
}

/**
 * Pre-configured recovery plugin for production use
 */
export const productionRecoveryPlugin = createEarlyErrorRecoveryPlugin({
  enableSyncRecovery: true,
  enableBootstrapRecovery: true,
  bootstrapStrategies: ['fallback-manifest', 'reload'],
  enableGracefulShutdown: true,
  criticalErrorThreshold: 2,
  enableDebugging: false,
});

/**
 * Pre-configured recovery plugin for development use
 */
export const developmentRecoveryPlugin = createEarlyErrorRecoveryPlugin({
  enableSyncRecovery: true,
  enableBootstrapRecovery: true,
  bootstrapStrategies: ['safe-mode', 'fallback-manifest'],
  enableGracefulShutdown: false,
  criticalErrorThreshold: 10,
  enableDebugging: true,
});
