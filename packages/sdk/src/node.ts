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

const loadNodeFetch = async (): Promise<typeof fetch> => {
  const fetchModule =
    await importNodeModule<typeof import('node-fetch')>('node-fetch');
  return (fetchModule.default || fetchModule) as unknown as typeof fetch;
};

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
    const fetchFunction =
      typeof fetch === 'undefined' ? await loadNodeFetch() : fetch;
    return fetchFunction(input, init || {});
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

          return typeof fetch === 'undefined' ? loadNodeFetch() : fetch;
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

            const script = new vm.Script(
              `(function(exports, module, require, __dirname, __filename) {${data}\n})`,
              {
                filename,
                importModuleDynamically:
                  //@ts-ignore
                  vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ??
                  importNodeModule,
              },
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

const isFetchableRemoteModuleUrl = (url: string): boolean =>
  url.startsWith('http:') || url.startsWith('https:');

const isBareSpecifier = (specifier: string): boolean =>
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

  return `/${encodedProtocol}/${encodedHost}${encodedPathname}`;
}

function createImportMetaUrl(url: string): string {
  return `file:///__module_federation_remote__${encodeRemoteModulePath(url)}`;
}

async function isNodeBuiltinSpecifier(specifier: string): Promise<boolean> {
  if (specifier.startsWith('node:')) {
    return true;
  }

  if (!isBareSpecifier(specifier)) {
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
  vm: any,
) {
  if (typeof vm.SyntheticModule !== 'function') {
    throw new Error(
      'vm.SyntheticModule is required to load Node.js built-in modules in ESM remote entries.',
    );
  }

  const effectiveExports = getSyntheticModuleExports(moduleExports);
  const exportNames = Object.keys(effectiveExports).filter(
    (name) => name !== 'constructor',
  );
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
  options: {
    vm: any;
    fetch: any;
  },
) {
  const cacheKey = `node-builtin:${specifier}`;
  if (esmModuleCache.has(cacheKey)) {
    return esmModuleCache.get(cacheKey)!;
  }

  const moduleExports = await importNodeModule(specifier);
  return createSyntheticModuleFromExports(cacheKey, moduleExports, options.vm);
}

async function loadResolvedModule(
  specifier: string,
  parentUrl: string,
  options: {
    vm: any;
    fetch: any;
  },
) {
  if (await isNodeBuiltinSpecifier(specifier)) {
    return loadNodeBuiltinModule(specifier, options);
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

async function loadModule(
  url: string,
  options: {
    vm: any;
    fetch: any;
  },
) {
  // Check cache to prevent infinite recursion in ESM loading
  if (esmModuleCache.has(url)) {
    return esmModuleCache.get(url)!;
  }

  const { fetch, vm } = options;
  if (await isNodeBuiltinSpecifier(url)) {
    return loadNodeBuiltinModule(url, options);
  }

  if (!isFetchableRemoteModuleUrl(url)) {
    throw new Error(
      `Unsupported ESM module URL "${url}". Only http(s) remote modules and Node.js built-in modules are supported.`,
    );
  }

  const response = await fetch(url);
  const code = await response.text();

  const module: any = new vm.SourceTextModule(code, {
    identifier: url,
    initializeImportMeta: (meta: { url: string }) => {
      meta.url = createImportMetaUrl(url);
    },
    // @ts-ignore
    importModuleDynamically: async (specifier, script) => {
      return evaluateDynamicModule(
        await loadResolvedModule(specifier, url, options),
      );
    },
  });

  // Cache the module before linking to prevent cycles
  esmModuleCache.set(url, module);

  await module.link(async (specifier: string) => {
    return loadResolvedModule(specifier, url, options);
  });

  return module;
}
