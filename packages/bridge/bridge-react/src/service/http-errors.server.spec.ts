import { describe, expect, it, rstest } from '@rstest/core';
import type { BridgeSSRRequest } from '../types';
import { fetchBridgeService } from './fetch';
import { createBridgeServiceHandler } from './http.server';
import { BRIDGE_PRODUCER_PROTOCOL } from './protocol';

const info = (): BridgeSSRRequest => ({
  instanceId: 'service',
  identifierPrefix: 'service-',
  url: 'https://host.test/page',
  props: {},
  signal: new AbortController().signal,
});
const request = () =>
  new Request('https://service.test/render', {
    method: 'POST',
    body: JSON.stringify({
      protocol: BRIDGE_PRODUCER_PROTOCOL,
      buildVersion: 'old',
      request: info(),
    }),
  });
const fetcher = (handler: (request: Request) => Promise<Response>) =>
  rstest.fn(async (url, init) =>
    handler(new Request(url, init)),
  ) as unknown as typeof fetch;
const load = (fetch: typeof globalThis.fetch) =>
  fetchBridgeService(info(), {
    url: 'https://service.test/render',
    buildVersion: 'old',
    fetch,
  });
const unexpectedRender = () =>
  rstest.fn(async () => {
    throw Error('Must not render');
  });

describe('Bridge Service HTTP errors', () => {
  it('rejects a stale build before rendering or reading the render cache', async () => {
    const render = unexpectedRender();
    const handler = createBridgeServiceHandler({
      buildVersion: 'new',
      render,
      cache: { maxAgeMs: 1000 },
    });
    const response = await handler(request());
    expect(response.status).toBe(409);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).toBe('Bridge service buildVersion mismatch');
    const transport = fetcher(handler);
    const failure = await load(transport).catch((error) => error);
    expect(failure).toMatchObject({
      message: 'Bridge service returned HTTP 409.',
      status: 409,
    });
    expect(failure).not.toHaveProperty('actualBuildVersion');
    expect(transport).toHaveBeenCalledTimes(1);
    expect(render).not.toHaveBeenCalled();
  });

  it.each([401, 409, 503])(
    'reports HTTP %s without reading the response body or replaying the POST',
    async (status) => {
      const cancel = rstest.fn();
      const transport = rstest.fn(
        async () => new Response(new ReadableStream({ cancel }), { status }),
      );
      const failure = await load(transport).catch((error) => error);
      expect(failure).toMatchObject({
        status,
        message: `Bridge service returned HTTP ${status}.`,
      });
      expect(cancel).toHaveBeenCalledOnce();
      expect(transport).toHaveBeenCalledTimes(1);
    },
  );

  it.each(['authorize', 'validate'] as const)(
    'keeps %s conflicts ahead of deployment checks',
    async (stage) => {
      const buildVersion = rstest.fn(() => 'new');
      const render = unexpectedRender();
      const failure = await load(
        fetcher(
          createBridgeServiceHandler({
            buildVersion,
            render,
            [stage]: () => new Response('Business conflict', { status: 409 }),
          }),
        ),
      ).catch((error) => error);
      expect(failure).toMatchObject({ status: 409 });
      expect(buildVersion).not.toHaveBeenCalled();
      expect(render).not.toHaveBeenCalled();
    },
  );

  it('forwards upstream HTTP status through transparent ingresses without replay', async () => {
    const render = unexpectedRender();
    const producer = fetcher(
      createBridgeServiceHandler({ buildVersion: 'new', render }),
    );
    const ingress = (upstream: typeof fetch) =>
      fetcher(
        createBridgeServiceHandler({
          buildVersion: 'old',
          forwardHttpErrors: true,
          render: () => load(upstream),
        }),
      );
    const inner = ingress(producer);
    const outer = ingress(inner);
    expect(await load(outer).catch((error) => error)).toMatchObject({
      status: 409,
    });
    for (const transport of [producer, inner, outer])
      expect(transport).toHaveBeenCalledTimes(1);
    expect(render).not.toHaveBeenCalled();
  });

  it('keeps producer render failures as HTTP 500 by default', async () => {
    const render = rstest.fn(async () => {
      throw Object.assign(Error('business error'), { status: 409 });
    });
    expect(
      await load(
        fetcher(createBridgeServiceHandler({ buildVersion: 'old', render })),
      ).catch((error) => error),
    ).toMatchObject({ status: 500 });
    expect(render).toHaveBeenCalledOnce();
  });
});
