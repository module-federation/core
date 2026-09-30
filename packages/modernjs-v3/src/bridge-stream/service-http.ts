import type {
  BridgeSSRRequest,
  BridgeSSRResult,
} from '@module-federation/bridge-react/ssr';

export const BRIDGE_SERVICE_PROTOCOL = 'mf-bridge-service/1';
const CONTENT_TYPE = 'application/x-ndjson';
const DEFAULT_FRAME_BYTES = 1024 * 1024;
const DEFAULT_BUFFER_BYTES = 4 * 1024 * 1024;

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
  render(info: BridgeSSRRequest): Promise<BridgeSSRResult>;
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
  snapshot?: unknown;
  shellMarker?: string;
};
type Frame =
  | Meta
  | { type: 'html'; bytes: string }
  | { type: 'update'; value: unknown }
  | { type: 'data'; snapshot: unknown }
  | { type: 'done' }
  | { type: 'error'; message: string };

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

/** Zero internal HWM lets HTML and data share one exact pending-byte budget. */
function channel<T>(
  budget: { bytes: number; limit: number },
  cancel: (reason: unknown) => void,
) {
  const queue: { value: T; bytes: number }[] = [];
  let controller!: ReadableStreamDefaultController<T>;
  let waiting: (() => void) | undefined;
  let ended = false;
  let failed = false;
  const flush = () => {
    if (!waiting) return;
    if (queue.length) {
      const next = queue.shift()!;
      budget.bytes -= next.bytes;
      controller.enqueue(next.value);
    } else if (ended) controller.close();
    else return;
    const resolve = waiting;
    waiting = undefined;
    resolve();
  };
  const discard = () => {
    for (const item of queue) budget.bytes -= item.bytes;
    queue.length = 0;
  };
  const stream = new ReadableStream<T>(
    {
      start(value) {
        controller = value;
      },
      pull() {
        return new Promise<void>((resolve) => {
          waiting = resolve;
          flush();
        });
      },
      cancel(reason) {
        failed = true;
        discard();
        waiting?.();
        waiting = undefined;
        cancel(reason);
      },
    },
    { highWaterMark: 0 },
  );
  return {
    stream,
    push(value: T, bytes: number) {
      if (failed || ended) throw new Error('Bridge service stream is closed.');
      if (budget.bytes + bytes > budget.limit)
        throw new Error('Bridge service pending buffer exceeds limit.');
      budget.bytes += bytes;
      queue.push({ value, bytes });
      flush();
    },
    close() {
      if (failed || ended) return;
      ended = true;
      flush();
    },
    fail(reason: unknown) {
      if (failed) return;
      failed = true;
      discard();
      controller.error(reason);
      waiting?.();
      waiting = undefined;
    },
  };
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

/** HTTP carries bytes and opaque data; React framing remains entirely in Host. */
export async function fetchBridgeService(
  info: BridgeSSRRequest,
  options: BridgeServiceFetchOptions,
): Promise<BridgeSSRResult> {
  const endpoint = new URL(options.url);
  if (!['http:', 'https:'].includes(endpoint.protocol))
    throw new Error('Bridge service URL must use HTTP or HTTPS.');
  if (!options.revision)
    throw new Error('Bridge service revision is required.');
  const bound = limits(options);
  const mode = options.hydrationMode ?? 'progressive';
  const aborter = new AbortController();
  const initial = deferred<BridgeSSRResult>();
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
    html.fail(failure);
    updates.fail(failure);
    snapshot.reject(failure);
    initial.reject(failure);
  };
  const html = channel<Uint8Array>(budget, abort);
  const updates = channel<unknown>(budget, abort);
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
        headers: { 'content-type': 'application/json', accept: CONTENT_TYPE },
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
          if (
            frame.hydration === 'progressive' &&
            (!Object.hasOwn(frame, 'snapshot') ||
              typeof frame.shellMarker !== 'string' ||
              !frame.shellMarker)
          )
            throw new Error(
              'Bridge service progressive metadata is incomplete.',
            );
          meta = frame;
          if (meta.hydration === 'progressive')
            snapshot.reject(
              new Error(
                'Progressive Bridge service has no final snapshot; use hydration.snapshot or request complete hydration.',
              ),
            );
          initial.resolve({
            revision: meta.revision,
            stylesheets: meta.stylesheets,
            stream: html.stream,
            snapshot: snapshot.promise,
            hydration:
              meta.hydration === 'progressive'
                ? {
                    snapshot: Promise.resolve(meta.snapshot),
                    shellMarker: meta.shellMarker!,
                    updates: updates.stream,
                  }
                : undefined,
            abort,
          });
        } else if (frame.type === 'html') {
          if (
            data ||
            typeof frame.bytes !== 'string' ||
            !frame.bytes ||
            !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
              frame.bytes,
            )
          )
            throw new Error('Invalid Bridge service HTML frame.');
          const bytes = Buffer.from(frame.bytes, 'base64');
          if (bytes.toString('base64') !== frame.bytes)
            throw new Error('Invalid Bridge service base64 bytes.');
          html.push(bytes, bytes.byteLength);
        } else if (frame.type === 'update') {
          if (
            meta.hydration !== 'progressive' ||
            !Object.hasOwn(frame, 'value')
          )
            throw new Error('Unexpected Bridge service update.');
          updates.push(
            frame.value,
            Buffer.byteLength(JSON.stringify(frame.value)),
          );
        } else if (frame.type === 'data') {
          if (
            meta.hydration !== 'complete' ||
            data ||
            !Object.hasOwn(frame, 'snapshot')
          )
            throw new Error('Unexpected Bridge service snapshot.');
          data = true;
          snapshot.resolve(frame.snapshot);
        } else if (frame.type === 'done') {
          if (meta.hydration === 'complete' && !data)
            throw new Error('Bridge service ended without a snapshot.');
          done = true;
        } else if (frame.type === 'error') {
          throw new Error(
            `Bridge service render failed: ${String(frame.message)}`,
          );
        } else throw new Error('Unexpected Bridge service frame.');
      }
      if (!done) throw new Error('Truncated Bridge service response.');
      cleanup();
      html.close();
      updates.close();
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
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST')
      return new Response('Method not allowed', { status: 405 });
    let input: any;
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
        input = JSON.parse(
          new TextDecoder('utf-8', { fatal: true }).decode(
            Buffer.concat(chunks),
          ),
        );
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
    const aborter = new AbortController();
    const interrupted = deferred<never>();
    let result: BridgeSSRResult | undefined;
    let htmlReader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    let updateReader: ReadableStreamDefaultReader<unknown> | undefined;
    let ended = false;
    const cleanup = () => request.signal.removeEventListener('abort', onAbort);
    const abort = (
      reason: unknown = new Error('Bridge service client disconnected.'),
    ) => {
      if (ended) return;
      ended = true;
      cleanup();
      aborter.abort(reason);
      interrupted.reject(reason);
      try {
        result?.abort(reason);
      } catch {
        /* Keep releasing transport readers. */
      }
      if (htmlReader) void htmlReader.cancel(reason).catch(() => {});
      else if (result) void result.stream.cancel(reason).catch(() => {});
      if (updateReader) void updateReader.cancel(reason).catch(() => {});
      else if (result?.hydration)
        void result.hydration.updates.cancel(reason).catch(() => {});
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
      output.push(Buffer.from(`${text}\n`), Buffer.byteLength(text) + 1);
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
      void result.hydration?.snapshot.catch(() => {});
      if (ended) {
        result.abort(aborter.signal.reason);
        throw error(aborter.signal.reason);
      }
      if (result.revision !== options.revision)
        throw new Error('Bridge producer revision mismatch.');
      validateStylesheets(result.stylesheets);
      const progressive =
        input.hydration === 'progressive' && !!result.hydration;
      const initial = progressive
        ? await Promise.race([result.hydration!.snapshot, interrupted.promise])
        : undefined;
      if (ended) throw error(aborter.signal.reason);
      if (
        progressive &&
        (!result.hydration!.shellMarker || initial === undefined)
      )
        throw new Error('Incomplete producer hydration metadata.');
      send({
        type: 'meta',
        protocol: BRIDGE_SERVICE_PROTOCOL,
        revision: options.revision,
        identifierPrefix: input.request.identifierPrefix,
        hydration: progressive ? 'progressive' : 'complete',
        stylesheets: result.stylesheets,
        ...(progressive
          ? { snapshot: initial, shellMarker: result.hydration!.shellMarker }
          : {}),
      });
      htmlReader = result.stream.getReader();
      updateReader = result.hydration?.updates.getReader();
      const source = result;
      void (async () => {
        try {
          await Promise.all([
            (async () => {
              // Split arbitrary renderer chunks without decoding or corrupting UTF-8.
              const chunkSize = Math.max(
                1,
                Math.floor(((bound.frame - 40) * 3) / 4),
              );
              while (true) {
                const next = await htmlReader!.read();
                if (next.done) break;
                for (let i = 0; i < next.value.length; i += chunkSize)
                  send({
                    type: 'html',
                    bytes: Buffer.from(
                      next.value.subarray(i, i + chunkSize),
                    ).toString('base64'),
                  });
              }
            })(),
            (async () => {
              if (!updateReader) return;
              while (true) {
                const next = await updateReader.read();
                if (next.done) break;
                if (progressive) send({ type: 'update', value: next.value });
              }
            })(),
          ]);
          if (!progressive)
            send({
              type: 'data',
              snapshot: await Promise.race([
                source.snapshot,
                interrupted.promise,
              ]),
            });
          send({ type: 'done' });
          ended = true;
          cleanup();
          output.close();
        } catch (reason) {
          abort(reason);
        } finally {
          htmlReader?.releaseLock();
          updateReader?.releaseLock();
        }
      })();
      return new Response(output.stream, {
        headers: {
          'content-type': `${CONTENT_TYPE}; charset=utf-8`,
          'cache-control': 'no-store',
          'x-accel-buffering': 'no',
        },
      });
    } catch (reason) {
      abort(reason);
      return new Response('Bridge service rendering failed', { status: 500 });
    }
  };
}
