import React from 'react';
import { assert, describe, it } from 'vitest';
import { createBridgeComponent, createRemoteComponent } from '../src';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createContainer, createCustomContainer, getHtml, sleep } from './util';

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

    await sleep(200);
    expect(document.querySelector('#container')!.innerHTML).toContain(
      '<div>life cycle render</div>',
    );

    lifeCycle.destroy({
      dom: containerInfo?.container,
    });

    expect(document.querySelector('#container')!.innerHTML).toContain('');
  });

  it('createRemoteComponent', async () => {
    function Component({ props }: { props?: Record<string, any> }) {
      return <div>life cycle render {props?.msg}</div>;
    }
    const BridgeComponent = createBridgeComponent({
      rootComponent: Component,
    });
    const RemoteComponent = createRemoteComponent({
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

    await sleep(200);
    expect(getHtml(container)).toMatch('life cycle render');
    expect(getHtml(container)).toMatch('hello world');
  });

  it('createRemoteComponent with dom provided, will render on the provided dom', async () => {
    containerInfo = createCustomContainer();

    function Component({ props }: { props?: Record<string, any> }) {
      return <div>life cycle render {props?.msg}</div>;
    }
    const BridgeComponent = createBridgeComponent({
      rootComponent: Component,
    });
    const RemoteComponent = createRemoteComponent({
      loader: async () => {
        return {
          default: BridgeComponent,
        };
      },
      fallback: () => <div></div>,
      loading: <div>loading</div>,
      dom: '#container-custom',
    });

    const { container } = render(
      <RemoteComponent props={{ msg: 'hello there' }} />,
    );
    expect(getHtml(container)).toMatch('loading');

    await sleep(200);

    const element = screen.getByTestId('container-custom');
    expect(element.children.length).toBeGreaterThan(0);
    expect(element.innerHTML).toContain('life cycle render');
    expect(element.innerHTML).toContain('hello there');

    const elementDefault = screen.getByTestId('container');
    expect(elementDefault.children.length).toBe(0);
    expect(elementDefault.innerHTML).toContain('');
  });

  it('createRemoteComponent and obtain ref property', async () => {
    const ref = {
      current: null,
    };

    function Component({ props }: { props?: Record<string, any> }) {
      return <div>life cycle render {props?.msg}</div>;
    }
    const BridgeComponent = createBridgeComponent({
      rootComponent: Component,
    });
    const RemoteComponent = createRemoteComponent({
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

    await sleep(200);
    expect(getHtml(container)).toMatch('life cycle render');
    expect(getHtml(container)).toMatch('hello world');
    expect(ref.current).not.toBeNull();
  });
});
