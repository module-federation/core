import React, { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import {
  createBridgeHydrationRegistry,
  toBridgeSSRReference,
} from '@module-federation/bridge-shared';
import { RemoteAppWrapper } from './RemoteAppWrapper';
import { ErrorBoundary } from '../error-boundary';
import { BridgeHydrationProvider, BridgeRemoteSlot } from '../hydration';

const baseProps = {
  moduleName: 'remote/app',
  providerInfo: () => ({ render() {}, destroy() {} }),
  exportName: 'default',
  fallback: () => null,
  loading: null,
};

describe('RemoteAppWrapper SSR payload boundary', () => {
  it('injects only a valid result matching the mounted module and instance', () => {
    const result = {
      protocolVersion: 1 as const,
      moduleName: 'remote/app',
      instanceId: 'remote-1',
      html: '<p>server remote</p>',
    };
    const html = renderToStaticMarkup(
      <RemoteAppWrapper {...baseProps} instanceId="remote-1" ssr={result} />,
    );
    expect(html).toContain('data-mf-bridge-instance="remote-1"');
    expect(html).toContain('<p>server remote</p>');
    expect(html.match(/server remote/g)).toHaveLength(1);
    expect(html).toContain('data-mf-bridge-state="true"');

    const mismatch = renderToStaticMarkup(
      <RemoteAppWrapper
        {...baseProps}
        instanceId="other-instance"
        ssr={result}
      />,
    );
    expect(mismatch).not.toContain('data-mf-bridge-ssr');
    expect(mismatch).not.toContain('server remote');
  });

  it('rejects malformed host-carried results', () => {
    expect(() =>
      renderToStaticMarkup(
        <RemoteAppWrapper
          {...baseProps}
          ssr={
            {
              protocolVersion: 2,
              moduleName: 'remote/app',
              instanceId: 'remote-1',
              html: '<p>invalid</p>',
            } as any
          }
        />,
      ),
    ).toThrow(/incompatible result/);
  });
});

describe('RemoteAppWrapper lifecycle', () => {
  afterEach(() => {
    rs.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('supports changing between object, callback, and absent forwarded refs', async () => {
    const provider = { render: rs.fn(), destroy: rs.fn() };
    const providerInfo = () => provider;
    const objectRef = createRef<HTMLDivElement>();
    const callbackRef = rs.fn();
    const view = render(
      <RemoteAppWrapper
        {...baseProps}
        providerInfo={providerInfo}
        ref={objectRef}
      />,
    );
    await waitFor(() => expect(provider.render).toHaveBeenCalledOnce());
    expect(objectRef.current).toBeInstanceOf(HTMLDivElement);

    view.rerender(
      <RemoteAppWrapper
        {...baseProps}
        providerInfo={providerInfo}
        ref={callbackRef}
      />,
    );
    expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    view.rerender(
      <RemoteAppWrapper {...baseProps} providerInfo={providerInfo} />,
    );
  });

  it('passes replacement callback props to the existing provider', async () => {
    const provider = { render: rs.fn(), destroy: rs.fn() };
    const providerInfo = () => provider;
    const first = rs.fn();
    const second = rs.fn();
    const view = render(
      <RemoteAppWrapper
        {...baseProps}
        providerInfo={providerInfo}
        onAction={first}
      />,
    );
    await waitFor(() => expect(provider.render).toHaveBeenCalledOnce());

    view.rerender(
      <RemoteAppWrapper
        {...baseProps}
        providerInfo={providerInfo}
        onAction={second}
      />,
    );
    await waitFor(() => expect(provider.render).toHaveBeenCalledTimes(2));
    expect(provider.render.mock.calls[1][0].onAction).toBe(second);
  });

  it('routes asynchronous provider failures through the error boundary', async () => {
    const failure = new Error('remote render failed');
    const providerInfo = () => ({
      render: rs.fn(async () => {
        throw failure;
      }),
      destroy: rs.fn(),
    });
    const Fallback = ({ error }: { error: Error }) => <p>{error.message}</p>;

    const view = render(
      <ErrorBoundary FallbackComponent={Fallback as any}>
        <RemoteAppWrapper {...baseProps} providerInfo={providerInfo} />
      </ErrorBoundary>,
    );
    await expect(view.findByText('remote render failed')).resolves.toBeTruthy();
  });

  it('defers and deduplicates destructive cleanup', async () => {
    const queued: Array<() => void> = [];
    rs.spyOn(globalThis, 'queueMicrotask').mockImplementation((callback) => {
      queued.push(callback as () => void);
    });
    const provider = { render: rs.fn(), destroy: rs.fn() };
    const providerInfo = () => provider;
    const view = render(
      <RemoteAppWrapper {...baseProps} providerInfo={providerInfo} />,
    );
    await waitFor(() => expect(provider.render).toHaveBeenCalledOnce());

    view.unmount();
    expect(provider.destroy).not.toHaveBeenCalled();
    expect(queued).toHaveLength(1);
    await act(async () => queued[0]());
    expect(provider.destroy).toHaveBeenCalledOnce();
  });

  it('claims the registry snapshot before render and clears it on cancel', async () => {
    const queued: Array<() => void> = [];
    rs.spyOn(globalThis, 'queueMicrotask').mockImplementation((callback) => {
      queued.push(callback as () => void);
    });

    const result = {
      protocolVersion: 1 as const,
      moduleName: 'remote/app',
      instanceId: 'remote-1',
      html: '<p>server remote</p>',
      dehydratedState: { ready: true },
    };
    document.body.innerHTML = renderToStaticMarkup(
      <BridgeRemoteSlot
        moduleName={result.moduleName}
        instanceId={result.instanceId}
        payload={result}
      />,
    );
    const registry = createBridgeHydrationRegistry(document);
    let finishRender!: () => void;
    const provider = {
      render: rs.fn(
        () =>
          new Promise<void>((resolve) => {
            finishRender = resolve;
          }),
      ),
      destroy: rs.fn(),
    };

    const view = render(
      <BridgeHydrationProvider registry={registry}>
        <RemoteAppWrapper
          {...baseProps}
          instanceId="remote-1"
          ssr={toBridgeSSRReference(result)}
          providerInfo={() => provider}
        />
      </BridgeHydrationProvider>,
    );

    await waitFor(() => expect(provider.render).toHaveBeenCalledOnce());
    expect(registry.peek('remote/app', 'remote-1')).toBeUndefined();
    expect(
      (provider.render.mock.calls[0] as unknown as [{ ssrState?: unknown }])[0]
        .ssrState,
    ).toEqual({ ready: true });

    view.unmount();
    finishRender();
    for (const task of queued.splice(0)) {
      await act(async () => task());
    }
    expect(registry.peek('remote/app', 'remote-1')).toBeUndefined();
  });

  it('destroys provider only once when render settles after unmount', async () => {
    const queued: Array<() => void> = [];
    rs.spyOn(globalThis, 'queueMicrotask').mockImplementation((callback) => {
      queued.push(callback as () => void);
    });
    let finishRender!: () => void;
    const provider = {
      render: rs.fn(
        () =>
          new Promise<void>((resolve) => {
            finishRender = resolve;
          }),
      ),
      destroy: rs.fn(),
    };

    const view = render(
      <RemoteAppWrapper {...baseProps} providerInfo={() => provider} />,
    );
    await waitFor(() => expect(provider.render).toHaveBeenCalledOnce());

    view.unmount();
    finishRender();
    for (const task of queued.splice(0)) {
      await act(async () => task());
    }
    expect(provider.destroy).toHaveBeenCalledOnce();
  });

  it('forces CSR when a second consumer loses the snapshot claim', async () => {
    const result = {
      protocolVersion: 1 as const,
      moduleName: 'remote/app',
      instanceId: 'remote-1',
      html: '<p>server remote</p>',
      dehydratedState: { ready: true },
    };
    document.body.innerHTML = renderToStaticMarkup(
      <BridgeRemoteSlot
        moduleName={result.moduleName}
        instanceId={result.instanceId}
        payload={result}
      />,
    );
    const registry = createBridgeHydrationRegistry(document);
    const first = {
      render: rs.fn((info: { ssrState?: unknown }) => info),
      destroy: rs.fn(),
    };
    const second = {
      render: rs.fn((info: { ssrState?: unknown }) => info),
      destroy: rs.fn(),
    };

    render(
      <BridgeHydrationProvider registry={registry}>
        <RemoteAppWrapper
          {...baseProps}
          instanceId="remote-1"
          ssr={toBridgeSSRReference(result)}
          providerInfo={() => first}
        />
        <RemoteAppWrapper
          {...baseProps}
          moduleName="remote/app"
          instanceId="remote-1"
          ssr={toBridgeSSRReference(result)}
          providerInfo={() => second}
        />
      </BridgeHydrationProvider>,
    );

    await waitFor(() => expect(first.render).toHaveBeenCalledOnce());
    await waitFor(() => expect(second.render).toHaveBeenCalledOnce());

    const states = [first, second].map((provider) => {
      const call = provider.render.mock.calls[0] as unknown as [
        { ssrState?: { ready?: boolean } },
      ];
      return call[0].ssrState;
    });
    expect(states.filter((state) => state?.ready === true)).toHaveLength(1);
    expect(states.filter((state) => state === undefined)).toHaveLength(1);
  });

  it('flushes deferred destroy before a remount renders on the same DOM', async () => {
    const queued: Array<() => void> = [];
    rs.spyOn(globalThis, 'queueMicrotask').mockImplementation((callback) => {
      queued.push(callback as () => void);
    });
    const order: string[] = [];
    let providerCount = 0;
    const providerInfo = () => {
      const id = ++providerCount;
      return {
        render: rs.fn(() => {
          order.push(`render-${id}`);
        }),
        destroy: rs.fn(() => {
          order.push(`destroy-${id}`);
        }),
      };
    };

    const first = render(
      <RemoteAppWrapper {...baseProps} providerInfo={providerInfo} />,
    );
    await waitFor(() => expect(order.includes('render-1')).toBe(true));

    first.unmount();
    expect(order.includes('destroy-1')).toBe(false);
    expect(queued.length).toBeGreaterThan(0);

    const second = render(
      <RemoteAppWrapper {...baseProps} providerInfo={providerInfo} />,
    );
    await waitFor(() => expect(order.includes('render-2')).toBe(true));

    const destroy1 = order.indexOf('destroy-1');
    const render2 = order.indexOf('render-2');
    expect(destroy1).toBeGreaterThanOrEqual(0);
    expect(render2).toBeGreaterThan(destroy1);
    second.unmount();
  });

  it('destroys the final CSR mount after an in-place SSR clear', async () => {
    const queued: Array<() => void> = [];
    rs.spyOn(globalThis, 'queueMicrotask').mockImplementation((callback) => {
      queued.push(callback as () => void);
    });
    let finishRender!: () => void;
    const provider = {
      render: rs.fn(
        () =>
          new Promise<void>((resolve) => {
            finishRender = resolve;
          }),
      ),
      destroy: rs.fn(),
    };
    const providerInfo = () => provider;
    const result = {
      protocolVersion: 1 as const,
      moduleName: 'remote/app',
      instanceId: 'remote-1',
      html: '<p>server remote</p>',
      dehydratedState: { ready: true },
    };

    const view = render(
      <RemoteAppWrapper
        {...baseProps}
        instanceId="remote-1"
        ssr={result}
        providerInfo={providerInfo}
      />,
    );

    await waitFor(() => expect(provider.render).toHaveBeenCalledOnce());
    expect(
      view.container.querySelector('[data-mf-bridge-slot="true"]'),
    ).not.toBeNull();

    view.rerender(
      <RemoteAppWrapper
        {...baseProps}
        instanceId="remote-1"
        ssr={undefined}
        providerInfo={providerInfo}
      />,
    );
    await act(async () => {
      finishRender();
      await Promise.resolve();
    });
    await waitFor(() => expect(provider.render).toHaveBeenCalledTimes(2));
    expect(
      view.container.querySelector('[data-mf-bridge-slot="true"]'),
    ).toBeNull();

    const destroysAfterSwap = provider.destroy.mock.calls.length;
    view.unmount();
    expect(queued.length).toBeGreaterThan(0);
    await act(async () => {
      queued.splice(0).forEach((callback) => callback());
    });
    expect(provider.destroy.mock.calls.length).toBeGreaterThan(
      destroysAfterSwap,
    );
  });

  it('refreshes a forwarded ref when an SSR slot becomes a CSR mount', async () => {
    const provider = { render: rs.fn(), destroy: rs.fn() };
    const objectRef = createRef<HTMLDivElement>();
    const result = {
      protocolVersion: 1 as const,
      moduleName: 'remote/app',
      instanceId: 'remote-1',
      html: '<p>server remote</p>',
    };

    const view = render(
      <RemoteAppWrapper
        {...baseProps}
        instanceId="remote-1"
        ssr={result}
        providerInfo={() => provider}
        ref={objectRef}
      />,
    );

    await waitFor(() => expect(provider.render).toHaveBeenCalledOnce());
    const ssrMount = objectRef.current;
    expect(ssrMount).not.toBeNull();

    view.rerender(
      <RemoteAppWrapper
        {...baseProps}
        instanceId="remote-1"
        providerInfo={() => provider}
        ref={objectRef}
      />,
    );

    await waitFor(() => expect(provider.render).toHaveBeenCalledTimes(2));
    expect(objectRef.current).not.toBe(ssrMount);
    expect(objectRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('destroys the latest provider after providerInfo changes mid-render', async () => {
    const queued: Array<() => void> = [];
    rs.spyOn(globalThis, 'queueMicrotask').mockImplementation((callback) => {
      queued.push(callback as () => void);
    });
    let finishFirst!: () => void;
    const first = {
      render: rs.fn(
        () =>
          new Promise<void>((resolve) => {
            finishFirst = resolve;
          }),
      ),
      destroy: rs.fn(),
    };
    const second = {
      render: rs.fn(async () => undefined),
      destroy: rs.fn(),
    };
    let current = first;
    const providerInfo = () => current;

    const view = render(
      <RemoteAppWrapper {...baseProps} providerInfo={providerInfo} />,
    );
    await waitFor(() => expect(first.render).toHaveBeenCalledOnce());

    current = second;
    view.rerender(
      <RemoteAppWrapper
        {...baseProps}
        providerInfo={() => second}
        moduleName="remote/app-2"
      />,
    );
    await act(async () => {
      finishFirst();
      await Promise.resolve();
      queued.splice(0).forEach((callback) => callback());
    });
    await waitFor(() => expect(second.render).toHaveBeenCalledOnce());

    view.unmount();
    await act(async () => {
      queued.splice(0).forEach((callback) => callback());
    });
    expect(second.destroy).toHaveBeenCalledOnce();
  });
});
