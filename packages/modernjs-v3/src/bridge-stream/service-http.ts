import {
  BRIDGE_PRODUCER_PROTOCOL,
  normalizeBridgeSSR,
} from './producer.server';
import { channel } from './message-channel.server';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
  BridgeSSRMessage,
  BridgeSSRMessageResult,
} from '@module-federation/bridge-react/ssr';
import {
  createBridgeServiceCache,
  type BridgeServiceCacheOptions,
} from './service-cache.server';

export type { BridgeServiceCacheOptions } from './service-cache.server';

export const BRIDGE_SERVICE_PROTOCOL = 'mf-bridge-service/2';
const CONTENT_TYPE = 'application/x-ndjson';
const DEFAULT_FRAME_BYTES = 3 * 1024 * 1024;
const DEFAULT_BUFFER_BYTES = 4 * 1024 * 1024;
const BUFFER_HEADER = 'x-mf-bridge-buffer-bytes';

type HydrationMode = 'progressive' | 'complete';
export interface BridgeServiceFetchOptions {
  url: string;
  revision: string;
  hydrationMode?: HydrationMode;
  timeoutMs?: number;
  fetch?: typeof fetch;
  maxFrameBytes?: number;
  maxBufferedBytes?: number;
}
export interface BridgeServiceHandlerOptions {
  revision: string;
  render(
    info: BridgeSSRRequest,
  ): Promise<BridgeSSRResult | BridgeSSRMessageResult>;
  /** Reuse completed renders for identical inputs within this handler. */
  cache?: BridgeServiceCacheOptions;
  maxFrameBytes?: number;
  maxBufferedBytes?: number;
}

type Meta = {
  type: 'meta';
  protocol: typeof BRIDGE_SERVICE_PROTOCOL;
  revision: string;
  identifierPrefix: string;
  hydration: HydrationMode;
  stylesheets?: string[];
};
type Frame = Meta | BridgeSSRMessage | { type: 'error'; message: string };

function error(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  // The HTML consumer and data consumer can start at different times.
  void promise.catch(() => {});
  return { promise, resolve, reject };
}
function limits(options: {
  maxFrameBytes?: number;
  maxBufferedBytes?: number;
}) {
  const frame = options.maxFrameBytes ?? DEFAULT_FRAME_BYTES;
  const buffer = options.maxBufferedBytes ?? DEFAULT_BUFFER_BYTES;
  if (
    ![frame, buffer].every((value) => Number.isSafeInteger(value) && value > 0)
  )
    throw new Error('Bridge service byte limits must be positive integers.');
  return { frame, buffer };
}

/** Lines are bounded before decoding, including partial UTF-8 sequences. */
async function* frames(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  maxBytes: number,
): AsyncGenerator<Frame> {
  let pending = Buffer.alloc(0);
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    let offset = 0;
    while (offset < next.value.byteLength) {
      const newline = next.value.indexOf(10, offset);
      const end = newline < 0 ? next.value.byteLength : newline;
      const part = next.value.subarray(offset, end);
      if (pending.byteLength + part.byteLength > maxBytes)
        throw new Error('Bridge service frame exceeds limit.');
      pending = Buffer.concat([pending, part]);
      if (newline < 0) break;
      if (!pending.length) throw new Error('Empty Bridge service frame.');
      let frame: unknown;
      try {
        frame = JSON.parse(
          new TextDecoder('utf-8', { fatal: true }).decode(pending),
        );
      } catch {
        throw new Error('Invalid Bridge service JSON frame.');
      }
      if (!frame || typeof frame !== 'object' || Array.isArray(frame))
        throw new Error('Invalid Bridge service frame.');
      pending = Buffer.alloc(0);
      yield frame as Frame;
      offset = newline + 1;
    }
  }
  if (pending.length) throw new Error('Truncated Bridge service frame.');
}

function validateStylesheets(
  value: unknown,
): asserts value is string[] | undefined {
  if (
    value !== undefined &&
    (!Array.isArray(value) ||
      !value.every((url) => {
        if (typeof url !== 'string') return false;
        try {
          return ['http:', 'https:'].includes(new URL(url).protocol);
        } catch {
          return false;
        }
      }))
  )
    throw new Error('Invalid Bridge service stylesheets.');
}

