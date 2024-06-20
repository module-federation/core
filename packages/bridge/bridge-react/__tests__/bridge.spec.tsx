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
    function Component(info: { msg: string }) {
      return <div>life cycle render {info.msg}</div>;
    }
    const BridgeComponent = createBridgeComponent({
      rootComponent: Component,
    });
    const RemoteComponent = createRemoteComponent(async () => {
      return {
        default: BridgeComponent,
      };
    });

    const { container } = render(
      <RemoteComponent fallback={<div>loading</div>} msg={'hello world'} />,
    );
    expect(getHtml(container)).toMatch('loading');

    await sleep(200);
    expect(getHtml(container)).toMatch('life cycle render');
    expect(getHtml(container)).toMatch('hello world');
  });
});
