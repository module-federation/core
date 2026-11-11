import React from 'react';
import { act, render, waitFor, fireEvent } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { RemoteAppWrapper } from '../src/remote/RemoteAppWrapper';
import { ReadableStream } from 'node:stream/web';
global.ReadableStream = ReadableStream as typeof global.ReadableStream;
import { BRIDGE_PRODUCER_PROTOCOL } from '../src/service/protocol';
import type { BridgeProviderInstance } from '../src/types';

function Counter({ label }: { label: string }) {
  const [count, setCount] = React.useState(0);
  return (
    <button onClick={() => setCount((value) => value + 1)}>
      {label}: {count}
    </button>
  );
}
it('hands off an empty container, hydrates once before done, and retains the network across updates', async () => {
  delete window.__MF_BRIDGE_SSR__;
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let root: Root;
  const provider: BridgeProviderInstance = {
    hydrate: jest.fn((info) => {
      root = hydrateRoot(info.dom, <Counter label={info.label as string} />);
    }),
    render: jest.fn((info) => {
      root.render(<Counter label={info.label as string} />);
    }),
    destroy: jest.fn(() => {
      root.unmount();
    }),
  };
  const originalFetch = global.fetch;
  const fetcher = jest.fn(async (_url, init) => {
    const input = JSON.parse(init.body);
    const encoder = new TextEncoder();
    return {
      status: 200,
      headers: { get: () => 'application/x-ndjson' },
      body: new ReadableStream<Uint8Array>({
        async start(controller) {
          const send = (frame: unknown) =>
            controller.enqueue(encoder.encode(JSON.stringify(frame) + '\n'));
          send({
            type: 'meta',
            protocol: BRIDGE_PRODUCER_PROTOCOL,
            buildVersion: 'build-1',
            identifierPrefix: input.request.identifierPrefix,
            hydration: 'progressive',
          });
          send({
            type: 'html',
            html: renderToString(<Counter label={input.request.props.label} />),
          });
          send({ type: 'ready', snapshot: {} });
          await pending;
          send({ type: 'done' });
          controller.close();
        },
      }),
    } as unknown as Response;
  });
  global.fetch = fetcher;
  let load!: (value: () => BridgeProviderInstance) => void;
  const loadProvider = jest.fn(
    () =>
      new Promise<() => BridgeProviderInstance>((resolve) => {
        load = resolve;
      }),
  );
  const service = {
    moduleName: 'weather/App',
    url: '/render',
    buildVersion: 'build-1',
  };
  const component = (label: string) => (
    <React.StrictMode>
      <RemoteAppWrapper
        moduleName="weather/App"
        ssrInstanceId="service-mount"
        service={service}
        loadProvider={loadProvider}
        remoteProps={{ label }}
        loading={<span>Loading service</span>}
      />
    </React.StrictMode>
  );
  try {
    const view = render(component('initial'));
    await waitFor(() =>
      expect(
        view.container.querySelector('[data-mf-bridge] button'),
      ).not.toBeNull(),
    );
    const button = view.container.querySelector('button')!;
    expect(view.container.querySelector('[data-mf-bridge]')!.textContent).toBe(
      'initial: 0',
    );
    expect(view.container.textContent).toContain('Loading service');
    expect(provider.render).not.toHaveBeenCalled();
    await act(async () => {
      load(() => provider);
    });
    await waitFor(() => expect(provider.hydrate).toHaveBeenCalledTimes(1));
    fireEvent.click(button);
    await waitFor(() => expect(button.textContent).toBe('initial: 1'));
    expect(
      window.__MF_BRIDGE_SSR__!.get(
        view.container.querySelector('[data-mf-bridge]')!.id,
      ),
    ).toBeDefined();
    view.rerender(component('updated'));
    await waitFor(() => expect(button.textContent).toBe('updated: 1'));
    expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(view.container.querySelector('button')).toBe(button);
    expect(provider.hydrate).toHaveBeenCalledTimes(1);
    view.unmount();
    await waitFor(() => expect(provider.destroy).toHaveBeenCalledTimes(1));
  } finally {
    finish();
    global.fetch = originalFetch;
    delete window.__MF_BRIDGE_SSR__;
  }
});

