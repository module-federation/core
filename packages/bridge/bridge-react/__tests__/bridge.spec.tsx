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

  it('does not render host fallback inside the remote root', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const HostFallback = jest.fn(() => <div>host fallback</div>);
    function BrokenComponent() {
      throw new Error('remote render failed');
    }
    const lifeCycle = createBridgeComponent({
      rootComponent: BrokenComponent,
    })();

    lifeCycle.render({
      dom: containerInfo?.container,
      fallback: HostFallback,
    });

    await waitFor(
      () => {
        expect(getHtml(containerInfo.container)).toMatch(
          'Something went wrong',
        );
        expect(getHtml(containerInfo.container)).not.toMatch('host fallback');
      },
      { timeout: 2000 },
    );
    expect(HostFallback).not.toHaveBeenCalled();

    lifeCycle.destroy({
      dom: containerInfo?.container,
      moduleName: 'test',
    });
    consoleError.mockRestore();
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
});
