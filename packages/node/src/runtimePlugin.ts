import type {
  ModuleFederationRuntimePlugin,
  ModuleFederation,
} from '@module-federation/runtime';
type WebpackRequire = {
  (id: string): any;
  u: (chunkId: string) => string;
  p: string;
  m: { [key: string]: any };
  o: (obj: any, prop: string) => boolean;
  C?: (chunk: any) => void;
  l: (
    url: string,
    done: (res: any) => void,
    key: string,
    chunkId: string,
  ) => void;
  federation: {
    runtime: {
      loadScriptNode: (
        url: string,
        options: { attrs: { globalName: string } },
      ) => Promise<any>;
    };
    instance: ModuleFederation;
    chunkMatcher?: (chunkId: string) => boolean;
    rootOutputDir?: string;
    initOptions: {
      name: string;
      remotes: any;
    };
  };
  f?: {
    require?: (chunkId: string, promises: any[]) => void;
    readFileVm?: (chunkId: string, promises: any[]) => void;
  };
};

declare const __webpack_require__: WebpackRequire;
declare const __non_webpack_require__: (id: string) => any;

export const nodeRuntimeImportCache = new Map<string, Promise<any>>();
const CHUNK_PREVIEW_LENGTH = 240;
type ChunkResolutionSource = 'public-path' | 'remote-entry-fallback';
type ChunkLocationSource = 'filesystem' | 'remote-url';
type ChunkUrlMetadata = {
  chunkName: string;
  publicPath?: string;
  remoteName?: string;
  rootOutputDir?: string;
  resolvedFrom: ChunkResolutionSource;
  remoteEntryUrl?: string;
};

const getChunkPreview = (content: string): string =>
  content.slice(0, CHUNK_PREVIEW_LENGTH).replace(/\s+/g, ' ').trim();

const enrichChunkExecutionError = (
  error: unknown,
  options: {
    chunkName: string;
    location: string;
    source: ChunkLocationSource;
    content: string;
    hostName?: string;
    resolution?: ChunkUrlMetadata;
  },
): Error => {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));
  const preview = getChunkPreview(options.content);
  const details = [
    `Federated chunk execution failed.`,
    `chunk: ${options.chunkName}`,
    `source: ${options.source}`,
    `location: ${options.location}`,
  ];

  if (options.hostName) {
    details.push(`host: ${options.hostName}`);
  }

  if (options.resolution) {
    details.push(`resolved-from: ${options.resolution.resolvedFrom}`);

    if (options.resolution.remoteName) {
      details.push(`remote: ${options.resolution.remoteName}`);
    }

    if (options.resolution.publicPath) {
      details.push(`public-path: ${options.resolution.publicPath}`);
    }

    if (options.resolution.rootOutputDir) {
      details.push(`root-output-dir: ${options.resolution.rootOutputDir}`);
    }

    if (options.resolution.remoteEntryUrl) {
      details.push(`remote-entry: ${options.resolution.remoteEntryUrl}`);
    }
  }

  if (preview) {
    details.push(`preview: ${preview}`);
  }

  normalizedError.message = `${normalizedError.message}\n${details.join('\n')}`;

  Object.assign(normalizedError, {
    chunkName: options.chunkName,
    chunkLocation: options.location,
    chunkSource: options.source,
    chunkPreview: preview,
    chunkHostName: options.hostName,
    chunkResolution: options.resolution,
  });

  return normalizedError;
};

export function importNodeModule<T>(name: string): Promise<T> {
  if (!name) {
    throw new Error('import specifier is required');
  }

  // Check cache to prevent infinite recursion
  if (nodeRuntimeImportCache.has(name)) {
    return nodeRuntimeImportCache.get(name)!;
  }

  const importModule = new Function('name', `return import(name)`);
  const promise = importModule(name)
    .then((res: any) => res.default as T)
    .catch((error: any) => {
      console.error(`Error importing module ${name}:`, error);
      // Remove from cache on error so it can be retried
      nodeRuntimeImportCache.delete(name);
      throw error;
    });

  // Cache the promise to prevent recursive calls
  nodeRuntimeImportCache.set(name, promise);
  return promise;
}