it.each([true, false])(
  'releases completed=%s Service sessions across real StrictMode unmounts and fresh mounts',
  async (complete) => {
    delete window.__MF_BRIDGE_SSR__;
    const originalFetch = global.fetch;
    const snapshots: unknown[] = [];
    const responses: Array<{ cancel: jest.Mock }> = [];
    const encoder = new TextEncoder();
    global.fetch = jest.fn(async (_url, init) => {
      const input = JSON.parse(init!.body as string);
      const snapshot = { data: `mount-${snapshots.length}` };
      snapshots.push(snapshot);
      const cancel = jest.fn();
      responses.push({ cancel });
      return {
        status: 200,
        headers: { get: () => 'application/x-ndjson' },
        body: new ReadableStream<Uint8Array>({
          start(controller) {
            const send = (frame: unknown) =>
              controller.enqueue(encoder.encode(JSON.stringify(frame) + '\n'));
            send({
              type: 'meta',
              protocol: BRIDGE_PRODUCER_PROTOCOL,
              buildVersion: 'build-1',
              identifierPrefix: input.request.identifierPrefix,
              hydration: 'progressive',
            });
            send({
              type: 'html',
              html: renderToString(
                <Counter label={input.request.props.label} />,
              ),
            });
            send({ type: 'ready', snapshot });
            if (complete) {
              send({ type: 'done' });
              controller.close();
            }
          },
          cancel,
        }),
      } as unknown as Response;
    });
    const released: string[] = [];
    try {
      for (let mount = 0; mount < 3; mount++) {
        let root: Root;
        const provider: BridgeProviderInstance = {
          hydrate: jest.fn((info) => {
            expect(info.snapshot).toEqual(snapshots[mount]);
            root = hydrateRoot(
              info.dom,
              <Counter label={info.label as string} />,
            );
          }),
          render: jest.fn((info) =>
            root.render(<Counter label={info.label as string} />),
          ),
          destroy: jest.fn(() => root.unmount()),
        };
        const view = render(
          <React.StrictMode>
            <RemoteAppWrapper
              moduleName="weather/App"
              ssrInstanceId="repeat-service"
              service={{
                moduleName: 'weather/App',
                url: '/render',
                buildVersion: 'build-1',
              }}
              loadProvider={async () => () => provider}
              remoteProps={{ label: `mount-${mount}` }}
            />
          </React.StrictMode>,
        );
        await waitFor(() => expect(provider.hydrate).toHaveBeenCalledTimes(1));
        const container =
          view.container.querySelector<HTMLElement>('[data-mf-bridge]')!;
        const id = container.id;
        const runtime = window.__MF_BRIDGE_SSR__!;
        const session = runtime.get(id) as any;
        expect(session.container).toBe(container);
        expect(session.snapshot).toEqual(snapshots[mount]);
        if (complete) await session.done;
        else expect(session.complete).toBe(false);
        for (const old of released) {
          runtime.expect(old);
          runtime.accept(old, { type: 'html', html: '<p>late old HTML</p>' });
          runtime.accept(old, { type: 'error', message: 'late old failure' });
          expect(runtime.get(old)).toBeUndefined();
        }
        const button = container.querySelector('button')!;
        fireEvent.click(button);
        await waitFor(() =>
          expect(button.textContent).toBe(`mount-${mount}: 1`),
        );
        expect(container.textContent).not.toContain('late old HTML');
        expect(new Set([...released, id]).size).toBe(mount + 1);
        view.unmount();
        await waitFor(() => expect(provider.destroy).toHaveBeenCalledTimes(1));
        expect(runtime.get(id)).toBeUndefined();
        expect(runtime.claim(id, container)).toBeUndefined();
        expect(session.container).toBeUndefined();
        expect(session.snapshot).toBeUndefined();
        expect(container.isConnected).toBe(false);
        if (!complete)
          await waitFor(() =>
            expect(responses[mount].cancel).toHaveBeenCalledTimes(1),
          );
        released.push(id);
      }
      expect(global.fetch).toHaveBeenCalledTimes(3);
    } finally {
      global.fetch = originalFetch;
      delete window.__MF_BRIDGE_SSR__;
    }
  },
);
