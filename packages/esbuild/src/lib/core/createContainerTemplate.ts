export const createContainerCode = `
import bundler_runtime_base from '@module-federation/webpack-bundler-runtime';
// import instantiatePatch from "./federation.js";

const createContainer = (federationOptions) => {
  // await instantiatePatch(federationOptions, true);
  const {exposes, name, remotes = [], shared, plugins} = federationOptions;

  const __webpack_modules__ = {
    "./node_modules/.federation/entry.1f2288102e035e2ed66b2efaf60ad043.js": (module, __webpack_exports__, __webpack_require__) => {
      __webpack_require__.r(__webpack_exports__);
      const bundler_runtime = __webpack_require__.n(bundler_runtime_base);
      const prevFederation = __webpack_require__.federation;
      __webpack_require__.federation = {};
      for (const key in bundler_runtime()) {
        __webpack_require__.federation[key] = bundler_runtime()[key];
      }
      for (const key in prevFederation) {
        __webpack_require__.federation[key] = prevFederation[key];
      }
      if (!__webpack_require__.federation.instance) {
        const pluginsToAdd = plugins || [];
        __webpack_require__.federation.initOptions.plugins = __webpack_require__.federation.initOptions.plugins ?
          __webpack_require__.federation.initOptions.plugins.concat(pluginsToAdd) : pluginsToAdd;
        __webpack_require__.federation.instance = __webpack_require__.federation.runtime.init(__webpack_require__.federation.initOptions);
        if (__webpack_require__.federation.attachShareScopeMap) {
          __webpack_require__.federation.attachShareScopeMap(__webpack_require__);
        }
        if (__webpack_require__.federation.installInitialConsumes) {
          __webpack_require__.federation.installInitialConsumes();
        }
      }
    },

    "webpack/container/entry/createContainer": (module, exports, __webpack_require__) => {
      const moduleMap = {};
      for (const key in exposes) {
        if (Object.prototype.hasOwnProperty.call(exposes, key)) {
          moduleMap[key] = () => Promise.resolve(exposes[key]()).then(m => () => m);
        }
      }

      const get = (module, getScope) => {
        __webpack_require__.R = getScope;
        getScope = (
          __webpack_require__.o(moduleMap, module)
            ? moduleMap[module]()
            : Promise.resolve().then(() => {
              throw new Error("Module '" + module + "' does not exist in container.");
            })
        );
        __webpack_require__.R = undefined;
        return getScope;
      };
      const init = (shareScope, initScope, remoteEntryInitOptions) => {
        return __webpack_require__.federation.bundlerRuntime.initContainerEntry({
          webpackRequire: __webpack_require__,
          shareScope: shareScope,
          initScope: initScope,
          remoteEntryInitOptions: remoteEntryInitOptions,
          shareScopeKey: "default"
        });
      };
      __webpack_require__("./node_modules/.federation/entry.1f2288102e035e2ed66b2efaf60ad043.js");

      // This exports getters to disallow modifications
      __webpack_require__.d(exports, {
        get: () => get,
        init: () => init,
        moduleMap: () => moduleMap,
      });
    }
  };

  const __webpack_module_cache__ = {};

  const __webpack_require__ = (moduleId) => {
    let cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    let module = __webpack_module_cache__[moduleId] = {
      id: moduleId,
      loaded: false,
      exports: {}
    };

    const execOptions = {
      id: moduleId,
      module: module,
      factory: __webpack_modules__[moduleId],
      require: __webpack_require__
    };
    __webpack_require__.i.forEach(handler => {
      handler(execOptions);
    });
    module = execOptions.module;
    execOptions.factory.call(module.exports, module, module.exports, execOptions.require);

    module.loaded = true;

    return module.exports;
  };

  __webpack_require__.m = __webpack_modules__;
  __webpack_require__.c = __webpack_module_cache__;
  __webpack_require__.i = [];

  if (!__webpack_require__.federation) {
    __webpack_require__.federation = {
      initOptions: {
        "name": name,
        "remotes": remotes.map(remote => ({
          "type": remote.type,
          "alias": remote.alias,
          "name": remote.name,
          "entry": remote.entry,
          "shareScope": remote.shareScope || "default"
        }))
      },
      chunkMatcher: () => true,
      rootOutputDir: "",
      initialConsumes: undefined,
      bundlerRuntimeOptions: {}
    };
  }

  __webpack_require__.n = (module) => {
    const getter = module && module.__esModule ? () => module['default'] : () => module;
    __webpack_require__.d(getter, {a: getter});
    return getter;
  };

  __webpack_require__.d = (exports, definition) => {
    for (const key in definition) {
      if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
        Object.defineProperty(exports, key, {enumerable: true, get: definition[key]});
      }
    }
  };

  __webpack_require__.f = {};

  __webpack_require__.g = (() => {
    if (typeof globalThis === 'object') return globalThis;
    try {
      return this || new Function('return this')();
    } catch (e) {
      if (typeof window === 'object') return window;
    }
  })();

  __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

  __webpack_require__.r = (exports) => {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, {value: 'Module'});
    }
    Object.defineProperty(exports, '__esModule', {value: true});
  };

  __webpack_require__.federation.initOptions.shared = shared;
  __webpack_require__.S = {};
  const initPromises = {};
  const initTokens = {};
  __webpack_require__.I = (name, initScope) => {
    return __webpack_require__.federation.bundlerRuntime.I({
      shareScopeName: name,
      webpackRequire: __webpack_require__,
      initPromises: initPromises,
      initTokens: initTokens,
      initScope: initScope,
    });
  };

  const __webpack_exports__ = __webpack_require__("webpack/container/entry/createContainer");
  const __webpack_exports__get = __webpack_exports__.get;
  const __webpack_exports__init = __webpack_exports__.init;
  const __webpack_exports__moduleMap = __webpack_exports__.moduleMap;
  return __webpack_exports__;
}`;