// Hoisted utility function to resolve file paths for chunks
export const resolveFile = (rootOutputDir: string, chunkId: string): string => {
  const path = __non_webpack_require__('path');
  return path.join(__dirname, rootOutputDir + __webpack_require__.u(chunkId));
};

// Hoisted utility function to get remote entry from cache
export const returnFromCache = (remoteName: string): string | null => {
  const globalThisVal = new Function('return globalThis')();
  const federationInstances = globalThisVal['__FEDERATION__']['__INSTANCES__'];
  for (const instance of federationInstances) {
    const moduleContainer = instance.moduleCache.get(remoteName);
    if (moduleContainer?.remoteInfo) return moduleContainer.remoteInfo.entry;
  }
  return null;
};

// Hoisted utility function to get remote entry from global instances
export const returnFromGlobalInstances = (
  remoteName: string,
): string | null => {
  const globalThisVal = new Function('return globalThis')();
  const federationInstances = globalThisVal['__FEDERATION__']['__INSTANCES__'];
  for (const instance of federationInstances) {
    for (const remote of instance.options.remotes) {
      if (remote.name === remoteName || remote.alias === remoteName) {
        console.log('Backup remote entry found:', remote.entry);
        return remote.entry;
      }
    }
  }
  return null;
};

// V8 keeps every distinct script it compiles in an isolate-wide compilation
// cache (source text plus compiled code) that is only evicted under heap
// pressure measured against V8's own limit, not a container's. Remote code is
// exactly the code that changes with every deployment, so keep it out of the
// cache. Strategy, selectable with FEDERATION_COMPILATION_CACHE:
//   flag (default): flip --no-compilation-cache around the synchronous compile
//                   via v8.setFlagsFromString, no stall, nothing else affected;
//   gc:             compile normally, then run one full garbage collection
//                   through the inspector once the compile burst settles. That
//                   collection clears the whole cache (a snapshot would too, but
//                   costs seconds on a large heap). For hosts where the flag is
//                   unavailable or ineffective; also the automatic fallback when
//                   v8.setFlagsFromString is missing;
//   off:            leave the cache alone (FEDERATION_KEEP_COMPILATION_CACHE=true
//                   is the legacy spelling).
type CompilationCacheStrategy = 'flag' | 'gc' | 'off';
let compilationCacheGcTimer: ReturnType<typeof setTimeout> | undefined;

function compilationCacheStrategy(): CompilationCacheStrategy {
  const configured = process.env['FEDERATION_COMPILATION_CACHE'];
  if (configured === 'flag' || configured === 'gc' || configured === 'off') {
    return configured;
  }
  return process.env['FEDERATION_KEEP_COMPILATION_CACHE'] === 'true'
    ? 'off'
    : 'flag';
}

function scheduleCompilationCacheClear(): void {
  if (compilationCacheGcTimer) {
    return;
  }
  compilationCacheGcTimer = setTimeout(() => {
    compilationCacheGcTimer = undefined;
    // A full collection through the inspector clears the cache. Under Node's
    // permission model the inspector is denied; an exposed gc() with V8's
    // last-resort flavor (NODE_OPTIONS=--expose-gc) clears it too.
    try {
      const inspector = __non_webpack_require__(
        'inspector',
      ) as typeof import('inspector');
      const session = new inspector.Session();
      session.connect();
      // The collection completes asynchronously (~100 ms). Disconnecting before
      // the callback cancels it; disconnecting inside the callback deadlocks the
      // session. Disconnect on the next macrotask after completion.
      session.post('HeapProfiler.collectGarbage', () => {
        setImmediate(() => session.disconnect());
      });
      return;
    } catch {
      // fall through
    }
    const exposedGc = (globalThis as { gc?: (options?: object) => void }).gc;
    if (typeof exposedGc === 'function') {
      try {
        exposedGc({ type: 'major', execution: 'sync', flavor: 'last-resort' });
      } catch {
        // nothing else can clear the cache in-process
      }
    }
  }, 1000);
  if (typeof compilationCacheGcTimer.unref === 'function') {
    compilationCacheGcTimer.unref();
  }
}

