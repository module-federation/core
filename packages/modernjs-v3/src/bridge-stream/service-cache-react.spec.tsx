import { describe, expect, it } from '@rstest/core';
import { PassThrough, Readable } from 'node:stream';
import React, { Suspense, useEffect, useId, useState } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { JSDOM, VirtualConsole } from 'jsdom';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
} from '@module-federation/bridge-react/ssr';
import { bridgeStreamBootstrap } from './bootstrap';
import { htmlFrames } from './frames.server';
import type { BridgeStreamBrowserRuntime } from './protocol';
import { isolateReactStreamScripts } from './script-isolation.server';
import { bridgeIdentifierPrefix } from './identity.server';
import { createBridgeServiceHandler, fetchBridgeService } from './service-http';

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
      const rendering = renderToPipeableStream(
        <Application label={label} data={data} shellMarker={shellMarker} />,
        {
          identifierPrefix: info.identifierPrefix,
          nonce: info.nonce,
          onShellReady() {
            rendering.pipe(output);
            shell.resolve();
          },
          onError(error) {
            serverErrors.push(error);
          },
        },
      );
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
      // This is a transparent test snapshot protocol, not a Modern loader mock.
      // Both the shell and the deferred completion are real React SSR bytes.
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
async function capture(result: BridgeSSRResult) {
  const [chunks, updates, snapshot] = await Promise.all([
    collect(result.stream),
    result.hydration ? collect(result.hydration.updates) : [],
    result.hydration ? result.hydration.snapshot : result.snapshot,
  ]);
  return {
    html: Buffer.concat(chunks),
    updates,
    snapshot,
    shellMarker: result.hydration?.shellMarker,
  };
}
async function fragments(html: Uint8Array): Promise<string[]> {
  const output: string[] = [];
  const framed = Readable.from([html]).pipe(htmlFrames());
  for await (const frame of framed) output.push(String(frame));
  return output;
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
        html: isolateReactStreamScripts(
          html,
          info.instanceId,
          info.identifierPrefix,
        ),
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
        for (const html of await fragments(cached[index].html))
          page.html(info, html);
        page.runtime.accept(info.instanceId, {
          type: 'data',
          snapshot: cached[index].snapshot,
        });
        page.runtime.accept(info.instanceId, { type: 'done' });
        const session = await page.runtime.get(info.instanceId)!.done;
        const container = page.container(info.instanceId);
        allButtons.push(Array.from(container.querySelectorAll('button')));
        expect(allButtons[index]).toHaveLength(2);
        const snapshot = session.snapshot as { label: string; detail: string };
        page.roots.push(
          hydrateRoot(
            container,
            <Application
              label={snapshot.label}
              data={resource(snapshot.detail)}
              shellMarker={`${info.instanceId}-shell`}
              detailHydrated={() => (hydrated[index] = true)}
            />,
            {
              identifierPrefix: session.identifierPrefix,
              onRecoverableError: (error) => page.errors.push(error),
            },
          ),
        );
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
      expect(await service.wire[1]).toBe(await service.wire[0]);
      expect(cached.html.equals(cold.html)).toBe(true);
      expect(cached.snapshot).toEqual({
        label: 'progressive',
        pending: ['detail'],
      });
      expect(cached.updates).toEqual([
        { id: 'detail', status: 'fulfilled', value: 'progressive-detail' },
      ]);
      expect(cached.shellMarker).toBe('progressive-shell');
      const frames = await fragments(cached.html);
      expect(frames.length).toBeGreaterThan(1);
      page.runtime.accept(info.instanceId, {
        type: 'meta',
        protocol: 'mf-bridge/1',
        identifierPrefix: info.identifierPrefix,
        hydration: 'progressive',
      });
      page.html(info, frames[0]);
      page.runtime.accept(info.instanceId, {
        type: 'ready',
        snapshot: cached.snapshot,
      });
      const session = await page.runtime.get(info.instanceId)!.ready!;
      const container = page.container(info.instanceId);
      const shellButton = container.querySelector('button')!;
      const clientData = resource();
      let shellHydrated = false;
      let detailHydrated = false;
      page.roots.push(
        hydrateRoot(
          container,
          <Application
            label={(session.snapshot as { label: string }).label}
            data={clientData}
            shellMarker={cached.shellMarker!}
            shellHydrated={() => (shellHydrated = true)}
            detailHydrated={() => (detailHydrated = true)}
          />,
          {
            identifierPrefix: session.identifierPrefix,
            onRecoverableError: (error) => page.errors.push(error),
          },
        ),
      );
      await until(() => shellHydrated);
      expect(container.querySelector('button')).toBe(shellButton);
      expect(container.querySelector('[data-pending]')).not.toBeNull();
      shellButton.dispatchEvent(
        new page.dom.window.MouseEvent('click', { bubbles: true }),
      );
      await until(() => shellButton.textContent === 'progressive: 1');
      for (const html of frames.slice(1)) page.html(info, html);
      const detailButton = container.querySelector(
        '[data-counter="progressive-detail"]',
      );
      expect(detailButton).not.toBeNull();
      for (const value of cached.updates)
        page.runtime.accept(info.instanceId, { type: 'update', value });
      page.runtime.accept(info.instanceId, { type: 'done' });
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
