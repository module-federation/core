import {
  getLynxRealm,
  getLynxRuntime,
  getRemoteOriginKey,
  getRegistryKey,
  isRecord,
  LYNX_BUNDLE_REGISTRY,
  type LynxGlobal,
} from './runtimeCore';
import { createLazyChunkLoadController } from './lazyChunkLoadController';

type ChunkId = string | number;
export type ChunkPromise = PromiseLike<unknown>;
type ChunkHandler = (chunkId: ChunkId, promises: ChunkPromise[]) => void;

export interface LynxWebpackRequire {
  consumesLoadingData?: {
    chunkMapping?: Record<string, string[] | undefined>;
  };
  f: Record<string, ChunkHandler | undefined>;
  lynx_aci?: Record<string, string | undefined>;
  lynx_chunking?: 'single' | 'split';
  lynx_public_path_auto?: boolean;
  m: Record<string, unknown>;
  p?: string;
  u(chunkId: ChunkId): string;
}

export interface LynxChunk {
  __lynx_dynamic_component_entry__?: string;
  ids: ChunkId[];
  modules: Record<string, unknown>;
  runtime?: (webpackRequire: LynxWebpackRequire) => void;
}

export type InstalledChunk =
  | 0
  | [
      ((value?: unknown) => void) | undefined,
      ((error: unknown) => void) | undefined,
      ChunkPromise | undefined,
    ];

const isChunk = (value: unknown): value is LynxChunk =>
  isRecord(value) &&
  Array.isArray(value.ids) &&
  isRecord(value.modules) &&
  (value.runtime === undefined || typeof value.runtime === 'function');

