import { FederationRuntimePlugin } from '@module-federation/runtime/types';
import fs from 'fs';

if (typeof __webpack_require__ !== 'undefined') {
  __webpack_require__.l = (url, callback, chunkId) => {
    console.log('execute load', url);

    async function executeLoad(url, callback, name) {
      console.log('execute load', url);
      if (!name) {
        throw new Error('__webpack_require__.l name is required for ' + url);
      }
      const usesInternalRef = name.startsWith('__webpack_require__');
      if (usesInternalRef) {
        const regex =
          /__webpack_require__\.federation\.instance\.moduleCache\.get\(([^)]+)\)/;
        const match = name.match(regex);
        if (match) {
          name = match[1].replace(/["']/g, '');
        }
      }
      try {
        const federation = __webpack_require__.federation;
        const res = await __webpack_require__.federation.runtime.loadScriptNode(
          url,
          { attrs: {} },
        );
        const enhancedRemote = await federation.instance.initRawContainer(
          name,
          url,
          res,
        );
        console.log(enhancedRemote);
        // use normal global assignment
        if (!usesInternalRef && !globalThis[name]) {
          globalThis[name] = enhancedRemote;
        }
        callback(enhancedRemote);
      } catch (error) {
        callback(error);
      }
    }

    executeLoad(url, callback, chunkId);
  };
}
// Dynamic filesystem chunk loading for javascript
// async function fileSystemRunInContextStrategy(chunkId, rootOutputDir, remotes, callback) {
//   const fs = require("fs");
//   const path = require("path");
//   const vm = require("vm");
//   const filename = path.join(__dirname, rootOutputDir + __webpack_require__.u(chunkId));
//   if (fs.existsSync(filename)) {
//     fs.readFile(filename, "utf-8", (err, content) => {
//       if (err) {
//         callback(err, null);
//         return;
//       }
//       const chunk = {};
//       try {
//         vm.runInThisContext("(function(exports, require, __dirname, __filename) {" +
//           content +
//           "\n})", filename)(chunk, require, path.dirname(filename), filename);
//         callback(null, chunk);
//       } catch (e) {
//         console.log("'runInThisContext threw'", e);
//         callback(e, null);
//       }
//     });
//   } else {
//     const err = new Error(`File ${filename} does not exist`);
//     callback(err, null);
//   }
// }

// async function httpEvalStrategy(chunkName, remoteName, remotes, callback) {
//   let url;
//   try {
//     url = new URL(chunkName, __webpack_require__.p);
//   } catch (e) {
//     console.error("module-federation: failed to construct absolute chunk path of", remoteName, "for", chunkName);
//     url = new URL(remotes[remoteName]);
//     const getBasenameFromUrl = (url) => {
//       const urlParts = url.split("/");
//       return urlParts[urlParts.length - 1];
//     };
//     const fileToReplace = getBasenameFromUrl(url.pathname);
//     url.pathname = url.pathname.replace(fileToReplace, chunkName);
//   }
//   const data = await fetch(url).then((res) => res.text());
//   const chunk = {};
//   try {
//     const urlDirname = url.pathname.split("/").slice(0, -1).join("/");
//     eval("(function(exports, require, __dirname, __filename) {" + data + "\n})")(chunk, require, urlDirname, chunkName);
//     callback(null, chunk);
//   } catch (e) {
//     callback(e, null);
//   }
// }
//
async function httpVmStrategy(chunkName, remoteName, remotes, callback) {
  const http = require('http');
  const https = require('https');
  const vm = require('vm');
  const path = require('path');
  console.log('http vm strategy');
  let url;
  const globalThisVal = new Function('return globalThis')();
  try {
    url = new URL(chunkName, __webpack_require__.p);
  } catch (e) {
    // console.error("module-federation: failed to construct absolute chunk path of", remoteName, "for", chunkName);
    // search all instances to see if any have the remote
    const container = globalThisVal['__FEDERATION__']['__INSTANCES__'].find(
      (instance) => {
        if (!instance.moduleCache.has(remoteName)) return;
        const container = instance.moduleCache.get(remoteName);
        if (!container.remoteInfo) return;
        return container.remoteInfo.entry;
      },
    );
    if (!container) {
      throw new Error('Container not found');
    }
    url = new URL(container.moduleCache.get(remoteName).remoteInfo.entry);
    const fileToReplace = path.basename(url.pathname);
    url.pathname = url.pathname.replace(fileToReplace, chunkName);
  }
  console.log(url);
  const protocol = url.protocol === 'https:' ? https : http;

  protocol.get(url.href, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk.toString();
    });
    res.on('end', () => {
      console.log('data end');
      const chunk = {};
      const urlDirname = url.pathname.split('/').slice(0, -1).join('/');
      try {
        vm.runInThisContext(
          `(function(exports, require, __dirname, __filename) {${data}\n})`,
          chunkName,
        )(chunk, require, urlDirname, chunkName);
      } catch (e) {
        callback(e, null);
      }
      callback(null, chunk);
    });
    res.on('error', (err) => {
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
    //   case "filesystem":
    //     return await fileSystemRunInContextStrategy(chunkId, rootOutputDir, remotes, callback);
    //   case "http-eval":
    //     return await httpEvalStrategy(chunkId, rootOutputDir, remotes, callback);
    case 'http-vm':
      return await httpVmStrategy(chunkId, rootOutputDir, remotes, callback);
    default:
      throw new Error('Invalid strategy type');
  }
};
// no baseURI
// object to store loaded chunks
// "0" means "already loaded", Promise means loading
const installedChunks = {
  0: 0,
};
// no on chunks loaded
const installChunk = (chunk) => {
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
if (__webpack_require__.f) {
  const originalReadFile = __webpack_require__.f.readFileVm;

  __webpack_require__.f.readFileVm = function (chunkId, promises) {
    var filename = require('path').join(
      __dirname,
      '' + __webpack_require__.u(chunkId),
    );
    const fs = require('fs');
    if (fs && !fs.existsSync(filename)) return;
    originalReadFile(chunkId, promises);
  };
  // Dynamic filesystem chunk loading for javascript
  __webpack_require__.f.dynamicFilesystem = function (chunkId, promises) {
    let installedChunkData = installedChunks[chunkId];
    const fs = typeof process !== 'undefined' ? require('fs') : false;
    const filename =
      typeof process !== 'undefined'
        ? require('path').join(__dirname, '' + __webpack_require__.u(chunkId))
        : false;
    if (fs && fs.existsSync(filename)) return;
    // console.log(__webpack_require__.federation)
    if (__webpack_require__.federation.bundlerRuntimeOptions.remotes) {
      if (
        __webpack_require__.federation.bundlerRuntimeOptions.remotes
          .chunkMapping[chunkId]
      )
        return;
    }
    // if(__webpack_require__.federation.bundlerRuntimeOptions.remotes.chunkMapping[chunkId]) return
    // if(__webpack_require__.federation.bundlerRuntimeOptions.consumes.chunkMapping[chunkId]) return
    console.log(
      __webpack_require__.federation.initOptions.name,
      'DFS',
      chunkId,
    );

    if (installedChunkData !== 0) {
      // 0 means "already installed".
      // array of [resolve, reject, promise] means "currently loading"

      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        if (true) {
          console.log('should load here');
          const fs = typeof process !== 'undefined' ? require('fs') : false;
          const filename =
            typeof process !== 'undefined'
              ? require('path').join(
                  __dirname,
                  '' + __webpack_require__.u(chunkId),
                )
              : false;
          console.log(filename);
          // load the chunk and return promise to it
          const promise = new Promise(async function (resolve, reject) {
            installedChunkData = installedChunks[chunkId] = [resolve, reject];

            function installChunkCallback(error, chunk) {
              if (error) return reject(error);
              installChunk(chunk);
            }

            console.log('loading remote');
            const remotes = {
              node_remote: 'http://localhost:3002/remoteEntry.js',
            };
            const chunkName = __webpack_require__.u(chunkId);
            const loadingStrategy =
              typeof process !== 'undefined' ? 'http-vm' : 'http-eval';
            loadChunkStrategy(
              loadingStrategy,
              chunkName,
              __webpack_require__.federation.initOptions.name,
              __webpack_require__.federation.initOptions.remotes,
              installChunkCallback,
            );
          });
          promises.push((installedChunkData[2] = promise));
        }
      }
    }
  };
}

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
