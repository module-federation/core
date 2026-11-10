import { bridgeStreamBootstrap } from '../ssr-stream/bootstrap';
import type { BridgeStreamBrowserRuntime } from '../ssr-stream/protocol';
import { bridgeIdentifierPrefix } from '../ssr-stream/identity';
import type { BridgeSSRRequest } from '../types';
import type { BrowserServiceRequest } from './config';
import { fetchBridgeService } from './fetch';

const usedRenderIds = new Set<string>();
let sequence = 0;

/** Called after the Host commits an empty container. Network reading stays
 * independent of the ready promise that gates the existing hydrate lifecycle. */
export function receiveBridgeService(
  element: HTMLElement,
  instanceId: string,
  request: Omit<BridgeSSRRequest, 'identifierPrefix' | 'instanceId'>,
  options: BrowserServiceRequest,
) {
  const endpoint = new URL(options.url, location.href);
  if (endpoint.origin !== location.origin)
    throw Error('Browser Service ingress must be same-origin.');
  const nonce =
    request.nonce ||
    document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce;
  bridgeStreamBootstrap({ nonce });
  const runtime = window.__MF_BRIDGE_SSR__ as BridgeStreamBrowserRuntime;
  const renderId = usedRenderIds.has(instanceId)
    ? `${instanceId}-mount-${++sequence}`
    : instanceId;
  usedRenderIds.add(renderId);
  const sessionId = `${renderId}-receive-${++sequence}`;
  element.id = sessionId;
  runtime.expect(sessionId);
  const session = runtime.claim(sessionId, element)!;
  const identifierPrefix = bridgeIdentifierPrefix(renderId, 'mf-client');
  const done = (async () => {
    const result = await fetchBridgeService(
      {
        ...request,
        moduleName: options.moduleName,
        nonce,
        instanceId: renderId,
        identifierPrefix,
      },
      { ...options, url: endpoint.href },
    );
    const reader = result.messages.getReader();
    try {
      runtime.accept(sessionId, {
        type: 'meta',
        identifierPrefix,
        stylesheets: result.stylesheets,
        ...(result.hydration === 'progressive'
          ? { hydration: 'progressive' as const }
          : {}),
      });
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        if (request.signal.aborted) throw request.signal.reason;
        runtime.accept(sessionId, next.value);
      }
    } finally {
      reader.releaseLock();
    }
  })();
  // Observe independently of hydration. Late failures still recover the document.
  void done.catch((error) => {
    if (!request.signal.aborted)
      runtime.accept(sessionId, { type: 'error', message: String(error) });
  });
  return {
    runtime,
    session,
    done,
    release: () => runtime.release(sessionId, element),
  };
}
