import { randomUUID } from 'node:crypto';
import { PassThrough, type Readable } from 'node:stream';
import { once } from 'node:events';
import type { BridgeSSRContextValue, BridgeSSRReservation } from '../ssr';
import type {
  BridgeProviderInstance,
  BridgeSSRRenderParams,
  BridgeSSRMessage,
  BridgeSSRMessageResult,
  BridgeSSRRequest,
} from '../types';
import { bridgeStreamBootstrap } from './bootstrap';
import { hostPieces } from './host-stream';
import { bridgeIdentifierPrefix } from './identity.server';
import { normalizeBridgeSSR } from './producer.server';
import { createReactStreamScriptIsolator } from './script-isolation.server';
import {
  escapeHTMLAttribute,
  serializeBridgeFrame,
  type BridgeStreamFrame,
} from './protocol';

export interface BridgeSSRControllerOptions {
  request: Request;
  nonce?: string;
  shellEndMarker: string;
  identifierPrefix: string;
  timeoutMs?: number;
  /** Retain original producer tasks after cancellation until they settle. */
  work?: BridgeSSRRequest['work'];
  /** Report the original producer failure on the server without exposing it in HTML. */
  onError?: (error: unknown, instanceId: string) => void;
}

type Activation = {
  factory: () => BridgeProviderInstance | Promise<BridgeProviderInstance>;
  params: BridgeSSRRenderParams;
};
type Job = {
  reservation: BridgeSSRReservation;
  controller: AbortController;
  prefix: string;
  stylesheets: string[];
  activated: boolean;
  ready: Promise<BridgeSSRMessageResult | undefined>;
  done?: Promise<void>;
  clear(): void;
};

function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () =>
      reject(signal.reason || Error('Bridge rendering aborted'));
    if (signal.aborted) {
      // The caller may already have started work. Observe its eventual rejection.
      void promise.catch(() => {});
      abort();
      return;
    }
    signal.addEventListener('abort', abort, { once: true });
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener('abort', abort));
  });
}

