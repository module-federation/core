import { describe, expect, it } from '@rstest/core';
import { PassThrough, Readable } from 'node:stream';
import {
  byteStream,
  htmlFrames,
  readFrames,
  type HTMLFrame,
} from './frames.server';
import { hostPieces } from './host-stream';
import {
  createReactStreamScriptIsolator,
  isolateReactStreamScripts,
} from './script-isolation.server';

const MODERN_SHELL_MARKER = '&lt;!--&lt;?- SHELL_STREAM_END ?&gt;--&gt;';

async function collectHTML(html: string, limit?: number) {
  const input = Readable.from(
    Array.from(Buffer.from(html), (value) => Buffer.from([value])),
  );
  const parts: string[] = [];
  for await (const part of input.pipe(htmlFrames({ maxFrameBytes: limit })))
    parts.push(String(part));
  return parts;
}

describe('Bridge HTML framing', () => {
  it('queues independent React 19 boundaries while preserving scripts and split input', async () => {
    const source =
      '<section><!--$?--><template id="B:0"></template><!--/$--><script>const literal="<!--$?-->"</script></section><!--$?-->';
    const input = Readable.from(
      Array.from(Buffer.from(source), (value) => Buffer.from([value])),
    );
    const parts: HTMLFrame[] = [];
    for await (const part of input.pipe(
      htmlFrames({ includeMetadata: true, independentSuspense: true }),
    ))
      parts.push(part);
    expect(parts.map((part) => part.html).join('')).toBe(
      '<section><!--$~--><template id="B:0"></template><!--/$--><script>const literal="<!--$?-->"</script></section><!--$~-->',
    );
    const first = parts[0];
    expect(first.html.slice(first.scripts[0].start, first.scripts[0].end)).toBe(
      'const literal="<!--$?-->"',
    );
    expect((await collectHTML(source)).join('')).toBe(source);
  });
  it('preserves UTF-8, comments, void elements and scripts across byte boundaries', async () => {
    const html =
      '<main><img src="x"><p>你好 &amp; 🌿</p><!--$?--><template id="B:0"></template><!--/$--></main><div hidden id="S:0">ready</div><script>if(1<2){window.x="</not-script>"}</script>';
    const parts = await collectHTML(html);
    expect(parts.join('')).toBe(html);
    expect(parts).toHaveLength(3);
  });

  it('supports text and multi-root Fragments without completing broken tags', async () => {
    const html = 'head &amp; text<div>one</div><div>two</div>tail';
    expect((await collectHTML(html)).join('')).toBe(html);
    expect(await collectHTML('plain text')).toEqual(['plain text']);
    await expect(collectHTML('<div>unfinished')).rejects.toThrow(
      'Incomplete HTML',
    );
    await expect(collectHTML('<script>unfinished')).rejects.toThrow(
      'Incomplete HTML',
    );
    await expect(collectHTML('text<!--unfinished')).rejects.toThrow(
      'Incomplete HTML',
    );
  });

  it('bounds complete as well as incomplete frames using bytes', async () => {
    const input = Readable.from(['<div>' + '中'.repeat(20) + '</div>']);
    await expect(async () => {
      for await (const _part of input.pipe(htmlFrames({ maxFrameBytes: 60 }))) {
        /* consume */
      }
    }).rejects.toThrow('exceeds limit');
    await expect(collectHTML('<main>' + 'x'.repeat(100), 32)).rejects.toThrow(
      'exceeds limit',
    );
  });

  it('keeps the Host shell early and subsequent React segments atomic', async () => {
    const source = new PassThrough();
    const stream = source.pipe(hostPieces(MODERN_SHELL_MARKER));
    const iterator = stream[Symbol.asyncIterator]();
    const shell = '<main><div id="remote"></div></main>' + MODERN_SHELL_MARKER;
    const first = iterator.next();
    for (const value of Buffer.from(shell)) source.write(Buffer.from([value]));
    expect((await first).value).toBe(shell);
    expect(source.writableEnded).toBe(false);
    const segment = '<div hidden id="S:0">结果 🌿</div>';
    const script = '<script>if(1<2){$RC("B:0","S:0")}</script>';
    source.end(segment + script);
    expect((await iterator.next()).value).toBe(segment);
    expect((await iterator.next()).value).toBe(script);
    expect((await iterator.next()).done).toBe(true);
  });

  it('reuses script offsets and decoded marker identity across fragmented Unicode HTML', async () => {
    const html =
      'before<!-- marker -->' +
      '<section>中🌿<script nonce="x">$RC("remote-B:0","remote-S:0")</script>' +
      '<script src="app.js">$RC("remote-B:1","remote-S:1")</script>' +
      '<script type="application/json">{"helper":"$RC"}</script>' +
      '<template id="b&#45;shell"></template></section>' +
      '<script>$RC("remote-B:2","remote-S:2")</script>tail';
    const bytes = Buffer.from(html);
    for (const size of [1, 7, bytes.length]) {
      const chunks: Buffer[] = [];
      for (let i = 0; i < bytes.length; i += size)
        chunks.push(bytes.subarray(i, i + size));
      const frames: HTMLFrame[] = [];
      for await (const frame of Readable.from(chunks).pipe(
        htmlFrames({ includeMetadata: true, shellMarker: 'b-shell' }),
      ))
        frames.push(frame);
      expect(frames.map((frame) => frame.html).join('')).toBe(html);
      expect(
        frames
          .filter((frame) => frame.hasShellMarker)
          .map((frame) => frame.html),
      ).toEqual([expect.stringContaining('<section>')]);
      const isolate = createReactStreamScriptIsolator('a', 'remote-');
      expect(
        frames.map((frame) => isolate(frame.html, frame.scripts)).join(''),
      ).toBe(isolateReactStreamScripts(html, 'a', 'remote-'));
      expect(
        frames
          .flatMap((frame) => frame.scripts)
          .map((script) => script.executable),
      ).toEqual([true, false, false, true]);
    }
  });

  it('counts only the pending frame and finds a shell marker crossing chunk boundaries', async () => {
    const fragment = '<p>中🌿</p>';
    const bytes = Buffer.byteLength(fragment);
    expect(await collectHTML(fragment.repeat(50), bytes)).toHaveLength(50);
    await expect(collectHTML(fragment, bytes - 1)).rejects.toThrow(
      'exceeds limit',
    );
    const shell = '中🌿'.repeat(20) + 'abababab-end';
    const chunks = Array.from(Buffer.from(shell + fragment), (byte) =>
      Buffer.from([byte]),
    );
    const parts = [];
    for await (const part of Readable.from(chunks).pipe(
      hostPieces('abababab-end', Buffer.byteLength(shell)),
    ))
      parts.push(part);
    expect(parts).toEqual([shell, fragment]);
    await expect(async () => {
      for await (const _part of Readable.from(chunks).pipe(
        hostPieces('abababab-end', Buffer.byteLength(shell) - 1),
      )) {
        /* consume */
      }
    }).rejects.toThrow('Host shell exceeds limit');
  });
});

