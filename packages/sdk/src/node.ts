import { CreateScriptHookNode, FetchHook } from './types';

// Declare the ENV_TARGET constant that will be defined by DefinePlugin
declare const ENV_TARGET: 'web' | 'node';

const sdkImportCache = new Map<string, Promise<any>>();

function importNodeModule<T>(name: string): Promise<T> {
  if (!name) {
    throw new Error('import specifier is required');
  }

  // Check cache to prevent infinite recursion
  if (sdkImportCache.has(name)) {
    return sdkImportCache.get(name)!;
  }

  const importModule = new Function('name', `return import(name)`);
  const promise = importModule(name)
    .then((res: any) => res as T)
    .catch((error: any) => {
      console.error(`Error importing module ${name}:`, error);
      // Remove from cache on error so it can be retried
      sdkImportCache.delete(name);
      throw error;
    });

  // Cache the promise to prevent recursive calls
  sdkImportCache.set(name, promise);
  return promise;
}

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
    try {
      const inspector = eval('require')(
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
    } catch {
      // no inspector in this runtime: nothing else can clear the cache in-process
    }
  }, 1000);
  if (typeof compilationCacheGcTimer.unref === 'function') {
    compilationCacheGcTimer.unref();
  }
}

export function withoutCompilationCache<T>(compile: () => T): T {
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
      v8 = eval('require')('v8');
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
}

const lazyLoaderHookFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  loaderHook?: any,
): Promise<Response> => {
  const hook = (url: RequestInfo | URL, init: RequestInit) => {
    return loaderHook.lifecycle.fetch.emit(url, init);
  };

  const res = await hook(input, init || {});
  if (!res || !(res instanceof Response)) {
    return fetch(input, init || {});
  }

  return res;
};

export const createScriptNode =
  typeof ENV_TARGET === 'undefined' || ENV_TARGET !== 'web'
    ? (
        url: string,
        cb: (error?: Error, scriptContext?: any) => void,
        attrs?: Record<string, any>,
        loaderHook?: {
          createScriptHook?: CreateScriptHookNode;
          fetch?: FetchHook;
        },
      ) => {
        if (loaderHook?.createScriptHook) {
          const hookResult = loaderHook.createScriptHook(url);
          if (
            hookResult &&
            typeof hookResult === 'object' &&
            'url' in hookResult
          ) {
            url = hookResult.url;
          }
        }

        let urlObj: URL;
        try {
          urlObj = new URL(url);
        } catch (e) {
          console.error('Error constructing URL:', e);
          cb(new Error(`Invalid URL: ${e}`));
          return;
        }

        const getFetch = async (): Promise<typeof fetch> => {
          if (loaderHook?.fetch) {
            return (input: RequestInfo | URL, init?: RequestInit) =>
              lazyLoaderHookFetch(input, init, loaderHook);
          }

          return fetch;
        };

        const handleScriptFetch = async (f: typeof fetch, urlObj: URL) => {
          try {
            const res = await f(urlObj.href);
            const data = await res.text();
            const [path, vm] = await Promise.all([
              importNodeModule<typeof import('path')>('path'),
              importNodeModule<typeof import('vm')>('vm'),
            ]);

            const scriptContext = { exports: {}, module: { exports: {} } };
            const urlDirname = urlObj.pathname
              .split('/')
              .slice(0, -1)
              .join('/');
            const filename = path.basename(urlObj.pathname);

            const script = withoutCompilationCache(
              () =>
                new vm.Script(
                  `(function(exports, module, require, __dirname, __filename) {${data}\n})`,
                  {
                    filename,
                    importModuleDynamically:
                      //@ts-ignore
                      vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ??
                      importNodeModule,
                  },
                ),
            );

            let requireFn: NodeRequire;
            if (process.env.IS_ESM_BUILD === 'true') {
              const nodeModule =
                await importNodeModule<typeof import('node:module')>(
                  'node:module',
                );
              requireFn = nodeModule.createRequire(
                urlObj.protocol === 'file:' || urlObj.protocol === 'node:'
                  ? urlObj.href
                  : path.join(process.cwd(), '__mf_require_base__.js'),
              );
            } else {
              requireFn = eval('require') as NodeRequire;
            }

            script.runInThisContext()(
              scriptContext.exports,
              scriptContext.module,
              requireFn,
              urlDirname,
              filename,
            );
            const exportedInterface: Record<string, any> =
              scriptContext.module.exports || scriptContext.exports;

            if (attrs && exportedInterface && attrs['globalName']) {
              const container =
                exportedInterface[attrs['globalName']] || exportedInterface;
              cb(
                undefined,
                container as keyof typeof scriptContext.module.exports,
              );
              return;
            }

            cb(
              undefined,
              exportedInterface as keyof typeof scriptContext.module.exports,
            );
          } catch (e) {
            cb(
              e instanceof Error
                ? e
                : new Error(`Script execution error: ${e}`),
            );
          }
        };

        getFetch()
          .then(async (f) => {
            if (attrs?.['type'] === 'esm' || attrs?.['type'] === 'module') {
              return loadModule(urlObj.href, {
                fetch: f,
                vm: await importNodeModule<typeof import('vm')>('vm'),
              })
                .then(async (module) => {
                  await module.evaluate();
                  cb(undefined, module.namespace);
                })
                .catch((e) => {
                  cb(
                    e instanceof Error
                      ? e
                      : new Error(`Script execution error: ${e}`),
                  );
                });
            }
            handleScriptFetch(f, urlObj);
          })
          .catch((err) => {
            cb(err);
          });
      }
    : (
        url: string,
        cb: (error?: Error, scriptContext?: any) => void,
        attrs?: Record<string, any>,
        loaderHook?: {
          createScriptHook?: CreateScriptHookNode;
          fetch?: FetchHook;
        },
      ) => {
        cb(
          new Error('createScriptNode is disabled in non-Node.js environment'),
        );
      };

