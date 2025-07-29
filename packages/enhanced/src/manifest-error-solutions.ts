/**
 * Comprehensive Manifest Error Solutions
 *
 * Main entry point that integrates all manifest error handling solutions.
 * Provides easy-to-use configurations and complete error handling strategies.
 */

// Import all solution modules
export {
  createManifestInterceptorPlugin,
  type ManifestInterceptorConfig,
  manifestInterceptorPlugin,
} from './manifest-interceptor-plugin';

export {
  initializeGlobalErrorHandler,
  getGlobalErrorHandler,
  createSynchronousErrorBoundary,
  type GlobalErrorConfig,
} from './global-error-handler';

export {
  createCircuitBreakerPlugin,
  CircuitBreakerUtils,
  manifestCircuitBreakerPlugin,
  type CircuitBreakerConfig,
  type CircuitState,
} from './circuit-breaker-plugin';

export {
  createFallbackMechanismsPlugin,
  comprehensiveFallbackPlugin,
  type FallbackConfig,
  type FallbackStrategy,
} from './fallback-mechanisms';

export {
  createPreemptiveValidationPlugin,
  comprehensiveValidationPlugin,
  type ValidationConfig,
  type ValidationRule,
} from './preemptive-validation';

export {
  createNetworkRetryPlugin,
  NetworkRetryUtils,
  manifestRetryPlugin,
  aggressiveRetryPlugin,
  conservativeRetryPlugin,
  type NetworkRetryConfig,
} from './network-retry-plugin';

export {
  createMockManifestGeneratorPlugin,
  MockManifestUtils,
  developmentMockPlugin,
  testingMockPlugin,
  fallbackMockPlugin,
  type MockManifestConfig,
} from './mock-manifest-generator';

export {
  createEarlyErrorRecoveryPlugin,
  EarlyRecoveryUtils,
  productionRecoveryPlugin,
  developmentRecoveryPlugin,
  type EarlyRecoveryConfig,
} from './early-error-recovery';

import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

/**
 * Complete configuration for all manifest error solutions
 */
export interface ComprehensiveErrorConfig {
  /** Enable manifest interceptor with early error detection */
  enableInterceptor?: boolean;
  interceptorConfig?: import('./manifest-interceptor-plugin').ManifestInterceptorConfig;

  /** Enable global error handler for synchronous errors */
  enableGlobalHandler?: boolean;
  globalHandlerConfig?: import('./global-error-handler').GlobalErrorConfig;

  /** Enable circuit breaker for manifest unavailability */
  enableCircuitBreaker?: boolean;
  circuitBreakerConfig?: import('./circuit-breaker-plugin').CircuitBreakerConfig;

  /** Enable comprehensive fallback mechanisms */
  enableFallbacks?: boolean;
  fallbackConfig?: import('./fallback-mechanisms').FallbackConfig;

  /** Enable preemptive validation strategies */
  enableValidation?: boolean;
  validationConfig?: import('./preemptive-validation').ValidationConfig;

  /** Enable network retry with exponential backoff */
  enableRetry?: boolean;
  retryConfig?: import('./network-retry-plugin').NetworkRetryConfig;

  /** Enable mock manifest generation for development */
  enableMockGeneration?: boolean;
  mockConfig?: import('./mock-manifest-generator').MockManifestConfig;

  /** Enable early error recovery strategies */
  enableEarlyRecovery?: boolean;
  earlyRecoveryConfig?: import('./early-error-recovery').EarlyRecoveryConfig;

  /** Plugin execution order (lower numbers execute first) */
  executionOrder?: {
    earlyRecovery?: number;
    globalHandler?: number;
    interceptor?: number;
    validation?: number;
    circuitBreaker?: number;
    retry?: number;
    fallbacks?: number;
    mockGeneration?: number;
  };

  /** Enable solution debugging and monitoring */
  enableDebugging?: boolean;

  /** Custom error reporting callback */
  onError?: (error: Error, solution: string, context: any) => void;
}

/**
 * Predefined configuration presets
 */
