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
  if (!globalThis.fetch) {
    //@ts-ignore
    globalThis.fetch = __non_webpack_require__('node-fetch');
  }
  //@ts-ignore
  console.log(require.federation, 'fetching', urlObj.href);
  fetch(urlObj)
    .then((res) => res.text())
    .then((data) => {
      //@ts-ignore
      const path: typeof import('path') = __webpack_require__('path');
      const scriptContext = { exports: {}, module: { exports: {} } };
      const urlDirname = urlObj.pathname.split('/').slice(0, -1).join('/');
      const filename = path.basename(urlObj.pathname);
      //@ts-ignore
      const vm: typeof import('vm') = __non_webpack_require__('vm');
      try {
        const script = new vm.Script(
          `(function(exports, module, require, __dirname, __filename) {${data}\n})`,
          { filename },
        );
        //@ts-ignore
        script.runInThisContext()(
          scriptContext.exports,
          scriptContext.module,
          __non_webpack_require__,
          urlDirname,
          filename,
        );
        const exportedInterface: Record<string, any> =
          scriptContext.module.exports || scriptContext.exports;
        if (attrs && exportedInterface && attrs['globalName']) {
          const container = exportedInterface[attrs['globalName']];
          cb(undefined, container as keyof typeof scriptContext.module.exports);
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
    .catch((err) => {
      console.error('Error fetching script:', err);
      cb(new Error(`Fetch error: ${err}`));
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
          // Handle the loaded script context as needed
          console.log('Script loaded successfully:', scriptContext);
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
