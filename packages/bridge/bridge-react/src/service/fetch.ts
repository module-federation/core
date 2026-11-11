import type {
  BridgeSSRRequest,
  BridgeSSRMessage,
  BridgeSSRMessageResult,
} from '../types';
import { channel } from '../ssr-stream/message-channel.server';
import {
  BRIDGE_PRODUCER_PROTOCOL,
  CONTENT_TYPE,
  BUFFER_HEADER,
  error,
  deferred,
  limits,
  frames,
  validateStylesheets,
  validateServiceRequest,
  type Meta,
} from './protocol';
export interface BridgeServiceFetchOptions {
  url: string;
  buildVersion: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
  serviceHeaders?: Record<string, string>;
  maxFrameBytes?: number;
  maxBufferedBytes?: number;
}
/** Service messages are already framed and isolated by their producer. */
export async function fetchBridgeService(
  info: BridgeSSRRequest,
  options: BridgeServiceFetchOptions,
): Promise<BridgeSSRMessageResult> {
  validateServiceRequest(info);
  const endpoint = new URL(options.url);
  if (!['http:', 'https:'].includes(endpoint.protocol))
    throw new Error('Bridge service URL must use HTTP or HTTPS.');
  if (!options.buildVersion)
    throw new Error('Bridge service buildVersion is required.');
  const bound = limits(options);
  const aborter = new AbortController();
  const initial = deferred<BridgeSSRMessageResult>();
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
    initial.reject(failure);
  };
  const messages = channel<BridgeSSRMessage>(budget, abort);
  const onAbort = () => abort(info.signal.reason);
  info.signal.addEventListener('abort', onAbort, { once: true });
  if (info.signal.aborted) onAbort();
  const timeoutMs = options.timeoutMs ?? 30000;
  {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0)
      abort(new Error('Bridge service timeout must be positive.'));
    else if (!settled)
      timer = setTimeout(
        () => abort(new Error('Bridge service request timed out.')),
        timeoutMs,
      );
  }
  const transfer = (async () => {
    try {
      if (settled) return;
      const response = await (options.fetch ?? fetch)(endpoint, {
        method: 'POST',
        // Application headers stay inside the body; never forward Host cookies
        // or credentials as service HTTP request headers.
        headers: {
          ...options.serviceHeaders,
          'content-type': 'application/json',
          accept: CONTENT_TYPE,
          [BUFFER_HEADER]: String(bound.buffer),
        },
        signal: aborter.signal,
        redirect: 'error',
        body: JSON.stringify(
          {
            protocol: BRIDGE_PRODUCER_PROTOCOL,
            buildVersion: options.buildVersion,
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
          },
          (_key, value) => {
            if (
              typeof value === 'function' ||
              typeof value === 'symbol' ||
              typeof value === 'bigint' ||
              (typeof value === 'number' && !Number.isFinite(value))
            )
              throw Error('Service props must be JSON serializable.');
            return value;
          },
        ),
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
            frame.protocol !== BRIDGE_PRODUCER_PROTOCOL ||
            frame.buildVersion !== options.buildVersion ||
            frame.identifierPrefix !== info.identifierPrefix ||
            !['progressive', 'complete'].includes(frame.hydration)
          )
            throw new Error('Bridge service metadata/buildVersion mismatch.');
          validateStylesheets(frame.stylesheets);
          meta = frame;
          initial.resolve({
            protocol: BRIDGE_PRODUCER_PROTOCOL,
            stylesheets: meta.stylesheets,
            hydration: meta.hydration,
            messages: messages.stream,
            abort,
          });
        } else if (frame.type === 'html') {
          if (data || typeof frame.html !== 'string' || !frame.html)
            throw new Error('Invalid Bridge service HTML frame.');
          htmlReceived = true;
          messages.push(
            frame,
            new TextEncoder().encode(JSON.stringify(frame)).byteLength,
          );
        } else if (frame.type === 'ready') {
          if (
            meta.hydration !== 'progressive' ||
            !htmlReceived ||
            ready ||
            !Object.hasOwn(frame, 'snapshot')
          )
            throw new Error('Unexpected Bridge service readiness.');
          ready = true;
          messages.push(
            frame,
            new TextEncoder().encode(JSON.stringify(frame)).byteLength,
          );
        } else if (frame.type === 'update') {
          if (
            meta.hydration !== 'progressive' ||
            !ready ||
            !Object.hasOwn(frame, 'value')
          )
            throw new Error('Unexpected Bridge service update.');
          messages.push(
            frame,
            new TextEncoder().encode(JSON.stringify(frame)).byteLength,
          );
        } else if (frame.type === 'data') {
          if (
            meta.hydration !== 'complete' ||
            data ||
            !Object.hasOwn(frame, 'snapshot')
          )
            throw new Error('Unexpected Bridge service snapshot.');
          data = true;
          messages.push(
            frame,
            new TextEncoder().encode(JSON.stringify(frame)).byteLength,
          );
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
      messages.push({ type: 'done' }, 15);
      messages.close();
      settled = true;
    } catch (reason) {
      abort(reason);
    } finally {
      reader?.releaseLock();
    }
  })();
  info.work?.track(transfer);
  return initial.promise;
}