export const withoutCompilationCache = <T>(compile: () => T): T => {
  if (typeof process === 'undefined') {
    return compile();
  }
  const strategy = compilationCacheStrategy();
  if (strategy === 'off') {
    return compile();
  }
  if (strategy === 'flag') {
    let v8: { setFlagsFromString?: (flags: string) => void } | undefined;
    try {
      v8 = __non_webpack_require__('v8');
    } catch {
      v8 = undefined;
    }
    if (v8 && typeof v8.setFlagsFromString === 'function') {
      v8.setFlagsFromString('--no-compilation-cache');
      try {
        return compile();
      } finally {
        v8.setFlagsFromString('--compilation-cache');
      }
    }
  }
  const result = compile();
  scheduleCompilationCacheClear();
  return result;
};

const CHUNK_WRAPPER_PARAMS = ['exports', 'require', '__dirname', '__filename'];

type ChunkFunction = (
  exports: any,
  require: any,
  dirname: string,
  filename: string,
) => void;

// Compiles a chunk body into a callable without direct `eval`. Functions created
// by direct eval capture the enclosing scope, which pinned the multi-megabyte
// chunk source string (and everything else in scope) for as long as any function
// from the chunk stayed alive. On Node this uses `vm.Script`, which also keeps
// real filenames in stack traces; edge runtimes without `vm` fall back to
// `new Function`, the eval variant that does not capture scope.
export const compileChunk = (
  source: string,
  filename: string,
): ChunkFunction => {
  if (typeof process !== 'undefined') {
    const vm = __non_webpack_require__('vm') as typeof import('vm');
    const script = withoutCompilationCache(
      () =>
        new vm.Script(
          `(function(${CHUNK_WRAPPER_PARAMS.join(', ')}) {${source}\n})`,
          {
            filename,
            importModuleDynamically:
              //@ts-ignore
              vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ?? importNodeModule,
          },
        ),
    );
    return script.runInThisContext() as ChunkFunction;
  }
  return new Function(...CHUNK_WRAPPER_PARAMS, source) as ChunkFunction;
};

// Hoisted utility function to load chunks from filesystem
export const loadFromFs = (
  filename: string,
  callback: (err: Error | null, chunk: any) => void,
): void => {
  const fs = __non_webpack_require__('fs') as typeof import('fs');
  const path = __non_webpack_require__('path') as typeof import('path');

  if (fs.existsSync(filename)) {
    fs.readFile(filename, 'utf-8', (err, content) => {
      if (err) return callback(err, null);
      const chunk = {};
      try {
        compileChunk(content, filename)(
          chunk,
          __non_webpack_require__,
          path.dirname(filename),
          filename,
        );
        callback(null, chunk);
      } catch (e) {
        callback(
          enrichChunkExecutionError(e, {
            chunkName: path.basename(filename),
            location: filename,
            source: 'filesystem',
            content,
          }),
          null,
        );
      }
    });
  } else {
    callback(new Error(`File ${filename} does not exist`), null);
  }
};

