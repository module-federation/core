import { describe, expect, it } from '@rstest/core';
import type { BridgeSSRRequest, BridgeSSRResult } from '../ssr';
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
function setup(progressive = true, includeFinalSnapshot = true) {
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
  const stream = {
    stream: html.stream,
    abort(reason?: unknown) {
      aborted.push(reason);
    },
  };
  const raw: BridgeSSRResult = progressive
    ? {
        ...stream,
        ...(includeFinalSnapshot ? { snapshot: final.promise } : {}),
        hydration: {
          snapshot: initial.promise,
          updates: updates.stream,
          shellMarker: 'b-shell',
        },
      }
    : { ...stream, snapshot: final.promise };
  return { raw, info, html, updates, initial, final, aborter, aborted };
}

describe('producer-owned stream preparation', () => {
  it('hydrates progressively without requiring or producing a final snapshot', async () => {
    const live = setup(true, false);
    expect(live.raw).not.toHaveProperty('snapshot');
    const result = await normalizeBridgeSSR(live.raw, live.info);
    expect(result.hydration).toBe('progressive');
    const reader = result.messages.getReader();
    live.html.controller.enqueue(
      Buffer.from('<template id="b-shell"></template>'),
    );
    expect((await reader.read()).value?.type).toBe('html');
    live.initial.resolve({ pending: ['stock'] });
    expect((await reader.read()).value).toEqual({
      type: 'ready',
      snapshot: { pending: ['stock'] },
    });
    live.updates.controller.enqueue({ id: 'stock', value: 42 });
    expect((await reader.read()).value).toEqual({
      type: 'update',
      value: { id: 'stock', value: 42 },
    });
    live.html.controller.close();
    live.updates.controller.close();
    expect((await reader.read()).value).toEqual({ type: 'done' });
    expect((await reader.read()).done).toBe(true);
    reader.releaseLock();
  });

  it('rejects complete mode without a final snapshot and cancels the progressive streams', async () => {
    const live = setup(true, false);
    await expect(
      normalizeBridgeSSR(live.raw, live.info, { hydrationMode: 'complete' }),
    ).rejects.toThrow('Complete Bridge hydration requires a final snapshot');
    expect(live.aborted).toHaveLength(1);
    expect(live.html.cancelled).toBeInstanceOf(Error);
    expect(live.updates.cancelled).toBeInstanceOf(Error);
  });

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
      html: '<script data-mf-react-transport="">$MF_622d_RC("b-B:0","b-S:0")</script>',
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

  it('preserves JSON capture semantics for snapshots, toJSON, and unsupported values', async () => {
    for (const progressive of [false, true]) {
      const live = setup(progressive);
      let calls = 0;
      const value = {
        count: 1,
        toJSON(key: string) {
          calls++;
          return { key, count: this.count, omitted: undefined, nonfinite: NaN };
        },
      };
      const result = await normalizeBridgeSSR(live.raw, live.info);
      const reader = result.messages.getReader();
      live.html.controller.enqueue(
        Buffer.from('<template id="b-shell"></template>'),
      );
      live.html.controller.close();
      await reader.read();
      (progressive ? live.initial : live.final).resolve(value);
      await new Promise((resolve) => setTimeout(resolve, 0));
      value.count = 2;
      expect((await reader.read()).value).toEqual({
        type: progressive ? 'ready' : 'data',
        snapshot: { key: 'snapshot', count: 1, nonfinite: null },
      });
      expect(calls).toBe(1);
      await reader.cancel();
      reader.releaseLock();
    }
    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    for (const value of [
      undefined,
      () => {},
      cycle,
      {
        toJSON() {
          return undefined;
        },
      },
    ]) {
      const live = setup(false);
      const result = await normalizeBridgeSSR(live.raw, live.info);
      const reader = result.messages.getReader();
      live.html.controller.enqueue(Buffer.from('<p>complete</p>'));
      live.html.controller.close();
      await reader.read();
      live.final.resolve(value);
      await expect(reader.read()).rejects.toThrow();
      expect(live.aborted).toHaveLength(1);
      reader.releaseLock();
    }
  });

  it('keeps the exact serialized HTML budget including escapes', async () => {
    const html =
      '<section><p title="quoted">中🌿\n</p><script>window.x="<value>"</script></section>';
    const bytes = Buffer.byteLength(JSON.stringify({ type: 'html', html }));
    for (const limit of [bytes - 1, bytes]) {
      const live = setup(false);
      const result = await normalizeBridgeSSR(live.raw, live.info, {
        maxBufferedBytes: limit,
      });
      const reader = result.messages.getReader();
      live.html.controller.enqueue(Buffer.from(html));
      if (limit < bytes)
        await expect(reader.read()).rejects.toThrow('pending buffer');
      else {
        expect((await reader.read()).value).toEqual({ type: 'html', html });
        await reader.cancel();
      }
      reader.releaseLock();
    }
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