/** Service messages are already framed and isolated by their producer. */
export async function fetchBridgeService(
  info: BridgeSSRRequest,
  options: BridgeServiceFetchOptions,
): Promise<BridgeSSRMessageResult> {
  const endpoint = new URL(options.url);
  if (!['http:', 'https:'].includes(endpoint.protocol))
    throw new Error('Bridge service URL must use HTTP or HTTPS.');
  if (!options.revision)
    throw new Error('Bridge service revision is required.');
  const bound = limits(options);
  const mode = options.hydrationMode ?? 'progressive';
  const aborter = new AbortController();
  const initial = deferred<BridgeSSRMessageResult>();
  const snapshot = deferred<unknown>();
  const budget = { bytes: 0, limit: bound.buffer };
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let settled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cleanup = () => {
    clearTimeout(timer);
    info.signal.removeEventListener('abort', onAbort);
  };
  const abort = (reason: unknown = new Error('Bridge service cancelled.')) => {
    if (settled) return;
    settled = true;
    const failure = error(reason);
    cleanup();
    aborter.abort(failure);
    void reader?.cancel(failure).catch(() => {});
    messages.fail(failure);
    snapshot.reject(failure);
    initial.reject(failure);
  };
  const messages = channel<BridgeSSRMessage>(budget, abort);
  const onAbort = () => abort(info.signal.reason);
  info.signal.addEventListener('abort', onAbort, { once: true });
  if (info.signal.aborted) onAbort();
  if (options.timeoutMs !== undefined) {
    if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)
      abort(new Error('Bridge service timeout must be positive.'));
    else if (!settled)
      timer = setTimeout(
        () => abort(new Error('Bridge service request timed out.')),
        options.timeoutMs,
      );
  }
  void (async () => {
    try {
      if (settled) return;
      const response = await (options.fetch ?? fetch)(endpoint, {
        method: 'POST',
        // Application headers stay inside the body; never forward Host cookies
        // or credentials as service HTTP request headers.
        headers: {
          'content-type': 'application/json',
          accept: CONTENT_TYPE,
          [BUFFER_HEADER]: String(bound.buffer),
        },
        signal: aborter.signal,
        redirect: 'error',
        body: JSON.stringify({
          protocol: BRIDGE_SERVICE_PROTOCOL,
          revision: options.revision,
          hydration: mode,
          request: {
            instanceId: info.instanceId,
            identifierPrefix: info.identifierPrefix,
            url: info.url,
            headers: info.headers,
            nonce: info.nonce,
            moduleName: info.moduleName,
            basename: info.basename,
            memoryRoute: info.memoryRoute,
            props: info.props,
          },
        }),
      });
      if (settled) {
        void response.body?.cancel(aborter.signal.reason).catch(() => {});
        return;
      }
      if (response.status !== 200) {
        void response.body?.cancel().catch(() => {});
        throw new Error(`Bridge service returned HTTP ${response.status}.`);
      }
      if (
        !response.headers.get('content-type')?.startsWith(CONTENT_TYPE) ||
        !response.body
      ) {
        void response.body?.cancel().catch(() => {});
        throw new Error('Bridge service did not return an NDJSON stream.');
      }
      reader = response.body.getReader();
      let meta: Meta | undefined;
      let data = false;
      let ready = false;
      let htmlReceived = false;
      let done = false;
      for await (const frame of frames(reader, bound.frame)) {
        if (done) throw new Error('Bridge service frame after done.');
        if (!meta) {
          if (
            frame.type !== 'meta' ||
            frame.protocol !== BRIDGE_SERVICE_PROTOCOL ||
            frame.revision !== options.revision ||
            frame.identifierPrefix !== info.identifierPrefix ||
            !['progressive', 'complete'].includes(frame.hydration) ||
            (mode === 'complete' && frame.hydration !== 'complete')
          )
            throw new Error('Bridge service metadata/revision mismatch.');
          validateStylesheets(frame.stylesheets);
          meta = frame;
          if (meta.hydration === 'progressive')
            snapshot.reject(
              new Error(
                'Progressive Bridge service has no final snapshot; use the ready message or request complete hydration.',
              ),
            );
          initial.resolve({
            protocol: BRIDGE_PRODUCER_PROTOCOL,
            revision: meta.revision,
            stylesheets: meta.stylesheets,
            hydration: meta.hydration,
            messages: messages.stream,
            snapshot: snapshot.promise,
            abort,
          });
        } else if (frame.type === 'html') {
          if (data || typeof frame.html !== 'string' || !frame.html)
            throw new Error('Invalid Bridge service HTML frame.');
          htmlReceived = true;
          messages.push(frame, Buffer.byteLength(JSON.stringify(frame)));
        } else if (frame.type === 'ready') {
          if (
            meta.hydration !== 'progressive' ||
            !htmlReceived ||
            ready ||
            !Object.hasOwn(frame, 'snapshot')
          )
            throw new Error('Unexpected Bridge service readiness.');
          ready = true;
          messages.push(frame, Buffer.byteLength(JSON.stringify(frame)));
        } else if (frame.type === 'update') {
          if (
            meta.hydration !== 'progressive' ||
            !ready ||
            !Object.hasOwn(frame, 'value')
          )
            throw new Error('Unexpected Bridge service update.');
          messages.push(frame, Buffer.byteLength(JSON.stringify(frame)));
        } else if (frame.type === 'data') {
          if (
            meta.hydration !== 'complete' ||
            data ||
            !Object.hasOwn(frame, 'snapshot')
          )
            throw new Error('Unexpected Bridge service snapshot.');
          data = true;
          snapshot.resolve(frame.snapshot);
          messages.push(frame, Buffer.byteLength(JSON.stringify(frame)));
        } else if (frame.type === 'done') {
          if (meta.hydration === 'complete' ? !data : !ready)
            throw new Error('Bridge service ended without hydration data.');
          done = true;
        } else if (frame.type === 'error') {
          throw new Error(
            `Bridge service render failed: ${String(frame.message)}`,
          );
        } else throw new Error('Unexpected Bridge service frame.');
      }
      if (!done) throw new Error('Truncated Bridge service response.');
      cleanup();
      messages.push({ type: 'done' }, Buffer.byteLength('{"type":"done"}'));
      messages.close();
    } catch (reason) {
      abort(reason);
    } finally {
      reader?.releaseLock();
    }
  })();
  return initial.promise;
}