export const loadScriptNode =
  typeof ENV_TARGET === 'undefined' || ENV_TARGET !== 'web'
    ? (
        url: string,
        info: {
          attrs?: Record<string, any>;
          loaderHook?: {
            createScriptHook?: CreateScriptHookNode;
          };
        },
      ) => {
        return new Promise<void>((resolve, reject) => {
          createScriptNode(
            url,
            (error, scriptContext) => {
              if (error) {
                reject(error);
              } else {
                const remoteEntryKey =
                  info?.attrs?.['globalName'] ||
                  `__FEDERATION_${info?.attrs?.['name']}:custom__`;
                const entryExports = ((globalThis as any)[remoteEntryKey] =
                  scriptContext);
                resolve(entryExports);
              }
            },
            info.attrs,
            info.loaderHook,
          );
        });
      }
    : (
        url: string,
        info: {
          attrs?: Record<string, any>;
          loaderHook?: {
            createScriptHook?: CreateScriptHookNode;
          };
        },
      ) => {
        throw new Error(
          'loadScriptNode is disabled in non-Node.js environment',
        );
      };

const esmModuleCache = new Map<string, any>();

type LoadModuleOptions = {
  vm: typeof import('vm') & {
    SourceTextModule: any;
    SyntheticModule: any;
  };
  fetch: typeof fetch;
};

const isFetchableRemoteModuleUrl = (url: string): boolean =>
  url.startsWith('http:') || url.startsWith('https:');

const isBareModuleSpecifier = (specifier: string): boolean =>
  !specifier.startsWith('./') &&
  !specifier.startsWith('../') &&
  !specifier.startsWith('/') &&
  !specifier.includes(':');

function encodeRemoteModulePath(url: string): string {
  const remoteUrl = new URL(url);
  const encodedProtocol = encodeURIComponent(remoteUrl.protocol.slice(0, -1));
  const encodedHost = encodeURIComponent(remoteUrl.host);
  const encodedPathname = remoteUrl.pathname
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const encodedSearchHash = encodeURIComponent(
    `${remoteUrl.search}${remoteUrl.hash}`,
  );
  const encodedSuffix = encodedSearchHash ? `/${encodedSearchHash}` : '';

  return `/${encodedProtocol}/${encodedHost}${encodedPathname}${encodedSuffix}`;
}

function createImportMetaUrl(url: string, baseFileUrl: string): string {
  const baseUrl = baseFileUrl.endsWith('/') ? baseFileUrl : `${baseFileUrl}/`;
  return new URL(
    `__module_federation_remote__${encodeRemoteModulePath(url)}`,
    baseUrl,
  ).href;
}

async function isNodeBuiltinSpecifier(specifier: string): Promise<boolean> {
  if (specifier.startsWith('node:')) {
    return true;
  }

  if (!isBareModuleSpecifier(specifier)) {
    return false;
  }

  const nodeModule =
    await importNodeModule<typeof import('node:module')>('node:module');

  return nodeModule.builtinModules.includes(specifier);
}

