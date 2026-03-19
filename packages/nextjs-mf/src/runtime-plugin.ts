import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

type AnyFunction = (...args: any[]) => unknown;
type ParsedManifest = Record<string, unknown>;
type RemoteContainer = {
  init: AnyFunction;
  get: AnyFunction;
};

type FederatedSsrRuntime = {
  record?: (remote: string, expose: string) => void;
  rewriteId?: (id: string) => string;
  loadEntry?: (args: {
    loaderHook: unknown;
    remoteInfo: {
      name: string;
      entry: string;
      entryGlobalName: string;
      type?: string;
    };
  }) => Promise<unknown> | undefined;
  pinRemote?: (args: {
    remote: {
      name: string;
      alias?: string;
    };
    remoteInfo: {
      name: string;
      entry: string;
      entryGlobalName: string;
      buildVersion?: string;
    };
  }) =>
    | {
        runtimeName: string;
      }
    | undefined;
  getPinnedManifestResponse?: (manifestUrl: string) => Response | undefined;
};

const OFFLINE_PAGE_PROPS = async () => ({});
const OFFLINE_SERVER_SIDE_PROPS = async () => ({ props: {} });
const functionShimCache = new WeakMap<AnyFunction, AnyFunction>();

const createOfflinePageFallback = () => {
  const Page = function NextjsFederatedOfflinePage() {
    return null;
  } as AnyFunction & {
    getInitialProps?: typeof OFFLINE_PAGE_PROPS;
  };

  Page.getInitialProps = OFFLINE_PAGE_PROPS;

  return {
    __esModule: true as const,
    default: Page,
    getServerSideProps: OFFLINE_SERVER_SIDE_PROPS,
  };
};

const copyOwnProperties = (
  source: AnyFunction,
  target: AnyFunction,
): AnyFunction => {
  for (const key of Object.getOwnPropertyNames(source)) {
    if (key === 'length' || key === 'name' || key === 'prototype') {
      continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor) {
      Object.defineProperty(target, key, descriptor);
    }
  }

  return target;
};

const createFunctionShim = (value: AnyFunction): AnyFunction => {
  const cached = functionShimCache.get(value);
  if (cached) {
    return cached;
  }

  const shim = copyOwnProperties(
    value,
    function (this: unknown, ...args: any[]) {
      return value.apply(this, args);
    },
  );

  functionShimCache.set(value, shim);
  return shim;
};

const materializeLoadedModule = (moduleOrFactory: unknown): unknown => {
  if (typeof moduleOrFactory !== 'function') {
    return moduleOrFactory;
  }

  try {
    return moduleOrFactory();
  } catch {
    return moduleOrFactory;
  }
};

const createServerModuleShim = (moduleOrFactory: unknown): unknown => {
  const loadedModule = materializeLoadedModule(moduleOrFactory);
  if (!loadedModule || typeof loadedModule !== 'object') {
    if (typeof loadedModule === 'function') {
      const proxiedExport = new Proxy(loadedModule, {
        get(target, prop, receiver) {
          const value = Reflect.get(target, prop, receiver);
          return typeof value === 'function'
            ? createFunctionShim(value)
            : value;
        },
      });

      return () => proxiedExport;
    }

    return loadedModule;
  }

  return new Proxy(loadedModule, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? createFunctionShim(value) : value;
    },
  });
};

const normalizeRemotePublicPath = ({
  inBrowser,
  manifestUrl,
  publicPath,
}: {
  inBrowser?: boolean;
  manifestUrl: string;
  publicPath?: string;
}): string | undefined => {
  if (publicPath?.includes('/_next/')) {
    return publicPath.substring(0, publicPath.lastIndexOf('/_next/') + 7);
  }

  if (!manifestUrl.includes('mf-manifest.json')) {
    return publicPath;
  }

  const manifestDirectory = manifestUrl.substring(
    0,
    manifestUrl.indexOf('mf-manifest.json'),
  );

  if (!inBrowser) {
    return manifestDirectory;
  }

  return manifestDirectory.replace('/static/chunks/', '/');
};

const isRemoteContainer = (value: unknown): value is RemoteContainer =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as RemoteContainer).init === 'function' &&
  typeof (value as RemoteContainer).get === 'function';

const getAttachedRemoteContainer = (
  globalName: string | undefined,
): RemoteContainer | undefined => {
  if (!globalName) {
    return undefined;
  }

  const attachedRemote = (globalThis as Record<string, unknown>)[globalName];
  return isRemoteContainer(attachedRemote) ? attachedRemote : undefined;
};

const getSsrRuntime = (): FederatedSsrRuntime | undefined =>
  (
    globalThis as typeof globalThis & {
      __NEXTJS_MF_SSR__?: FederatedSsrRuntime;
    }
  ).__NEXTJS_MF_SSR__;

