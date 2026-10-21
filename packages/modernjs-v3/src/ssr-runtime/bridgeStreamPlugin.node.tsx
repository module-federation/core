import React from 'react';
import { executeBridgeSSR } from '../bridge-stream/executor.server';
import type { BridgeServiceOptions } from '../types';
import { randomUUID } from 'node:crypto';
import { PassThrough, type Duplex } from 'node:stream';
import { once } from 'node:events';
import type { RuntimePlugin } from '@modern-js/runtime';
import {
  BridgeSSRContext,
  type BridgeSSRContextValue,
  type BridgeSSRMessageResult,
  type BridgeSSRMessage,
  type BridgeSSRRenderParams,
} from '@module-federation/bridge-react/ssr';
import { bridgeStreamBootstrap } from '../bridge-stream/bootstrap';
import { hostPieces } from '../bridge-stream/host-stream';
import { bridgeIdentifierPrefix } from '../bridge-stream/identity.server';
import { isolateReactStreamScripts } from '../bridge-stream/script-isolation.server';
import {
  BRIDGE_STREAM_PROTOCOL,
  escapeHTMLAttribute,
  serializeBridgeFrame,
  type BridgeStreamFrame,
} from '../bridge-stream/protocol';

export interface BridgeStreamPluginOptions {
  timeoutMs?: number;
  services?: Record<string, BridgeServiceOptions>;
}

type RequestContext = {
  rootElement?: React.ReactElement;
  forceStream2String?: boolean;
  shellEndMarker?: string;
  identifierPrefix?: string;
  request?: Request;
  runtimeContext?: {
    ssrContext?: {
      nonce?: string;
      request?: {
        raw?: Request;
        url?: string;
        headers?: Record<string, string>;
      };
    };
  };
};

type Job = {
  controller: AbortController;
  prefix: string;
  stylesheets: string[];
  ready: Promise<BridgeSSRMessageResult>;
  done?: Promise<void>;
  activate(params: BridgeSSRRenderParams): void;
  clear(): void;
};

function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () =>
      reject(signal.reason || Error('Bridge rendering aborted'));
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener('abort', abort, { once: true });
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener('abort', abort));
  });
}

