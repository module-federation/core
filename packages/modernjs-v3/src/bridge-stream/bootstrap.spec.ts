import { afterEach, describe, expect, it } from '@rstest/core';
import { JSDOM } from 'jsdom';
import {
  bridgeStreamBootstrap,
  type BridgeBootstrapOptions,
} from './bootstrap';
import type { BridgeStreamBrowserRuntime } from './protocol';

const documents: JSDOM[] = [];
function createDocument(
  html = '<div id="a">loading A</div><div id="b">loading B</div>',
  timeoutMs = 1000,
  options: BridgeBootstrapOptions = {},
) {
  const dom = new JSDOM(html, {
    url: 'https://host.example/dashboard?csr=1',
    runScripts: 'dangerously',
  });
  documents.push(dom);
  (dom.window as any).TextEncoder = TextEncoder;
  (dom.window as any).ReadableStream = ReadableStream;
  dom.window.eval(
    `(${bridgeStreamBootstrap.toString()})(${JSON.stringify({ instanceIds: ['a', 'b'], nonce: 'test-nonce', timeoutMs, ...options })})`,
  );
  return {
    dom,
    runtime: (dom.window as any)
      .__MF_BRIDGE_SSR__ as BridgeStreamBrowserRuntime,
  };
}
const meta = (prefix: string) => ({
  type: 'meta' as const,
  protocol: 'mf-bridge/1' as const,
  identifierPrefix: prefix,
});
afterEach(() => {
  documents.splice(0).forEach((dom) => dom.window.close());
});

describe('Bridge early bootstrap', () => {
  it('routes interleaved frames by instance and replays inline scripts after fragment insertion', async () => {
    const { dom, runtime } = createDocument();
    runtime.accept('a', meta('a-'));
    runtime.accept('b', meta('b-'));
    runtime.accept('a', {
      type: 'html',
      html: '<p id="a-content">A</p><script>window.aNonce=document.currentScript.nonce;window.aExists=!!document.getElementById("a-content")</script>',
    });
    runtime.accept('b', { type: 'html', html: '<p>B</p>' });
    runtime.accept('a', { type: 'html', html: '<p>A2</p>' });
    runtime.accept('a', { type: 'data', snapshot: { value: 'A' } });
    runtime.accept('a', { type: 'done' });
    expect(await runtime.get('a')!.done).toEqual({
      snapshot: { value: 'A' },
      identifierPrefix: 'a-',
    });
    expect(dom.window.document.getElementById('a')!.textContent).toBe('AA2');
    expect(dom.window.document.getElementById('b')!.textContent).toBe('B');
    expect((dom.window as any).aExists).toBe(true);
    expect((dom.window as any).aNonce).toBe('test-nonce');
  });

  it('queues a late container and completes only after its snapshot', async () => {
    const { dom, runtime } = createDocument();
    runtime.accept('late', meta('late-'));
    runtime.accept('late', { type: 'html', html: 'text<p>late</p>tail' });
    runtime.accept('late', { type: 'data', snapshot: null });
    runtime.accept('late', { type: 'done' });
    const container = dom.window.document.createElement('div');
    container.id = 'late';
    dom.window.document.body.appendChild(container);
    runtime.claim('late', container);
    expect(await runtime.get('late')!.done).toEqual({
      snapshot: null,
      identifierPrefix: 'late-',
    });
    expect(container.innerHTML).toBe('text<p>late</p>tail');
  });

  it('rejects truncation timeouts and does not reload an already CSR page', async () => {
    const { dom, runtime } = createDocument(undefined, 10);
    runtime.accept('a', meta('a-'));
    await expect(runtime.get('a')!.done).rejects.toThrow('timed out');
    runtime.fallback();
    runtime.fallback();
    expect(
      dom.window.document.querySelectorAll('#mf-bridge-fatal-error'),
    ).toHaveLength(1);
    expect(dom.window.location.search).toBe('?csr=1');
  });

  it('rejects invalid ordering and ignores data after an instance is released', async () => {
    const { dom, runtime } = createDocument();
    runtime.accept('a', meta('a-'));
    runtime.accept('a', { type: 'done' });
    await expect(runtime.get('a')!.done).rejects.toThrow(
      'Missing Bridge snapshot',
    );
    const container = dom.window.document.getElementById('b')!;
    runtime.claim('b', container);
    runtime.release('b', container);
    runtime.accept('b', meta('b-'));
    runtime.accept('b', { type: 'html', html: '<p>late</p>' });
    expect(container.textContent).toBe('loading B');
  });
  it('waits for deferred React boundary DOM insertion before resolving done', async () => {
    const { dom, runtime } = createDocument();
    runtime.accept('a', meta('a-'));
    runtime.accept('a', {
      type: 'html',
      html: '<!--$?--><template id="a-B:0"></template>loading<!--/$-->',
    });
    runtime.accept('a', { type: 'data', snapshot: {} });
    runtime.accept('a', { type: 'done' });
    let complete = false;
    const done = runtime.get('a')!.done.then(() => {
      complete = true;
    });
    const container = dom.window.document.getElementById('a')!;
    await Promise.resolve();
    expect(complete).toBe(false);
    container.firstChild!.nodeValue = '$~';
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(complete).toBe(false);
    container.replaceChildren(
      dom.window.document.createComment('$'),
      dom.window.document.createTextNode('ready'),
      dom.window.document.createComment('/$'),
    );
    await done;
    expect(complete).toBe(true);
    expect(container.textContent).toBe('ready');
  });

  it('keeps the deadline active while completed transport still has pending React boundaries', async () => {
    const { runtime } = createDocument(undefined, 10);
    runtime.accept('a', meta('a-'));
    runtime.accept('a', { type: 'html', html: '<!--$~-->loading<!--/$-->' });
    runtime.accept('a', { type: 'data', snapshot: {} });
    runtime.accept('a', { type: 'done' });
    await expect(runtime.get('a')!.done).rejects.toThrow('timed out');
  });

  it('rejects a boundary that the server marked for client rendering', async () => {
    const { runtime } = createDocument();
    runtime.accept('a', meta('a-'));
    runtime.accept('a', {
      type: 'html',
      html: '<!--$!--><template data-msg="failed"></template>loading<!--/$-->',
    });
    runtime.accept('a', { type: 'data', snapshot: {} });
    runtime.accept('a', { type: 'done' });
    await expect(runtime.get('a')!.done).rejects.toThrow(
      'requires client rendering',
    );
  });

  it('waits for even an empty remote container before resolving its session', async () => {
    const { dom, runtime } = createDocument();
    runtime.accept('late', meta('late-'));
    runtime.accept('late', { type: 'data', snapshot: null });
    runtime.accept('late', { type: 'done' });
    let complete = false;
    const done = runtime.get('late')!.done.then(() => {
      complete = true;
    });
    await Promise.resolve();
    expect(complete).toBe(false);
    const container = dom.window.document.createElement('div');
    container.id = 'late';
    container.textContent = 'loading';
    dom.window.document.body.appendChild(container);
    await done;
    expect(container.textContent).toBe('');
  });
});

