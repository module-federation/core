import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { JSDOM } from 'jsdom';
import { loadBridgeServiceRemote } from './client-service';
import { loadBridgeRemote } from './remote';
import type { BridgeStreamBrowserRuntime } from './protocol';

rs.mock('./remote', () => ({ loadBridgeRemote: rs.fn() }));
const documents: JSDOM[] = [];
afterEach(() => {
  documents.splice(0).forEach((dom) => {
    dom.window.dispatchEvent(new dom.window.Event('pagehide'));
    dom.window.close();
  });
  rs.unstubAllGlobals();
  rs.clearAllMocks();
});
function browser(query = '') {
  const dom = new JSDOM('<div id="remote">Loading</div>', {
    url: `https://host.example/weekend${query}`,
    runScripts: 'dangerously',
  });
  documents.push(dom);
  rs.stubGlobal('window', dom.window);
  rs.stubGlobal('document', dom.window.document);
  rs.stubGlobal('MutationObserver', dom.window.MutationObserver);
  const provider = {
    render: rs.fn(async () => {}),
    hydrate: rs.fn(async () => {}),
    destroy: rs.fn(),
  };
  const remote = { default: () => provider };
  Object.defineProperty(remote, Symbol.for('mf_module_id'), {
    value: 'weekend/app',
    enumerable: false,
  });
  rs.mocked(loadBridgeRemote).mockResolvedValue(remote);
  return {
    dom,
    provider,
    element: dom.window.document.getElementById('remote')!,
  };
}
const meta = {
  type: 'meta',
  protocol: 'mf-bridge/1',
  identifierPrefix: 'weekend-',
};
const bytes = (frame: object) =>
  new TextEncoder().encode(`${JSON.stringify(frame)}\n`);
const completedResponse = () =>
  new Response(
    [
      meta,
      { type: 'html', html: '<p>Ready</p>' },
      { type: 'data', snapshot: { protocol: 'modern-application/1' } },
      { type: 'done' },
    ]
      .map((frame) => JSON.stringify(frame))
      .join('\n') + '\n',
  );