export const SOLUTION_PRESETS = {
  /** Development preset with mocks and detailed logging */
  development: {
    enableInterceptor: true,
    interceptorConfig: {
      timeout: 5000,
      enableMockInDev: true,
      validateStructure: true,
    },
    enableGlobalHandler: true,
    globalHandlerConfig: {
      enableLogging: true,
      maxRetries: 2,
    },
    enableCircuitBreaker: true,
    circuitBreakerConfig: {
      failureThreshold: 3,
      enableLogging: true,
    },
    enableFallbacks: true,
    fallbackConfig: {
      autoDetect: true,
      enableLogging: true,
      gracePeriod: 2000,
    },
    enableValidation: true,
    validationConfig: {
      enableLogging: true,
      failFast: false,
    },
    enableRetry: true,
    retryConfig: {
      maxRetries: 2,
      enableLogging: true,
    },
    enableMockGeneration: true,
    mockConfig: {
      enabled: true,
      enableLogging: true,
      defaultTemplate: 'react-app' as const,
    },
    enableEarlyRecovery: true,
    earlyRecoveryConfig: {
      enableDebugging: true,
      bootstrapStrategies: ['safe-mode' as const, 'fallback-manifest' as const],
    },
    enableDebugging: true,
  } as ComprehensiveErrorConfig,

  /** Production preset with robust error handling */
  production: {
    enableInterceptor: true,
    interceptorConfig: {
      timeout: 10000,
      validateStructure: true,
      enableMockInDev: false,
    },
    enableGlobalHandler: true,
    globalHandlerConfig: {
      enableLogging: false,
      maxRetries: 3,
    },
    enableCircuitBreaker: true,
    circuitBreakerConfig: {
      failureThreshold: 5,
      enableLogging: false,
      fallbackStrategy: 'return-cached' as const,
    },
    enableFallbacks: true,
    fallbackConfig: {
      autoDetect: true,
      enableLogging: false,
      loadingStrategies: [
        'cdn' as const,
        'mirror' as const,
        'cached-response' as const,
      ],
    },
    enableValidation: true,
    validationConfig: {
      enableLogging: false,
      failFast: true,
      parallelValidation: true,
    },
    enableRetry: true,
    retryConfig: {
      maxRetries: 3,
      enableLogging: false,
      adaptiveRetry: true,
    },
    enableMockGeneration: false,
    enableEarlyRecovery: true,
    earlyRecoveryConfig: {
      enableDebugging: false,
      bootstrapStrategies: ['fallback-manifest' as const, 'reload' as const],
      enableGracefulShutdown: true,
    },
    enableDebugging: false,
  } as ComprehensiveErrorConfig,

  /** Testing preset with predictable mocks */
  testing: {
    enableInterceptor: true,
    interceptorConfig: {
      timeout: 1000,
      validateStructure: false,
    },
    enableGlobalHandler: true,
    globalHandlerConfig: {
      enableLogging: false,
      maxRetries: 1,
    },
    enableCircuitBreaker: false,
    enableFallbacks: true,
    fallbackConfig: {
      autoDetect: true,
      enableLogging: false,
      gracePeriod: 0,
    },
    enableValidation: false,
    enableRetry: false,
    enableMockGeneration: true,
    mockConfig: {
      enabled: true,
      enableLogging: false,
      defaultTemplate: 'minimal' as const,
      seed: 'test-seed',
      cacheDuration: 0,
    },
    enableEarlyRecovery: true,
    earlyRecoveryConfig: {
      enableDebugging: false,
      bootstrapStrategies: ['safe-mode' as const],
    },
    enableDebugging: false,
  } as ComprehensiveErrorConfig,

  /** Minimal preset with basic error handling */
  minimal: {
    enableInterceptor: true,
    interceptorConfig: { timeout: 5000 },
    enableGlobalHandler: true,
    enableRetry: true,
    retryConfig: { maxRetries: 2 },
    enableFallbacks: true,
    enableDebugging: false,
  } as ComprehensiveErrorConfig,
};