/** Modern owns the Host renderer; this adapter composes local or HTTP provider output. */
export function bridgeStreamPlugin(
  options: BridgeStreamPluginOptions = {},
): RuntimePlugin {
  const timeoutMs = options.timeoutMs || 30000;
  return {
    name: '@module-federation/bridge-stream',
    setup(api) {
      api.extendStreamSSR(() => {
        const jobs = new Map<string, Job>();
        let request: Request | undefined;
        let nonce: string | undefined;
        let url = '';
        let shellEndMarker = '';
        let hostIdentifierPrefix = '';
        let headers: Record<string, string> = {};
        let startJob: ((id: string, job: Job) => void) | undefined;
        let stopped = false;
        const context: BridgeSSRContextValue = {
          registerStyles(id, hrefs) {
            const job = jobs.get(id);
            if (job) job.stylesheets = [...new Set(hrefs)];
          },
          register(id, factory, params, registrationOptions) {
            const existing = jobs.get(id);
            if (existing) {
              if (!registrationOptions?.deferRender) existing.activate(params);
              return;
            }
            if (stopped) return;
            if (!url)
              throw Error(
                'Bridge SSR requires Modern request context in extendStreamSSR.init',
              );
            // Modern decides SSR versus CSR before constructing this extender.
            // Reinterpreting query parameters here would disagree with forceCSR
            // settings and Modern's last-value handling of duplicate parameters.
            const controller = new AbortController();
            const signal = controller.signal;
            const timer = setTimeout(
              () => controller.abort(Error('Bridge SSR timed out')),
              timeoutMs,
            );
            const abortFromRequest = () =>
              controller.abort(request?.signal.reason);
            request?.signal.addEventListener('abort', abortFromRequest, {
              once: true,
            });
            if (request?.signal.aborted) abortFromRequest();
            const prefix = bridgeIdentifierPrefix(id);
            let activate: (params: BridgeSSRRenderParams) => void = () => {};
            const renderParams = new Promise<BridgeSSRRenderParams>(
              (resolve) => {
                activate = resolve;
              },
            );
            if (!registrationOptions?.deferRender) activate(params);
            let session: BridgeSSRMessageResult | undefined;
            const abortSession = () => session?.abort(signal.reason);
            signal.addEventListener('abort', abortSession, { once: true });
            const render = Promise.resolve()
              .then(async () => {
                // Activation provides the final remote identity and router basename.
                const resolvedParams = await withAbort(renderParams, signal);
                return executeBridgeSSR(
                  {
                    ...resolvedParams,
                    instanceId: id,
                    identifierPrefix: prefix,
                    url,
                    headers,
                    nonce,
                    signal,
                  },
                  factory,
                  options.services?.[resolvedParams.moduleName || ''],
                );
              })
              .then((value) => {
                session = value;
                // A provider can resolve after the deadline; do not retain its renderer.
                value.snapshot.catch(() => {});
                if (signal.aborted) value.abort(signal.reason);
                return value;
              });
            const ready = withAbort(render, signal);
            ready.catch(() => {});
            const job: Job = {
              controller,
              prefix,
              stylesheets: [],
              ready,
              activate,
              clear() {
                clearTimeout(timer);
                request?.signal.removeEventListener('abort', abortFromRequest);
                signal.removeEventListener('abort', abortSession);
              },
            };
            jobs.set(id, job);
            startJob?.(id, job);
          },
        };
        return {
          init(params: RequestContext) {
            if (!params.shellEndMarker || !params.identifierPrefix) {
              throw Error(
                'Unsupported Modern Bridge SSR runtime: extendStreamSSR.init must provide shellEndMarker and identifierPrefix',
              );
            }
            shellEndMarker = params.shellEndMarker;
            hostIdentifierPrefix = params.identifierPrefix;
            const ssr = params.runtimeContext?.ssrContext;
            request = params.request || ssr?.request?.raw;
            nonce = ssr?.nonce;
            url = request?.url || ssr?.request?.url || '';
            headers = request
              ? Object.fromEntries(request.headers.entries())
              : ssr?.request?.headers || {};
          },
          modifyRootElement(root) {
            return (
              <BridgeSSRContext.Provider value={context}>
                {root}
              </BridgeSSRContext.Provider>
            );
          },
          getStyleTags() {
            const encoded = JSON.stringify({
              instanceIds: Array.from(jobs.keys()),
              timeoutMs,
              nonce,
            }).replace(/</g, '\\u003c');
            const attribute = nonce
              ? ` nonce="${escapeHTMLAttribute(nonce)}"`
              : '';
            const stylesheets = [
              ...new Set(
                Array.from(jobs.values()).flatMap((job) => job.stylesheets),
              ),
            ]
              .map(
                (href) =>
                  `<link rel="stylesheet" href="${escapeHTMLAttribute(href)}"${attribute}>`,
              )
              .join('');
            return `${stylesheets}<script${attribute}>(${bridgeStreamBootstrap.toString()})(${encoded})</script>`;
          },
          processStream(input) {
            const output = new PassThrough();
            const closed = new AbortController();
            const pieces = hostPieces(shellEndMarker);
            const hostNamespace = `host-${randomUUID()}`;
            let releaseShell: () => void = () => {};
            const shellReady = new Promise<void>((resolve) => {
              releaseShell = resolve;
            });
            const write = async (chunk: string | Buffer) => {
              if (output.destroyed) throw Error('Host response closed');
              if (!output.write(chunk))
                await once(output, 'drain', { signal: closed.signal });
            };
            const emit = (id: string, frame: BridgeStreamFrame) => {
              const attribute = nonce
                ? ` nonce="${escapeHTMLAttribute(nonce)}"`
                : '';
              return write(
                `<script${attribute}>window.__MF_BRIDGE_SSR__.accept.apply(window.__MF_BRIDGE_SSR__,${serializeBridgeFrame(id, frame)})</script>`,
              );
            };
            startJob = (id, job) => {
              job.done = (async () => {
                let reader:
                  | ReadableStreamDefaultReader<BridgeSSRMessage>
                  | undefined;
                let complete = false;
                try {
                  await shellReady;
                  if (stopped) return;
                  const result = await job.ready;
                  const signal = job.controller.signal;
                  reader = result.messages.getReader();
                  await emit(id, {
                    type: 'meta',
                    protocol: BRIDGE_STREAM_PROTOCOL,
                    identifierPrefix: job.prefix,
                    stylesheets: [
                      ...new Set([
                        ...job.stylesheets,
                        ...(result.stylesheets || []),
                      ]),
                    ],
                    ...(result.hydration === 'progressive'
                      ? { hydration: 'progressive' as const }
                      : {}),
                  });
                  while (true) {
                    const next = await withAbort(reader.read(), signal);
                    if (next.done) break;
                    if (complete)
                      throw Error('Bridge message after completion');
                    // The producer owns HTML framing, script adaptation and readiness.
                    await emit(id, next.value);
                    if (next.value.type === 'done') complete = true;
                  }
                  if (!complete)
                    throw Error('Incomplete Bridge producer messages');
                } catch (error) {
                  complete = false;
                  if (!stopped && !output.destroyed) {
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
              job.done.catch((error: Error) => output.destroy(error));
            };
            for (const [id, job] of jobs) startJob(id, job);
            output.on('close', () => {
              stopped = true;
              closed.abort();
              releaseShell();
              for (const job of jobs.values()) {
                job.controller.abort(Error('Host response closed'));
                job.clear();
              }
              (input as Duplex).destroy();
              pieces.destroy();
            });
            input.on('error', (error) => output.destroy(error));
            pieces.on('error', (error) => output.destroy(error));
            input.pipe(pieces);
            void (async () => {
              for await (const piece of pieces) {
                await write(
                  isolateReactStreamScripts(
                    String(piece),
                    hostNamespace,
                    hostIdentifierPrefix,
                  ),
                );
                releaseShell();
              }
              // Registrations made by late Host Suspense renders now have their own jobs.
              await Promise.all(Array.from(jobs.values(), (job) => job.done));
              output.end();
            })().catch((error) => output.destroy(error));
            return output;
          },
        };
      });
    },
  };
}