async function until(test: () => boolean) {
  for (let i = 0; i < 100; i++) {
    if (test()) return;
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  throw Error('Test condition not reached');
}
describe('browser service Bridge lifecycle', () => {
  it('displays complete HTML frames before EOF and hydrates once after the final snapshot', async () => {
    const { element, provider } = browser('?csr=1&csr=0');
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const response = new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          stream = controller;
        },
      }),
    );
    const fetcher = rs.fn(async () => response);
    rs.stubGlobal('fetch', fetcher);
    const remote = await loadBridgeServiceRemote('weekend/app', {
      url: '/bridge-render',
    });
    expect(remote[Symbol.for('mf_module_id')]).toBe('weekend/app');
    const wrapped = remote.default();
    const rendering = wrapped.render({ dom: element, city: 'London' });
    stream.enqueue(bytes(meta));
    stream.enqueue(
      bytes({ type: 'html', html: '<button>Early shell</button>' }),
    );
    await until(() => element.textContent === 'Early shell');
    expect(provider.hydrate).not.toHaveBeenCalled();
    stream.enqueue(
      bytes({ type: 'data', snapshot: { protocol: 'modern-application/1' } }),
    );
    stream.enqueue(bytes({ type: 'done' }));
    stream.close();
    await rendering;
    expect(provider.hydrate).toHaveBeenCalledTimes(1);
    expect(provider.hydrate).toHaveBeenCalledWith(
      expect.objectContaining({
        dom: element,
        rootOptions: expect.objectContaining({ identifierPrefix: 'weekend-' }),
      }),
    );
    const request = JSON.parse(fetcher.mock.calls[0][1]!.body as string);
    expect(request.props).toEqual({ city: 'London' });
    expect(request.props.dom).toBeUndefined();
    expect(request.renderInstanceId).toBe('remote');
    expect(request.instanceId).toBe(element.id);
    expect(request.instanceId).not.toBe(request.renderInstanceId);
    await wrapped.render({ dom: element, city: 'Paris' });
    expect(provider.render).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
    wrapped.destroy({ dom: element, moduleName: 'weekend/app' });
    expect(provider.destroy).toHaveBeenCalledTimes(1);
    expect(element.id).toBe('remote');
  });
  it('reuses the first stable slot across documents while keeping delivery sessions independent', async () => {
    const requests: any[] = [];
    for (let index = 0; index < 2; index++) {
      const { element } = browser();
      const fetcher = rs.fn(async () => completedResponse());
      rs.stubGlobal('fetch', fetcher);
      const wrapped = (
        await loadBridgeServiceRemote('weekend/app', { url: '/bridge-render' })
      ).default();
      await wrapped.render({ dom: element, city: 'London' });
      requests.push(JSON.parse(fetcher.mock.calls[0][1]!.body as string));
      wrapped.destroy({ dom: element, moduleName: 'weekend/app' });
    }
    expect(requests.map((request) => request.renderInstanceId)).toEqual([
      'remote',
      'remote',
    ]);
    expect(requests[0].instanceId).not.toBe(requests[1].instanceId);
    expect(requests[0].props).toEqual(requests[1].props);
  });
  it('does not reuse a released renderer identity even through another library copy', async () => {
    const { element, provider } = browser();
    const fetcher = rs.fn(async () => completedResponse());
    rs.stubGlobal('fetch', fetcher);
    const first = (
      await loadBridgeServiceRemote('weekend/app', { url: '/bridge-render' })
    ).default();
    await first.render({ dom: element });
    first.destroy({ dom: element, moduleName: 'weekend/app' });

    rs.resetModules();
    const otherRemote = await import('./remote');
    rs.mocked(otherRemote.loadBridgeRemote).mockResolvedValue({
      default: () => provider,
    });
    const otherLibrary = await import('./client-service');
    const second = (
      await otherLibrary.loadBridgeServiceRemote('weekend/app', {
        url: '/bridge-render',
      })
    ).default();
    await second.render({ dom: element });
    const [initial, remount] = fetcher.mock.calls.map(([, init]) =>
      JSON.parse(init!.body as string),
    );
    expect(initial.renderInstanceId).toBe('remote');
    expect(remount.renderInstanceId).toBe(remount.instanceId);
    expect(remount.instanceId).not.toBe(initial.instanceId);
    second.destroy({ dom: element, moduleName: 'weekend/app' });
  });
  it('falls back to session identities for duplicate or invalid container IDs', async () => {
    const { element, dom } = browser();
    const duplicate = dom.window.document.createElement('div');
    duplicate.id = element.id;
    dom.window.document.body.appendChild(duplicate);
    const invalid = dom.window.document.createElement('div');
    invalid.id = 'invalid slot';
    dom.window.document.body.appendChild(invalid);
    const missing = dom.window.document.createElement('div');
    dom.window.document.body.appendChild(missing);
    const fetcher = rs.fn(async () => completedResponse());
    rs.stubGlobal('fetch', fetcher);
    const remote = await loadBridgeServiceRemote('weekend/app', {
      url: '/bridge-render',
    });
    const roots = [element, duplicate, invalid, missing];
    const providers = roots.map(() => remote.default());
    for (const [index, root] of roots.entries())
      await providers[index].render({ dom: root });
    const requests = fetcher.mock.calls.map(([, init]) =>
      JSON.parse(init!.body as string),
    );
    requests.forEach((request) =>
      expect(request.renderInstanceId).toBe(request.instanceId),
    );
    expect(
      new Set(requests.map((request) => request.renderInstanceId)).size,
    ).toBe(roots.length);
    providers.forEach((provider, index) =>
      provider.destroy({ dom: roots[index], moduleName: 'weekend/app' }),
    );
  });
  it('uses ordinary producer CSR directly after reload fallback', async () => {
    const { provider, element } = browser('?csr=1');
    const fetcher = rs.fn();
    rs.stubGlobal('fetch', fetcher);
    const wrapped = (
      await loadBridgeServiceRemote('weekend/app', { url: '/bridge-render' })
    ).default();
    await wrapped.render({ dom: element });
    expect(fetcher).not.toHaveBeenCalled();
    expect(provider.render).toHaveBeenCalledTimes(1);
    expect(provider.hydrate).not.toHaveBeenCalled();
  });
  it('cancels the real HTTP request and does not hydrate or reload on unmount', async () => {
    const { provider, element, dom } = browser();
    let signal: AbortSignal | undefined;
    rs.stubGlobal(
      'fetch',
      rs.fn(
        (_url: unknown, options: RequestInit) =>
          new Promise((_resolve, reject) => {
            signal = options.signal!;
            signal.addEventListener('abort', () => reject(signal!.reason), {
              once: true,
            });
          }),
      ),
    );
    const wrapped = (
      await loadBridgeServiceRemote('weekend/app', { url: '/bridge-render' })
    ).default();
    const rendering = Promise.resolve(wrapped.render({ dom: element }));
    const failure = rendering.catch((error) => error);
    await until(() => Boolean(signal));
    const runtime = (dom.window as any)
      .__MF_BRIDGE_SSR__ as BridgeStreamBrowserRuntime;
    const fallback = rs.spyOn(runtime, 'fallback');
    wrapped.destroy({ dom: element, moduleName: 'weekend/app' });
    await failure;
    expect(signal!.aborted).toBe(true);
    expect(provider.hydrate).not.toHaveBeenCalled();
    expect(fallback).not.toHaveBeenCalled();
  });
});