// Hoisted utility function to fetch and execute chunks from remote URLs
export const fetchAndRun = (
  url: URL,
  chunkName: string,
  callback: (err: Error | null, chunk: any) => void,
  args: any,
): void => {
  (typeof fetch === 'undefined'
    ? importNodeModule<typeof import('node-fetch')>('node-fetch').then(
        (mod) => mod.default,
      )
    : Promise.resolve(fetch)
  )
    .then((fetchFunction) => {
      return args.origin.loaderHook.lifecycle.fetch
        .emit(url.href, {})
        .then((res: Response | null) => {
          if (!res || !(res instanceof Response)) {
            return fetchFunction(url.href).then((response) => response.text());
          }
          return res.text();
        });
    })
    .then((data) => {
      const chunk = {};
      const hostName = args?.origin?.options?.name || args?.origin?.name;
      const resolution = (url as URL & { mfMetadata?: ChunkUrlMetadata })
        .mfMetadata;
      try {
        compileChunk(data, url.href)(
          chunk,
          __non_webpack_require__,
          url.pathname.split('/').slice(0, -1).join('/'),
          chunkName,
        );
        callback(null, chunk);
      } catch (e) {
        callback(
          enrichChunkExecutionError(e, {
            chunkName,
            location: url.href,
            source: 'remote-url',
            content: data,
            hostName,
            resolution,
          }),
          null,
        );
      }
    })
    .catch((err: Error) => callback(err, null));
};

// Hoisted utility function to resolve URLs for chunks
export const resolveUrl = (
  remoteName: string,
  chunkName: string,
): URL | null => {
  try {
    return Object.assign(new URL(chunkName, __webpack_require__.p), {
      mfMetadata: {
        chunkName,
        publicPath: __webpack_require__.p,
        remoteName,
        rootOutputDir: __webpack_require__.federation.rootOutputDir || '',
        resolvedFrom: 'public-path' as const,
      },
    });
  } catch {
    const entryUrl =
      returnFromCache(remoteName) || returnFromGlobalInstances(remoteName);

    if (!entryUrl) return null;

    const url = new URL(entryUrl);
    const path = __non_webpack_require__('path');

    // Extract the directory path from the remote entry URL
    // e.g., from "http://url/static/js/remoteEntry.js" to "/static/js/"
    const urlPath = url.pathname;
    const lastSlashIndex = urlPath.lastIndexOf('/');
    const directoryPath =
      lastSlashIndex >= 0 ? urlPath.substring(0, lastSlashIndex + 1) : '/';

    // Get rootDir from webpack configuration
    const rootDir = __webpack_require__.federation.rootOutputDir || '';

    // Use path.join to combine the paths properly while handling slashes
    // Convert Windows-style paths to URL-style paths
    const combinedPath = path
      .join(directoryPath, rootDir, chunkName)
      .replace(/\\/g, '/');
    // Create the final URL
    return Object.assign(new URL(combinedPath, url.origin), {
      mfMetadata: {
        chunkName,
        publicPath: __webpack_require__.p,
        remoteName,
        rootOutputDir: rootDir,
        resolvedFrom: 'remote-entry-fallback' as const,
        remoteEntryUrl: entryUrl,
      },
    });
  }
};

// Hoisted utility function to load chunks based on different strategies
export const loadChunk = (
  strategy: string,
  chunkId: string,
  rootOutputDir: string,
  callback: (err: Error | null, chunk: any) => void,
  args: any,
): void => {
  if (strategy === 'filesystem') {
    return loadFromFs(resolveFile(rootOutputDir, chunkId), callback);
  }

  const url = resolveUrl(rootOutputDir, chunkId);
  if (!url) return callback(null, { modules: {}, ids: [], runtime: null });

  // Using fetchAndRun directly with args
  fetchAndRun(url, chunkId, callback, args);
};

// Hoisted utility function to install a chunk into webpack
export const installChunk = (
  chunk: any,
  installedChunks: { [key: string]: any },
): void => {
  for (const moduleId in chunk.modules) {
    __webpack_require__.m[moduleId] = chunk.modules[moduleId];
  }
  if (chunk.runtime) chunk.runtime(__webpack_require__);
  for (const chunkId of chunk.ids) {
    if (installedChunks[chunkId]) installedChunks[chunkId][0]();
    installedChunks[chunkId] = 0;
  }
};