/** Adapter for a service running the same Bridge Node provider as a local Host. */
export function createBridgeServiceHandler(
  options: BridgeServiceHandlerOptions,
) {
  const bound = limits(options);
  if (!options.revision)
    throw new Error('Bridge service revision is required.');
  const cache = options.cache && createBridgeServiceCache(options.cache);
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST')
      return new Response('Method not allowed', { status: 405 });
    const bufferHeader = request.headers.get(BUFFER_HEADER);
    const maxReplayBytes =
      bufferHeader === null ? DEFAULT_BUFFER_BYTES : Number(bufferHeader);
    if (
      bufferHeader !== null &&
      (!/^[1-9]\d*$/.test(bufferHeader) ||
        !Number.isSafeInteger(maxReplayBytes))
    )
      return new Response('Invalid Bridge service buffer limit', {
        status: 400,
      });
    let input: any;
    let serializedInput = '';
    try {
      const reader = request.body?.getReader();
      if (!reader) throw new Error('Missing request body.');
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          size += next.value.byteLength;
          if (size > bound.frame)
            throw new Error('Bridge service request exceeds limit.');
          chunks.push(next.value);
        }
        serializedInput = new TextDecoder('utf-8', { fatal: true }).decode(
          Buffer.concat(chunks),
        );
        input = JSON.parse(serializedInput);
      } catch (reason) {
        void reader.cancel(reason).catch(() => {});
        throw reason;
      } finally {
        reader.releaseLock();
      }
      if (
        input?.protocol !== BRIDGE_SERVICE_PROTOCOL ||
        !['progressive', 'complete'].includes(input?.hydration) ||
        typeof input.request?.instanceId !== 'string' ||
        typeof input.request?.identifierPrefix !== 'string' ||
        typeof input.request?.url !== 'string' ||
        !input.request?.props ||
        typeof input.request.props !== 'object' ||
        Array.isArray(input.request.props)
      )
        throw new Error('Invalid Bridge service request.');
    } catch {
      return new Response('Invalid Bridge service request', { status: 400 });
    }
    if (input.revision !== options.revision)
      return new Response('Bridge service revision mismatch', { status: 409 });
    // Keep all render inputs, including instance identity, headers and nonce.
    // A cache hit is a replay of this exact render, not a new instance with IDs
    // rewritten in its opaque HTML or hydration data.
    // Re-serializing parsed JSON would collapse observable values such as -0
    // and overflowing numeric literals into 0/null for arbitrary producers.
    const cacheKey = cache?.key(serializedInput);
    // Wire bytes conservatively bound all decoded HTML and update bytes. Only
    // replay a transcript that fits even before the consumer starts reading.
    // Larger renders retain the live transport's existing buffering behavior.
    const cached = cacheKey && cache?.get(cacheKey, maxReplayBytes);
    const responseHeaders = {
      'content-type': `${CONTENT_TYPE}; charset=utf-8`,
      // The POST body selects the representation. An intermediary's ordinary
      // URL cache cannot safely reuse it; the render cache above is independent.
      'cache-control': 'no-store',
      'x-accel-buffering': 'no',
      ...(cache ? { 'x-mf-bridge-cache': cached ? 'hit' : 'miss' } : {}),
    };
    if (cached) {
      let index = 0;
      let controller: ReadableStreamDefaultController<Uint8Array>;
      const cleanup = () => request.signal.removeEventListener('abort', abort);
      const abort = () => {
        cleanup();
        controller.error(request.signal.reason);
      };
      const replay = new ReadableStream<Uint8Array>(
        {
          start(value) {
            controller = value;
            request.signal.addEventListener('abort', abort, { once: true });
            if (request.signal.aborted) abort();
          },
          pull(value) {
            if (index < cached.length) value.enqueue(cached[index++]);
            if (index === cached.length) {
              cleanup();
              value.close();
            }
          },
          cancel: cleanup,
        },
        { highWaterMark: 0 },
      );
      return new Response(replay, { headers: responseHeaders });
    }
    let recording: Uint8Array[] | undefined = cache ? [] : undefined;
    let recordedBytes = 0;
    const aborter = new AbortController();
    const interrupted = deferred<never>();
    let result: BridgeSSRResult | BridgeSSRMessageResult | undefined;
    let messageReader:
      | ReadableStreamDefaultReader<BridgeSSRMessage>
      | undefined;
    let ended = false;
    const cleanup = () => request.signal.removeEventListener('abort', onAbort);
    const abort = (
      reason: unknown = new Error('Bridge service client disconnected.'),
    ) => {
      if (ended) return;
      ended = true;
      recording = undefined;
      cleanup();
      aborter.abort(reason);
      interrupted.reject(reason);
      try {
        result?.abort(reason);
      } catch {
        /* Keep releasing transport readers. */
      }
      if (messageReader) void messageReader.cancel(reason).catch(() => {});
      else if (result && 'messages' in result)
        void result.messages.cancel(reason).catch(() => {});
      else if (result) {
        void result.stream.cancel(reason).catch(() => {});
        void result.hydration?.updates.cancel(reason).catch(() => {});
      }
      output.fail(error(reason));
    };
    const output = channel<Uint8Array>(
      { bytes: 0, limit: bound.buffer },
      abort,
    );
    const onAbort = () => abort(request.signal.reason);
    request.signal.addEventListener('abort', onAbort, { once: true });
    if (request.signal.aborted) onAbort();
    const send = (frame: Frame) => {
      const text = JSON.stringify(frame);
      if (Buffer.byteLength(text) > bound.frame)
        throw new Error('Bridge service frame exceeds limit.');
      const requiredField =
        frame.type === 'update'
          ? 'value'
          : frame.type === 'data' || frame.type === 'ready'
            ? 'snapshot'
            : undefined;
      // Opaque producer values may be undefined, functions, symbols, or expose
      // toJSON(). Check their actual wire representation before recording it;
      // JSON can silently omit a required field without throwing.
      if (requiredField && !Object.hasOwn(JSON.parse(text), requiredField))
        throw new Error(
          `Bridge service ${frame.type} frame lost its ${requiredField} during serialization.`,
        );
      const bytes = Buffer.from(`${text}\n`);
      output.push(bytes, bytes.byteLength);
      if (recording && cache) {
        recordedBytes += bytes.byteLength;
        if (recordedBytes > cache.maxEntryBytes) recording = undefined;
        else recording.push(Buffer.from(bytes));
      }
    };
    try {
      if (ended) throw error(request.signal.reason);
      const rendering = options.render({
        ...input.request,
        signal: aborter.signal,
      });
      void rendering.then(
        (value) => {
          if (ended) {
            void value.snapshot.catch(() => {});
            if (!('protocol' in value))
              void value.hydration?.snapshot.catch(() => {});
            try {
              value.abort(aborter.signal.reason);
            } catch {
              /* Already aborted. */
            }
          }
        },
        () => {},
      );
      result = await Promise.race([rendering, interrupted.promise]);
      void result.snapshot.catch(() => {});
      if (!('protocol' in result))
        void result.hydration?.snapshot.catch(() => {});
      if (ended) {
        result.abort(aborter.signal.reason);
        throw error(aborter.signal.reason);
      }
      if (result.revision !== options.revision)
        throw new Error('Bridge producer revision mismatch.');
      validateStylesheets(result.stylesheets);
      result = await Promise.race([
        normalizeBridgeSSR(
          result,
          { ...input.request, signal: aborter.signal },
          {
            hydrationMode: input.hydration,
            maxFrameBytes: Math.min(2 * 1024 * 1024, bound.frame),
            maxBufferedBytes: bound.buffer,
          },
        ),
        interrupted.promise,
      ]);
      if (ended) throw error(aborter.signal.reason);
      const progressive =
        input.hydration === 'progressive' && result.hydration === 'progressive';
      send({
        type: 'meta',
        protocol: BRIDGE_SERVICE_PROTOCOL,
        revision: options.revision,
        identifierPrefix: input.request.identifierPrefix,
        hydration: progressive ? 'progressive' : 'complete',
        stylesheets: result.stylesheets,
      });
      messageReader = result.messages.getReader();
      const source = result;
      void (async () => {
        try {
          let ready = false;
          let data = false;
          let done = false;
          let htmlReceived = false;
          while (true) {
            const next = await Promise.race([
              messageReader!.read(),
              interrupted.promise,
            ]);
            if (next.done) break;
            if (done) throw Error('Bridge producer message after done');
            const message = next.value;
            if (message.type === 'html') {
              if (data || typeof message.html !== 'string' || !message.html)
                throw Error('Invalid Bridge producer HTML message');
              htmlReceived = true;
              send(message);
            } else if (message.type === 'ready') {
              if (source.hydration !== 'progressive' || !htmlReceived || ready)
                throw Error('Unexpected Bridge producer readiness');
              ready = true;
              if (progressive) send(message);
            } else if (message.type === 'update') {
              if (source.hydration !== 'progressive' || !ready)
                throw Error('Unexpected Bridge producer update');
              if (progressive) send(message);
            } else if (message.type === 'data') {
              if (source.hydration !== 'complete' || data)
                throw Error('Unexpected Bridge producer snapshot');
              data = true;
              send(message);
            } else if (message.type === 'done') {
              if (source.hydration === 'progressive' ? !ready : !data)
                throw Error('Bridge producer ended without hydration data');
              done = true;
            } else throw Error('Unexpected Bridge producer message');
          }
          if (!done) throw Error('Truncated Bridge producer messages');
          if (!progressive && !data)
            send({
              type: 'data',
              snapshot: await Promise.race([
                source.snapshot,
                interrupted.promise,
              ]),
            });
          send({ type: 'done' });
          // Cache only a complete, successful transcript of producer-prepared messages.
          if (cache && cacheKey && recording) cache.set(cacheKey, recording);
          recording = undefined;
          ended = true;
          cleanup();
          output.close();
          try {
            source.abort();
          } catch {
            // Renderer cleanup cannot invalidate a completed response or cache.
          }
        } catch (reason) {
          abort(reason);
        } finally {
          messageReader?.releaseLock();
        }
      })();
      return new Response(output.stream, {
        headers: responseHeaders,
      });
    } catch (reason) {
      abort(reason);
      return new Response('Bridge service rendering failed', { status: 500 });
    }
  };
}
