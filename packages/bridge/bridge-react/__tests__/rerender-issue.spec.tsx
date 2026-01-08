import React, { useState, useRef } from 'react';
import { createBridgeComponent, createRemoteAppComponent } from '../src';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { federationRuntime } from '../src/provider/plugin';
import type { ModuleFederation } from '@module-federation/runtime';

// Ensure tests do not leak mocked runtime across cases
afterEach(() => {
  federationRuntime.instance = null;
});

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

    await waitFor(
      () => {
        expect(screen.getByTestId('remote-count')).toHaveTextContent(
          'Count: 1',
        );
      },
      { timeout: 3000 },
    );

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

    // Instance id should remain stable (no remount)
    expect(screen.getByTestId('instance-id')).toHaveTextContent('Instance: 1');
  });

  it('should support rerender function returning void and preserve state', async () => {
    const customRerenderSpy = jest.fn();

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
    // Instance should be preserved
    expect(screen.getByTestId('instance-id')).toHaveTextContent('Instance: 1');
  });

  it('should preserve state with custom render implementation', async () => {
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

  it('should not emit lifecycle destroy hooks during normal rerenders', async () => {
    const beforeBridgeRender = jest.fn();
    const afterBridgeRender = jest.fn();
    const beforeBridgeDestroy = jest.fn();
    const afterBridgeDestroy = jest.fn();

    // Inject a mocked federation runtime instance to capture lifecycle emits
    federationRuntime.instance = {
      bridgeHook: {
        lifecycle: {
          beforeBridgeRender: { emit: beforeBridgeRender },
          afterBridgeRender: { emit: afterBridgeRender },
          beforeBridgeDestroy: { emit: beforeBridgeDestroy },
          afterBridgeDestroy: { emit: afterBridgeDestroy },
        },
      },
    } as unknown as ModuleFederation;

    const mockUnmount = jest.fn();
    const mockRender = jest.fn();
    const createRootSpy = jest.fn(() => ({
      render: mockRender,
      unmount: mockUnmount,
    }));

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
      createRoot: createRootSpy,
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
          <button data-testid="inc" onClick={() => setCount((c) => c + 1)} />
          <RemoteAppComponent props={{ count }} />
        </div>
      );
    }

    render(<HostApp />);

    // Initial render calls
    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    });
    expect(beforeBridgeRender).toHaveBeenCalled();
    expect(afterBridgeRender).toHaveBeenCalled();

    // Clear for rerender assertions
    mockRender.mockClear();
    beforeBridgeRender.mockClear();
    afterBridgeRender.mockClear();
    beforeBridgeDestroy.mockClear();
    afterBridgeDestroy.mockClear();

    // Normal rerender: should not destroy, just update
    act(() => {
      fireEvent.click(screen.getByTestId('inc'));
    });
    await waitFor(() => expect(mockRender).toHaveBeenCalled());

    // Destroy hooks should NOT be called during normal rerenders
    expect(beforeBridgeDestroy).not.toHaveBeenCalled();
    expect(afterBridgeDestroy).not.toHaveBeenCalled();

    // Render hooks should be called for the update
    expect(beforeBridgeRender).toHaveBeenCalled();
    expect(afterBridgeRender).toHaveBeenCalled();

    // Should not have unmounted or created new root
    expect(mockUnmount).not.toHaveBeenCalled();
    expect(createRootSpy).toHaveBeenCalledTimes(1);
  });

  it('should recreate when host changes key (React key technique)', async () => {
    let instanceCounter = 0;

    function RemoteApp({ props }: { props?: { count: number } }) {
      // Use useRef with a function initializer to only increment on mount
      const instanceId = useRef<number>(null as any);
      if (instanceId.current === null) {
        instanceId.current = ++instanceCounter;
      }
      return (
        <div>
          <span data-testid="remote-count">Count: {props?.count}</span>
          <span data-testid="instance-id">Instance: {instanceId.current}</span>
        </div>
      );
    }

    const BridgeComponent = createBridgeComponent({
      rootComponent: RemoteApp,
      // No rerender option provided; key change should force unmount/mount
    });

    const RemoteAppComponent = createRemoteAppComponent({
      loader: async () => ({ default: BridgeComponent }),
      loading: <div>Loading...</div>,
      fallback: () => <div>Error</div>,
    });

    function HostApp() {
      const [count, setCount] = useState(0);
      const [key, setKey] = useState('a');

      return (
        <div>
          <button data-testid="inc" onClick={() => setCount((c) => c + 1)} />
          <button
            data-testid="swap-key"
            onClick={() => setKey((k) => (k === 'a' ? 'b' : 'a'))}
          />
          <RemoteAppComponent key={key} props={{ count }} />
        </div>
      );
    }

    render(<HostApp />);

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('Count: 0');
      expect(screen.getByTestId('instance-id')).toHaveTextContent(
        'Instance: 1',
      );
    });

    // Update props without key change — should preserve instance
    act(() => {
      fireEvent.click(screen.getByTestId('inc'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('Count: 1');
      expect(screen.getByTestId('instance-id')).toHaveTextContent(
        'Instance: 1',
      );
    });

    // Change key — should remount and increment instance id
    act(() => {
      fireEvent.click(screen.getByTestId('swap-key'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('Count: 1');
      expect(screen.getByTestId('instance-id')).toHaveTextContent(
        'Instance: 2',
      );
    });
  });

  it('should hydrate with custom hydrateRoot and preserve state on update', async () => {
    function RemoteApp({ props }: { props?: { count: number } }) {
      return (
        <div>
          <span data-testid="remote-count">Count: {props?.count}</span>
        </div>
      );
    }

    const BridgeComponent = createBridgeComponent({
      rootComponent: RemoteApp,
      render: (App, container) => {
        // Hydrate existing SSR markup first, then reuse the returned root for updates
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { hydrateRoot } = require('react-dom/client') as {
          hydrateRoot: (
            c: HTMLElement,
            initialChildren: React.ReactNode,
          ) => { render: (n: React.ReactNode) => void; unmount: () => void };
        };
        // Pre-populate minimal SSR markup matching the structure (content may differ)
        (container as HTMLElement).innerHTML =
          '<div><span data-testid="remote-count">Count: 0</span></div>';
        const r = hydrateRoot(container as HTMLElement, App);
        return {
          render: (n: React.ReactNode) => r.render(n),
          unmount: () => r.unmount(),
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
      return (
        <div>
          <button data-testid="inc" onClick={() => setCount((c) => c + 1)} />
          <RemoteAppComponent props={{ count }} />
        </div>
      );
    }

    render(<HostApp />);

    // Hydrated content should appear; then updates should modify text
    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(screen.getByTestId('inc'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('Count: 1');
    });
  });

  it('should emit destroy hooks when host changes key (key-based remount)', async () => {
    const beforeBridgeDestroy = jest.fn();
    const afterBridgeDestroy = jest.fn();
    federationRuntime.instance = {
      bridgeHook: {
        lifecycle: {
          beforeBridgeRender: { emit: jest.fn() },
          afterBridgeRender: { emit: jest.fn() },
          beforeBridgeDestroy: { emit: beforeBridgeDestroy },
          afterBridgeDestroy: { emit: afterBridgeDestroy },
        },
      },
    } as unknown as ModuleFederation;

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

    const BridgeComponent = createBridgeComponent({ rootComponent: RemoteApp });
    const RemoteAppComponent = createRemoteAppComponent({
      loader: async () => ({ default: BridgeComponent }),
      loading: <div>Loading...</div>,
      fallback: () => <div>Error</div>,
    });

    function HostApp() {
      const [key, setKey] = useState('a');
      const [count, setCount] = useState(0);
      return (
        <div>
          <button data-testid="inc" onClick={() => setCount((c) => c + 1)} />
          <button
            data-testid="swap-key"
            onClick={() => setKey((k) => (k === 'a' ? 'b' : 'a'))}
          />
          <RemoteAppComponent key={key} props={{ count }} />
        </div>
      );
    }

    render(<HostApp />);

    await waitFor(() => {
      expect(screen.getByTestId('instance-id')).toHaveTextContent(
        'Instance: 1',
      );
    });

    // Trigger a key change to force remount
    act(() => {
      fireEvent.click(screen.getByTestId('swap-key'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('instance-id')).toHaveTextContent(
        'Instance: 2',
      );
    });

    expect(beforeBridgeDestroy).toHaveBeenCalled();
    expect(afterBridgeDestroy).toHaveBeenCalled();
  });

  it('should inject extra props from beforeBridgeRender into child props', async () => {
    // Arrange federation runtime lifecycle hook to inject props
    const beforeBridgeRender = jest.fn().mockReturnValue({
      extraProps: { props: { injected: 'hello' } },
    });
    federationRuntime.instance = {
      bridgeHook: {
        lifecycle: {
          beforeBridgeRender: { emit: beforeBridgeRender },
          afterBridgeRender: { emit: jest.fn() },
          beforeBridgeDestroy: { emit: jest.fn() },
          afterBridgeDestroy: { emit: jest.fn() },
        },
      },
    } as unknown as ModuleFederation;

    function RemoteApp({ props }: { props?: { injected?: string } }) {
      return (
        <div>
          <span data-testid="injected">{props?.injected ?? 'nope'}</span>
        </div>
      );
    }

    const BridgeComponent = createBridgeComponent({
      rootComponent: RemoteApp,
    });

    const RemoteAppComponent = createRemoteAppComponent({
      loader: async () => ({ default: BridgeComponent }),
      loading: <div>Loading...</div>,
      fallback: () => <div>Error</div>,
    });

    render(<RemoteAppComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('injected')).toHaveTextContent('hello');
    });

    expect(beforeBridgeRender).toHaveBeenCalled();
  });

  it('should fallback to custom render on update when returned root lacks render()', async () => {
    const customRender = jest.fn();

    // Track roots per container and intentionally return a handle without `render`
    const roots = new Map<Element, any>();

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
      render: (App, container) => {
        customRender(App, container);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { createRoot } = require('react-dom/client') as {
          createRoot: (c: HTMLElement) => {
            render: (n: React.ReactNode) => void;
            unmount: () => void;
          };
        };
        let root = roots.get(container as Element);
        if (!root) {
          root = createRoot(container as HTMLElement);
          roots.set(container as Element, root);
        }
        root.render(App);
        // Return a handle without `render` to simulate implementations that don’t expose it
        // Bind unmount to avoid teardown errors when called later
        // Return a DOM element to simulate a non-root handle (no render method)
        return container as HTMLElement;
      },
      // No rerender hook; fallback path should call custom render again
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
          <button data-testid="inc" onClick={() => setCount((c) => c + 1)} />
          <RemoteAppComponent props={{ count }} />
        </div>
      );
    }

    render(<HostApp />);

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toBeInTheDocument();
    });
    expect(customRender).toHaveBeenCalledTimes(1);

    // Trigger update – fallback should call custom render again
    act(() => {
      fireEvent.click(screen.getByTestId('inc'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('remote-count')).toHaveTextContent('Count: 1');
    });
    expect(customRender).toHaveBeenCalledTimes(2);
  });
});