// Hoisted utility function to remove a chunk on fail
export const deleteChunk = (
  chunkId: string,
  installedChunks: { [key: string]: any },
): boolean => {
  delete installedChunks[chunkId];
  return true;
};

// Hoisted function to set up webpack script loader
export const setupScriptLoader = (): void => {
  __webpack_require__.l = (
    url: string,
    done: (res: any) => void,
    key: string,
    chunkId: string,
  ): void => {
    if (!key || chunkId)
      throw new Error(`__webpack_require__.l name is required for ${url}`);
    __webpack_require__.federation.runtime
      .loadScriptNode(url, { attrs: { globalName: key } })
      .then((res) => {
        const enhancedRemote =
          __webpack_require__.federation.instance.initRawContainer(
            key,
            url,
            res,
          );
        new Function('return globalThis')()[key] = enhancedRemote;
        done(enhancedRemote);
      })
      .catch(done);
  };
};

// Hoisted function to set up chunk handler
export const setupChunkHandler = (
  installedChunks: { [key: string]: any },
  args: any,
): ((chunkId: string, promises: any[]) => void) => {
  return (chunkId: string, promises: any[]): void => {
    let installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) {
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        const matcher = __webpack_require__.federation.chunkMatcher
          ? __webpack_require__.federation.chunkMatcher(chunkId)
          : true;

        if (matcher) {
          const promise = new Promise((resolve, reject) => {
            installedChunkData = installedChunks[chunkId] = [resolve, reject];
            const fs =
              typeof process !== 'undefined'
                ? __non_webpack_require__('fs')
                : false;
            const filename =
              typeof process !== 'undefined'
                ? resolveFile(
                    __webpack_require__.federation.rootOutputDir || '',
                    chunkId,
                  )
                : false;

            if (fs && fs.existsSync(filename)) {
              loadChunk(
                'filesystem',
                chunkId,
                __webpack_require__.federation.rootOutputDir || '',
                (err, chunk) => {
                  if (err)
                    return deleteChunk(chunkId, installedChunks) && reject(err);
                  if (chunk) installChunk(chunk, installedChunks);
                  resolve(chunk);
                },
                args,
              );
            } else {
              const chunkName = __webpack_require__.u(chunkId);
              const loadingStrategy =
                typeof process === 'undefined' ? 'http-eval' : 'http-vm';
              loadChunk(
                loadingStrategy,
                chunkName,
                __webpack_require__.federation.initOptions.name,
                (err, chunk) => {
                  if (err)
                    return deleteChunk(chunkId, installedChunks) && reject(err);
                  if (chunk) installChunk(chunk, installedChunks);
                  resolve(chunk);
                },
                args,
              );
            }
          });
          promises.push((installedChunkData[2] = promise));
        } else {
          installedChunks[chunkId] = 0;
        }
      }
    }
  };
};

// Hoisted function to set up webpack require patching
export const setupWebpackRequirePatching = (
  handle: (chunkId: string, promises: any[]) => void,
): void => {
  if (__webpack_require__.f) {
    if (__webpack_require__.f.require) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        'CAUTION: build target is not set to "async-node", attempting to patch additional chunk handlers. This may not work',
      );
      __webpack_require__.f.require = handle;
    }

    if (__webpack_require__.f.readFileVm) {
      __webpack_require__.f.readFileVm = handle;
    }
  }
};

export default function (): ModuleFederationRuntimePlugin {
  return {
    name: 'node-federation-plugin',
    beforeInit(args) {
      // Patch webpack chunk loading handlers
      (() => {
        // Create the chunk tracking object
        const installedChunks: { [key: string]: any } = {};

        // Set up webpack script loader
        setupScriptLoader();

        // Create and set up the chunk handler
        const handle = setupChunkHandler(installedChunks, args);

        // Patch webpack require
        setupWebpackRequirePatching(handle);
      })();

      return args;
    },
  };
}
