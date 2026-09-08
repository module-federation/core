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
// Resolves once a cached module has finished linking. The instance itself has
// to be published to `esmModuleCache` before linking starts, so a cyclic
// import can still see it - which means a cache hit can hand back a module
// whose own requests are not resolved yet. Anything that is not part of that
// cycle has to wait here instead.
const esmModuleLinking = new Map<string, Promise<unknown>>();
// url -> the urls whose linking that url's own link() is currently blocked on,
// because its linker asked for them or because it is waiting for one below.
// Reachability through this map is what identifies a cycle: waiting on a module
// that is already blocked on the waiter, directly or through other modules,
// would deadlock. A module-creation parent chain is not enough, because two
// modules that import each other can both be reached from the same importer.
const esmLinkBlockedOn = new Map<string, Set<string>>();

function blockLinkOn(waiter: string, awaited: string): void {
  const blocked = esmLinkBlockedOn.get(waiter);

  if (blocked) {
    blocked.add(awaited);
    return;
  }

  esmLinkBlockedOn.set(waiter, new Set([awaited]));
}

function unblockLinkOn(waiter: string, awaited: string): void {
  const blocked = esmLinkBlockedOn.get(waiter);
  if (!blocked) {
    return;
  }

  blocked.delete(awaited);
  if (blocked.size === 0) {
    esmLinkBlockedOn.delete(waiter);
  }
}

function linkOfBlocksOn(start: string, target: string): boolean {
  const pending = [start];
  const seen = new Set<string>();

  while (pending.length > 0) {
    const current = pending.pop()!;

    if (current === target) {
      return true;
    }

    if (seen.has(current)) {
      continue;
    }
    seen.add(current);

    const blocked = esmLinkBlockedOn.get(current);
    if (blocked) {
      pending.push(...blocked);
    }
  }

  return false;
}

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

  return loadModule(resolvedUrl, options, parentUrl);
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
  options: LoadModuleOptions,
  parentUrl?: string,
) {
  // Check cache to prevent infinite recursion in ESM loading
  if (esmModuleCache.has(url)) {
    const cachedModule = esmModuleCache.get(url)!;
    const linking = esmModuleLinking.get(url);

    // Still linking. A sibling that merely raced it must get the finished
    // module, otherwise Node reports the child's own imports as unresolved
    // requests on an unlinked module. Waiting is only wrong when this module's
    // linking is itself blocked on the requester - that is a cycle, and it has
    // to keep receiving the in-progress instance rather than hang.
    if (linking) {
      if (!parentUrl) {
        await linking;
      } else if (!linkOfBlocksOn(url, parentUrl)) {
        blockLinkOn(parentUrl, url);
        try {
          await linking;
        } finally {
          unblockLinkOn(parentUrl, url);
        }
      }
    }

    return cachedModule;
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
  if (parentUrl) {
    // The requester's own link() cannot finish until this one does.
    blockLinkOn(parentUrl, url);
  }

  const linking = sourceTextModule
    .link(async (specifier: string) => {
      return loadResolvedModule(specifier, url, options);
    })
    .finally(() => {
      esmModuleLinking.delete(url);
      esmLinkBlockedOn.delete(url);
      if (parentUrl) {
        unblockLinkOn(parentUrl, url);
      }
    });
  esmModuleLinking.set(url, linking);

  await linking;

  return sourceTextModule;
}
