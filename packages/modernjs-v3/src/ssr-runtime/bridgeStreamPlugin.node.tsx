import React from 'react';
import { randomUUID } from 'node:crypto';
import { PassThrough, Readable, type Duplex } from 'node:stream';
import { once } from 'node:events';
import type { RuntimePlugin } from '@modern-js/runtime';
import {
  BridgeSSRContext,
  type BridgeSSRContextValue,
  type BridgeSSRResult,
  type BridgeSSRRenderParams,
} from '@module-federation/bridge-react/ssr';
import { bridgeStreamBootstrap } from '../bridge-stream/bootstrap';
import { htmlFrames } from '../bridge-stream/frames.server';
import { hostPieces } from '../bridge-stream/host-stream';
import { isolateReactStreamScripts } from '../bridge-stream/script-isolation.server';
import {
  BRIDGE_STREAM_PROTOCOL,
  escapeHTMLAttribute,
  serializeBridgeFrame,
  type BridgeStreamFrame,
} from '../bridge-stream/protocol';

export interface BridgeStreamPluginOptions {
  timeoutMs?: number;
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
  ready: Promise<BridgeSSRResult>;
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

/** Modern owns HTTP and its root renderer; this adapter executes independent Node providers. */
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
            const prefix = `mf-${randomUUID()}-`;
            let activate: (params: BridgeSSRRenderParams) => void = () => {};
            const renderParams = new Promise<BridgeSSRRenderParams>(
              (resolve) => {
                activate = resolve;
              },
            );
            if (!registrationOptions?.deferRender) activate(params);
            let session: BridgeSSRResult | undefined;
            const abortSession = () => session?.abort(signal.reason);
            signal.addEventListener('abort', abortSession, { once: true });
            const render = Promise.resolve()
              .then(async () => {
                const provider = await factory();
                if (!provider.renderStream)
                  throw Error(
                    `Bridge provider ${params.moduleName || id} does not support SSR`,
                  );
                // The lazy wrapper supplies the final router-derived basename after
                // loading. A rejected/stalled factory is already covered by this job.
                const resolvedParams = await withAbort(renderParams, signal);
                return provider.renderStream({
                  ...resolvedParams,
                  instanceId: id,
                  identifierPrefix: prefix,
                  url,
                  headers,
                  nonce,
                  signal,
                });
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
                let source: Readable | undefined;
                let framed: ReturnType<typeof htmlFrames> | undefined;
                let complete = false;
                const abortSource = () => {
                  source?.destroy(Error('Bridge rendering aborted'));
                  framed?.destroy(Error('Bridge rendering aborted'));
                };
                job.controller.signal.addEventListener('abort', abortSource, {
                  once: true,
                });
                try {
                  await shellReady;
                  if (stopped) return;
                  const result = await job.ready;
                  const signal = job.controller.signal;
                  source = Readable.fromWeb(
                    result.stream as Parameters<typeof Readable.fromWeb>[0],
                  );
                  framed = htmlFrames();
                  source.on('error', (error) => framed?.destroy(error));
                  source.pipe(framed);
                  await emit(id, {
                    type: 'meta',
                    protocol: BRIDGE_STREAM_PROTOCOL,
                    identifierPrefix: job.prefix,
                    stylesheets: job.stylesheets,
                  });
                  for await (const html of framed) {
                    if (signal.aborted) throw signal.reason;
                    await emit(id, {
                      type: 'html',
                      html: isolateReactStreamScripts(
                        String(html),
                        job.prefix,
                        job.prefix,
                      ),
                    });
                  }
                  const snapshot = await withAbort(result.snapshot, signal);
                  await emit(id, { type: 'data', snapshot });
                  await emit(id, { type: 'done' });
                  complete = true;
                } catch (error) {
                  if (!stopped && !output.destroyed) {
                    await emit(id, {
                      type: 'error',
                      message: 'Bridge server rendering failed',
                    });
                  }
                } finally {
                  if (!complete)
                    job.controller.abort(Error('Bridge rendering stopped'));
                  source?.destroy();
                  framed?.destroy();
                  job.controller.signal.removeEventListener(
                    'abort',
                    abortSource,
                  );
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
