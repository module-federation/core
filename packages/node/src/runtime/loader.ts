import { enrichChunkExecutionError } from './error';
import { resolveFile, resolveUrl } from './resolve';
import type { ChunkUrlMetadata } from './types';

declare const __non_webpack_require__: (id: string) => any;

export const nodeRuntimeImportCache = new Map<string, Promise<any>>();

export function importNodeModule<T>(name: string): Promise<T> {
  if (!name) {
    throw new Error('import specifier is required');
  }
  if (nodeRuntimeImportCache.has(name)) {
    return nodeRuntimeImportCache.get(name)!;
  }

  const importModule = new Function('name', `return import(name)`);
  const promise = importModule(name)
    .then((res: any) => res.default as T)
    .catch((error: any) => {
      console.error(`Error importing module ${name}:`, error);
      nodeRuntimeImportCache.delete(name);
      throw error;
    });

  nodeRuntimeImportCache.set(name, promise);
  return promise;
}

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
        callback(
          enrichChunkExecutionError(e, {
            chunkName: path.basename(filename),
            location: filename,
            source: 'filesystem',
            content,
          }),
          null,
        );
      }
    });
  } else {
    callback(new Error(`File ${filename} does not exist`), null);
  }
};

const fetchChunkContent = (url: URL, args: any): Promise<string> =>
  (typeof fetch === 'undefined'
    ? importNodeModule<typeof import('node-fetch')>('node-fetch').then(
        (mod) => mod.default,
      )
    : Promise.resolve(fetch)
  ).then((fetchFunction) =>
    args.origin.loaderHook.lifecycle.fetch
      .emit(url.href, {})
      .then((res: Response | null) => {
        if (!res || !(res instanceof Response)) {
          return fetchFunction(url.href).then((response) => response.text());
        }
        return res.text();
      }),
  );

export const fetchAndRun = (
  url: URL,
  chunkName: string,
  callback: (err: Error | null, chunk: any) => void,
  args: any,
): void => {
  fetchChunkContent(url, args)
    .then((data) => {
      const chunk = {};
      const hostName = args?.origin?.options?.name || args?.origin?.name;
      const resolution = (url as URL & { mfMetadata?: ChunkUrlMetadata })
        .mfMetadata;
      try {
        eval(`(function(exports, require, __dirname, __filename) {${data}\n})`)(
          chunk,
          __non_webpack_require__,
          url.pathname.split('/').slice(0, -1).join('/'),
          chunkName,
        );
        callback(null, chunk);
      } catch (e) {
        callback(
          enrichChunkExecutionError(e, {
            chunkName,
            location: url.href,
            source: 'remote-url',
            content: data,
            hostName,
            resolution,
          }),
          null,
        );
      }
    })
    .catch((err: Error) => callback(err, null));
};

export const loadChunk = (
  strategy: string,
  chunkId: string,
  rootOutputDir: string,
  callback: (err: Error | null, chunk: any) => void,
  args: any,
): void => {
  if (strategy === 'filesystem') {
    return loadFromFs(resolveFile(rootOutputDir, chunkId), callback);
  }
  const url = resolveUrl(rootOutputDir, chunkId);
  if (!url) return callback(null, { modules: {}, ids: [], runtime: null });
  fetchAndRun(url, chunkId, callback, args);
};
