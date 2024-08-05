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
import { createContainer, getHtml, sleep } from './util';

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
