import { describe, expect, it } from '@rstest/core';
import { PassThrough, Readable } from 'node:stream';
import { byteStream, htmlFrames, readFrames } from './frames.server';
import { hostPieces } from './host-stream';

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
});

describe('Bridge transport framing', () => {
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
