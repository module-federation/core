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

// Synchronous builtin lookup: `require` in the CJS build, `process.getBuiltinModule`
// (Node >= 20.16) in the ESM build where `require` is not in scope.
function tryRequireBuiltin<T>(name: string): T | undefined {
  try {
    return eval('require')(name);
  } catch {
    return (globalThis as any).process?.getBuiltinModule?.(name);
  }
}

function tryGetVm(): typeof import('vm') | undefined {
  return tryRequireBuiltin<typeof import('vm')>('vm');
}

/** Wrapper shape shared by every CommonJS-style remote compile. */
export function buildCommonJsWrapper(
  parameters: string[],
  source: string,
): string {
  return `(function(${parameters.join(', ')}) {${source}\n})`;
}

export type CompiledCommonJsModule = (...args: any[]) => any;

/**
 * Compiles `source` into a callable `(...parameters) => any` without direct
 * `eval` (whose functions capture the enclosing scope and pin the source text).
 * Uses `vm.Script` when the `vm` module is obtainable, otherwise `new Function`.
 * Only capability detection selects the backend: a compile error from the chosen
 * backend propagates as-is and is never retried on the other one.
 */
export function compileCommonJsModule({
  source,
  filename,
  parameters,
  importModuleDynamically,
  vm = tryGetVm(),
}: {
  source: string;
  filename: string;
  parameters: string[];
  importModuleDynamically?: any;
  vm?: typeof import('vm');
}): CompiledCommonJsModule {
  if (vm) {
    return new vm.Script(buildCommonJsWrapper(parameters, source), {
      filename,
      importModuleDynamically:
        importModuleDynamically ??
        //@ts-ignore
        vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ??
        importNodeModule,
    }).runInThisContext();
  }
  return new Function(...parameters, source) as CompiledCommonJsModule;
}

const REMOTE_COMPILATION_POLICY = Symbol.for(
  '@module-federation/remote-compilation-policy',
);
const NO_COMPILATION_CACHE_FLAG = /--no[-_]compilation[-_]cache\b/;

/**
 * Runs one synchronous remote compile with V8's compilation cache switched off.
 *
 * V8 keeps the source and compiled code of every distinct script in an
 * isolate-wide cache that is only evicted when the heap nears V8's own limit,
 * so remote code (the code that changes on every deployment) would otherwise
 * accumulate for the life of the process. `--no-compilation-cache` cannot be
 * passed through NODE_OPTIONS, which is why it is toggled here at runtime.
 *
 * The flag is process-wide. It is off only for the duration of `compile`, so
 * the host's own code and everything compiled outside that window keep the
 * cache; a worker thread that compiles during the window misses the cache
 * once. Nested calls (from any copy of this package in the isolate, via a
 * shared `globalThis` counter) toggle it exactly once, and it is restored in a
 * `finally` when `compile` throws.
 *
 * Nothing is touched when the process already runs with
 * `--no-compilation-cache`, when `FEDERATION_REMOTE_COMPILATION_CACHE=default`
 * (`disable`, the default, is the behaviour described above), or when
 * `v8.setFlagsFromString` is unavailable or throws.
 */
export function withRemoteCompilationPolicy<T>(compile: () => T): T {
  const proc = (globalThis as any).process;
  if (
    proc?.env?.['FEDERATION_REMOTE_COMPILATION_CACHE'] === 'default' ||
    proc?.execArgv?.some((arg: string) =>
      NO_COMPILATION_CACHE_FLAG.test(arg),
    ) ||
    NO_COMPILATION_CACHE_FLAG.test(proc?.env?.['NODE_OPTIONS'] ?? '')
  ) {
    return compile();
  }
  const v8 = tryRequireBuiltin<{
    setFlagsFromString?: (flags: string) => void;
  }>('v8');
  if (typeof v8?.setFlagsFromString !== 'function') {
    return compile();
  }
  const state: { depth: number } = ((globalThis as any)[
    REMOTE_COMPILATION_POLICY
  ] ??= { depth: 0 });
  if (state.depth === 0) {
    try {
      v8.setFlagsFromString('--no-compilation-cache');
    } catch {
      return compile();
    }
  }
  state.depth++;
  try {
    return compile();
  } finally {
    state.depth--;
    if (state.depth === 0) {
      try {
        v8.setFlagsFromString('--compilation-cache');
      } catch {
        // the flag stays off; nothing more can be done
      }
    }
  }
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

            const run = withRemoteCompilationPolicy(() =>
              compileCommonJsModule({
                source: data,
                filename,
                parameters: [
                  'exports',
                  'module',
                  'require',
                  '__dirname',
                  '__filename',
                ],
                vm,
              }),
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

            run(
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
