function importNodeModule<T>(name: string): Promise<T> {
  if (!name) {
    throw new Error('import specifier is required');
  }
  const importModule = new Function('name', `return import(name)`);
  return importModule(name)
    .then((res: any) => res.default as T)
    .catch((error: any) => {
      console.error(`Error importing module ${name}:`, error);
      throw error;
    });
}

export function createScriptNode(
  url: string,
  cb: (error?: Error, scriptContext?: any) => void,
  attrs?: Record<string, any>,
  createScriptHook?: (url: string) => any | void,
) {
  if (createScriptHook) {
    const hookResult = createScriptHook(url);
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
  const getFetch = async () => {
    if (typeof fetch === 'undefined') {
      const fetchModule = await importNodeModule('node-fetch');
      //@ts-ignore
      return fetchModule?.default || fetchModule;
    } else {
      return fetch;
    }
  };
  console.log('fetching', urlObj.href);
  getFetch().then((f) => {
    f(urlObj.href)
      .then((res: Response) => res.text())
      .then(async (data: string) => {
        const [path, vm]: [typeof import('path'), typeof import('vm')] =
          await Promise.all([
            importNodeModule<typeof import('path')>('path'),
            importNodeModule<typeof import('vm')>('vm'),
          ]);
        const scriptContext = { exports: {}, module: { exports: {} } };
        const urlDirname = urlObj.pathname.split('/').slice(0, -1).join('/');
        const filename = path.basename(urlObj.pathname);
        try {
          const script = new vm.Script(
            `(function(exports, module, require, __dirname, __filename) {${data}\n})`,
            { filename },
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
            const container = exportedInterface[attrs['globalName']];
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
          console.error('Error running script:', e);
          cb(new Error(`Script execution error: ${e}`));
        }
      })
      .catch((err: Error) => {
        console.error('Error fetching script:', err);
        cb(err);
      });
  });
}
export function loadScriptNode(
  url: string,
  info: {
    attrs?: Record<string, any>;
    createScriptHook?: (url: string) => void;
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
      info.createScriptHook,
    );
  });
}