const getChunkSectionPath = (filename: string): string =>
  filename.split(/[?#]/, 1)[0].replace(/\.js$/, '');

const joinRemoteUrl = (
  entryUrl: string,
  publicPath: string | undefined,
  assetPath: string,
): string => {
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(assetPath)) {
    return assetPath;
  }

  const entry = entryUrl.split(/[?#]/, 1)[0];
  const origin = entry.match(/^(?:[a-z][a-z\d+.-]*:)?\/\/[^/]+/i)?.[0] ?? '';
  const base =
    publicPath && publicPath !== 'auto'
      ? publicPath
      : entry.slice(0, entry.lastIndexOf('/') + 1);
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(base)) {
    return `${base.replace(/\/$/, '')}/${assetPath.replace(/^\//, '')}`;
  }
  if (base.startsWith('/')) {
    return `${origin}${base.replace(/\/$/, '')}/${assetPath.replace(/^\//, '')}`;
  }
  return `${entry.slice(0, entry.lastIndexOf('/') + 1)}${base}${assetPath}`;
};

const installChunk = (
  chunk: LynxChunk,
  webpackRequire: LynxWebpackRequire,
  installedChunks: Record<string, InstalledChunk | undefined>,
  globalObject: LynxGlobal,
): void => {
  const entryName = chunk.__lynx_dynamic_component_entry__;
  const modules = Object.fromEntries(
    Object.entries(chunk.modules).map(([id, factory]) => [
      id,
      typeof factory !== 'function' || !entryName
        ? factory
        : function wrappedFactory(
            this: unknown,
            module: unknown,
            exports: unknown,
            runtimeRequire: LynxWebpackRequire,
          ) {
            const hadEntryName = Object.prototype.hasOwnProperty.call(
              globalObject,
              'globDynamicComponentEntry',
            );
            const previousEntryName = globalObject.globDynamicComponentEntry;
            globalObject.globDynamicComponentEntry = entryName;
            try {
              return factory.call(this, module, exports, runtimeRequire);
            } finally {
              if (hadEntryName) {
                globalObject.globDynamicComponentEntry = previousEntryName;
              } else {
                delete globalObject.globDynamicComponentEntry;
              }
            }
          },
    ]),
  );
  Object.assign(webpackRequire.m, modules);
  chunk.runtime?.(webpackRequire);

  for (const id of chunk.ids) {
    const installed = installedChunks[id];
    if (installed) {
      installed[0]?.(chunk);
    }
    installedChunks[id] = 0;
  }
};

const installChunkAfterConsumes = (
  chunk: LynxChunk,
  webpackRequire: LynxWebpackRequire,
  installedChunks: Record<string, InstalledChunk | undefined>,
  globalObject: LynxGlobal,
  isActive: () => boolean = () => true,
): Promise<void> | undefined => {
  const getMissingConsumes = (): string[] =>
    chunk.ids.flatMap(
      (id) =>
        webpackRequire.consumesLoadingData?.chunkMapping?.[String(id)]?.filter(
          (moduleId) => typeof webpackRequire.m[moduleId] !== 'function',
        ) ?? [],
    );
  const install = (): void => {
    if (!isActive()) {
      return;
    }
    const missing = getMissingConsumes();
    if (missing.length > 0) {
      throw new Error(
        `Lynx chunk shared dependencies were not installed: ${missing.join(', ')}.`,
      );
    }
    installChunk(chunk, webpackRequire, installedChunks, globalObject);
  };
  const consume = webpackRequire.f.consumes;
  if (!consume) {
    install();
    return;
  }

  const promises: Promise<unknown>[] = [];
  for (const id of chunk.ids) {
    consume(id, promises);
  }
  if (promises.length === 0) {
    install();
    return;
  }
  const participatingLoads = new Map(
    chunk.ids.map((id) => [id, installedChunks[id]]),
  );

  return Promise.all(promises).then(
    () => {
      install();
    },
    (error) => {
      if (!isActive()) {
        throw error;
      }
      for (const id of chunk.ids) {
        const installed = installedChunks[id];
        if (installed && installed === participatingLoads.get(id)) {
          installed[1]?.(error);
        }
      }
      throw error;
    },
  );
};

interface QueryResolver {
  promise: Promise<unknown>;
  reject(error: Error): void;
  resolve(value: unknown): void;
}

const createQueryResolver = (): QueryResolver => {
  let resolve!: (value: unknown) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<unknown>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
};

const queryError = (request: string, result: unknown): Error => {
  const error = new Error(`Failed to load Lynx lazy bundle "${request}".`);
  (error as Error & { cause?: string }).cause = JSON.stringify(result);
  return error;
};

const loadQueryComponent = (
  request: string,
  lynx: NonNullable<ReturnType<typeof getLynxRuntime>>,
  globalObject: LynxGlobal,
  hostOverride?: string,
): PromiseLike<unknown> => {
  const host =
    hostOverride ??
    (typeof globalObject.globDynamicComponentEntry === 'string'
      ? globalObject.globDynamicComponentEntry
      : undefined);
  if (typeof lynx.loadLazyBundle === 'function') {
    return host === undefined
      ? lynx.loadLazyBundle(request)
      : lynx.loadLazyBundle(request, undefined, host);
  }
  const nativeLynx = lynx.getNativeLynx?.();
  if (typeof nativeLynx?.loadLazyBundle === 'function') {
    return host === undefined
      ? nativeLynx.loadLazyBundle(request)
      : nativeLynx.loadLazyBundle(request, undefined, host);
  }

  if (getLynxRealm(lynx) === 'main-thread') {
    const queryComponent = globalObject.__QueryComponent;
    if (!queryComponent) {
      return Promise.reject(
        new Error(
          'Lynx main-thread split chunk loading requires __QueryComponent.',
        ),
      );
    }
    const resolver = createQueryResolver();
    try {
      const query = queryComponent(request, (result) => {
        if (result.code === 0 && result.data && 'evalResult' in result.data) {
          resolver.resolve(result.data.evalResult);
        } else {
          resolver.reject(queryError(request, result));
        }
      });
      if (query && 'evalResult' in query) {
        resolver.resolve(query.evalResult);
      }
    } catch (error) {
      resolver.reject(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
    return resolver.promise;
  }

  const queryComponent = lynx.QueryComponent ?? nativeLynx?.QueryComponent;
  const getExports =
    globalObject.lynxCoreInject?.tt?.getDynamicComponentExports;
  if (!queryComponent) {
    return Promise.reject(
      new Error('Lynx background split chunk loading requires QueryComponent.'),
    );
  }

  const resolver = createQueryResolver();
  queryComponent(request, (result) => {
    const schema =
      isRecord(result) && isRecord(result.detail)
        ? result.detail.schema
        : undefined;
    if (typeof schema === 'string' && !getExports) {
      resolver.reject(
        new Error(
          'Lynx background split chunk loading requires getDynamicComponentExports.',
        ),
      );
      return;
    }
    const exports =
      isRecord(result) && result.code === 0 && typeof schema === 'string'
        ? getExports!(schema)
        : undefined;
    if (exports !== undefined) {
      resolver.resolve(exports);
      return;
    }
    resolver.reject(queryError(request, result));
  });
  return resolver.promise;
};

export const patchLynxChunkLoading = (
  webpackRequire: LynxWebpackRequire,
  originName: string,
  globalObject: LynxGlobal = globalThis as LynxGlobal,
  timeout = 30_000,
): boolean => {
  const lynx = getLynxRuntime(globalObject);
  if (!lynx?.loadScript) {
    return false;
  }
  const { loadScript } = lynx;

  const registry = globalObject[LYNX_BUNDLE_REGISTRY];
  const registeredBundleName =
    registry?.get(originName) ??
    registry?.get(getRegistryKey(originName, getLynxRealm(lynx)));
  if (!registeredBundleName && !webpackRequire.lynx_aci) {
    return false;
  }
  const baseName = originName.replace(/__main_thread$/, '');
  const registeredRemoteOrigin = registry?.get(getRemoteOriginKey(baseName));
  const getBundleName = (): string | undefined =>
    registeredBundleName ??
    globalObject[LYNX_BUNDLE_REGISTRY]?.get(originName) ??
    globalObject[LYNX_BUNDLE_REGISTRY]?.get(
      getRegistryKey(originName, getLynxRealm(lynx)),
    );

  const installedChunks: Record<string, InstalledChunk | undefined> = {};

  const loadChunk: ChunkHandler = (chunkId, promises) => {
    const key = String(chunkId);
    const installed = installedChunks[key];
    if (installed === 0) {
      return;
    }
    if (installed) {
      if (installed[2]) {
        promises.push(installed[2]);
      }
      return;
    }

    const lazyBundlePath =
      webpackRequire.lynx_chunking === 'single'
        ? undefined
        : webpackRequire.lynx_aci?.[key];
    if (lazyBundlePath) {
      const currentRegistry = globalObject[LYNX_BUNDLE_REGISTRY];
      const loadingHost =
        registeredRemoteOrigin ??
        currentRegistry?.get(getRemoteOriginKey(baseName));
      const remoteOrigin =
        loadingHost ?? getBundleName() ?? webpackRequire.p ?? '';
      const request = joinRemoteUrl(
        remoteOrigin,
        webpackRequire.lynx_public_path_auto ? undefined : webpackRequire.p,
        lazyBundlePath,
      );
      const controller = createLazyChunkLoadController({
        chunkKey: key,
        installedChunks,
        timeout,
        loadQueryComponent: (lazyRequest) =>
          loadQueryComponent(lazyRequest, lynx, globalObject, loadingHost),
        isChunk,
        installChunkAfterConsumes: (chunk, isCurrent) =>
          installChunkAfterConsumes(
            chunk,
            webpackRequire,
            installedChunks,
            globalObject,
            isCurrent,
          ),
      });
      promises.push(controller.load(request));
      return;
    }

    if (webpackRequire.lynx_aci && !getBundleName()) {
      return;
    }

    let resolveChunk!: (value?: unknown) => void;
    let rejectChunk!: (error: unknown) => void;
    const promise = new Promise<unknown>((resolve, reject) => {
      resolveChunk = resolve;
      rejectChunk = reject;
    });
    installedChunks[key] = [resolveChunk, rejectChunk, promise];
    promises.push(promise);

    try {
      const bundleName = getBundleName();
      if (!bundleName) {
        throw new Error(
          `Lynx section loading requires a registered bundle for "${originName}".`,
        );
      }
      const sectionPath = getChunkSectionPath(webpackRequire.u(chunkId));
      const value = loadScript(sectionPath, { bundleName });
      if (!isChunk(value)) {
        throw new Error(
          `Lynx section "${sectionPath}" did not export a valid webpack chunk.`,
        );
      }
      if (!value.ids.some((id) => String(id) === key)) {
        throw new Error(
          `Lynx section "${sectionPath}" did not include requested chunk "${key}".`,
        );
      }
      installChunk(value, webpackRequire, installedChunks, globalObject);
    } catch (error) {
      delete installedChunks[key];
      rejectChunk(error);
    }
  };

  const configuredHandlers = ['j', 'require'].filter(
    (key) => webpackRequire.f[key] !== undefined,
  );
  for (const key of configuredHandlers.length > 0
    ? configuredHandlers
    : ['j']) {
    webpackRequire.f[key] = loadChunk;
  }

  return true;
};
