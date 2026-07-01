# Module Federation Error Handling Specification

This document describes error handling across the current Module Federation architecture. The canonical exported codes live in `@module-federation/error-codes`; platform packages such as enhanced, runtime-core, dts-plugin, rsbuild-plugin, rspress-plugin, metro, nextjs-mf, and node should map their failures into those canonical codes or into local typed errors that preserve enough context for diagnosis.

## Table of Contents

- [Overview](#overview)
- [Standard Error Codes](#standard-error-codes)
- [Error Categories](#error-categories)
- [Error Recovery Strategies](#error-recovery-strategies)
- [Fallback Mechanisms](#fallback-mechanisms)
- [Circuit Breaker Patterns](#circuit-breaker-patterns)
- [Error Boundary Implementations](#error-boundary-implementations)
- [Monitoring, Propagation, and Implementation Examples](#monitoring-propagation-and-implementation-examples)

## Error Ownership

Use `architecture-overview.md` for the canonical repo-wide package taxonomy. This section only maps error-code ownership, recovery policy, and local error boundaries.

| Layer | Package(s) | Error responsibility |
| --- | --- | --- |
| Canonical formatting | `@module-federation/error-codes` | Exports `RUNTIME-001` through `RUNTIME-015`, `TYPE-001`, `BUILD-001`, `BUILD-002`, `errorDescMap`, `runtimeDescMap`, `typeDescMap`, `buildDescMap`, browser/node helpers, and `getShortErrorMsg`. |
| Runtime loading | `runtime-core`, `runtime`, `webpack-bundler-runtime` | Fails remote entry, manifest, snapshot, share loading, container init, missing exposes, invalid singleton usage, and uninitialized runtime states through canonical runtime codes and lifecycle hooks. |
| Build integration | `enhanced`, `rspack`, `rsbuild-plugin`, `rspress-plugin`, `esbuild`, `metro` | Validates options, exposes, public paths, runtime generation, bundler hooks, and platform-specific artifact creation. |
| Metadata and types | `dts-plugin`, `third-party-dts-extractor`, `manifest`, `managers`, `typescript` | Reports type generation/consumption failures, manifest/stat generation failures, extraction problems, and option-normalization failures. |
| Resilience and observability | `retry-plugin`, `observability-plugin`, `devtools`, bridge packages | Converts load failures into retry/fallback/inspection events without changing the runtime container contract. |

Do not add new documented error code families here unless they are exported from `packages/error-codes/src/error-codes.ts`. Recovery policy can be richer than the code set, but the public code list must stay tied to the package.

## Overview

Module Federation's error handling system is built on a multi-layered approach that provides resilience at every level of the federation architecture. The exported error-code package defines the public diagnostic vocabulary. Packages may keep richer local error metadata, but examples in this document should not invent additional public code families.

### Core Principles

1. **Fail Fast with Recovery**: Detect failures early but provide recovery mechanisms
2. **Graceful Degradation**: Applications should continue functioning when remotes fail
3. **Observable Failures**: All failures should be trackable and debuggable
4. **Consistent Error Interface**: Standard error codes and messages across implementations
5. **Configurable Resilience**: Customizable retry, timeout, and fallback strategies

## Standard Error Codes

All Module Federation implementations should preserve the following exported standardized codes when they cross package or runtime boundaries:

### Runtime Error Codes (RUNTIME-xxx)

```typescript
// Remote Loading Errors
export const RUNTIME_001 = 'RUNTIME-001'; // Failed to get remoteEntry exports
export const RUNTIME_002 = 'RUNTIME-002'; // Remote entry interface missing "init"
export const RUNTIME_003 = 'RUNTIME-003'; // Failed to get manifest
export const RUNTIME_004 = 'RUNTIME-004'; // Failed to locate remote
export const RUNTIME_007 = 'RUNTIME-007'; // Failed to get remote snapshot
export const RUNTIME_008 = 'RUNTIME-008'; // Failed to load script resources

// Module and manifest loading errors
export const RUNTIME_010 = 'RUNTIME-010'; // Runtime name changed after initialization
export const RUNTIME_011 = 'RUNTIME-011'; // Remote entry URL missing from snapshot
export const RUNTIME_012 = 'RUNTIME-012'; // Shared module getter is not a function
export const RUNTIME_013 = 'RUNTIME-013'; // Manifest is not valid
export const RUNTIME_014 = 'RUNTIME-014'; // Remote does not expose requested module
export const RUNTIME_015 = 'RUNTIME-015'; // Remote container initialization failed

// Sharing and state errors
export const RUNTIME_005 = 'RUNTIME-005'; // Invalid loadShareSync function call from bundler runtime
export const RUNTIME_006 = 'RUNTIME-006'; // Invalid loadShareSync function call from runtime
export const RUNTIME_009 = 'RUNTIME-009'; // Please call createInstance first
```

### Build-Time Error Codes (BUILD-xxx)

```typescript
// Module Federation Build Errors
export const BUILD_001 = 'BUILD-001'; // Failed to find expose module
export const BUILD_002 = 'BUILD-002'; // PublicPath is required in prod mode
```

Build integrations can throw additional local validation errors, but only `BUILD-001` and `BUILD-002` are exported as canonical codes today.

### Type Error Codes (TYPE-xxx)

```typescript
export const TYPE_001 = 'TYPE-001'; // Failed to generate type declaration
```

## Error Categories

### 1. Recoverable Errors
Errors that can be handled with retry mechanisms or fallbacks:
- Manifest fetch failures (`RUNTIME-003`)
- Remote location or snapshot failures (`RUNTIME-004`, `RUNTIME-007`)
- Script/resource loading failures (`RUNTIME-008`)

### 2. Configuration Errors
Errors caused by incorrect setup:
- Missing remote entry (RUNTIME-004)
- Invalid configuration (local validation errors, with canonical codes when exported)
- Missing exposed module (RUNTIME-014)

### 3. Critical Errors
Errors that prevent application startup:
- Runtime instance missing (`RUNTIME-009`)
- Remote container initialization failure (`RUNTIME-015`)
- Critical dependency failures
- Security violations

### 4. Degradable Errors
Errors where the application can continue with reduced functionality:
- Optional remote failures
- Non-critical shared dependency conflicts
- Feature-specific module failures

### Local Error Normalization in App Code

The repository does not expose a canonical `ModuleFederationError` class. Package-owned public diagnostics are the exported codes and description maps from `@module-federation/error-codes`. App-level resilience examples can normalize unknown caught values into ordinary `Error` objects and optionally preserve a local `code`/`context` shape:

```typescript
type ErrorWithCode = Error & {
  code?: string;
  context?: Record<string, unknown>;
};

function toError(error: unknown): ErrorWithCode {
  if (error instanceof Error) {
    return error;
  }

  return Object.assign(
    new Error(typeof error === 'string' ? error : 'Unknown error'),
    { context: { originalValue: error } },
  );
}
```

## Error Recovery Strategies

### 1. Retry Mechanisms

```typescript
interface RetryConfig {
  attempts: number;
  delay: number;
  backoffFactor: number;
  maxDelay: number;
  retryableCodes: string[];
}

const defaultRetryConfig: RetryConfig = {
  attempts: 3,
  delay: 1000,
  backoffFactor: 2,
  maxDelay: 10000,
  retryableCodes: [
    'RUNTIME-003', // Failed to get manifest
    'RUNTIME-004', // Failed to locate remote
    'RUNTIME-007', // Failed to get remote snapshot
    'RUNTIME-008', // Failed to load script resources
  ],
};
```

### 2. Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  errorCode?: string
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (errorCode && !config.retryableCodes.includes(errorCode)) {
        throw error;
      }

      if (attempt === config.attempts) {
        throw error;
      }

      const delay = Math.min(
        config.delay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

### 3. Timeout Handling

```typescript
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}
```

## Fallback Mechanisms

### 1. Component-Level Fallbacks

```typescript
interface FallbackConfig {
  component?: React.ComponentType<any>;
  loading?: React.ComponentType<any>;
  error?: React.ComponentType<{ error: Error; retry: () => void }>;
}

function createRemoteComponent(
  loader: () => Promise<any>,
  fallbackConfig: FallbackConfig = {}
) {
  return React.lazy(async () => {
    try {
      return await loader();
    } catch (error) {
      // Log error for monitoring
      reportError(error);

      // Return fallback component
      if (fallbackConfig.component) {
        return { default: fallbackConfig.component };
      }

      // Return error component with retry capability
      return {
        default: (props: any) => {
          const retry = () => {
            // Trigger component re-render
            window.location.reload();
          };

          if (fallbackConfig.error) {
            return React.createElement(fallbackConfig.error, { error, retry, ...props });
          }

          return React.createElement('div', {},
            `Failed to load remote component: ${error.message}`
          );
        }
      };
    }
  });
}
```

### 2. Module-Level Fallbacks

```typescript
interface ModuleFallbackConfig {
  fallbackModule?: string;
  localFallback?: any;
  errorMode: 'throw' | 'fallback' | 'ignore';
}

async function loadRemoteModule(
  remoteName: string,
  moduleName: string,
  config: ModuleFallbackConfig
): Promise<any> {
  try {
    return await __federation_method_getRemote(remoteName, moduleName);
  } catch (error) {
    const federationError = toError(error);

    switch (config.errorMode) {
      case 'throw':
        throw federationError;

      case 'fallback':
        if (config.localFallback) {
          return config.localFallback;
        }
        if (config.fallbackModule) {
          return await import(config.fallbackModule);
        }
        throw new Error(`No fallback available for ${remoteName}/${moduleName}`);

      case 'ignore':
        return null;

      default:
        throw federationError;
    }
  }
}
```

### 3. Remote-Level Fallbacks

```typescript
interface RemoteFallbackConfig {
  fallbackRemotes?: string[];
  gracefulDegradation: boolean;
  criticalModules?: string[];
}

async function loadRemoteWithFallback(
  primaryRemote: string,
  moduleName: string,
  config: RemoteFallbackConfig
): Promise<any> {
  const remotes = [primaryRemote, ...(config.fallbackRemotes || [])];
  let lastError: Error;

  for (const remote of remotes) {
    try {
      return await loadRemoteModule(remote, moduleName, { errorMode: 'throw' });
    } catch (error) {
      lastError = error;
      reportError(error, { remote, module: moduleName, fallback: true });
    }
  }

  // If critical module, throw error
  if (config.criticalModules?.includes(moduleName)) {
    throw new Error(`Critical module ${moduleName} failed to load from all remotes`);
  }

  // If graceful degradation enabled, return null
  if (config.gracefulDegradation) {
    return null;
  }

  throw lastError;
}
```

## Circuit Breaker Patterns

### 1. Circuit Breaker Implementation

```typescript
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  volumeThreshold: number;
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private nextAttempt = 0;
  private lastFailureTime = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async call<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HALF_OPEN;
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
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
```

### 2. Remote-Specific Circuit Breakers

```typescript
class RemoteCircuitBreakerManager {
  private circuitBreakers = new Map<string, CircuitBreaker>();

  private getCircuitBreaker(remoteName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(remoteName)) {
      this.circuitBreakers.set(remoteName, new CircuitBreaker({
        failureThreshold: 5,
        recoveryTimeout: 30000, // 30 seconds
        monitoringPeriod: 60000, // 1 minute
        volumeThreshold: 10,
      }));
    }
    return this.circuitBreakers.get(remoteName)!;
  }

  async loadRemote<T>(
    remoteName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(remoteName);
    return circuitBreaker.call(operation);
  }

  getRemoteHealth(): Record<string, CircuitState> {
    const health: Record<string, CircuitState> = {};
    for (const [remote, cb] of this.circuitBreakers) {
      health[remote] = cb.getState();
    }
    return health;
  }
}
```

## Error Boundary Implementations

### 1. React Error Boundaries

```typescript
interface ModuleFederationErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorInfo>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolateFailures?: boolean;
}

interface ErrorInfo {
  error: Error;
  errorInfo: React.ErrorInfo;
  retry: () => void;
}

class ModuleFederationErrorBoundary extends React.Component<
  ModuleFederationErrorBoundaryProps,
  { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo }
> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: ModuleFederationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Report error for monitoring
    reportError(error, {
      context: 'ModuleFederationErrorBoundary',
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Auto-retry for specific errors after delay
    if (this.shouldAutoRetry(error)) {
      this.retryTimeoutId = setTimeout(() => {
        this.retry();
      }, 5000);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    const federationError = toError(error);
    return [
      'RUNTIME-003', // Failed to get manifest
      'RUNTIME-004', // Failed to locate remote
      'RUNTIME-008', // Failed to load script resources
    ].includes(federationError.code);
  }

  private retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;

      if (FallbackComponent) {
        return React.createElement(FallbackComponent, {
          error: this.state.error!,
          errorInfo: this.state.errorInfo!,
          retry: this.retry,
        });
      }

      return React.createElement('div', {
        style: { padding: '20px', border: '1px solid #ff6b6b', borderRadius: '4px' }
      }, [
        React.createElement('h3', { key: 'title' }, 'Module Federation Error'),
        React.createElement('p', { key: 'message' }, this.state.error?.message),
        React.createElement('button', {
          key: 'retry',
          onClick: this.retry,
          style: { marginTop: '10px', padding: '8px 16px' },
        }, 'Retry'),
      ]);
    }

    return this.props.children;
  }
}
```

### 2. Vue Error Handling

```typescript
// Vue 3 Error Handling
const ModuleFederationErrorHandler = {
  install(app: App) {
    app.config.errorHandler = (err: unknown, instance, info) => {
      const error = toError(err);

      reportError(error, {
        context: 'Vue',
        componentInstance: instance,
        errorInfo: info,
      });

      // Handle specific federation errors
      if (error.code?.startsWith('RUNTIME-')) {
        // Show user-friendly error message
        console.error('Module Federation Error:', error.message);
      }
    };
  },
};
```

### 3. Angular Error Handling

```typescript
@Injectable()
export class ModuleFederationErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const federationError = toError(error);

    reportError(federationError, {
      context: 'Angular',
    });

    // Handle federation-specific errors
    if (federationError.code?.startsWith('RUNTIME-')) {
      this.handleRuntimeError(federationError);
    }
  }

  private handleRuntimeError(error: ErrorWithCode): void {
    // Implement Angular-specific error handling
    console.error('Module Federation Runtime Error:', error.message);
  }
}
```

## Monitoring, Propagation, and Implementation Examples

Monitoring, propagation, implementation guidelines, runtime examples, and build-time examples live in [error-monitoring-propagation.md](./error-monitoring-propagation.md).

## Related Documentation

For implementation examples and additional context, see:
- [Architecture Overview](./architecture-overview.md) - System architecture and error flow
- [Plugin Architecture](./plugin-architecture.md) - Build-time error handling patterns
- [Runtime Architecture](./runtime-architecture.md) - Runtime error lifecycle and hooks
- [Implementation Guide](./implementation-guide.md) - Practical error handling implementation
- [SDK Reference](./sdk-reference.md) - Error-related types and interfaces
- [Manifest Specification](./manifest-specification.md) - Manifest validation and error handling
- [Advanced Topics](./advanced-topics.md) - Production error handling strategies
