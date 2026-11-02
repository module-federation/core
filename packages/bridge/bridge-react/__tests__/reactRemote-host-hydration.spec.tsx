/** @jest-environment node */
import React from 'react';
import { PassThrough } from 'node:stream';
import { JSDOM } from 'jsdom';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToPipeableStream, renderToString } from 'react-dom/server.node';
import { createReactRemote } from '../src/reactRemote';
import { createBridgeComponent } from '../src/v18';
import { BridgeSSRContext } from '../src/ssr';
import { createBridgeSSRController } from '../src/ssr-stream/compositor.server';
import { remoteRuntime } from './reactRemote-utils';

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

it('keeps the streamed Bridge subtree while a parent updates before the browser provider loads', async () => {
  let updateCommitted!: () => void;
  const updated = new Promise<void>((resolve) => (updateCommitted = resolve));
  const Counter = ({ title }: { title: string }) => {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
      if (title === 'updated') updateCommitted();
    }, [title]);
    return (
      <>
        <script
          dangerouslySetInnerHTML={{ __html: 'window.appScript = true' }}
        />
        <button onClick={() => setCount((value) => value + 1)}>
          {title}: {count}
        </button>
      </>
    );
  };
  const provider = createBridgeComponent({
    rootComponent: Counter,
    renderStream: async (element) => ({
      stream: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(renderToString(element)));
          controller.close();
        },
      }),
      snapshot: Promise.resolve({}),
      abort() {},
    }),
  });
  const serverRuntime = remoteRuntime({ default: provider }, 'bridge');
  const ServerRemote = createReactRemote({
    instance: serverRuntime.instance,
    remote: 'shop/Card',
  });
  let hostUpdated!: () => void;
  const parentUpdated = new Promise<void>((resolve) => (hostUpdated = resolve));
  function Host({ Remote }: { Remote: typeof ServerRemote }) {
    const [title, setTitle] = React.useState('initial');
    React.useEffect(() => setTitle('updated'), []);
    React.useEffect(() => {
      if (title === 'updated') hostUpdated();
    }, [title]);
    return <Remote title={title} />;
  }
  const serverErrors = jest.fn();
  const controller = createBridgeSSRController({
    request: new Request('https://host.test/inventory'),
    identifierPrefix: 'host-',
    shellEndMarker: '<span id="shell-end"></span>',
    onError: serverErrors,
  });
  const input = new PassThrough();
  const response = new Promise<string>((resolve, reject) => {
    let html = '';
    const output = controller.processStream(input);
    output.on('data', (chunk) => (html += chunk.toString()));
    output.on('end', () => resolve(html));
    output.on('error', reject);
  });
  const render = renderToPipeableStream(
    <BridgeSSRContext.Provider value={controller.context}>
      <Host Remote={ServerRemote} />
      <span id="shell-end" />
    </BridgeSSRContext.Provider>,
    {
      identifierPrefix: 'host-',
      onShellReady: () => render.pipe(input),
    },
  );
  const html = await response;
  expect(serverErrors).not.toHaveBeenCalled();
  expect(html).not.toContain('"type":"error"');
  const dom = new JSDOM(
    `<!doctype html><head>${controller.getBootstrap()}</head><body><div id="host">${html}</div></body>`,
    {
      runScripts: 'dangerously',
      url: 'https://host.test/inventory',
      beforeParse(window) {
        window.ReadableStream = ReadableStream;
        window.TextEncoder = TextEncoder;
      },
    },
  );
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: false,
  });
  let root: Root | undefined;
  try {
    const container = document.getElementById('host')!;
    const originalMount = container.querySelector('[data-mf-bridge]');
    const originalButton = container.querySelector('button')!;
    const originalScript = originalMount!.querySelector('script');
    expect(originalButton.textContent).toBe('initial: 0');
    const errors = jest.fn();
    dom.window.__MF_BRIDGE_SSR__!.fallback = errors;
    const clientRuntime = remoteRuntime({ default: provider }, 'bridge');
    let release!: () => void;
    const pending = new Promise<void>((resolve) => (release = resolve));
    const resolveProtocol =
      clientRuntime.getRemoteModuleAndOptions.getMockImplementation()!;
    clientRuntime.getRemoteModuleAndOptions.mockImplementation(
      async (...args) => {
        await pending;
        return resolveProtocol(...args);
      },
    );
    const ClientRemote = createReactRemote({
      instance: clientRuntime.instance,
      remote: 'shop/Card',
    });
    root = hydrateRoot(
      container,
      <>
        <Host Remote={ClientRemote} />
        <span id="shell-end" />
      </>,
      { identifierPrefix: 'host-', onRecoverableError: errors },
    );
    // Keep classification pending past React's Suspense fallback delay. The
    // Host effect must commit while only the remote provider is still loading.
    await parentUpdated;
    await new Promise((resolve) => setTimeout(resolve, 600));
    release();
    await updated;
    expect(errors).not.toHaveBeenCalled();
    expect(container.querySelector('[data-mf-bridge]')).toBe(originalMount);
    expect(originalMount!.querySelector('script')).toBe(originalScript);
    expect(container.querySelector('button')).toBe(originalButton);
    expect(originalButton.textContent).toBe('updated: 0');
    originalButton.click();
    await tick();
    expect(originalButton.textContent).toBe('updated: 1');
  } finally {
    root?.unmount();
    await tick();
    dom.window.dispatchEvent(new dom.window.Event('pagehide'));
    dom.window.close();
    delete (globalThis as any).window;
    delete (globalThis as any).document;
    delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  }
});
