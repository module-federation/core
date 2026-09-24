import type {
  createScriptNode as NodeScriptFactory,
  loadScriptNode as NodeScriptLoader,
} from '../../node';

type WorkerAttributes = Record<string, string | undefined>;
type WorkerGlobal = typeof globalThis & {
  importScripts?: (...urls: string[]) => void;
};

export const createScriptNode: typeof NodeScriptFactory = (
  initialUrl,
  callback,
  attrs,
  loaderHook,
) => {
  const hookResult = loaderHook?.createScriptHook?.(initialUrl, attrs);
  const url =
    hookResult && typeof hookResult === 'object' && 'url' in hookResult
      ? hookResult.url
      : initialUrl;
  const attributes = attrs as WorkerAttributes | undefined;
  const globalName = attributes?.['globalName'];
  const workerGlobal = globalThis as WorkerGlobal;
  let load: Promise<unknown>;
  if (attributes?.['type'] === 'module' || attributes?.['type'] === 'esm') {
    load = import(/* webpackIgnore: true */ /* @vite-ignore */ url);
  } else if (workerGlobal.importScripts) {
    load = Promise.resolve().then(() => {
      workerGlobal.importScripts?.(url);
      return globalName
        ? (workerGlobal as Record<string, unknown>)[globalName]
        : undefined;
    });
  } else {
    load = Promise.reject(
      new Error('Classic worker script loading requires importScripts.'),
    );
  }
  Promise.resolve(load).then(
    (scriptContext) => callback(undefined, scriptContext),
    (error: unknown) =>
      callback(error instanceof Error ? error : new Error(String(error))),
  );
};

export const loadScriptNode: typeof NodeScriptLoader = (url, info) =>
  new Promise((resolve, reject) => {
    createScriptNode(
      url,
      (error, scriptContext) => {
        if (error) {
          reject(error);
          return;
        }
        const remoteEntryKey =
          info?.attrs?.['globalName'] ||
          `__FEDERATION_${info?.attrs?.['name']}:custom__`;
        (globalThis as Record<string, unknown>)[remoteEntryKey] = scriptContext;
        resolve(scriptContext);
      },
      info.attrs,
      info.loaderHook,
    );
  });
