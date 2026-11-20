/** @jest-environment node */
import React from 'react';
import { PassThrough } from 'node:stream';
import { JSDOM } from 'jsdom';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToPipeableStream, renderToString } from 'react-dom/server.node';
import { createReactRemote } from '../src/reactRemote';
import { createReactRemote as createServerReactRemote } from '../src/reactRemote.node';
import { createBridgeComponent as createServerBridgeComponent } from '../src/server';
import { createBridgeComponent } from '../src/v18';
import { BridgeSSRContext } from '../src/ssr';
import { createBridgeSSRController } from '../src/ssr-stream/compositor.server';
import { remoteRuntime } from './reactRemote-utils';
import { loadServiceClient } from '../src/service/client';
import { registerBridgeServiceIngress } from '../src/service/config';
jest.mock('../src/service/client', () => ({ loadServiceClient: jest.fn() }));

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

it.each([false, true])(
  'keeps the streamed Bridge subtree while a parent updates before the browser provider loads (Service=%s)',
  async (isService) => {
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
    const provider = createBridgeComponent({ rootComponent: Counter });
    const serverProvider = createServerBridgeComponent({
      rootComponent: Counter,
      renderStream: async (element) => ({
        stream: new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(renderToString(element)),
            );
            controller.close();
          },
        }),
        snapshot: Promise.resolve({}),
        abort() {},
      }),
    });
    const client = {
      name: 'shop',
      expose: './Card',
      snapshot: {
        buildVersion: 'response-v2',
        remoteEntry: 'entry.js',
        version: 'https://service.test/mf-manifest.json',
        modules: [],
      },
    } as import('../src/service/protocol').BridgeServiceClient;
    const selectedServerProvider = () => {
      const provider = serverProvider();
      const renderStream = provider.renderStream!.bind(provider);
      return {
        ...provider,
        renderStream: async (info: any) => ({
          ...(await renderStream(info)),
          ...(isService && { client }),
        }),
      };
    };
    const serverRuntime = remoteRuntime(
      { default: selectedServerProvider },
      'bridge',
    );
    const ServerRemote = createServerReactRemote({
      instance: serverRuntime.instance,
      remote: serverRuntime.remote,
    });
    let hostUpdated!: () => void;
    const parentUpdated = new Promise<void>(
      (resolve) => (hostUpdated = resolve),
    );
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
      location: dom.window.location,
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
      const stale = jest.fn(() => {
        throw Error('Stale Host client must not hydrate Service HTML');
      });
      const clientRuntime = remoteRuntime(
        { default: isService ? stale : provider },
        'bridge',
        isService,
      );
      if (isService)
        registerBridgeServiceIngress(
          clientRuntime.instance,
          '/_modern/mf/service/',
        );
      jest
        .mocked(loadServiceClient)
        .mockResolvedValue({ factory: provider, release: jest.fn() });
      let release!: () => void;
      const pending = new Promise<void>((resolve) => (release = resolve));
      const ClientRemote = createReactRemote({
        instance: clientRuntime.instance,
        remote: async () => {
          await pending;
          return clientRuntime.remote();
        },
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
      if (isService) {
        expect(loadServiceClient).toHaveBeenLastCalledWith(
          client,
          clientRuntime.instance,
        );
        expect(stale).not.toHaveBeenCalled();
      }
      expect(errors).not.toHaveBeenCalled();
      expect(container.querySelector('[data-mf-bridge]')).toBe(originalMount);
      expect(originalMount!.querySelector('script')).toBe(originalScript);
      expect(container.querySelector('button')).toBe(originalButton);
      expect(originalButton.textContent).toBe('updated: 0');
      originalButton.click();
      for (
        let i = 0;
        i < 20 && originalButton.textContent !== 'updated: 1';
        i++
      )
        await tick();
      expect(originalButton.textContent).toBe('updated: 1');
    } finally {
      root?.unmount();
      await tick();
      dom.window.dispatchEvent(new dom.window.Event('pagehide'));
      dom.window.close();
      delete (globalThis as any).window;
      delete (globalThis as any).document;
      delete (globalThis as any).location;
      delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
    }
  },
);

it('hydrates ordinary remote DOM and state instead of replacing it with client loading', async () => {
  let hydratedCommitted!: () => void;
  const hydrated = new Promise<void>(
    (resolve) => (hydratedCommitted = resolve),
  );
  function Counter() {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
      hydratedCommitted();
    }, []);
    return <button onClick={() => setCount(count + 1)}>count: {count}</button>;
  }
  const server = remoteRuntime({ default: Counter }, 'component');
  const Server = createServerReactRemote({
    instance: server.instance,
    remote: server.remote,
  });
  const input = new PassThrough();
  let html = '';
  input.on('data', (chunk) => (html += chunk.toString()));
  const ended = new Promise<void>((resolve) => input.on('end', resolve));
  const stream = renderToPipeableStream(<Server />, {
    onAllReady: () => stream.pipe(input),
  });
  await ended;
  const dom = new JSDOM(`<div id="host">${html}</div>`, {
    url: 'https://host.test/',
  });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
  });
  let root: Root | undefined;
  try {
    const container = document.getElementById('host')!;
    const button = container.querySelector('button')!;
    const client = remoteRuntime({ default: Counter }, 'component');
    let release!: () => void;
    const pending = new Promise<void>((resolve) => (release = resolve));
    const Client = createReactRemote({
      instance: client.instance,
      remote: async () => {
        await pending;
        return client.remote();
      },
      loading: <p>loading</p>,
    });
    const errors = jest.fn();
    root = hydrateRoot(container, <Client />, { onRecoverableError: errors });
    await tick();
    expect(container.querySelector('button')).toBe(button);
    release();
    await hydrated;
    await tick();
    button.click();
    for (let i = 0; i < 20 && button.textContent !== 'count: 1'; i++)
      await tick();
    expect(errors).not.toHaveBeenCalled();
    expect(container.querySelector('button')).toBe(button);
    expect(button.textContent).toBe('count: 1');
  } finally {
    root?.unmount();
    await tick();
    dom.window.close();
    delete (globalThis as any).window;
    delete (globalThis as any).document;
    delete (globalThis as any).location;
  }
});
