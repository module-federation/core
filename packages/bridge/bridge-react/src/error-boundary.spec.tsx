import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, rs } from '@rstest/core';
import { ErrorBoundary } from './error-boundary';
import type { ErrorFallbackProps } from './types';

describe('ErrorBoundary', () => {
  it('renders the fallback and can recover after reset', () => {
    const consoleError = rs
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    let shouldThrow = true;

    const Child = () => {
      if (shouldThrow) {
        throw new Error('render failed');
      }
      return <div>recovered</div>;
    };
    const Fallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
      <button
        onClick={() => {
          shouldThrow = false;
          resetErrorBoundary();
        }}
      >
        {error instanceof Error ? error.message : String(error)}
      </button>
    );

    render(
      <ErrorBoundary FallbackComponent={Fallback}>
        <Child />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'render failed' }));
    expect(screen.getByText('recovered')).not.toBeNull();
    consoleError.mockRestore();
  });
});
