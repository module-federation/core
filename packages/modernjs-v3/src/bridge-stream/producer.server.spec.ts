import { describe, expect, it } from '@rstest/core';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
} from '@module-federation/bridge-react/ssr';
import { normalizeBridgeSSR } from './producer.server';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
function channel<T>() {
  let controller!: ReadableStreamDefaultController<T>;
  let cancelled: unknown;
  const stream = new ReadableStream<T>({
    start(value) {
      controller = value;
    },
    cancel(reason) {
      cancelled = reason;
    },
  });
  return {
    stream,
    controller,
    get cancelled() {
      return cancelled;
    },
  };
}
function setup(progressive = true) {
  const html = channel<Uint8Array>();
  const updates = channel<unknown>();
  const aborter = new AbortController();
  const initial = deferred<unknown>();
  const final = deferred<unknown>();
  const aborted: unknown[] = [];
  const info: BridgeSSRRequest = {
    instanceId: 'b',
    identifierPrefix: 'b-',
    url: 'https://host.test/',
    props: {},
    signal: aborter.signal,
  };
  const raw: BridgeSSRResult = {
    stream: html.stream,
    snapshot: final.promise,
    ...(progressive
      ? {
          hydration: {
            snapshot: initial.promise,
            updates: updates.stream,
            shellMarker: 'b-shell',
          },
        }
      : {}),
    abort(reason) {
      aborted.push(reason);
    },
  };
  return { raw, info, html, updates, initial, final, aborter, aborted };
}

describe('producer-owned stream preparation', () => {
  it('emits complete HTML before a deferred snapshot, then readiness before data updates', async () => {
    const live = setup();
    const result = await normalizeBridgeSSR(live.raw, live.info);
    const reader = result.messages.getReader();
    live.html.controller.enqueue(
      Buffer.from('<section>库存<template id="b-shell"></template>'),
    );
    let arrived = false;
    const first = reader.read().then((value) => {
      arrived = true;
      return value;
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(arrived).toBe(false);
    live.html.controller.enqueue(Buffer.from('</section>'));
    expect((await first).value).toEqual({
      type: 'html',
      html: '<section>库存<template id="b-shell"></template></section>',
    });
    live.updates.controller.enqueue({ id: 'delivery', value: 'tomorrow' });
    live.html.controller.enqueue(
      Buffer.from('<div hidden id="b-S:0">配送</div>'),
    );
    // Waiting for application data must not hold up subsequent complete HTML.
    expect((await reader.read()).value?.type).toBe('html');
    live.initial.resolve({ pending: ['delivery'] });
    expect((await reader.read()).value).toEqual({
      type: 'ready',
      snapshot: { pending: ['delivery'] },
    });
    expect((await reader.read()).value).toEqual({
      type: 'update',
      value: { id: 'delivery', value: 'tomorrow' },
    });
    live.html.controller.close();
    live.updates.controller.close();
    expect((await reader.read()).value).toEqual({ type: 'done' });
    expect((await reader.read()).done).toBe(true);
    reader.releaseLock();
  });

  it('isolates React completion instructions once and preserves ready-made producer messages', async () => {
    const live = setup(false);
    const result = await normalizeBridgeSSR(live.raw, live.info);
    expect(await normalizeBridgeSSR(result, live.info)).toBe(result);
    const reader = result.messages.getReader();
    live.html.controller.enqueue(
      Buffer.from('<script>$RC("b-B:0","b-S:0")</script>'),
    );
    expect((await reader.read()).value).toEqual({
      type: 'html',
      html: '<script>$MF_622d_RC("b-B:0","b-S:0")</script>',
    });
    live.html.controller.close();
    live.final.resolve({ complete: true });
    expect((await reader.read()).value).toEqual({
      type: 'data',
      snapshot: { complete: true },
    });
    expect((await reader.read()).value).toEqual({ type: 'done' });
    expect((await reader.read()).done).toBe(true);
    reader.releaseLock();
    result.abort('release after completion');
    result.abort('duplicate release');
    expect(live.aborted).toEqual([
      expect.objectContaining({ message: 'release after completion' }),
    ]);
  });

  it('freezes a queued update before the renderer mutates its original object', async () => {
    const live = setup();
    live.initial.resolve({});
    const result = await normalizeBridgeSSR(live.raw, live.info);
    const reader = result.messages.getReader();
    live.html.controller.enqueue(
      Buffer.from('<template id="b-shell"></template>'),
    );
    await reader.read();
    await reader.read();
    const value = { count: 1 };
    live.updates.controller.enqueue(value);
    await new Promise((resolve) => setTimeout(resolve, 0));
    value.count = 2;
    expect((await reader.read()).value).toEqual({
      type: 'update',
      value: { count: 1 },
    });
    await reader.cancel();
    reader.releaseLock();
  });

  it('rejects malformed or oversized HTML at the producer and cancels its streams', async () => {
    for (const html of ['<div>unfinished', `<p>${'x'.repeat(100)}</p>`]) {
      const live = setup(false);
      const result = await normalizeBridgeSSR(live.raw, live.info, {
        maxFrameBytes: 64,
      });
      const reader = result.messages.getReader();
      live.html.controller.enqueue(Buffer.from(html));
      live.html.controller.close();
      await expect(reader.read()).rejects.toThrow(
        html.startsWith('<div>') ? 'Incomplete HTML' : 'frame exceeds',
      );
      expect(live.aborted).toHaveLength(1);
      reader.releaseLock();
    }
  });

  it('bounds queued output and aborts while hydration data or HTML is stalled', async () => {
    const live = setup();
    const result = await normalizeBridgeSSR(live.raw, live.info, {
      maxBufferedBytes: 128,
    });
    const reader = result.messages.getReader();
    live.html.controller.enqueue(
      Buffer.from('<template id="b-shell"></template>'),
    );
    await reader.read();
    const pending = reader.read();
    live.aborter.abort(new Error('navigation changed'));
    await expect(pending).rejects.toThrow('navigation changed');
    expect(live.updates.cancelled).toBeInstanceOf(Error);
    expect(live.html.cancelled).toBeInstanceOf(Error);
    reader.releaseLock();

    const overflow = setup(false);
    const normalized = await normalizeBridgeSSR(overflow.raw, overflow.info, {
      maxBufferedBytes: 64,
    });
    const slow = normalized.messages.getReader();
    overflow.html.controller.enqueue(Buffer.from('<p>first</p>'));
    await slow.read();
    overflow.html.controller.enqueue(Buffer.from(`<p>${'x'.repeat(100)}</p>`));
    await expect(slow.read()).rejects.toThrow('pending buffer');
    slow.releaseLock();
  });

  it('complete hydration drains updates without requiring a shell marker or initial snapshot', async () => {
    const live = setup();
    const result = await normalizeBridgeSSR(live.raw, live.info, {
      hydrationMode: 'complete',
    });
    const reader = result.messages.getReader();
    live.updates.controller.enqueue({ value: 'ignored' });
    live.updates.controller.close();
    live.html.controller.enqueue(Buffer.from('<p>complete</p>'));
    live.html.controller.close();
    live.final.resolve({ complete: true });
    const messages = [];
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      messages.push(next.value);
    }
    expect(messages).toEqual([
      { type: 'html', html: '<p>complete</p>' },
      { type: 'data', snapshot: { complete: true } },
      { type: 'done' },
    ]);
    reader.releaseLock();
  });
});
