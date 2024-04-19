//@ts-nocheck
export default function () {
  return {
    name: 'node-internal-plugin',
    beforeInit: function (args) {
      (() => {
        function resolveFile(rootOutputDir, chunkId) {
          var path = __non_webpack_require__('path');

          var filename = path.join(
            __dirname,
            rootOutputDir + __webpack_require__.u(chunkId),
          );

          return filename;
        }

        function resolveUrl(remoteName, chunkName) {
          var path = __non_webpack_require__('path');

          try {
            return new URL(chunkName, __webpack_require__.p);
          } catch (error) {
            console.error(
              'module-federation: failed to construct absolute chunk path of',
              remoteName,
              'for',
              chunkName,
              'for public path',
              __webpack_require__.p,
            );

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

        function returnFromCache(remoteName) {
          const globalThisVal = new Function('return globalThis')();
          const federationInstances =
            globalThisVal['__FEDERATION__']['__INSTANCES__'];

          let entryUrl = null; // Initialize entryUrl to null

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

        function returnFromGlobalInstances(remoteName) {
          const globalThisVal = new Function('return globalThis')();
          const federationInstances =
            globalThisVal['__FEDERATION__']['__INSTANCES__'];

          let entryUrl = null; // Declare a variable to store the entry URL when found

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
          chunkId,
          rootOutputDir,
          callback,
        ) {
          var fs = __non_webpack_require__('fs');
          var path = __non_webpack_require__('path');
          var vm = __non_webpack_require__('vm');
          var filename = resolveFile(rootOutputDir, chunkId);

          if (fs.existsSync(filename)) {
            fs.readFile(filename, 'utf-8', function (err, content) {
              if (err) {
                callback(err, null);
                return;
              }
              var chunk = {};
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
                callback(e, null);
              }
            });
          } else {
            var err = new Error('File ' + filename + ' does not exist');
            callback(err, null);
          }
        }

        function httpEvalStrategy(chunkName, remoteName, callback) {
          var url = resolveUrl(remoteName, chunkName);
          if (!url) {
            var emptyChunk = {
              modules: {}, // No modules
              ids: [], // No chunk IDs
              runtime: null, // No runtime function
            };
            return callback(null, emptyChunk);
          }
          fetch(url)
            .then(function (res) {
              return res.text();
            })
            .then(function (data) {
              var chunk = {};
              try {
                var urlDirname = url.pathname.split('/').slice(0, -1).join('/');
                eval(
                  '(function(exports, require, __dirname, __filename) {' +
                    data +
                    '\n})',
                )(chunk, __non_webpack_require__, urlDirname, chunkName);
                callback(null, chunk);
              } catch (e) {
                callback(e, null);
              }
            });
        }

        function httpVmStrategy(chunkName, remoteName, callback) {
          var http = __non_webpack_require__('http');
          var https = __non_webpack_require__('https');
          var vm = __non_webpack_require__('vm');

          var url = resolveUrl(remoteName, chunkName);
          if (!url) {
            var emptyChunk = {
              modules: {}, // No modules
              ids: [], // No chunk IDs
              runtime: null, // No runtime function
            };
            return callback(null, emptyChunk);
          }
          var protocol = url.protocol === 'https:' ? https : http;
          protocol.get(url.href, function (res) {
            var data = '';
            res.on('data', function (chunk) {
              data += chunk.toString();
            });
            res.on('end', function () {
              var chunk = {};
              var urlDirname = url.pathname.split('/').slice(0, -1).join('/');
              vm.runInThisContext(
                '(function(exports, require, __dirname, __filename) {' +
                  data +
                  '\n})',
                chunkName,
              )(chunk, __non_webpack_require__, urlDirname, chunkName);
              callback(null, chunk);
            });
            res.on('error', function (err) {
              callback(err, null);
            });
          });
        }

        function loadChunkStrategy(
          strategyType,
          chunkId,
          rootOutputDir,
          remotes,
          callback,
        ) {
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
        var installedChunks = {};

        var installChunk = __webpack_require__.C
          ? __webpack_require__.C
          : (chunk) => {
              var moreModules = chunk.modules,
                chunkIds = chunk.ids,
                runtime = chunk.runtime;
              for (var moduleId in moreModules) {
                if (__webpack_require__.o(moreModules, moduleId)) {
                  __webpack_require__.m[moduleId] = moreModules[moduleId];
                }
              }
              if (runtime) runtime(__webpack_require__);
              for (var i = 0; i < chunkIds.length; i++) {
                if (installedChunks[chunkIds[i]]) {
                  installedChunks[chunkIds[i]][0]();
                }
                installedChunks[chunkIds[i]] = 0;
              }
            };

        // load script equivalent for server side
        __webpack_require__.l = function (url, callback, chunkId) {
          if (!chunkId) {
            throw new Error(
              '__webpack_require__.l name is required for ' + url,
            );
          }

          __webpack_require__.federation.runtime
            .loadScriptNode(url, { attrs: {} })
            .then(function (res) {
              var federation = __webpack_require__.federation;
              var enhancedRemote = federation.instance.initRawContainer(
                chunkId,
                url,
                res,
              );
              // use normal global assignment
              if (!usesInternalRef && !globalThis[chunkId]) {
                globalThis[chunkId] = enhancedRemote;
              }
              console.log('adding remote', chunkId);
              callback(enhancedRemote);
            })
            .catch(function (error) {
              callback(error);
            });
        };
        // Dynamic filesystem chunk loading for javascript
        if (__webpack_require__.f) {
          const handle = function (chunkId, promises) {
            var installedChunkData = installedChunks[chunkId];
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
                  var promise = new Promise(function (resolve, reject) {
                    installedChunkData = installedChunks[chunkId] = [
                      resolve,
                      reject,
                    ];

                    function installChunkCallback(error, chunk) {
                      if (error) return reject(error);
                      if (chunk) installChunk(chunk);
                      resolve(chunk);
                    }

                    var fs =
                      typeof process !== 'undefined'
                        ? __non_webpack_require__('fs')
                        : false;
                    var filename =
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
                      var chunkName = __webpack_require__.u(chunkId);
                      const loadingStrategy =
                        typeof process === 'undefined'
                          ? 'http-vm'
                          : 'http-eval';
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
