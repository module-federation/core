import { describe, expect, it } from '@rstest/core';
import { PassThrough, Readable } from 'node:stream';
import { createRequire } from 'node:module';
import React, { Suspense, useEffect, useId, useState } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { JSDOM, VirtualConsole } from 'jsdom';
import {
  createBridgeComponent,
  type ProviderFnParams,
} from '@module-federation/bridge-react/server';
import BridgeReactPlugin, {
  federationRuntime,
} from '@module-federation/bridge-react/plugin';
import { createInstance } from '@module-federation/runtime';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
  BridgeSSRMessageResult,
} from '@module-federation/bridge-react/ssr';
import { bridgeStreamBootstrap } from './bootstrap';
import type { BridgeStreamBrowserRuntime } from './protocol';
import { bridgeIdentifierPrefix } from './identity.server';
import { createBridgeServiceHandler, fetchBridgeService } from './service-http';

// Real deployments load separate Node and browser bundles. Keep their Bridge
// contexts separate here too, while both use the same installed React version.
const { createBridgeComponent: createBrowserBridgeComponent } = createRequire(
  import.meta.url,
)(
  '@module-federation/bridge-react/v18',
) as typeof import('@module-federation/bridge-react/v18');

const revision = 'real-react-cache-build';
const nonce = 'document-nonce';
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
function resource(initial?: string) {
  let value = initial;
  const pending = deferred<string>();
  return {
    read() {
      if (value === undefined) throw pending.promise;
      return value;
    },
    resolve(next: string) {
      value = next;
      pending.resolve(next);
    },
  };
}
type Resource = ReturnType<typeof resource>;
function Counter({
  label,
  hydrated,
}: {
  label: string;
  hydrated?: () => void;
}) {
  const id = useId();
  const [count, setCount] = useState(0);
  useEffect(() => {
    hydrated?.();
  }, []);
  return (
    <button
      id={id}
      data-counter={label}
      onClick={() => setCount((old) => old + 1)}
    >
      {label}: {count}
    </button>
  );
}
function Detail({ data, hydrated }: { data: Resource; hydrated?: () => void }) {
  return <Counter label={data.read()} hydrated={hydrated} />;
}
function Application({
  label,
  data,
  shellMarker,
  shellHydrated,
  detailHydrated,
}: {
  label: string;
  data: Resource;
  shellMarker: string;
  shellHydrated?: () => void;
  detailHydrated?: () => void;
}) {
  return (
    <section>
      <Counter label={label} hydrated={shellHydrated} />
      <Suspense fallback={<p data-pending={label}>Loading</p>}>
        <Detail data={data} hydrated={detailHydrated} />
      </Suspense>
      <template id={shellMarker} />
    </section>
  );
}
function applicationProvider(
  data: Resource,
  shellMarker: string,
  options: Pick<
    ProviderFnParams<{ label: string }>,
    'renderStream' | 'hydrate'
  > & {
    shellHydrated?: () => void;
    detailHydrated?: () => void;
  },
) {
  const createProvider = options.hydrate
    ? createBrowserBridgeComponent
    : createBridgeComponent;
  return createProvider<{ label: string }>({
    rootComponent: ({ label }) => (
      <Application
        label={label}
        data={data}
        shellMarker={shellMarker}
        shellHydrated={options.shellHydrated}
        detailHydrated={options.detailHydrated}
      />
    ),
    renderStream: options.renderStream,
    hydrate: options.hydrate,
  })();
}
function request(instanceId: string): BridgeSSRRequest {
  return {
    instanceId,
    identifierPrefix: bridgeIdentifierPrefix(instanceId),
    url: 'https://host.example/catalog',
    nonce,
    props: { label: instanceId },
    signal: new AbortController().signal,
  };
}
function fixture() {
  const jobs: {
    shell: Promise<void>;
    finish(): void;
    abort(): void;
  }[] = [];
  const serverErrors: unknown[] = [];
  const cacheStatus: (string | null)[] = [];
  const wire: Promise<string>[] = [];
  const calls = {
    before: [] as BridgeSSRRequest[],
    after: [] as BridgeSSRRequest[],
    renderer: [] as BridgeSSRRequest[],
  };
  const previousRuntime = federationRuntime.instance;
  createInstance({
    name: 'bridge-cache-callback-test',
    remotes: [],
    plugins: [
      BridgeReactPlugin(),
      {
        name: 'record-render-lifecycle',
        beforeBridgeRender(info) {
          if (!('dom' in info)) calls.before.push(info as BridgeSSRRequest);
        },
        afterBridgeRender(info) {
          if (!('dom' in info)) calls.after.push(info as BridgeSSRRequest);
        },
      },
    ],
  });
  const handler = createBridgeServiceHandler({
    revision,
    cache: { maxAgeMs: 60_000 },
    async render(info) {
      const label = String(info.props.label);
      const data = resource();
      const shellMarker = `${info.instanceId}-shell`;
      const shell = deferred<void>();
      const snapshot = deferred<unknown>();
      const output = new PassThrough();
      let updates!: ReadableStreamDefaultController<unknown>;
      const updateStream = new ReadableStream<unknown>({
        start(controller) {
          updates = controller;
        },
      });
      const provider = applicationProvider(data, shellMarker, {
        async renderStream(app, request) {
          calls.renderer.push(request);
          const rendering = renderToPipeableStream(app, {
            identifierPrefix: request.identifierPrefix,
            nonce: request.nonce,
            onShellReady() {
              rendering.pipe(output);
              shell.resolve();
            },
            onError(error) {
              serverErrors.push(error);
            },
          });
          jobs.push({
            shell: shell.promise,
            finish() {
              const value = `${label}-detail`;
              data.resolve(value);
              updates.enqueue({ id: 'detail', status: 'fulfilled', value });
              updates.close();
              snapshot.resolve({ label, detail: value });
            },
            abort: rendering.abort,
          });
          // This fixture owns its data protocol. React renders the actual tree
          // supplied by Bridge, including its provider wrappers and business props.
          return {
            revision,
            stream: Readable.toWeb(output) as ReadableStream<Uint8Array>,
            snapshot: snapshot.promise,
            hydration: {
              snapshot: Promise.resolve({ label, pending: ['detail'] }),
              shellMarker,
              updates: updateStream,
            },
            abort: rendering.abort,
          } satisfies BridgeSSRResult;
        },
      });
      return provider.renderStream!(info);
    },
  });
  const transport = (async (url, init) => {
    const response = await handler(new Request(url, init));
    cacheStatus.push(response.headers.get('x-mf-bridge-cache'));
    wire.push(response.clone().text());
    return response;
  }) as typeof fetch;
  return {
    jobs,
    serverErrors,
    cacheStatus,
    wire,
    calls,
    fetch(info: BridgeSSRRequest, hydrationMode: 'complete' | 'progressive') {
      return fetchBridgeService(info, {
        url: 'https://bridge.example/render',
        revision,
        hydrationMode,
        fetch: transport,
      });
    },
    dispose() {
      jobs.forEach((job) => job.abort());
      federationRuntime.instance = previousRuntime;
    },
  };
}
async function collect<T>(stream: ReadableStream<T>): Promise<T[]> {
  const values: T[] = [];
  const reader = stream.getReader();
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) return values;
      values.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
}
async function capture(result: BridgeSSRMessageResult) {
  const messages = await collect(result.messages);
  const initial = messages.find((message) => message.type === 'ready');
  const final = messages.find((message) => message.type === 'data');
  return {
    messages,
    html: Buffer.from(
      messages
        .filter((message) => message.type === 'html')
        .map((message) => message.html)
        .join(''),
    ),
    updates: messages
      .filter((message) => message.type === 'update')
      .map((message) => message.value),
    snapshot: initial?.snapshot ?? final?.snapshot,
  };
}
async function until(condition: () => boolean) {
  const deadline = Date.now() + 4000;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error('React hydration timed out');
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}
function browser(instanceIds: string[]) {
  const errors: unknown[] = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error));
  const dom = new JSDOM(
    `<!doctype html>${instanceIds.map((id) => `<div id="${id}"></div>`).join('')}`,
    {
      url: 'https://host.example/catalog?csr=1',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole,
    },
  );
  (dom.window as any).TextEncoder = TextEncoder;
  (dom.window as any).ReadableStream = ReadableStream;
  dom.window.eval(
    `(${bridgeStreamBootstrap.toString()})(${JSON.stringify({ instanceIds, nonce, timeoutMs: 5000 })})`,
  );
  const runtime = (dom.window as any)
    .__MF_BRIDGE_SSR__ as BridgeStreamBrowserRuntime;
  const previous = new Map(
    ['window', 'document', 'navigator'].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
  }))
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  const roots: Root[] = [];
  return {
    dom,
    runtime,
    roots,
    errors,
    container: (id: string) => dom.window.document.getElementById(id)!,
    html(info: BridgeSSRRequest, html: string) {
      runtime.accept(info.instanceId, {
        type: 'html',
        html,
      });
    },
    dispose() {
      roots.forEach((root) => root.unmount());
      dom.window.dispatchEvent(new dom.window.Event('pagehide'));
      dom.window.close();
      for (const [key, descriptor] of previous) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete (globalThis as any)[key];
      }
    },
  };
}

