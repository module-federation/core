import React, { Suspense } from 'react';
import { act, fireEvent } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { PassThrough, Readable } from 'node:stream';
import { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { setImmediate as nodeSetImmediate } from 'node:timers';
import { normalizeBridgeSSR } from '../src/ssr-stream/producer.server';
import { bridgeStreamBootstrap } from '../src/ssr-stream/bootstrap';
import type { BridgeStreamBrowserRuntime } from '../src/ssr-stream/protocol';

const { renderToPipeableStream } = jest.requireActual<
  typeof import('react-dom/server')
>('react-dom/server.node');
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

it('preserves application scripts through progressive hydration and executes them once alongside React completion scripts', async () => {
  global.ReadableStream = NodeReadableStream as typeof ReadableStream;
  global.setImmediate = nodeSetImmediate;
  const globals = window as typeof window & {
    initialScriptRuns?: number;
    lateScriptRuns?: number;
  };
  const container = document.createElement('div');
  container.id = 'script-app';
  document.body.appendChild(container);
  bridgeStreamBootstrap({ instanceIds: ['script-app'], timeoutMs: 1000 });
  const runtime = window.__MF_BRIDGE_SSR__ as BridgeStreamBrowserRuntime;
  runtime.accept('script-app', {
    type: 'meta',
    protocol: 'mf-bridge/1',
    identifierPrefix: 'script-',
    hydration: 'progressive',
  });

  let release!: () => void;
  let resolved = false;
  const pending = new Promise<void>((resolve) => {
    release = () => {
      resolved = true;
      resolve();
    };
  });
  function Detail() {
    const [count, setCount] = React.useState(0);
    if (!resolved) throw pending;
    return (
      <>
        <script
          id="late-script"
          dangerouslySetInnerHTML={{
            __html: 'window.lateScriptRuns=(window.lateScriptRuns||0)+1',
          }}
        />
        <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      </>
    );
  }
  const App = () => (
    <>
      <script
        id="initial-script"
        dangerouslySetInnerHTML={{
          __html: 'window.initialScriptRuns=(window.initialScriptRuns||0)+1',
        }}
      />
      <main>
        <Suspense fallback={<p>Waiting for detail</p>}>
          <Detail />
        </Suspense>
        <template id="script-shell" />
      </main>
    </>
  );
  const raw = new PassThrough();
  const errors: unknown[] = [];
  const server = renderToPipeableStream(<App />, {
    identifierPrefix: 'script-',
    onShellReady() {
      server.pipe(raw);
    },
    onError(error) {
      errors.push(error);
    },
  });
  const result = await normalizeBridgeSSR(
    {
      stream: Readable.toWeb(raw) as ReadableStream<Uint8Array>,
      snapshot: pending.then(() => ({ complete: true })),
      hydration: {
        snapshot: Promise.resolve({ pending: ['detail'] }),
        updates: new NodeReadableStream({
          start(controller) {
            controller.close();
          },
        }) as ReadableStream<unknown>,
        shellMarker: 'script-shell',
      },
      abort: server.abort,
    },
    {
      instanceId: 'script-app',
      identifierPrefix: 'script-',
      url: 'https://host.example/inventory',
      props: {},
      signal: new AbortController().signal,
    },
  );
  const consume = (async () => {
    const reader = result.messages.getReader();
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) return;
        runtime.accept('script-app', next.value);
      }
    } finally {
      reader.releaseLock();
    }
  })();
  let root: Root | undefined;
  try {
    await runtime.get('script-app')!.ready;
    const main = container.querySelector('main');
    const initialScript = container.querySelector('#initial-script');
    expect(globals.initialScriptRuns).toBe(1);
    const onRecoverableError = jest.fn();
    await act(async () => {
      root = hydrateRoot(container, <App />, {
        identifierPrefix: 'script-',
        onRecoverableError,
      });
      await tick();
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(initialScript).not.toBeNull();
    expect(container.querySelector('#initial-script')).toBe(initialScript);
    expect(container.querySelector('main')).toBe(main);
    expect(container.textContent).toContain('Waiting for detail');
    expect(globals.initialScriptRuns).toBe(1);

    await act(async () => {
      release();
      await consume;
      await runtime.get('script-app')!.done;
      await tick();
    });
    expect(errors).toEqual([]);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector('main')).toBe(main);
    expect(container.querySelectorAll('script')).toHaveLength(2);
    expect(container.querySelector('#late-script')).not.toBeNull();
    expect(container.querySelector('[data-mf-react-transport]')).toBeNull();
    expect(globals.initialScriptRuns).toBe(1);
    expect(globals.lateScriptRuns).toBe(1);
    const button = container.querySelector('button')!;
    fireEvent.click(button);
    expect(button.textContent).toBe('Count: 1');
    expect(globals.initialScriptRuns).toBe(1);
    expect(globals.lateScriptRuns).toBe(1);
  } finally {
    release();
    result.abort();
    await consume.catch(() => {});
    await act(async () => {
      root?.unmount();
      await tick();
    });
    window.dispatchEvent(new Event('pagehide'));
    delete window.__MF_BRIDGE_SSR__;
    delete globals.initialScriptRuns;
    delete globals.lateScriptRuns;
    container.remove();
  }
});
