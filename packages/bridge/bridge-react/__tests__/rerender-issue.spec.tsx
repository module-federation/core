import React, { useState, useRef } from 'react';
import { createBridgeComponent, createRemoteAppComponent } from '../src';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

describe('Issue #4171: Rerender functionality', () => {
  it('should call custom rerender function when provided', async () => {
    const customRerenderSpy = jest.fn();
    let instanceCounter = 0;

    // Remote component that tracks instances
    function RemoteApp({ count }: { count: number }) {
      const instanceId = useRef(++instanceCounter);

      return (
        <div>
          <span data-testid="remote-count">Count: {count}</span>
          <span data-testid="instance-id">Instance: {instanceId.current}</span>
        </div>
      );
    }

    // Create bridge component with custom rerender function
    const BridgeComponent = createBridgeComponent({
      rootComponent: RemoteApp,
      rerender: (props) => {
        customRerenderSpy(props);
        return { shouldRecreate: false };
      },
    });

    const RemoteAppComponent = createRemoteAppComponent({
      loader: async () => ({ default: BridgeComponent }),
      loading: <div>Loading...</div>,
      fallback: () => <div>Error</div>,
    });

    function HostApp() {
      const [count, setCount] = useState(0);

      return (
        <div>
          <button
            data-testid="increment-btn"
            onClick={() => setCount((c) => c + 1)}
          >
            Increment: {count}
          </button>
          <RemoteAppComponent props={{ count }} />
        </div>
      );
    }

    render(<HostApp />);

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toBeInTheDocument();
    });

    // Clear spy to track only rerender calls
    customRerenderSpy.mockClear();

    // Trigger rerender
    act(() => {
      fireEvent.click(screen.getByTestId('increment-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('Count: 1');
    });

    // Custom rerender function should have been called
    expect(customRerenderSpy).toHaveBeenCalled();

    // Verify the custom rerender function was called with props
    const callArgs = customRerenderSpy.mock.calls[0][0];
    expect(callArgs).toBeDefined();
    expect(typeof callArgs).toBe('object');
  });

  it('should work without rerender option (backward compatibility)', async () => {
    let instanceCounter = 0;

    function RemoteApp({ count }: { count: number }) {
      const instanceId = useRef(++instanceCounter);

      return (
        <div>
          <span data-testid="remote-count">Count: {count}</span>
          <span data-testid="instance-id">Instance: {instanceId.current}</span>
        </div>
      );
    }

    // Create bridge component without rerender option (existing behavior)
    const BridgeComponent = createBridgeComponent({
      rootComponent: RemoteApp,
    });

    const RemoteAppComponent = createRemoteAppComponent({
      loader: async () => ({ default: BridgeComponent }),
      loading: <div>Loading...</div>,
      fallback: () => <div>Error</div>,
    });

    function HostApp() {
      const [count, setCount] = useState(0);

      return (
        <div>
          <button
            data-testid="increment-btn"
            onClick={() => setCount((c) => c + 1)}
          >
            Increment: {count}
          </button>
          <RemoteAppComponent props={{ count }} />
        </div>
      );
    }

    render(<HostApp />);

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toBeInTheDocument();
    });

    // Should work without errors (backward compatibility)
    act(() => {
      fireEvent.click(screen.getByTestId('increment-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('Count: 1');
    });

    // Component should still function correctly
    expect(screen.getByTestId('remote-count')).toHaveTextContent('Count: 1');
  });

  it('should support rerender function returning void', async () => {
    const customRerenderSpy = jest.fn();

    function RemoteApp({ count }: { count: number }) {
      return (
        <div>
          <span data-testid="remote-count">Count: {count}</span>
        </div>
      );
    }

    // Create bridge component with rerender function that returns void
    const BridgeComponent = createBridgeComponent({
      rootComponent: RemoteApp,
      rerender: (props) => {
        customRerenderSpy(props);
        // Return void (undefined)
      },
    });

    const RemoteAppComponent = createRemoteAppComponent({
      loader: async () => ({ default: BridgeComponent }),
      loading: <div>Loading...</div>,
      fallback: () => <div>Error</div>,
    });

    function HostApp() {
      const [count, setCount] = useState(0);

      return (
        <div>
          <button
            data-testid="increment-btn"
            onClick={() => setCount((c) => c + 1)}
          >
            Increment: {count}
          </button>
          <RemoteAppComponent props={{ count }} />
        </div>
      );
    }

    render(<HostApp />);

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toBeInTheDocument();
    });

    customRerenderSpy.mockClear();

    // Trigger rerender
    act(() => {
      fireEvent.click(screen.getByTestId('increment-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('Count: 1');
    });

    // Custom rerender function should have been called even when returning void
    expect(customRerenderSpy).toHaveBeenCalled();
  });
});