/**
 * Creates a comprehensive manifest error handling solution
 */
export function createComprehensiveManifestErrorSolution(
  config: ComprehensiveErrorConfig = {},
): ModuleFederationRuntimePlugin[] {
  const plugins: Array<{
    plugin: ModuleFederationRuntimePlugin;
    order: number;
  }> = [];

  // Default execution order
  const defaultOrder = {
    earlyRecovery: 100,
    globalHandler: 200,
    interceptor: 300,
    validation: 400,
    circuitBreaker: 500,
    retry: 600,
    fallbacks: 700,
    mockGeneration: 800,
  };

  const executionOrder = { ...defaultOrder, ...config.executionOrder };

  // Initialize global error handler first if enabled
  if (config.enableGlobalHandler !== false) {
    import('./global-error-handler').then(
      ({ initializeGlobalErrorHandler }) => {
        initializeGlobalErrorHandler(config.globalHandlerConfig);
      },
    );
  }

  // Early Error Recovery Plugin
  if (config.enableEarlyRecovery !== false) {
    import('./early-error-recovery').then(
      ({ createEarlyErrorRecoveryPlugin }) => {
        plugins.push({
          plugin: createEarlyErrorRecoveryPlugin(config.earlyRecoveryConfig),
          order: executionOrder.earlyRecovery,
        });
      },
    );
  }

  // Manifest Interceptor Plugin
  if (config.enableInterceptor !== false) {
    import('./manifest-interceptor-plugin').then(
      ({ createManifestInterceptorPlugin }) => {
        plugins.push({
          plugin: createManifestInterceptorPlugin(config.interceptorConfig),
          order: executionOrder.interceptor,
        });
      },
    );
  }

  // Preemptive Validation Plugin
  if (config.enableValidation !== false) {
    import('./preemptive-validation').then(
      ({ createPreemptiveValidationPlugin }) => {
        plugins.push({
          plugin: createPreemptiveValidationPlugin(config.validationConfig),
          order: executionOrder.validation,
        });
      },
    );
  }

  // Circuit Breaker Plugin
  if (config.enableCircuitBreaker !== false) {
    import('./circuit-breaker-plugin').then(
      ({ createCircuitBreakerPlugin }) => {
        plugins.push({
          plugin: createCircuitBreakerPlugin(config.circuitBreakerConfig),
          order: executionOrder.circuitBreaker,
        });
      },
    );
  }

  // Network Retry Plugin
  if (config.enableRetry !== false) {
    import('./network-retry-plugin').then(({ createNetworkRetryPlugin }) => {
      plugins.push({
        plugin: createNetworkRetryPlugin(config.retryConfig),
        order: executionOrder.retry,
      });
    });
  }

  // Fallback Mechanisms Plugin
  if (config.enableFallbacks !== false) {
    import('./fallback-mechanisms').then(
      ({ createFallbackMechanismsPlugin }) => {
        plugins.push({
          plugin: createFallbackMechanismsPlugin(config.fallbackConfig),
          order: executionOrder.fallbacks,
        });
      },
    );
  }

  // Mock Manifest Generator Plugin
  if (config.enableMockGeneration !== false) {
    import('./mock-manifest-generator').then(
      ({ createMockManifestGeneratorPlugin }) => {
        plugins.push({
          plugin: createMockManifestGeneratorPlugin(config.mockConfig),
          order: executionOrder.mockGeneration,
        });
      },
    );
  }

  // Sort plugins by execution order and return
  return plugins.sort((a, b) => a.order - b.order).map(({ plugin }) => plugin);
}

/**
 * Quick setup functions for common scenarios
 */
export const QuickSetup = {
  /** Development setup with all features enabled */
  forDevelopment: () =>
    createComprehensiveManifestErrorSolution(SOLUTION_PRESETS.development),

  /** Production setup with performance optimizations */
  forProduction: () =>
    createComprehensiveManifestErrorSolution(SOLUTION_PRESETS.production),

  /** Testing setup with mocks and minimal logging */
  forTesting: () =>
    createComprehensiveManifestErrorSolution(SOLUTION_PRESETS.testing),

  /** Minimal setup with basic error handling */
  minimal: () =>
    createComprehensiveManifestErrorSolution(SOLUTION_PRESETS.minimal),

  /** Custom setup with specific configuration */
  custom: (config: ComprehensiveErrorConfig) =>
    createComprehensiveManifestErrorSolution(config),
};