const findJsonDocumentEnd = (source: string): number | undefined => {
  let depth = 0;
  let started = false;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index++) {
    const character = source[index];

    if (!started) {
      if (character.trim() === '') {
        continue;
      }

      if (character !== '{' && character !== '[') {
        return undefined;
      }

      started = true;
      depth = 1;
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === '\\') {
        escaped = true;
        continue;
      }

      if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '{' || character === '[') {
      depth += 1;
      continue;
    }

    if (character === '}' || character === ']') {
      depth -= 1;

      if (depth === 0) {
        return index + 1;
      }
    }
  }

  return undefined;
};

const sanitizeManifestResponse = async (
  response: Response,
  manifestUrl: string,
): Promise<Response> => {
  if (!response.ok || typeof response.text !== 'function') {
    return response;
  }

  try {
    await response.clone().json();
    return response;
  } catch {
    const source = await response.text();
    const documentEnd = findJsonDocumentEnd(source);

    if (documentEnd === undefined) {
      throw new Error(`Unable to parse remote manifest ${manifestUrl}`);
    }

    const manifest = JSON.parse(source.slice(0, documentEnd)) as ParsedManifest;

    return new Response(JSON.stringify(manifest), {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
  }
};

export default function (): ModuleFederationRuntimePlugin {
  return {
    name: 'nextjs-mf-runtime-plugin',
    errorLoadRemote(args) {
      console.error('[nextjs-mf] remote load failed', {
        id: args.id,
        from: args.from,
        lifecycle: args.lifecycle,
        error:
          args.error instanceof Error
            ? {
                name: args.error.name,
                message: args.error.message,
                stack: args.error.stack,
              }
            : args.error,
      });

      if (typeof window !== 'undefined') {
        return undefined;
      }

      const fallbackModule = createOfflinePageFallback();
      return args.from === 'build' ? () => fallbackModule : fallbackModule;
    },
    fetch(url) {
      const response = getSsrRuntime()?.getPinnedManifestResponse?.(url);
      if (response) {
        return Promise.resolve(response);
      }

      if (!url.includes('mf-manifest.json')) {
        return undefined;
      }

      return fetch(url, {
        cache: 'no-store',
      }).then((manifestResponse) =>
        sanitizeManifestResponse(manifestResponse, url),
      );
    },
    createScript(args: { url: string; attrs?: Record<string, unknown> }) {
      if (typeof window === 'undefined') {
        return undefined;
      }

      const script = document.createElement('script');
      script.src = args.url;
      script.async = true;

      const attrs = { ...(args.attrs || {}) };
      delete attrs['crossorigin'];
      Object.entries(attrs).forEach(([key, value]) => {
        if (typeof value === 'string') {
          script.setAttribute(key, value);
        }
      });

      return { script, timeout: 8000 };
    },
    beforeRequest(args) {
      if (typeof window !== 'undefined') {
        return args;
      }

      return {
        ...args,
        id: getSsrRuntime()?.rewriteId?.(args.id) ?? args.id,
      };
    },
    afterResolve(args) {
      if (typeof window !== 'undefined') {
        return args;
      }

      const generation = getSsrRuntime()?.pinRemote?.({
        remote: args.remote,
        remoteInfo: args.remoteInfo,
      });

      if (!generation) {
        return args;
      }

      return {
        ...args,
        remote: {
          ...args.remote,
          name: generation.runtimeName,
        },
      };
    },
    async loadEntry(args) {
      const attachedRemote = getAttachedRemoteContainer(
        args.remoteInfo.entryGlobalName,
      );
      if (attachedRemote) {
        return attachedRemote as never;
      }

      if (typeof window !== 'undefined') {
        return undefined as never;
      }

      return (await getSsrRuntime()?.loadEntry?.({
        loaderHook: args.loaderHook,
        remoteInfo: args.remoteInfo,
      })) as never;
    },
    loadRemoteSnapshot(args) {
      const { from, manifestJson, manifestUrl, options, remoteSnapshot } = args;

      if (
        from !== 'manifest' ||
        !manifestUrl ||
        !manifestJson ||
        !('publicPath' in remoteSnapshot)
      ) {
        return args;
      }

      const publicPath = normalizeRemotePublicPath({
        inBrowser: options?.inBrowser,
        manifestUrl,
        publicPath: remoteSnapshot.publicPath,
      });

      if (!publicPath) {
        return args;
      }

      remoteSnapshot.publicPath = publicPath;

      if ('publicPath' in manifestJson.metaData) {
        manifestJson.metaData.publicPath = publicPath;
      }

      return args;
    },
    onLoad(args) {
      if (args?.remote?.name && args?.expose) {
        getSsrRuntime()?.record?.(args.remote.name, args.expose);
      }

      if (typeof window !== 'undefined') {
        return args;
      }

      const moduleOrFactory = args.exposeModuleFactory || args.exposeModule;
      if (!moduleOrFactory) {
        return args;
      }

      const shimmedModule = createServerModuleShim(moduleOrFactory);
      if (shimmedModule !== undefined) {
        return shimmedModule as never;
      }

      return args;
    },
  };
}