describe('Bridge transport framing', () => {
  it('bounds each Unicode line across single-byte chunks and rejects invalid UTF-8', async () => {
    const value = { html: '中🌿'.repeat(50) };
    const line = JSON.stringify(value);
    const bytes = Buffer.from(line + '\n\n' + line + '\n');
    const stream = () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          for (const byte of bytes) controller.enqueue(Buffer.from([byte]));
          controller.close();
        },
      });
    const received = [];
    for await (const frame of readFrames(stream(), Buffer.byteLength(line)))
      received.push(frame);
    expect(received).toEqual([value, value]);
    await expect(async () => {
      for await (const _frame of readFrames(
        stream(),
        Buffer.byteLength(line) - 1,
      )) {
        /* consume */
      }
    }).rejects.toThrow('exceeds limit');
    const invalid = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(Buffer.from([0xe4, 0x0a]));
        controller.close();
      },
    });
    await expect(async () => {
      for await (const _frame of readFrames(invalid)) {
        /* consume */
      }
    }).rejects.toThrow();
  });

  it('decodes split JSON lines and rejects incomplete or oversized complete lines', async () => {
    const encoder = new TextEncoder();
    function stream(value: string) {
      return new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(value));
          controller.close();
        },
      });
    }
    const result = [];
    for await (const frame of readFrames(stream('{"type":"done"}\n')))
      result.push(frame);
    expect(result).toEqual([{ type: 'done' }]);
    await expect(async () => {
      for await (const _frame of readFrames(stream('{"type":'))) {
        /* consume */
      }
    }).rejects.toThrow('Truncated');
    await expect(async () => {
      for await (const _frame of readFrames(
        stream('{"html":"' + '中'.repeat(20) + '"}\n'),
        40,
      )) {
        /* consume */
      }
    }).rejects.toThrow('exceeds limit');
  });

  it('cancels an outstanding byte stream pull before closing its iterator', async () => {
    let release: (() => void) | undefined;
    let cancelled = false;
    async function* values() {
      yield 'first';
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      yield 'late';
    }
    const reader = byteStream(values(), () => {
      cancelled = true;
      release?.();
    }).getReader();
    expect((await reader.read()).value).toBeInstanceOf(Uint8Array);
    const pending = reader.read();
    await reader.cancel();
    await pending;
    expect(cancelled).toBe(true);
  });
});
