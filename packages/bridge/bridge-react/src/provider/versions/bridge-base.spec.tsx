import React from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { getBridgeSSRContainerAttrs } from '@module-federation/bridge-shared';
import { createBaseBridgeComponent } from './bridge-base';

const Root = () => <div>remote</div>;

describe('React Bridge hydration selection', () => {
  it('hydrates only a matching host-passed SSR mount', async () => {
    const hydrateRoot = rs.fn(() => ({ render: rs.fn(), unmount: rs.fn() }));
    const createRoot = rs.fn(() => ({ render: rs.fn(), unmount: rs.fn() }));
    const dom = document.createElement('div');
    for (const [name, value] of Object.entries(
      getBridgeSSRContainerAttrs({ moduleName: 'remote', instanceId: 'one' }),
    ))
      dom.setAttribute(name, value);
    dom.innerHTML = '<div>remote</div>';
    const provider = createBaseBridgeComponent({
      rootComponent: Root,
      createRoot,
      hydrateRoot,
      ssr: true,
    })();
    await provider.render({ dom, moduleName: 'remote', instanceId: 'one' });
    expect(hydrateRoot).toHaveBeenCalledOnce();
    expect(createRoot).not.toHaveBeenCalled();
  });

  it('keeps the existing CSR path without a payload marker', async () => {
    const root = { render: rs.fn(), unmount: rs.fn() };
    const createRoot = rs.fn(() => root);
    const hydrate = rs.fn(() => ({ restored: true }));
    const provider = createBaseBridgeComponent({
      rootComponent: Root,
      createRoot,
      hydrateRoot: rs.fn(),
      ssr: { hydrate },
    })();
    await provider.render({
      dom: document.createElement('div'),
      moduleName: 'remote',
    });
    expect(createRoot).toHaveBeenCalledOnce();
    expect(root.render).toHaveBeenCalledOnce();
    expect(hydrate).not.toHaveBeenCalled();
  });

  it('unmounts a custom renderer that resolves after cancellation', async () => {
    const root = { render: rs.fn(), unmount: rs.fn() };
    let finishRender!: (renderedRoot: typeof root) => void;
    const render = rs.fn(
      () =>
        new Promise<typeof root>((resolve) => {
          finishRender = resolve;
        }),
    );
    const provider = createBaseBridgeComponent({
      rootComponent: Root,
      render,
    })();
    const dom = document.createElement('div');
    document.body.append(dom);
    const controller = new AbortController();

    const pending = provider.render({
      dom,
      moduleName: 'remote',
      signal: controller.signal,
    });
    controller.abort();
    finishRender(root);
    await pending;

    expect(root.unmount).toHaveBeenCalledOnce();
    provider.destroy({ dom, moduleName: 'remote' });
    expect(root.unmount).toHaveBeenCalledOnce();
    dom.remove();
  });
});