function getSyntheticModuleExports(moduleExports: any): Record<string, any> {
  const namespaceObject =
    moduleExports &&
    (typeof moduleExports === 'object' || typeof moduleExports === 'function')
      ? moduleExports
      : { default: moduleExports };
  const effectiveExports = { ...namespaceObject };

  if (!Object.prototype.hasOwnProperty.call(effectiveExports, 'default')) {
    effectiveExports.default = namespaceObject;
  }

  return effectiveExports;
}

async function createSyntheticModuleFromExports(
  identifier: string,
  moduleExports: any,
  vm: LoadModuleOptions['vm'],
) {
  if (typeof vm.SyntheticModule !== 'function') {
    throw new Error(
      'vm.SyntheticModule is required to load Node.js built-in modules in ESM remote entries.',
    );
  }

  const effectiveExports = getSyntheticModuleExports(moduleExports);
  const exportNames = Object.keys(effectiveExports);
  const syntheticModule = new vm.SyntheticModule(
    exportNames,
    function setSyntheticModuleExports(this: {
      setExport: (name: string, value: any) => void;
    }) {
      for (const name of exportNames) {
        this.setExport(name, effectiveExports[name]);
      }
    },
    { identifier },
  );

  esmModuleCache.set(identifier, syntheticModule);
  await syntheticModule.link(async () => {
    throw new Error(
      `Node.js built-in module "${identifier}" should not request child modules.`,
    );
  });
  await syntheticModule.evaluate();

  return syntheticModule;
}

async function loadNodeBuiltinModule(
  specifier: string,
  vm: LoadModuleOptions['vm'],
) {
  const cacheKey = `node-builtin:${specifier}`;
  if (esmModuleCache.has(cacheKey)) {
    return esmModuleCache.get(cacheKey)!;
  }

  const moduleExports = await importNodeModule(specifier);
  return createSyntheticModuleFromExports(cacheKey, moduleExports, vm);
}

async function loadResolvedModule(
  specifier: string,
  parentUrl: string,
  options: LoadModuleOptions,
) {
  if (await isNodeBuiltinSpecifier(specifier)) {
    return loadNodeBuiltinModule(specifier, options.vm);
  }

  if (isBareModuleSpecifier(specifier)) {
    throw new Error(
      `Unsupported ESM module specifier "${specifier}". Only relative or absolute http(s) remote modules and Node.js built-in modules are supported.`,
    );
  }

  const resolvedUrl = new URL(specifier, parentUrl).href;
  if (!isFetchableRemoteModuleUrl(resolvedUrl)) {
    throw new Error(
      `Unsupported ESM module specifier "${specifier}" resolved to "${resolvedUrl}". Only http(s) remote modules and Node.js built-in modules are supported.`,
    );
  }

  return loadModule(resolvedUrl, options);
}

async function evaluateDynamicModule(module: any) {
  if (module.status === 'linked') {
    await module.evaluate();
  }

  if (module.status === 'errored') {
    throw module.error;
  }

  return module;
}

async function loadModule(url: string, options: LoadModuleOptions) {
  // Check cache to prevent infinite recursion in ESM loading
  if (esmModuleCache.has(url)) {
    return esmModuleCache.get(url)!;
  }

  const { fetch, vm } = options;
  if (!isFetchableRemoteModuleUrl(url)) {
    throw new Error(
      `Unsupported ESM module URL "${url}". Only http(s) remote modules and Node.js built-in modules are supported.`,
    );
  }

  const response = await fetch(url);
  const code = await response.text();
  const nodeUrl = await importNodeModule<typeof import('node:url')>('node:url');
  const cwdFileUrl = nodeUrl.pathToFileURL(process.cwd()).href;

  const sourceTextModule: any = new vm.SourceTextModule(code, {
    identifier: url,
    initializeImportMeta: (meta: { url: string }) => {
      meta.url = createImportMetaUrl(url, cwdFileUrl);
    },
    importModuleDynamically: async (specifier: string) => {
      return evaluateDynamicModule(
        await loadResolvedModule(specifier, url, options),
      );
    },
  });

  // Cache the module before linking to prevent cycles
  esmModuleCache.set(url, sourceTextModule);

  await sourceTextModule.link(async (specifier: string) => {
    return loadResolvedModule(specifier, url, options);
  });

  return sourceTextModule;
}
