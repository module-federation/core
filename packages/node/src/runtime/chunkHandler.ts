import { loadChunk } from './loader';
import { resolveFile } from './resolve';
import {
  nodeChunkStateKey,
  type ChunkTrackingOptions,
  type NodeChunkState,
  type WebpackRequire,
} from './types';

declare const __webpack_require__: WebpackRequire;
declare const __non_webpack_require__: (id: string) => any;

export const installChunk = (
  chunk: any,
  installedChunks: { [key: string]: any },
): void => {
  for (const moduleId in chunk.modules) {
    __webpack_require__.m[moduleId] = chunk.modules[moduleId];
  }
  if (chunk.runtime) chunk.runtime(__webpack_require__);
  for (const chunkId of chunk.ids) {
    if (installedChunks[chunkId]) installedChunks[chunkId][0]();
    installedChunks[chunkId] = 0;
  }
  if (typeof __webpack_require__.O === 'function') {
    __webpack_require__.O();
  }
};

export const deleteChunk = (
  chunkId: string,
  installedChunks: { [key: string]: any },
): boolean => {
  delete installedChunks[chunkId];
  return true;
};

export const setupScriptLoader = (): void => {
  __webpack_require__.l = (
    url: string,
    done: (res: any) => void,
    key: string,
    chunkId: string,
  ): void => {
    if (!key || chunkId)
      throw new Error(`__webpack_require__.l name is required for ${url}`);
    __webpack_require__.federation.runtime
      .loadScriptNode(url, { attrs: { globalName: key } })
      .then((res) => {
        const enhancedRemote =
          __webpack_require__.federation.instance.initRawContainer(
            key,
            url,
            res,
          );
        new Function('return globalThis')()[key] = enhancedRemote;
        done(enhancedRemote);
      })
      .catch(done);
  };
};

export const setupChunkHandler = (
  installedChunks: { [key: string]: any },
  args: any,
  tracking?: ChunkTrackingOptions,
): ((chunkId: string, promises: any[]) => void) => {
  return (chunkId: string, promises: any[]): void => {
    let installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) {
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        const matcher = __webpack_require__.federation.chunkMatcher
          ? __webpack_require__.federation.chunkMatcher(chunkId)
          : true;

        if (matcher) {
          const load = () =>
            new Promise((resolve, reject) => {
              installedChunkData = installedChunks[chunkId] = [resolve, reject];
              const fs =
                typeof process !== 'undefined'
                  ? __non_webpack_require__('fs')
                  : false;
              const filename =
                typeof process !== 'undefined'
                  ? resolveFile(
                      __webpack_require__.federation.rootOutputDir || '',
                      chunkId,
                    )
                  : false;

              if (fs && fs.existsSync(filename)) {
                loadChunk(
                  'filesystem',
                  chunkId,
                  __webpack_require__.federation.rootOutputDir || '',
                  (err, chunk) => {
                    if (err)
                      return (
                        deleteChunk(chunkId, installedChunks) && reject(err)
                      );
                    if (chunk) installChunk(chunk, installedChunks);
                    resolve(chunk);
                  },
                  args,
                );
              } else {
                const chunkName = __webpack_require__.u(chunkId);
                const loadingStrategy =
                  typeof process === 'undefined' ? 'http-eval' : 'http-vm';
                tracking?.remoteChunkIds?.add(String(chunkId));
                loadChunk(
                  loadingStrategy,
                  chunkName,
                  __webpack_require__.federation.initOptions.name,
                  (err, chunk) => {
                    if (err) {
                      tracking?.remoteChunkIds?.delete(String(chunkId));
                      return (
                        deleteChunk(chunkId, installedChunks) && reject(err)
                      );
                    }
                    if (chunk) {
                      if (Array.isArray(chunk.ids)) {
                        for (const id of chunk.ids)
                          tracking?.remoteChunkIds?.add(String(id));
                      }
                      installChunk(chunk, installedChunks);
                    }
                    resolve(chunk);
                  },
                  args,
                );
              }
            });
          const rawPromise = load();
          const promise = tracking?.trackLoad
            ? tracking.trackLoad(() => rawPromise)
            : rawPromise;
          if (tracking?.inflight) {
            tracking.inflight.add(promise);
            const done = () => tracking.inflight!.delete(promise);
            void promise.then(done, done);
          }
          promises.push((installedChunkData[2] = promise));
        } else {
          installedChunks[chunkId] = 0;
        }
      }
    }
  };
};

export const setupWebpackRequirePatching = (
  handle: (chunkId: string, promises: any[]) => void,
  installedChunks?: { [key: string]: any },
): void => {
  if (__webpack_require__.f) {
    if (__webpack_require__.f.require) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        'CAUTION: build target is not set to "async-node", attempting to patch additional chunk handlers. This may not work',
      );
      __webpack_require__.f.require = handle;
      if (installedChunks && __webpack_require__.O?.require) {
        const prevRequireCheck = __webpack_require__.O.require;
        __webpack_require__.O.require = (chunkId: string) =>
          installedChunks[chunkId] === 0 || prevRequireCheck(chunkId);
      }
    }

    if (__webpack_require__.f.readFileVm) {
      __webpack_require__.f.readFileVm = handle;
      if (installedChunks && __webpack_require__.O?.readFileVm) {
        const prevReadFileCheck = __webpack_require__.O.readFileVm;
        __webpack_require__.O.readFileVm = (chunkId: string) =>
          installedChunks[chunkId] === 0 || prevReadFileCheck(chunkId);
      }
    }
  }
};

export function attachRuntimeChunkState(args?: any): void {
  const runtime = __webpack_require__ as any;
  const federation = runtime.federation as any;
  let state: NodeChunkState | undefined = Object.hasOwn(
    runtime,
    nodeChunkStateKey,
  )
    ? runtime[nodeChunkStateKey]
    : undefined;
  if (!state || (args && state.origin && state.origin !== args.origin)) {
    state = {
      installedChunks: {},
      remoteChunkIds: new Set<string>(),
      inflight: new Set<Promise<unknown>>(),
    };
    Object.defineProperty(runtime, nodeChunkStateKey, {
      value: state,
      configurable: true,
    });
  }
  const currentState = state;
  if (args) {
    currentState.origin = args.origin;
    currentState.args = args;
  }
  if (!currentState.handle) {
    const dynamicArgs = new Proxy(
      {},
      {
        get(_target, prop) {
          if (currentState.args && prop in currentState.args)
            return currentState.args[prop];
          if (prop === 'origin') return __webpack_require__.federation.instance;
          return undefined;
        },
      },
    );
    currentState.handle = setupChunkHandler(
      currentState.installedChunks,
      dynamicArgs,
      {
        remoteChunkIds: currentState.remoteChunkIds,
        inflight: currentState.inflight,
        trackLoad: (run) =>
          typeof federation.trackLoad === 'function'
            ? federation.trackLoad(run)
            : run(),
      },
    );
    federation.clearNodeChunks = async ({
      remoteOnly = false,
    }: { remoteOnly?: boolean } = {}) => {
      while (currentState.inflight.size) {
        await Promise.allSettled([...currentState.inflight]);
      }
      if (remoteOnly) {
        for (const id of currentState.remoteChunkIds) {
          delete currentState.installedChunks[id];
        }
        currentState.remoteChunkIds.clear();
        return;
      }
      for (const id of Object.keys(currentState.installedChunks)) {
        delete currentState.installedChunks[id];
      }
      currentState.remoteChunkIds.clear();
    };
  }
  setupWebpackRequirePatching(
    currentState.handle,
    currentState.installedChunks,
  );
}
