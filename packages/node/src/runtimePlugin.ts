import type {
  ModuleFederationRuntimePlugin,
  ModuleFederation,
} from '@module-federation/runtime';

type BeforeInitArgs = any;
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

type RuntimePluginInitArgs = BeforeInitArgs & {
  options?: {
    webpackRequire?: WebpackRequire;
  };
  userOptions?: {
    webpackRequire?: WebpackRequire;
  };
  origin?: {
    name?: string;
    options?: {
      webpackRequire?: WebpackRequire;
    };
    loaderHook?: any;
  };
};

const isWebpackRequire = (value: unknown): value is WebpackRequire =>
  typeof value === 'function' ||
  (typeof value === 'object' && value !== null && 'federation' in value);

const resolveWebpackRequire = (
  args?: RuntimePluginInitArgs,
): WebpackRequire => {
  const webpackRequireFromArgs =
    args?.options?.webpackRequire ||
    args?.userOptions?.webpackRequire ||
    args?.origin?.options?.webpackRequire;

  if (isWebpackRequire(webpackRequireFromArgs)) {
    return webpackRequireFromArgs;
  }

  return __webpack_require__;
};

const __mfRuntimeDebugState =
  (globalThis as any).__mfRuntimeDebugState ||
  ((globalThis as any).__mfRuntimeDebugState = {
    chunkStrategyLogs: 0,
    loadFromFsMissLogs: 0,
    resolveUrlLogs: 0,
    patchLogs: 0,
    beforeInitLogs: 0,
    chunkPipelineLogs: 0,
    installChunkLogs: 0,
  });

