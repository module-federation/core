//@ts-nocheck

import path from 'path';

(() => {
  function fileSystemRunInContextStrategy(
    chunkId,
    rootOutputDir,
    remotes,
    callback,
  ) {
    var fs = __non_webpack_require__('fs');
    var path = __non_webpack_require__('path');
    var vm = __non_webpack_require__('vm');
    var filename = path.join(
      __dirname,
      rootOutputDir + __webpack_require__.u(chunkId),
    );
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
          )(chunk, __non_webpack_require__, path.dirname(filename), filename);
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

  function httpEvalStrategy(chunkName, remoteName, remotes, callback) {
    var url;
    try {
      url = new URL(chunkName, __webpack_require__.p);
    } catch (e) {
      // console.warn(
      //   'module-federation: failed to construct absolute chunk path of',
      //   remoteName,
      //   'for',
      //   chunkName,
      //   'public path:',
      //   __webpack_require__.p,
      // );
      url = new URL(remotes[remoteName]);
      var getBasenameFromUrl = function (url) {
        var urlParts = url.split('/');
        return urlParts[urlParts.length - 1];
      };
      var fileToReplace = getBasenameFromUrl(url.pathname);
      url.pathname = url.pathname.replace(fileToReplace, chunkName);
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

  function httpVmStrategy(chunkName, remoteName, remotes, callback) {
    var http = __non_webpack_require__('http');
    var https = __non_webpack_require__('https');
    var vm = __non_webpack_require__('vm');
    var path = __non_webpack_require__('path');
    var url;

    var globalThisVal = new Function('return globalThis')();
    try {
      url = new URL(chunkName, __webpack_require__.p);
    } catch (e) {
      console.error(
        'module-federation: failed to construct absolute chunk path of',
        remoteName,
        'for',
        chunkName,
        'for public path',
        __webpack_require__.p,
      );
      // search all instances to see if any have the remote

      var entryUrl;
      var container = globalThisVal['__FEDERATION__']['__INSTANCES__'].find(
        function (instance) {
          if (!instance.moduleCache.has(remoteName)) return null;
          var container = instance.moduleCache.get(remoteName);
          if (!container.remoteInfo) return null;
          return container;
        },
      );

      if (container) {
        entryUrl = container.moduleCache.get(remoteName).remoteInfo.entry;
      } else {
        var currentName = __webpack_require__.federation.initOptions.name;
        var backupContainer = __FEDERATION__.__INSTANCES__.find(
          function (hostInstance) {
            return hostInstance.options.remotes.find(function (remote) {
              if (remote.name === currentName || remote.alias === currentName) {
                return true;
              }
              return false;
            });
          },
        );

        if (backupContainer) {
          var backupRemote = backupContainer.options.remotes.find(
            function (remote) {
              return (
                remote.name === currentName || remote.alias === currentName
              );
            },
          );
          entryUrl = backupRemote.entry;
        }
      }
      console.log('ENTRYURL', entryUrl);

      if (!entryUrl) {
        // var mockChunk = { modules: {}, ids: [], runtime: false };
        return callback(null);
        // throw new Error('Container not found');
      }

      console.log(entryUrl);

      url = new URL(entryUrl);
      var fileToReplace = path.basename(url.pathname);
      url.pathname = url.pathname.replace(fileToReplace, chunkName);
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

  const loadChunkStrategy = async (
    strategyType,
    chunkId,
    rootOutputDir,
    remotes,
    callback,
  ) => {
    switch (strategyType) {
      case 'filesystem':
        return await fileSystemRunInContextStrategy(
          chunkId,
          rootOutputDir,
          remotes,
          callback,
        );
      case 'http-eval':
        return await httpEvalStrategy(
          chunkId,
          rootOutputDir,
          remotes,
          callback,
        );
      case 'http-vm':
        return await httpVmStrategy(chunkId, rootOutputDir, remotes, callback);
      default:
        throw new Error('Invalid strategy type');
    }
  };
  // no baseURI

  // object to store loaded chunks
  // "0" means "already loaded", Promise means loading
  var installedChunks = {};

  // no on chunks loaded

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
    console.log('LOADING CONTAINER', url);
    if (!chunkId) {
      throw new Error('__webpack_require__.l name is required for ' + url);
    }
    var usesInternalRef = chunkId.indexOf('__webpack_require__') === 0;
    if (usesInternalRef) {
      var regex =
        /__webpack_require__\.federation\.instance\.moduleCache\.get\(([^)]+)\)/;
      var match = chunkId.match(regex);
      if (match) {
        chunkId = match[1].replace(/["']/g, '');
      }
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
        // array of [resolve, reject, promise] means "currently loading"
        if (installedChunkData) {
          promises.push(installedChunkData[2]);
        } else {
          console.log(
            'is outbound chunk handler ref',
            __webpack_require__.federation.chunkMatcher(chunkId),
          );
          // console.log(__webpack_require__.federation.bundlerRuntimeOptions);
          // console.log(__webpack_require__.federation.initOptions.name);
          if (
            // check if real chunk for handler. Federation makes virtual chunks that are handled by other handlers
            __webpack_require__.federation.chunkMatcher(chunkId)
            // or call mock chunk callback on chunk load failure
            // eslint-disable-next-line
            // true
          ) {
            // all chunks have JS
            // load the chunk and return promise to it
            var promise = new Promise(function (resolve, reject) {
              installedChunkData = installedChunks[chunkId] = [resolve, reject];

              function installChunkCallback(error, chunk) {
                if (error) return reject(error);
                // console.log(installChunk, __webpack_require__.C, __webpack_require__.federation.initOptions.name)
                if (chunk) installChunk(chunk);
                resolve(chunk);
              }

              var fs =
                typeof process !== 'undefined'
                  ? __non_webpack_require__('fs')
                  : false;
              var filename =
                typeof process !== 'undefined'
                  ? __non_webpack_require__('path').join(
                      __dirname,
                      __webpack_require__.federation.rootOutputDir || '',
                      __webpack_require__.u(chunkId),
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
                  typeof process !== 'undefined' ? 'http-vm' : 'http-eval';
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
          } else installedChunks[chunkId] = 0;
        }
      }
    };
    if (__webpack_require__.f.require) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        'CAUTION: build target is not set to "async-node", attempting to patch additional chunk handlers',
      );
      __webpack_require__.f.require = handle;
    }
    if (__webpack_require__.f.readFileVm) {
      __webpack_require__.f.readFileVm = handle;
    }
  }
  // no HMR

  // no HMR manifest
})();

export default function () {
  return {
    name: 'node-internal-plugin',
    beforeInit(args) {
      const { userOptions } = args;
      if (userOptions.remotes) {
        userOptions.remotes.forEach((remote) => {
          const { alias, name } = remote;
          if (alias && name.startsWith('__webpack_require__')) {
            remote.name = remote.alias;
          }
        });
      }
      return args;
    },
    init(args) {
      return args;
    },
    beforeRequest(args) {
      if (args.id.startsWith('__webpack_require__')) {
        const regex =
          /__webpack_require__\.federation\.instance\.moduleCache\.get\(([^)]+)\)/;
        const match = args.id.match(regex);
        if (match !== null) {
          const req = args.id.replace(match[0], '');
          const remoteID = match[1].replace(/["']/g, '');
          args.id = [remoteID, req].join('');
        }
      }
      return args;
    },
  };
}
