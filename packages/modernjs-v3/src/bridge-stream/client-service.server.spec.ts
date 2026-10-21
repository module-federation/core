import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { createBridgeClientServiceMiddleware } from './client-service.server';
import { fetchBridgeService } from './service-http';
import type {
  BridgeSSRMessage,
  BridgeSSRMessageResult,
} from '@module-federation/bridge-react/ssr';

rs.mock('./service-http', () => ({ fetchBridgeService: rs.fn() }));
rs.mock('htmlparser2', () => ({
  Parser: class {
    constructor() {
      throw Error('Consumer must not parse producer HTML');
    }
  },
}));
rs.mock('./script-isolation.server', () => ({
  isolateReactStreamScripts: () => {
    throw Error('Consumer must not rewrite producer scripts');
  },
}));
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
function result(html: string): BridgeSSRMessageResult {
  const snapshot = { protocol: 'modern-application/1', bridgeRevision: 'r1' };
  return {
    protocol: 'mf-bridge-producer/1',
    hydration: 'complete',
    revision: 'r1',
    stylesheets: ['https://service.example/app.css'],
    messages: new ReadableStream<BridgeSSRMessage>({
      start(controller) {
        controller.enqueue({ type: 'html', html });
        controller.enqueue({ type: 'data', snapshot });
        controller.enqueue({ type: 'done' });
        controller.close();
      },
    }),
    snapshot: Promise.resolve(snapshot),
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
  it('keeps rendering stable across delivery sessions and isolates distinct render slots', async () => {
    rs.mocked(fetchBridgeService).mockImplementation(async () =>
      result('<p>Ready</p>'),
    );
    const requests = [
      { instanceId: 'delivery-a', renderInstanceId: 'slot:a' },
      { instanceId: 'delivery-b', renderInstanceId: 'slot:a' },
      { instanceId: 'delivery-c', renderInstanceId: 'slot_a' },
    ];
    for (const identity of requests) {
      const response = await invoke(
        {
          ...input,
          ...identity,
          basename: '/reports',
          memoryRoute: { entryPath: '/summary' },
        },
        { headers: { 'accept-language': 'en' } },
      );
      expect(response.status).toBe(200);
      await response.text();
    }
    const rendered = rs.mocked(fetchBridgeService).mock.calls.map(([info]) => {
      const { signal: _signal, ...request } = info;
      return request;
    });
    expect(rendered[0]).toEqual(rendered[1]);
    expect(rendered[0].identifierPrefix).not.toBe(rendered[2].identifierPrefix);
    expect(rendered[0]).toMatchObject({
      moduleName: input.moduleName,
      instanceId: 'slot:a',
      url: input.url,
      basename: '/reports',
      memoryRoute: { entryPath: '/summary' },
      props: input.props,
      headers: { 'accept-language': 'en' },
    });
  });
  it('retains the instance identity for older clients without a render identity', async () => {
    rs.mocked(fetchBridgeService).mockResolvedValueOnce(result('<p>Ready</p>'));
    const response = await invoke(input);
    await response.text();
    expect(rs.mocked(fetchBridgeService).mock.calls[0][0].instanceId).toBe(
      input.instanceId,
    );
  });
  it('rejects invalid render identities before requesting a producer', async () => {
    for (const renderInstanceId of [
      '',
      'two slots',
      '<slot>',
      '"slot"',
      'a'.repeat(257),
      null,
      7,
      {},
    ]) {
      expect((await invoke({ ...input, renderInstanceId })).status).toBe(400);
    }
    expect(fetchBridgeService).not.toHaveBeenCalled();
  });
  it('forwards prepared scripts unchanged without parsing producer HTML again', async () => {
    const html =
      '<div hidden id="slot-S:0">ready</div><script>window.$MF_slot_RC("slot-B:0","slot-S:0")</script>';
    rs.mocked(fetchBridgeService).mockResolvedValueOnce(result(html));
    const response = await invoke(input);
    const frames = (await response.text())
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(frames[1]).toEqual({ type: 'html', html });
    expect(frames.at(-1)).toEqual({ type: 'done' });
  });
  it('reports a producer message-stream failure and never emits done', async () => {
    const rendered = result('');
    rendered.messages = new ReadableStream({
      start(controller) {
        controller.error(Error('Producer HTML framing failed'));
      },
    });
    rs.mocked(fetchBridgeService).mockResolvedValueOnce(rendered);
    const response = await invoke(input);
    const frames = (await response.text())
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(frames.map((frame) => frame.type)).toEqual(['meta', 'error']);
    expect(rendered.abort).toHaveBeenCalled();
  });
  it('rejects a truncated message sequence without inventing a completion message', async () => {
    const rendered = result('');
    rendered.messages = new ReadableStream({
      start(controller) {
        controller.enqueue({ type: 'html', html: '<p>shell</p>' });
        controller.close();
      },
    });
    rs.mocked(fetchBridgeService).mockResolvedValueOnce(rendered);
    const response = await invoke(input);
    const frames = (await response.text())
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(frames.map((frame) => frame.type)).toEqual([
      'meta',
      'html',
      'error',
    ]);
  });
  it('aborts the producer when the browser cancels its response', async () => {
    const rendered = {
      ...result(''),
      messages: new ReadableStream<BridgeSSRMessage>(),
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
