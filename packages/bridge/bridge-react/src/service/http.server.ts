import {
  BRIDGE_PRODUCER_PROTOCOL,
  normalizeBridgeSSR,
} from '../ssr-stream/producer.server';
import { channel } from '../ssr-stream/message-channel.server';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
  BridgeSSRMessage,
  BridgeSSRMessageResult,
} from '../types';
import {
  createBridgeServiceCache,
  type BridgeServiceCacheOptions,
} from './cache.server';
import {
  CONTENT_TYPE,
  DEFAULT_BUFFER_BYTES,
  BUFFER_HEADER,
  error,
  deferred,
  limits,
  validateStylesheets,
  validateServiceRequest,
  type Frame,
} from './protocol';
export type { BridgeServiceCacheOptions } from './cache.server';
export interface BridgeServiceHandlerOptions {
  buildVersion: string | ((requested: string) => string | Promise<string>);
  onError?: (error: Error) => void;
  authorize?: (request: Request) => void | Response | Promise<void | Response>;
  /** Validate deployment-specific module and page constraints before cache lookup. */
  validate?: (
    info: BridgeSSRRequest,
    request: Request,
  ) => void | Response | Promise<void | Response>;
  render(
    info: BridgeSSRRequest,
  ): Promise<BridgeSSRResult | BridgeSSRMessageResult>;
  /** Reuse completed renders for identical inputs within this handler. */
  cache?: BridgeServiceCacheOptions;
  maxFrameBytes?: number;
  maxBufferedBytes?: number;
}

/** Adapter for a service running the same Bridge Node provider as a local Host. */
export function createBridgeServiceHandler(
  options: BridgeServiceHandlerOptions,
) {
  const bound = limits(options);
  if (!options.buildVersion)
    throw new Error('Bridge service buildVersion is required.');
  const cache = options.cache && createBridgeServiceCache(options.cache);
  return async (request: Request): Promise<Response> => {
    const denied = await options.authorize?.(request);
    if (denied) return denied;
    request.signal.throwIfAborted();
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
        input?.protocol !== BRIDGE_PRODUCER_PROTOCOL ||
        typeof input.buildVersion !== 'string' ||
        !input.buildVersion ||
        typeof input.request?.instanceId !== 'string' ||
        typeof input.request?.identifierPrefix !== 'string' ||
        typeof input.request?.url !== 'string' ||
        !input.request?.props ||
        typeof input.request.props !== 'object' ||
        Array.isArray(input.request.props)
      )
        throw new Error('Invalid Bridge service request.');
      validateServiceRequest(input.request);
    } catch {
      return new Response('Invalid Bridge service request', { status: 400 });
    }
    const invalid = await options.validate?.(
      { ...input.request, signal: request.signal },
      request,
    );
    if (invalid) return invalid;
    const buildVersion =
      typeof options.buildVersion === 'function'
        ? await options.buildVersion(input.buildVersion)
        : options.buildVersion;
    if (!buildVersion) throw Error('Service deployment has no build identity.');
    if (input.buildVersion !== buildVersion)
      return new Response('Bridge service buildVersion mismatch', {
        status: 409,
      });
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
      if (!request.signal.aborted) options.onError?.(error(reason));
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
            if (!('protocol' in value)) void value.snapshot?.catch(() => {});
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
      if (!('protocol' in result)) void result.snapshot?.catch(() => {});
      if (!('protocol' in result))
        void result.hydration?.snapshot.catch(() => {});
      if (ended) {
        result.abort(aborter.signal.reason);
        throw error(aborter.signal.reason);
      }
      validateStylesheets(result.stylesheets);
      result = await Promise.race([
        normalizeBridgeSSR(
          result,
          { ...input.request, signal: aborter.signal },
          {
            maxFrameBytes: Math.min(2 * 1024 * 1024, bound.frame),
            maxBufferedBytes: bound.buffer,
          },
        ),
        interrupted.promise,
      ]);
      if (ended) throw error(aborter.signal.reason);
      const progressive = result.hydration === 'progressive';
      send({
        type: 'meta',
        protocol: BRIDGE_PRODUCER_PROTOCOL,
        buildVersion,
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