/** Framework-independent composition of one Host stream and its Bridge roots. */
export function createBridgeSSRController(options: BridgeSSRControllerOptions) {
  if (!options.shellEndMarker || !options.identifierPrefix) {
    throw Error(
      'Bridge SSR requires a Host shell marker and identifier prefix',
    );
  }
  const timeoutMs = options.timeoutMs ?? 30000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw Error('Bridge SSR timeout must be a positive integer');
  }
  const jobs = new Map<string, Job>();
  let stopped = false;
  let startJob: ((id: string, job: Job) => void) | undefined;
  let response: PassThrough | undefined;
  const headers = Object.fromEntries(options.request.headers.entries());

  const context: BridgeSSRContextValue = {
    reserve(id) {
      const existing = jobs.get(id);
      if (existing) return existing.reservation;
      if (stopped) throw Error('Bridge SSR request is closed');
      const controller = new AbortController();
      const signal = controller.signal;
      const prefix = bridgeIdentifierPrefix(id);
      let resolveActivation!: (value: Activation | undefined) => void;
      let activated = false;
      let skipped = false;
      const activation = new Promise<Activation | undefined>((resolve) => {
        resolveActivation = resolve;
      });
      const timer = setTimeout(
        () => controller.abort(Error('Bridge SSR timed out')),
        timeoutMs,
      );
      const fromRequest = () => controller.abort(options.request.signal.reason);
      options.request.signal.addEventListener('abort', fromRequest, {
        once: true,
      });
      if (options.request.signal.aborted) fromRequest();
      let session: BridgeSSRMessageResult | undefined;
      const abortSession = () => session?.abort(signal.reason);
      signal.addEventListener('abort', abortSession, { once: true });
      const reservation: BridgeSSRReservation = {
        signal,
        wait: (promise) =>
          withAbort(options.work?.track(promise) ?? promise, signal),
        activate(factory, params) {
          if (activated || skipped || signal.aborted) return;
          activated = true;
          job.activated = true;
          resolveActivation({ factory, params });
        },
        skip() {
          if (activated || skipped) return;
          skipped = true;
          resolveActivation(undefined);
          job.clear();
        },
        fail(error) {
          controller.abort(error);
        },
      };
      const render = withAbort(activation, signal).then(async (value) => {
        if (!value) return undefined;
        const provider = await value.factory();
        if (signal.aborted) throw signal.reason;
        // Existing CSR providers remain usable. They never create a browser session.
        if (!provider.renderStream) return undefined;
        const request = {
          ...value.params,
          instanceId: id,
          identifierPrefix: prefix,
          url: options.request.url,
          headers,
          nonce: options.nonce,
          signal,
          work: options.work,
        };
        const raw = await provider.renderStream(request);
        const result = await normalizeBridgeSSR(raw, request);
        session = result;
        if (signal.aborted) result.abort(signal.reason);
        return result;
      });
      const ready = withAbort(options.work?.track(render) ?? render, signal);
      void ready.catch(() => {});
      const job: Job = {
        reservation,
        controller,
        prefix,
        stylesheets: [],
        activated: false,
        ready,
        clear() {
          clearTimeout(timer);
          options.request.signal.removeEventListener('abort', fromRequest);
          signal.removeEventListener('abort', abortSession);
        },
      };
      jobs.set(id, job);
      startJob?.(id, job);
      return reservation;
    },
    registerStyles(id, hrefs) {
      const job = jobs.get(id);
      if (job) job.stylesheets = [...new Set(hrefs)];
    },
    register(id, factory, params) {
      context.reserve(id).activate(factory, params);
    },
  };

  const abort = (reason: unknown = Error('Bridge SSR request aborted')) => {
    if (stopped) return;
    stopped = true;
    options.request.signal.removeEventListener('abort', abortRequest);
    for (const job of jobs.values()) {
      job.controller.abort(reason);
      job.clear();
    }
    response?.destroy();
  };
  const abortRequest = () => abort(options.request.signal.reason);
  options.request.signal.addEventListener('abort', abortRequest, {
    once: true,
  });
  if (options.request.signal.aborted) abortRequest();

  return {
    context,
    abort,
    getBootstrap() {
      // Unknown preparations are not expected Bridge sessions. Late discoveries
      // start a browser session only when their first message arrives.
      const encoded = JSON.stringify({
        timeoutMs,
        nonce: options.nonce,
      }).replace(/</g, '\\u003c');
      const attribute = options.nonce
        ? ` nonce="${escapeHTMLAttribute(options.nonce)}"`
        : '';
      const hrefs = [
        ...new Set(Array.from(jobs.values()).flatMap((job) => job.stylesheets)),
      ];
      const styles = hrefs
        .map(
          (href) =>
            `<link rel="stylesheet" href="${escapeHTMLAttribute(href)}"${attribute}>`,
        )
        .join('');
      return `${styles}<script${attribute}>(${bridgeStreamBootstrap.toString()})(${encoded})</script>`;
    },
    processStream(input: Readable) {
      if (stopped) throw Error('Bridge SSR request is closed');
      if (response)
        throw Error('Bridge SSR can compose a Host stream only once');
      const output = new PassThrough();
      response = output;
      const closed = new AbortController();
      const pieces = hostPieces(options.shellEndMarker);
      const namespace = `host-${randomUUID()}`;
      const isolate = createReactStreamScriptIsolator(
        namespace,
        options.identifierPrefix,
      );
      let releaseShell!: () => void;
      const shellReady = new Promise<void>((resolve) => {
        releaseShell = resolve;
      });
      const write = async (chunk: string | Buffer) => {
        if (output.destroyed) throw Error('Host response closed');
        if (!output.write(chunk))
          await once(output, 'drain', { signal: closed.signal });
      };
      const emit = (id: string, frame: BridgeStreamFrame) => {
        const attribute = options.nonce
          ? ` nonce="${escapeHTMLAttribute(options.nonce)}"`
          : '';
        return write(
          `<script${attribute}>window.__MF_BRIDGE_SSR__.accept.apply(window.__MF_BRIDGE_SSR__,${serializeBridgeFrame(id, frame)})</script>`,
        );
      };
      startJob = (id, job) => {
        job.done = (async () => {
          let reader: ReadableStreamDefaultReader<BridgeSSRMessage> | undefined;
          let complete = false;
          try {
            await shellReady;
            if (stopped) return;
            const result = await job.ready;
            if (!result) {
              complete = true;
              return;
            }
            reader = result.messages.getReader();
            await emit(id, {
              type: 'meta',
              identifierPrefix: job.prefix,
              stylesheets: [
                ...new Set([...job.stylesheets, ...(result.stylesheets || [])]),
              ],
              ...(result.hydration === 'progressive'
                ? { hydration: 'progressive' as const }
                : {}),
            });
            while (true) {
              const next = await withAbort(
                reader.read(),
                job.controller.signal,
              );
              if (next.done) break;
              if (complete) throw Error('Bridge message after completion');
              await emit(id, next.value);
              if (next.value.type === 'done') complete = true;
            }
            if (!complete) throw Error('Incomplete Bridge producer messages');
          } catch (error) {
            complete = false;
            // Preparation failures still belong to the ordinary consumer fallback.
            // Only a selected Bridge application has a stream session to fail.
            if (job.activated && !stopped && !output.destroyed) {
              try {
                options.onError?.(error, id);
              } catch {
                // Diagnostic callbacks must not prevent the recovery frame.
              }
              await emit(id, {
                type: 'error',
                message: 'Bridge server rendering failed',
              });
            }
          } finally {
            if (!complete)
              job.controller.abort(Error('Bridge rendering stopped'));
            if (reader) {
              await reader.cancel().catch(() => {});
              reader.releaseLock();
            }
            job.clear();
          }
        })();
        options.work?.track(job.done);
        void job.done.catch((error: Error) => output.destroy(error));
      };
      for (const [id, job] of jobs) startJob(id, job);
      output.on('close', () => {
        options.request.signal.removeEventListener('abort', abortRequest);
        closed.abort();
        releaseShell();
        abort(Error('Host response closed'));
        input.destroy();
        pieces.destroy();
      });
      input.on('error', (error) => output.destroy(error));
      pieces.on('error', (error) => output.destroy(error));
      input.pipe(pieces);
      void (async () => {
        for await (const piece of pieces) {
          await write(isolate(String(piece)));
          releaseShell();
        }
        // The Host may finish before a reserved loader resolves. Continue serving
        // its eventual Bridge output, including jobs discovered while it settles.
        let count: number;
        do {
          count = jobs.size;
          await Promise.all(Array.from(jobs.values(), (job) => job.done));
        } while (jobs.size !== count);
        stopped = true;
        output.end();
      })().catch((error) => output.destroy(error));
      return output;
    },
  };
}
