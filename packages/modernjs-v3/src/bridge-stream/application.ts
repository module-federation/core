import type {
  BridgeSSRRequest,
  BridgeSSRResult,
} from '@module-federation/bridge-react/ssr';
import type {
  RenderParams,
  DestroyParams,
} from '@module-federation/bridge-react';

interface ApplicationOptions {
  url: string;
  basename?: string;
  identifierPrefix?: string;
  props?: Record<string, unknown>;
  signal?: AbortSignal;
  onRecoverableError?: (error: unknown) => void;
}
interface ApplicationInstance {
  hydrate(
    container: HTMLElement,
    snapshot: any,
    options?: Pick<ApplicationOptions, 'signal' | 'onRecoverableError'>,
  ): void | Promise<void>;
  mount(
    container: HTMLElement,
    options: ApplicationOptions,
  ): void | Promise<void>;
  update(options: Partial<ApplicationOptions>): void | Promise<void>;
  destroy(): void;
}
interface ApplicationRenderer {
  (
    request: Request,
    options: ApplicationOptions & { signal: AbortSignal; nonce?: string },
  ): Promise<{
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
}: {
  renderApplication: ApplicationRenderer;
}) {
  return () => ({
    async renderStream(info: BridgeSSRRequest): Promise<BridgeSSRResult> {
      const url = applicationURL(info, info.url);
      const request = new Request(url, {
        headers: info.headers,
        signal: info.signal,
      });
      const result = await renderApplication(request, {
        url,
        basename: info.memoryRoute ? '/' : info.basename,
        identifierPrefix: info.identifierPrefix,
        signal: info.signal,
        nonce: info.nonce,
        props: info.props,
      });
      return {
        stream: result.stream,
        snapshot: result.snapshot,
        abort: (reason?: unknown) => result.cancel(reason),
      };
    },
    render() {
      throw new Error('A Node Bridge application cannot mount into a DOM.');
    },
    destroy() {},
  });
}

/** Each Bridge provider owns the instances created by its own Modern runtime. */
export function createModernBrowserBridge({
  createApplication,
}: {
  createApplication: () => ApplicationInstance;
}) {
  return () => {
    type Instance = {
      app: ApplicationInstance;
      disposed: boolean;
      ready: Promise<void>;
    };
    const roots = new Map<HTMLElement, Instance>();
    const dispose = (dom: HTMLElement, instance: Instance) => {
      // An older asynchronous mount can fail after this DOM has a new instance.
      if (roots.get(dom) === instance) roots.delete(dom);
      if (instance.disposed) return;
      instance.disposed = true;
      instance.app.destroy();
    };
    const getOptions = (info: RenderParams): ApplicationOptions => ({
      url: applicationURL(info, window.location.href),
      basename: info.memoryRoute ? '/' : info.basename,
      identifierPrefix: info.rootOptions?.identifierPrefix,
      props: Object.fromEntries(
        Object.entries(info).filter(
          ([key]) =>
            ![
              'dom',
              'signal',
              'moduleName',
              'basename',
              'memoryRoute',
              'rootOptions',
              'fallback',
              'snapshot',
            ].includes(key),
        ),
      ),
      signal: info.signal,
      onRecoverableError: info.rootOptions?.onRecoverableError,
    });
    const initialize = (
      info: RenderParams,
      hydrate: boolean,
    ): Promise<void> => {
      if (info.signal?.aborted) return Promise.resolve();
      const instance: Instance = {
        app: createApplication(),
        disposed: false,
        ready: Promise.resolve(),
      };
      roots.set(info.dom, instance);
      instance.ready = Promise.resolve()
        .then(async () => {
          if (instance.disposed) return;
          if (hydrate) {
            await instance.app.hydrate(info.dom, info.snapshot, {
              signal: info.signal,
              onRecoverableError: info.rootOptions?.onRecoverableError,
            });
          } else {
            await instance.app.mount(info.dom, getOptions(info));
          }
          if (info.signal?.aborted) dispose(info.dom, instance);
        })
        .catch((error) => {
          dispose(info.dom, instance);
          throw error;
        });
      return instance.ready;
    };
    return {
      async render(info: RenderParams) {
        if (info.signal?.aborted) return;
        const current = roots.get(info.dom);
        if (!current) return initialize(info, false);
        // The public lifecycle also permits updates arriving during async mount.
        current.ready = current.ready
          .then(async () => {
            if (
              current.disposed ||
              roots.get(info.dom) !== current ||
              info.signal?.aborted
            )
              return;
            await current.app.update(getOptions(info));
          })
          .catch((error) => {
            dispose(info.dom, current);
            throw error;
          });
        return current.ready;
      },
      async hydrate(info: RenderParams & { snapshot: unknown }) {
        if (info.signal?.aborted) return;
        if (roots.has(info.dom))
          throw new Error('Bridge application is already mounted.');
        return initialize(info, true);
      },
      destroy(info: DestroyParams) {
        const instance = roots.get(info.dom);
        if (instance) dispose(info.dom, instance);
      },
    };
  };
}
