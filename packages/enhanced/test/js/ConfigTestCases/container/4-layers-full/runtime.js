/******/ (() => {
  // webpackBootstrap
  /******/ 'use strict';
  /******/ var __webpack_modules__ = {};
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ var execOptions = {
      id: moduleId,
      module: module,
      factory: __webpack_modules__[moduleId],
      require: __webpack_require__,
    };
    /******/ __webpack_require__.i.forEach(function (handler) {
      handler(execOptions);
    });
    /******/ module = execOptions.module;
    /******/ execOptions.factory.call(
      module.exports,
      module,
      module.exports,
      execOptions.require,
    );
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/ __webpack_require__.m = __webpack_modules__;
  /******/
  /******/ // expose the module cache
  /******/ __webpack_require__.c = __webpack_module_cache__;
  /******/
  /******/ // expose the module execution interceptor
  /******/ __webpack_require__.i = [];
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/federation runtime */
  /******/ (() => {
    /******/ if (!__webpack_require__.federation) {
      /******/ __webpack_require__.federation = {
        /******/ initOptions: {
          name: 'layers_container_2',
          remotes: [],
          shareStrategy: 'version-first',
        },
        /******/ chunkMatcher: function (chunkId) {
          return !/^(121|230|425)$/.test(chunkId);
        },
        /******/ rootOutputDir: '',
        /******/ initialConsumes: undefined,
        /******/ bundlerRuntimeOptions: {},
        /******/
      };
      /******/
    }
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/compat get default export */
  /******/ (() => {
    /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/ __webpack_require__.n = (module) => {
      /******/ var getter =
        module && module.__esModule
          ? /******/ () => module['default']
          : /******/ () => module;
      /******/ __webpack_require__.d(getter, { a: getter });
      /******/ return getter;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/define property getters */
  /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/ensure chunk */
  /******/ (() => {
    /******/ __webpack_require__.f = {};
    /******/ // This file contains only the entry chunk.
    /******/ // The chunk loading function for additional chunks
    /******/ __webpack_require__.e = (chunkId) => {
      /******/ return Promise.all(
        Object.keys(__webpack_require__.f).reduce((promises, key) => {
          /******/ __webpack_require__.f[key](chunkId, promises);
          /******/ return promises;
          /******/
        }, []),
      );
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/get javascript chunk filename */
  /******/ (() => {
    /******/ // This function allow to reference async chunks and sibling chunks for the entrypoint
    /******/ __webpack_require__.u = (chunkId) => {
      /******/ // return url for filenames based on template
      /******/ return (
        '' +
        ({
          477: '__federation_expose_ComponentB',
          668: '__federation_expose_ComponentC',
        }[chunkId] || chunkId) +
        '.js'
      );
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/hasOwnProperty shorthand */
  /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/make namespace object */
  /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module',
        });
        /******/
      }
      /******/ Object.defineProperty(exports, '__esModule', { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/remotes loading */
  /******/ (() => {
    /******/ var chunkMapping = {
      /******/ 425: [
        /******/ 146, /******/ 308,
        /******/
      ],
      /******/
    };
    /******/ var idToExternalAndNameMapping = {
      /******/ 146: [
        /******/ 'default',
        /******/ './ComponentA',
        /******/ 345,
        /******/
      ],
      /******/ 308: [
        /******/ 'default',
        /******/ './ComponentB',
        /******/ 640,
        /******/
      ],
      /******/
    };
    /******/ var idToRemoteMap = {
      /******/ 146: [
        /******/ {
          /******/ externalType: 'commonjs-module',
          /******/ name: '',
          /******/ externalModuleId: 345,
          /******/
        },
        /******/
      ],
      /******/ 308: [
        /******/ {
          /******/ externalType: 'commonjs-module',
          /******/ name: '',
          /******/ externalModuleId: 640,
          /******/
        },
        /******/
      ],
      /******/
    };
    /******/ __webpack_require__.federation.bundlerRuntimeOptions.remotes = {
      idToRemoteMap,
      chunkMapping,
      idToExternalAndNameMapping,
      webpackRequire: __webpack_require__,
    };
    /******/ __webpack_require__.f.remotes = (chunkId, promises) => {
      /******/ __webpack_require__.federation.bundlerRuntime.remotes({
        idToRemoteMap,
        chunkMapping,
        idToExternalAndNameMapping,
        chunkId,
        promises,
        webpackRequire: __webpack_require__,
      });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/sharing */
  /******/ (() => {
    /******/ __webpack_require__.S = {};
    /******/ var initPromises = {};
    /******/ var initTokens = {};
    /******/ __webpack_require__.I = (name, initScope) => {
      /******/ if (!initScope) initScope = [];
      /******/ // handling circular init calls
      /******/ var initToken = initTokens[name];
      /******/ if (!initToken) initToken = initTokens[name] = {};
      /******/ if (initScope.indexOf(initToken) >= 0) return;
      /******/ initScope.push(initToken);
      /******/ // only runs once
      /******/ if (initPromises[name]) return initPromises[name];
      /******/ // creates a new share scope if needed
      /******/ if (!__webpack_require__.o(__webpack_require__.S, name))
        __webpack_require__.S[name] = {};
      /******/ // runs all init snippets from all modules reachable
      /******/ var scope = __webpack_require__.S[name];
      /******/ var warn = (msg) => {
        /******/ if (typeof console !== 'undefined' && console.warn)
          console.warn(msg);
        /******/
      };
      /******/ var uniqueName = '4-layers-full';
      /******/ var register = (name, version, factory, eager) => {
        /******/ var versions = (scope[name] = scope[name] || {});
        /******/ var activeVersion = versions[version];
        /******/ if (
          !activeVersion ||
          (!activeVersion.loaded &&
            (!eager != !activeVersion.eager
              ? eager
              : uniqueName > activeVersion.from))
        )
          versions[version] = {
            get: factory,
            from: uniqueName,
            eager: !!eager,
          };
        /******/
      };
      /******/ var initExternal = (id) => {
        /******/ var handleError = (err) =>
          warn('Initialization of sharing external failed: ' + err);
        /******/ try {
          /******/ var module = __webpack_require__(id);
          /******/ if (!module) return;
          /******/ var initFn = (module) =>
            module &&
            module.init &&
            module.init(__webpack_require__.S[name], initScope);
          /******/ if (module.then)
            return promises.push(module.then(initFn, handleError));
          /******/ var initResult = initFn(module);
          /******/ if (initResult && initResult.then)
            return promises.push(initResult['catch'](handleError));
          /******/
        } catch (err) {
          handleError(err);
        }
        /******/
      };
      /******/ var promises = [];
      /******/ switch (name) {
        /******/ case 'default':
          {
            /******/ register('react', '2.1.0', () =>
              __webpack_require__
                .e(979)
                .then(
                  () => () =>
                    __webpack_require__(/*! ./node_modules/react.js */ 979),
                ),
            );
            /******/ initExternal(345);
            /******/ initExternal(640);
            /******/
          }
          /******/ break;
        /******/
      }
      /******/ if (!promises.length) return (initPromises[name] = 1);
      /******/ return (initPromises[name] = Promise.all(promises).then(
        () => (initPromises[name] = 1),
      ));
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/startup entrypoint */
  /******/ (() => {
    /******/ __webpack_require__.X = (result, chunkIds, fn) => {
      /******/ // arguments: chunkIds, moduleId are deprecated
      /******/ var moduleId = chunkIds;
      /******/ if (!fn)
        (chunkIds = result),
          (fn = () => __webpack_require__((__webpack_require__.s = moduleId)));
      /******/ return Promise.all(
        chunkIds.map(__webpack_require__.e, __webpack_require__),
      ).then(() => {
        /******/ var r = fn();
        /******/ return r === undefined ? result : r;
        /******/
      });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/sharing */
  /******/ (() => {
    /******/ __webpack_require__.federation.initOptions.shared = {
      react: [
        {
          version: '2.1.0',
          /******/ get: () =>
            __webpack_require__
              .e(979)
              .then(
                () => () =>
                  __webpack_require__(/*! ./node_modules/react.js */ 979),
              ),
          /******/ scope: ['default'],
          /******/ shareConfig: {
            eager: false,
            requiredVersion: false,
            strictVersion: false,
            singleton: false,
            layer: null,
          },
        },
      ],
    };
    /******/ __webpack_require__.S = {};
    /******/ var initPromises = {};
    /******/ var initTokens = {};
    /******/ __webpack_require__.I = (name, initScope) => {
      /******/ return __webpack_require__.federation.bundlerRuntime.I({
        shareScopeName: name,
        /******/ webpackRequire: __webpack_require__,
        /******/ initPromises: initPromises,
        /******/ initTokens: initTokens,
        /******/ initScope: initScope,
        /******/
      });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/consumes */
  /******/ (() => {
    /******/ var installedModules = {};
    /******/ var moduleToHandlerMapping = {
      /******/ 230: {
        /******/ getter: () =>
          __webpack_require__
            .e(979)
            .then(() => () => __webpack_require__(/*! react */ 979)),
        /******/ shareInfo: {
          /******/ shareConfig: {
            /******/ fixedDependencies: false,
            /******/ requiredVersion: '*',
            /******/ strictVersion: true,
            /******/ singleton: false,
            /******/ eager: false,
            /******/
          },
          /******/ scope: ['default'],
          /******/
        },
        /******/ shareKey: 'react',
        /******/
      },
      /******/
    };
    /******/ // no consumes in initial chunks
    /******/ var chunkMapping = {
      /******/ 230: [
        /******/ 230,
        /******/
      ],
      /******/
    };
    /******/ __webpack_require__.f.consumes = (chunkId, promises) => {
      /******/ __webpack_require__.federation.bundlerRuntime.consumes({
        /******/ chunkMapping: chunkMapping,
        /******/ installedModules: installedModules,
        /******/ chunkId: chunkId,
        /******/ moduleToHandlerMapping: moduleToHandlerMapping,
        /******/ promises: promises,
        /******/ webpackRequire: __webpack_require__,
        /******/
      });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/readFile chunk loading */
  /******/ (() => {
    /******/ // no baseURI
    /******/
    /******/ // object to store loaded chunks
    /******/ // "0" means "already loaded", Promise means loading
    /******/ var installedChunks = {
      /******/ 121: 0,
      /******/
    };
    /******/
    /******/ // no on chunks loaded
    /******/
    /******/ var installChunk = (chunk) => {
      /******/ var moreModules = chunk.modules,
        chunkIds = chunk.ids,
        runtime = chunk.runtime;
      /******/ for (var moduleId in moreModules) {
        /******/ if (__webpack_require__.o(moreModules, moduleId)) {
          /******/ __webpack_require__.m[moduleId] = moreModules[moduleId];
          /******/
        }
        /******/
      }
      /******/ if (runtime) runtime(__webpack_require__);
      /******/ for (var i = 0; i < chunkIds.length; i++) {
        /******/ if (installedChunks[chunkIds[i]]) {
          /******/ installedChunks[chunkIds[i]][0]();
          /******/
        }
        /******/ installedChunks[chunkIds[i]] = 0;
        /******/
      }
      /******/
      /******/
    };
    /******/
    /******/ // ReadFile + VM.run chunk loading for javascript
    /******/ __webpack_require__.f.readFileVm = function (chunkId, promises) {
      /******/
      /******/ var installedChunkData = installedChunks[chunkId];
      /******/ if (installedChunkData !== 0) {
        // 0 means "already installed".
        /******/ // array of [resolve, reject, promise] means "currently loading"
        /******/ if (installedChunkData) {
          /******/ promises.push(installedChunkData[2]);
          /******/
        } else {
          /******/ if (!/^(121|230|425)$/.test(chunkId)) {
            /******/ // load the chunk and return promise to it
            /******/ var promise = new Promise(function (resolve, reject) {
              /******/ installedChunkData = installedChunks[chunkId] = [
                resolve,
                reject,
              ];
              /******/ var filename = require('path').join(
                __dirname,
                '' + __webpack_require__.u(chunkId),
              );
              /******/ require('fs').readFile(
                filename,
                'utf-8',
                function (err, content) {
                  /******/ if (err) return reject(err);
                  /******/ var chunk = {};
                  /******/ require('vm').runInThisContext(
                    '(function(exports, require, __dirname, __filename) {' +
                      content +
                      '\n})',
                    filename,
                  )(
                    chunk,
                    require,
                    require('path').dirname(filename),
                    filename,
                  );
                  /******/ installChunk(chunk);
                  /******/
                },
              );
              /******/
            });
            /******/ promises.push((installedChunkData[2] = promise));
            /******/
          } else installedChunks[chunkId] = 0;
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
    /******/ module.exports = __webpack_require__;
    /******/ __webpack_require__.C = installChunk;
    /******/
    /******/ // no HMR
    /******/
    /******/ // no HMR manifest
    /******/
  })();
  /******/
  /************************************************************************/
  /******/
  /******/ // module cache are used so entry inlining is disabled
  /******/
  /******/
})();
