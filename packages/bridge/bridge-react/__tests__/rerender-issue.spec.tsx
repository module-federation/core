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
    function RemoteApp({ props }: { props?: { count: number } }) {
      const instanceId = useRef(++instanceCounter);

      return (
        <div>
          <span data-testid="remote-count">Count: {props?.count}</span>
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

    // Instance should be preserved (no remount)
    expect(screen.getByTestId('instance-id')).toHaveTextContent('Instance: 1');

    // Custom rerender function should have been called
    expect(customRerenderSpy).toHaveBeenCalled();

    // Verify the custom rerender function was called with props
    const callArgs = customRerenderSpy.mock.calls[0][0];
    expect(callArgs).toBeDefined();
    expect(typeof callArgs).toBe('object');
  });

  it('should work without rerender option (backward compatibility)', async () => {
    let instanceCounter = 0;

    function RemoteApp({ props }: { props?: { count: number } }) {
      const instanceId = useRef(++instanceCounter);

      return (
        <div>
          <span data-testid="remote-count">Count: {props?.count}</span>
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

    function RemoteApp({ props }: { props?: { count: number } }) {
      return (
        <div>
          <span data-testid="remote-count">Count: {props?.count}</span>
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

  it('should actually recreate component when shouldRecreate is true', async () => {
    const mockUnmount = jest.fn();
    const mockRender = jest.fn();
    const createRootSpy = jest.fn();
    let instanceCounter = 0;

    // Remote component that tracks instances and has internal state
    function RemoteApp({
      props,
    }: {
      props?: { count: number; forceRecreate?: boolean };
    }) {
      const instanceId = useRef(++instanceCounter);
      const [internalState, setInternalState] = useState(0);

      return (
        <div>
          <span data-testid="remote-count">Count: {props?.count}</span>
          <span data-testid="instance-id">Instance: {instanceId.current}</span>
          <span data-testid="internal-state">Internal: {internalState}</span>
          <button
            data-testid="internal-btn"
            onClick={() => setInternalState((s) => s + 1)}
          >
            Internal State
          </button>
        </div>
      );
    }

    // Create bridge component with conditional recreation
    const BridgeComponent = createBridgeComponent({
      rootComponent: RemoteApp,
      rerender: (info: any) => {
        const shouldRecreate = info.props?.forceRecreate === true;
        return { shouldRecreate };
      },
      createRoot: (container, options) => {
        createRootSpy(container, options);
        return {
          render: mockRender,
          unmount: mockUnmount,
        };
      },
    });

    const RemoteAppComponent = createRemoteAppComponent({
      loader: async () => ({ default: BridgeComponent }),
      loading: <div>Loading...</div>,
      fallback: () => <div>Error</div>,
    });

    function HostApp() {
      const [count, setCount] = useState(0);
      const [forceRecreate, setForceRecreate] = useState(false);

      return (
        <div>
          <button
            data-testid="increment-btn"
            onClick={() => setCount((c) => c + 1)}
          >
            Count: {count}
          </button>
          <button
            data-testid="recreate-btn"
            onClick={() => {
              setForceRecreate(true);
              setCount((c) => c + 1);
            }}
          >
            Force Recreate
          </button>
          <RemoteAppComponent props={{ count, forceRecreate }} />
        </div>
      );
    }

    render(<HostApp />);

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalledTimes(1);
    });

    // Clear mocks to track only recreation behavior
    mockRender.mockClear();
    mockUnmount.mockClear();
    createRootSpy.mockClear();

    // Normal rerender (should not recreate)
    act(() => {
      fireEvent.click(screen.getByTestId('increment-btn'));
    });

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalledTimes(1);
    });

    // Should not have unmounted or created new root
    expect(mockUnmount).not.toHaveBeenCalled();
    expect(createRootSpy).not.toHaveBeenCalled();

    // Clear mocks again
    mockRender.mockClear();

    // Force recreation (should recreate)
    act(() => {
      fireEvent.click(screen.getByTestId('recreate-btn'));
    });

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalledTimes(1);
    });

    // Should have unmounted old root and created new one
    expect(mockUnmount).toHaveBeenCalledTimes(1);
    expect(createRootSpy).toHaveBeenCalledTimes(1);
  });

  it('should preserve state with custom render implementation when shouldRecreate=false', async () => {
    let instanceCounter = 0;

    function RemoteApp({ props }: { props?: { count: number } }) {
      const instanceId = useRef(++instanceCounter);
      return (
        <div>
          <span data-testid="remote-count">Count: {props?.count}</span>
          <span data-testid="instance-id">Instance: {instanceId.current}</span>
        </div>
      );
    }

    const BridgeComponent = createBridgeComponent({
      rootComponent: RemoteApp,
      // exercise custom render: user handles createRoot and returns it
      render: (App, container) => {
        // use React 18 createRoot under the hood
        // dynamic import to avoid ESM/CJS interop issues in ts-jest
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { createRoot } = require('react-dom/client');
        const root = createRoot(container as HTMLElement);
        root.render(App);
        return root as any;
      },
      rerender: () => ({ shouldRecreate: false }),
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

    // Trigger rerender
    act(() => {
      fireEvent.click(screen.getByTestId('increment-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('Count: 1');
    });

    // Instance id should remain stable (no remount)
    expect(screen.getByTestId('instance-id')).toHaveTextContent('Instance: 1');
  });
});
