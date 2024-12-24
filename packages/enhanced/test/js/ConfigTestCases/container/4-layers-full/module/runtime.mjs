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
      /******/ rootOutputDir: '../',
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
  /******/ // This function allow to reference async chunks
  /******/ __webpack_require__.u = (chunkId) => {
    /******/ // return url for filenames based on template
    /******/ return (
      'module/' +
      ({
        477: '__federation_expose_ComponentB',
        668: '__federation_expose_ComponentC',
      }[chunkId] || chunkId) +
      '.mjs'
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
      /******/ 911,
      /******/
    ],
    /******/ 308: [
      /******/ 'default',
      /******/ './ComponentB',
      /******/ 342,
      /******/
    ],
    /******/
  };
  /******/ var idToRemoteMap = {
    /******/ 146: [
      /******/ {
        /******/ externalType: 'module',
        /******/ name: '',
        /******/ externalModuleId: 911,
        /******/
      },
      /******/
    ],
    /******/ 308: [
      /******/ {
        /******/ externalType: 'module',
        /******/ name: '',
        /******/ externalModuleId: 342,
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
    /******/ var uniqueName = '4-layers-full-mjs';
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
        versions[version] = { get: factory, from: uniqueName, eager: !!eager };
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
          /******/ initExternal(911);
          /******/ initExternal(342);
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
/******/ /* webpack/runtime/export webpack runtime */
/******/ export default __webpack_require__;
/******/
/******/ /* webpack/runtime/import chunk loading */
/******/ (() => {
  /******/ // no baseURI
  /******/
  /******/ // object to store loaded and loading chunks
  /******/ // undefined = chunk not loaded, null = chunk preloaded/prefetched
  /******/ // [resolve, Promise] = chunk loading, 0 = chunk loaded
  /******/ var installedChunks = {
    /******/ 121: 0,
    /******/
  };
  /******/
  /******/ var installChunk = (data) => {
    /******/ var { ids, modules, runtime } = data;
    /******/ // add "modules" to the modules object,
    /******/ // then flag all "ids" as loaded and fire callback
    /******/ var moduleId,
      chunkId,
      i = 0;
    /******/ for (moduleId in modules) {
      /******/ if (__webpack_require__.o(modules, moduleId)) {
        /******/ __webpack_require__.m[moduleId] = modules[moduleId];
        /******/
      }
      /******/
    }
    /******/ if (runtime) runtime(__webpack_require__);
    /******/ for (; i < ids.length; i++) {
      /******/ chunkId = ids[i];
      /******/ if (
        __webpack_require__.o(installedChunks, chunkId) &&
        installedChunks[chunkId]
      ) {
        /******/ installedChunks[chunkId][0]();
        /******/
      }
      /******/ installedChunks[ids[i]] = 0;
      /******/
    }
    /******/
    /******/
  };
  /******/
  /******/ __webpack_require__.f.j = (chunkId, promises) => {
    /******/ // import() chunk loading for javascript
    /******/ var installedChunkData = __webpack_require__.o(
      installedChunks,
      chunkId,
    )
      ? installedChunks[chunkId]
      : undefined;
    /******/ if (installedChunkData !== 0) {
      // 0 means "already installed".
      /******/
      /******/ // a Promise means "currently loading".
      /******/ if (installedChunkData) {
        /******/ promises.push(installedChunkData[1]);
        /******/
      } else {
        /******/ if (!/^(121|230|425)$/.test(chunkId)) {
          /******/ // setup Promise in chunk cache
          /******/ var promise = import(
            '../' + __webpack_require__.u(chunkId)
          ).then(installChunk, (e) => {
            /******/ if (installedChunks[chunkId] !== 0)
              installedChunks[chunkId] = undefined;
            /******/ throw e;
            /******/
          });
          /******/ var promise = Promise.race([
            promise,
            new Promise(
              (resolve) =>
                (installedChunkData = installedChunks[chunkId] = [resolve]),
            ),
          ]);
          /******/ promises.push((installedChunkData[1] = promise));
          /******/
        } else installedChunks[chunkId] = 0;
        /******/
      }
      /******/
    }
    /******/
  };
  /******/
  /******/ // no prefetching
  /******/
  /******/ // no preloaded
  /******/
  /******/ __webpack_require__.C = installChunk;
  /******/
  /******/ // no on chunks loaded
  /******/
})();
/******/
/************************************************************************/
/******/
/******/ // module cache are used so entry inlining is disabled
/******/
