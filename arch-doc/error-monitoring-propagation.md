# Module Federation Error Monitoring and Propagation

This document owns monitoring, propagation, implementation guidelines, runtime error examples, and build-time error examples. Use [error-handling-specification.md](./error-handling-specification.md) as the error architecture index.

## Monitoring and Observability

### 1. Error Reporting Interface

```typescript
interface ErrorReportData {
  code: string;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

interface ErrorReporter {
  report(error: ErrorWithCode, context?: Record<string, any>): void;
  flush(): Promise<void>;
  setUser(userId: string): void;
  setSession(sessionId: string): void;
}
```

### 2. Default Error Reporter

```typescript
class DefaultErrorReporter implements ErrorReporter {
  private buffer: ErrorReportData[] = [];
  private userId?: string;
  private sessionId?: string;
  private endpoint?: string;

  constructor(config: { endpoint?: string; bufferSize?: number } = {}) {
    this.endpoint = config.endpoint;
  }

  report(error: ErrorWithCode, context?: Record<string, any>): void {
    const reportData: ErrorReportData = {
      code: error.code,
      message: error.message,
      timestamp: Date.now(),
      context,
      stackTrace: error.stack,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.buffer.push(reportData);

    // Auto-flush critical errors
    if (this.isCriticalError(error)) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.endpoint) {
      return;
    }

    const data = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: data }),
      });
    } catch (error) {
      // Re-add to buffer on failure
      this.buffer.unshift(...data);
    }
  }

  setUser(userId: string): void {
    this.userId = userId;
  }

  setSession(sessionId: string): void {
    this.sessionId = sessionId;
  }

  private isCriticalError(error: ErrorWithCode): boolean {
    return [
      'RUNTIME-009', // createInstance has not been called
      'RUNTIME-010', // Runtime name changed after initialization
      'RUNTIME-015', // Remote container initialization failed
    ].includes(error.code);
  }
}
```

### 3. Performance Monitoring

```typescript
interface PerformanceMetrics {
  remoteLoadTime: number;
  moduleInitTime: number;
  networkLatency: number;
  cacheHitRate: number;
}

class ModuleFederationMonitor {
  private metrics = new Map<string, PerformanceMetrics>();

  startRemoteLoad(remoteName: string): () => void {
    const startTime = performance.now();

    return () => {
      const loadTime = performance.now() - startTime;
      this.recordMetric(remoteName, 'remoteLoadTime', loadTime);
    };
  }

  recordError(error: ErrorWithCode, context?: Record<string, any>): void {
    // Send to error reporter
    errorReporter.report(error, context);

    // Track error metrics
    this.incrementErrorCount(error.code);

    // Update circuit breaker if applicable
    if (context?.remoteName) {
      this.updateRemoteHealth(context.remoteName, false);
    }
  }

  private recordMetric(remote: string, metric: keyof PerformanceMetrics, value: number): void {
    if (!this.metrics.has(remote)) {
      this.metrics.set(remote, {
        remoteLoadTime: 0,
        moduleInitTime: 0,
        networkLatency: 0,
        cacheHitRate: 0,
      });
    }

    const metrics = this.metrics.get(remote)!;
    metrics[metric] = value;
  }

  getHealthReport(): Record<string, any> {
    return {
      remoteHealth: this.getRemoteHealth(),
      errorCounts: this.getErrorCounts(),
      performanceMetrics: Object.fromEntries(this.metrics),
    };
  }

  private incrementErrorCount(code: string): void {
    // Implementation for error counting
  }

  private updateRemoteHealth(remote: string, healthy: boolean): void {
    // Implementation for health tracking
  }

  private getRemoteHealth(): Record<string, boolean> {
    // Implementation for health reporting
    return {};
  }

  private getErrorCounts(): Record<string, number> {
    // Implementation for error count reporting
    return {};
  }
}
```

## Error Propagation

### 1. Source-Backed Error Context Preservation

```typescript
import {
  RUNTIME_008,
  runtimeDescMap,
  getShortErrorMsg,
} from '@module-federation/error-codes';

function createRemoteLoadError(remoteName: string, cause: unknown): ErrorWithCode {
  const originalError = toError(cause);
  return Object.assign(
    new Error(
      getShortErrorMsg(RUNTIME_008, runtimeDescMap, {
        remoteName,
      }, originalError.message),
      { cause: originalError },
    ),
    {
      code: RUNTIME_008,
      context: { remoteName },
    },
  );
}
```

### 2. Error Boundary Chain

```typescript
interface ErrorBoundaryConfig {
  level: 'application' | 'remote' | 'module';
  isolate: boolean;
  fallback?: React.ComponentType<any>;
  onError?: (error: Error) => void;
}

function createErrorBoundaryChain(configs: ErrorBoundaryConfig[]) {
  return configs.reduce((children, config) => {
    return React.createElement(ModuleFederationErrorBoundary, {
      fallback: config.fallback,
      onError: config.onError,
      isolateFailures: config.isolate,
    }, children);
  });
}
```

## Implementation Guidelines

### 1. Bundler Integration Requirements

All Module Federation bundler integrations must implement:

1. **Error Code Support**: Support all standardized error codes
2. **Retry Logic**: Implement configurable retry mechanisms
3. **Circuit Breakers**: Include circuit breaker patterns for remote failures
4. **Fallback Support**: Enable component and module-level fallbacks
5. **Error Reporting**: Integrate with monitoring systems
6. **Debug Information**: Provide detailed error context for development