describe('Bridge service cache with real React streaming and hydration', () => {
  it('replays identical React bytes and hydrates two cached slots without replacing DOM or sharing state', async () => {
    const service = fixture();
    const page = browser(['left', 'right']);
    try {
      const infos = [request('left'), request('right')];
      const cold = await Promise.all(
        infos.map(async (info) => {
          const result = await service.fetch(info, 'complete');
          const captured = capture(result);
          const job = service.jobs[infos.indexOf(info)];
          await job.shell;
          job.finish();
          return captured;
        }),
      );
      const cached = await Promise.all(
        infos.map(async (info) =>
          capture(await service.fetch(info, 'complete')),
        ),
      );
      expect(service.jobs).toHaveLength(2);
      expect(service.cacheStatus).toEqual(['miss', 'miss', 'hit', 'hit']);
      for (const calls of Object.values(service.calls)) {
        expect(calls).toHaveLength(2);
        expect(calls.map((info) => info.instanceId)).toEqual(['left', 'right']);
        expect(calls.map((info) => info.props)).toEqual(
          infos.map((info) => info.props),
        );
      }
      expect(service.calls.before).toEqual(service.calls.renderer);
      expect(service.calls.after).toEqual(service.calls.renderer);
      const wire = await Promise.all(service.wire);
      expect(wire[2]).toBe(wire[0]);
      expect(wire[3]).toBe(wire[1]);
      const allButtons: HTMLButtonElement[][] = [];
      const hydrated = [false, false];
      for (const [index, info] of infos.entries()) {
        expect(cached[index].html.equals(cold[index].html)).toBe(true);
        expect(cached[index].snapshot).toEqual(cold[index].snapshot);
        page.runtime.accept(info.instanceId, {
          type: 'meta',
          protocol: 'mf-bridge/1',
          identifierPrefix: info.identifierPrefix,
        });
        for (const message of cached[index].messages)
          page.runtime.accept(info.instanceId, message);
        const session = await page.runtime.get(info.instanceId)!.done;
        const container = page.container(info.instanceId);
        allButtons.push(Array.from(container.querySelectorAll('button')));
        expect(allButtons[index]).toHaveLength(2);
        const snapshot = session.snapshot as { label: string; detail: string };
        const provider = applicationProvider(
          resource(snapshot.detail),
          `${info.instanceId}-shell`,
          {
            detailHydrated: () => (hydrated[index] = true),
            hydrate(app, dom, hydration) {
              const root = hydrateRoot(dom, app, hydration.rootOptions);
              page.roots.push(root);
              return root;
            },
          },
        );
        await provider.hydrate({
          dom: container,
          label: snapshot.label,
          snapshot,
          rootOptions: {
            identifierPrefix: session.identifierPrefix,
            onRecoverableError: (error) => page.errors.push(error),
          },
        });
      }
      await until(() => hydrated.every(Boolean));
      for (const [index, info] of infos.entries()) {
        const buttons = page
          .container(info.instanceId)
          .querySelectorAll('button');
        allButtons[index].forEach((button, position) =>
          expect(buttons[position]).toBe(button),
        );
      }
      const ids = allButtons.flat().map((button) => button.id);
      expect(new Set(ids).size).toBe(4);
      expect(ids[0]).toContain(infos[0].identifierPrefix);
      expect(ids[2]).toContain(infos[1].identifierPrefix);
      allButtons[0][0].dispatchEvent(
        new page.dom.window.MouseEvent('click', { bubbles: true }),
      );
      await until(() => allButtons[0][0].textContent === 'left: 1');
      expect(allButtons[1][0].textContent).toBe('right: 0');
      expect(allButtons[0][1].textContent).toBe('left-detail: 0');
      expect(page.errors).toEqual([]);
      expect(service.serverErrors).toEqual([]);
    } finally {
      page.dispose();
      service.dispose();
    }
  });

  it('retains the progressive snapshot and updates while a cached React shell hydrates before its deferred boundary', async () => {
    const service = fixture();
    const page = browser(['progressive']);
    try {
      const info = request('progressive');
      const result = await service.fetch(info, 'progressive');
      const coldPromise = capture(result);
      await service.jobs[0].shell;
      service.jobs[0].finish();
      const cold = await coldPromise;
      const cached = await capture(await service.fetch(info, 'progressive'));
      expect(service.jobs).toHaveLength(1);
      expect(service.cacheStatus).toEqual(['miss', 'hit']);
      for (const calls of Object.values(service.calls)) {
        expect(calls).toHaveLength(1);
        expect(calls[0].props).toEqual(info.props);
        expect(calls[0].identifierPrefix).toBe(info.identifierPrefix);
      }
      expect(service.calls.before[0]).toBe(service.calls.renderer[0]);
      expect(service.calls.after[0]).toBe(service.calls.renderer[0]);
      expect(await service.wire[1]).toBe(await service.wire[0]);
      expect(cached.html.equals(cold.html)).toBe(true);
      expect(cached.snapshot).toEqual({
        label: 'progressive',
        pending: ['detail'],
      });
      expect(cached.updates).toEqual([
        { id: 'detail', status: 'fulfilled', value: 'progressive-detail' },
      ]);
      const readyIndex = cached.messages.findIndex(
        (message) => message.type === 'ready',
      );
      expect(readyIndex).toBeGreaterThan(0);
      expect(
        cached.messages
          .slice(0, readyIndex)
          .every((message) => message.type === 'html'),
      ).toBe(true);
      page.runtime.accept(info.instanceId, {
        type: 'meta',
        protocol: 'mf-bridge/1',
        identifierPrefix: info.identifierPrefix,
        hydration: 'progressive',
      });
      for (const message of cached.messages.slice(0, readyIndex + 1))
        page.runtime.accept(info.instanceId, message);
      const session = await page.runtime.get(info.instanceId)!.ready!;
      const container = page.container(info.instanceId);
      const shellButton = container.querySelector('button')!;
      const clientData = resource();
      let shellHydrated = false;
      let detailHydrated = false;
      const provider = applicationProvider(
        clientData,
        `${info.instanceId}-shell`,
        {
          shellHydrated: () => (shellHydrated = true),
          detailHydrated: () => (detailHydrated = true),
          hydrate(app, dom, hydration) {
            const root = hydrateRoot(dom, app, hydration.rootOptions);
            page.roots.push(root);
            return root;
          },
        },
      );
      await provider.hydrate({
        dom: container,
        label: (session.snapshot as { label: string }).label,
        snapshot: session.snapshot,
        updates: session.updates,
        rootOptions: {
          identifierPrefix: session.identifierPrefix,
          onRecoverableError: (error) => page.errors.push(error),
        },
      });
      await until(() => shellHydrated);
      expect(container.querySelector('button')).toBe(shellButton);
      expect(container.querySelector('[data-pending]')).not.toBeNull();
      shellButton.dispatchEvent(
        new page.dom.window.MouseEvent('click', { bubbles: true }),
      );
      await until(() => shellButton.textContent === 'progressive: 1');
      for (const message of cached.messages.slice(readyIndex + 1))
        page.runtime.accept(info.instanceId, message);
      const detailButton = container.querySelector(
        '[data-counter="progressive-detail"]',
      );
      expect(detailButton).not.toBeNull();
      const updateReader = session.updates!.getReader();
      const update = (await updateReader.read()).value as { value: string };
      clientData.resolve(update.value);
      expect((await updateReader.read()).done).toBe(true);
      updateReader.releaseLock();
      await page.runtime.get(info.instanceId)!.done;
      await until(() => detailHydrated);
      expect(
        container.querySelector('[data-counter="progressive-detail"]'),
      ).toBe(detailButton);
      expect(container.querySelector('button')).toBe(shellButton);
      expect(shellButton.textContent).toBe('progressive: 1');
      detailButton!.dispatchEvent(
        new page.dom.window.MouseEvent('click', { bubbles: true }),
      );
      await until(() => detailButton!.textContent === 'progressive-detail: 1');
      expect(container.querySelector('[data-pending]')).toBeNull();
      expect(page.errors).toEqual([]);
      expect(service.serverErrors).toEqual([]);
    } finally {
      page.dispose();
      service.dispose();
    }
  });
});
