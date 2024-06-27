import type {
  FederationRuntimePlugin,
  FederationHost,
} from '@module-federation/runtime';
type WebpackRequire = {
  (id: string): any;
  u: (chunkId: string) => string;
  p: string;
  m: { [key: string]: any };
  o: (obj: any, prop: string) => boolean;
  C?: (chunk: any) => void;
  l: (
    url: string,
    done: (res: any) => void,
    key: string,
    chunkId: string,
  ) => void;
  federation: {
    runtime: {
      loadScriptNode: (
        url: string,
        options: { attrs: { globalName: string } },
      ) => Promise<any>;
    };
    instance: FederationHost;
    chunkMatcher?: (chunkId: string) => boolean;
    rootOutputDir?: string;
    initOptions: {
      name: string;
      remotes: any;
    };
  };
  f?: {
    require?: (chunkId: string, promises: any[]) => void;
    readFileVm?: (chunkId: string, promises: any[]) => void;
  };
};

declare const __webpack_require__: WebpackRequire;
declare const __non_webpack_require__: (id: string) => any;

export default function (): FederationRuntimePlugin {
  return {
    name: 'node-federation-plugin',
    beforeInit: function (args: any) {
      (() => {
        function resolveFile(rootOutputDir: string, chunkId: string): string {
          const path = __non_webpack_require__('path');

          const filename = path.join(
            __dirname,
            rootOutputDir + __webpack_require__.u(chunkId),
          );

          return filename;
        }

        function resolveUrl(remoteName: string, chunkName: string): URL | null {
          const path = __non_webpack_require__('path');

          try {
            return new URL(chunkName, __webpack_require__.p);
          } catch (error) {
            const entryUrl =
              returnFromCache(remoteName) ||
              returnFromGlobalInstances(remoteName);

            if (!entryUrl) {
              return null;
            }

            const url = new URL(entryUrl);
            const fileToReplace = path.basename(url.pathname);
            url.pathname = url.pathname.replace(fileToReplace, chunkName);

            return url;
          }
        }

        function returnFromCache(remoteName: string): string | null {
          const globalThisVal = new Function('return globalThis')();
          const federationInstances =
            globalThisVal['__FEDERATION__']['__INSTANCES__'];

          let entryUrl: string | null = null; // Initialize entryUrl to null

          // Using for...of for better readability and direct control
          for (const instance of federationInstances) {
            const moduleContainer = instance.moduleCache.get(remoteName);
            if (moduleContainer && moduleContainer.remoteInfo) {
              entryUrl = moduleContainer.remoteInfo.entry; // Assign the found entry URL
              break; // Exit the loop as soon as a matching entry is found
            }
          }

          return entryUrl; // Return the found entry URL or null if not found
        }

        function returnFromGlobalInstances(remoteName: string): string | null {
          const globalThisVal = new Function('return globalThis')();
          const federationInstances =
            globalThisVal['__FEDERATION__']['__INSTANCES__'];

          let entryUrl: string | null = null; // Declare a variable to store the entry URL when found

          // Iterate over federation instances
          for (const instance of federationInstances) {
            // Manually iterate over the remotes for each instance
            for (const remote of instance.options.remotes) {
              if (remote.name === remoteName || remote.alias === remoteName) {
                console.log('Backup remote entry found:', remote.entry);
                entryUrl = remote.entry; // Set the entry URL
                break; // Break from the inner loop
              }
            }

            if (entryUrl) break; // Break from the outer loop if the entry URL has been set
          }

          return entryUrl; // Return the found entry URL or null if not found
        }

        function fileSystemRunInContextStrategy(
          chunkId: string,
          rootOutputDir: string,
          callback: (err: Error | null, chunk: any) => void,
        ): void {
          const fs = __non_webpack_require__('fs');
          const path = __non_webpack_require__('path');
          const vm = __non_webpack_require__('vm');
          const filename = resolveFile(rootOutputDir, chunkId);

          if (fs.existsSync(filename)) {
            fs.readFile(
              filename,
              'utf-8',
              function (err: Error, content: string) {
                if (err) {
                  callback(err, null);
                  return;
                }
                const chunk: any = {};
                try {
                  vm.runInThisContext(
                    '(function(exports, require, __dirname, __filename) {' +
                      content +
                      '\n})',
                    filename,
                  )(
                    chunk,
                    __non_webpack_require__,
                    path.dirname(filename),
                    filename,
                  );
                  callback(null, chunk);
                } catch (e) {
                  console.log("'runInThisContext threw'", e);
                  callback(e as Error, null);
                }
              },
            );
          } else {
            const err = new Error('File ' + filename + ' does not exist');
            callback(err, null);
          }
        }

        function httpEvalStrategy(
          chunkName: string,
          remoteName: string,
          callback: (err: Error | null, chunk: any) => void,
        ): void {
          const url = resolveUrl(remoteName, chunkName);
          if (!url) {
            const emptyChunk = {
              modules: {}, // No modules
              ids: [], // No chunk IDs
              runtime: null, // No runtime function
            };
            return callback(null, emptyChunk);
          }

          args.origin.loaderHook.lifecycle.fetch
            .emit(url.href, {})
            .then(function (res: Response) {
              return res.text();
            })
            .then(function (data: string) {
              const chunk: any = {};
              try {
                const urlDirname = url.pathname
                  .split('/')
                  .slice(0, -1)
                  .join('/');
                eval(
                  '(function(exports, require, __dirname, __filename) {' +
                    data +
                    '\n})',
                )(chunk, __non_webpack_require__, urlDirname, chunkName);
                callback(null, chunk);
              } catch (e) {
                callback(e as Error, null);
              }
            });
        }

        function httpVmStrategy(
          chunkName: string,
          remoteName: string,
          callback: (err: Error | null, chunk: any) => void,
        ): void {
          const vm = __non_webpack_require__('vm');

          const url = resolveUrl(remoteName, chunkName);
          if (!url) {
            const emptyChunk = {
              modules: {}, // No modules
              ids: [], // No chunk IDs
              runtime: null, // No runtime function
            };
            return callback(null, emptyChunk);
          }

          const fetchHook = args.origin.loaderHook.lifecycle.fetch.emit(
            url.href,
            {},
          );

          fetchHook
            .then((res: Response) => res.text())
            .then((data: string) => {
              try {
                const chunk: any = {};
                const urlDirname = url.pathname
                  .split('/')
                  .slice(0, -1)
                  .join('/');
                vm.runInThisContext(
                  `(function(exports, require, __dirname, __filename) {${data}\n})`,
                  { filename: chunkName },
                )(chunk, __non_webpack_require__, urlDirname, chunkName);
                callback(null, chunk);
              } catch (e) {
                callback(e as Error, null);
              }
            })
            .catch((err: Error) => callback(err, null));
        }

        function loadChunkStrategy(
          strategyType: string,
          chunkId: string,
          rootOutputDir: string,
          remotes: any,
          callback: (err: Error | null, chunk: any) => void,
        ): void {
          switch (strategyType) {
            case 'filesystem':
              return fileSystemRunInContextStrategy(
                chunkId,
                rootOutputDir,
                callback,
              );
            case 'http-eval':
              return httpEvalStrategy(chunkId, rootOutputDir, callback);
            case 'http-vm':
              return httpVmStrategy(chunkId, rootOutputDir, callback);
            default:
              throw new Error('Invalid strategy type');
          }
        }
        // no baseURI

        // object to store loaded chunks
        // "0" means "already loaded", Promise means loading
        const installedChunks: { [key: string]: any } = {};

        const installChunk = __webpack_require__.C
          ? __webpack_require__.C
          : (chunk: any) => {
              const moreModules = chunk.modules,
                chunkIds = chunk.ids,
                runtime = chunk.runtime;
              for (const moduleId in moreModules) {
                if (__webpack_require__.o(moreModules, moduleId)) {
                  __webpack_require__.m[moduleId] = moreModules[moduleId];
                }
              }
              if (runtime) runtime(__webpack_require__);
              for (let i = 0; i < chunkIds.length; i++) {
                if (installedChunks[chunkIds[i]]) {
                  installedChunks[chunkIds[i]][0]();
                }
                installedChunks[chunkIds[i]] = 0;
              }
            };

        // load script equivalent for server side
        __webpack_require__.l = (
          url: string,
          done: (res: any) => void,
          key: string,
          chunkId: string,
        ) => {
          if (!key || chunkId) {
            throw new Error(
              '__webpack_require__.l name is required for ' + url,
            );
          }
          __webpack_require__.federation.runtime
            .loadScriptNode(url, { attrs: { globalName: key } })
            .then((res: any) => {
              const federation = __webpack_require__.federation;
              const enhancedRemote = federation.instance.initRawContainer(
                key,
                url,
                res,
              );
              const globalThisVal = new Function('return globalThis')();
              // use normal global assignment
              globalThisVal[key] = enhancedRemote;
              done(enhancedRemote);
            })
            .catch((error: Error) => {
              done(error);
            });
        };
        // Dynamic filesystem chunk loading for javascript
        if (__webpack_require__.f) {
          const handle = function (chunkId: string, promises: any[]) {
            let installedChunkData = installedChunks[chunkId];
            if (installedChunkData !== 0) {
              // 0 means "already installed".
              if (installedChunkData) {
                promises.push(installedChunkData[2]);
              } else {
                const matcher = __webpack_require__.federation.chunkMatcher
                  ? __webpack_require__.federation.chunkMatcher(chunkId)
                  : true;
                if (matcher) {
                  // check if real chunk for handler
                  const promise = new Promise(function (resolve, reject) {
                    installedChunkData = installedChunks[chunkId] = [
                      resolve,
                      reject,
                    ];

                    function installChunkCallback(
                      error: Error | null,
                      chunk: any,
                    ) {
                      if (error) return reject(error);
                      if (chunk) installChunk(chunk);
                      resolve(chunk);
                    }

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
                      loadChunkStrategy(
                        'filesystem',
                        chunkId,
                        __webpack_require__.federation.rootOutputDir || '',
                        undefined,
                        installChunkCallback,
                      );
                    } else {
                      const chunkName = __webpack_require__.u(chunkId);
                      const loadingStrategy =
                        typeof process === 'undefined'
                          ? 'http-eval'
                          : 'http-vm';
                      loadChunkStrategy(
                        loadingStrategy,
                        chunkName,
                        __webpack_require__.federation.initOptions.name,
                        __webpack_require__.federation.initOptions.remotes,
                        installChunkCallback,
                      );
                    }
                  });
                  promises.push((installedChunkData[2] = promise));
                } else {
                  installedChunks[chunkId] = 0;
                }
              }
            }
          };
          if (__webpack_require__.f.require) {
            console.warn(
              '\x1b[33m%s\x1b[0m',
              'CAUTION: build target is not set to "async-node", attempting to patch additional chunk handlers. This may not work',
            );
            __webpack_require__.f.require = handle;
          }
          if (__webpack_require__.f.readFileVm) {
            __webpack_require__.f.readFileVm = handle;
          }
        }
      })();
      return args;
    },
  };
}
