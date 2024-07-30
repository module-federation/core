type WebpackRequire = {
  l: (
    url: string,
    done: (event?: { type: 'load' | string; target?: { src: string } }) => void,
    key?: string,
    chunkId?: string,
  ) => Record<string, unknown>;
};

declare const __webpack_require__: WebpackRequire;

export function createScriptReactNative(
  url: string,
  cb: (error?: Error) => void,
  attrs?: Record<string, any>,
  createScriptHook?: (
    url: string,
    attrs?: Record<string, any> | undefined,
  ) => { url: string } | void,
) {
  if (createScriptHook) {
    const hookResult = createScriptHook(url, attrs);
    if (hookResult && typeof hookResult === 'object' && 'url' in hookResult) {
      url = hookResult.url;
    }
  }

  if (!attrs || !attrs['globalName']) {
    cb(new Error('createScriptReactNative: globalName is required'));
    return;
  }

  __webpack_require__.l(
    url,
    (e) => {
      cb(e ? new Error(`Script execution failed`) : undefined);
    },
    attrs['globalName'],
  );
}

export async function loadScriptReactNative(
  url: string,
  info: {
    attrs?: Record<string, any>;
    createScriptHook?: (url: string) => void;
  },
) {
  return new Promise<void>((resolve, reject) => {
    createScriptReactNative(
      url,
      (error) => {
        if (error) {
          reject(error);
        } else {
          const remoteEntryKey = info?.attrs?.['globalName'];
          const entryExports = (globalThis as any)[remoteEntryKey];
          resolve(entryExports);
        }
      },
      info.attrs,
      info.createScriptHook,
    );
  });
}