describe('Bridge stylesheet readiness', () => {
  const completeFrames = (
    runtime: BridgeStreamBrowserRuntime,
    id: string,
    stylesheets: string[],
  ) => {
    runtime.accept(id, { ...meta(`${id}-`), stylesheets });
    runtime.accept(id, { type: 'html', html: `<p>styled ${id}</p>` });
    runtime.accept(id, { type: 'data', snapshot: { id } });
    runtime.accept(id, { type: 'done' });
  };

  it('requests CSS on metadata but retains loading content until all stylesheets load', async () => {
    const { dom, runtime } = createDocument();
    const document = dom.window.document;
    runtime.accept('a', {
      ...meta('a-'),
      stylesheets: ['/a.css', '/shared.css'],
    });
    const links = document.head.querySelectorAll('link');
    expect(links).toHaveLength(2);
    expect(links[0].rel).toBe('stylesheet');
    expect(links[0].nonce).toBe('test-nonce');
    runtime.accept('a', { type: 'html', html: '<p>styled A</p>' });
    runtime.accept('a', { type: 'data', snapshot: {} });
    runtime.accept('a', { type: 'done' });
    let completed = false;
    void runtime.get('a')!.done.then(() => {
      completed = true;
    });
    expect(document.getElementById('a')!.textContent).toBe('loading A');
    links[0].dispatchEvent(new dom.window.Event('load'));
    await Promise.resolve();
    expect(document.getElementById('a')!.textContent).toBe('loading A');
    expect(completed).toBe(false);
    links[1].dispatchEvent(new dom.window.Event('load'));
    await runtime.get('a')!.done;
    expect(document.getElementById('a')!.textContent).toBe('styled A');
    expect(completed).toBe(true);
  });

  it('reuses an already loaded document stylesheet without waiting for a past load event', async () => {
    const { dom, runtime } = createDocument();
    const document = dom.window.document;
    const existing = document.createElement('link');
    existing.rel = 'stylesheet';
    existing.href = '/shared.css';
    Object.defineProperty(existing, 'sheet', { value: {} });
    document.head.appendChild(existing);
    completeFrames(runtime, 'a', ['/shared.css']);
    await runtime.get('a')!.done;
    expect(document.querySelectorAll('link')).toHaveLength(1);
    expect(document.querySelector('link')).toBe(existing);
    runtime.release('a', document.getElementById('a')!);
    expect(existing.isConnected).toBe(true);
  });

  it('shares one pending stylesheet across instances while keeping their other CSS independent', async () => {
    const { dom, runtime } = createDocument();
    const document = dom.window.document;
    const existing = document.createElement('link');
    existing.rel = 'stylesheet';
    existing.href = '/shared.css';
    document.head.appendChild(existing);
    completeFrames(runtime, 'a', ['/shared.css', '/a.css']);
    completeFrames(runtime, 'b', ['https://host.example/shared.css', '/b.css']);
    expect(document.querySelectorAll('link')).toHaveLength(3);
    existing.dispatchEvent(new dom.window.Event('load'));
    document
      .querySelector('link[href="https://host.example/b.css"]')!
      .dispatchEvent(new dom.window.Event('load'));
    await runtime.get('b')!.done;
    expect(document.getElementById('b')!.textContent).toBe('styled b');
    expect(document.getElementById('a')!.textContent).toBe('loading A');
    document
      .querySelector('link[href="https://host.example/a.css"]')!
      .dispatchEvent(new dom.window.Event('load'));
    await runtime.get('a')!.done;
    expect(document.getElementById('a')!.textContent).toBe('styled a');
  });

  it('does not treat preload, inactive or non-CSS links as applied styles', async () => {
    const { dom, runtime } = createDocument();
    const document = dom.window.document;
    document.head.innerHTML =
      '<link rel="preload" as="style" href="/preload.css">' +
      '<link rel="alternate stylesheet" href="/alternate.css">' +
      '<link rel="stylesheet" href="/disabled.css">' +
      '<link rel="stylesheet" media="print" href="/print.css">' +
      '<link rel="stylesheet" disabled href="/disabled-attribute.css">' +
      '<link rel="stylesheet" type="text/plain" href="/text.css">';
    (document.head.children[2] as HTMLLinkElement).disabled = true;
    const originals = Array.from(document.head.children);
    completeFrames(runtime, 'a', [
      '/preload.css',
      '/alternate.css',
      '/disabled.css',
      '/print.css',
      '/disabled-attribute.css',
      '/text.css',
    ]);
    const added = Array.from(document.querySelectorAll('link')).slice(6);
    expect(added).toHaveLength(6);
    added.forEach((link) => link.dispatchEvent(new dom.window.Event('load')));
    await runtime.get('a')!.done;
    expect(originals.every((link) => link.isConnected)).toBe(true);
  });

  it('fails once if a stylesheet errors and never reveals queued unstyled HTML', async () => {
    const { dom, runtime } = createDocument();
    const document = dom.window.document;
    completeFrames(runtime, 'a', ['/broken.css']);
    const link = document.querySelector('link')!;
    link.dispatchEvent(new dom.window.Event('error'));
    await expect(runtime.get('a')!.done).rejects.toThrow('stylesheet failed');
    link.dispatchEvent(new dom.window.Event('load'));
    await Promise.resolve();
    expect(document.getElementById('a')!.textContent).toBe('loading A');
    expect(document.querySelectorAll('#mf-bridge-fatal-error')).toHaveLength(1);
  });

  it('keeps the stream deadline active for CSS and detaches cancelled requests', async () => {
    const { dom, runtime } = createDocument(undefined, 10);
    const document = dom.window.document;
    completeFrames(runtime, 'a', ['/never.css']);
    const link = document.querySelector('link')!;
    await expect(runtime.get('a')!.done).rejects.toThrow('timed out');
    expect(link.isConnected).toBe(false);
    link.dispatchEvent(new dom.window.Event('load'));
    await Promise.resolve();
    expect(document.getElementById('a')!.textContent).toBe('loading A');
    expect(document.querySelectorAll('#mf-bridge-fatal-error')).toHaveLength(1);
  });

  it('releases an instance while allowing another to finish using the shared stylesheet', async () => {
    const { dom, runtime } = createDocument();
    const document = dom.window.document;
    completeFrames(runtime, 'a', ['/shared.css']);
    completeFrames(runtime, 'b', ['/shared.css']);
    const link = document.querySelector('link')!;
    runtime.release('a', document.getElementById('a')!);
    await expect(runtime.get('a')!.done).rejects.toThrow('unmounted');
    expect(link.isConnected).toBe(true);
    link.dispatchEvent(new dom.window.Event('load'));
    await runtime.get('b')!.done;
    expect(document.getElementById('a')!.textContent).toBe('loading A');
    expect(document.getElementById('b')!.textContent).toBe('styled b');
    expect(document.querySelector('#mf-bridge-fatal-error')).toBeNull();
  });

  it('preserves an existing pending page stylesheet when the instance is released', async () => {
    const { dom, runtime } = createDocument();
    const document = dom.window.document;
    const existing = document.createElement('link');
    existing.rel = 'stylesheet';
    existing.href = '/shared.css';
    document.head.appendChild(existing);
    completeFrames(runtime, 'a', ['/shared.css']);
    runtime.release('a', document.getElementById('a')!);
    await expect(runtime.get('a')!.done).rejects.toThrow('unmounted');
    existing.dispatchEvent(new dom.window.Event('load'));
    await Promise.resolve();
    expect(existing.isConnected).toBe(true);
    expect(document.getElementById('a')!.textContent).toBe('loading A');
  });

  it('handles a server error immediately even while CSS blocks queued HTML', async () => {
    const { dom, runtime } = createDocument();
    completeFrames(runtime, 'a', ['/pending.css']);
    runtime.accept('a', { type: 'error', message: 'Remote render failed' });
    await expect(runtime.get('a')!.done).rejects.toThrow(
      'Remote render failed',
    );
    expect(dom.window.document.getElementById('a')!.textContent).toBe(
      'loading A',
    );
  });
});