### 2. Runtime Integration

```typescript
interface RuntimeErrorConfig {
  retryConfig: RetryConfig;
  circuitBreakerConfig: CircuitBreakerConfig;
  fallbackConfig: ModuleFallbackConfig;
  errorReporter: ErrorReporter;
  monitor: ModuleFederationMonitor;
}

function initializeErrorHandling(config: RuntimeErrorConfig): void {
  // Initialize global error handling
  setupGlobalErrorHandlers(config.errorReporter);

  // Configure retry mechanisms
  setDefaultRetryConfig(config.retryConfig);

  // Initialize circuit breakers
  initializeCircuitBreakers(config.circuitBreakerConfig);

  // Setup monitoring
  setupMonitoring(config.monitor);
}
```

### 3. Build-Time Integration

```typescript
interface BuildErrorConfig {
  validateManifest: boolean;
  strictTypeChecking: boolean;
  failOnMissingRemotes: boolean;
  generateErrorCodes: boolean;
}

function configureBuildErrorHandling(config: BuildErrorConfig): void {
  // Configure build-time error handling
  if (config.validateManifest) {
    enableManifestValidation();
  }

  if (config.strictTypeChecking) {
    enableStrictTypeChecking();
  }

  if (config.generateErrorCodes) {
    enableErrorCodeGeneration();
  }
}
```

## Runtime Error Handling

### 1. Module Loading Error Handling

```typescript
import { loadRemote } from '@module-federation/runtime';

async function loadRemoteModule(
  remoteName: string,
  moduleName: string,
  options: {
    retry?: RetryConfig;
    timeout?: number;
    fallback?: any;
  } = {}
): Promise<any> {
  const monitor = getModuleFederationMonitor();
  const endTimer = monitor.startRemoteLoad(remoteName);

  try {
    const result = await withTimeout(
      retryWithBackoff(
        () => loadRemote(`${remoteName}/${moduleName}`),
        options.retry || getDefaultRetryConfig(),
        'RUNTIME-008'
      ),
      options.timeout || 30000
    );

    endTimer();
    return result;
  } catch (error) {
    endTimer();
    const federationError = toError(error);

    monitor.recordError(federationError, {
      remoteName,
      moduleName,
      operation: 'loadRemoteModule',
    });

    // Try fallback if available
    if (options.fallback) {
      return options.fallback;
    }

    throw federationError;
  }
}
```

### 2. Shared Module Error Handling

```typescript
import { loadShare } from '@module-federation/runtime';

async function loadSharedModule(
  packageName: string,
  version: string,
  options: {
    fallbackVersion?: string;
    required?: boolean;
  } = {}
): Promise<any> {
  try {
    // loadShare resolves to a factory (or false), not the module itself
    const factory = await loadShare(packageName, {
      customShareInfo: { shareConfig: { requiredVersion: version } },
    });
    if (factory) {
      return factory();
    }
    throw new Error(`Shared module ${packageName} not found in share scope`);
  } catch (error) {
    const federationError = toError(error);

    // Try fallback version
    if (options.fallbackVersion) {
      try {
        const fallbackFactory = await loadShare(packageName, {
          customShareInfo: {
            shareConfig: { requiredVersion: options.fallbackVersion },
          },
        });
        if (fallbackFactory) {
          return fallbackFactory();
        }
      } catch (fallbackError) {
        // Log fallback failure but continue with original error
        console.warn('Fallback version also failed:', fallbackError);
      }
    }

    // If not required, return null
    if (!options.required) {
      return null;
    }

    throw new Error(`Failed to load shared module ${packageName}@${version}`, {
      cause: federationError,
    });
  }
}
```

## Build-Time Error Handling

### 1. Configuration Validation

```typescript
function validateModuleFederationConfig(config: any): void {
  if (!config.name) {
    throw new Error('Module Federation configuration must include a name');
  }

  if (config.exposes) {
    for (const [key, path] of Object.entries(config.exposes)) {
      if (typeof path !== 'string') {
        throw new Error(`Invalid expose path for ${key}`);
      }
    }
  }

  if (config.remotes) {
    for (const [name, remote] of Object.entries(config.remotes)) {
      if (typeof remote !== 'string' && typeof remote !== 'object') {
        throw new Error(`Invalid remote configuration for ${name}`);
      }
    }
  }
}
```

### 2. Manifest Generation Error Handling

```typescript
function generateManifest(config: any): any {
  try {
    validateModuleFederationConfig(config);

    const manifest = {
      name: config.name,
      exposes: config.exposes || {},
      remotes: config.remotes || {},
      shared: config.shared || {},
      version: config.version || '1.0.0',
    };

    // Validate generated manifest
    validateManifest(manifest);

    return manifest;
  } catch (error) {
    throw new Error('Failed to generate manifest', {
      cause: toError(error),
    });
  }
}

function validateManifest(manifest: any): void {
  if (!manifest.name || typeof manifest.name !== 'string') {
    throw new Error('Manifest must have a valid name');
  }

  // Additional validation logic...
}
```

---

This specification provides a comprehensive framework for error handling in Module Federation implementations. Bundler teams should implement these patterns to ensure consistent, reliable error handling across different Module Federation environments.
