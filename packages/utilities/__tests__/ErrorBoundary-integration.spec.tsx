import React, { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import ErrorBoundary from '../src/components/ErrorBoundary';
import FederationBoundary from '../src/components/FederationBoundary';

/**
 * Comprehensive test suite for ErrorBoundary integration with Module Federation.
 * Tests all documented scenarios from the error-load-remote blog and router-demo examples.
 *
 * Covers:
 * 1. ErrorBoundary catches and handles component rendering errors
 * 2. Integration with React.lazy and Suspense
 * 3. FederationBoundary fallback mechanisms
 * 4. Error recovery and retry functionality
 * 5. Custom error boundary components with reset capabilities
 * 6. Production-ready error handling patterns
 */
describe('ErrorBoundary Integration with Module Federation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error during tests to reduce noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic ErrorBoundary Functionality', () => {
    it('should catch and display error when component throws', () => {
      const ThrowingComponent = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText('An error has occurred.')).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      const WorkingComponent = () => <div>Working component</div>;

      render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
    });

    it('should handle multiple error scenarios', () => {
      const MultipleErrorComponent = ({
        shouldThrow,
      }: {
        shouldThrow: boolean;
      }) => {
        if (shouldThrow) {
          throw new Error('Conditional error');
        }
        return <div>No error</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <MultipleErrorComponent shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('No error')).toBeInTheDocument();

      rerender(
        <ErrorBoundary>
          <MultipleErrorComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('An error has occurred.')).toBeInTheDocument();
    });
  });

  describe('Production-Ready ErrorBoundary with Reset Functionality', () => {
    // Based on router-demo example
    const FallbackErrorComp = ({ error, resetErrorBoundary }: any) => {
      return (
        <div data-testid="custom-error-fallback">
          <h2>This is ErrorBoundary Component</h2>
          <p>Something went wrong:</p>
          <pre style={{ color: 'red' }}>{error.message}</pre>
          <button onClick={() => resetErrorBoundary()}>
            resetErrorBoundary(try again)
          </button>
        </div>
      );
    };

    const createErrorBoundaryWithReset = () => {
      return class ErrorBoundaryWithReset extends React.Component<
        { children: React.ReactNode; fallback: React.ComponentType<any> },
        { hasError: boolean; error?: Error }
      > {
        constructor(props: any) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError(error: Error) {
          return { hasError: true, error };
        }

        componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
          console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        resetErrorBoundary = () => {
          this.setState({ hasError: false, error: undefined });
        };

        render() {
          if (this.state.hasError) {
            const FallbackComponent = this.props.fallback;
            return (
              <FallbackComponent
                error={this.state.error}
                resetErrorBoundary={this.resetErrorBoundary}
              />
            );
          }

          return this.props.children;
        }
      };
    };

    it('should provide reset functionality for error recovery', async () => {
      const ErrorBoundaryWithReset = createErrorBoundaryWithReset();
      let shouldThrow = true;

      const ConditionalThrowingComponent = () => {
        if (shouldThrow) {
          throw new Error('Recoverable error');
        }
        return (
          <div data-testid="recovered-component">Component recovered!</div>
        );
      };

      render(
        <ErrorBoundaryWithReset fallback={FallbackErrorComp}>
          <ConditionalThrowingComponent />
        </ErrorBoundaryWithReset>,
      );

      // Should show error fallback initially
      expect(screen.getByTestId('custom-error-fallback')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong:')).toBeInTheDocument();
      expect(screen.getByText('Recoverable error')).toBeInTheDocument();

      // Fix the error condition
      shouldThrow = false;

      // Click reset button
      const resetButton = screen.getByText('resetErrorBoundary(try again)');
      fireEvent.click(resetButton);

      // Should now show the recovered component
      await waitFor(() => {
        expect(screen.getByTestId('recovered-component')).toBeInTheDocument();
      });
      expect(screen.getByText('Component recovered!')).toBeInTheDocument();
    });

    it('should handle async component loading errors with recovery', async () => {
      const ErrorBoundaryWithReset = createErrorBoundaryWithReset();
      let loadAttempt = 0;

      const mockAsyncComponent = async () => {
        loadAttempt++;
        if (loadAttempt === 1) {
          throw new Error('Network error during load');
        }
        return {
          default: () => (
            <div data-testid="async-component">Async component loaded</div>
          ),
        };
      };

      const LazyComponent = React.lazy(mockAsyncComponent);

      const { rerender } = render(
        <ErrorBoundaryWithReset fallback={FallbackErrorComp}>
          <Suspense fallback={<div>Loading...</div>}>
            <LazyComponent />
          </Suspense>
        </ErrorBoundaryWithReset>,
      );

      // Should show error fallback
      await waitFor(() => {
        expect(screen.getByTestId('custom-error-fallback')).toBeInTheDocument();
      });

      // Reset should trigger a retry
      const resetButton = screen.getByText('resetErrorBoundary(try again)');
      fireEvent.click(resetButton);

      // Should show loading then success
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('async-component')).toBeInTheDocument();
      });
    });
  });

  describe('FederationBoundary Integration', () => {
    it('should handle dynamic import failures with fallback', async () => {
      const failingImporter = () => Promise.reject(new Error('Import failed'));
      const fallbackImporter = () =>
        Promise.resolve(() => (
          <div data-testid="fallback-component">Fallback loaded</div>
        ));

      render(
        <FederationBoundary
          dynamicImporter={failingImporter}
          fallback={fallbackImporter}
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('fallback-component')).toBeInTheDocument();
      });
    });

    it('should use custom ErrorBoundary when provided', async () => {
      const CustomBoundary = ({ children }: { children: React.ReactNode }) => (
        <ErrorBoundary>
          <div data-testid="custom-boundary-wrapper">{children}</div>
        </ErrorBoundary>
      );

      const workingImporter = () =>
        Promise.resolve(() => (
          <div data-testid="working-component">Component loaded</div>
        ));

      render(
        <FederationBoundary
          dynamicImporter={workingImporter}
          customBoundary={CustomBoundary}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('custom-boundary-wrapper'),
        ).toBeInTheDocument();
        expect(screen.getByTestId('working-component')).toBeInTheDocument();
      });
    });

    it('should handle both import and rendering errors', async () => {
      const ThrowingComponent = () => {
        throw new Error('Rendering error');
      };

      // First test import success but rendering failure
      const importerWithRenderError = () => Promise.resolve(ThrowingComponent);
      const fallbackImporter = () =>
        Promise.resolve(() => (
          <div data-testid="error-fallback">Error handled</div>
        ));

      render(
        <FederationBoundary
          dynamicImporter={importerWithRenderError}
          fallback={fallbackImporter}
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      });
    });
  });

  describe('Integration with Suspense and Lazy Loading', () => {
    it('should work correctly with React.lazy and Suspense', async () => {
      const ErrorBoundaryWithReset = createErrorBoundaryWithReset();
      let componentLoadCount = 0;

      const mockRemoteComponent = async () => {
        componentLoadCount++;
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          default: () => (
            <div data-testid="lazy-remote">
              Remote component loaded (attempt {componentLoadCount})
            </div>
          ),
        };
      };

      const LazyRemoteComponent = React.lazy(mockRemoteComponent);

      render(
        <ErrorBoundaryWithReset fallback={FallbackErrorComp}>
          <Suspense
            fallback={
              <div data-testid="suspense-loading">Loading remote...</div>
            }
          >
            <LazyRemoteComponent />
          </Suspense>
        </ErrorBoundaryWithReset>,
      );

      // Should show loading first
      expect(screen.getByTestId('suspense-loading')).toBeInTheDocument();

      // Should eventually show the component
      await waitFor(
        () => {
          expect(screen.getByTestId('lazy-remote')).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      expect(
        screen.getByText('Remote component loaded (attempt 1)'),
      ).toBeInTheDocument();
    });

    it('should handle lazy loading timeout scenarios', async () => {
      const ErrorBoundaryWithReset = createErrorBoundaryWithReset();

      const timeoutComponent = async () => {
        // Simulate a long loading time that eventually fails
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error('Component load timeout');
      };

      const LazyTimeoutComponent = React.lazy(timeoutComponent);

      render(
        <ErrorBoundaryWithReset fallback={FallbackErrorComp}>
          <Suspense
            fallback={<div data-testid="timeout-loading">Loading...</div>}
          >
            <LazyTimeoutComponent />
          </Suspense>
        </ErrorBoundaryWithReset>,
      );

      // Should show loading initially
      expect(screen.getByTestId('timeout-loading')).toBeInTheDocument();

      // Should eventually show error
      await waitFor(
        () => {
          expect(
            screen.getByTestId('custom-error-fallback'),
          ).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      expect(screen.getByText('Component load timeout')).toBeInTheDocument();
    });
  });

  describe('Router Integration Scenarios', () => {
    // Based on router-demo App.tsx examples
    it('should handle route-based remote loading with error boundaries', async () => {
      const ErrorBoundaryWithReset = createErrorBoundaryWithReset();

      // Simulate a remote component that fails on specific routes
      const RouteRemoteComponent = ({ route }: { route: string }) => {
        if (route === '/error-route') {
          throw new Error('Route-specific error');
        }
        return <div data-testid="route-component">Route: {route}</div>;
      };

      const { rerender } = render(
        <ErrorBoundaryWithReset fallback={FallbackErrorComp}>
          <RouteRemoteComponent route="/working-route" />
        </ErrorBoundaryWithReset>,
      );

      // Should work for normal routes
      expect(screen.getByTestId('route-component')).toBeInTheDocument();
      expect(screen.getByText('Route: /working-route')).toBeInTheDocument();

      // Should show error for error routes
      rerender(
        <ErrorBoundaryWithReset fallback={FallbackErrorComp}>
          <RouteRemoteComponent route="/error-route" />
        </ErrorBoundaryWithReset>,
      );

      expect(screen.getByTestId('custom-error-fallback')).toBeInTheDocument();
      expect(screen.getByText('Route-specific error')).toBeInTheDocument();
    });

    it('should support styled error fallbacks like in router-demo', () => {
      const StyledErrorBoundary = () => (
        <div
          data-testid="styled-error-boundary"
          style={{
            padding: '20px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '4px',
            color: '#cf1322',
            marginTop: '20px',
          }}
        >
          Error loading Remote App. Please try again later.
        </div>
      );

      const ThrowingComponent = () => {
        throw new Error('Styled error test');
      };

      const ErrorBoundaryWithStyledFallback = class extends React.Component<
        { children: React.ReactNode },
        { hasError: boolean }
      > {
        constructor(props: any) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        render() {
          if (this.state.hasError) {
            return <StyledErrorBoundary />;
          }
          return this.props.children;
        }
      };

      render(
        <ErrorBoundaryWithStyledFallback>
          <ThrowingComponent />
        </ErrorBoundaryWithStyledFallback>,
      );

      const errorElement = screen.getByTestId('styled-error-boundary');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveStyle({
        background: '#fff2f0',
        border: '1px solid #ffccc7',
        borderRadius: '4px',
        color: '#cf1322',
      });
    });
  });

  describe('Advanced Error Boundary Patterns', () => {
    it('should support error boundaries with logging and monitoring', () => {
      const errorLogs: Array<{ error: Error; errorInfo: React.ErrorInfo }> = [];

      const MonitoringErrorBoundary = class extends React.Component<
        { children: React.ReactNode },
        { hasError: boolean; error?: Error }
      > {
        constructor(props: any) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError(error: Error) {
          return { hasError: true, error };
        }

        componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
          // Log error for monitoring
          errorLogs.push({ error, errorInfo });

          // In real app, would send to monitoring service
          console.log('Error logged for monitoring:', {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          });
        }

        render() {
          if (this.state.hasError) {
            return (
              <div data-testid="monitoring-error-fallback">
                <h2>Application Error</h2>
                <p>An error occurred and has been logged for investigation.</p>
                <details>
                  <summary>Error Details</summary>
                  <pre>{this.state.error?.message}</pre>
                </details>
              </div>
            );
          }
          return this.props.children;
        }
      };

      const ThrowingComponent = () => {
        throw new Error('Monitored error');
      };

      render(
        <MonitoringErrorBoundary>
          <ThrowingComponent />
        </MonitoringErrorBoundary>,
      );

      expect(
        screen.getByTestId('monitoring-error-fallback'),
      ).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();

      // Verify error was logged
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].error.message).toBe('Monitored error');
    });

    it('should handle nested error boundaries correctly', () => {
      const InnerThrowingComponent = () => {
        throw new Error('Inner error');
      };

      const OuterErrorBoundary = class extends React.Component<
        { children: React.ReactNode },
        { hasError: boolean }
      > {
        constructor(props: any) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        render() {
          if (this.state.hasError) {
            return (
              <div data-testid="outer-error">Outer boundary caught error</div>
            );
          }
          return this.props.children;
        }
      };

      const InnerErrorBoundary = class extends React.Component<
        { children: React.ReactNode },
        { hasError: boolean }
      > {
        constructor(props: any) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        render() {
          if (this.state.hasError) {
            return (
              <div data-testid="inner-error">Inner boundary caught error</div>
            );
          }
          return this.props.children;
        }
      };

      render(
        <OuterErrorBoundary>
          <div>Outer content</div>
          <InnerErrorBoundary>
            <InnerThrowingComponent />
          </InnerErrorBoundary>
        </OuterErrorBoundary>,
      );

      // Inner boundary should catch the error
      expect(screen.getByTestId('inner-error')).toBeInTheDocument();
      expect(screen.queryByTestId('outer-error')).not.toBeInTheDocument();
    });
  });
});