describe('Bridge progressive hydration', () => {
  const prepare = (
    runtime: BridgeStreamBrowserRuntime,
    id: string,
    html = `<!--$?--><template id="${id}-B:0"></template>loading ${id}<!--/$-->`,
  ) => {
    runtime.accept(id, { ...meta(`${id}-`), hydration: 'progressive' });
    runtime.accept(id, { type: 'html', html });
    const snapshot = { pending: [{ id: '0', path: ['report'] }], report: null };
    runtime.accept(id, { type: 'ready', snapshot });
    return snapshot;
  };
  const patch = (value: unknown) => ({
    id: '0',
    status: 'fulfilled',
    value,
    pending: [],
  });

  it('starts hydration while Suspense is pending and isolates deferred updates by instance', async () => {
    const { dom, runtime } = createDocument();
    const initialA = prepare(runtime, 'a');
    const initialB = prepare(runtime, 'b');
    const sessionA = runtime.get('a')!;
    const sessionB = runtime.get('b')!;
    let doneA = false;
    let doneB = false;
    void sessionA.done.then(() => {
      doneA = true;
    });
    void sessionB.done.then(() => {
      doneB = true;
    });
    const readyA = await sessionA.ready!;
    const readyB = await sessionB.ready!;
    expect(readyA.snapshot).toEqual(initialA);
    expect(readyB.snapshot).toEqual(initialB);
    expect(readyA.identifierPrefix).toBe('a-');
    expect(readyB.identifierPrefix).toBe('b-');
    expect(doneA).toBe(false);
    expect(doneB).toBe(false);
    expect(dom.window.document.getElementById('a')!.firstChild!.nodeValue).toBe(
      '$?',
    );

    const readerA = readyA.updates!.getReader();
    const readerB = readyB.updates!.getReader();
    const nextA = readerA.read();
    const nextB = readerB.read();
    runtime.accept('b', { type: 'update', value: patch('inventory') });
    runtime.accept('a', { type: 'update', value: patch('products') });
    expect(await nextA).toEqual({ done: false, value: patch('products') });
    expect(await nextB).toEqual({ done: false, value: patch('inventory') });
    runtime.accept('a', { type: 'done' });
    runtime.accept('b', { type: 'done' });
    expect(await readerA.read()).toEqual({ done: true, value: undefined });
    expect(await readerB.read()).toEqual({ done: true, value: undefined });
    expect(doneA).toBe(false);
    expect(doneB).toBe(false);

    dom.window.document.getElementById('b')!.firstChild!.nodeValue = '$';
    await sessionB.done;
    expect(doneB).toBe(true);
    expect(doneA).toBe(false);
    dom.window.document.getElementById('a')!.firstChild!.nodeValue = '$';
    await sessionA.done;
    expect(doneA).toBe(true);
    expect(
      dom.window.document.querySelector('#mf-bridge-fatal-error'),
    ).toBeNull();
  });

  it('fails the update reader and transport after readiness if the producer errors', async () => {
    const { dom, runtime } = createDocument();
    prepare(runtime, 'a');
    const session = runtime.get('a')!;
    const ready = await session.ready!;
    const reader = ready.updates!.getReader();
    const next = reader.read();
    runtime.accept('a', { type: 'error', message: 'Deferred renderer failed' });
    await expect(next).rejects.toThrow('Deferred renderer failed');
    await expect(session.done).rejects.toThrow('Deferred renderer failed');
    expect(await session.ready!).toBe(ready);
    expect(
      dom.window.document.querySelectorAll('#mf-bridge-fatal-error'),
    ).toHaveLength(1);
    runtime.accept('a', { type: 'html', html: '<p>late content</p>' });
    expect(dom.window.document.getElementById('a')!.textContent).toBe(
      'loading a',
    );
    expect(
      dom.window.document.querySelectorAll('#mf-bridge-fatal-error'),
    ).toHaveLength(1);
  });

  it.each(['release', 'pagehide'] as const)(
    'rejects pending data and stops accepting frames on %s',
    async (action) => {
      const { dom, runtime } = createDocument();
      prepare(runtime, 'a');
      const session = runtime.get('a')!;
      const reader = (await session.ready!).updates!.getReader();
      const next = reader.read();
      const container = dom.window.document.getElementById('a')!;
      const before = container.innerHTML;
      const message = action === 'release' ? 'unmounted' : 'unloaded';
      if (action === 'release') runtime.release('a', container);
      else dom.window.dispatchEvent(new dom.window.Event('pagehide'));
      await expect(next).rejects.toThrow(message);
      await expect(session.done).rejects.toThrow(message);
      runtime.accept('a', { type: 'update', value: patch('late data') });
      runtime.accept('a', { type: 'html', html: '<p>late content</p>' });
      runtime.accept('a', { type: 'done' });
      expect(container.innerHTML).toBe(before);
      expect(runtime.claim('a', container)).toBeUndefined();
      expect(
        dom.window.document.querySelector('#mf-bridge-fatal-error'),
      ).toBeNull();
    },
  );

  it.each(['release', 'pagehide'] as const)(
    'rejects unread data on %s even after transport completion',
    async (action) => {
      const { dom, runtime } = createDocument();
      prepare(runtime, 'a', '<p>shell</p>');
      const session = runtime.get('a')!;
      const reader = (await session.ready!).updates!.getReader();
      runtime.accept('a', { type: 'update', value: patch('unconsumed') });
      runtime.accept('a', { type: 'done' });
      await session.done;
      const message = action === 'release' ? 'unmounted' : 'unloaded';
      if (action === 'release')
        runtime.release('a', dom.window.document.getElementById('a')!);
      else dom.window.dispatchEvent(new dom.window.Event('pagehide'));
      await expect(reader.read()).rejects.toThrow(message);
      expect(
        dom.window.document.querySelector('#mf-bridge-fatal-error'),
      ).toBeNull();
    },
  );

  it('bounds unread update bytes and releases capacity when the consumer reads', async () => {
    const update = { type: 'update' as const, value: patch('商品'.repeat(12)) };
    const bytes = new TextEncoder().encode(JSON.stringify(update)).byteLength;
    const { dom, runtime } = createDocument(undefined, 1000, {
      maxQueuedBytes: bytes * 2,
    });
    prepare(runtime, 'a', '<p>shell</p>');
    const session = runtime.get('a')!;
    const reader = (await session.ready!).updates!.getReader();
    let completed = false;
    void session.done.then(
      () => {
        completed = true;
      },
      () => {},
    );
    runtime.accept('a', update);
    runtime.accept('a', update);
    expect(await reader.read()).toEqual({ done: false, value: update.value });
    runtime.accept('a', update);
    expect(completed).toBe(false);
    expect(
      dom.window.document.querySelector('#mf-bridge-fatal-error'),
    ).toBeNull();
    runtime.accept('a', update);
    await expect(session.done).rejects.toThrow(
      'Bridge pending data exceeds limit',
    );
    await expect(reader.read()).rejects.toThrow(
      'Bridge pending data exceeds limit',
    );
    expect(
      dom.window.document.querySelectorAll('#mf-bridge-fatal-error'),
    ).toHaveLength(1);
  });
});
