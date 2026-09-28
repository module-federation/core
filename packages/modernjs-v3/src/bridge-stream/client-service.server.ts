import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
} from '@module-federation/bridge-react/ssr';
import type { BridgeServiceOptions } from '../types';
import { fetchBridgeService } from './service-http';
import { byteStream, htmlFrames } from './frames.server';
import { isolateReactStreamScripts } from './script-isolation.server';
import { BRIDGE_STREAM_PROTOCOL, type BridgeStreamFrame } from './protocol';

export interface BridgeClientServiceMiddlewareOptions {
  path: string;
  services: Record<string, BridgeServiceOptions>;
  /** Explicitly allow request headers from this consumer to reach the producer. */
  forwardHeaders?: string[];
  maxRequestBytes?: number;
}

async function readRequest(request: Request, limit: number): Promise<any> {
  if (!request.body) throw Error('Missing request body');
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let body = '';
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > limit) throw Error('Bridge client request exceeds limit');
      body += decoder.decode(next.value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

/** Consumer-owned framing endpoint for a browser requesting SSR after page load. */
export function createBridgeClientServiceMiddleware(
  options: BridgeClientServiceMiddlewareOptions,
): (
  context: { req: { raw: Request } },
  next: () => Promise<void>,
) => Promise<Response | void> {
  return async (context, next) => {
    const request = context.req.raw;
    const endpoint = new URL(request.url);
    if (endpoint.pathname !== options.path) return next();
    if (request.method !== 'POST')
      return new Response('Method not allowed', { status: 405 });
    const origin = request.headers.get('origin');
    if (origin && origin !== endpoint.origin)
      return new Response('Cross-origin Bridge request rejected', {
        status: 403,
      });
    let input: any;
    let pageURL: URL;
    try {
      input = await readRequest(
        request,
        options.maxRequestBytes || 1024 * 1024,
      );
      if (
        !input ||
        typeof input.moduleName !== 'string' ||
        !Object.prototype.hasOwnProperty.call(
          options.services,
          input.moduleName,
        ) ||
        typeof input.instanceId !== 'string' ||
        !/^[^\s<>"']{1,256}$/.test(input.instanceId) ||
        typeof input.url !== 'string' ||
        !input.props ||
        typeof input.props !== 'object' ||
        Array.isArray(input.props) ||
        (input.basename !== undefined && typeof input.basename !== 'string') ||
        (input.memoryRoute !== undefined &&
          (!input.memoryRoute ||
            typeof input.memoryRoute.entryPath !== 'string'))
      )
        throw Error('Invalid Bridge client request');
      pageURL = new URL(input.url, endpoint.origin);
      if (pageURL.origin !== endpoint.origin)
        throw Error('Bridge page URL must belong to this consumer');
    } catch {
      return new Response('Invalid Bridge client request', { status: 400 });
    }
    const service = options.services[input.moduleName];
    const controller = new AbortController();
    const abortFromRequest = () => controller.abort(request.signal.reason);
    request.signal.addEventListener('abort', abortFromRequest, { once: true });
    if (request.signal.aborted) abortFromRequest();
    const headers: Record<string, string> = {};
    for (const name of options.forwardHeaders || []) {
      const value = request.headers.get(name);
      if (value !== null) headers[name] = value;
    }
    const info: BridgeSSRRequest = {
      moduleName: input.moduleName,
      instanceId: input.instanceId,
      identifierPrefix: `mf-client-${randomUUID()}-`,
      url: pageURL.href,
      basename: input.basename,
      memoryRoute: input.memoryRoute,
      props: input.props,
      headers,
      signal: controller.signal,
    };
    let result: BridgeSSRResult;
    try {
      // A completed document cannot use the initial-document early hydration path.
      result = await fetchBridgeService(info, {
        ...service,
        hydrationMode: 'complete',
      });
      result.snapshot.catch(() => {});
    } catch {
      request.signal.removeEventListener('abort', abortFromRequest);
      controller.abort();
      return new Response('Bridge service rendering failed', { status: 502 });
    }
    const source = Readable.fromWeb(result.stream as any);
    const frames = htmlFrames();
    source.on('error', (error) => frames.destroy(error));
    const abort = () => {
      const reason =
        controller.signal.reason || Error('Bridge client stream aborted');
      result.abort(reason);
      frames.destroy(reason instanceof Error ? reason : Error(String(reason)));
      source.destroy();
    };
    // Attach before piping so a synchronous abort has an observed error path.
    frames.on('error', () => {});
    controller.signal.addEventListener('abort', abort, { once: true });
    if (controller.signal.aborted) abort();
    source.pipe(frames);
    const encode = (frame: BridgeStreamFrame) => `${JSON.stringify(frame)}\n`;
    async function* output() {
      try {
        yield encode({
          type: 'meta',
          protocol: BRIDGE_STREAM_PROTOCOL,
          identifierPrefix: info.identifierPrefix,
          stylesheets: result.stylesheets,
        });
        for await (const html of frames) {
          yield encode({
            type: 'html',
            html: isolateReactStreamScripts(
              String(html),
              info.identifierPrefix,
              info.identifierPrefix,
            ),
          });
        }
        yield encode({ type: 'data', snapshot: await result.snapshot });
        yield encode({ type: 'done' });
      } catch {
        if (!controller.signal.aborted)
          yield encode({
            type: 'error',
            message: 'Bridge service stream failed',
          });
      } finally {
        controller.signal.removeEventListener('abort', abort);
        request.signal.removeEventListener('abort', abortFromRequest);
        result.abort();
        source.destroy();
        frames.destroy();
      }
    }
    return new Response(
      byteStream(output(), () => controller.abort()),
      {
        headers: {
          'content-type': 'application/x-ndjson',
          'cache-control': 'no-store',
        },
      },
    );
  };
}
