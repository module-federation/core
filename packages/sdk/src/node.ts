import { CreateScriptHookNode, FetchHook } from './types';

function importNodeModule<T>(name: string): Promise<T> {
  if (!name) {
    throw new Error('import specifier is required');
  }
  const importModule = new Function('name', `return import(name)`);
  return importModule(name)
    .then((res: any) => res as T)
    .catch((error: any) => {
      console.error(`Error importing module ${name}:`, error);
      throw error;
    });
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

export function createScriptNode(
  url: string,
  cb: (error?: Error, scriptContext?: any) => void,
  attrs?: Record<string, any>,
  loaderHook?: {
    createScriptHook?: CreateScriptHookNode;
    fetch?: FetchHook;
  },
) {
  if (loaderHook?.createScriptHook) {
    const hookResult = loaderHook.createScriptHook(url);
    if (hookResult && typeof hookResult === 'object' && 'url' in hookResult) {
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
      const urlDirname = urlObj.pathname.split('/').slice(0, -1).join('/');
      const filename = path.basename(urlObj.pathname);

      const script = new vm.Script(
        `(function(exports, module, require, __dirname, __filename) {${data}\n})`,
        {
          filename,
          importModuleDynamically:
            //@ts-ignore
            vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ?? importNodeModule,
        },
      );

      script.runInThisContext()(
        scriptContext.exports,
        scriptContext.module,
        eval('require'),
        urlDirname,
        filename,
      );

      const exportedInterface: Record<string, any> =
        scriptContext.module.exports || scriptContext.exports;

      if (attrs && exportedInterface && attrs['globalName']) {
        const container =
          exportedInterface[attrs['globalName']] || exportedInterface;
        cb(undefined, container as keyof typeof scriptContext.module.exports);
        return;
      }

      cb(
        undefined,
        exportedInterface as keyof typeof scriptContext.module.exports,
      );
    } catch (e) {
      cb(e instanceof Error ? e : new Error(`Script execution error: ${e}`));
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

export function loadScriptNode(
  url: string,
  info: {
    attrs?: Record<string, any>;
    loaderHook?: {
      createScriptHook?: CreateScriptHookNode;
    };
  },
) {
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

async function loadModule(
  url: string,
  options: {
    vm: any;
    fetch: any;
  },
) {
  const { fetch, vm } = options;
  const response = await fetch(url);
  const code = await response.text();

  const module: any = new vm.SourceTextModule(code, {
    // @ts-ignore
    importModuleDynamically: async (specifier, script) => {
      const resolvedUrl = new URL(specifier, url).href;
      return loadModule(resolvedUrl, options);
    },
  });

  await module.link(async (specifier: string) => {
    const resolvedUrl = new URL(specifier, url).href;
    const module = await loadModule(resolvedUrl, options);
    return module;
  });

  return module;
}
