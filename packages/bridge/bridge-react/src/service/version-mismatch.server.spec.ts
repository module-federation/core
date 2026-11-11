import { describe, expect, it, rstest } from '@rstest/core';
import type { BridgeSSRMessage, BridgeSSRRequest } from '../types';
import { fetchBridgeService } from './fetch';
import { createBridgeServiceHandler } from './http.server';
import { BRIDGE_PRODUCER_PROTOCOL, deferred } from './protocol';
import {
  BRIDGE_SERVICE_VERSION_MISMATCH,
  BridgeServiceVersionMismatchError,
  isBridgeServiceVersionMismatchError,
  VERSION_MISMATCH_CONTENT_TYPE,
} from './version-mismatch';

const versions = {
  expectedBuildVersion: 'build-1',
  actualBuildVersion: 'build-2',
};
const info = (signal = new AbortController().signal): BridgeSSRRequest => ({
  instanceId: 'service',
  identifierPrefix: 'service-',
  url: 'https://host.test/page',
  props: {},
  signal,
});
const request = () =>
  new Request('https://service.test/render', {
    method: 'POST',
    body: JSON.stringify({
      protocol: BRIDGE_PRODUCER_PROTOCOL,
      buildVersion: 'build-1',
      request: info(),
    }),
  });
const fetcher = (handler: (request: Request) => Promise<Response>) =>
  rstest.fn(async (url, init) =>
    handler(new Request(url, init)),
  ) as unknown as typeof fetch;
const load = (fetch: typeof globalThis.fetch, input = info()) =>
  fetchBridgeService(input, {
    url: 'https://service.test/render',
    buildVersion: 'build-1',
    fetch,
  });
const unexpectedRender = () =>
  rstest.fn(async () => {
    throw Error('Must not render a mismatched build.');
  });
const payload = () => ({
  protocol: BRIDGE_PRODUCER_PROTOCOL,
  code: BRIDGE_SERVICE_VERSION_MISMATCH,
  ...versions,
});

