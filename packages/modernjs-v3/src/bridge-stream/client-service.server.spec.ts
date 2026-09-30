import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { createBridgeClientServiceMiddleware } from './client-service.server';
import { fetchBridgeService } from './service-http';

rs.mock('./service-http', () => ({ fetchBridgeService: rs.fn() }));
afterEach(() => rs.clearAllMocks());

const services = {
  'weekend/app': { url: 'https://service.example/render', revision: 'r1' },
};
const input = {
  moduleName: 'weekend/app',
  instanceId: 'weekend',
  url: 'https://host.example/weekend',
  props: { city: 'London' },
};
function invoke(body: object, init: RequestInit = {}) {
  const request = new Request('https://host.example/bridge-render', {
    method: 'POST',
    body: JSON.stringify(body),
    ...init,
  });
  const handler = createBridgeClientServiceMiddleware({
    path: '/bridge-render',
    services,
    forwardHeaders: ['accept-language'],
  });
  return handler(
    { req: { raw: request } } as any,
    rs.fn(),
  ) as Promise<Response>;
}
function result(html: string) {
  return {
    revision: 'r1',
    stylesheets: ['https://service.example/app.css'],
    stream: new ReadableStream<Uint8Array>({
      start(controller) {
        // Deliberately split an HTML attribute across raw transport chunks.
        const bytes = new TextEncoder().encode(html);
        controller.enqueue(bytes.slice(0, 9));
        controller.enqueue(bytes.slice(9));
        controller.close();
      },
    }),
    snapshot: Promise.resolve({
      protocol: 'modern-application/1',
      bridgeRevision: 'r1',
    }),
    abort: rs.fn(),
  };
}
describe('browser HTTP service consumer endpoint', () => {
  it('uses only configured endpoints and derives trusted headers and prefixes', async () => {
    const rendered = result('<p id="shell">Hello</p>');
    rs.mocked(fetchBridgeService).mockResolvedValueOnce(rendered);
    const response = await invoke(
      { ...input, headers: { cookie: 'forged' }, identifierPrefix: 'forged' },
      {
        headers: { 'accept-language': 'en', cookie: 'real-but-not-forwarded' },
      },
    );
    expect(response.status).toBe(200);
    const frames = (await response.text())
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(frames.map((frame) => frame.type)).toEqual([
      'meta',
      'html',
      'data',
      'done',
    ]);
    expect(frames[0].hydration).toBeUndefined();
    expect(frames[0].stylesheets).toEqual(rendered.stylesheets);
    expect(frames[1].html).toBe('<p id="shell">Hello</p>');
    expect(frames[2].snapshot.protocol).toBe('modern-application/1');
    expect(fetchBridgeService).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { 'accept-language': 'en' },
        identifierPrefix: expect.stringMatching(/^mf-client-/),
        props: input.props,
      }),
      expect.objectContaining({
        url: services['weekend/app'].url,
        hydrationMode: 'complete',
      }),
    );
    expect(rendered.abort).toHaveBeenCalled();
  });
  it('rejects unknown services, cross-origin URLs/origins and oversized requests before rendering', async () => {
    expect((await invoke({ ...input, moduleName: '__proto__' })).status).toBe(
      400,
    );
    expect(
      (await invoke({ ...input, url: 'https://other.example/' })).status,
    ).toBe(400);
    expect(
      (await invoke(input, { headers: { origin: 'https://other.example' } }))
        .status,
    ).toBe(403);
    expect(
      (await invoke({ ...input, props: { text: 'a'.repeat(1024 * 1024) } }))
        .status,
    ).toBe(400);
    expect(fetchBridgeService).not.toHaveBeenCalled();
  });
  it('reports a malformed partial HTML stream and never emits done', async () => {
    const rendered = result('<div>incomplete');
    rs.mocked(fetchBridgeService).mockResolvedValueOnce(rendered);
    const response = await invoke(input);
    const frames = (await response.text())
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(frames.map((frame) => frame.type)).toEqual(['meta', 'error']);
    expect(rendered.abort).toHaveBeenCalled();
  });
  it('aborts the producer when the browser cancels its response', async () => {
    const rendered = {
      ...result(''),
      stream: new ReadableStream<Uint8Array>(),
    };
    rs.mocked(fetchBridgeService).mockResolvedValueOnce(rendered);
    const response = await invoke(input);
    await response.body!.cancel();
    expect(rendered.abort).toHaveBeenCalled();
    expect(rs.mocked(fetchBridgeService).mock.calls[0][0].signal.aborted).toBe(
      true,
    );
  });
});
