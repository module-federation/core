import type {
  BridgeSSRRequest,
  BridgeSSRMessageResult,
} from '@module-federation/bridge-react/ssr';
import type { BridgeServiceOptions } from '../types';
import { fetchBridgeService } from './service-http';
import { byteStream } from './frames.server';
import { BRIDGE_STREAM_PROTOCOL, type BridgeStreamFrame } from './protocol';
import { bridgeIdentifierPrefix } from './identity.server';

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

/** Consumer-owned forwarding endpoint for a browser requesting SSR after page load. */
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
        (input.renderInstanceId !== undefined &&
          (typeof input.renderInstanceId !== 'string' ||
            !/^[^\s<>"']{1,256}$/.test(input.renderInstanceId))) ||
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
    const renderInstanceId = input.renderInstanceId ?? input.instanceId;
    const info: BridgeSSRRequest = {
      moduleName: input.moduleName,
      instanceId: renderInstanceId,
      identifierPrefix: bridgeIdentifierPrefix(renderInstanceId, 'mf-client'),
      url: pageURL.href,
      basename: input.basename,
      memoryRoute: input.memoryRoute,
      props: input.props,
      headers,
      signal: controller.signal,
    };
    let result: BridgeSSRMessageResult;
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
    const reader = result.messages.getReader();
    let cleaned = false;
    const cleanup = async () => {
      if (cleaned) return;
      cleaned = true;
      controller.signal.removeEventListener('abort', abort);
      request.signal.removeEventListener('abort', abortFromRequest);
      result.abort(controller.signal.reason);
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    };
    const abort = () => {
      void cleanup();
    };
    controller.signal.addEventListener('abort', abort, { once: true });
    if (controller.signal.aborted) abort();
    const encode = (frame: BridgeStreamFrame) => `${JSON.stringify(frame)}\n`;
    async function* output() {
      try {
        if (controller.signal.aborted) throw controller.signal.reason;
        yield encode({
          type: 'meta',
          protocol: BRIDGE_STREAM_PROTOCOL,
          identifierPrefix: info.identifierPrefix,
          stylesheets: result.stylesheets,
        });
        let complete = false;
        while (true) {
          const next = await reader.read();
          if (controller.signal.aborted) throw controller.signal.reason;
          if (next.done) break;
          if (complete) throw Error('Bridge message after completion');
          // Service protocol validation has already accepted this complete message.
          yield encode(next.value);
          if (next.value.type === 'done') complete = true;
        }
        if (!complete) throw Error('Incomplete Bridge producer messages');
      } catch {
        if (!controller.signal.aborted)
          yield encode({
            type: 'error',
            message: 'Bridge service stream failed',
          });
      } finally {
        await cleanup();
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