describe('Bridge Service version mismatch', () => {
  it('returns an explicit uncached 409 before rendering and preserves its typed metadata', async () => {
    const render = unexpectedRender();
    const handler = createBridgeServiceHandler({
      buildVersion: 'build-2',
      render,
      cache: { maxAgeMs: 1000 },
    });
    const response = await handler(request());
    expect(response.status).toBe(409);
    expect(response.headers.get('content-type')).toContain(
      VERSION_MISMATCH_CONTENT_TYPE,
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual(payload());
    const transport = fetcher(handler);
    const failure = await load(transport).catch((reason) => reason);
    expect(failure).toBeInstanceOf(BridgeServiceVersionMismatchError);
    expect(isBridgeServiceVersionMismatchError(failure)).toBe(true);
    expect(failure).toMatchObject({ ...versions, status: 409 });
    expect(transport).toHaveBeenCalledTimes(1);
    expect(render).not.toHaveBeenCalled();
  });

  it.each(['authorize', 'validate'] as const)(
    'keeps %s 409 opaque and does not expose the deployment version',
    async (stage) => {
      const render = unexpectedRender();
      const buildVersion = rstest.fn(() => 'private-build');
      const handler = createBridgeServiceHandler({
        buildVersion,
        render,
        [stage]: () =>
          new Response(JSON.stringify(payload()), {
            status: 409,
            headers: { 'content-type': 'application/json' },
          }),
      });
      const failure = await load(fetcher(handler)).catch((reason) => reason);
      expect(failure.message).toBe('Bridge service returned HTTP 409.');
      expect(isBridgeServiceVersionMismatchError(failure)).toBe(false);
      expect(failure).not.toHaveProperty('actualBuildVersion');
      expect(buildVersion).not.toHaveBeenCalled();
      expect(render).not.toHaveBeenCalled();
    },
  );

  it('preserves a dedicated mismatch through nested transparent ingresses without replay', async () => {
    const render = unexpectedRender();
    const producer = fetcher(
      createBridgeServiceHandler({ buildVersion: 'build-2', render }),
    );
    const ingress = (upstream: typeof fetch) =>
      fetcher(
        createBridgeServiceHandler({
          buildVersion: 'build-1',
          forwardVersionMismatch: true,
          render: (request) => load(upstream, request),
        }),
      );
    const inner = ingress(producer);
    const outer = ingress(inner);
    const failure = await load(outer).catch((reason) => reason);
    expect(isBridgeServiceVersionMismatchError(failure)).toBe(true);
    expect(failure).toMatchObject(versions);
    for (const transport of [producer, inner, outer])
      expect(transport).toHaveBeenCalledTimes(1);
    expect(render).not.toHaveBeenCalled();
  });

  it('does not turn an ordinary producer render failure into a pre-render 409', async () => {
    const render = rstest.fn(async () => {
      throw new BridgeServiceVersionMismatchError(versions);
    });
    const handler = createBridgeServiceHandler({
      buildVersion: 'build-1',
      render,
    });
    const failure = await load(fetcher(handler)).catch((reason) => reason);
    expect(failure.message).toContain('HTTP 500');
    expect(isBridgeServiceVersionMismatchError(failure)).toBe(false);
    expect(render).toHaveBeenCalledTimes(1);
  });

  it.each([
    { code: 'APPLICATION_CONFLICT' },
    { protocol: 'unknown' },
    { expectedBuildVersion: 'another-request' },
    { actualBuildVersion: 'build-1' },
    { actualBuildVersion: '' },
  ])('does not recognize invalid mismatch metadata %j', async (change) => {
    const transport = rstest.fn(
      async () =>
        new Response(JSON.stringify({ ...payload(), ...change }), {
          status: 409,
          headers: { 'content-type': VERSION_MISMATCH_CONTENT_TYPE },
        }),
    );
    const failure = await load(transport).catch((reason) => reason);
    expect(failure.message).toContain('HTTP 409');
    expect(isBridgeServiceVersionMismatchError(failure)).toBe(false);
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('bounds mismatch bodies and cancels the reader without replay', async () => {
    const cancel = rstest.fn();
    const transport = rstest.fn(
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new Uint8Array(1025));
            },
            cancel,
          }),
          {
            status: 409,
            headers: { 'content-type': VERSION_MISMATCH_CONTENT_TYPE },
          },
        ),
    );
    const failure = await fetchBridgeService(info(), {
      url: 'https://service.test/render',
      buildVersion: 'build-1',
      fetch: transport,
      maxFrameBytes: 1024,
    }).catch((reason) => reason);
    expect(failure.message).toContain('exceeds limit');
    expect(isBridgeServiceVersionMismatchError(failure)).toBe(false);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('cancels while reading a mismatch body and never turns cancellation into recovery', async () => {
    const reading = deferred<void>();
    const cancel = rstest.fn();
    const transport = rstest.fn(
      async () =>
        new Response(
          new ReadableStream(
            {
              pull() {
                reading.resolve();
              },
              cancel,
            },
            { highWaterMark: 0 },
          ),
          {
            status: 409,
            headers: { 'content-type': VERSION_MISMATCH_CONTENT_TYPE },
          },
        ),
    );
    const aborter = new AbortController();
    const result = load(transport, info(aborter.signal));
    await reading.promise;
    aborter.abort(Error('page released'));
    const failure = await result.catch((reason) => reason);
    expect(failure.message).toBe('page released');
    expect(isBridgeServiceVersionMismatchError(failure)).toBe(false);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('does not forward a late mismatch after the ingress request is cancelled', async () => {
    const started = deferred<void>();
    const completed = deferred<void>();
    const version = deferred<string>();
    const render = unexpectedRender();
    const producerHandler = createBridgeServiceHandler({
      buildVersion: () => {
        started.resolve();
        return version.promise;
      },
      render,
    });
    const producer = fetcher(async (request) => {
      try {
        return await producerHandler(request);
      } finally {
        completed.resolve();
      }
    });
    const ingress = fetcher(
      createBridgeServiceHandler({
        buildVersion: 'build-1',
        forwardVersionMismatch: true,
        render: (request) => load(producer, request),
      }),
    );
    const aborter = new AbortController();
    const result = load(ingress, info(aborter.signal));
    await started.promise;
    aborter.abort(Error('page released'));
    await expect(result).rejects.toThrow('page released');
    version.resolve('build-2');
    await completed.promise;
    expect(producer).toHaveBeenCalledTimes(1);
    expect(ingress).toHaveBeenCalledTimes(1);
    expect(render).not.toHaveBeenCalled();
  });

  it('fails an already-started stream without changing status, classifying it as retryable or replaying it', async () => {
    let messages!: ReadableStreamDefaultController<BridgeSSRMessage>;
    const render = rstest.fn(async () => ({
      protocol: BRIDGE_PRODUCER_PROTOCOL as typeof BRIDGE_PRODUCER_PROTOCOL,
      hydration: 'complete' as const,
      messages: new ReadableStream<BridgeSSRMessage>({
        start(controller) {
          messages = controller;
          controller.enqueue({ type: 'html', html: '<p>already rendered</p>' });
        },
      }),
      abort() {},
    }));
    const handler = createBridgeServiceHandler({
      buildVersion: 'build-1',
      forwardVersionMismatch: true,
      render,
      cache: { maxAgeMs: 1000 },
    });
    let status: number | undefined;
    const transport = fetcher(async (request) => {
      const response = await handler(request);
      status = response.status;
      return response;
    });
    const result = await load(transport);
    const reader = result.messages.getReader();
    expect((await reader.read()).value?.type).toBe('html');
    messages.error(new BridgeServiceVersionMismatchError(versions));
    const failure = await reader.read().catch((reason) => reason);
    expect(status).toBe(200);
    expect(failure).toBeInstanceOf(Error);
    expect(isBridgeServiceVersionMismatchError(failure)).toBe(false);
    expect(transport).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(1);
    reader.releaseLock();
  });

  it('recognizes a matching error from another package copy without accepting a status-only error', () => {
    const failure = new BridgeServiceVersionMismatchError(versions);
    expect(
      isBridgeServiceVersionMismatchError({
        ...failure,
        message: failure.message,
      }),
    ).toBe(true);
    expect(isBridgeServiceVersionMismatchError({ status: 409 })).toBe(false);
  });
});
