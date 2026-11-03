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

export type HTMLScript = {
  start: number;
  end: number;
  executable: boolean;
};

export type HTMLFrame = {
  html: string;
  scripts: HTMLScript[];
  hasShellMarker: boolean;
};

/** Preserve original markup; each output is a complete top-level HTML fragment. */
export function htmlFrames({
  maxFrameBytes = 2 * 1024 * 1024,
  includeMetadata = false,
  shellMarker,
}: {
  maxFrameBytes?: number;
  includeMetadata?: boolean;
  shellMarker?: string;
} = {}): Transform {
  const decoder = new StringDecoder('utf8');
  let buffer = '';
  let bufferBytes = 0;
  let base = 0;
  let scripts: HTMLScript[] = [];
  let script: { start: number; executable: boolean } | undefined;
  let hasShellMarker = false;
  const stack: string[] = [];
  let ending = false;
  let output: Transform;
  const emit = (end: number) => {
    const count = end - base;
    if (count <= 0) return;
    const html = buffer.slice(0, count);
    const bytes = Buffer.byteLength(html);
    if (bytes > maxFrameBytes) throw Error('HTML frame exceeds limit');
    buffer = buffer.slice(count);
    bufferBytes -= bytes;
    const frame: HTMLFrame = { html, scripts, hasShellMarker };
    scripts = [];
    hasShellMarker = false;
    base = end;
    output.push(includeMetadata ? frame : html);
  };
  const parser = new Parser(
    {
      onopentag(name, attributes) {
        if (stack.length === 0) emit(parser.startIndex);
        if (includeMetadata) {
          if (name === 'script') {
            script = {
              start: parser.endIndex + 1 - base,
              executable:
                !attributes.src &&
                (!attributes.type ||
                  attributes.type === 'text/javascript' ||
                  attributes.type === 'application/javascript'),
            };
          }
          if (shellMarker && name === 'template' && attributes.id) {
            // Framing/script attributes remain raw. Decode an entity-bearing
            // marker attribute with the same parser semantics as before, only
            // for this exceptional opening tag (never reparse the whole frame).
            hasShellMarker ||= attributes.id.includes('&')
              ? containsShellMarker(
                  buffer.slice(
                    parser.startIndex - base,
                    parser.endIndex + 1 - base,
                  ),
                  shellMarker,
                )
              : attributes.id === shellMarker;
          }
        }
        stack.push(name);
      },
      onclosetag(name, implied) {
        if (ending && stack.length)
          throw Error('Incomplete HTML at stream end');
        if (implied && !VOID_ELEMENTS.has(name)) {
          throw Error('HTML requires implicit tag repair');
        }
        if (stack.pop() !== name) throw Error('Unbalanced HTML fragment');
        if (name === 'script' && script) {
          scripts.push({ ...script, end: parser.startIndex - base });
          script = undefined;
        }
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
        bufferBytes += Buffer.byteLength(text);
        parser.write(text);
        if (bufferBytes > maxFrameBytes)
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
        bufferBytes += Buffer.byteLength(tail);
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
  let bufferBytes = 0;
  let searchFrom = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      const text = decoder.decode(next.value, { stream: true });
      buffer += text;
      bufferBytes += Buffer.byteLength(text);
      let index: number;
      while ((index = buffer.indexOf('\n', searchFrom)) >= 0) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        const bytes = Buffer.byteLength(line);
        bufferBytes -= bytes + 1;
        searchFrom = 0;
        if (bytes > maxFrameBytes) throw Error('Protocol frame exceeds limit');
        if (line) yield JSON.parse(line);
      }
      searchFrom = buffer.length;
      if (bufferBytes > maxFrameBytes)
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

/** A producer-owned marker identifies the complete shell, even across byte chunks. */
export function containsShellMarker(html: string, id: string): boolean {
  let found = false;
  const parser = new Parser({
    onopentag(name, attributes) {
      if (name === 'template' && attributes.id === id) found = true;
    },
  });
  parser.end(html);
  return found;
}
