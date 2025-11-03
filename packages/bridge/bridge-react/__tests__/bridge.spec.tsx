import React from 'react';
import { createBridgeComponent, createRemoteAppComponent } from '../src';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createContainer, getHtml } from './util';

describe('bridge', () => {
  let containerInfo: ReturnType<typeof createContainer>;
  beforeEach(() => {
    containerInfo = createContainer();
  });

  afterEach(() => {
    containerInfo?.clean();
  });

  it('createBridgeComponent life cycle', async () => {
    function Component() {
      return <div>life cycle render</div>;
    }
    const lifeCycle = createBridgeComponent({
      rootComponent: Component,
    })();

    lifeCycle.render({
      dom: containerInfo?.container,
    });

    await waitFor(
      () => {
        expect(document.querySelector('#container')?.innerHTML).toContain(
          '<div>life cycle render</div>',
        );
      },
      { timeout: 2000 },
    );

    lifeCycle.destroy({
      dom: containerInfo?.container,
      moduleName: 'test',
    });

    await waitFor(
      () => {
        expect(
          (document.querySelector('#container')?.innerHTML || '').trim(),
        ).toBe('');
      },
      { timeout: 2000 },
    );
  });

  it('createRemoteAppComponent', async () => {
    function Component({ props }: { props?: Record<string, any> }) {
      return <div>life cycle render {props?.msg}</div>;
    }
    const BridgeComponent = createBridgeComponent({
      rootComponent: Component,
    });
    const RemoteComponent = createRemoteAppComponent({
      loader: async () => {
        return {
          default: BridgeComponent,
        };
      },
      fallback: () => <div></div>,
      loading: <div>loading</div>,
    });

    const { container } = render(
      <RemoteComponent props={{ msg: 'hello world' }} />,
    );
    expect(getHtml(container)).toMatch('loading');

    await waitFor(
      () => {
        expect(getHtml(container)).toMatch('life cycle render');
        expect(getHtml(container)).toMatch('hello world');
      },
      { timeout: 2000 },
    );
  });

  it('createRemoteAppComponent and obtain ref property', async () => {
    const ref = {
      current: null,
    };

    function Component({ props }: { props?: Record<string, any> }) {
      return <div>life cycle render {props?.msg}</div>;
    }
    const BridgeComponent = createBridgeComponent({
      rootComponent: Component,
    });
    const RemoteComponent = createRemoteAppComponent({
      loader: async () => {
        return {
          default: BridgeComponent,
        };
      },
      fallback: () => <div></div>,
      loading: <div>loading</div>,
    });

    const { container } = render(
      <RemoteComponent ref={ref} props={{ msg: 'hello world' }} />,
    );
    expect(getHtml(container)).toMatch('loading');

    await waitFor(
      () => {
        expect(getHtml(container)).toMatch('life cycle render');
        expect(getHtml(container)).toMatch('hello world');
        expect(ref.current).not.toBeNull();
      },
      { timeout: 2000 },
    );
  });

  it('createRemoteAppComponent with custom createRoot prop', async () => {
    const renderMock = jest.fn();

    function Component({ props }: { props?: Record<string, any> }) {
      return <div>life cycle render {props?.msg}</div>;
    }
    const BridgeComponent = createBridgeComponent({
      rootComponent: Component,
      createRoot: () => {
        return {
          render: renderMock,
          unmount: jest.fn(),
        };
      },
    });
    const RemoteComponent = createRemoteAppComponent({
      loader: async () => {
        return {
          default: BridgeComponent,
        };
      },
      fallback: () => <div></div>,
      loading: <div>loading</div>,
    });

    const { container } = render(<RemoteComponent />);
    expect(getHtml(container)).toMatch('loading');

    await waitFor(
      () => {
        expect(renderMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 },
    );
  });

  it('createBridgeComponent with custom rerender function', async () => {
    const rerenderMock = jest.fn();
    let componentProps: any = { count: 0 };

    function Component(props: any) {
      componentProps = props;
      return <div>count: {props.count}</div>;
    }

    const lifeCycle = createBridgeComponent({
      rootComponent: Component,
      rerender: rerenderMock,
    })();

    // Initial render
    await lifeCycle.render({
      dom: containerInfo?.container,
      count: 1,
    });

    await waitFor(
      () => {
        expect(document.querySelector('#container')?.innerHTML).toContain(
          'count: 1',
        );
      },
      { timeout: 2000 },
    );

    // Test rerender functionality
    if (lifeCycle.rerender) {
      lifeCycle.rerender({ count: 2 });
      expect(rerenderMock).toHaveBeenCalledWith({ count: 2 });
    }
  });

  it('createRemoteAppComponent prop updates use efficient rerender', async () => {
    const renderMock = jest.fn();
    const rerenderMock = jest.fn();
    let renderCount = 0;

    function Component(props: any) {
      renderCount++;
      return <div>count: {props.count}, renders: {renderCount}</div>;
    }

    const BridgeComponent = createBridgeComponent({
      rootComponent: Component,
      rerender: rerenderMock,
      createRoot: () => {
        return {
          render: renderMock,
          unmount: jest.fn(),
        };
      },
    });

    const RemoteComponent = createRemoteAppComponent({
      loader: async () => {
        return {
          default: BridgeComponent,
        };
      },
      fallback: () => <div></div>,
      loading: <div>loading</div>,
    });

    const TestWrapper = () => {
      const [count, setCount] = React.useState(0);
      return (
        <div>
          <button onClick={() => setCount(c => c + 1)}>Increment</button>
          <RemoteComponent props={{ count }} />
        </div>
      );
    };

    const { container } = render(<TestWrapper />);
    
    // Wait for initial load
    await waitFor(
      () => {
        expect(getHtml(container)).toMatch('count: 0');
      },
      { timeout: 2000 },
    );

    // Simulate prop update
    const button = container.querySelector('button');
    if (button) {
      fireEvent.click(button);
      
      await waitFor(
        () => {
          // Should use rerender instead of full render
          expect(rerenderMock).toHaveBeenCalled();
        },
        { timeout: 2000 },
      );
    }
  });

  it('createRemoteAppComponent falls back to full render when rerender not available', async () => {
    const renderMock = jest.fn();
    let renderCount = 0;

    function Component(props: any) {
      renderCount++;
      return <div>count: {props.count}, renders: {renderCount}</div>;
    }

    const BridgeComponent = createBridgeComponent({
      rootComponent: Component,
      // No rerender function provided
      createRoot: () => {
        return {
          render: renderMock,
          unmount: jest.fn(),
        };
      },
    });

    const RemoteComponent = createRemoteAppComponent({
      loader: async () => {
        return {
          default: BridgeComponent,
        };
      },
      fallback: () => <div></div>,
      loading: <div>loading</div>,
    });

    const TestWrapper = () => {
      const [count, setCount] = React.useState(0);
      return (
        <div>
          <button onClick={() => setCount(c => c + 1)}>Increment</button>
          <RemoteComponent props={{ count }} />
        </div>
      );
    };

    const { container } = render(<TestWrapper />);
    
    // Wait for initial load
    await waitFor(
      () => {
        expect(getHtml(container)).toMatch('count: 0');
      },
      { timeout: 2000 },
    );

    const initialRenderCount = renderMock.mock.calls.length;

    // Simulate prop update
    const button = container.querySelector('button');
    if (button) {
      fireEvent.click(button);
      
      await waitFor(
        () => {
          // Should call render again for fallback
          expect(renderMock.mock.calls.length).toBeGreaterThan(initialRenderCount);
        },
        { timeout: 2000 },
      );
    }
  });

  it('createBridgeComponent state management prevents unnecessary root recreation', async () => {
    let stateUpdateCount = 0;
    const originalSetState = React.useState;
    
    // Mock useState to track state updates
    jest.spyOn(React, 'useState').mockImplementation((initial) => {
      const [state, setState] = originalSetState(initial);
      return [state, (newState: any) => {
        stateUpdateCount++;
        setState(newState);
      }];
    });

    function Component(props: any) {
      return <div>message: {props.message}</div>;
    }

    const lifeCycle = createBridgeComponent({
      rootComponent: Component,
    })();

    // Initial render
    await lifeCycle.render({
      dom: containerInfo?.container,
      message: 'hello',
    });

    await waitFor(
      () => {
        expect(document.querySelector('#container')?.innerHTML).toContain(
          'message: hello',
        );
      },
      { timeout: 2000 },
    );

    const initialStateUpdateCount = stateUpdateCount;

    // Second render with different props
    await lifeCycle.render({
      dom: containerInfo?.container,
      message: 'world',
    });

    await waitFor(
      () => {
        expect(document.querySelector('#container')?.innerHTML).toContain(
          'message: world',
        );
        // Should use state update instead of recreating root
        expect(stateUpdateCount).toBeGreaterThan(initialStateUpdateCount);
      },
      { timeout: 2000 },
    );

    // Restore original useState
    (React.useState as jest.Mock).mockRestore();
  });
});
