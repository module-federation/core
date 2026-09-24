import { Parser } from 'htmlparser2';
import { Transform } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/** Preserve original markup; each output is a complete top-level HTML fragment. */
export function htmlFrames({
  maxFrameBytes = 2 * 1024 * 1024,
} = {}): Transform {
  const decoder = new StringDecoder('utf8');
  let buffer = '';
  let base = 0;
  const stack: string[] = [];
  let ending = false;
  let output: Transform;
  const emit = (end: number) => {
    const count = end - base;
    if (count <= 0) return;
    const html = buffer.slice(0, count);
    if (Buffer.byteLength(html) > maxFrameBytes)
      throw Error('HTML frame exceeds limit');
    buffer = buffer.slice(count);
    base = end;
    output.push(html);
  };
  const parser = new Parser(
    {
      onopentag(name) {
        if (stack.length === 0) emit(parser.startIndex);
        stack.push(name);
      },
      onclosetag(name, implied) {
        if (ending && stack.length)
          throw Error('Incomplete HTML at stream end');
        if (implied && !VOID_ELEMENTS.has(name)) {
          throw Error('HTML requires implicit tag repair');
        }
        if (stack.pop() !== name) throw Error('Unbalanced HTML fragment');
        if (stack.length === 0) emit(parser.endIndex + 1);
      },
      oncomment() {
        if (stack.length === 0 && !ending) emit(parser.endIndex + 1);
      },
    },
    { decodeEntities: false },
  );
  output = new Transform({
    readableObjectMode: true,
    transform(chunk, _encoding, callback) {
      try {
        const text = decoder.write(chunk);
        buffer += text;
        parser.write(text);
        if (Buffer.byteLength(buffer) > maxFrameBytes)
          throw Error('HTML frame exceeds limit');
        callback();
      } catch (error) {
        callback(error as Error);
      }
    },
    flush(callback) {
      try {
        const tail = decoder.end();
        buffer += tail;
        parser.write(tail);
        ending = true;
        parser.end();
        if (stack.length) throw Error('Incomplete HTML at stream end');
        // Trailing text is a valid React Fragment. Incomplete lexical markup is not.
        if (buffer.includes('<')) throw Error('Incomplete HTML at stream end');
        emit(base + buffer.length);
        callback();
      } catch (error) {
        callback(error as Error);
      }
    },
  });
  return output;
}

export async function* readFrames(
  stream: ReadableStream<Uint8Array>,
  maxFrameBytes = 3 * 1024 * 1024,
): AsyncGenerator<unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let buffer = '';
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      buffer += decoder.decode(next.value, { stream: true });
      let index: number;
      while ((index = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        if (Buffer.byteLength(line) > maxFrameBytes)
          throw Error('Protocol frame exceeds limit');
        if (line) yield JSON.parse(line);
      }
      if (Buffer.byteLength(buffer) > maxFrameBytes)
        throw Error('Protocol frame exceeds limit');
    }
    buffer += decoder.decode();
    if (buffer.trim()) throw Error('Truncated protocol frame');
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function byteStream(
  iterator: AsyncGenerator<string | Uint8Array>,
  onCancel: () => void = () => {},
): ReadableStream<Uint8Array> {
  let cancelled = false;
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await iterator.next();
        if (cancelled) return;
        if (next.done) controller.close();
        else
          controller.enqueue(
            typeof next.value === 'string'
              ? encoder.encode(next.value)
              : next.value,
          );
      } catch (error) {
        if (!cancelled) controller.error(error);
      }
    },
    async cancel() {
      cancelled = true;
      onCancel();
      await iterator.return(undefined).catch(() => {});
    },
  });
}
