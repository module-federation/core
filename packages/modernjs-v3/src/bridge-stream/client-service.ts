import {
  getBridgeSSRRenderParams,
  type BridgeProvider,
} from '@module-federation/bridge-react/ssr';
import { bridgeStreamBootstrap } from './bootstrap';
import { loadBridgeRemote, type BridgeRemoteModule } from './remote';
import type { BridgeStreamBrowserRuntime, BridgeStreamFrame } from './protocol';

export interface BridgeClientServiceOptions {
  /** Same-origin consumer endpoint installed with createBridgeClientServiceMiddleware. */
  url: string;
  timeoutMs?: number;
  nonce?: string;
  maxFrameBytes?: number;
}

async function* readClientFrames(
  stream: ReadableStream<Uint8Array>,
  maxFrameBytes: number,
): AsyncGenerator<BridgeStreamFrame> {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const encoder = new TextEncoder();
  let buffer = '';
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      buffer += decoder.decode(next.value, { stream: true });
      let index: number;
      while ((index = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        if (encoder.encode(line).byteLength > maxFrameBytes)
          throw Error('Bridge client frame exceeds limit');
        if (line) yield JSON.parse(line);
      }
      if (encoder.encode(buffer).byteLength > maxFrameBytes)
        throw Error('Bridge client frame exceeds limit');
    }
    buffer += decoder.decode();
    if (buffer.trim()) throw Error('Truncated Bridge client frame');
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

/** Use the producer's Bridge lifecycle with HTTP SSR on the first browser mount. */
export async function loadBridgeServiceRemote(
  moduleName: string,
  options: BridgeClientServiceOptions,
): Promise<BridgeRemoteModule> {
  const remote = await loadBridgeRemote(moduleName);
  if (typeof window === 'undefined') return remote;
  return {
    ...remote,
    [Symbol.for('mf_module_id')]:
      remote[Symbol.for('mf_module_id')] || moduleName,
    default: (): BridgeProvider => {
      const provider = remote.default();
      let initialized = false;
      let controller: AbortController | undefined;
      let runtime: BridgeStreamBrowserRuntime | undefined;
      let id: string | undefined;
      let originalDomId: string | undefined;
      let disposed = false;
      return {
        ...provider,
        async hydrate(info) {
          if (!provider.hydrate)
            throw Error(
              `Bridge provider ${moduleName} does not support hydration`,
            );
          await provider.hydrate(info);
          initialized = true;
        },
        async render(info) {
          let csr = '';
          new URL(window.location.href).searchParams.forEach((value, name) => {
            if (name === 'csr') csr = value;
          });
          if (initialized || csr === '1') {
            await provider.render(info);
            initialized = true;
            return;
          }
          if (!provider.hydrate)
            throw Error(
              `Bridge provider ${moduleName} does not support hydration`,
            );
          const endpoint = new URL(options.url, window.location.href);
          if (endpoint.origin !== window.location.origin)
            throw Error(
              'Bridge client service endpoint must use the consumer origin',
            );
          const { dom, ...params } = info;
          originalDomId = dom.id;
          id = `mf-client-${crypto.randomUUID()}`;
          dom.id = id;
          bridgeStreamBootstrap({
            timeoutMs: options.timeoutMs,
            nonce: options.nonce,
          });
          runtime = window.__MF_BRIDGE_SSR__ as BridgeStreamBrowserRuntime;
          runtime.expect(id);
          const session = runtime.claim(id, dom);
          if (!session)
            throw Error('Bridge client service container could not be claimed');
          controller = new AbortController();
          const signal = controller.signal;
          void session.done.catch((error) => controller?.abort(error));
          const releaseOnAbort = () => runtime?.release(id!, dom);
          signal.addEventListener('abort', releaseOnAbort, { once: true });
          const onAbort = () => controller?.abort(info.signal?.reason);
          info.signal?.addEventListener('abort', onAbort, { once: true });
          if (info.signal?.aborted) onAbort();
          const timer = setTimeout(
            () => controller?.abort(Error('Bridge client service timed out')),
            options.timeoutMs || 30000,
          );
          try {
            signal.throwIfAborted();
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                ...getBridgeSSRRenderParams({ ...params, moduleName }),
                instanceId: id,
                url: window.location.href,
              }),
              signal,
            });
            if (!response.ok || !response.body)
              throw Error(`Bridge client service HTTP ${response.status}`);
            let done = false;
            for await (const frame of readClientFrames(
              response.body,
              options.maxFrameBytes || 3 * 1024 * 1024,
            )) {
              if (done) throw Error('Bridge client frame after completion');
              if (!frame || typeof frame !== 'object')
                throw Error('Invalid Bridge client frame');
              if (frame.type === 'meta' && frame.hydration)
                throw Error(
                  'Browser HTTP service requires complete hydration mode',
                );
              runtime.accept(id, frame);
              if (frame.type === 'error') throw Error(frame.message);
              if (frame.type === 'done') done = true;
            }
            if (!done) throw Error('Truncated Bridge client stream');
            const completed = await session.done;
            if (disposed || signal.aborted) return;
            await provider.hydrate({
              ...info,
              snapshot: completed.snapshot,
              rootOptions: {
                ...info.rootOptions,
                identifierPrefix: completed.identifierPrefix,
                onRecoverableError(error) {
                  try {
                    info.rootOptions?.onRecoverableError?.(error);
                  } finally {
                    runtime?.fallback(error);
                  }
                },
              },
            });
            initialized = true;
          } catch (error) {
            controller.abort(error);
            runtime.release(id, dom);
            if (!disposed && !info.signal?.aborted) runtime.fallback(error);
            throw error;
          } finally {
            clearTimeout(timer);
            signal.removeEventListener('abort', releaseOnAbort);
            info.signal?.removeEventListener('abort', onAbort);
          }
        },
        destroy(info) {
          disposed = true;
          controller?.abort();
          if (id) runtime?.release(id, info.dom);
          if (id && info.dom.id === id && originalDomId !== undefined)
            info.dom.id = originalDomId;
          provider.destroy(info);
        },
      };
    },
  };
}
