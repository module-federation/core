import * as React from 'react';
import type { ErrorFallbackProps } from './types';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  FallbackComponent: React.ComponentType<ErrorFallbackProps>;
};

type ErrorBoundaryState = {
  didCatch: boolean;
  error: Error | null;
};

const initialState: ErrorBoundaryState = { didCatch: false, error: null };

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state = initialState;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { didCatch: true, error };
  }

  private resetErrorBoundary = (..._args: unknown[]) => {
    if (this.state.didCatch) {
      this.setState(initialState);
    }
  };

  render() {
    if (this.state.didCatch) {
      return (
        <this.props.FallbackComponent
          error={this.state.error as Error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}