export const nodeRuntimeImportCache = new Map<string, Promise<any>>();

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
export const resolveFile = (
  rootOutputDir: string,
  chunkId: string,
  webpackRequire: WebpackRequire = __webpack_require__,
): string => {
  const path = __non_webpack_require__('path');
  return path.join(__dirname, rootOutputDir + webpackRequire.u(chunkId));
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

// Hoisted utility function to load chunks from filesystem
export const loadFromFs = (
  filename: string,
  callback: (err: Error | null, chunk: any) => void,
): void => {
  const fs = __non_webpack_require__('fs') as typeof import('fs');
  const path = __non_webpack_require__('path') as typeof import('path');
  const vm = __non_webpack_require__('vm') as typeof import('vm');

  if (fs.existsSync(filename)) {
    fs.readFile(filename, 'utf-8', (err, content) => {
      if (err) return callback(err, null);
      const chunk = {};
      try {
        const script = new vm.Script(
          `(function(exports, require, __dirname, __filename) {${content}\n})`,
          {
            filename,
            importModuleDynamically:
              //@ts-ignore
              vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ?? importNodeModule,
          },
        );
        script.runInThisContext()(
          chunk,
          __non_webpack_require__,
          path.dirname(filename),
          filename,
        );
        callback(null, chunk);
      } catch (e) {
        console.log("'runInThisContext threw'", e);
        callback(e as Error, null);
      }
    });
  } else {
    if (__mfRuntimeDebugState.loadFromFsMissLogs < 10) {
      __mfRuntimeDebugState.loadFromFsMissLogs += 1;
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'nested-webpack-run1',
            hypothesisId: 'H3',
            location: 'packages/node/src/runtimePlugin.ts:loadFromFs',
            message: 'filesystem chunk lookup missed',
            data: { filename },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    }
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
  if (__mfRuntimeDebugState.chunkPipelineLogs < 60) {
    __mfRuntimeDebugState.chunkPipelineLogs += 1;
    // #region agent log
    fetch('http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '7e9739',
      },
      body: JSON.stringify({
        sessionId: '7e9739',
        runId: 'nested-webpack-run6',
        hypothesisId: 'H13',
        location: 'packages/node/src/runtimePlugin.ts:fetchAndRun',
        message: 'starting remote chunk fetch pipeline',
        data: {
          chunkName,
          urlHref: url.href,
          urlPath: url.pathname,
          urlHost: url.host,
          urlProtocol: url.protocol,
          originName: args?.origin?.name,
          webpackPublicPath:
            args?.options?.webpackRequire?.p || __webpack_require__.p,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }
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
      if (__mfRuntimeDebugState.chunkPipelineLogs < 60) {
        __mfRuntimeDebugState.chunkPipelineLogs += 1;
        // #region agent log
        fetch(
          'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Debug-Session-Id': '7e9739',
            },
            body: JSON.stringify({
              sessionId: '7e9739',
              runId: 'nested-webpack-run6',
              hypothesisId: 'H13',
              location: 'packages/node/src/runtimePlugin.ts:fetchAndRun',
              message: 'fetched remote chunk source',
              data: {
                chunkName,
                urlHref: url.href,
                dataLength: typeof data === 'string' ? data.length : -1,
                containsWebpackPublicPath:
                  typeof data === 'string' &&
                  data.includes('__webpack_require__.p'),
                containsSsrStaticPath:
                  typeof data === 'string' &&
                  data.includes('/_next/static/ssr/'),
                containsReadFileVm:
                  typeof data === 'string' && data.includes('readFileVm'),
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      }
      const chunk = {};
      try {
        eval(`(function(exports, require, __dirname, __filename) {${data}\n})`)(
          chunk,
          __non_webpack_require__,
          url.pathname.split('/').slice(0, -1).join('/'),
          chunkName,
        );
        callback(null, chunk);
      } catch (e) {
        // #region agent log
        fetch(
          'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Debug-Session-Id': '7e9739',
            },
            body: JSON.stringify({
              sessionId: '7e9739',
              runId: 'nested-webpack-run6',
              hypothesisId: 'H13',
              location: 'packages/node/src/runtimePlugin.ts:fetchAndRun',
              message: 'evaluating fetched chunk failed',
              data: {
                chunkName,
                urlHref: url.href,
                errorMessage: (e as any)?.message || String(e),
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
        callback(e as Error, null);
      }
    })
    .catch((err: Error) => {
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'nested-webpack-run6',
            hypothesisId: 'H13',
            location: 'packages/node/src/runtimePlugin.ts:fetchAndRun',
            message: 'fetch pipeline failed',
            data: {
              chunkName,
              urlHref: url.href,
              errorMessage: err?.message || String(err),
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      callback(err, null);
    });
};

// Hoisted utility function to resolve URLs for chunks
export const resolveUrl = (
  remoteName: string,
  chunkName: string,
  webpackRequire: WebpackRequire = __webpack_require__,
): URL | null => {
  try {
    const directUrl = new URL(chunkName, webpackRequire.p);
    if (__mfRuntimeDebugState.chunkPipelineLogs < 60) {
      __mfRuntimeDebugState.chunkPipelineLogs += 1;
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'nested-webpack-run6',
            hypothesisId: 'H13',
            location: 'packages/node/src/runtimePlugin.ts:resolveUrl',
            message: 'resolved chunk URL via webpack publicPath',
            data: {
              remoteName,
              chunkName,
              publicPath: webpackRequire.p,
              resolvedUrl: directUrl.href,
              resolvedPath: directUrl.pathname,
              resolvedHost: directUrl.host,
              resolvedProtocol: directUrl.protocol,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    }
    return directUrl;
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
    const rootDir = webpackRequire.federation.rootOutputDir || '';

    // Use path.join to combine the paths properly while handling slashes
    // Convert Windows-style paths to URL-style paths
    const combinedPath = path
      .join(directoryPath, rootDir, chunkName)
      .replace(/\\/g, '/');
    // Create the final URL
    const fallbackUrl = new URL(combinedPath, url.origin);
    if (__mfRuntimeDebugState.chunkPipelineLogs < 60) {
      __mfRuntimeDebugState.chunkPipelineLogs += 1;
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'nested-webpack-run6',
            hypothesisId: 'H13',
            location: 'packages/node/src/runtimePlugin.ts:resolveUrl',
            message: 'resolved chunk URL via remote entry fallback',
            data: {
              remoteName,
              chunkName,
              entryUrl,
              rootDir,
              directoryPath,
              combinedPath,
              resolvedUrl: fallbackUrl.href,
              resolvedPath: fallbackUrl.pathname,
              resolvedHost: fallbackUrl.host,
              resolvedProtocol: fallbackUrl.protocol,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    }
    return fallbackUrl;
  }
};

// Hoisted utility function to load chunks based on different strategies
export const loadChunk = (
  strategy: string,
  chunkId: string,
  rootOutputDir: string,
  callback: (err: Error | null, chunk: any) => void,
  args: any,
  webpackRequire: WebpackRequire = __webpack_require__,
): void => {
  if (strategy === 'filesystem') {
    return loadFromFs(
      resolveFile(rootOutputDir, chunkId, webpackRequire),
      callback,
    );
  }

  const url = resolveUrl(rootOutputDir, chunkId, webpackRequire);
  if (!url) return callback(null, { modules: {}, ids: [], runtime: null });

  // Using fetchAndRun directly with args
  fetchAndRun(url, chunkId, callback, args);
};

// Hoisted utility function to install a chunk into webpack
export const installChunk = (
  chunk: any,
  installedChunks: { [key: string]: any },
  webpackRequire: WebpackRequire = __webpack_require__,
): void => {
  if (__mfRuntimeDebugState.installChunkLogs < 40) {
    __mfRuntimeDebugState.installChunkLogs += 1;
    // #region agent log
    fetch('http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '7e9739',
      },
      body: JSON.stringify({
        sessionId: '7e9739',
        runId: 'nested-webpack-run7',
        hypothesisId: 'H14',
        location: 'packages/node/src/runtimePlugin.ts:installChunk',
        message: 'about to execute chunk runtime',
        data: {
          hasChunkRuntime: Boolean(chunk?.runtime),
          chunkIds: Array.isArray(chunk?.ids) ? chunk.ids.slice(0, 3) : [],
          webpackPublicPathBefore: webpackRequire.p,
          hasWebpackRequireF: Boolean(webpackRequire.f),
          hasReadFileVmHandler: Boolean(webpackRequire.f?.readFileVm),
          hasRequireHandler: Boolean(webpackRequire.f?.require),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }
  for (const moduleId in chunk.modules) {
    webpackRequire.m[moduleId] = chunk.modules[moduleId];
  }
  if (chunk.runtime) {
    chunk.runtime(webpackRequire);
    if (__mfRuntimeDebugState.installChunkLogs < 40) {
      __mfRuntimeDebugState.installChunkLogs += 1;
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'nested-webpack-run7',
            hypothesisId: 'H14',
            location: 'packages/node/src/runtimePlugin.ts:installChunk',
            message: 'executed chunk runtime',
            data: {
              chunkIds: Array.isArray(chunk?.ids) ? chunk.ids.slice(0, 3) : [],
              webpackPublicPathAfter: webpackRequire.p,
              hasWebpackRequireF: Boolean(webpackRequire.f),
              hasReadFileVmHandler: Boolean(webpackRequire.f?.readFileVm),
              hasRequireHandler: Boolean(webpackRequire.f?.require),
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    }
  }
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
export const setupScriptLoader = (
  webpackRequire: WebpackRequire = __webpack_require__,
): void => {
  webpackRequire.l = (
    url: string,
    done: (res: any) => void,
    key: string,
    chunkId: string,
  ): void => {
    if (!key || chunkId)
      throw new Error(`webpackRequire.l name is required for ${url}`);
    webpackRequire.federation.runtime
      .loadScriptNode(url, { attrs: { globalName: key } })
      .then((res) => {
        const enhancedRemote =
          webpackRequire.federation.instance.initRawContainer(key, url, res);
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
  webpackRequire: WebpackRequire = __webpack_require__,
): ((chunkId: string, promises: any[]) => void) => {
  return (chunkId: string, promises: any[]): void => {
    let installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) {
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        const matcher = webpackRequire.federation.chunkMatcher
          ? webpackRequire.federation.chunkMatcher(chunkId)
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
                    webpackRequire.federation.rootOutputDir || '',
                    chunkId,
                    webpackRequire,
                  )
                : false;

            const chosenStrategy =
              fs && fs.existsSync(filename)
                ? 'filesystem'
                : typeof process === 'undefined'
                  ? 'http-eval'
                  : 'http-vm';
            if (__mfRuntimeDebugState.chunkStrategyLogs < 20) {
              __mfRuntimeDebugState.chunkStrategyLogs += 1;
              // #region agent log
              fetch(
                'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Debug-Session-Id': '7e9739',
                  },
                  body: JSON.stringify({
                    sessionId: '7e9739',
                    runId: 'nested-webpack-run1',
                    hypothesisId: 'H3',
                    location:
                      'packages/node/src/runtimePlugin.ts:setupChunkHandler',
                    message: 'chunk loading strategy decision',
                    data: {
                      chunkId,
                      matcher,
                      rootOutputDir:
                        webpackRequire.federation.rootOutputDir || '',
                      filename,
                      chosenStrategy,
                      chunkFile: webpackRequire.u(chunkId),
                      fsExists:
                        typeof filename === 'string' && fs
                          ? fs.existsSync(filename)
                          : false,
                    },
                    timestamp: Date.now(),
                  }),
                },
              ).catch(() => {});
              // #endregion
            }
            if (fs && fs.existsSync(filename)) {
              loadChunk(
                'filesystem',
                chunkId,
                webpackRequire.federation.rootOutputDir || '',
                (err, chunk) => {
                  if (err)
                    return deleteChunk(chunkId, installedChunks) && reject(err);
                  if (chunk)
                    installChunk(chunk, installedChunks, webpackRequire);
                  resolve(chunk);
                },
                args,
                webpackRequire,
              );
            } else {
              const chunkName = webpackRequire.u(chunkId);
              const loadingStrategy =
                typeof process === 'undefined' ? 'http-eval' : 'http-vm';
              loadChunk(
                loadingStrategy,
                chunkName,
                webpackRequire.federation.initOptions.name,
                (err, chunk) => {
                  if (err)
                    return deleteChunk(chunkId, installedChunks) && reject(err);
                  if (chunk)
                    installChunk(chunk, installedChunks, webpackRequire);
                  resolve(chunk);
                },
                args,
                webpackRequire,
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
  webpackRequire: WebpackRequire = __webpack_require__,
): void => {
  if (__mfRuntimeDebugState.patchLogs < 10) {
    __mfRuntimeDebugState.patchLogs += 1;
    // #region agent log
    fetch('http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '7e9739',
      },
      body: JSON.stringify({
        sessionId: '7e9739',
        runId: 'nested-webpack-run3',
        hypothesisId: 'H9',
        location:
          'packages/node/src/runtimePlugin.ts:setupWebpackRequirePatching',
        message: 'attempting webpack require patch',
        data: {
          hasWebpackRequireF: Boolean(webpackRequire.f),
          hasRequireHandler: Boolean(webpackRequire.f?.require),
          hasReadFileVmHandler: Boolean(webpackRequire.f?.readFileVm),
          runtimePublicPath: webpackRequire.p,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }
  if (webpackRequire.f) {
    if (webpackRequire.f.require) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        'CAUTION: build target is not set to "async-node", attempting to patch additional chunk handlers. This may not work',
      );
      webpackRequire.f.require = handle;
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'nested-webpack-run3',
            hypothesisId: 'H9',
            location:
              'packages/node/src/runtimePlugin.ts:setupWebpackRequirePatching',
            message: 'patched webpackRequire.f.require',
            data: { runtimePublicPath: webpackRequire.p },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    }

    if (webpackRequire.f.readFileVm) {
      webpackRequire.f.readFileVm = handle;
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'nested-webpack-run3',
            hypothesisId: 'H9',
            location:
              'packages/node/src/runtimePlugin.ts:setupWebpackRequirePatching',
            message: 'patched webpackRequire.f.readFileVm',
            data: { runtimePublicPath: webpackRequire.p },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    }
  }
};

export default function (): ModuleFederationRuntimePlugin {
  return {
    name: 'node-federation-plugin',
    beforeInit(args: BeforeInitArgs) {
      const runtimeArgs = args as RuntimePluginInitArgs;
      const webpackRequire = resolveWebpackRequire(runtimeArgs);
      if (__mfRuntimeDebugState.beforeInitLogs < 8) {
        __mfRuntimeDebugState.beforeInitLogs += 1;
        // #region agent log
        fetch(
          'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Debug-Session-Id': '7e9739',
            },
            body: JSON.stringify({
              sessionId: '7e9739',
              runId: 'nested-webpack-run3',
              hypothesisId: 'H9',
              location: 'packages/node/src/runtimePlugin.ts:beforeInit',
              message: 'node runtime plugin beforeInit',
              data: {
                originName: runtimeArgs?.origin?.name,
                hasWebpackRequireF: Boolean(webpackRequire.f),
                publicPath: webpackRequire.p,
                isUsingInjectedRequire: webpackRequire !== __webpack_require__,
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      }
      // Patch webpack chunk loading handlers
      (() => {
        // Create the chunk tracking object
        const installedChunks: { [key: string]: any } = {};

        // Set up webpack script loader
        setupScriptLoader(webpackRequire);

        // Create and set up the chunk handler
        const handle = setupChunkHandler(
          installedChunks,
          runtimeArgs,
          webpackRequire,
        );

        // Patch webpack require
        setupWebpackRequirePatching(handle, webpackRequire);
      })();

      return args;
    },
  };
}