/**
 * Individual plugin creators for granular control
 */
export const PluginCreators = {
  manifestInterceptor: (
    config?: import('./manifest-interceptor-plugin').ManifestInterceptorConfig,
  ) =>
    import('./manifest-interceptor-plugin').then(
      ({ createManifestInterceptorPlugin }) =>
        createManifestInterceptorPlugin(config),
    ),

  circuitBreaker: (
    config?: import('./circuit-breaker-plugin').CircuitBreakerConfig,
  ) =>
    import('./circuit-breaker-plugin').then(({ createCircuitBreakerPlugin }) =>
      createCircuitBreakerPlugin(config),
    ),

  fallbackMechanisms: (
    config?: import('./fallback-mechanisms').FallbackConfig,
  ) =>
    import('./fallback-mechanisms').then(({ createFallbackMechanismsPlugin }) =>
      createFallbackMechanismsPlugin(config),
    ),

  preemptiveValidation: (
    config?: import('./preemptive-validation').ValidationConfig,
  ) =>
    import('./preemptive-validation').then(
      ({ createPreemptiveValidationPlugin }) =>
        createPreemptiveValidationPlugin(config),
    ),

  networkRetry: (
    config?: import('./network-retry-plugin').NetworkRetryConfig,
  ) =>
    import('./network-retry-plugin').then(({ createNetworkRetryPlugin }) =>
      createNetworkRetryPlugin(config),
    ),

  mockGenerator: (
    config?: import('./mock-manifest-generator').MockManifestConfig,
  ) =>
    import('./mock-manifest-generator').then(
      ({ createMockManifestGeneratorPlugin }) =>
        createMockManifestGeneratorPlugin(config),
    ),

  earlyRecovery: (
    config?: import('./early-error-recovery').EarlyRecoveryConfig,
  ) =>
    import('./early-error-recovery').then(
      ({ createEarlyErrorRecoveryPlugin }) =>
        createEarlyErrorRecoveryPlugin(config),
    ),
};

/**
 * Monitoring and debugging utilities
 */
export const Monitoring = {
  /** Enable comprehensive error monitoring */
  enableErrorMonitoring: (
    callback: (error: Error, solution: string, context: any) => void,
  ) => {
    // This would integrate with all plugins to provide unified error reporting
    if (typeof window !== 'undefined') {
      (window as any).__MF_ERROR_MONITOR__ = callback;
    }
  },

  /** Get error statistics from all solutions */
  getErrorStatistics: () => {
    const stats = {
      globalErrors: 0,
      circuitBreakerTrips: 0,
      retryAttempts: 0,
      fallbacksUsed: 0,
      validationFailures: 0,
      mocksGenerated: 0,
      earlyRecoveries: 0,
    };

    // Collect stats from each solution
    // This would be implemented with proper plugin integration

    return stats;
  },

  /** Generate error handling report */
  generateReport: () => {
    const stats = Monitoring.getErrorStatistics();
    return {
      timestamp: new Date().toISOString(),
      statistics: stats,
      recommendations: [
        stats.circuitBreakerTrips > 10
          ? 'Consider increasing circuit breaker threshold'
          : null,
        stats.retryAttempts > 50
          ? 'Network conditions may be poor, consider adjusting retry strategy'
          : null,
        stats.validationFailures > 0
          ? 'Manifest validation issues detected, check manifest structure'
          : null,
      ].filter(Boolean),
    };
  },
};

/**
 * Default export for easy import
 */
export default {
  createComprehensiveManifestErrorSolution,
  QuickSetup,
  PluginCreators,
  Monitoring,
  SOLUTION_PRESETS,
};
