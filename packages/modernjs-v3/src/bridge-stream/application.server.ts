import type {
  BridgeSSRRequest,
  BridgeSSRResult,
  BridgeSSRMessageResult,
} from '@module-federation/bridge-react/ssr';
import { normalizeBridgeSSR } from './producer.server';
export { createModernBrowserBridge } from './application';

interface ApplicationOptions {
  url: string;
  basename?: string;
  identifierPrefix?: string;
  props?: Record<string, unknown>;
  signal?: AbortSignal;
  onRecoverableError?: (error: unknown) => void;
}
interface ApplicationRenderer {
  (
    request: Request,
    options: ApplicationOptions & {
      signal: AbortSignal;
      nonce?: string;
      progressiveHydration?: boolean;
    },
  ): Promise<{
    hydration?: BridgeSSRResult['hydration'];
    stream: ReadableStream<Uint8Array>;
    snapshot: Promise<unknown>;
    cancel(reason?: unknown): void;
  }>;
}

function applicationURL(
  info: {
    url?: string;
    memoryRoute?: { entryPath: string };
    basename?: string;
  },
  fallback: string,
) {
  const url = new URL(
    info.memoryRoute?.entryPath || info.url || fallback,
    fallback,
  );
  return url.toString();
}

/** The generated Node expose runs the producer's real Modern request handler. */
export function createModernServerBridge({
  renderApplication,
  revision,
}: {
  revision?: string;
  renderApplication: ApplicationRenderer;
}) {
  return () => ({
    async renderStream(
      info: BridgeSSRRequest,
    ): Promise<BridgeSSRMessageResult> {
      const url = applicationURL(info, info.url);
      const request = new Request(url, {
        headers: info.headers,
        signal: info.signal,
      });
      const result = await renderApplication(request, {
        url,
        progressiveHydration: true,
        basename: info.memoryRoute ? '/' : info.basename,
        identifierPrefix: info.identifierPrefix,
        signal: info.signal,
        nonce: info.nonce,
        props: info.props,
      });
      const stamp = (snapshot: Promise<unknown>) =>
        revision
          ? snapshot.then((value) => ({
              ...(value as object),
              bridgeRevision: revision,
            }))
          : snapshot;
      return normalizeBridgeSSR(
        {
          revision,
          hydration: result.hydration && {
            ...result.hydration,
            snapshot: stamp(result.hydration.snapshot),
          },
          stream: result.stream,
          snapshot: stamp(result.snapshot),
          abort: (reason?: unknown) => result.cancel(reason),
        },
        info,
      );
    },
    render() {
      throw new Error('A Node Bridge application cannot mount into a DOM.');
    },
    destroy() {},
  });
}
