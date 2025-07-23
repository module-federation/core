/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/esm/_async_to_generator.js":
/*!********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/esm/_async_to_generator.js ***!
  \********************************************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _: function() { return /* binding */ _async_to_generator; },
/* harmony export */   _async_to_generator: function() { return /* binding */ _async_to_generator; }
/* harmony export */ });
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) resolve(value);
    else Promise.resolve(value).then(_next, _throw);
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;

        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);

            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }

            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }

            _next(undefined);
        });
    };
}



/***/ }),

/***/ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/esm/_type_of.js":
/*!*********************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/esm/_type_of.js ***!
  \*********************************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _: function() { return /* binding */ _type_of; },
/* harmony export */   _type_of: function() { return /* binding */ _type_of; }
/* harmony export */ });
function _type_of(obj) {
    "@swc/helpers - typeof";

    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}



/***/ }),

/***/ "../../node_modules/.pnpm/process@0.11.10/node_modules/process/browser.js":
/*!********************************************************************************!*\
  !*** ../../node_modules/.pnpm/process@0.11.10/node_modules/process/browser.js ***!
  \********************************************************************************/
/***/ (function(module) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "../../packages/error-codes/dist/index.esm.mjs":
/*!*****************************************************!*\
  !*** ../../packages/error-codes/dist/index.esm.mjs ***!
  \*****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BUILD_001: function() { return /* binding */ BUILD_001; },
/* harmony export */   RUNTIME_001: function() { return /* binding */ RUNTIME_001; },
/* harmony export */   RUNTIME_002: function() { return /* binding */ RUNTIME_002; },
/* harmony export */   RUNTIME_003: function() { return /* binding */ RUNTIME_003; },
/* harmony export */   RUNTIME_004: function() { return /* binding */ RUNTIME_004; },
/* harmony export */   RUNTIME_005: function() { return /* binding */ RUNTIME_005; },
/* harmony export */   RUNTIME_006: function() { return /* binding */ RUNTIME_006; },
/* harmony export */   RUNTIME_007: function() { return /* binding */ RUNTIME_007; },
/* harmony export */   RUNTIME_008: function() { return /* binding */ RUNTIME_008; },
/* harmony export */   TYPE_001: function() { return /* binding */ TYPE_001; },
/* harmony export */   buildDescMap: function() { return /* binding */ buildDescMap; },
/* harmony export */   errorDescMap: function() { return /* binding */ errorDescMap; },
/* harmony export */   getShortErrorMsg: function() { return /* binding */ getShortErrorMsg; },
/* harmony export */   runtimeDescMap: function() { return /* binding */ runtimeDescMap; },
/* harmony export */   typeDescMap: function() { return /* binding */ typeDescMap; }
/* harmony export */ });
var RUNTIME_001 = "RUNTIME-001";
var RUNTIME_002 = "RUNTIME-002";
var RUNTIME_003 = "RUNTIME-003";
var RUNTIME_004 = "RUNTIME-004";
var RUNTIME_005 = "RUNTIME-005";
var RUNTIME_006 = "RUNTIME-006";
var RUNTIME_007 = "RUNTIME-007";
var RUNTIME_008 = "RUNTIME-008";
var TYPE_001 = "TYPE-001";
var BUILD_001 = "BUILD-001";
var getDocsUrl = (errorCode)=>{
    var type = errorCode.split("-")[0].toLowerCase();
    return "View the docs to see how to solve: https://module-federation.io/guide/troubleshooting/".concat(type, "/").concat(errorCode);
};
var getShortErrorMsg = (errorCode, errorDescMap, args, originalErrorMsg)=>{
    var msg = [
        "".concat([
            errorDescMap[errorCode]
        ], " #").concat(errorCode)
    ];
    args && msg.push("args: ".concat(JSON.stringify(args)));
    msg.push(getDocsUrl(errorCode));
    originalErrorMsg && msg.push("Original Error Message:\n ".concat(originalErrorMsg));
    return msg.join("\n");
};
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
var runtimeDescMap = {
    [RUNTIME_001]: "Failed to get remoteEntry exports.",
    [RUNTIME_002]: 'The remote entry interface does not contain "init"',
    [RUNTIME_003]: "Failed to get manifest.",
    [RUNTIME_004]: "Failed to locate remote.",
    [RUNTIME_005]: "Invalid loadShareSync function call from bundler runtime",
    [RUNTIME_006]: "Invalid loadShareSync function call from runtime",
    [RUNTIME_007]: "Failed to get remote snapshot.",
    [RUNTIME_008]: "Failed to load script resources."
};
var typeDescMap = {
    [TYPE_001]: "Failed to generate type declaration. Execute the below cmd to reproduce and fix the error."
};
var buildDescMap = {
    [BUILD_001]: "Failed to find expose module."
};
var errorDescMap = _extends({}, runtimeDescMap, typeDescMap, buildDescMap);



/***/ }),

/***/ "../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.cjs?runtimePlugin":
/*!*******************************************************************************************!*\
  !*** ../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.cjs?runtimePlugin ***!
  \*******************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
var _async_to_generator = __webpack_require__(/*! @swc/helpers/_/_async_to_generator */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/esm/_async_to_generator.js");
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports["default"] = default_1;
function default_1() {
    return {
        name: "next-internal-plugin",
        createScript: function createScript(args) {
            var url = args.url;
            var attrs = args.attrs;
            if (true) {
                var script = document.createElement("script");
                script.src = url;
                script.async = true;
                attrs === null || attrs === void 0 ? true : delete attrs["crossorigin"];
                return {
                    script: script,
                    timeout: 8000
                };
            }
            return undefined;
        },
        errorLoadRemote: function errorLoadRemote(args) {
            var id = args.id;
            var error = args.error;
            var from = args.from;
            //@ts-ignore
            globalThis.moduleGraphDirty = true;
            console.error(id, "offline");
            var pg = function pg() {
                console.error(id, "offline", error);
                return null;
            };
            pg.getInitialProps = function(ctx) {
                return {};
            };
            var mod;
            if (from === "build") {
                mod = function mod() {
                    return {
                        __esModule: true,
                        default: pg,
                        getServerSideProps: function getServerSideProps() {
                            return {
                                props: {}
                            };
                        }
                    };
                };
            } else {
                mod = {
                    default: pg,
                    getServerSideProps: function getServerSideProps() {
                        return {
                            props: {}
                        };
                    }
                };
            }
            return mod;
        },
        beforeInit: function beforeInit(args) {
            if (!globalThis.usedChunks) globalThis.usedChunks = new Set();
            if (typeof __webpack_require__.j === "string" && !__webpack_require__.j.startsWith("webpack")) {
                return args;
            }
            var moduleCache = args.origin.moduleCache;
            var name = args.origin.name;
            var gs;
            try {
                gs = new Function("return globalThis")();
            } catch (e) {
                gs = globalThis; // fallback for browsers without 'unsafe-eval' CSP policy enabled
            }
            //@ts-ignore
            var attachedRemote = gs[name];
            if (attachedRemote) {
                moduleCache.set(name, attachedRemote);
            }
            return args;
        },
        init: function init(args) {
            return args;
        },
        beforeRequest: function beforeRequest(args) {
            var options = args.options;
            var id = args.id;
            var remoteName = id.split("/").shift();
            var remote = options.remotes.find(function(remote) {
                return remote.name === remoteName;
            });
            if (!remote) return args;
            if (remote && remote.entry && remote.entry.includes("?t=")) {
                return args;
            }
            remote.entry = remote.entry + "?t=" + Date.now();
            return args;
        },
        afterResolve: function afterResolve(args) {
            return args;
        },
        onLoad: function onLoad(args) {
            var exposeModuleFactory = args.exposeModuleFactory;
            var exposeModule = args.exposeModule;
            var id = args.id;
            var moduleOrFactory = exposeModuleFactory || exposeModule;
            if (!moduleOrFactory) return args;
            if (false) { var staticProps, handler, exposedModuleExports; }
            return args;
        },
        loadRemoteSnapshot (args) {
            var { from, remoteSnapshot, manifestUrl, manifestJson, options } = args;
            // ensure snapshot is loaded from manifest
            if (from !== "manifest" || !manifestUrl || !manifestJson || !("publicPath" in remoteSnapshot)) {
                return args;
            }
            // re-assign publicPath based on remoteEntry location if in browser nextjs remote
            var { publicPath } = remoteSnapshot;
            if (options.inBrowser && publicPath.includes("/_next/")) {
                remoteSnapshot.publicPath = publicPath.substring(0, publicPath.lastIndexOf("/_next/") + 7);
            } else {
                var serverPublicPath = manifestUrl.substring(0, manifestUrl.indexOf("mf-manifest.json"));
                remoteSnapshot.publicPath = serverPublicPath;
            }
            if ("publicPath" in manifestJson.metaData) {
                manifestJson.metaData.publicPath = remoteSnapshot.publicPath;
            }
            return args;
        },
        resolveShare: function resolveShare(args) {
            if (args.pkgName !== "react" && args.pkgName !== "react-dom" && !args.pkgName.startsWith("next/")) {
                return args;
            }
            var shareScopeMap = args.shareScopeMap;
            var scope = args.scope;
            var pkgName = args.pkgName;
            var version = args.version;
            var GlobalFederation = args.GlobalFederation;
            var host = GlobalFederation["__INSTANCES__"][0];
            if (!host) {
                return args;
            }
            if (!host.options.shared[pkgName]) {
                return args;
            }
            args.resolver = function() {
                shareScopeMap[scope][pkgName][version] = host.options.shared[pkgName][0];
                return shareScopeMap[scope][pkgName][version];
            };
            return args;
        },
        beforeLoadShare: function() {
            var _ref = _async_to_generator._(function*(args) {
                return args;
            });
            return function(args) {
                return _ref.apply(this, arguments);
            };
        }()
    };
} //# sourceMappingURL=runtimePlugin.js.map


/***/ }),

/***/ "../../packages/runtime-core/dist/index.esm.js":
/*!*****************************************************!*\
  !*** ../../packages/runtime-core/dist/index.esm.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CurrentGlobal: function() { return /* binding */ CurrentGlobal; },
/* harmony export */   FederationHost: function() { return /* binding */ FederationHost; },
/* harmony export */   Global: function() { return /* binding */ Global; },
/* harmony export */   Module: function() { return /* binding */ Module; },
/* harmony export */   addGlobalSnapshot: function() { return /* binding */ addGlobalSnapshot; },
/* harmony export */   assert: function() { return /* binding */ assert; },
/* harmony export */   getGlobalFederationConstructor: function() { return /* binding */ getGlobalFederationConstructor; },
/* harmony export */   getGlobalSnapshot: function() { return /* binding */ getGlobalSnapshot; },
/* harmony export */   getInfoWithoutType: function() { return /* binding */ getInfoWithoutType; },
/* harmony export */   getRegisteredShare: function() { return /* binding */ getRegisteredShare; },
/* harmony export */   getRemoteEntry: function() { return /* binding */ getRemoteEntry; },
/* harmony export */   getRemoteInfo: function() { return /* binding */ getRemoteInfo; },
/* harmony export */   helpers: function() { return /* binding */ helpers; },
/* harmony export */   isStaticResourcesEqual: function() { return /* binding */ isStaticResourcesEqual; },
/* harmony export */   loadScript: function() { return /* reexport safe */ _module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.loadScript; },
/* harmony export */   loadScriptNode: function() { return /* reexport safe */ _module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.loadScriptNode; },
/* harmony export */   matchRemoteWithNameAndExpose: function() { return /* binding */ matchRemoteWithNameAndExpose; },
/* harmony export */   registerGlobalPlugins: function() { return /* binding */ registerGlobalPlugins; },
/* harmony export */   resetFederationGlobalInfo: function() { return /* binding */ resetFederationGlobalInfo; },
/* harmony export */   safeWrapper: function() { return /* binding */ safeWrapper; },
/* harmony export */   satisfy: function() { return /* binding */ satisfy; },
/* harmony export */   setGlobalFederationConstructor: function() { return /* binding */ setGlobalFederationConstructor; },
/* harmony export */   setGlobalFederationInstance: function() { return /* binding */ setGlobalFederationInstance; },
/* harmony export */   types: function() { return /* binding */ index; }
/* harmony export */ });
/* harmony import */ var _swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @swc/helpers/_/_async_to_generator */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/esm/_async_to_generator.js");
/* harmony import */ var _swc_helpers_type_of__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @swc/helpers/_/_type_of */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/esm/_type_of.js");
/* harmony import */ var _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfills.esm.js */ "../../packages/runtime-core/dist/polyfills.esm.js");
/* harmony import */ var _module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @module-federation/sdk */ "../../packages/sdk/dist/index.esm.js");
/* harmony import */ var _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @module-federation/error-codes */ "../../packages/error-codes/dist/index.esm.mjs");






var LOG_CATEGORY = "[ Federation Runtime ]";
// FIXME: pre-bundle ?
var logger = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.createLogger)(LOG_CATEGORY);
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function assert(condition, msg) {
    if (!condition) {
        error(msg);
    }
}
function error(msg) {
    if (msg instanceof Error) {
        msg.message = "".concat(LOG_CATEGORY, ": ").concat(msg.message);
        throw msg;
    }
    throw new Error("".concat(LOG_CATEGORY, ": ").concat(msg));
}
function warn(msg) {
    if (msg instanceof Error) {
        msg.message = "".concat(LOG_CATEGORY, ": ").concat(msg.message);
        logger.warn(msg);
    } else {
        logger.warn(msg);
    }
}
function addUniqueItem(arr, item) {
    if (arr.findIndex((name)=>name === item) === -1) {
        arr.push(item);
    }
    return arr;
}
function getFMId(remoteInfo) {
    if ("version" in remoteInfo && remoteInfo.version) {
        return "".concat(remoteInfo.name, ":").concat(remoteInfo.version);
    } else if ("entry" in remoteInfo && remoteInfo.entry) {
        return "".concat(remoteInfo.name, ":").concat(remoteInfo.entry);
    } else {
        return "".concat(remoteInfo.name);
    }
}
function isRemoteInfoWithEntry(remote) {
    return typeof remote.entry !== "undefined";
}
function isPureRemoteEntry(remote) {
    return !remote.entry.includes(".json");
}
function safeWrapper(callback, disableWarn) {
    return _safeWrapper.apply(this, arguments);
}
function _safeWrapper() {
    _safeWrapper = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*(callback, disableWarn) {
        try {
            var res = yield callback();
            return res;
        } catch (e) {
            !disableWarn && warn(e);
            return;
        }
    });
    return _safeWrapper.apply(this, arguments);
}
function isObject(val) {
    return val && typeof val === "object";
}
var objectToString = Object.prototype.toString;
// eslint-disable-next-line @typescript-eslint/ban-types
function isPlainObject(val) {
    return objectToString.call(val) === "[object Object]";
}
function isStaticResourcesEqual(url1, url2) {
    var REG_EXP = /^(https?:)?\/\//i;
    // Transform url1 and url2 into relative paths
    var relativeUrl1 = url1.replace(REG_EXP, "").replace(/\/$/, "");
    var relativeUrl2 = url2.replace(REG_EXP, "").replace(/\/$/, "");
    // Check if the relative paths are identical
    return relativeUrl1 === relativeUrl2;
}
function arrayOptions(options) {
    return Array.isArray(options) ? options : [
        options
    ];
}
function getRemoteEntryInfoFromSnapshot(snapshot) {
    var defaultRemoteEntryInfo = {
        url: "",
        type: "global",
        globalName: ""
    };
    if ((0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isBrowserEnv)() || (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isReactNativeEnv)()) {
        return "remoteEntry" in snapshot ? {
            url: snapshot.remoteEntry,
            type: snapshot.remoteEntryType,
            globalName: snapshot.globalName
        } : defaultRemoteEntryInfo;
    }
    if ("ssrRemoteEntry" in snapshot) {
        return {
            url: snapshot.ssrRemoteEntry || defaultRemoteEntryInfo.url,
            type: snapshot.ssrRemoteEntryType || defaultRemoteEntryInfo.type,
            globalName: snapshot.globalName
        };
    }
    return defaultRemoteEntryInfo;
}
var processModuleAlias = (name, subPath)=>{
    // @host/ ./button -> @host/button
    var moduleName;
    if (name.endsWith("/")) {
        moduleName = name.slice(0, -1);
    } else {
        moduleName = name;
    }
    if (subPath.startsWith(".")) {
        subPath = subPath.slice(1);
    }
    moduleName = moduleName + subPath;
    return moduleName;
};
var CurrentGlobal = typeof globalThis === "object" ? globalThis : window;
var nativeGlobal = (()=>{
    try {
        // get real window (incase of sandbox)
        return document.defaultView;
    } catch (e) {
        // node env
        return CurrentGlobal;
    }
})();
var Global = nativeGlobal;
function definePropertyGlobalVal(target, key, val) {
    Object.defineProperty(target, key, {
        value: val,
        configurable: false,
        writable: true
    });
}
function includeOwnProperty(target, key) {
    return Object.hasOwnProperty.call(target, key);
}
// This section is to prevent encapsulation by certain microfrontend frameworks. Due to reuse policies, sandbox escapes.
// The sandbox in the microfrontend does not replicate the value of 'configurable'.
// If there is no loading content on the global object, this section defines the loading object.
if (!includeOwnProperty(CurrentGlobal, "__GLOBAL_LOADING_REMOTE_ENTRY__")) {
    definePropertyGlobalVal(CurrentGlobal, "__GLOBAL_LOADING_REMOTE_ENTRY__", {});
}
var globalLoading = CurrentGlobal.__GLOBAL_LOADING_REMOTE_ENTRY__;
function setGlobalDefaultVal(target) {
    var _target___FEDERATION__, _target___FEDERATION__1, _target___FEDERATION__2, _target___FEDERATION__3, _target___FEDERATION__4, _target___FEDERATION__5;
    if (includeOwnProperty(target, "__VMOK__") && !includeOwnProperty(target, "__FEDERATION__")) {
        definePropertyGlobalVal(target, "__FEDERATION__", target.__VMOK__);
    }
    if (!includeOwnProperty(target, "__FEDERATION__")) {
        definePropertyGlobalVal(target, "__FEDERATION__", {
            __GLOBAL_PLUGIN__: [],
            __INSTANCES__: [],
            moduleInfo: {},
            __SHARE__: {},
            __MANIFEST_LOADING__: {},
            __PRELOADED_MAP__: new Map()
        });
        definePropertyGlobalVal(target, "__VMOK__", target.__FEDERATION__);
    }
    var ___GLOBAL_PLUGIN__;
    (___GLOBAL_PLUGIN__ = (_target___FEDERATION__ = target.__FEDERATION__).__GLOBAL_PLUGIN__) != null ? ___GLOBAL_PLUGIN__ : _target___FEDERATION__.__GLOBAL_PLUGIN__ = [];
    var ___INSTANCES__;
    (___INSTANCES__ = (_target___FEDERATION__1 = target.__FEDERATION__).__INSTANCES__) != null ? ___INSTANCES__ : _target___FEDERATION__1.__INSTANCES__ = [];
    var _moduleInfo;
    (_moduleInfo = (_target___FEDERATION__2 = target.__FEDERATION__).moduleInfo) != null ? _moduleInfo : _target___FEDERATION__2.moduleInfo = {};
    var ___SHARE__;
    (___SHARE__ = (_target___FEDERATION__3 = target.__FEDERATION__).__SHARE__) != null ? ___SHARE__ : _target___FEDERATION__3.__SHARE__ = {};
    var ___MANIFEST_LOADING__;
    (___MANIFEST_LOADING__ = (_target___FEDERATION__4 = target.__FEDERATION__).__MANIFEST_LOADING__) != null ? ___MANIFEST_LOADING__ : _target___FEDERATION__4.__MANIFEST_LOADING__ = {};
    var ___PRELOADED_MAP__;
    (___PRELOADED_MAP__ = (_target___FEDERATION__5 = target.__FEDERATION__).__PRELOADED_MAP__) != null ? ___PRELOADED_MAP__ : _target___FEDERATION__5.__PRELOADED_MAP__ = new Map();
}
setGlobalDefaultVal(CurrentGlobal);
setGlobalDefaultVal(nativeGlobal);
function resetFederationGlobalInfo() {
    CurrentGlobal.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
    CurrentGlobal.__FEDERATION__.__INSTANCES__ = [];
    CurrentGlobal.__FEDERATION__.moduleInfo = {};
    CurrentGlobal.__FEDERATION__.__SHARE__ = {};
    CurrentGlobal.__FEDERATION__.__MANIFEST_LOADING__ = {};
    Object.keys(globalLoading).forEach((key)=>{
        delete globalLoading[key];
    });
}
function setGlobalFederationInstance(FederationInstance) {
    CurrentGlobal.__FEDERATION__.__INSTANCES__.push(FederationInstance);
}
function getGlobalFederationConstructor() {
    return CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__;
}
function setGlobalFederationConstructor(FederationConstructor) {
    var isDebug = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isDebugMode)();
    if (isDebug) {
        CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = FederationConstructor;
        CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR_VERSION__ = "0.15.0";
    }
}
// eslint-disable-next-line @typescript-eslint/ban-types
function getInfoWithoutType(target, key) {
    if (typeof key === "string") {
        var keyRes = target[key];
        if (keyRes) {
            return {
                value: target[key],
                key: key
            };
        } else {
            var targetKeys = Object.keys(target);
            for (var targetKey of targetKeys){
                var [targetTypeOrName, _] = targetKey.split(":");
                var nKey = "".concat(targetTypeOrName, ":").concat(key);
                var typeWithKeyRes = target[nKey];
                if (typeWithKeyRes) {
                    return {
                        value: typeWithKeyRes,
                        key: nKey
                    };
                }
            }
            return {
                value: undefined,
                key: key
            };
        }
    } else {
        throw new Error("key must be string");
    }
}
var getGlobalSnapshot = ()=>nativeGlobal.__FEDERATION__.moduleInfo;
var getTargetSnapshotInfoByModuleInfo = (moduleInfo, snapshot)=>{
    // Check if the remote is included in the hostSnapshot
    var moduleKey = getFMId(moduleInfo);
    var getModuleInfo = getInfoWithoutType(snapshot, moduleKey).value;
    // The remoteSnapshot might not include a version
    if (getModuleInfo && !getModuleInfo.version && "version" in moduleInfo && moduleInfo["version"]) {
        getModuleInfo.version = moduleInfo["version"];
    }
    if (getModuleInfo) {
        return getModuleInfo;
    }
    // If the remote is not included in the hostSnapshot, deploy a micro app snapshot
    if ("version" in moduleInfo && moduleInfo["version"]) {
        var { version } = moduleInfo, resModuleInfo = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__.a)(moduleInfo, [
            "version"
        ]);
        var moduleKeyWithoutVersion = getFMId(resModuleInfo);
        var getModuleInfoWithoutVersion = getInfoWithoutType(nativeGlobal.__FEDERATION__.moduleInfo, moduleKeyWithoutVersion).value;
        if ((getModuleInfoWithoutVersion == null ? void 0 : getModuleInfoWithoutVersion.version) === version) {
            return getModuleInfoWithoutVersion;
        }
    }
    return;
};
var getGlobalSnapshotInfoByModuleInfo = (moduleInfo)=>getTargetSnapshotInfoByModuleInfo(moduleInfo, nativeGlobal.__FEDERATION__.moduleInfo);
var setGlobalSnapshotInfoByModuleInfo = (remoteInfo, moduleDetailInfo)=>{
    var moduleKey = getFMId(remoteInfo);
    nativeGlobal.__FEDERATION__.moduleInfo[moduleKey] = moduleDetailInfo;
    return nativeGlobal.__FEDERATION__.moduleInfo;
};
var addGlobalSnapshot = (moduleInfos)=>{
    nativeGlobal.__FEDERATION__.moduleInfo = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, nativeGlobal.__FEDERATION__.moduleInfo, moduleInfos);
    return ()=>{
        var keys = Object.keys(moduleInfos);
        for (var key of keys){
            delete nativeGlobal.__FEDERATION__.moduleInfo[key];
        }
    };
};
var getRemoteEntryExports = (name, globalName)=>{
    var remoteEntryKey = globalName || "__FEDERATION_".concat(name, ":custom__");
    var entryExports = CurrentGlobal[remoteEntryKey];
    return {
        remoteEntryKey,
        entryExports
    };
};
// This function is used to register global plugins.
// It iterates over the provided plugins and checks if they are already registered.
// If a plugin is not registered, it is added to the global plugins.
// If a plugin is already registered, a warning message is logged.
var registerGlobalPlugins = (plugins)=>{
    var { __GLOBAL_PLUGIN__ } = nativeGlobal.__FEDERATION__;
    plugins.forEach((plugin)=>{
        if (__GLOBAL_PLUGIN__.findIndex((p)=>p.name === plugin.name) === -1) {
            __GLOBAL_PLUGIN__.push(plugin);
        } else {
            warn("The plugin ".concat(plugin.name, " has been registered."));
        }
    });
};
var getGlobalHostPlugins = ()=>nativeGlobal.__FEDERATION__.__GLOBAL_PLUGIN__;
var getPreloaded = (id)=>CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.get(id);
var setPreloaded = (id)=>CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.set(id, true);
var DEFAULT_SCOPE = "default";
var DEFAULT_REMOTE_TYPE = "global";
// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// those constants are based on https://www.rubydoc.info/gems/semantic_range/3.0.0/SemanticRange#BUILDIDENTIFIER-constant
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.
var buildIdentifier = "[0-9A-Za-z-]+";
var build = "(?:\\+(".concat(buildIdentifier, "(?:\\.").concat(buildIdentifier, ")*))");
var numericIdentifier = "0|[1-9]\\d*";
var numericIdentifierLoose = "[0-9]+";
var nonNumericIdentifier = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
var preReleaseIdentifierLoose = "(?:".concat(numericIdentifierLoose, "|").concat(nonNumericIdentifier, ")");
var preReleaseLoose = "(?:-?(".concat(preReleaseIdentifierLoose, "(?:\\.").concat(preReleaseIdentifierLoose, ")*))");
var preReleaseIdentifier = "(?:".concat(numericIdentifier, "|").concat(nonNumericIdentifier, ")");
var preRelease = "(?:-(".concat(preReleaseIdentifier, "(?:\\.").concat(preReleaseIdentifier, ")*))");
var xRangeIdentifier = "".concat(numericIdentifier, "|x|X|\\*");
var xRangePlain = "[v=\\s]*(".concat(xRangeIdentifier, ")(?:\\.(").concat(xRangeIdentifier, ")(?:\\.(").concat(xRangeIdentifier, ")(?:").concat(preRelease, ")?").concat(build, "?)?)?");
var hyphenRange = "^\\s*(".concat(xRangePlain, ")\\s+-\\s+(").concat(xRangePlain, ")\\s*$");
var mainVersionLoose = "(".concat(numericIdentifierLoose, ")\\.(").concat(numericIdentifierLoose, ")\\.(").concat(numericIdentifierLoose, ")");
var loosePlain = "[v=\\s]*".concat(mainVersionLoose).concat(preReleaseLoose, "?").concat(build, "?");
var gtlt = "((?:<|>)?=?)";
var comparatorTrim = "(\\s*)".concat(gtlt, "\\s*(").concat(loosePlain, "|").concat(xRangePlain, ")");
var loneTilde = "(?:~>?)";
var tildeTrim = "(\\s*)".concat(loneTilde, "\\s+");
var loneCaret = "(?:\\^)";
var caretTrim = "(\\s*)".concat(loneCaret, "\\s+");
var star = "(<|>)?=?\\s*\\*";
var caret = "^".concat(loneCaret).concat(xRangePlain, "$");
var mainVersion = "(".concat(numericIdentifier, ")\\.(").concat(numericIdentifier, ")\\.(").concat(numericIdentifier, ")");
var fullPlain = "v?".concat(mainVersion).concat(preRelease, "?").concat(build, "?");
var tilde = "^".concat(loneTilde).concat(xRangePlain, "$");
var xRange = "^".concat(gtlt, "\\s*").concat(xRangePlain, "$");
var comparator = "^".concat(gtlt, "\\s*(").concat(fullPlain, ")$|^$");
// copy from semver package
var gte0 = "^\\s*>=\\s*0.0.0\\s*$";
// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.
function parseRegex(source) {
    return new RegExp(source);
}
function isXVersion(version) {
    return !version || version.toLowerCase() === "x" || version === "*";
}
function pipe() {
    for(var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++){
        fns[_key] = arguments[_key];
    }
    return (x)=>fns.reduce((v, f)=>f(v), x);
}
function extractComparator(comparatorString) {
    return comparatorString.match(parseRegex(comparator));
}
function combineVersion(major, minor, patch, preRelease) {
    var mainVersion = "".concat(major, ".").concat(minor, ".").concat(patch);
    if (preRelease) {
        return "".concat(mainVersion, "-").concat(preRelease);
    }
    return mainVersion;
}
// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.
function parseHyphen(range) {
    return range.replace(parseRegex(hyphenRange), (_range, from, fromMajor, fromMinor, fromPatch, _fromPreRelease, _fromBuild, to, toMajor, toMinor, toPatch, toPreRelease)=>{
        if (isXVersion(fromMajor)) {
            from = "";
        } else if (isXVersion(fromMinor)) {
            from = ">=".concat(fromMajor, ".0.0");
        } else if (isXVersion(fromPatch)) {
            from = ">=".concat(fromMajor, ".").concat(fromMinor, ".0");
        } else {
            from = ">=".concat(from);
        }
        if (isXVersion(toMajor)) {
            to = "";
        } else if (isXVersion(toMinor)) {
            to = "<".concat(Number(toMajor) + 1, ".0.0-0");
        } else if (isXVersion(toPatch)) {
            to = "<".concat(toMajor, ".").concat(Number(toMinor) + 1, ".0-0");
        } else if (toPreRelease) {
            to = "<=".concat(toMajor, ".").concat(toMinor, ".").concat(toPatch, "-").concat(toPreRelease);
        } else {
            to = "<=".concat(to);
        }
        return "".concat(from, " ").concat(to).trim();
    });
}
function parseComparatorTrim(range) {
    return range.replace(parseRegex(comparatorTrim), "$1$2$3");
}
function parseTildeTrim(range) {
    return range.replace(parseRegex(tildeTrim), "$1~");
}
function parseCaretTrim(range) {
    return range.replace(parseRegex(caretTrim), "$1^");
}
function parseCarets(range) {
    return range.trim().split(/\s+/).map((rangeVersion)=>rangeVersion.replace(parseRegex(caret), (_, major, minor, patch, preRelease)=>{
            if (isXVersion(major)) {
                return "";
            } else if (isXVersion(minor)) {
                return ">=".concat(major, ".0.0 <").concat(Number(major) + 1, ".0.0-0");
            } else if (isXVersion(patch)) {
                if (major === "0") {
                    return ">=".concat(major, ".").concat(minor, ".0 <").concat(major, ".").concat(Number(minor) + 1, ".0-0");
                } else {
                    return ">=".concat(major, ".").concat(minor, ".0 <").concat(Number(major) + 1, ".0.0-0");
                }
            } else if (preRelease) {
                if (major === "0") {
                    if (minor === "0") {
                        return ">=".concat(major, ".").concat(minor, ".").concat(patch, "-").concat(preRelease, " <").concat(major, ".").concat(minor, ".").concat(Number(patch) + 1, "-0");
                    } else {
                        return ">=".concat(major, ".").concat(minor, ".").concat(patch, "-").concat(preRelease, " <").concat(major, ".").concat(Number(minor) + 1, ".0-0");
                    }
                } else {
                    return ">=".concat(major, ".").concat(minor, ".").concat(patch, "-").concat(preRelease, " <").concat(Number(major) + 1, ".0.0-0");
                }
            } else {
                if (major === "0") {
                    if (minor === "0") {
                        return ">=".concat(major, ".").concat(minor, ".").concat(patch, " <").concat(major, ".").concat(minor, ".").concat(Number(patch) + 1, "-0");
                    } else {
                        return ">=".concat(major, ".").concat(minor, ".").concat(patch, " <").concat(major, ".").concat(Number(minor) + 1, ".0-0");
                    }
                }
                return ">=".concat(major, ".").concat(minor, ".").concat(patch, " <").concat(Number(major) + 1, ".0.0-0");
            }
        })).join(" ");
}
function parseTildes(range) {
    return range.trim().split(/\s+/).map((rangeVersion)=>rangeVersion.replace(parseRegex(tilde), (_, major, minor, patch, preRelease)=>{
            if (isXVersion(major)) {
                return "";
            } else if (isXVersion(minor)) {
                return ">=".concat(major, ".0.0 <").concat(Number(major) + 1, ".0.0-0");
            } else if (isXVersion(patch)) {
                return ">=".concat(major, ".").concat(minor, ".0 <").concat(major, ".").concat(Number(minor) + 1, ".0-0");
            } else if (preRelease) {
                return ">=".concat(major, ".").concat(minor, ".").concat(patch, "-").concat(preRelease, " <").concat(major, ".").concat(Number(minor) + 1, ".0-0");
            }
            return ">=".concat(major, ".").concat(minor, ".").concat(patch, " <").concat(major, ".").concat(Number(minor) + 1, ".0-0");
        })).join(" ");
}
function parseXRanges(range) {
    return range.split(/\s+/).map((rangeVersion)=>rangeVersion.trim().replace(parseRegex(xRange), (ret, gtlt, major, minor, patch, preRelease)=>{
            var isXMajor = isXVersion(major);
            var isXMinor = isXMajor || isXVersion(minor);
            var isXPatch = isXMinor || isXVersion(patch);
            if (gtlt === "=" && isXPatch) {
                gtlt = "";
            }
            preRelease = "";
            if (isXMajor) {
                if (gtlt === ">" || gtlt === "<") {
                    // nothing is allowed
                    return "<0.0.0-0";
                } else {
                    // nothing is forbidden
                    return "*";
                }
            } else if (gtlt && isXPatch) {
                // replace X with 0
                if (isXMinor) {
                    minor = 0;
                }
                patch = 0;
                if (gtlt === ">") {
                    // >1 => >=2.0.0
                    // >1.2 => >=1.3.0
                    gtlt = ">=";
                    if (isXMinor) {
                        major = Number(major) + 1;
                        minor = 0;
                        patch = 0;
                    } else {
                        minor = Number(minor) + 1;
                        patch = 0;
                    }
                } else if (gtlt === "<=") {
                    // <=0.7.x is actually <0.8.0, since any 0.7.x should pass
                    // Similarly, <=7.x is actually <8.0.0, etc.
                    gtlt = "<";
                    if (isXMinor) {
                        major = Number(major) + 1;
                    } else {
                        minor = Number(minor) + 1;
                    }
                }
                if (gtlt === "<") {
                    preRelease = "-0";
                }
                return "".concat(gtlt + major, ".").concat(minor, ".").concat(patch).concat(preRelease);
            } else if (isXMinor) {
                return ">=".concat(major, ".0.0").concat(preRelease, " <").concat(Number(major) + 1, ".0.0-0");
            } else if (isXPatch) {
                return ">=".concat(major, ".").concat(minor, ".0").concat(preRelease, " <").concat(major, ".").concat(Number(minor) + 1, ".0-0");
            }
            return ret;
        })).join(" ");
}
function parseStar(range) {
    return range.trim().replace(parseRegex(star), "");
}
function parseGTE0(comparatorString) {
    return comparatorString.trim().replace(parseRegex(gte0), "");
}
// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.
function compareAtom(rangeAtom, versionAtom) {
    rangeAtom = Number(rangeAtom) || rangeAtom;
    versionAtom = Number(versionAtom) || versionAtom;
    if (rangeAtom > versionAtom) {
        return 1;
    }
    if (rangeAtom === versionAtom) {
        return 0;
    }
    return -1;
}
function comparePreRelease(rangeAtom, versionAtom) {
    var { preRelease: rangePreRelease } = rangeAtom;
    var { preRelease: versionPreRelease } = versionAtom;
    if (rangePreRelease === undefined && Boolean(versionPreRelease)) {
        return 1;
    }
    if (Boolean(rangePreRelease) && versionPreRelease === undefined) {
        return -1;
    }
    if (rangePreRelease === undefined && versionPreRelease === undefined) {
        return 0;
    }
    for(var i = 0, n = rangePreRelease.length; i <= n; i++){
        var rangeElement = rangePreRelease[i];
        var versionElement = versionPreRelease[i];
        if (rangeElement === versionElement) {
            continue;
        }
        if (rangeElement === undefined && versionElement === undefined) {
            return 0;
        }
        if (!rangeElement) {
            return 1;
        }
        if (!versionElement) {
            return -1;
        }
        return compareAtom(rangeElement, versionElement);
    }
    return 0;
}
function compareVersion(rangeAtom, versionAtom) {
    return compareAtom(rangeAtom.major, versionAtom.major) || compareAtom(rangeAtom.minor, versionAtom.minor) || compareAtom(rangeAtom.patch, versionAtom.patch) || comparePreRelease(rangeAtom, versionAtom);
}
function eq(rangeAtom, versionAtom) {
    return rangeAtom.version === versionAtom.version;
}
function compare(rangeAtom, versionAtom) {
    switch(rangeAtom.operator){
        case "":
        case "=":
            return eq(rangeAtom, versionAtom);
        case ">":
            return compareVersion(rangeAtom, versionAtom) < 0;
        case ">=":
            return eq(rangeAtom, versionAtom) || compareVersion(rangeAtom, versionAtom) < 0;
        case "<":
            return compareVersion(rangeAtom, versionAtom) > 0;
        case "<=":
            return eq(rangeAtom, versionAtom) || compareVersion(rangeAtom, versionAtom) > 0;
        case undefined:
            {
                // mean * or x -> all versions
                return true;
            }
        default:
            return false;
    }
}
// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.
function parseComparatorString(range) {
    return pipe(// ^ --> * (any, kinda silly)
    // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
    // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
    // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
    // ^1.2.3 --> >=1.2.3 <2.0.0-0
    // ^1.2.0 --> >=1.2.0 <2.0.0-0
    parseCarets, // ~, ~> --> * (any, kinda silly)
    // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
    // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
    // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
    // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
    // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
    parseTildes, parseXRanges, parseStar)(range);
}
function parseRange(range) {
    return pipe(// `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    parseHyphen, // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    parseComparatorTrim, // `~ 1.2.3` => `~1.2.3`
    parseTildeTrim, // `^ 1.2.3` => `^1.2.3`
    parseCaretTrim)(range.trim()).split(/\s+/).join(" ");
}
function satisfy(version, range) {
    var _loop = function(orRange) {
        var trimmedOrRange = orRange.trim();
        if (!trimmedOrRange) {
            // An empty range string signifies wildcard *, satisfy any valid version
            // (We already checked if the version itself is valid)
            return {
                v: true
            };
        }
        // Handle simple wildcards explicitly before complex parsing
        if (trimmedOrRange === "*" || trimmedOrRange === "x") {
            return {
                v: true
            };
        }
        try {
            // Apply existing parsing logic to the current OR sub-range
            var parsedSubRange = parseRange(trimmedOrRange); // Handles hyphens, trims etc.
            // Check if the result of initial parsing is empty, which can happen
            // for some wildcard cases handled by parseRange/parseComparatorString.
            // E.g. `parseStar` used in `parseComparatorString` returns ''.
            if (!parsedSubRange.trim()) {
                // If parsing results in empty string, treat as wildcard match
                return {
                    v: true
                };
            }
            var parsedComparatorString = parsedSubRange.split(" ").map((rangeVersion)=>parseComparatorString(rangeVersion)) // Expands ^, ~
            .join(" ");
            // Check again if the comparator string became empty after specific parsing like ^ or ~
            if (!parsedComparatorString.trim()) {
                return {
                    v: true
                };
            }
            // Split the sub-range by space for implicit AND conditions
            var comparators = parsedComparatorString.split(/\s+/).map((comparator)=>parseGTE0(comparator)) // Filter out empty strings that might result from multiple spaces
            .filter(Boolean);
            // If a sub-range becomes empty after parsing (e.g., invalid characters),
            // it cannot be satisfied. This check might be redundant now but kept for safety.
            if (comparators.length === 0) {
                return "continue";
            }
            var subRangeSatisfied = true;
            for (var comparator of comparators){
                var extractedComparator = extractComparator(comparator);
                // If any part of the AND sub-range is invalid, the sub-range is not satisfied
                if (!extractedComparator) {
                    subRangeSatisfied = false;
                    break;
                }
                var [, rangeOperator, , rangeMajor, rangeMinor, rangePatch, rangePreRelease] = extractedComparator;
                var rangeAtom = {
                    operator: rangeOperator,
                    version: combineVersion(rangeMajor, rangeMinor, rangePatch, rangePreRelease),
                    major: rangeMajor,
                    minor: rangeMinor,
                    patch: rangePatch,
                    preRelease: rangePreRelease == null ? void 0 : rangePreRelease.split(".")
                };
                // Check if the version satisfies this specific comparator in the AND chain
                if (!compare(rangeAtom, versionAtom)) {
                    subRangeSatisfied = false; // This part of the AND condition failed
                    break; // No need to check further comparators in this sub-range
                }
            }
            // If all AND conditions within this OR sub-range were met, the overall range is satisfied
            if (subRangeSatisfied) {
                return {
                    v: true
                };
            }
        } catch (e) {
            // Log error and treat this sub-range as unsatisfied
            console.error('[semver] Error processing range part "'.concat(trimmedOrRange, '":'), e);
            return "continue";
        }
    };
    if (!version) {
        return false;
    }
    // Extract version details once
    var extractedVersion = extractComparator(version);
    if (!extractedVersion) {
        // If the version string is invalid, it can't satisfy any range
        return false;
    }
    var [, versionOperator, , versionMajor, versionMinor, versionPatch, versionPreRelease] = extractedVersion;
    var versionAtom = {
        operator: versionOperator,
        version: combineVersion(versionMajor, versionMinor, versionPatch, versionPreRelease),
        major: versionMajor,
        minor: versionMinor,
        patch: versionPatch,
        preRelease: versionPreRelease == null ? void 0 : versionPreRelease.split(".")
    };
    // Split the range by || to handle OR conditions
    var orRanges = range.split("||");
    for (var orRange of orRanges){
        var _ret = _loop(orRange);
        if ((0,_swc_helpers_type_of__WEBPACK_IMPORTED_MODULE_3__._)(_ret) === "object") return _ret.v;
    }
    // If none of the OR sub-ranges were satisfied
    return false;
}
function formatShare(shareArgs, from, name, shareStrategy) {
    var get;
    if ("get" in shareArgs) {
        // eslint-disable-next-line prefer-destructuring
        get = shareArgs.get;
    } else if ("lib" in shareArgs) {
        get = ()=>Promise.resolve(shareArgs.lib);
    } else {
        get = ()=>Promise.resolve(()=>{
                throw new Error("Can not get shared '".concat(name, "'!"));
            });
    }
    var _shareArgs_version, _shareArgs_scope, _shareArgs_strategy;
    return (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({
        deps: [],
        useIn: [],
        from,
        loading: null
    }, shareArgs, {
        shareConfig: (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({
            requiredVersion: "^".concat(shareArgs.version),
            singleton: false,
            eager: false,
            strictVersion: false
        }, shareArgs.shareConfig),
        get,
        loaded: (shareArgs == null ? void 0 : shareArgs.loaded) || "lib" in shareArgs ? true : undefined,
        version: (_shareArgs_version = shareArgs.version) != null ? _shareArgs_version : "0",
        scope: Array.isArray(shareArgs.scope) ? shareArgs.scope : [
            (_shareArgs_scope = shareArgs.scope) != null ? _shareArgs_scope : "default"
        ],
        strategy: ((_shareArgs_strategy = shareArgs.strategy) != null ? _shareArgs_strategy : shareStrategy) || "version-first"
    });
}
function formatShareConfigs(globalOptions, userOptions) {
    var shareArgs = userOptions.shared || {};
    var from = userOptions.name;
    var shareInfos = Object.keys(shareArgs).reduce((res, pkgName)=>{
        var arrayShareArgs = arrayOptions(shareArgs[pkgName]);
        res[pkgName] = res[pkgName] || [];
        arrayShareArgs.forEach((shareConfig)=>{
            res[pkgName].push(formatShare(shareConfig, from, pkgName, userOptions.shareStrategy));
        });
        return res;
    }, {});
    var shared = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, globalOptions.shared);
    Object.keys(shareInfos).forEach((shareKey)=>{
        if (!shared[shareKey]) {
            shared[shareKey] = shareInfos[shareKey];
        } else {
            shareInfos[shareKey].forEach((newUserSharedOptions)=>{
                var isSameVersion = shared[shareKey].find((sharedVal)=>sharedVal.version === newUserSharedOptions.version);
                if (!isSameVersion) {
                    shared[shareKey].push(newUserSharedOptions);
                }
            });
        }
    });
    return {
        shared,
        shareInfos
    };
}
function versionLt(a, b) {
    var transformInvalidVersion = (version)=>{
        var isNumberVersion = !Number.isNaN(Number(version));
        if (isNumberVersion) {
            var splitArr = version.split(".");
            var validVersion = version;
            for(var i = 0; i < 3 - splitArr.length; i++){
                validVersion += ".0";
            }
            return validVersion;
        }
        return version;
    };
    if (satisfy(transformInvalidVersion(a), "<=".concat(transformInvalidVersion(b)))) {
        return true;
    } else {
        return false;
    }
}
var findVersion = (shareVersionMap, cb)=>{
    var callback = cb || function(prev, cur) {
        return versionLt(prev, cur);
    };
    return Object.keys(shareVersionMap).reduce((prev, cur)=>{
        if (!prev) {
            return cur;
        }
        if (callback(prev, cur)) {
            return cur;
        }
        // default version is '0' https://github.com/webpack/webpack/blob/main/lib/sharing/ProvideSharedModule.js#L136
        if (prev === "0") {
            return cur;
        }
        return prev;
    }, 0);
};
var isLoaded = (shared)=>{
    return Boolean(shared.loaded) || typeof shared.lib === "function";
};
var isLoading = (shared)=>{
    return Boolean(shared.loading);
};
function findSingletonVersionOrderByVersion(shareScopeMap, scope, pkgName) {
    var versions = shareScopeMap[scope][pkgName];
    var callback = function callback(prev, cur) {
        return !isLoaded(versions[prev]) && versionLt(prev, cur);
    };
    return findVersion(shareScopeMap[scope][pkgName], callback);
}
function findSingletonVersionOrderByLoaded(shareScopeMap, scope, pkgName) {
    var versions = shareScopeMap[scope][pkgName];
    var callback = function callback(prev, cur) {
        var isLoadingOrLoaded = (shared)=>{
            return isLoaded(shared) || isLoading(shared);
        };
        if (isLoadingOrLoaded(versions[cur])) {
            if (isLoadingOrLoaded(versions[prev])) {
                return Boolean(versionLt(prev, cur));
            } else {
                return true;
            }
        }
        if (isLoadingOrLoaded(versions[prev])) {
            return false;
        }
        return versionLt(prev, cur);
    };
    return findVersion(shareScopeMap[scope][pkgName], callback);
}
function getFindShareFunction(strategy) {
    if (strategy === "loaded-first") {
        return findSingletonVersionOrderByLoaded;
    }
    return findSingletonVersionOrderByVersion;
}
function getRegisteredShare(localShareScopeMap, pkgName, shareInfo, resolveShare) {
    var _loop = function(sc) {
        if (shareConfig && localShareScopeMap[sc] && localShareScopeMap[sc][pkgName]) {
            var { requiredVersion } = shareConfig;
            var findShareFunction = getFindShareFunction(strategy);
            var maxOrSingletonVersion = findShareFunction(localShareScopeMap, sc, pkgName);
            //@ts-ignore
            var defaultResolver = ()=>{
                if (shareConfig.singleton) {
                    if (typeof requiredVersion === "string" && !satisfy(maxOrSingletonVersion, requiredVersion)) {
                        var msg = "Version ".concat(maxOrSingletonVersion, " from ").concat(maxOrSingletonVersion && localShareScopeMap[sc][pkgName][maxOrSingletonVersion].from, " of shared singleton module ").concat(pkgName, " does not satisfy the requirement of ").concat(shareInfo.from, " which needs ").concat(requiredVersion, ")");
                        if (shareConfig.strictVersion) {
                            error(msg);
                        } else {
                            warn(msg);
                        }
                    }
                    return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
                } else {
                    if (requiredVersion === false || requiredVersion === "*") {
                        return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
                    }
                    if (satisfy(maxOrSingletonVersion, requiredVersion)) {
                        return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
                    }
                    for (var [versionKey, versionValue] of Object.entries(localShareScopeMap[sc][pkgName])){
                        if (satisfy(versionKey, requiredVersion)) {
                            return versionValue;
                        }
                    }
                }
            };
            var params = {
                shareScopeMap: localShareScopeMap,
                scope: sc,
                pkgName,
                version: maxOrSingletonVersion,
                GlobalFederation: Global.__FEDERATION__,
                resolver: defaultResolver
            };
            var resolveShared = resolveShare.emit(params) || params;
            return {
                v: resolveShared.resolver()
            };
        }
    };
    if (!localShareScopeMap) {
        return;
    }
    var { shareConfig, scope = DEFAULT_SCOPE, strategy } = shareInfo;
    var scopes = Array.isArray(scope) ? scope : [
        scope
    ];
    for (var sc of scopes){
        var _ret = _loop(sc);
        if ((0,_swc_helpers_type_of__WEBPACK_IMPORTED_MODULE_3__._)(_ret) === "object") return _ret.v;
    }
}
function getGlobalShareScope() {
    return Global.__FEDERATION__.__SHARE__;
}
function getTargetSharedOptions(options) {
    var { pkgName, extraOptions, shareInfos } = options;
    var defaultResolver = (sharedOptions)=>{
        if (!sharedOptions) {
            return undefined;
        }
        var shareVersionMap = {};
        sharedOptions.forEach((shared)=>{
            shareVersionMap[shared.version] = shared;
        });
        var callback = function callback(prev, cur) {
            return !isLoaded(shareVersionMap[prev]) && versionLt(prev, cur);
        };
        var maxVersion = findVersion(shareVersionMap, callback);
        return shareVersionMap[maxVersion];
    };
    var _extraOptions_resolver;
    var resolver = (_extraOptions_resolver = extraOptions == null ? void 0 : extraOptions.resolver) != null ? _extraOptions_resolver : defaultResolver;
    return Object.assign({}, resolver(shareInfos[pkgName]), extraOptions == null ? void 0 : extraOptions.customShareInfo);
}
var ShareUtils = {
    getRegisteredShare,
    getGlobalShareScope
};
var GlobalUtils = {
    Global,
    nativeGlobal,
    resetFederationGlobalInfo,
    setGlobalFederationInstance,
    getGlobalFederationConstructor,
    setGlobalFederationConstructor,
    getInfoWithoutType,
    getGlobalSnapshot,
    getTargetSnapshotInfoByModuleInfo,
    getGlobalSnapshotInfoByModuleInfo,
    setGlobalSnapshotInfoByModuleInfo,
    addGlobalSnapshot,
    getRemoteEntryExports,
    registerGlobalPlugins,
    getGlobalHostPlugins,
    getPreloaded,
    setPreloaded
};
var helpers = {
    global: GlobalUtils,
    share: ShareUtils
};
function getBuilderId() {
    //@ts-ignore
    return  true ? "home_app:1.0.0" : 0;
}
// Function to match a remote with its name and expose
// id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
// id: alias(app1) + expose(button) = app1/button
// id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
function matchRemoteWithNameAndExpose(remotes, id) {
    for (var remote of remotes){
        // match pkgName
        var isNameMatched = id.startsWith(remote.name);
        var expose = id.replace(remote.name, "");
        if (isNameMatched) {
            if (expose.startsWith("/")) {
                var pkgNameOrAlias = remote.name;
                expose = ".".concat(expose);
                return {
                    pkgNameOrAlias,
                    expose,
                    remote
                };
            } else if (expose === "") {
                return {
                    pkgNameOrAlias: remote.name,
                    expose: ".",
                    remote
                };
            }
        }
        // match alias
        var isAliasMatched = remote.alias && id.startsWith(remote.alias);
        var exposeWithAlias = remote.alias && id.replace(remote.alias, "");
        if (remote.alias && isAliasMatched) {
            if (exposeWithAlias && exposeWithAlias.startsWith("/")) {
                var pkgNameOrAlias1 = remote.alias;
                exposeWithAlias = ".".concat(exposeWithAlias);
                return {
                    pkgNameOrAlias: pkgNameOrAlias1,
                    expose: exposeWithAlias,
                    remote
                };
            } else if (exposeWithAlias === "") {
                return {
                    pkgNameOrAlias: remote.alias,
                    expose: ".",
                    remote
                };
            }
        }
    }
    return;
}
// Function to match a remote with its name or alias
function matchRemote(remotes, nameOrAlias) {
    for (var remote of remotes){
        var isNameMatched = nameOrAlias === remote.name;
        if (isNameMatched) {
            return remote;
        }
        var isAliasMatched = remote.alias && nameOrAlias === remote.alias;
        if (isAliasMatched) {
            return remote;
        }
    }
    return;
}
function registerPlugins(plugins, hookInstances) {
    var globalPlugins = getGlobalHostPlugins();
    // Incorporate global plugins
    if (globalPlugins.length > 0) {
        globalPlugins.forEach((plugin)=>{
            if (plugins == null ? void 0 : plugins.find((item)=>item.name !== plugin.name)) {
                plugins.push(plugin);
            }
        });
    }
    if (plugins && plugins.length > 0) {
        plugins.forEach((plugin)=>{
            hookInstances.forEach((hookInstance)=>{
                hookInstance.applyPlugin(plugin);
            });
        });
    }
    return plugins;
}
var importCallback = ".then(callbacks[0]).catch(callbacks[1])";
function loadEsmEntry(_) {
    return _loadEsmEntry.apply(this, arguments);
}
function _loadEsmEntry() {
    _loadEsmEntry = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*(param) {
        var { entry, remoteEntryExports } = param;
        return new Promise((resolve, reject)=>{
            try {
                if (!remoteEntryExports) {
                    if (typeof FEDERATION_ALLOW_NEW_FUNCTION !== "undefined") {
                        new Function("callbacks", 'import("'.concat(entry, '")').concat(importCallback))([
                            resolve,
                            reject
                        ]);
                    } else {
                        import(/* webpackIgnore: true */ /* @vite-ignore */ entry).then(resolve).catch(reject);
                    }
                } else {
                    resolve(remoteEntryExports);
                }
            } catch (e) {
                reject(e);
            }
        });
    });
    return _loadEsmEntry.apply(this, arguments);
}
function loadSystemJsEntry(_) {
    return _loadSystemJsEntry.apply(this, arguments);
}
function _loadSystemJsEntry() {
    _loadSystemJsEntry = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*(param) {
        var { entry, remoteEntryExports } = param;
        return new Promise((resolve, reject)=>{
            try {
                if (!remoteEntryExports) {
                    //@ts-ignore
                    if (false) {} else {
                        new Function("callbacks", 'System.import("'.concat(entry, '")').concat(importCallback))([
                            resolve,
                            reject
                        ]);
                    }
                } else {
                    resolve(remoteEntryExports);
                }
            } catch (e) {
                reject(e);
            }
        });
    });
    return _loadSystemJsEntry.apply(this, arguments);
}
function handleRemoteEntryLoaded(name, globalName, entry) {
    var { remoteEntryKey, entryExports } = getRemoteEntryExports(name, globalName);
    assert(entryExports, (0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.RUNTIME_001, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.runtimeDescMap, {
        remoteName: name,
        remoteEntryUrl: entry,
        remoteEntryKey
    }));
    return entryExports;
}
function loadEntryScript(_) {
    return _loadEntryScript.apply(this, arguments);
}
function _loadEntryScript() {
    _loadEntryScript = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*(param) {
        var { name, globalName, entry, loaderHook } = param;
        var { entryExports: remoteEntryExports } = getRemoteEntryExports(name, globalName);
        if (remoteEntryExports) {
            return remoteEntryExports;
        }
        return (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.loadScript)(entry, {
            attrs: {},
            createScriptHook: (url, attrs)=>{
                var res = loaderHook.lifecycle.createScript.emit({
                    url,
                    attrs
                });
                if (!res) return;
                if (res instanceof HTMLScriptElement) {
                    return res;
                }
                if ("script" in res || "timeout" in res) {
                    return res;
                }
                return;
            }
        }).then(()=>{
            return handleRemoteEntryLoaded(name, globalName, entry);
        }).catch((e)=>{
            assert(undefined, (0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.RUNTIME_008, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.runtimeDescMap, {
                remoteName: name,
                resourceUrl: entry
            }));
            throw e;
        });
    });
    return _loadEntryScript.apply(this, arguments);
}
function loadEntryDom(_) {
    return _loadEntryDom.apply(this, arguments);
}
function _loadEntryDom() {
    _loadEntryDom = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*(param) {
        var { remoteInfo, remoteEntryExports, loaderHook } = param;
        var { entry, entryGlobalName: globalName, name, type } = remoteInfo;
        switch(type){
            case "esm":
            case "module":
                return loadEsmEntry({
                    entry,
                    remoteEntryExports
                });
            case "system":
                return loadSystemJsEntry({
                    entry,
                    remoteEntryExports
                });
            default:
                return loadEntryScript({
                    entry,
                    globalName,
                    name,
                    loaderHook
                });
        }
    });
    return _loadEntryDom.apply(this, arguments);
}
function loadEntryNode(_) {
    return _loadEntryNode.apply(this, arguments);
}
function _loadEntryNode() {
    _loadEntryNode = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*(param) {
        var { remoteInfo, loaderHook } = param;
        var { entry, entryGlobalName: globalName, name, type } = remoteInfo;
        var { entryExports: remoteEntryExports } = getRemoteEntryExports(name, globalName);
        if (remoteEntryExports) {
            return remoteEntryExports;
        }
        return (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.loadScriptNode)(entry, {
            attrs: {
                name,
                globalName,
                type
            },
            loaderHook: {
                createScriptHook: function(url) {
                    var attrs = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                    var res = loaderHook.lifecycle.createScript.emit({
                        url,
                        attrs
                    });
                    if (!res) return;
                    if ("url" in res) {
                        return res;
                    }
                    return;
                }
            }
        }).then(()=>{
            return handleRemoteEntryLoaded(name, globalName, entry);
        }).catch((e)=>{
            throw e;
        });
    });
    return _loadEntryNode.apply(this, arguments);
}
function getRemoteEntryUniqueKey(remoteInfo) {
    var { entry, name } = remoteInfo;
    return (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.composeKeyWithSeparator)(name, entry);
}
function getRemoteEntry(_) {
    return _getRemoteEntry.apply(this, arguments);
}
function _getRemoteEntry() {
    _getRemoteEntry = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*(param) {
        var { origin, remoteEntryExports, remoteInfo } = param;
        var uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
        if (remoteEntryExports) {
            return remoteEntryExports;
        }
        if (!globalLoading[uniqueKey]) {
            var loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
            var loaderHook = origin.loaderHook;
            globalLoading[uniqueKey] = loadEntryHook.emit({
                loaderHook,
                remoteInfo,
                remoteEntryExports
            }).then((res)=>{
                if (res) {
                    return res;
                }
                // Use ENV_TARGET if defined, otherwise fallback to isBrowserEnv, must keep this
                var isWebEnvironment = typeof ENV_TARGET !== "undefined" ? ENV_TARGET === "web" : (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isBrowserEnv)();
                return isWebEnvironment ? loadEntryDom({
                    remoteInfo,
                    remoteEntryExports,
                    loaderHook
                }) : loadEntryNode({
                    remoteInfo,
                    loaderHook
                });
            });
        }
        return globalLoading[uniqueKey];
    });
    return _getRemoteEntry.apply(this, arguments);
}
function getRemoteInfo(remote) {
    return (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, remote, {
        entry: "entry" in remote ? remote.entry : "",
        type: remote.type || DEFAULT_REMOTE_TYPE,
        entryGlobalName: remote.entryGlobalName || remote.name,
        shareScope: remote.shareScope || DEFAULT_SCOPE
    });
}
var Module = class Module {
    getEntry() {
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            if (_this.remoteEntryExports) {
                return _this.remoteEntryExports;
            }
            var remoteEntryExports;
            try {
                remoteEntryExports = yield getRemoteEntry({
                    origin: _this.host,
                    remoteInfo: _this.remoteInfo,
                    remoteEntryExports: _this.remoteEntryExports
                });
            } catch (err) {
                var uniqueKey = getRemoteEntryUniqueKey(_this.remoteInfo);
                remoteEntryExports = yield _this.host.loaderHook.lifecycle.loadEntryError.emit({
                    getRemoteEntry,
                    origin: _this.host,
                    remoteInfo: _this.remoteInfo,
                    remoteEntryExports: _this.remoteEntryExports,
                    globalLoading,
                    uniqueKey
                });
            }
            assert(remoteEntryExports, "remoteEntryExports is undefined \n ".concat((0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.safeToString)(_this.remoteInfo)));
            _this.remoteEntryExports = remoteEntryExports;
            return _this.remoteEntryExports;
        })();
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    get(id, expose, options, remoteSnapshot) {
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            var { loadFactory = true } = options || {
                loadFactory: true
            };
            // Get remoteEntry.js
            var remoteEntryExports = yield _this.getEntry();
            if (!_this.inited) {
                var localShareScopeMap = _this.host.shareScopeMap;
                var shareScopeKeys = Array.isArray(_this.remoteInfo.shareScope) ? _this.remoteInfo.shareScope : [
                    _this.remoteInfo.shareScope
                ];
                if (!shareScopeKeys.length) {
                    shareScopeKeys.push("default");
                }
                shareScopeKeys.forEach((shareScopeKey)=>{
                    if (!localShareScopeMap[shareScopeKey]) {
                        localShareScopeMap[shareScopeKey] = {};
                    }
                });
                // TODO: compate legacy init params, should use shareScopeMap if exist
                var shareScope = localShareScopeMap[shareScopeKeys[0]];
                var initScope = [];
                var remoteEntryInitOptions = {
                    version: _this.remoteInfo.version || "",
                    shareScopeKeys: Array.isArray(_this.remoteInfo.shareScope) ? shareScopeKeys : _this.remoteInfo.shareScope || "default"
                };
                // Help to find host instance
                Object.defineProperty(remoteEntryInitOptions, "shareScopeMap", {
                    value: localShareScopeMap,
                    // remoteEntryInitOptions will be traversed and assigned during container init, ,so this attribute is not allowed to be traversed
                    enumerable: false
                });
                var initContainerOptions = yield _this.host.hooks.lifecycle.beforeInitContainer.emit({
                    shareScope,
                    // @ts-ignore shareScopeMap will be set by Object.defineProperty
                    remoteEntryInitOptions,
                    initScope,
                    remoteInfo: _this.remoteInfo,
                    origin: _this.host
                });
                if (typeof (remoteEntryExports == null ? void 0 : remoteEntryExports.init) === "undefined") {
                    error((0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.RUNTIME_002, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.runtimeDescMap, {
                        hostName: _this.host.name,
                        remoteName: _this.remoteInfo.name,
                        remoteEntryUrl: _this.remoteInfo.entry,
                        remoteEntryKey: _this.remoteInfo.entryGlobalName
                    }));
                }
                yield remoteEntryExports.init(initContainerOptions.shareScope, initContainerOptions.initScope, initContainerOptions.remoteEntryInitOptions);
                yield _this.host.hooks.lifecycle.initContainer.emit((0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, initContainerOptions, {
                    id,
                    remoteSnapshot,
                    remoteEntryExports
                }));
            }
            _this.lib = remoteEntryExports;
            _this.inited = true;
            var moduleFactory;
            moduleFactory = yield _this.host.loaderHook.lifecycle.getModuleFactory.emit({
                remoteEntryExports,
                expose,
                moduleInfo: _this.remoteInfo
            });
            // get exposeGetter
            if (!moduleFactory) {
                moduleFactory = yield remoteEntryExports.get(expose);
            }
            assert(moduleFactory, "".concat(getFMId(_this.remoteInfo), " remote don't export ").concat(expose, "."));
            // keep symbol for module name always one format
            var symbolName = processModuleAlias(_this.remoteInfo.name, expose);
            var wrapModuleFactory = _this.wraperFactory(moduleFactory, symbolName);
            if (!loadFactory) {
                return wrapModuleFactory;
            }
            var exposeContent = yield wrapModuleFactory();
            return exposeContent;
        })();
    }
    wraperFactory(moduleFactory, id) {
        function defineModuleId(res, id) {
            if (res && typeof res === "object" && Object.isExtensible(res) && !Object.getOwnPropertyDescriptor(res, Symbol.for("mf_module_id"))) {
                Object.defineProperty(res, Symbol.for("mf_module_id"), {
                    value: id,
                    enumerable: false
                });
            }
        }
        if (moduleFactory instanceof Promise) {
            return /*#__PURE__*/ (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
                var res = yield moduleFactory();
                // This parameter is used for bridge debugging
                defineModuleId(res, id);
                return res;
            });
        } else {
            return ()=>{
                var res = moduleFactory();
                // This parameter is used for bridge debugging
                defineModuleId(res, id);
                return res;
            };
        }
    }
    constructor({ remoteInfo, host }){
        this.inited = false;
        this.lib = undefined;
        this.remoteInfo = remoteInfo;
        this.host = host;
    }
};
class SyncHook {
    on(fn) {
        if (typeof fn === "function") {
            this.listeners.add(fn);
        }
    }
    once(fn) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var self = this;
        this.on(function wrapper() {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            self.remove(wrapper);
            // eslint-disable-next-line prefer-spread
            return fn.apply(null, args);
        });
    }
    emit() {
        for(var _len = arguments.length, data = new Array(_len), _key = 0; _key < _len; _key++){
            data[_key] = arguments[_key];
        }
        var result;
        if (this.listeners.size > 0) {
            // eslint-disable-next-line prefer-spread
            this.listeners.forEach((fn)=>{
                result = fn(...data);
            });
        }
        return result;
    }
    remove(fn) {
        this.listeners.delete(fn);
    }
    removeAll() {
        this.listeners.clear();
    }
    constructor(type){
        this.type = "";
        this.listeners = new Set();
        if (type) {
            this.type = type;
        }
    }
}
class AsyncHook extends SyncHook {
    emit() {
        for(var _len = arguments.length, data = new Array(_len), _key = 0; _key < _len; _key++){
            data[_key] = arguments[_key];
        }
        var result;
        var ls = Array.from(this.listeners);
        if (ls.length > 0) {
            var i = 0;
            var call = (prev)=>{
                if (prev === false) {
                    return false; // Abort process
                } else if (i < ls.length) {
                    return Promise.resolve(ls[i++].apply(null, data)).then(call);
                } else {
                    return prev;
                }
            };
            result = call();
        }
        return Promise.resolve(result);
    }
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function checkReturnData(originalData, returnedData) {
    if (!isObject(returnedData)) {
        return false;
    }
    if (originalData !== returnedData) {
        // eslint-disable-next-line no-restricted-syntax
        for(var key in originalData){
            if (!(key in returnedData)) {
                return false;
            }
        }
    }
    return true;
}
class SyncWaterfallHook extends SyncHook {
    emit(data) {
        if (!isObject(data)) {
            error('The data for the "'.concat(this.type, '" hook should be an object.'));
        }
        for (var fn of this.listeners){
            try {
                var tempData = fn(data);
                if (checkReturnData(data, tempData)) {
                    data = tempData;
                } else {
                    this.onerror('A plugin returned an unacceptable value for the "'.concat(this.type, '" type.'));
                    break;
                }
            } catch (e) {
                warn(e);
                this.onerror(e);
            }
        }
        return data;
    }
    constructor(type){
        super(), this.onerror = error;
        this.type = type;
    }
}
class AsyncWaterfallHook extends SyncHook {
    emit(data) {
        if (!isObject(data)) {
            error('The response data for the "'.concat(this.type, '" hook must be an object.'));
        }
        var ls = Array.from(this.listeners);
        if (ls.length > 0) {
            var i = 0;
            var processError = (e)=>{
                warn(e);
                this.onerror(e);
                return data;
            };
            var call = (prevData)=>{
                if (checkReturnData(data, prevData)) {
                    data = prevData;
                    if (i < ls.length) {
                        try {
                            return Promise.resolve(ls[i++](data)).then(call, processError);
                        } catch (e) {
                            return processError(e);
                        }
                    }
                } else {
                    this.onerror('A plugin returned an incorrect value for the "'.concat(this.type, '" type.'));
                }
                return data;
            };
            return Promise.resolve(call(data));
        }
        return Promise.resolve(data);
    }
    constructor(type){
        super(), this.onerror = error;
        this.type = type;
    }
}
class PluginSystem {
    applyPlugin(plugin) {
        assert(isPlainObject(plugin), "Plugin configuration is invalid.");
        // The plugin's name is mandatory and must be unique
        var pluginName = plugin.name;
        assert(pluginName, "A name must be provided by the plugin.");
        if (!this.registerPlugins[pluginName]) {
            this.registerPlugins[pluginName] = plugin;
            Object.keys(this.lifecycle).forEach((key)=>{
                var pluginLife = plugin[key];
                if (pluginLife) {
                    this.lifecycle[key].on(pluginLife);
                }
            });
        }
    }
    removePlugin(pluginName) {
        assert(pluginName, "A name is required.");
        var plugin = this.registerPlugins[pluginName];
        assert(plugin, 'The plugin "'.concat(pluginName, '" is not registered.'));
        Object.keys(plugin).forEach((key)=>{
            if (key !== "name") {
                this.lifecycle[key].remove(plugin[key]);
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    inherit(param) {
        var { lifecycle, registerPlugins } = param;
        Object.keys(lifecycle).forEach((hookName)=>{
            assert(!this.lifecycle[hookName], 'The hook "'.concat(hookName, '" has a conflict and cannot be inherited.'));
            this.lifecycle[hookName] = lifecycle[hookName];
        });
        Object.keys(registerPlugins).forEach((pluginName)=>{
            assert(!this.registerPlugins[pluginName], 'The plugin "'.concat(pluginName, '" has a conflict and cannot be inherited.'));
            this.applyPlugin(registerPlugins[pluginName]);
        });
    }
    constructor(lifecycle){
        this.registerPlugins = {};
        this.lifecycle = lifecycle;
        this.lifecycleKeys = Object.keys(lifecycle);
    }
}
function defaultPreloadArgs(preloadConfig) {
    return (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({
        resourceCategory: "sync",
        share: true,
        depsRemote: true,
        prefetchInterface: false
    }, preloadConfig);
}
function formatPreloadArgs(remotes, preloadArgs) {
    return preloadArgs.map((args)=>{
        var remoteInfo = matchRemote(remotes, args.nameOrAlias);
        assert(remoteInfo, "Unable to preload ".concat(args.nameOrAlias, " as it is not included in ").concat(!remoteInfo && (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.safeToString)({
            remoteInfo,
            remotes
        })));
        return {
            remote: remoteInfo,
            preloadConfig: defaultPreloadArgs(args)
        };
    });
}
function normalizePreloadExposes(exposes) {
    if (!exposes) {
        return [];
    }
    return exposes.map((expose)=>{
        if (expose === ".") {
            return expose;
        }
        if (expose.startsWith("./")) {
            return expose.replace("./", "");
        }
        return expose;
    });
}
function preloadAssets(remoteInfo, host, assets) {
    var useLinkPreload = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
    var { cssAssets, jsAssetsWithoutEntry, entryAssets } = assets;
    if (host.options.inBrowser) {
        entryAssets.forEach((asset)=>{
            var { moduleInfo } = asset;
            var module = host.moduleCache.get(remoteInfo.name);
            if (module) {
                getRemoteEntry({
                    origin: host,
                    remoteInfo: moduleInfo,
                    remoteEntryExports: module.remoteEntryExports
                });
            } else {
                getRemoteEntry({
                    origin: host,
                    remoteInfo: moduleInfo,
                    remoteEntryExports: undefined
                });
            }
        });
        if (useLinkPreload) {
            var defaultAttrs = {
                rel: "preload",
                as: "style"
            };
            cssAssets.forEach((cssUrl)=>{
                var { link: cssEl, needAttach } = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.createLink)({
                    url: cssUrl,
                    cb: ()=>{
                    // noop
                    },
                    attrs: defaultAttrs,
                    createLinkHook: (url, attrs)=>{
                        var res = host.loaderHook.lifecycle.createLink.emit({
                            url,
                            attrs
                        });
                        if (res instanceof HTMLLinkElement) {
                            return res;
                        }
                        return;
                    }
                });
                needAttach && document.head.appendChild(cssEl);
            });
        } else {
            var defaultAttrs1 = {
                rel: "stylesheet",
                type: "text/css"
            };
            cssAssets.forEach((cssUrl)=>{
                var { link: cssEl, needAttach } = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.createLink)({
                    url: cssUrl,
                    cb: ()=>{
                    // noop
                    },
                    attrs: defaultAttrs1,
                    createLinkHook: (url, attrs)=>{
                        var res = host.loaderHook.lifecycle.createLink.emit({
                            url,
                            attrs
                        });
                        if (res instanceof HTMLLinkElement) {
                            return res;
                        }
                        return;
                    },
                    needDeleteLink: false
                });
                needAttach && document.head.appendChild(cssEl);
            });
        }
        if (useLinkPreload) {
            var defaultAttrs2 = {
                rel: "preload",
                as: "script"
            };
            jsAssetsWithoutEntry.forEach((jsUrl)=>{
                var { link: linkEl, needAttach } = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.createLink)({
                    url: jsUrl,
                    cb: ()=>{
                    // noop
                    },
                    attrs: defaultAttrs2,
                    createLinkHook: (url, attrs)=>{
                        var res = host.loaderHook.lifecycle.createLink.emit({
                            url,
                            attrs
                        });
                        if (res instanceof HTMLLinkElement) {
                            return res;
                        }
                        return;
                    }
                });
                needAttach && document.head.appendChild(linkEl);
            });
        } else {
            var defaultAttrs3 = {
                fetchpriority: "high",
                type: (remoteInfo == null ? void 0 : remoteInfo.type) === "module" ? "module" : "text/javascript"
            };
            jsAssetsWithoutEntry.forEach((jsUrl)=>{
                var { script: scriptEl, needAttach } = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.createScript)({
                    url: jsUrl,
                    cb: ()=>{
                    // noop
                    },
                    attrs: defaultAttrs3,
                    createScriptHook: (url, attrs)=>{
                        var res = host.loaderHook.lifecycle.createScript.emit({
                            url,
                            attrs
                        });
                        if (res instanceof HTMLScriptElement) {
                            return res;
                        }
                        return;
                    },
                    needDeleteScript: true
                });
                needAttach && document.head.appendChild(scriptEl);
            });
        }
    }
}
function assignRemoteInfo(remoteInfo, remoteSnapshot) {
    var remoteEntryInfo = getRemoteEntryInfoFromSnapshot(remoteSnapshot);
    if (!remoteEntryInfo.url) {
        error("The attribute remoteEntry of ".concat(remoteInfo.name, " must not be undefined."));
    }
    var entryUrl = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.getResourceUrl)(remoteSnapshot, remoteEntryInfo.url);
    if (!(0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isBrowserEnv)() && !entryUrl.startsWith("http")) {
        entryUrl = "https:".concat(entryUrl);
    }
    remoteInfo.type = remoteEntryInfo.type;
    remoteInfo.entryGlobalName = remoteEntryInfo.globalName;
    remoteInfo.entry = entryUrl;
    remoteInfo.version = remoteSnapshot.version;
    remoteInfo.buildVersion = remoteSnapshot.buildVersion;
}
function snapshotPlugin() {
    return {
        name: "snapshot-plugin",
        afterResolve (args) {
            return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
                var { remote, pkgNameOrAlias, expose, origin, remoteInfo, id } = args;
                if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
                    var { remoteSnapshot, globalSnapshot } = yield origin.snapshotHandler.loadRemoteSnapshotInfo({
                        moduleInfo: remote,
                        id
                    });
                    assignRemoteInfo(remoteInfo, remoteSnapshot);
                    // preloading assets
                    var preloadOptions = {
                        remote,
                        preloadConfig: {
                            nameOrAlias: pkgNameOrAlias,
                            exposes: [
                                expose
                            ],
                            resourceCategory: "sync",
                            share: false,
                            depsRemote: false
                        }
                    };
                    var assets = yield origin.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit({
                        origin,
                        preloadOptions,
                        remoteInfo,
                        remote,
                        remoteSnapshot,
                        globalSnapshot
                    });
                    if (assets) {
                        preloadAssets(remoteInfo, origin, assets, false);
                    }
                    return (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, args, {
                        remoteSnapshot
                    });
                }
                return args;
            })();
        }
    };
}
// name
// name:version
function splitId(id) {
    var splitInfo = id.split(":");
    if (splitInfo.length === 1) {
        return {
            name: splitInfo[0],
            version: undefined
        };
    } else if (splitInfo.length === 2) {
        return {
            name: splitInfo[0],
            version: splitInfo[1]
        };
    } else {
        return {
            name: splitInfo[1],
            version: splitInfo[2]
        };
    }
}
// Traverse all nodes in moduleInfo and traverse the entire snapshot
function traverseModuleInfo(globalSnapshot, remoteInfo, traverse, isRoot) {
    var memo = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {}, remoteSnapshot = arguments.length > 5 ? arguments[5] : void 0;
    var id = getFMId(remoteInfo);
    var { value: snapshotValue } = getInfoWithoutType(globalSnapshot, id);
    var effectiveRemoteSnapshot = remoteSnapshot || snapshotValue;
    if (effectiveRemoteSnapshot && !(0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isManifestProvider)(effectiveRemoteSnapshot)) {
        traverse(effectiveRemoteSnapshot, remoteInfo, isRoot);
        if (effectiveRemoteSnapshot.remotesInfo) {
            var remoteKeys = Object.keys(effectiveRemoteSnapshot.remotesInfo);
            for (var key of remoteKeys){
                if (memo[key]) {
                    continue;
                }
                memo[key] = true;
                var subRemoteInfo = splitId(key);
                var remoteValue = effectiveRemoteSnapshot.remotesInfo[key];
                traverseModuleInfo(globalSnapshot, {
                    name: subRemoteInfo.name,
                    version: remoteValue.matchedVersion
                }, traverse, false, memo, undefined);
            }
        }
    }
}
var isExisted = (type, url)=>{
    return document.querySelector("".concat(type, "[").concat(type === "link" ? "href" : "src", '="').concat(url, '"]'));
};
// eslint-disable-next-line max-lines-per-function
function generatePreloadAssets(origin, preloadOptions, remote, globalSnapshot, remoteSnapshot) {
    var cssAssets = [];
    var jsAssets = [];
    var entryAssets = [];
    var loadedSharedJsAssets = new Set();
    var loadedSharedCssAssets = new Set();
    var { options } = origin;
    var { preloadConfig: rootPreloadConfig } = preloadOptions;
    var { depsRemote } = rootPreloadConfig;
    var memo = {};
    traverseModuleInfo(globalSnapshot, remote, (moduleInfoSnapshot, remoteInfo, isRoot)=>{
        var preloadConfig;
        if (isRoot) {
            preloadConfig = rootPreloadConfig;
        } else {
            if (Array.isArray(depsRemote)) {
                // eslint-disable-next-line array-callback-return
                var findPreloadConfig = depsRemote.find((remoteConfig)=>{
                    if (remoteConfig.nameOrAlias === remoteInfo.name || remoteConfig.nameOrAlias === remoteInfo.alias) {
                        return true;
                    }
                    return false;
                });
                if (!findPreloadConfig) {
                    return;
                }
                preloadConfig = defaultPreloadArgs(findPreloadConfig);
            } else if (depsRemote === true) {
                preloadConfig = rootPreloadConfig;
            } else {
                return;
            }
        }
        var remoteEntryUrl = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.getResourceUrl)(moduleInfoSnapshot, getRemoteEntryInfoFromSnapshot(moduleInfoSnapshot).url);
        if (remoteEntryUrl) {
            entryAssets.push({
                name: remoteInfo.name,
                moduleInfo: {
                    name: remoteInfo.name,
                    entry: remoteEntryUrl,
                    type: "remoteEntryType" in moduleInfoSnapshot ? moduleInfoSnapshot.remoteEntryType : "global",
                    entryGlobalName: "globalName" in moduleInfoSnapshot ? moduleInfoSnapshot.globalName : remoteInfo.name,
                    shareScope: "",
                    version: "version" in moduleInfoSnapshot ? moduleInfoSnapshot.version : undefined
                },
                url: remoteEntryUrl
            });
        }
        var moduleAssetsInfo = "modules" in moduleInfoSnapshot ? moduleInfoSnapshot.modules : [];
        var normalizedPreloadExposes = normalizePreloadExposes(preloadConfig.exposes);
        if (normalizedPreloadExposes.length && "modules" in moduleInfoSnapshot) {
            var _moduleInfoSnapshot_modules;
            moduleAssetsInfo = moduleInfoSnapshot == null ? void 0 : (_moduleInfoSnapshot_modules = moduleInfoSnapshot.modules) == null ? void 0 : _moduleInfoSnapshot_modules.reduce((assets, moduleAssetInfo)=>{
                if ((normalizedPreloadExposes == null ? void 0 : normalizedPreloadExposes.indexOf(moduleAssetInfo.moduleName)) !== -1) {
                    assets.push(moduleAssetInfo);
                }
                return assets;
            }, []);
        }
        function handleAssets(assets) {
            var assetsRes = assets.map((asset)=>(0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.getResourceUrl)(moduleInfoSnapshot, asset));
            if (preloadConfig.filter) {
                return assetsRes.filter(preloadConfig.filter);
            }
            return assetsRes;
        }
        if (moduleAssetsInfo) {
            var assetsLength = moduleAssetsInfo.length;
            for(var index = 0; index < assetsLength; index++){
                var assetsInfo = moduleAssetsInfo[index];
                var exposeFullPath = "".concat(remoteInfo.name, "/").concat(assetsInfo.moduleName);
                origin.remoteHandler.hooks.lifecycle.handlePreloadModule.emit({
                    id: assetsInfo.moduleName === "." ? remoteInfo.name : exposeFullPath,
                    name: remoteInfo.name,
                    remoteSnapshot: moduleInfoSnapshot,
                    preloadConfig,
                    remote: remoteInfo,
                    origin
                });
                var preloaded = getPreloaded(exposeFullPath);
                if (preloaded) {
                    continue;
                }
                if (preloadConfig.resourceCategory === "all") {
                    cssAssets.push(...handleAssets(assetsInfo.assets.css.async));
                    cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
                    jsAssets.push(...handleAssets(assetsInfo.assets.js.async));
                    jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
                // eslint-disable-next-line no-constant-condition
                } else if (preloadConfig.resourceCategory = "sync") {
                    cssAssets.push(...handleAssets(assetsInfo.assets.css.sync));
                    jsAssets.push(...handleAssets(assetsInfo.assets.js.sync));
                }
                setPreloaded(exposeFullPath);
            }
        }
    }, true, memo, remoteSnapshot);
    if (remoteSnapshot.shared) {
        var collectSharedAssets = (shareInfo, snapshotShared)=>{
            var registeredShared = getRegisteredShare(origin.shareScopeMap, snapshotShared.sharedName, shareInfo, origin.sharedHandler.hooks.lifecycle.resolveShare);
            // If the global share does not exist, or the lib function does not exist, it means that the shared has not been loaded yet and can be preloaded.
            if (registeredShared && typeof registeredShared.lib === "function") {
                snapshotShared.assets.js.sync.forEach((asset)=>{
                    loadedSharedJsAssets.add(asset);
                });
                snapshotShared.assets.css.sync.forEach((asset)=>{
                    loadedSharedCssAssets.add(asset);
                });
            }
        };
        remoteSnapshot.shared.forEach((shared)=>{
            var _options_shared;
            var shareInfos = (_options_shared = options.shared) == null ? void 0 : _options_shared[shared.sharedName];
            if (!shareInfos) {
                return;
            }
            // if no version, preload all shared
            var sharedOptions = shared.version ? shareInfos.find((s)=>s.version === shared.version) : shareInfos;
            if (!sharedOptions) {
                return;
            }
            var arrayShareInfo = arrayOptions(sharedOptions);
            arrayShareInfo.forEach((s)=>{
                collectSharedAssets(s, shared);
            });
        });
    }
    var needPreloadJsAssets = jsAssets.filter((asset)=>!loadedSharedJsAssets.has(asset) && !isExisted("script", asset));
    var needPreloadCssAssets = cssAssets.filter((asset)=>!loadedSharedCssAssets.has(asset) && !isExisted("link", asset));
    return {
        cssAssets: needPreloadCssAssets,
        jsAssetsWithoutEntry: needPreloadJsAssets,
        entryAssets: entryAssets.filter((entry)=>!isExisted("script", entry.url))
    };
}
var generatePreloadAssetsPlugin = function generatePreloadAssetsPlugin() {
    return {
        name: "generate-preload-assets-plugin",
        generatePreloadAssets (args) {
            return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
                var { origin, preloadOptions, remoteInfo, remote, globalSnapshot, remoteSnapshot } = args;
                if (!(0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isBrowserEnv)()) {
                    return {
                        cssAssets: [],
                        jsAssetsWithoutEntry: [],
                        entryAssets: []
                    };
                }
                if (isRemoteInfoWithEntry(remote) && isPureRemoteEntry(remote)) {
                    return {
                        cssAssets: [],
                        jsAssetsWithoutEntry: [],
                        entryAssets: [
                            {
                                name: remote.name,
                                url: remote.entry,
                                moduleInfo: {
                                    name: remoteInfo.name,
                                    entry: remote.entry,
                                    type: remoteInfo.type || "global",
                                    entryGlobalName: "",
                                    shareScope: ""
                                }
                            }
                        ]
                    };
                }
                assignRemoteInfo(remoteInfo, remoteSnapshot);
                var assets = generatePreloadAssets(origin, preloadOptions, remoteInfo, globalSnapshot, remoteSnapshot);
                return assets;
            })();
        }
    };
};
function getGlobalRemoteInfo(moduleInfo, origin) {
    var hostGlobalSnapshot = getGlobalSnapshotInfoByModuleInfo({
        name: origin.name,
        version: origin.options.version
    });
    // get remote detail info from global
    var globalRemoteInfo = hostGlobalSnapshot && "remotesInfo" in hostGlobalSnapshot && hostGlobalSnapshot.remotesInfo && getInfoWithoutType(hostGlobalSnapshot.remotesInfo, moduleInfo.name).value;
    if (globalRemoteInfo && globalRemoteInfo.matchedVersion) {
        return {
            hostGlobalSnapshot,
            globalSnapshot: getGlobalSnapshot(),
            remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
                name: moduleInfo.name,
                version: globalRemoteInfo.matchedVersion
            })
        };
    }
    return {
        hostGlobalSnapshot: undefined,
        globalSnapshot: getGlobalSnapshot(),
        remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
            name: moduleInfo.name,
            version: "version" in moduleInfo ? moduleInfo.version : undefined
        })
    };
}
class SnapshotHandler {
    // eslint-disable-next-line max-lines-per-function
    loadRemoteSnapshotInfo(param) {
        var { moduleInfo, id, expose } = param;
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            var { options } = _this.HostInstance;
            yield _this.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
                options,
                moduleInfo
            });
            var hostSnapshot = getGlobalSnapshotInfoByModuleInfo({
                name: _this.HostInstance.options.name,
                version: _this.HostInstance.options.version
            });
            if (!hostSnapshot) {
                hostSnapshot = {
                    version: _this.HostInstance.options.version || "",
                    remoteEntry: "",
                    remotesInfo: {}
                };
                addGlobalSnapshot({
                    [_this.HostInstance.options.name]: hostSnapshot
                });
            }
            // In dynamic loadRemote scenarios, incomplete remotesInfo delivery may occur. In such cases, the remotesInfo in the host needs to be completed in the snapshot at runtime.
            // This ensures the snapshot's integrity and helps the chrome plugin correctly identify all producer modules, ensuring that proxyable producer modules will not be missing.
            if (hostSnapshot && "remotesInfo" in hostSnapshot && !getInfoWithoutType(hostSnapshot.remotesInfo, moduleInfo.name).value) {
                if ("version" in moduleInfo || "entry" in moduleInfo) {
                    hostSnapshot.remotesInfo = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, hostSnapshot == null ? void 0 : hostSnapshot.remotesInfo, {
                        [moduleInfo.name]: {
                            matchedVersion: "version" in moduleInfo ? moduleInfo.version : moduleInfo.entry
                        }
                    });
                }
            }
            var { hostGlobalSnapshot, remoteSnapshot, globalSnapshot } = _this.getGlobalRemoteInfo(moduleInfo);
            var { remoteSnapshot: globalRemoteSnapshot, globalSnapshot: globalSnapshotRes } = yield _this.hooks.lifecycle.loadSnapshot.emit({
                options,
                moduleInfo,
                hostGlobalSnapshot,
                remoteSnapshot,
                globalSnapshot
            });
            var mSnapshot;
            var gSnapshot;
            // global snapshot includes manifest or module info includes manifest
            if (globalRemoteSnapshot) {
                if ((0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isManifestProvider)(globalRemoteSnapshot)) {
                    var remoteEntry = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isBrowserEnv)() ? globalRemoteSnapshot.remoteEntry : globalRemoteSnapshot.ssrRemoteEntry || globalRemoteSnapshot.remoteEntry || "";
                    var moduleSnapshot = yield _this.getManifestJson(remoteEntry, moduleInfo, {});
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    var globalSnapshotRes1 = setGlobalSnapshotInfoByModuleInfo((0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, moduleInfo, {
                        // The global remote may be overridden
                        // Therefore, set the snapshot key to the global address of the actual request
                        entry: remoteEntry
                    }), moduleSnapshot);
                    mSnapshot = moduleSnapshot;
                    gSnapshot = globalSnapshotRes1;
                } else {
                    var { remoteSnapshot: remoteSnapshotRes } = yield _this.hooks.lifecycle.loadRemoteSnapshot.emit({
                        options: _this.HostInstance.options,
                        moduleInfo,
                        remoteSnapshot: globalRemoteSnapshot,
                        from: "global"
                    });
                    mSnapshot = remoteSnapshotRes;
                    gSnapshot = globalSnapshotRes;
                }
            } else {
                if (isRemoteInfoWithEntry(moduleInfo)) {
                    // get from manifest.json and merge remote info from remote server
                    var moduleSnapshot1 = yield _this.getManifestJson(moduleInfo.entry, moduleInfo, {});
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    var globalSnapshotRes2 = setGlobalSnapshotInfoByModuleInfo(moduleInfo, moduleSnapshot1);
                    var { remoteSnapshot: remoteSnapshotRes1 } = yield _this.hooks.lifecycle.loadRemoteSnapshot.emit({
                        options: _this.HostInstance.options,
                        moduleInfo,
                        remoteSnapshot: moduleSnapshot1,
                        from: "global"
                    });
                    mSnapshot = remoteSnapshotRes1;
                    gSnapshot = globalSnapshotRes2;
                } else {
                    error((0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.RUNTIME_007, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.runtimeDescMap, {
                        hostName: moduleInfo.name,
                        hostVersion: moduleInfo.version,
                        globalSnapshot: JSON.stringify(globalSnapshotRes)
                    }));
                }
            }
            yield _this.hooks.lifecycle.afterLoadSnapshot.emit({
                id,
                host: _this.HostInstance,
                options,
                moduleInfo,
                remoteSnapshot: mSnapshot
            });
            return {
                remoteSnapshot: mSnapshot,
                globalSnapshot: gSnapshot
            };
        })();
    }
    getGlobalRemoteInfo(moduleInfo) {
        return getGlobalRemoteInfo(moduleInfo, this.HostInstance);
    }
    getManifestJson(manifestUrl, moduleInfo, extraOptions) {
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            var getManifest = function() {
                var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
                    var manifestJson = _this.manifestCache.get(manifestUrl);
                    if (manifestJson) {
                        return manifestJson;
                    }
                    try {
                        var res = yield _this.loaderHook.lifecycle.fetch.emit(manifestUrl, {});
                        if (!res || !(res instanceof Response)) {
                            res = yield fetch(manifestUrl, {});
                        }
                        manifestJson = yield res.json();
                    } catch (err) {
                        manifestJson = yield _this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
                            id: manifestUrl,
                            error: err,
                            from: "runtime",
                            lifecycle: "afterResolve",
                            origin: _this.HostInstance
                        });
                        if (!manifestJson) {
                            delete _this.manifestLoading[manifestUrl];
                            error((0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.RUNTIME_003, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.runtimeDescMap, {
                                manifestUrl,
                                moduleName: moduleInfo.name,
                                hostName: _this.HostInstance.options.name
                            }, "".concat(err)));
                        }
                    }
                    assert(manifestJson.metaData && manifestJson.exposes && manifestJson.shared, "".concat(manifestUrl, " is not a federation manifest"));
                    _this.manifestCache.set(manifestUrl, manifestJson);
                    return manifestJson;
                });
                return function getManifest() {
                    return _ref.apply(this, arguments);
                };
            }();
            var asyncLoadProcess = function() {
                var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
                    var manifestJson = yield getManifest();
                    var remoteSnapshot = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.generateSnapshotFromManifest)(manifestJson, {
                        version: manifestUrl
                    });
                    var { remoteSnapshot: remoteSnapshotRes } = yield _this.hooks.lifecycle.loadRemoteSnapshot.emit({
                        options: _this.HostInstance.options,
                        moduleInfo,
                        manifestJson,
                        remoteSnapshot,
                        manifestUrl,
                        from: "manifest"
                    });
                    return remoteSnapshotRes;
                });
                return function asyncLoadProcess() {
                    return _ref.apply(this, arguments);
                };
            }();
            if (!_this.manifestLoading[manifestUrl]) {
                _this.manifestLoading[manifestUrl] = asyncLoadProcess().then((res)=>res);
            }
            return _this.manifestLoading[manifestUrl];
        })();
    }
    constructor(HostInstance){
        this.loadingHostSnapshot = null;
        this.manifestCache = new Map();
        this.hooks = new PluginSystem({
            beforeLoadRemoteSnapshot: new AsyncHook("beforeLoadRemoteSnapshot"),
            loadSnapshot: new AsyncWaterfallHook("loadGlobalSnapshot"),
            loadRemoteSnapshot: new AsyncWaterfallHook("loadRemoteSnapshot"),
            afterLoadSnapshot: new AsyncWaterfallHook("afterLoadSnapshot")
        });
        this.manifestLoading = Global.__FEDERATION__.__MANIFEST_LOADING__;
        this.HostInstance = HostInstance;
        this.loaderHook = HostInstance.loaderHook;
    }
}
class SharedHandler {
    // register shared in shareScopeMap
    registerShared(globalOptions, userOptions) {
        var { shareInfos, shared } = formatShareConfigs(globalOptions, userOptions);
        var sharedKeys = Object.keys(shareInfos);
        sharedKeys.forEach((sharedKey)=>{
            var sharedVals = shareInfos[sharedKey];
            sharedVals.forEach((sharedVal)=>{
                var registeredShared = getRegisteredShare(this.shareScopeMap, sharedKey, sharedVal, this.hooks.lifecycle.resolveShare);
                if (!registeredShared && sharedVal && sharedVal.lib) {
                    this.setShared({
                        pkgName: sharedKey,
                        lib: sharedVal.lib,
                        get: sharedVal.get,
                        loaded: true,
                        shared: sharedVal,
                        from: userOptions.name
                    });
                }
            });
        });
        return {
            shareInfos,
            shared
        };
    }
    loadShare(pkgName, extraOptions) {
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            var { host } = _this;
            // This function performs the following steps:
            // 1. Checks if the currently loaded share already exists, if not, it throws an error
            // 2. Searches globally for a matching share, if found, it uses it directly
            // 3. If not found, it retrieves it from the current share and stores the obtained share globally.
            var shareInfo = getTargetSharedOptions({
                pkgName,
                extraOptions,
                shareInfos: host.options.shared
            });
            if (shareInfo == null ? void 0 : shareInfo.scope) {
                yield Promise.all(shareInfo.scope.map(function() {
                    var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*(shareScope) {
                        yield Promise.all(_this.initializeSharing(shareScope, {
                            strategy: shareInfo.strategy
                        }));
                        return;
                    });
                    return function(shareScope) {
                        return _ref.apply(this, arguments);
                    };
                }()));
            }
            var loadShareRes = yield _this.hooks.lifecycle.beforeLoadShare.emit({
                pkgName,
                shareInfo,
                shared: host.options.shared,
                origin: host
            });
            var { shareInfo: shareInfoRes } = loadShareRes;
            // Assert that shareInfoRes exists, if not, throw an error
            assert(shareInfoRes, "Cannot find ".concat(pkgName, " Share in the ").concat(host.options.name, ". Please ensure that the ").concat(pkgName, " Share parameters have been injected"));
            // Retrieve from cache
            var registeredShared = getRegisteredShare(_this.shareScopeMap, pkgName, shareInfoRes, _this.hooks.lifecycle.resolveShare);
            var addUseIn = (shared)=>{
                if (!shared.useIn) {
                    shared.useIn = [];
                }
                addUniqueItem(shared.useIn, host.options.name);
            };
            if (registeredShared && registeredShared.lib) {
                addUseIn(registeredShared);
                return registeredShared.lib;
            } else if (registeredShared && registeredShared.loading && !registeredShared.loaded) {
                var factory = yield registeredShared.loading;
                registeredShared.loaded = true;
                if (!registeredShared.lib) {
                    registeredShared.lib = factory;
                }
                addUseIn(registeredShared);
                return factory;
            } else if (registeredShared) {
                var asyncLoadProcess = function() {
                    var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
                        var factory = yield registeredShared.get();
                        shareInfoRes.lib = factory;
                        shareInfoRes.loaded = true;
                        addUseIn(shareInfoRes);
                        var gShared = getRegisteredShare(_this.shareScopeMap, pkgName, shareInfoRes, _this.hooks.lifecycle.resolveShare);
                        if (gShared) {
                            gShared.lib = factory;
                            gShared.loaded = true;
                        }
                        return factory;
                    });
                    return function asyncLoadProcess() {
                        return _ref.apply(this, arguments);
                    };
                }();
                var loading = asyncLoadProcess();
                _this.setShared({
                    pkgName,
                    loaded: false,
                    shared: registeredShared,
                    from: host.options.name,
                    lib: null,
                    loading
                });
                return loading;
            } else {
                if (extraOptions == null ? void 0 : extraOptions.customShareInfo) {
                    return false;
                }
                var asyncLoadProcess1 = function() {
                    var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
                        var factory = yield shareInfoRes.get();
                        shareInfoRes.lib = factory;
                        shareInfoRes.loaded = true;
                        addUseIn(shareInfoRes);
                        var gShared = getRegisteredShare(_this.shareScopeMap, pkgName, shareInfoRes, _this.hooks.lifecycle.resolveShare);
                        if (gShared) {
                            gShared.lib = factory;
                            gShared.loaded = true;
                        }
                        return factory;
                    });
                    return function asyncLoadProcess1() {
                        return _ref.apply(this, arguments);
                    };
                }();
                var loading1 = asyncLoadProcess1();
                _this.setShared({
                    pkgName,
                    loaded: false,
                    shared: shareInfoRes,
                    from: host.options.name,
                    lib: null,
                    loading: loading1
                });
                return loading1;
            }
        })();
    }
    /**
   * This function initializes the sharing sequence (executed only once per share scope).
   * It accepts one argument, the name of the share scope.
   * If the share scope does not exist, it creates one.
   */ // eslint-disable-next-line @typescript-eslint/member-ordering
    initializeSharing() {
        var shareScopeName = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : DEFAULT_SCOPE, extraOptions = arguments.length > 1 ? arguments[1] : void 0;
        var { host } = this;
        var from = extraOptions == null ? void 0 : extraOptions.from;
        var strategy = extraOptions == null ? void 0 : extraOptions.strategy;
        var initScope = extraOptions == null ? void 0 : extraOptions.initScope;
        var promises = [];
        if (from !== "build") {
            var { initTokens } = this;
            if (!initScope) initScope = [];
            var initToken = initTokens[shareScopeName];
            if (!initToken) initToken = initTokens[shareScopeName] = {
                from: this.host.name
            };
            if (initScope.indexOf(initToken) >= 0) return promises;
            initScope.push(initToken);
        }
        var shareScope = this.shareScopeMap;
        var hostName = host.options.name;
        // Creates a new share scope if necessary
        if (!shareScope[shareScopeName]) {
            shareScope[shareScopeName] = {};
        }
        // Executes all initialization snippets from all accessible modules
        var scope = shareScope[shareScopeName];
        var register = (name, shared)=>{
            var _activeVersion_shareConfig;
            var { version, eager } = shared;
            scope[name] = scope[name] || {};
            var versions = scope[name];
            var activeVersion = versions[version];
            var activeVersionEager = Boolean(activeVersion && (activeVersion.eager || ((_activeVersion_shareConfig = activeVersion.shareConfig) == null ? void 0 : _activeVersion_shareConfig.eager)));
            if (!activeVersion || activeVersion.strategy !== "loaded-first" && !activeVersion.loaded && (Boolean(!eager) !== !activeVersionEager ? eager : hostName > activeVersion.from)) {
                versions[version] = shared;
            }
        };
        var initFn = (mod)=>mod && mod.init && mod.init(shareScope[shareScopeName], initScope);
        var initRemoteModule = function() {
            var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*(key) {
                var { module } = yield host.remoteHandler.getRemoteModuleAndOptions({
                    id: key
                });
                if (module.getEntry) {
                    var remoteEntryExports;
                    try {
                        remoteEntryExports = yield module.getEntry();
                    } catch (error) {
                        remoteEntryExports = yield host.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
                            id: key,
                            error,
                            from: "runtime",
                            lifecycle: "beforeLoadShare",
                            origin: host
                        });
                    }
                    if (!module.inited) {
                        yield initFn(remoteEntryExports);
                        module.inited = true;
                    }
                }
            });
            return function initRemoteModule(key) {
                return _ref.apply(this, arguments);
            };
        }();
        Object.keys(host.options.shared).forEach((shareName)=>{
            var sharedArr = host.options.shared[shareName];
            sharedArr.forEach((shared)=>{
                if (shared.scope.includes(shareScopeName)) {
                    register(shareName, shared);
                }
            });
        });
        // TODO: strategy==='version-first' need to be removed in the future
        if (host.options.shareStrategy === "version-first" || strategy === "version-first") {
            host.options.remotes.forEach((remote)=>{
                if (remote.shareScope === shareScopeName) {
                    promises.push(initRemoteModule(remote.name));
                }
            });
        }
        return promises;
    }
    // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
    // 1. If the loaded shared already exists globally, then it will be reused
    // 2. If lib exists in local shared, it will be used directly
    // 3. If the local get returns something other than Promise, then it will be used directly
    loadShareSync(pkgName, extraOptions) {
        var { host } = this;
        var shareInfo = getTargetSharedOptions({
            pkgName,
            extraOptions,
            shareInfos: host.options.shared
        });
        if (shareInfo == null ? void 0 : shareInfo.scope) {
            shareInfo.scope.forEach((shareScope)=>{
                this.initializeSharing(shareScope, {
                    strategy: shareInfo.strategy
                });
            });
        }
        var registeredShared = getRegisteredShare(this.shareScopeMap, pkgName, shareInfo, this.hooks.lifecycle.resolveShare);
        var addUseIn = (shared)=>{
            if (!shared.useIn) {
                shared.useIn = [];
            }
            addUniqueItem(shared.useIn, host.options.name);
        };
        if (registeredShared) {
            if (typeof registeredShared.lib === "function") {
                addUseIn(registeredShared);
                if (!registeredShared.loaded) {
                    registeredShared.loaded = true;
                    if (registeredShared.from === host.options.name) {
                        shareInfo.loaded = true;
                    }
                }
                return registeredShared.lib;
            }
            if (typeof registeredShared.get === "function") {
                var module = registeredShared.get();
                if (!(module instanceof Promise)) {
                    addUseIn(registeredShared);
                    this.setShared({
                        pkgName,
                        loaded: true,
                        from: host.options.name,
                        lib: module,
                        shared: registeredShared
                    });
                    return module;
                }
            }
        }
        if (shareInfo.lib) {
            if (!shareInfo.loaded) {
                shareInfo.loaded = true;
            }
            return shareInfo.lib;
        }
        if (shareInfo.get) {
            var module1 = shareInfo.get();
            if (module1 instanceof Promise) {
                var errorCode = (extraOptions == null ? void 0 : extraOptions.from) === "build" ? _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.RUNTIME_005 : _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.RUNTIME_006;
                throw new Error((0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.getShortErrorMsg)(errorCode, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.runtimeDescMap, {
                    hostName: host.options.name,
                    sharedPkgName: pkgName
                }));
            }
            shareInfo.lib = module1;
            this.setShared({
                pkgName,
                loaded: true,
                from: host.options.name,
                lib: shareInfo.lib,
                shared: shareInfo
            });
            return shareInfo.lib;
        }
        throw new Error((0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.RUNTIME_006, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.runtimeDescMap, {
            hostName: host.options.name,
            sharedPkgName: pkgName
        }));
    }
    initShareScopeMap(scopeName, shareScope) {
        var extraOptions = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        var { host } = this;
        this.shareScopeMap[scopeName] = shareScope;
        this.hooks.lifecycle.initContainerShareScopeMap.emit({
            shareScope,
            options: host.options,
            origin: host,
            scopeName,
            hostShareScopeMap: extraOptions.hostShareScopeMap
        });
    }
    setShared(param) {
        var { pkgName, shared, from, lib, loading, loaded, get } = param;
        var { version, scope = "default" } = shared, shareInfo = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__.a)(shared, [
            "version",
            "scope"
        ]);
        var scopes = Array.isArray(scope) ? scope : [
            scope
        ];
        scopes.forEach((sc)=>{
            if (!this.shareScopeMap[sc]) {
                this.shareScopeMap[sc] = {};
            }
            if (!this.shareScopeMap[sc][pkgName]) {
                this.shareScopeMap[sc][pkgName] = {};
            }
            if (!this.shareScopeMap[sc][pkgName][version]) {
                this.shareScopeMap[sc][pkgName][version] = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({
                    version,
                    scope: [
                        "default"
                    ]
                }, shareInfo, {
                    lib,
                    loaded,
                    loading
                });
                if (get) {
                    this.shareScopeMap[sc][pkgName][version].get = get;
                }
                return;
            }
            var registeredShared = this.shareScopeMap[sc][pkgName][version];
            if (loading && !registeredShared.loading) {
                registeredShared.loading = loading;
            }
        });
    }
    _setGlobalShareScopeMap(hostOptions) {
        var globalShareScopeMap = getGlobalShareScope();
        var identifier = hostOptions.id || hostOptions.name;
        if (identifier && !globalShareScopeMap[identifier]) {
            globalShareScopeMap[identifier] = this.shareScopeMap;
        }
    }
    constructor(host){
        this.hooks = new PluginSystem({
            afterResolve: new AsyncWaterfallHook("afterResolve"),
            beforeLoadShare: new AsyncWaterfallHook("beforeLoadShare"),
            // not used yet
            loadShare: new AsyncHook(),
            resolveShare: new SyncWaterfallHook("resolveShare"),
            // maybe will change, temporarily for internal use only
            initContainerShareScopeMap: new SyncWaterfallHook("initContainerShareScopeMap")
        });
        this.host = host;
        this.shareScopeMap = {};
        this.initTokens = {};
        this._setGlobalShareScopeMap(host.options);
    }
}
class RemoteHandler {
    formatAndRegisterRemote(globalOptions, userOptions) {
        var userRemotes = userOptions.remotes || [];
        return userRemotes.reduce((res, remote)=>{
            this.registerRemote(remote, res, {
                force: false
            });
            return res;
        }, globalOptions.remotes);
    }
    setIdToRemoteMap(id, remoteMatchInfo) {
        var { remote, expose } = remoteMatchInfo;
        var { name, alias } = remote;
        this.idToRemoteMap[id] = {
            name: remote.name,
            expose
        };
        if (alias && id.startsWith(name)) {
            var idWithAlias = id.replace(name, alias);
            this.idToRemoteMap[idWithAlias] = {
                name: remote.name,
                expose
            };
            return;
        }
        if (alias && id.startsWith(alias)) {
            var idWithName = id.replace(alias, name);
            this.idToRemoteMap[idWithName] = {
                name: remote.name,
                expose
            };
        }
    }
    // eslint-disable-next-line max-lines-per-function
    // eslint-disable-next-line @typescript-eslint/member-ordering
    loadRemote(id, options) {
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            var { host } = _this;
            try {
                var { loadFactory = true } = options || {
                    loadFactory: true
                };
                // 1. Validate the parameters of the retrieved module. There are two module request methods: pkgName + expose and alias + expose.
                // 2. Request the snapshot information of the current host and globally store the obtained snapshot information. The retrieved module information is partially offline and partially online. The online module information will retrieve the modules used online.
                // 3. Retrieve the detailed information of the current module from global (remoteEntry address, expose resource address)
                // 4. After retrieving remoteEntry, call the init of the module, and then retrieve the exported content of the module through get
                // id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
                // id: alias(app1) + expose(button) = app1/button
                // id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
                var { module, moduleOptions, remoteMatchInfo } = yield _this.getRemoteModuleAndOptions({
                    id
                });
                var { pkgNameOrAlias, remote, expose, id: idRes, remoteSnapshot } = remoteMatchInfo;
                var moduleOrFactory = yield module.get(idRes, expose, options, remoteSnapshot);
                var moduleWrapper = yield _this.hooks.lifecycle.onLoad.emit({
                    id: idRes,
                    pkgNameOrAlias,
                    expose,
                    exposeModule: loadFactory ? moduleOrFactory : undefined,
                    exposeModuleFactory: loadFactory ? undefined : moduleOrFactory,
                    remote,
                    options: moduleOptions,
                    moduleInstance: module,
                    origin: host
                });
                _this.setIdToRemoteMap(id, remoteMatchInfo);
                if (typeof moduleWrapper === "function") {
                    return moduleWrapper;
                }
                return moduleOrFactory;
            } catch (error) {
                var { from = "runtime" } = options || {
                    from: "runtime"
                };
                var failOver = yield _this.hooks.lifecycle.errorLoadRemote.emit({
                    id,
                    error,
                    from,
                    lifecycle: "onLoad",
                    origin: host
                });
                if (!failOver) {
                    throw error;
                }
                return failOver;
            }
        })();
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    preloadRemote(preloadOptions) {
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            var { host } = _this;
            yield _this.hooks.lifecycle.beforePreloadRemote.emit({
                preloadOps: preloadOptions,
                options: host.options,
                origin: host
            });
            var preloadOps = formatPreloadArgs(host.options.remotes, preloadOptions);
            yield Promise.all(preloadOps.map(function() {
                var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*(ops) {
                    var { remote } = ops;
                    var remoteInfo = getRemoteInfo(remote);
                    var { globalSnapshot, remoteSnapshot } = yield host.snapshotHandler.loadRemoteSnapshotInfo({
                        moduleInfo: remote
                    });
                    var assets = yield _this.hooks.lifecycle.generatePreloadAssets.emit({
                        origin: host,
                        preloadOptions: ops,
                        remote,
                        remoteInfo,
                        globalSnapshot,
                        remoteSnapshot
                    });
                    if (!assets) {
                        return;
                    }
                    preloadAssets(remoteInfo, host, assets);
                });
                return function(ops) {
                    return _ref.apply(this, arguments);
                };
            }()));
        })();
    }
    registerRemotes(remotes, options) {
        var { host } = this;
        remotes.forEach((remote)=>{
            this.registerRemote(remote, host.options.remotes, {
                force: options == null ? void 0 : options.force
            });
        });
    }
    getRemoteModuleAndOptions(options) {
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            var { host } = _this;
            var { id } = options;
            var loadRemoteArgs;
            try {
                loadRemoteArgs = yield _this.hooks.lifecycle.beforeRequest.emit({
                    id,
                    options: host.options,
                    origin: host
                });
            } catch (error) {
                loadRemoteArgs = yield _this.hooks.lifecycle.errorLoadRemote.emit({
                    id,
                    options: host.options,
                    origin: host,
                    from: "runtime",
                    error,
                    lifecycle: "beforeRequest"
                });
                if (!loadRemoteArgs) {
                    throw error;
                }
            }
            var { id: idRes } = loadRemoteArgs;
            var remoteSplitInfo = matchRemoteWithNameAndExpose(host.options.remotes, idRes);
            assert(remoteSplitInfo, (0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.RUNTIME_004, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_4__.runtimeDescMap, {
                hostName: host.options.name,
                requestId: idRes
            }));
            var { remote: rawRemote } = remoteSplitInfo;
            var remoteInfo = getRemoteInfo(rawRemote);
            var matchInfo = yield host.sharedHandler.hooks.lifecycle.afterResolve.emit((0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({
                id: idRes
            }, remoteSplitInfo, {
                options: host.options,
                origin: host,
                remoteInfo
            }));
            var { remote, expose } = matchInfo;
            assert(remote && expose, "The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ".concat(idRes, "."));
            var module = host.moduleCache.get(remote.name);
            var moduleOptions = {
                host: host,
                remoteInfo
            };
            if (!module) {
                module = new Module(moduleOptions);
                host.moduleCache.set(remote.name, module);
            }
            return {
                module,
                moduleOptions,
                remoteMatchInfo: matchInfo
            };
        })();
    }
    registerRemote(remote, targetRemotes, options) {
        var { host } = this;
        var normalizeRemote = ()=>{
            if (remote.alias) {
                // Validate if alias equals the prefix of remote.name and remote.alias, if so, throw an error
                // As multi-level path references cannot guarantee unique names, alias being a prefix of remote.name is not supported
                var findEqual = targetRemotes.find((item)=>{
                    var _item_alias;
                    return remote.alias && (item.name.startsWith(remote.alias) || ((_item_alias = item.alias) == null ? void 0 : _item_alias.startsWith(remote.alias)));
                });
                assert(!findEqual, "The alias ".concat(remote.alias, " of remote ").concat(remote.name, " is not allowed to be the prefix of ").concat(findEqual && findEqual.name, " name or alias"));
            }
            // Set the remote entry to a complete path
            if ("entry" in remote) {
                if ((0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isBrowserEnv)() && !remote.entry.startsWith("http")) {
                    remote.entry = new URL(remote.entry, window.location.origin).href;
                }
            }
            if (!remote.shareScope) {
                remote.shareScope = DEFAULT_SCOPE;
            }
            if (!remote.type) {
                remote.type = DEFAULT_REMOTE_TYPE;
            }
        };
        this.hooks.lifecycle.beforeRegisterRemote.emit({
            remote,
            origin: host
        });
        var registeredRemote = targetRemotes.find((item)=>item.name === remote.name);
        if (!registeredRemote) {
            normalizeRemote();
            targetRemotes.push(remote);
            this.hooks.lifecycle.registerRemote.emit({
                remote,
                origin: host
            });
        } else {
            var messages = [
                'The remote "'.concat(remote.name, '" is already registered.'),
                "Please note that overriding it may cause unexpected errors."
            ];
            if (options == null ? void 0 : options.force) {
                // remove registered remote
                this.removeRemote(registeredRemote);
                normalizeRemote();
                targetRemotes.push(remote);
                this.hooks.lifecycle.registerRemote.emit({
                    remote,
                    origin: host
                });
                (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.warn)(messages.join(" "));
            }
        }
    }
    removeRemote(remote) {
        try {
            var { host } = this;
            var { name } = remote;
            var remoteIndex = host.options.remotes.findIndex((item)=>item.name === name);
            if (remoteIndex !== -1) {
                host.options.remotes.splice(remoteIndex, 1);
            }
            var loadedModule = host.moduleCache.get(remote.name);
            if (loadedModule) {
                var remoteInfo = loadedModule.remoteInfo;
                var key = remoteInfo.entryGlobalName;
                if (CurrentGlobal[key]) {
                    var _Object_getOwnPropertyDescriptor;
                    if ((_Object_getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor(CurrentGlobal, key)) == null ? void 0 : _Object_getOwnPropertyDescriptor.configurable) {
                        delete CurrentGlobal[key];
                    } else {
                        // @ts-ignore
                        CurrentGlobal[key] = undefined;
                    }
                }
                var remoteEntryUniqueKey = getRemoteEntryUniqueKey(loadedModule.remoteInfo);
                if (globalLoading[remoteEntryUniqueKey]) {
                    delete globalLoading[remoteEntryUniqueKey];
                }
                host.snapshotHandler.manifestCache.delete(remoteInfo.entry);
                // delete unloaded shared and instance
                var remoteInsId = remoteInfo.buildVersion ? (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.composeKeyWithSeparator)(remoteInfo.name, remoteInfo.buildVersion) : remoteInfo.name;
                var remoteInsIndex = CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex((ins)=>{
                    if (remoteInfo.buildVersion) {
                        return ins.options.id === remoteInsId;
                    } else {
                        return ins.name === remoteInsId;
                    }
                });
                if (remoteInsIndex !== -1) {
                    var remoteIns = CurrentGlobal.__FEDERATION__.__INSTANCES__[remoteInsIndex];
                    remoteInsId = remoteIns.options.id || remoteInsId;
                    var globalShareScopeMap = getGlobalShareScope();
                    var isAllSharedNotUsed = true;
                    var needDeleteKeys = [];
                    Object.keys(globalShareScopeMap).forEach((instId)=>{
                        var shareScopeMap = globalShareScopeMap[instId];
                        shareScopeMap && Object.keys(shareScopeMap).forEach((shareScope)=>{
                            var shareScopeVal = shareScopeMap[shareScope];
                            shareScopeVal && Object.keys(shareScopeVal).forEach((shareName)=>{
                                var sharedPkgs = shareScopeVal[shareName];
                                sharedPkgs && Object.keys(sharedPkgs).forEach((shareVersion)=>{
                                    var shared = sharedPkgs[shareVersion];
                                    if (shared && typeof shared === "object" && shared.from === remoteInfo.name) {
                                        if (shared.loaded || shared.loading) {
                                            shared.useIn = shared.useIn.filter((usedHostName)=>usedHostName !== remoteInfo.name);
                                            if (shared.useIn.length) {
                                                isAllSharedNotUsed = false;
                                            } else {
                                                needDeleteKeys.push([
                                                    instId,
                                                    shareScope,
                                                    shareName,
                                                    shareVersion
                                                ]);
                                            }
                                        } else {
                                            needDeleteKeys.push([
                                                instId,
                                                shareScope,
                                                shareName,
                                                shareVersion
                                            ]);
                                        }
                                    }
                                });
                            });
                        });
                    });
                    if (isAllSharedNotUsed) {
                        remoteIns.shareScopeMap = {};
                        delete globalShareScopeMap[remoteInsId];
                    }
                    needDeleteKeys.forEach((param)=>{
                        var [insId, shareScope, shareName, shareVersion] = param;
                        var _globalShareScopeMap_insId_shareScope_shareName, _globalShareScopeMap_insId_shareScope, _globalShareScopeMap_insId;
                        (_globalShareScopeMap_insId = globalShareScopeMap[insId]) == null ? true : (_globalShareScopeMap_insId_shareScope = _globalShareScopeMap_insId[shareScope]) == null ? true : (_globalShareScopeMap_insId_shareScope_shareName = _globalShareScopeMap_insId_shareScope[shareName]) == null ? true : delete _globalShareScopeMap_insId_shareScope_shareName[shareVersion];
                    });
                    CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(remoteInsIndex, 1);
                }
                var { hostGlobalSnapshot } = getGlobalRemoteInfo(remote, host);
                if (hostGlobalSnapshot) {
                    var remoteKey = hostGlobalSnapshot && "remotesInfo" in hostGlobalSnapshot && hostGlobalSnapshot.remotesInfo && getInfoWithoutType(hostGlobalSnapshot.remotesInfo, remote.name).key;
                    if (remoteKey) {
                        delete hostGlobalSnapshot.remotesInfo[remoteKey];
                        if (Boolean(Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey])) {
                            delete Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey];
                        }
                    }
                }
                host.moduleCache.delete(remote.name);
            }
        } catch (err) {
            logger.log("removeRemote fail: ", err);
        }
    }
    constructor(host){
        this.hooks = new PluginSystem({
            beforeRegisterRemote: new SyncWaterfallHook("beforeRegisterRemote"),
            registerRemote: new SyncWaterfallHook("registerRemote"),
            beforeRequest: new AsyncWaterfallHook("beforeRequest"),
            onLoad: new AsyncHook("onLoad"),
            handlePreloadModule: new SyncHook("handlePreloadModule"),
            errorLoadRemote: new AsyncHook("errorLoadRemote"),
            beforePreloadRemote: new AsyncHook("beforePreloadRemote"),
            generatePreloadAssets: new AsyncHook("generatePreloadAssets"),
            // not used yet
            afterPreloadRemote: new AsyncHook(),
            loadEntry: new AsyncHook()
        });
        this.host = host;
        this.idToRemoteMap = {};
    }
}
var USE_SNAPSHOT =  true ? !false : 0; // Default to true (use snapshot) when not explicitly defined
class FederationHost {
    initOptions(userOptions) {
        this.registerPlugins(userOptions.plugins);
        var options = this.formatOptions(this.options, userOptions);
        this.options = options;
        return options;
    }
    loadShare(pkgName, extraOptions) {
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            return _this.sharedHandler.loadShare(pkgName, extraOptions);
        })();
    }
    // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
    // 1. If the loaded shared already exists globally, then it will be reused
    // 2. If lib exists in local shared, it will be used directly
    // 3. If the local get returns something other than Promise, then it will be used directly
    loadShareSync(pkgName, extraOptions) {
        return this.sharedHandler.loadShareSync(pkgName, extraOptions);
    }
    initializeSharing() {
        var shareScopeName = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : DEFAULT_SCOPE, extraOptions = arguments.length > 1 ? arguments[1] : void 0;
        return this.sharedHandler.initializeSharing(shareScopeName, extraOptions);
    }
    initRawContainer(name, url, container) {
        var remoteInfo = getRemoteInfo({
            name,
            entry: url
        });
        var module = new Module({
            host: this,
            remoteInfo
        });
        module.remoteEntryExports = container;
        this.moduleCache.set(name, module);
        return module;
    }
    // eslint-disable-next-line max-lines-per-function
    // eslint-disable-next-line @typescript-eslint/member-ordering
    loadRemote(id, options) {
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            return _this.remoteHandler.loadRemote(id, options);
        })();
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    preloadRemote(preloadOptions) {
        var _this = this;
        return (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_2__._)(function*() {
            return _this.remoteHandler.preloadRemote(preloadOptions);
        })();
    }
    initShareScopeMap(scopeName, shareScope) {
        var extraOptions = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        this.sharedHandler.initShareScopeMap(scopeName, shareScope, extraOptions);
    }
    formatOptions(globalOptions, userOptions) {
        var { shared } = formatShareConfigs(globalOptions, userOptions);
        var { userOptions: userOptionsRes, options: globalOptionsRes } = this.hooks.lifecycle.beforeInit.emit({
            origin: this,
            userOptions,
            options: globalOptions,
            shareInfo: shared
        });
        var remotes = this.remoteHandler.formatAndRegisterRemote(globalOptionsRes, userOptionsRes);
        var { shared: handledShared } = this.sharedHandler.registerShared(globalOptionsRes, userOptionsRes);
        var plugins = [
            ...globalOptionsRes.plugins
        ];
        if (userOptionsRes.plugins) {
            userOptionsRes.plugins.forEach((plugin)=>{
                if (!plugins.includes(plugin)) {
                    plugins.push(plugin);
                }
            });
        }
        var optionsRes = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, globalOptions, userOptions, {
            plugins,
            remotes,
            shared: handledShared
        });
        this.hooks.lifecycle.init.emit({
            origin: this,
            options: optionsRes
        });
        return optionsRes;
    }
    registerPlugins(plugins) {
        var pluginRes = registerPlugins(plugins, [
            this.hooks,
            this.remoteHandler.hooks,
            this.sharedHandler.hooks,
            this.snapshotHandler.hooks,
            this.loaderHook,
            this.bridgeHook
        ]);
        // Merge plugin
        this.options.plugins = this.options.plugins.reduce((res, plugin)=>{
            if (!plugin) return res;
            if (res && !res.find((item)=>item.name === plugin.name)) {
                res.push(plugin);
            }
            return res;
        }, pluginRes || []);
    }
    registerRemotes(remotes, options) {
        return this.remoteHandler.registerRemotes(remotes, options);
    }
    constructor(userOptions){
        this.hooks = new PluginSystem({
            beforeInit: new SyncWaterfallHook("beforeInit"),
            init: new SyncHook(),
            // maybe will change, temporarily for internal use only
            beforeInitContainer: new AsyncWaterfallHook("beforeInitContainer"),
            // maybe will change, temporarily for internal use only
            initContainer: new AsyncWaterfallHook("initContainer")
        });
        this.version = "0.15.0";
        this.moduleCache = new Map();
        this.loaderHook = new PluginSystem({
            // FIXME: may not be suitable , not open to the public yet
            getModuleInfo: new SyncHook(),
            createScript: new SyncHook(),
            createLink: new SyncHook(),
            fetch: new AsyncHook(),
            loadEntryError: new AsyncHook(),
            getModuleFactory: new AsyncHook()
        });
        this.bridgeHook = new PluginSystem({
            beforeBridgeRender: new SyncHook(),
            afterBridgeRender: new SyncHook(),
            beforeBridgeDestroy: new SyncHook(),
            afterBridgeDestroy: new SyncHook()
        });
        var plugins = USE_SNAPSHOT ? [
            snapshotPlugin(),
            generatePreloadAssetsPlugin()
        ] : [];
        // TODO: Validate the details of the options
        // Initialize options with default values
        var defaultOptions = {
            id: getBuilderId(),
            name: userOptions.name,
            plugins,
            remotes: [],
            shared: {},
            inBrowser: (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isBrowserEnv)()
        };
        this.name = userOptions.name;
        this.options = defaultOptions;
        this.snapshotHandler = new SnapshotHandler(this);
        this.sharedHandler = new SharedHandler(this);
        this.remoteHandler = new RemoteHandler(this);
        this.shareScopeMap = this.sharedHandler.shareScopeMap;
        this.registerPlugins([
            ...defaultOptions.plugins,
            ...userOptions.plugins || []
        ]);
        this.options = this.formatOptions(defaultOptions, userOptions);
    }
}
var index = /*#__PURE__*/ Object.freeze({
    __proto__: null
});



/***/ }),

/***/ "../../packages/runtime-core/dist/polyfills.esm.js":
/*!*********************************************************!*\
  !*** ../../packages/runtime-core/dist/polyfills.esm.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _: function() { return /* binding */ _extends; },
/* harmony export */   a: function() { return /* binding */ _object_without_properties_loose; }
/* harmony export */ });
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}



/***/ }),

/***/ "../../packages/runtime/dist/index.esm.js":
/*!************************************************!*\
  !*** ../../packages/runtime/dist/index.esm.js ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FederationHost: function() { return /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.FederationHost; },
/* harmony export */   Module: function() { return /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Module; },
/* harmony export */   getInstance: function() { return /* binding */ getInstance; },
/* harmony export */   getRemoteEntry: function() { return /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getRemoteEntry; },
/* harmony export */   getRemoteInfo: function() { return /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getRemoteInfo; },
/* harmony export */   init: function() { return /* binding */ init; },
/* harmony export */   loadRemote: function() { return /* binding */ loadRemote; },
/* harmony export */   loadScript: function() { return /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.loadScript; },
/* harmony export */   loadScriptNode: function() { return /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.loadScriptNode; },
/* harmony export */   loadShare: function() { return /* binding */ loadShare; },
/* harmony export */   loadShareSync: function() { return /* binding */ loadShareSync; },
/* harmony export */   preloadRemote: function() { return /* binding */ preloadRemote; },
/* harmony export */   registerGlobalPlugins: function() { return /* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.registerGlobalPlugins; },
/* harmony export */   registerPlugins: function() { return /* binding */ registerPlugins; },
/* harmony export */   registerRemotes: function() { return /* binding */ registerRemotes; }
/* harmony export */ });
/* harmony import */ var _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @module-federation/runtime-core */ "../../packages/runtime-core/dist/index.esm.js");
/* harmony import */ var _utils_esm_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.esm.js */ "../../packages/runtime/dist/utils.esm.js");



var FederationInstance = null;
function init(options) {
    // Retrieve the same instance with the same name
    var instance = (0,_utils_esm_js__WEBPACK_IMPORTED_MODULE_1__.g)(options.name, options.version);
    if (!instance) {
        // Retrieve debug constructor
        var FederationConstructor = (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getGlobalFederationConstructor)() || _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.FederationHost;
        FederationInstance = new FederationConstructor(options);
        (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.setGlobalFederationInstance)(FederationInstance);
        return FederationInstance;
    } else {
        // Merge options
        instance.initOptions(options);
        if (!FederationInstance) {
            FederationInstance = instance;
        }
        return instance;
    }
}
function loadRemote() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    var loadRemote1 = FederationInstance.loadRemote;
    // eslint-disable-next-line prefer-spread
    return loadRemote1.apply(FederationInstance, args);
}
function loadShare() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    // eslint-disable-next-line prefer-spread
    var loadShare1 = FederationInstance.loadShare;
    return loadShare1.apply(FederationInstance, args);
}
function loadShareSync() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    var loadShareSync1 = FederationInstance.loadShareSync;
    // eslint-disable-next-line prefer-spread
    return loadShareSync1.apply(FederationInstance, args);
}
function preloadRemote() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    // eslint-disable-next-line prefer-spread
    return FederationInstance.preloadRemote.apply(FederationInstance, args);
}
function registerRemotes() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    // eslint-disable-next-line prefer-spread
    return FederationInstance.registerRemotes.apply(FederationInstance, args);
}
function registerPlugins() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    // eslint-disable-next-line prefer-spread
    return FederationInstance.registerPlugins.apply(FederationInstance, args);
}
function getInstance() {
    return FederationInstance;
}
// Inject for debug
(0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.setGlobalFederationConstructor)(_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.FederationHost);



/***/ }),

/***/ "../../packages/runtime/dist/utils.esm.js":
/*!************************************************!*\
  !*** ../../packages/runtime/dist/utils.esm.js ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   g: function() { return /* binding */ getGlobalFederationInstance; }
/* harmony export */ });
/* harmony import */ var _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @module-federation/runtime-core */ "../../packages/runtime-core/dist/index.esm.js");

// injected by bundler, so it can not use runtime-core stuff
function getBuilderId() {
    //@ts-ignore
    return  true ? "home_app:1.0.0" : 0;
}
function getGlobalFederationInstance(name, version) {
    var buildId = getBuilderId();
    return _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.CurrentGlobal.__FEDERATION__.__INSTANCES__.find((GMInstance)=>{
        if (buildId && GMInstance.options.id === getBuilderId()) {
            return true;
        }
        if (GMInstance.options.name === name && !GMInstance.options.version && !version) {
            return true;
        }
        if (GMInstance.options.name === name && version && GMInstance.options.version === version) {
            return true;
        }
        return false;
    });
}



/***/ }),

/***/ "../../packages/sdk/dist/index.esm.js":
/*!********************************************!*\
  !*** ../../packages/sdk/dist/index.esm.js ***!
  \********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BROWSER_LOG_KEY: function() { return /* binding */ BROWSER_LOG_KEY; },
/* harmony export */   ENCODE_NAME_PREFIX: function() { return /* binding */ ENCODE_NAME_PREFIX; },
/* harmony export */   EncodedNameTransformMap: function() { return /* binding */ EncodedNameTransformMap; },
/* harmony export */   FederationModuleManifest: function() { return /* binding */ FederationModuleManifest; },
/* harmony export */   MANIFEST_EXT: function() { return /* binding */ MANIFEST_EXT; },
/* harmony export */   MFModuleType: function() { return /* binding */ MFModuleType; },
/* harmony export */   MFPrefetchCommon: function() { return /* binding */ MFPrefetchCommon; },
/* harmony export */   MODULE_DEVTOOL_IDENTIFIER: function() { return /* binding */ MODULE_DEVTOOL_IDENTIFIER; },
/* harmony export */   ManifestFileName: function() { return /* binding */ ManifestFileName; },
/* harmony export */   NameTransformMap: function() { return /* binding */ NameTransformMap; },
/* harmony export */   NameTransformSymbol: function() { return /* binding */ NameTransformSymbol; },
/* harmony export */   SEPARATOR: function() { return /* binding */ SEPARATOR; },
/* harmony export */   StatsFileName: function() { return /* binding */ StatsFileName; },
/* harmony export */   TEMP_DIR: function() { return /* binding */ TEMP_DIR; },
/* harmony export */   assert: function() { return /* binding */ assert; },
/* harmony export */   composeKeyWithSeparator: function() { return /* binding */ composeKeyWithSeparator; },
/* harmony export */   containerPlugin: function() { return /* binding */ ContainerPlugin; },
/* harmony export */   containerReferencePlugin: function() { return /* binding */ ContainerReferencePlugin; },
/* harmony export */   createLink: function() { return /* binding */ createLink; },
/* harmony export */   createLogger: function() { return /* binding */ createLogger; },
/* harmony export */   createScript: function() { return /* binding */ createScript; },
/* harmony export */   createScriptNode: function() { return /* binding */ createScriptNode; },
/* harmony export */   decodeName: function() { return /* binding */ decodeName; },
/* harmony export */   encodeName: function() { return /* binding */ encodeName; },
/* harmony export */   error: function() { return /* binding */ error; },
/* harmony export */   generateExposeFilename: function() { return /* binding */ generateExposeFilename; },
/* harmony export */   generateShareFilename: function() { return /* binding */ generateShareFilename; },
/* harmony export */   generateSnapshotFromManifest: function() { return /* binding */ generateSnapshotFromManifest; },
/* harmony export */   getProcessEnv: function() { return /* binding */ getProcessEnv; },
/* harmony export */   getResourceUrl: function() { return /* binding */ getResourceUrl; },
/* harmony export */   inferAutoPublicPath: function() { return /* binding */ inferAutoPublicPath; },
/* harmony export */   isBrowserEnv: function() { return /* binding */ isBrowserEnv; },
/* harmony export */   isDebugMode: function() { return /* binding */ isDebugMode; },
/* harmony export */   isManifestProvider: function() { return /* binding */ isManifestProvider; },
/* harmony export */   isReactNativeEnv: function() { return /* binding */ isReactNativeEnv; },
/* harmony export */   isRequiredVersion: function() { return /* binding */ isRequiredVersion; },
/* harmony export */   isStaticResourcesEqual: function() { return /* binding */ isStaticResourcesEqual; },
/* harmony export */   loadScript: function() { return /* binding */ loadScript; },
/* harmony export */   loadScriptNode: function() { return /* binding */ loadScriptNode; },
/* harmony export */   logger: function() { return /* binding */ logger; },
/* harmony export */   moduleFederationPlugin: function() { return /* binding */ ModuleFederationPlugin; },
/* harmony export */   normalizeOptions: function() { return /* binding */ normalizeOptions; },
/* harmony export */   parseEntry: function() { return /* binding */ parseEntry; },
/* harmony export */   safeToString: function() { return /* binding */ safeToString; },
/* harmony export */   safeWrapper: function() { return /* binding */ safeWrapper; },
/* harmony export */   sharePlugin: function() { return /* binding */ SharePlugin; },
/* harmony export */   simpleJoinRemoteEntry: function() { return /* binding */ simpleJoinRemoteEntry; },
/* harmony export */   warn: function() { return /* binding */ warn; }
/* harmony export */ });
/* harmony import */ var _swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @swc/helpers/_/_async_to_generator */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/esm/_async_to_generator.js");
/* harmony import */ var _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfills.esm.js */ "../../packages/sdk/dist/polyfills.esm.js");
/* provided dependency */ var process = __webpack_require__(/*! process */ "../../node_modules/.pnpm/process@0.11.10/node_modules/process/browser.js");


var FederationModuleManifest = "federation-manifest.json";
var MANIFEST_EXT = ".json";
var BROWSER_LOG_KEY = "FEDERATION_DEBUG";
var NameTransformSymbol = {
    AT: "@",
    HYPHEN: "-",
    SLASH: "/"
};
var NameTransformMap = {
    [NameTransformSymbol.AT]: "scope_",
    [NameTransformSymbol.HYPHEN]: "_",
    [NameTransformSymbol.SLASH]: "__"
};
var EncodedNameTransformMap = {
    [NameTransformMap[NameTransformSymbol.AT]]: NameTransformSymbol.AT,
    [NameTransformMap[NameTransformSymbol.HYPHEN]]: NameTransformSymbol.HYPHEN,
    [NameTransformMap[NameTransformSymbol.SLASH]]: NameTransformSymbol.SLASH
};
var SEPARATOR = ":";
var ManifestFileName = "mf-manifest.json";
var StatsFileName = "mf-stats.json";
var MFModuleType = {
    NPM: "npm",
    APP: "app"
};
var MODULE_DEVTOOL_IDENTIFIER = "__MF_DEVTOOLS_MODULE_INFO__";
var ENCODE_NAME_PREFIX = "ENCODE_NAME_PREFIX";
var TEMP_DIR = ".federation";
var MFPrefetchCommon = {
    identifier: "MFDataPrefetch",
    globalKey: "__PREFETCH__",
    library: "mf-data-prefetch",
    exportsKey: "__PREFETCH_EXPORTS__",
    fileName: "bootstrap.js"
};
var ContainerPlugin = /*#__PURE__*/ Object.freeze({
    __proto__: null
});
var ContainerReferencePlugin = /*#__PURE__*/ Object.freeze({
    __proto__: null
});
var ModuleFederationPlugin = /*#__PURE__*/ Object.freeze({
    __proto__: null
});
var SharePlugin = /*#__PURE__*/ Object.freeze({
    __proto__: null
});
function isBrowserEnv() {
    return  true && typeof window.document !== "undefined";
}
function isReactNativeEnv() {
    var _navigator;
    return typeof navigator !== "undefined" && ((_navigator = navigator) == null ? void 0 : _navigator.product) === "ReactNative";
}
function isBrowserDebug() {
    try {
        if (isBrowserEnv() && window.localStorage) {
            return Boolean(localStorage.getItem(BROWSER_LOG_KEY));
        }
    } catch (error1) {
        return false;
    }
    return false;
}
function isDebugMode() {
    if (typeof process !== "undefined" && process.env && process.env["FEDERATION_DEBUG"]) {
        return Boolean(process.env["FEDERATION_DEBUG"]);
    }
    if (typeof FEDERATION_DEBUG !== "undefined" && Boolean(FEDERATION_DEBUG)) {
        return true;
    }
    return isBrowserDebug();
}
var getProcessEnv = function getProcessEnv1() {
    return typeof process !== "undefined" && process.env ? process.env : {};
};
var LOG_CATEGORY = "[ Federation Runtime ]";
// entry: name:version   version : 1.0.0 | ^1.2.3
// entry: name:entry  entry:  https://localhost:9000/federation-manifest.json
var parseEntry = function(str, devVerOrUrl) {
    var separator = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : SEPARATOR;
    var strSplit = str.split(separator);
    var devVersionOrUrl = getProcessEnv()["NODE_ENV"] === "development" && devVerOrUrl;
    var defaultVersion = "*";
    var isEntry = (s)=>s.startsWith("http") || s.includes(MANIFEST_EXT);
    // Check if the string starts with a type
    if (strSplit.length >= 2) {
        var [name, ...versionOrEntryArr] = strSplit;
        // @name@manifest-url.json
        if (str.startsWith(separator)) {
            name = strSplit.slice(0, 2).join(separator);
            versionOrEntryArr = [
                devVersionOrUrl || strSplit.slice(2).join(separator)
            ];
        }
        var versionOrEntry = devVersionOrUrl || versionOrEntryArr.join(separator);
        if (isEntry(versionOrEntry)) {
            return {
                name,
                entry: versionOrEntry
            };
        } else {
            // Apply version rule
            // devVersionOrUrl => inputVersion => defaultVersion
            return {
                name,
                version: versionOrEntry || defaultVersion
            };
        }
    } else if (strSplit.length === 1) {
        var [name1] = strSplit;
        if (devVersionOrUrl && isEntry(devVersionOrUrl)) {
            return {
                name: name1,
                entry: devVersionOrUrl
            };
        }
        return {
            name: name1,
            version: devVersionOrUrl || defaultVersion
        };
    } else {
        throw "Invalid entry value: ".concat(str);
    }
};
var composeKeyWithSeparator = function composeKeyWithSeparator1() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    if (!args.length) {
        return "";
    }
    return args.reduce((sum, cur)=>{
        if (!cur) {
            return sum;
        }
        if (!sum) {
            return cur;
        }
        return "".concat(sum).concat(SEPARATOR).concat(cur);
    }, "");
};
var encodeName = function encodeName1(name) {
    var prefix = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", withExt = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    try {
        var ext = withExt ? ".js" : "";
        return "".concat(prefix).concat(name.replace(new RegExp("".concat(NameTransformSymbol.AT), "g"), NameTransformMap[NameTransformSymbol.AT]).replace(new RegExp("".concat(NameTransformSymbol.HYPHEN), "g"), NameTransformMap[NameTransformSymbol.HYPHEN]).replace(new RegExp("".concat(NameTransformSymbol.SLASH), "g"), NameTransformMap[NameTransformSymbol.SLASH])).concat(ext);
    } catch (err) {
        throw err;
    }
};
var decodeName = function decodeName1(name, prefix, withExt) {
    try {
        var decodedName = name;
        if (prefix) {
            if (!decodedName.startsWith(prefix)) {
                return decodedName;
            }
            decodedName = decodedName.replace(new RegExp(prefix, "g"), "");
        }
        decodedName = decodedName.replace(new RegExp("".concat(NameTransformMap[NameTransformSymbol.AT]), "g"), EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.AT]]).replace(new RegExp("".concat(NameTransformMap[NameTransformSymbol.SLASH]), "g"), EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.SLASH]]).replace(new RegExp("".concat(NameTransformMap[NameTransformSymbol.HYPHEN]), "g"), EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.HYPHEN]]);
        if (withExt) {
            decodedName = decodedName.replace(".js", "");
        }
        return decodedName;
    } catch (err) {
        throw err;
    }
};
var generateExposeFilename = (exposeName, withExt)=>{
    if (!exposeName) {
        return "";
    }
    var expose = exposeName;
    if (expose === ".") {
        expose = "default_export";
    }
    if (expose.startsWith("./")) {
        expose = expose.replace("./", "");
    }
    return encodeName(expose, "__federation_expose_", withExt);
};
var generateShareFilename = (pkgName, withExt)=>{
    if (!pkgName) {
        return "";
    }
    return encodeName(pkgName, "__federation_shared_", withExt);
};
var getResourceUrl = (module, sourceUrl)=>{
    if ("getPublicPath" in module) {
        var publicPath;
        if (!module.getPublicPath.startsWith("function")) {
            publicPath = new Function(module.getPublicPath)();
        } else {
            publicPath = new Function("return " + module.getPublicPath)()();
        }
        return "".concat(publicPath).concat(sourceUrl);
    } else if ("publicPath" in module) {
        if (!isBrowserEnv() && !isReactNativeEnv() && "ssrPublicPath" in module) {
            return "".concat(module.ssrPublicPath).concat(sourceUrl);
        }
        return "".concat(module.publicPath).concat(sourceUrl);
    } else {
        console.warn("Cannot get resource URL. If in debug mode, please ignore.", module, sourceUrl);
        return "";
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
var assert = (condition, msg)=>{
    if (!condition) {
        error(msg);
    }
};
var error = (msg)=>{
    throw new Error("".concat(LOG_CATEGORY, ": ").concat(msg));
};
var warn = (msg)=>{
    console.warn("".concat(LOG_CATEGORY, ": ").concat(msg));
};
function safeToString(info) {
    try {
        return JSON.stringify(info, null, 2);
    } catch (e) {
        return "";
    }
}
// RegExp for version string
var VERSION_PATTERN_REGEXP = /^([\d^=v<>~]|[*xX]$)/;
function isRequiredVersion(str) {
    return VERSION_PATTERN_REGEXP.test(str);
}
var simpleJoinRemoteEntry = (rPath, rName)=>{
    if (!rPath) {
        return rName;
    }
    var transformPath = (str)=>{
        if (str === ".") {
            return "";
        }
        if (str.startsWith("./")) {
            return str.replace("./", "");
        }
        if (str.startsWith("/")) {
            var strWithoutSlash = str.slice(1);
            if (strWithoutSlash.endsWith("/")) {
                return strWithoutSlash.slice(0, -1);
            }
            return strWithoutSlash;
        }
        return str;
    };
    var transformedPath = transformPath(rPath);
    if (!transformedPath) {
        return rName;
    }
    if (transformedPath.endsWith("/")) {
        return "".concat(transformedPath).concat(rName);
    }
    return "".concat(transformedPath, "/").concat(rName);
};
function inferAutoPublicPath(url) {
    return url.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
}
// Priority: overrides > remotes
// eslint-disable-next-line max-lines-per-function
function generateSnapshotFromManifest(manifest) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var _manifest_metaData, _manifest_metaData1;
    var { remotes = {}, overrides = {}, version } = options;
    var remoteSnapshot;
    var getPublicPath = ()=>{
        if ("publicPath" in manifest.metaData) {
            if (manifest.metaData.publicPath === "auto" && version) {
                // use same implementation as publicPath auto runtime module implements
                return inferAutoPublicPath(version);
            }
            return manifest.metaData.publicPath;
        } else {
            return manifest.metaData.getPublicPath;
        }
    };
    var overridesKeys = Object.keys(overrides);
    var remotesInfo = {};
    // If remotes are not provided, only the remotes in the manifest will be read
    if (!Object.keys(remotes).length) {
        var _manifest_remotes;
        remotesInfo = ((_manifest_remotes = manifest.remotes) == null ? void 0 : _manifest_remotes.reduce((res, next)=>{
            var matchedVersion;
            var name = next.federationContainerName;
            // overrides have higher priority
            if (overridesKeys.includes(name)) {
                matchedVersion = overrides[name];
            } else {
                if ("version" in next) {
                    matchedVersion = next.version;
                } else {
                    matchedVersion = next.entry;
                }
            }
            res[name] = {
                matchedVersion
            };
            return res;
        }, {})) || {};
    }
    // If remotes (deploy scenario) are specified, they need to be traversed again
    Object.keys(remotes).forEach((key)=>remotesInfo[key] = {
            // overrides will override dependencies
            matchedVersion: overridesKeys.includes(key) ? overrides[key] : remotes[key]
        });
    var { remoteEntry: { path: remoteEntryPath, name: remoteEntryName, type: remoteEntryType }, types: remoteTypes, buildInfo: { buildVersion }, globalName, ssrRemoteEntry } = manifest.metaData;
    var { exposes } = manifest;
    var basicRemoteSnapshot = {
        version: version ? version : "",
        buildVersion,
        globalName,
        remoteEntry: simpleJoinRemoteEntry(remoteEntryPath, remoteEntryName),
        remoteEntryType,
        remoteTypes: simpleJoinRemoteEntry(remoteTypes.path, remoteTypes.name),
        remoteTypesZip: remoteTypes.zip || "",
        remoteTypesAPI: remoteTypes.api || "",
        remotesInfo,
        shared: manifest == null ? void 0 : manifest.shared.map((item)=>({
                assets: item.assets,
                sharedName: item.name,
                version: item.version
            })),
        modules: exposes == null ? void 0 : exposes.map((expose)=>({
                moduleName: expose.name,
                modulePath: expose.path,
                assets: expose.assets
            }))
    };
    if ((_manifest_metaData = manifest.metaData) == null ? void 0 : _manifest_metaData.prefetchInterface) {
        var prefetchInterface = manifest.metaData.prefetchInterface;
        basicRemoteSnapshot = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, basicRemoteSnapshot, {
            prefetchInterface
        });
    }
    if ((_manifest_metaData1 = manifest.metaData) == null ? void 0 : _manifest_metaData1.prefetchEntry) {
        var { path, name, type } = manifest.metaData.prefetchEntry;
        basicRemoteSnapshot = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, basicRemoteSnapshot, {
            prefetchEntry: simpleJoinRemoteEntry(path, name),
            prefetchEntryType: type
        });
    }
    if ("publicPath" in manifest.metaData) {
        remoteSnapshot = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, basicRemoteSnapshot, {
            publicPath: getPublicPath(),
            ssrPublicPath: manifest.metaData.ssrPublicPath
        });
    } else {
        remoteSnapshot = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, basicRemoteSnapshot, {
            getPublicPath: getPublicPath()
        });
    }
    if (ssrRemoteEntry) {
        var fullSSRRemoteEntry = simpleJoinRemoteEntry(ssrRemoteEntry.path, ssrRemoteEntry.name);
        remoteSnapshot.ssrRemoteEntry = fullSSRRemoteEntry;
        remoteSnapshot.ssrRemoteEntryType = ssrRemoteEntry.type || "commonjs-module";
    }
    return remoteSnapshot;
}
function isManifestProvider(moduleInfo) {
    if ("remoteEntry" in moduleInfo && moduleInfo.remoteEntry.includes(MANIFEST_EXT)) {
        return true;
    } else {
        return false;
    }
}
var PREFIX = "[ Module Federation ]";
var Logger = class Logger {
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    log() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        console.log(this.prefix, ...args);
    }
    warn() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        console.log(this.prefix, ...args);
    }
    error() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        console.log(this.prefix, ...args);
    }
    success() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        console.log(this.prefix, ...args);
    }
    info() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        console.log(this.prefix, ...args);
    }
    ready() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        console.log(this.prefix, ...args);
    }
    debug() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        if (isDebugMode()) {
            console.log(this.prefix, ...args);
        }
    }
    constructor(prefix){
        this.prefix = prefix;
    }
};
function createLogger(prefix) {
    return new Logger(prefix);
}
var logger = createLogger(PREFIX);
function safeWrapper(callback, disableWarn) {
    return _safeWrapper.apply(this, arguments);
}
function _safeWrapper() {
    _safeWrapper = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*(callback, disableWarn) {
        try {
            var res = yield callback();
            return res;
        } catch (e) {
            !disableWarn && warn(e);
            return;
        }
    });
    return _safeWrapper.apply(this, arguments);
}
function isStaticResourcesEqual(url1, url2) {
    var REG_EXP = /^(https?:)?\/\//i;
    // Transform url1 and url2 into relative paths
    var relativeUrl1 = url1.replace(REG_EXP, "").replace(/\/$/, "");
    var relativeUrl2 = url2.replace(REG_EXP, "").replace(/\/$/, "");
    // Check if the relative paths are identical
    return relativeUrl1 === relativeUrl2;
}
function createScript(info) {
    // Retrieve the existing script element by its src attribute
    var script = null;
    var needAttach = true;
    var timeout = 20000;
    var timeoutId;
    var scripts = document.getElementsByTagName("script");
    for(var i = 0; i < scripts.length; i++){
        var s = scripts[i];
        var scriptSrc = s.getAttribute("src");
        if (scriptSrc && isStaticResourcesEqual(scriptSrc, info.url)) {
            script = s;
            needAttach = false;
            break;
        }
    }
    if (!script) {
        var attrs = info.attrs;
        script = document.createElement("script");
        script.type = (attrs == null ? void 0 : attrs["type"]) === "module" ? "module" : "text/javascript";
        var createScriptRes = undefined;
        if (info.createScriptHook) {
            createScriptRes = info.createScriptHook(info.url, info.attrs);
            if (createScriptRes instanceof HTMLScriptElement) {
                script = createScriptRes;
            } else if (typeof createScriptRes === "object") {
                if ("script" in createScriptRes && createScriptRes.script) {
                    script = createScriptRes.script;
                }
                if ("timeout" in createScriptRes && createScriptRes.timeout) {
                    timeout = createScriptRes.timeout;
                }
            }
        }
        if (!script.src) {
            script.src = info.url;
        }
        if (attrs && !createScriptRes) {
            Object.keys(attrs).forEach((name)=>{
                if (script) {
                    if (name === "async" || name === "defer") {
                        script[name] = attrs[name];
                    // Attributes that do not exist are considered overridden
                    } else if (!script.getAttribute(name)) {
                        script.setAttribute(name, attrs[name]);
                    }
                }
            });
        }
    }
    var onScriptComplete = function() {
        var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*(prev, event) {
            clearTimeout(timeoutId);
            var onScriptCompleteCallback = ()=>{
                if ((event == null ? void 0 : event.type) === "error") {
                    (info == null ? void 0 : info.onErrorCallback) && (info == null ? void 0 : info.onErrorCallback(event));
                } else {
                    (info == null ? void 0 : info.cb) && (info == null ? void 0 : info.cb());
                }
            };
            // Prevent memory leaks in IE.
            if (script) {
                script.onerror = null;
                script.onload = null;
                safeWrapper(()=>{
                    var { needDeleteScript = true } = info;
                    if (needDeleteScript) {
                        (script == null ? void 0 : script.parentNode) && script.parentNode.removeChild(script);
                    }
                });
                if (prev && typeof prev === "function") {
                    var result = prev(event);
                    if (result instanceof Promise) {
                        var res = yield result;
                        onScriptCompleteCallback();
                        return res;
                    }
                    onScriptCompleteCallback();
                    return result;
                }
            }
            onScriptCompleteCallback();
        });
        return function onScriptComplete(prev, event) {
            return _ref.apply(this, arguments);
        };
    }();
    script.onerror = onScriptComplete.bind(null, script.onerror);
    script.onload = onScriptComplete.bind(null, script.onload);
    timeoutId = setTimeout(()=>{
        onScriptComplete(null, new Error('Remote script "'.concat(info.url, '" time-outed.')));
    }, timeout);
    return {
        script,
        needAttach
    };
}
function createLink(info) {
    // <link rel="preload" href="script.js" as="script">
    // Retrieve the existing script element by its src attribute
    var link = null;
    var needAttach = true;
    var links = document.getElementsByTagName("link");
    for(var i = 0; i < links.length; i++){
        var l = links[i];
        var linkHref = l.getAttribute("href");
        var linkRel = l.getAttribute("rel");
        if (linkHref && isStaticResourcesEqual(linkHref, info.url) && linkRel === info.attrs["rel"]) {
            link = l;
            needAttach = false;
            break;
        }
    }
    if (!link) {
        link = document.createElement("link");
        link.setAttribute("href", info.url);
        var createLinkRes = undefined;
        var attrs = info.attrs;
        if (info.createLinkHook) {
            createLinkRes = info.createLinkHook(info.url, attrs);
            if (createLinkRes instanceof HTMLLinkElement) {
                link = createLinkRes;
            }
        }
        if (attrs && !createLinkRes) {
            Object.keys(attrs).forEach((name)=>{
                if (link && !link.getAttribute(name)) {
                    link.setAttribute(name, attrs[name]);
                }
            });
        }
    }
    var onLinkComplete = (prev, event)=>{
        var onLinkCompleteCallback = ()=>{
            if ((event == null ? void 0 : event.type) === "error") {
                (info == null ? void 0 : info.onErrorCallback) && (info == null ? void 0 : info.onErrorCallback(event));
            } else {
                (info == null ? void 0 : info.cb) && (info == null ? void 0 : info.cb());
            }
        };
        // Prevent memory leaks in IE.
        if (link) {
            link.onerror = null;
            link.onload = null;
            safeWrapper(()=>{
                var { needDeleteLink = true } = info;
                if (needDeleteLink) {
                    (link == null ? void 0 : link.parentNode) && link.parentNode.removeChild(link);
                }
            });
            if (prev) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                var res = prev(event);
                onLinkCompleteCallback();
                return res;
            }
        }
        onLinkCompleteCallback();
    };
    link.onerror = onLinkComplete.bind(null, link.onerror);
    link.onload = onLinkComplete.bind(null, link.onload);
    return {
        link,
        needAttach
    };
}
function loadScript(url, info) {
    var { attrs = {}, createScriptHook } = info;
    return new Promise((resolve, reject)=>{
        var { script, needAttach } = createScript({
            url,
            cb: resolve,
            onErrorCallback: reject,
            attrs: (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({
                fetchpriority: "high"
            }, attrs),
            createScriptHook,
            needDeleteScript: true
        });
        needAttach && document.head.appendChild(script);
    });
}
function importNodeModule(name) {
    if (!name) {
        throw new Error("import specifier is required");
    }
    var importModule = new Function("name", "return import(name)");
    return importModule(name).then((res)=>res).catch((error1)=>{
        console.error("Error importing module ".concat(name, ":"), error1);
        throw error1;
    });
}
var loadNodeFetch = function() {
    var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*() {
        var fetchModule = yield importNodeModule("node-fetch");
        return fetchModule.default || fetchModule;
    });
    return function loadNodeFetch1() {
        return _ref.apply(this, arguments);
    };
}();
var lazyLoaderHookFetch = function() {
    var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*(input, init, loaderHook) {
        var hook = (url, init)=>{
            return loaderHook.lifecycle.fetch.emit(url, init);
        };
        var res = yield hook(input, init || {});
        if (!res || !(res instanceof Response)) {
            var fetchFunction = typeof fetch === "undefined" ? yield loadNodeFetch() : fetch;
            return fetchFunction(input, init || {});
        }
        return res;
    });
    return function lazyLoaderHookFetch1(input, init, loaderHook) {
        return _ref.apply(this, arguments);
    };
}();
var createScriptNode = typeof ENV_TARGET === "undefined" || ENV_TARGET !== "web" ? (url, cb, attrs, loaderHook)=>{
    if (loaderHook == null ? void 0 : loaderHook.createScriptHook) {
        var hookResult = loaderHook.createScriptHook(url);
        if (hookResult && typeof hookResult === "object" && "url" in hookResult) {
            url = hookResult.url;
        }
    }
    var urlObj;
    try {
        urlObj = new URL(url);
    } catch (e) {
        console.error("Error constructing URL:", e);
        cb(new Error("Invalid URL: ".concat(e)));
        return;
    }
    var getFetch = function() {
        var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*() {
            if (loaderHook == null ? void 0 : loaderHook.fetch) {
                return (input, init)=>lazyLoaderHookFetch(input, init, loaderHook);
            }
            return typeof fetch === "undefined" ? loadNodeFetch() : fetch;
        });
        return function getFetch() {
            return _ref.apply(this, arguments);
        };
    }();
    var handleScriptFetch = function() {
        var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*(f, urlObj) {
            try {
                var _vm_constants;
                var res = yield f(urlObj.href);
                var data = yield res.text();
                var [path, vm] = yield Promise.all([
                    importNodeModule("path"),
                    importNodeModule("vm")
                ]);
                var scriptContext = {
                    exports: {},
                    module: {
                        exports: {}
                    }
                };
                var urlDirname = urlObj.pathname.split("/").slice(0, -1).join("/");
                var filename = path.basename(urlObj.pathname);
                var _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER;
                var script = new vm.Script("(function(exports, module, require, __dirname, __filename) {".concat(data, "\n})"), {
                    filename,
                    importModuleDynamically: (_vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER = (_vm_constants = vm.constants) == null ? void 0 : _vm_constants.USE_MAIN_CONTEXT_DEFAULT_LOADER) != null ? _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER : importNodeModule
                });
                script.runInThisContext()(scriptContext.exports, scriptContext.module, eval("require"), urlDirname, filename);
                var exportedInterface = scriptContext.module.exports || scriptContext.exports;
                if (attrs && exportedInterface && attrs["globalName"]) {
                    var container = exportedInterface[attrs["globalName"]] || exportedInterface;
                    cb(undefined, container);
                    return;
                }
                cb(undefined, exportedInterface);
            } catch (e) {
                cb(e instanceof Error ? e : new Error("Script execution error: ".concat(e)));
            }
        });
        return function handleScriptFetch(f, urlObj) {
            return _ref.apply(this, arguments);
        };
    }();
    getFetch().then(function() {
        var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*(f) {
            if ((attrs == null ? void 0 : attrs["type"]) === "esm" || (attrs == null ? void 0 : attrs["type"]) === "module") {
                return loadModule(urlObj.href, {
                    fetch: f,
                    vm: yield importNodeModule("vm")
                }).then(function() {
                    var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*(module) {
                        yield module.evaluate();
                        cb(undefined, module.namespace);
                    });
                    return function(module) {
                        return _ref.apply(this, arguments);
                    };
                }()).catch((e)=>{
                    cb(e instanceof Error ? e : new Error("Script execution error: ".concat(e)));
                });
            }
            handleScriptFetch(f, urlObj);
        });
        return function(f) {
            return _ref.apply(this, arguments);
        };
    }()).catch((err)=>{
        cb(err);
    });
} : (url, cb, attrs, loaderHook)=>{
    cb(new Error("createScriptNode is disabled in non-Node.js environment"));
};
var loadScriptNode = typeof ENV_TARGET === "undefined" || ENV_TARGET !== "web" ? (url, info)=>{
    return new Promise((resolve, reject)=>{
        createScriptNode(url, (error1, scriptContext)=>{
            if (error1) {
                reject(error1);
            } else {
                var _info_attrs, _info_attrs1;
                var remoteEntryKey = (info == null ? void 0 : (_info_attrs = info.attrs) == null ? void 0 : _info_attrs["globalName"]) || "__FEDERATION_".concat(info == null ? void 0 : (_info_attrs1 = info.attrs) == null ? void 0 : _info_attrs1["name"], ":custom__");
                var entryExports = globalThis[remoteEntryKey] = scriptContext;
                resolve(entryExports);
            }
        }, info.attrs, info.loaderHook);
    });
} : (url, info)=>{
    throw new Error("loadScriptNode is disabled in non-Node.js environment");
};
function loadModule(url, options) {
    return _loadModule.apply(this, arguments);
}
function _loadModule() {
    _loadModule = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*(url, options) {
        var { fetch: fetch1, vm } = options;
        var response = yield fetch1(url);
        var code = yield response.text();
        var module = new vm.SourceTextModule(code, {
            // @ts-ignore
            importModuleDynamically: function() {
                var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*(specifier, script) {
                    var resolvedUrl = new URL(specifier, url).href;
                    return loadModule(resolvedUrl, options);
                });
                return function(specifier, script) {
                    return _ref.apply(this, arguments);
                };
            }()
        });
        yield module.link(function() {
            var _ref = (0,_swc_helpers_async_to_generator__WEBPACK_IMPORTED_MODULE_1__._)(function*(specifier) {
                var resolvedUrl = new URL(specifier, url).href;
                var module = yield loadModule(resolvedUrl, options);
                return module;
            });
            return function(specifier) {
                return _ref.apply(this, arguments);
            };
        }());
        return module;
    });
    return _loadModule.apply(this, arguments);
}
function normalizeOptions(enableDefault, defaultOptions, key) {
    return function(options) {
        if (options === false) {
            return false;
        }
        if (typeof options === "undefined") {
            if (enableDefault) {
                return defaultOptions;
            } else {
                return false;
            }
        }
        if (options === true) {
            return defaultOptions;
        }
        if (options && typeof options === "object") {
            return (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, defaultOptions, options);
        }
        throw new Error("Unexpected type for `".concat(key, "`, expect boolean/undefined/object, got: ").concat(typeof options));
    };
}



/***/ }),

/***/ "../../packages/sdk/dist/polyfills.esm.js":
/*!************************************************!*\
  !*** ../../packages/sdk/dist/polyfills.esm.js ***!
  \************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _: function() { return /* binding */ _extends; }
/* harmony export */ });
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}



/***/ }),

/***/ "../../packages/webpack-bundler-runtime/dist/constant.esm.js":
/*!*******************************************************************!*\
  !*** ../../packages/webpack-bundler-runtime/dist/constant.esm.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FEDERATION_SUPPORTED_TYPES: function() { return /* binding */ FEDERATION_SUPPORTED_TYPES; }
/* harmony export */ });
var FEDERATION_SUPPORTED_TYPES = [
    "script"
];



/***/ }),

/***/ "../../packages/webpack-bundler-runtime/dist/index.esm.js":
/*!****************************************************************!*\
  !*** ../../packages/webpack-bundler-runtime/dist/index.esm.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ federation; }
/* harmony export */ });
/* harmony import */ var _module_federation_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @module-federation/runtime */ "../../packages/runtime/dist/index.esm.js");
/* harmony import */ var _constant_esm_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constant.esm.js */ "../../packages/webpack-bundler-runtime/dist/constant.esm.js");
/* harmony import */ var _module_federation_sdk__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @module-federation/sdk */ "../../packages/sdk/dist/index.esm.js");



function attachShareScopeMap(webpackRequire) {
    if (!webpackRequire.S || webpackRequire.federation.hasAttachShareScopeMap || !webpackRequire.federation.instance || !webpackRequire.federation.instance.shareScopeMap) {
        return;
    }
    webpackRequire.S = webpackRequire.federation.instance.shareScopeMap;
    webpackRequire.federation.hasAttachShareScopeMap = true;
}
function remotes(options) {
    var { chunkId, promises, chunkMapping, idToExternalAndNameMapping, webpackRequire, idToRemoteMap } = options;
    attachShareScopeMap(webpackRequire);
    if (webpackRequire.o(chunkMapping, chunkId)) {
        chunkMapping[chunkId].forEach((id)=>{
            var getScope = webpackRequire.R;
            if (!getScope) {
                getScope = [];
            }
            var data = idToExternalAndNameMapping[id];
            var remoteInfos = idToRemoteMap[id];
            // @ts-ignore seems not work
            if (getScope.indexOf(data) >= 0) {
                return;
            }
            // @ts-ignore seems not work
            getScope.push(data);
            if (data.p) {
                return promises.push(data.p);
            }
            var onError = (error)=>{
                if (!error) {
                    error = new Error("Container missing");
                }
                if (typeof error.message === "string") {
                    error.message += '\nwhile loading "'.concat(data[1], '" from ').concat(data[2]);
                }
                webpackRequire.m[id] = ()=>{
                    throw error;
                };
                data.p = 0;
            };
            var handleFunction = (fn, arg1, arg2, d, next, first)=>{
                try {
                    var promise = fn(arg1, arg2);
                    if (promise && promise.then) {
                        var p = promise.then((result)=>next(result, d), onError);
                        if (first) {
                            promises.push(data.p = p);
                        } else {
                            return p;
                        }
                    } else {
                        return next(promise, d, first);
                    }
                } catch (error) {
                    onError(error);
                }
            };
            var onExternal = (external, _, first)=>external ? handleFunction(webpackRequire.I, data[0], 0, external, onInitialized, first) : onError();
            // eslint-disable-next-line no-var
            var onInitialized = (_, external, first)=>handleFunction(external.get, data[1], getScope, 0, onFactory, first);
            // eslint-disable-next-line no-var
            var onFactory = (factory)=>{
                data.p = 1;
                webpackRequire.m[id] = (module)=>{
                    module.exports = factory();
                };
            };
            var onRemoteLoaded = ()=>{
                try {
                    var remoteName = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_2__.decodeName)(remoteInfos[0].name, _module_federation_sdk__WEBPACK_IMPORTED_MODULE_2__.ENCODE_NAME_PREFIX);
                    var remoteModuleName = remoteName + data[1].slice(1);
                    var instance = webpackRequire.federation.instance;
                    var loadRemote = ()=>webpackRequire.federation.instance.loadRemote(remoteModuleName, {
                            loadFactory: false,
                            from: "build"
                        });
                    if (instance.options.shareStrategy === "version-first") {
                        return Promise.all(instance.sharedHandler.initializeSharing(data[0])).then(()=>{
                            return loadRemote();
                        });
                    }
                    return loadRemote();
                } catch (error) {
                    onError(error);
                }
            };
            var useRuntimeLoad = remoteInfos.length === 1 && _constant_esm_js__WEBPACK_IMPORTED_MODULE_1__.FEDERATION_SUPPORTED_TYPES.includes(remoteInfos[0].externalType) && remoteInfos[0].name;
            if (useRuntimeLoad) {
                handleFunction(onRemoteLoaded, data[2], 0, 0, onFactory, 1);
            } else {
                handleFunction(webpackRequire, data[2], 0, 0, onExternal, 1);
            }
        });
    }
}
function consumes(options) {
    var { chunkId, promises, chunkMapping, installedModules, moduleToHandlerMapping, webpackRequire } = options;
    attachShareScopeMap(webpackRequire);
    if (webpackRequire.o(chunkMapping, chunkId)) {
        chunkMapping[chunkId].forEach((id)=>{
            if (webpackRequire.o(installedModules, id)) {
                return promises.push(installedModules[id]);
            }
            var onFactory = (factory)=>{
                installedModules[id] = 0;
                webpackRequire.m[id] = (module)=>{
                    delete webpackRequire.c[id];
                    module.exports = factory();
                };
            };
            var onError = (error)=>{
                delete installedModules[id];
                webpackRequire.m[id] = (module)=>{
                    delete webpackRequire.c[id];
                    throw error;
                };
            };
            try {
                var federationInstance = webpackRequire.federation.instance;
                if (!federationInstance) {
                    throw new Error("Federation instance not found!");
                }
                var { shareKey, getter, shareInfo } = moduleToHandlerMapping[id];
                var promise = federationInstance.loadShare(shareKey, {
                    customShareInfo: shareInfo
                }).then((factory)=>{
                    if (factory === false) {
                        return getter();
                    }
                    return factory;
                });
                if (promise.then) {
                    promises.push(installedModules[id] = promise.then(onFactory).catch(onError));
                } else {
                    // @ts-ignore maintain previous logic
                    onFactory(promise);
                }
            } catch (e) {
                onError(e);
            }
        });
    }
}
function initializeSharing(param) {
    var { shareScopeName, webpackRequire, initPromises, initTokens, initScope } = param;
    var shareScopeKeys = Array.isArray(shareScopeName) ? shareScopeName : [
        shareScopeName
    ];
    var initializeSharingPromises = [];
    var _initializeSharing = function _initializeSharing(shareScopeKey) {
        if (!initScope) initScope = [];
        var mfInstance = webpackRequire.federation.instance;
        // handling circular init calls
        var initToken = initTokens[shareScopeKey];
        if (!initToken) initToken = initTokens[shareScopeKey] = {
            from: mfInstance.name
        };
        if (initScope.indexOf(initToken) >= 0) return;
        initScope.push(initToken);
        var promise = initPromises[shareScopeKey];
        if (promise) return promise;
        var warn = (msg)=>typeof console !== "undefined" && console.warn && console.warn(msg);
        var initExternal = (id)=>{
            var handleError = (err)=>warn("Initialization of sharing external failed: " + err);
            try {
                var module = webpackRequire(id);
                if (!module) return;
                var initFn = (module)=>module && module.init && // @ts-ignore compat legacy mf shared behavior
                    module.init(webpackRequire.S[shareScopeKey], initScope, {
                        shareScopeMap: webpackRequire.S || {},
                        shareScopeKeys: shareScopeName
                    });
                if (module.then) return promises.push(module.then(initFn, handleError));
                var initResult = initFn(module);
                // @ts-ignore
                if (initResult && typeof initResult !== "boolean" && initResult.then) return promises.push(initResult["catch"](handleError));
            } catch (err) {
                handleError(err);
            }
        };
        var promises = mfInstance.initializeSharing(shareScopeKey, {
            strategy: mfInstance.options.shareStrategy,
            initScope,
            from: "build"
        });
        attachShareScopeMap(webpackRequire);
        var bundlerRuntimeRemotesOptions = webpackRequire.federation.bundlerRuntimeOptions.remotes;
        if (bundlerRuntimeRemotesOptions) {
            Object.keys(bundlerRuntimeRemotesOptions.idToRemoteMap).forEach((moduleId)=>{
                var info = bundlerRuntimeRemotesOptions.idToRemoteMap[moduleId];
                var externalModuleId = bundlerRuntimeRemotesOptions.idToExternalAndNameMapping[moduleId][2];
                if (info.length > 1) {
                    initExternal(externalModuleId);
                } else if (info.length === 1) {
                    var remoteInfo = info[0];
                    if (!_constant_esm_js__WEBPACK_IMPORTED_MODULE_1__.FEDERATION_SUPPORTED_TYPES.includes(remoteInfo.externalType)) {
                        initExternal(externalModuleId);
                    }
                }
            });
        }
        if (!promises.length) {
            return initPromises[shareScopeKey] = true;
        }
        return initPromises[shareScopeKey] = Promise.all(promises).then(()=>initPromises[shareScopeKey] = true);
    };
    shareScopeKeys.forEach((key)=>{
        initializeSharingPromises.push(_initializeSharing(key));
    });
    return Promise.all(initializeSharingPromises).then(()=>true);
}
function handleInitialConsumes(options) {
    var { moduleId, moduleToHandlerMapping, webpackRequire } = options;
    var federationInstance = webpackRequire.federation.instance;
    if (!federationInstance) {
        throw new Error("Federation instance not found!");
    }
    var { shareKey, shareInfo } = moduleToHandlerMapping[moduleId];
    try {
        return federationInstance.loadShareSync(shareKey, {
            customShareInfo: shareInfo
        });
    } catch (err) {
        console.error('loadShareSync failed! The function should not be called unless you set "eager:true". If you do not set it, and encounter this issue, you can check whether an async boundary is implemented.');
        console.error("The original error message is as follows: ");
        throw err;
    }
}
function installInitialConsumes(options) {
    var { moduleToHandlerMapping, webpackRequire, installedModules, initialConsumes } = options;
    initialConsumes.forEach((id)=>{
        webpackRequire.m[id] = (module)=>{
            // Handle scenario when module is used synchronously
            installedModules[id] = 0;
            delete webpackRequire.c[id];
            var factory = handleInitialConsumes({
                moduleId: id,
                moduleToHandlerMapping,
                webpackRequire
            });
            if (typeof factory !== "function") {
                throw new Error("Shared module is not available for eager consumption: ".concat(id));
            }
            module.exports = factory();
        };
    });
}
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
function initContainerEntry(options) {
    var { webpackRequire, shareScope, initScope, shareScopeKey, remoteEntryInitOptions } = options;
    if (!webpackRequire.S) return;
    if (!webpackRequire.federation || !webpackRequire.federation.instance || !webpackRequire.federation.initOptions) return;
    var federationInstance = webpackRequire.federation.instance;
    federationInstance.initOptions(_extends({
        name: webpackRequire.federation.initOptions.name,
        remotes: []
    }, remoteEntryInitOptions));
    var hostShareScopeKeys = remoteEntryInitOptions == null ? void 0 : remoteEntryInitOptions.shareScopeKeys;
    var hostShareScopeMap = remoteEntryInitOptions == null ? void 0 : remoteEntryInitOptions.shareScopeMap;
    // host: 'default' remote: 'default'  remote['default'] = hostShareScopeMap['default']
    // host: ['default', 'scope1'] remote: 'default'  remote['default'] = hostShareScopeMap['default']; remote['scope1'] = hostShareScopeMap['scop1']
    // host: 'default' remote: ['default','scope1']  remote['default'] = hostShareScopeMap['default']; remote['scope1'] = hostShareScopeMap['scope1'] = {}
    // host: ['scope1','default'] remote: ['scope1','scope2'] => remote['scope1'] = hostShareScopeMap['scope1']; remote['scope2'] = hostShareScopeMap['scope2'] = {};
    if (!shareScopeKey || typeof shareScopeKey === "string") {
        var key = shareScopeKey || "default";
        if (Array.isArray(hostShareScopeKeys)) {
            // const sc = hostShareScopeMap![key];
            // if (!sc) {
            //   throw new Error('shareScopeKey is not exist in hostShareScopeMap');
            // }
            // federationInstance.initShareScopeMap(key, sc, {
            //   hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
            // });
            hostShareScopeKeys.forEach((hostKey)=>{
                if (!hostShareScopeMap[hostKey]) {
                    hostShareScopeMap[hostKey] = {};
                }
                var sc = hostShareScopeMap[hostKey];
                federationInstance.initShareScopeMap(hostKey, sc, {
                    hostShareScopeMap: (remoteEntryInitOptions == null ? void 0 : remoteEntryInitOptions.shareScopeMap) || {}
                });
            });
        } else {
            federationInstance.initShareScopeMap(key, shareScope, {
                hostShareScopeMap: (remoteEntryInitOptions == null ? void 0 : remoteEntryInitOptions.shareScopeMap) || {}
            });
        }
    } else {
        shareScopeKey.forEach((key)=>{
            if (!hostShareScopeKeys || !hostShareScopeMap) {
                federationInstance.initShareScopeMap(key, shareScope, {
                    hostShareScopeMap: (remoteEntryInitOptions == null ? void 0 : remoteEntryInitOptions.shareScopeMap) || {}
                });
                return;
            }
            if (!hostShareScopeMap[key]) {
                hostShareScopeMap[key] = {};
            }
            var sc = hostShareScopeMap[key];
            federationInstance.initShareScopeMap(key, sc, {
                hostShareScopeMap: (remoteEntryInitOptions == null ? void 0 : remoteEntryInitOptions.shareScopeMap) || {}
            });
        });
    }
    if (webpackRequire.federation.attachShareScopeMap) {
        webpackRequire.federation.attachShareScopeMap(webpackRequire);
    }
    if (typeof webpackRequire.federation.prefetch === "function") {
        webpackRequire.federation.prefetch();
    }
    if (!Array.isArray(shareScopeKey)) {
        // @ts-ignore
        return webpackRequire.I(shareScopeKey || "default", initScope);
    }
    var proxyInitializeSharing = Boolean(webpackRequire.federation.initOptions.shared);
    if (proxyInitializeSharing) {
        // @ts-ignore
        return webpackRequire.I(shareScopeKey, initScope);
    }
    // @ts-ignore
    return Promise.all(shareScopeKey.map((key)=>{
        // @ts-ignore
        return webpackRequire.I(key, initScope);
    })).then(()=>true);
}
var federation = {
    runtime: _module_federation_runtime__WEBPACK_IMPORTED_MODULE_0__,
    instance: undefined,
    initOptions: undefined,
    bundlerRuntime: {
        remotes,
        consumes,
        I: initializeSharing,
        S: {},
        installInitialConsumes,
        initContainerEntry
    },
    attachShareScopeMap,
    bundlerRuntimeOptions: {}
};



/***/ }),

/***/ "./node_modules/.federation/entry.2e8b903b3a4b8118da0eb99c1e4f58da.js":
/*!****************************************************************************!*\
  !*** ./node_modules/.federation/entry.2e8b903b3a4b8118da0eb99c1e4f58da.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_index_esm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../packages/webpack-bundler-runtime/dist/index.esm.js */ "../../packages/webpack-bundler-runtime/dist/index.esm.js");
/* harmony import */ var _Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_cjs_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.cjs?runtimePlugin */ "../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.cjs?runtimePlugin");



if(!__webpack_require__.federation.runtime){
	var prevFederation = __webpack_require__.federation;
	__webpack_require__.federation = {}
	for(var key in _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_index_esm_js__WEBPACK_IMPORTED_MODULE_0__["default"]){
		__webpack_require__.federation[key] = _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_index_esm_js__WEBPACK_IMPORTED_MODULE_0__["default"][key];
	}
	for(var key in prevFederation){
		__webpack_require__.federation[key] = prevFederation[key];
	}
}
if(!__webpack_require__.federation.instance){
	var pluginsToAdd = [
		_Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_cjs_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__["default"] ? (_Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_cjs_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__["default"]["default"] || _Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_cjs_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__["default"])() : false,
	].filter(Boolean);
	__webpack_require__.federation.initOptions.plugins = __webpack_require__.federation.initOptions.plugins ? 
	__webpack_require__.federation.initOptions.plugins.concat(pluginsToAdd) : pluginsToAdd;
	__webpack_require__.federation.instance = __webpack_require__.federation.runtime.init(__webpack_require__.federation.initOptions);
	if(__webpack_require__.federation.attachShareScopeMap){
		__webpack_require__.federation.attachShareScopeMap(__webpack_require__)
	}
	if(__webpack_require__.federation.installInitialConsumes){
		__webpack_require__.federation.installInitialConsumes()
	}

	if(!__webpack_require__.federation.isMFRemote && __webpack_require__.federation.prefetch){
	__webpack_require__.federation.prefetch()
	}
}

/***/ }),

/***/ "webpack/container/entry/home_app":
/*!***********************!*\
  !*** container entry ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var moduleMap = {
	"./SharedNav": function() {
		return __webpack_require__.e(/*! __federation_expose_SharedNav */ "__federation_expose_SharedNav").then(function() { return function() { return (__webpack_require__(/*! ./components/SharedNav */ "./components/SharedNav.tsx")); }; });
	},
	"./menu": function() {
		return __webpack_require__.e(/*! __federation_expose_menu */ "__federation_expose_menu").then(function() { return function() { return (__webpack_require__(/*! ./components/menu */ "./components/menu.tsx")); }; });
	},
	"./pages-map": function() {
		return __webpack_require__.e(/*! __federation_expose_pages_map */ "__federation_expose_pages_map").then(function() { return function() { return (__webpack_require__(/*! ../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js */ "../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js")); }; });
	},
	"./pages-map-v2": function() {
		return __webpack_require__.e(/*! __federation_expose_pages_map_v2 */ "__federation_expose_pages_map_v2").then(function() { return function() { return (__webpack_require__(/*! ../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js?v2!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js */ "../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js?v2!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js")); }; });
	},
	"./pages/index": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__index */ "__federation_expose_pages__index").then(function() { return function() { return (__webpack_require__(/*! ./pages/index.tsx */ "./pages/index.tsx")); }; });
	},
	"./pages/checkout/[...slug]": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__[...slug] */ "__federation_expose_pages__checkout__[...slug]").then(function() { return function() { return (__webpack_require__(/*! ./pages/checkout/[...slug].tsx */ "./pages/checkout/[...slug].tsx")); }; });
	},
	"./pages/checkout/[pid]": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__[pid] */ "__federation_expose_pages__checkout__[pid]").then(function() { return function() { return (__webpack_require__(/*! ./pages/checkout/[pid].tsx */ "./pages/checkout/[pid].tsx")); }; });
	},
	"./pages/checkout/exposed-pages": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__exposed_pages */ "__federation_expose_pages__checkout__exposed_pages").then(function() { return function() { return (__webpack_require__(/*! ./pages/checkout/exposed-pages.tsx */ "./pages/checkout/exposed-pages.tsx")); }; });
	},
	"./pages/checkout/index": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__index */ "__federation_expose_pages__checkout__index").then(function() { return function() { return (__webpack_require__(/*! ./pages/checkout/index.tsx */ "./pages/checkout/index.tsx")); }; });
	},
	"./pages/checkout/test-check-button": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__test_check_button */ "__federation_expose_pages__checkout__test_check_button").then(function() { return function() { return (__webpack_require__(/*! ./pages/checkout/test-check-button.tsx */ "./pages/checkout/test-check-button.tsx")); }; });
	},
	"./pages/checkout/test-title": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__test_title */ "__federation_expose_pages__checkout__test_title").then(function() { return function() { return (__webpack_require__(/*! ./pages/checkout/test-title.tsx */ "./pages/checkout/test-title.tsx")); }; });
	},
	"./pages/home/exposed-pages": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__home__exposed_pages */ "__federation_expose_pages__home__exposed_pages").then(function() { return function() { return (__webpack_require__(/*! ./pages/home/exposed-pages.tsx */ "./pages/home/exposed-pages.tsx")); }; });
	},
	"./pages/home/test-broken-remotes": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__home__test_broken_remotes */ "__federation_expose_pages__home__test_broken_remotes").then(function() { return function() { return (__webpack_require__(/*! ./pages/home/test-broken-remotes.tsx */ "./pages/home/test-broken-remotes.tsx")); }; });
	},
	"./pages/home/test-remote-hook": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__home__test_remote_hook */ "__federation_expose_pages__home__test_remote_hook").then(function() { return function() { return (__webpack_require__(/*! ./pages/home/test-remote-hook.tsx */ "./pages/home/test-remote-hook.tsx")); }; });
	},
	"./pages/home/test-shared-nav": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__home__test_shared_nav */ "__federation_expose_pages__home__test_shared_nav").then(function() { return function() { return (__webpack_require__(/*! ./pages/home/test-shared-nav.tsx */ "./pages/home/test-shared-nav.tsx")); }; });
	},
	"./pages/shop/exposed-pages": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__shop__exposed_pages */ "__federation_expose_pages__shop__exposed_pages").then(function() { return function() { return (__webpack_require__(/*! ./pages/shop/exposed-pages.js */ "./pages/shop/exposed-pages.js")); }; });
	},
	"./pages/shop/index": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__shop__index */ "__federation_expose_pages__shop__index").then(function() { return function() { return (__webpack_require__(/*! ./pages/shop/index.js */ "./pages/shop/index.js")); }; });
	},
	"./pages/shop/test-webpack-png": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__shop__test_webpack_png */ "__federation_expose_pages__shop__test_webpack_png").then(function() { return function() { return (__webpack_require__(/*! ./pages/shop/test-webpack-png.js */ "./pages/shop/test-webpack-png.js")); }; });
	},
	"./pages/shop/test-webpack-svg": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__shop__test_webpack_svg */ "__federation_expose_pages__shop__test_webpack_svg").then(function() { return function() { return (__webpack_require__(/*! ./pages/shop/test-webpack-svg.js */ "./pages/shop/test-webpack-svg.js")); }; });
	},
	"./pages/shop/products/[...slug]": function() {
		return __webpack_require__.e(/*! __federation_expose_pages__shop__products__[...slug] */ "__federation_expose_pages__shop__products__[...slug]").then(function() { return function() { return (__webpack_require__(/*! ./pages/shop/products/[...slug].js */ "./pages/shop/products/[...slug].js")); }; });
	}
};
var get = function(module, getScope) {
	__webpack_require__.R = getScope;
	getScope = (
		__webpack_require__.o(moduleMap, module)
			? moduleMap[module]()
			: Promise.resolve().then(function() {
				throw new Error('Module "' + module + '" does not exist in container.');
			})
	);
	__webpack_require__.R = undefined;
	return getScope;
};
var init = function(shareScope, initScope, remoteEntryInitOptions) {
	return __webpack_require__.federation.bundlerRuntime.initContainerEntry({	webpackRequire: __webpack_require__,
		shareScope: shareScope,
		initScope: initScope,
		remoteEntryInitOptions: remoteEntryInitOptions,
		shareScopeKey: "default"
	})
};


// This exports getters to disallow modifications
__webpack_require__.d(exports, {
	get: function() { return get; },
	init: function() { return init; }
});

/***/ }),

/***/ "webpack/container/reference/checkout":
/*!************************************************************************************!*\
  !*** external "checkout@http://localhost:3002/_next/static/chunks/remoteEntry.js" ***!
  \************************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
var __webpack_error__ = new Error();
module.exports = new Promise(function(resolve, reject) {
	if(typeof checkout !== "undefined") return resolve();
	__webpack_require__.l("http://localhost:3002/_next/static/chunks/remoteEntry.js", function(event) {
		if(typeof checkout !== "undefined") return resolve();
		var errorType = event && (event.type === 'load' ? 'missing' : event.type);
		var realSrc = event && event.target && event.target.src;
		__webpack_error__.message = 'Loading script failed.\n(' + errorType + ': ' + realSrc + ')';
		__webpack_error__.name = 'ScriptExternalLoadError';
		__webpack_error__.type = errorType;
		__webpack_error__.request = realSrc;
		reject(__webpack_error__);
	}, "checkout");
}).then(function() { return checkout; });

/***/ }),

/***/ "webpack/container/reference/shop":
/*!********************************************************************************!*\
  !*** external "shop@http://localhost:3001/_next/static/chunks/remoteEntry.js" ***!
  \********************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
var __webpack_error__ = new Error();
module.exports = new Promise(function(resolve, reject) {
	if(typeof shop !== "undefined") return resolve();
	__webpack_require__.l("http://localhost:3001/_next/static/chunks/remoteEntry.js", function(event) {
		if(typeof shop !== "undefined") return resolve();
		var errorType = event && (event.type === 'load' ? 'missing' : event.type);
		var realSrc = event && event.target && event.target.src;
		__webpack_error__.message = 'Loading script failed.\n(' + errorType + ': ' + realSrc + ')';
		__webpack_error__.name = 'ScriptExternalLoadError';
		__webpack_error__.type = errorType;
		__webpack_error__.request = realSrc;
		reject(__webpack_error__);
	}, "shop");
}).then(function() { return shop; });

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			var execOptions = { id: moduleId, module: module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
/******/ 			__webpack_require__.i.forEach(function(handler) { handler(execOptions); });
/******/ 			module = execOptions.module;
/******/ 			execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/******/ 	// expose the module execution interceptor
/******/ 	__webpack_require__.i = [];
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = function() {};
/************************************************************************/
/******/ 	/* webpack/runtime/federation runtime */
/******/ 	!function() {
/******/ 		if(!__webpack_require__.federation){
/******/ 			__webpack_require__.federation = {
/******/ 				initOptions: {"name":"home_app","remotes":[{"alias":"shop","name":"shop","entry":"http://localhost:3001/_next/static/chunks/remoteEntry.js","shareScope":"default"},{"alias":"checkout","name":"checkout","entry":"http://localhost:3002/_next/static/chunks/remoteEntry.js","shareScope":"default"}],"shareStrategy":"loaded-first"},
/******/ 				chunkMatcher: function(chunkId) {return !/^webpack_container_remote_shop_Webpack(Pn|Sv)g$/.test(chunkId)},
/******/ 				rootOutputDir: "../../",
/******/ 				initialConsumes: undefined,
/******/ 				bundlerRuntimeOptions: {}
/******/ 			};
/******/ 		}
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	!function() {
/******/ 		var getProto = Object.getPrototypeOf ? function(obj) { return Object.getPrototypeOf(obj); } : function(obj) { return obj.__proto__; };
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach(function(key) { def[key] = function() { return value[key]; }; });
/******/ 			}
/******/ 			def['default'] = function() { return value; };
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	!function() {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = function(chunkId) {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce(function(promises, key) {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	!function() {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = function(chunkId) {
/******/ 			// return url for filenames based on template
/******/ 			return "static/chunks/" + chunkId + ".js";
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/get javascript update chunk filename */
/******/ 	!function() {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.hu = function(chunkId) {
/******/ 			// return url for filenames based on template
/******/ 			return "static/webpack/" + chunkId + "." + __webpack_require__.h() + ".hot-update.js";
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/get update manifest filename */
/******/ 	!function() {
/******/ 		__webpack_require__.hmrF = function() { return "static/webpack/" + __webpack_require__.h() + ".home_app.hot-update.json"; };
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	!function() {
/******/ 		__webpack_require__.h = function() { return "d5526887b111c628"; }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	!function() {
/******/ 		__webpack_require__.hmd = function(module) {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: function() {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	!function() {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "home_app:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = function(url, done, key, chunkId) {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = __webpack_require__.tu(url);
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = function(prev, event) {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach(function(fn) { return fn(event); });
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	!function() {
/******/ 		__webpack_require__.nmd = function(module) {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/remotes loading */
/******/ 	!function() {
/******/ 		var chunkMapping = {
/******/ 			"__federation_expose_pages__index": [
/******/ 				"webpack/container/remote/checkout/CheckoutTitle",
/******/ 				"webpack/container/remote/checkout/ButtonOldAnt"
/******/ 			],
/******/ 			"__federation_expose_pages__checkout__[...slug]": [
/******/ 				"webpack/container/remote/checkout/pages/checkout/[...slug]"
/******/ 			],
/******/ 			"__federation_expose_pages__checkout__[pid]": [
/******/ 				"webpack/container/remote/checkout/pages/checkout/[pid]"
/******/ 			],
/******/ 			"__federation_expose_pages__checkout__exposed_pages": [
/******/ 				"webpack/container/remote/checkout/pages/checkout/exposed-pages"
/******/ 			],
/******/ 			"__federation_expose_pages__checkout__index": [
/******/ 				"webpack/container/remote/checkout/pages/checkout/index"
/******/ 			],
/******/ 			"__federation_expose_pages__checkout__test_check_button": [
/******/ 				"webpack/container/remote/checkout/pages/checkout/test-check-button"
/******/ 			],
/******/ 			"__federation_expose_pages__checkout__test_title": [
/******/ 				"webpack/container/remote/checkout/pages/checkout/test-title"
/******/ 			],
/******/ 			"__federation_expose_pages__home__test_remote_hook": [
/******/ 				"webpack/container/remote/shop/useCustomRemoteHook"
/******/ 			],
/******/ 			"__federation_expose_pages__shop__exposed_pages": [
/******/ 				"webpack/container/remote/shop/pages/shop/exposed-pages"
/******/ 			],
/******/ 			"__federation_expose_pages__shop__index": [
/******/ 				"webpack/container/remote/shop/pages/shop/index"
/******/ 			],
/******/ 			"__federation_expose_pages__shop__test_webpack_png": [
/******/ 				"webpack/container/remote/shop/pages/shop/test-webpack-png"
/******/ 			],
/******/ 			"__federation_expose_pages__shop__test_webpack_svg": [
/******/ 				"webpack/container/remote/shop/pages/shop/test-webpack-svg"
/******/ 			],
/******/ 			"__federation_expose_pages__shop__products__[...slug]": [
/******/ 				"webpack/container/remote/shop/pages/shop/products/[...slug]"
/******/ 			],
/******/ 			"webpack_container_remote_shop_WebpackSvg": [
/******/ 				"webpack/container/remote/shop/WebpackSvg"
/******/ 			],
/******/ 			"webpack_container_remote_shop_WebpackPng": [
/******/ 				"webpack/container/remote/shop/WebpackPng"
/******/ 			]
/******/ 		};
/******/ 		var idToExternalAndNameMapping = {
/******/ 			"webpack/container/remote/checkout/CheckoutTitle": [
/******/ 				"default",
/******/ 				"./CheckoutTitle",
/******/ 				"webpack/container/reference/checkout"
/******/ 			],
/******/ 			"webpack/container/remote/checkout/ButtonOldAnt": [
/******/ 				"default",
/******/ 				"./ButtonOldAnt",
/******/ 				"webpack/container/reference/checkout"
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/[...slug]": [
/******/ 				"default",
/******/ 				"./pages/checkout/[...slug]",
/******/ 				"webpack/container/reference/checkout"
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/[pid]": [
/******/ 				"default",
/******/ 				"./pages/checkout/[pid]",
/******/ 				"webpack/container/reference/checkout"
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/exposed-pages": [
/******/ 				"default",
/******/ 				"./pages/checkout/exposed-pages",
/******/ 				"webpack/container/reference/checkout"
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/index": [
/******/ 				"default",
/******/ 				"./pages/checkout/index",
/******/ 				"webpack/container/reference/checkout"
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/test-check-button": [
/******/ 				"default",
/******/ 				"./pages/checkout/test-check-button",
/******/ 				"webpack/container/reference/checkout"
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/test-title": [
/******/ 				"default",
/******/ 				"./pages/checkout/test-title",
/******/ 				"webpack/container/reference/checkout"
/******/ 			],
/******/ 			"webpack/container/remote/shop/useCustomRemoteHook": [
/******/ 				"default",
/******/ 				"./useCustomRemoteHook",
/******/ 				"webpack/container/reference/shop"
/******/ 			],
/******/ 			"webpack/container/remote/shop/pages/shop/exposed-pages": [
/******/ 				"default",
/******/ 				"./pages/shop/exposed-pages",
/******/ 				"webpack/container/reference/shop"
/******/ 			],
/******/ 			"webpack/container/remote/shop/pages/shop/index": [
/******/ 				"default",
/******/ 				"./pages/shop/index",
/******/ 				"webpack/container/reference/shop"
/******/ 			],
/******/ 			"webpack/container/remote/shop/pages/shop/test-webpack-png": [
/******/ 				"default",
/******/ 				"./pages/shop/test-webpack-png",
/******/ 				"webpack/container/reference/shop"
/******/ 			],
/******/ 			"webpack/container/remote/shop/pages/shop/test-webpack-svg": [
/******/ 				"default",
/******/ 				"./pages/shop/test-webpack-svg",
/******/ 				"webpack/container/reference/shop"
/******/ 			],
/******/ 			"webpack/container/remote/shop/pages/shop/products/[...slug]": [
/******/ 				"default",
/******/ 				"./pages/shop/products/[...slug]",
/******/ 				"webpack/container/reference/shop"
/******/ 			],
/******/ 			"webpack/container/remote/shop/WebpackSvg": [
/******/ 				"default",
/******/ 				"./WebpackSvg",
/******/ 				"webpack/container/reference/shop"
/******/ 			],
/******/ 			"webpack/container/remote/shop/WebpackPng": [
/******/ 				"default",
/******/ 				"./WebpackPng",
/******/ 				"webpack/container/reference/shop"
/******/ 			]
/******/ 		};
/******/ 		var idToRemoteMap = {
/******/ 			"webpack/container/remote/checkout/CheckoutTitle": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "checkout",
/******/ 					"externalModuleId": "webpack/container/reference/checkout"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/checkout/ButtonOldAnt": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "checkout",
/******/ 					"externalModuleId": "webpack/container/reference/checkout"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/[...slug]": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "checkout",
/******/ 					"externalModuleId": "webpack/container/reference/checkout"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/[pid]": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "checkout",
/******/ 					"externalModuleId": "webpack/container/reference/checkout"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/exposed-pages": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "checkout",
/******/ 					"externalModuleId": "webpack/container/reference/checkout"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/index": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "checkout",
/******/ 					"externalModuleId": "webpack/container/reference/checkout"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/test-check-button": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "checkout",
/******/ 					"externalModuleId": "webpack/container/reference/checkout"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/checkout/pages/checkout/test-title": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "checkout",
/******/ 					"externalModuleId": "webpack/container/reference/checkout"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/shop/useCustomRemoteHook": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "shop",
/******/ 					"externalModuleId": "webpack/container/reference/shop"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/shop/pages/shop/exposed-pages": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "shop",
/******/ 					"externalModuleId": "webpack/container/reference/shop"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/shop/pages/shop/index": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "shop",
/******/ 					"externalModuleId": "webpack/container/reference/shop"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/shop/pages/shop/test-webpack-png": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "shop",
/******/ 					"externalModuleId": "webpack/container/reference/shop"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/shop/pages/shop/test-webpack-svg": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "shop",
/******/ 					"externalModuleId": "webpack/container/reference/shop"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/shop/pages/shop/products/[...slug]": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "shop",
/******/ 					"externalModuleId": "webpack/container/reference/shop"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/shop/WebpackSvg": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "shop",
/******/ 					"externalModuleId": "webpack/container/reference/shop"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/shop/WebpackPng": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "shop",
/******/ 					"externalModuleId": "webpack/container/reference/shop"
/******/ 				}
/******/ 			]
/******/ 		};
/******/ 		__webpack_require__.federation.bundlerRuntimeOptions.remotes = {idToRemoteMap,chunkMapping, idToExternalAndNameMapping, webpackRequire:__webpack_require__};
/******/ 		__webpack_require__.f.remotes = function(chunkId, promises) {
/******/ 			__webpack_require__.federation.bundlerRuntime.remotes({idToRemoteMap,chunkMapping, idToExternalAndNameMapping, chunkId, promises, webpackRequire:__webpack_require__});
/******/ 		}
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/runtimeId */
/******/ 	!function() {
/******/ 		__webpack_require__.j = "home_app";
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/sharing */
/******/ 	!function() {
/******/ 		__webpack_require__.S = {};
/******/ 		var initPromises = {};
/******/ 		var initTokens = {};
/******/ 		__webpack_require__.I = function(name, initScope) {
/******/ 			if(!initScope) initScope = [];
/******/ 			// handling circular init calls
/******/ 			var initToken = initTokens[name];
/******/ 			if(!initToken) initToken = initTokens[name] = {};
/******/ 			if(initScope.indexOf(initToken) >= 0) return;
/******/ 			initScope.push(initToken);
/******/ 			// only runs once
/******/ 			if(initPromises[name]) return initPromises[name];
/******/ 			// creates a new share scope if needed
/******/ 			if(!__webpack_require__.o(__webpack_require__.S, name)) __webpack_require__.S[name] = {};
/******/ 			// runs all init snippets from all modules reachable
/******/ 			var scope = __webpack_require__.S[name];
/******/ 			var warn = function(msg) {
/******/ 				if (typeof console !== "undefined" && console.warn) console.warn(msg);
/******/ 			};
/******/ 			var uniqueName = "home_app";
/******/ 			var register = function(name, version, factory, eager) {
/******/ 				var versions = scope[name] = scope[name] || {};
/******/ 				var activeVersion = versions[version];
/******/ 				if(!activeVersion || (!activeVersion.loaded && (!eager != !activeVersion.eager ? eager : uniqueName > activeVersion.from))) versions[version] = { get: factory, from: uniqueName, eager: !!eager };
/******/ 			};
/******/ 			var initExternal = function(id) {
/******/ 				var handleError = function(err) { warn("Initialization of sharing external failed: " + err); };
/******/ 				try {
/******/ 					var module = __webpack_require__(id);
/******/ 					if(!module) return;
/******/ 					var initFn = function(module) { return module && module.init && module.init(__webpack_require__.S[name], initScope); }
/******/ 					if(module.then) return promises.push(module.then(initFn, handleError));
/******/ 					var initResult = initFn(module);
/******/ 					if(initResult && initResult.then) return promises.push(initResult['catch'](handleError));
/******/ 				} catch(err) { handleError(err); }
/******/ 			}
/******/ 			var promises = [];
/******/ 			switch(name) {
/******/ 				case "default": {
/******/ 					register("@ant-design/colors", "7.1.0", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_colors_7_1_0_node_modules_ant-design_colors_es_index_js-_f8481").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js"); }; }); });
/******/ 					register("@ant-design/cssinjs", "1.21.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_cssinjs_1_21_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-de-f3c0a90").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/es/index.js */ "../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/es/index.js"); }; }); });
/******/ 					register("@ant-design/icons-svg/es/asn/BarsOutlined", "4.4.2", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_BarsOut-3927b4").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js"); }; }); });
/******/ 					register("@ant-design/icons-svg/es/asn/EllipsisOutlined", "4.4.2", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_Ellipsi-cf0c04").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js"); }; }); });
/******/ 					register("@ant-design/icons-svg/es/asn/LeftOutlined", "4.4.2", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_LeftOut-1fba7a").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js"); }; }); });
/******/ 					register("@ant-design/icons-svg/es/asn/RightOutlined", "4.4.2", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_RightOu-993bc2").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js"); }; }); });
/******/ 					register("@ant-design/icons/es/components/Context", "5.5.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-0a9ca11").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js"); }; }); });
/******/ 					register("@ant-design/icons/es/icons/BarsOutlined", "5.5.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-587f870").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js"); }; }); });
/******/ 					register("@ant-design/icons/es/icons/EllipsisOutlined", "5.5.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-871a9e0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js"); }; }); });
/******/ 					register("@ant-design/icons/es/icons/LeftOutlined", "5.5.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-d114ce0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js"); }; }); });
/******/ 					register("@ant-design/icons/es/icons/RightOutlined", "5.5.1", function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-9c06210").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js"); }; }); });
/******/ 					register("next/dynamic", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-6478ab0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js"); }; }); });
/******/ 					register("next/head", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad1").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js"); }; }); });
/******/ 					register("next/image", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-e15dbc0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js"); }; }); });
/******/ 					register("next/link", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-dfbe5d0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js"); }; }); });
/******/ 					register("next/router", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1251").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js"); }; }); });
/******/ 					register("next/script", "14.2.16", function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-78b1ab0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js"); }; }); });
/******/ 					register("react-dom/client", "18.3.1", function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_client_js-_382a0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js"); }; }); });
/******/ 					register("react-dom", "18.3.1", function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_index_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js"); }; }); });
/******/ 					register("react/jsx-dev-runtime", "18.3.1", function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-dev-runtime_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js"); }; }); });
/******/ 					register("react/jsx-runtime", "18.3.1", function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-runtime_js-_c1861").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js"); }; }); });
/******/ 					register("react", "18.3.1", function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_index_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js"); }; }); });
/******/ 					register("styled-jsx/style", "5.1.6", function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_st-9a91511").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/style.js */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/style.js"); }; }); });
/******/ 					register("styled-jsx", "5.1.6", function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_in-b28c190").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js"); }; }); });
/******/ 					initExternal("webpack/container/reference/checkout");
/******/ 					initExternal("webpack/container/reference/shop");
/******/ 				}
/******/ 				break;
/******/ 			}
/******/ 			if(!promises.length) return initPromises[name] = 1;
/******/ 			return initPromises[name] = Promise.all(promises).then(function() { return initPromises[name] = 1; });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	!function() {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = function() {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScriptURL: function(url) { return url; }
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script url */
/******/ 	!function() {
/******/ 		__webpack_require__.tu = function(url) { return __webpack_require__.tt().createScriptURL(url); };
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/sharing */
/******/ 	!function() {
/******/ 		__webpack_require__.federation.initOptions.shared = {	"@ant-design/colors": [{	version: "7.1.0",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_colors_7_1_0_node_modules_ant-design_colors_es_index_js-_f8481").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/cssinjs": [{	version: "1.21.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_cssinjs_1_21_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-de-f3c0a90").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/es/index.js */ "../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/es/index.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/BarsOutlined": [{	version: "4.4.2",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_BarsOut-3927b4").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/EllipsisOutlined": [{	version: "4.4.2",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_Ellipsi-cf0c04").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/LeftOutlined": [{	version: "4.4.2",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_LeftOut-1fba7a").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/RightOutlined": [{	version: "4.4.2",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_RightOu-993bc2").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/components/Context": [{	version: "5.5.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-0a9ca11").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/BarsOutlined": [{	version: "5.5.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-587f870").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/EllipsisOutlined": [{	version: "5.5.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-871a9e0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/LeftOutlined": [{	version: "5.5.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-d114ce0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/RightOutlined": [{	version: "5.5.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-9c06210").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/dynamic": [{	version: "14.2.16",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-6478ab0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/head": [{	version: "14.2.16",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad1").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/image": [{	version: "14.2.16",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-e15dbc0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/link": [{	version: "14.2.16",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-dfbe5d0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/router": [{	version: "14.2.16",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1251").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"next/script": [{	version: "14.2.16",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-78b1ab0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"react-dom/client": [{	version: "18.3.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_client_js-_382a0").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"react-dom": [{	version: "18.3.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_index_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"react/jsx-dev-runtime": [{	version: "18.3.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-dev-runtime_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"react/jsx-runtime": [{	version: "18.3.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-runtime_js-_c1861").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"react": [{	version: "18.3.1",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_index_js").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"styled-jsx/style": [{	version: "5.1.6",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_st-9a91511").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/style.js */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/style.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":"^5.1.6","singleton":true,"layer":null}},],	"styled-jsx": [{	version: "5.1.6",
/******/ 				get: function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_in-b28c190").then(function() { return function() { return __webpack_require__(/*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js"); }; }); },
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":"^5.1.6","singleton":true,"layer":null}},],}
/******/ 		__webpack_require__.S = {};
/******/ 		var initPromises = {};
/******/ 		var initTokens = {};
/******/ 		__webpack_require__.I = function(name, initScope) {
/******/ 			return __webpack_require__.federation.bundlerRuntime.I({	shareScopeName: name,
/******/ 				webpackRequire: __webpack_require__,
/******/ 				initPromises: initPromises,
/******/ 				initTokens: initTokens,
/******/ 				initScope: initScope,
/******/ 			})
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hot module replacement */
/******/ 	!function() {
/******/ 		var currentModuleData = {};
/******/ 		var installedModules = __webpack_require__.c;
/******/ 		
/******/ 		// module and require creation
/******/ 		var currentChildModule;
/******/ 		var currentParents = [];
/******/ 		
/******/ 		// status
/******/ 		var registeredStatusHandlers = [];
/******/ 		var currentStatus = "idle";
/******/ 		
/******/ 		// while downloading
/******/ 		var blockingPromises = 0;
/******/ 		var blockingPromisesWaiting = [];
/******/ 		
/******/ 		// The update info
/******/ 		var currentUpdateApplyHandlers;
/******/ 		var queuedInvalidatedModules;
/******/ 		
/******/ 		__webpack_require__.hmrD = currentModuleData;
/******/ 		
/******/ 		__webpack_require__.i.push(function (options) {
/******/ 			var module = options.module;
/******/ 			var require = createRequire(options.require, options.id);
/******/ 			module.hot = createModuleHotObject(options.id, module);
/******/ 			module.parents = currentParents;
/******/ 			module.children = [];
/******/ 			currentParents = [];
/******/ 			options.require = require;
/******/ 		});
/******/ 		
/******/ 		__webpack_require__.hmrC = {};
/******/ 		__webpack_require__.hmrI = {};
/******/ 		
/******/ 		function createRequire(require, moduleId) {
/******/ 			var me = installedModules[moduleId];
/******/ 			if (!me) return require;
/******/ 			var fn = function (request) {
/******/ 				if (me.hot.active) {
/******/ 					if (installedModules[request]) {
/******/ 						var parents = installedModules[request].parents;
/******/ 						if (parents.indexOf(moduleId) === -1) {
/******/ 							parents.push(moduleId);
/******/ 						}
/******/ 					} else {
/******/ 						currentParents = [moduleId];
/******/ 						currentChildModule = request;
/******/ 					}
/******/ 					if (me.children.indexOf(request) === -1) {
/******/ 						me.children.push(request);
/******/ 					}
/******/ 				} else {
/******/ 					console.warn(
/******/ 						"[HMR] unexpected require(" +
/******/ 							request +
/******/ 							") from disposed module " +
/******/ 							moduleId
/******/ 					);
/******/ 					currentParents = [];
/******/ 				}
/******/ 				return require(request);
/******/ 			};
/******/ 			var createPropertyDescriptor = function (name) {
/******/ 				return {
/******/ 					configurable: true,
/******/ 					enumerable: true,
/******/ 					get: function () {
/******/ 						return require[name];
/******/ 					},
/******/ 					set: function (value) {
/******/ 						require[name] = value;
/******/ 					}
/******/ 				};
/******/ 			};
/******/ 			for (var name in require) {
/******/ 				if (Object.prototype.hasOwnProperty.call(require, name) && name !== "e") {
/******/ 					Object.defineProperty(fn, name, createPropertyDescriptor(name));
/******/ 				}
/******/ 			}
/******/ 			fn.e = function (chunkId, fetchPriority) {
/******/ 				return trackBlockingPromise(require.e(chunkId, fetchPriority));
/******/ 			};
/******/ 			return fn;
/******/ 		}
/******/ 		
/******/ 		function createModuleHotObject(moduleId, me) {
/******/ 			var _main = currentChildModule !== moduleId;
/******/ 			var hot = {
/******/ 				// private stuff
/******/ 				_acceptedDependencies: {},
/******/ 				_acceptedErrorHandlers: {},
/******/ 				_declinedDependencies: {},
/******/ 				_selfAccepted: false,
/******/ 				_selfDeclined: false,
/******/ 				_selfInvalidated: false,
/******/ 				_disposeHandlers: [],
/******/ 				_main: _main,
/******/ 				_requireSelf: function () {
/******/ 					currentParents = me.parents.slice();
/******/ 					currentChildModule = _main ? undefined : moduleId;
/******/ 					__webpack_require__(moduleId);
/******/ 				},
/******/ 		
/******/ 				// Module API
/******/ 				active: true,
/******/ 				accept: function (dep, callback, errorHandler) {
/******/ 					if (dep === undefined) hot._selfAccepted = true;
/******/ 					else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 					else if (typeof dep === "object" && dep !== null) {
/******/ 						for (var i = 0; i < dep.length; i++) {
/******/ 							hot._acceptedDependencies[dep[i]] = callback || function () {};
/******/ 							hot._acceptedErrorHandlers[dep[i]] = errorHandler;
/******/ 						}
/******/ 					} else {
/******/ 						hot._acceptedDependencies[dep] = callback || function () {};
/******/ 						hot._acceptedErrorHandlers[dep] = errorHandler;
/******/ 					}
/******/ 				},
/******/ 				decline: function (dep) {
/******/ 					if (dep === undefined) hot._selfDeclined = true;
/******/ 					else if (typeof dep === "object" && dep !== null)
/******/ 						for (var i = 0; i < dep.length; i++)
/******/ 							hot._declinedDependencies[dep[i]] = true;
/******/ 					else hot._declinedDependencies[dep] = true;
/******/ 				},
/******/ 				dispose: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				addDisposeHandler: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				removeDisposeHandler: function (callback) {
/******/ 					var idx = hot._disposeHandlers.indexOf(callback);
/******/ 					if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 				},
/******/ 				invalidate: function () {
/******/ 					this._selfInvalidated = true;
/******/ 					switch (currentStatus) {
/******/ 						case "idle":
/******/ 							currentUpdateApplyHandlers = [];
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							setStatus("ready");
/******/ 							break;
/******/ 						case "ready":
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							break;
/******/ 						case "prepare":
/******/ 						case "check":
/******/ 						case "dispose":
/******/ 						case "apply":
/******/ 							(queuedInvalidatedModules = queuedInvalidatedModules || []).push(
/******/ 								moduleId
/******/ 							);
/******/ 							break;
/******/ 						default:
/******/ 							// ignore requests in error states
/******/ 							break;
/******/ 					}
/******/ 				},
/******/ 		
/******/ 				// Management API
/******/ 				check: hotCheck,
/******/ 				apply: hotApply,
/******/ 				status: function (l) {
/******/ 					if (!l) return currentStatus;
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				addStatusHandler: function (l) {
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				removeStatusHandler: function (l) {
/******/ 					var idx = registeredStatusHandlers.indexOf(l);
/******/ 					if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
/******/ 				},
/******/ 		
/******/ 				// inherit from previous dispose call
/******/ 				data: currentModuleData[moduleId]
/******/ 			};
/******/ 			currentChildModule = undefined;
/******/ 			return hot;
/******/ 		}
/******/ 		
/******/ 		function setStatus(newStatus) {
/******/ 			currentStatus = newStatus;
/******/ 			var results = [];
/******/ 		
/******/ 			for (var i = 0; i < registeredStatusHandlers.length; i++)
/******/ 				results[i] = registeredStatusHandlers[i].call(null, newStatus);
/******/ 		
/******/ 			return Promise.all(results).then(function () {});
/******/ 		}
/******/ 		
/******/ 		function unblock() {
/******/ 			if (--blockingPromises === 0) {
/******/ 				setStatus("ready").then(function () {
/******/ 					if (blockingPromises === 0) {
/******/ 						var list = blockingPromisesWaiting;
/******/ 						blockingPromisesWaiting = [];
/******/ 						for (var i = 0; i < list.length; i++) {
/******/ 							list[i]();
/******/ 						}
/******/ 					}
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function trackBlockingPromise(promise) {
/******/ 			switch (currentStatus) {
/******/ 				case "ready":
/******/ 					setStatus("prepare");
/******/ 				/* fallthrough */
/******/ 				case "prepare":
/******/ 					blockingPromises++;
/******/ 					promise.then(unblock, unblock);
/******/ 					return promise;
/******/ 				default:
/******/ 					return promise;
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function waitForBlockingPromises(fn) {
/******/ 			if (blockingPromises === 0) return fn();
/******/ 			return new Promise(function (resolve) {
/******/ 				blockingPromisesWaiting.push(function () {
/******/ 					resolve(fn());
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function hotCheck(applyOnUpdate) {
/******/ 			if (currentStatus !== "idle") {
/******/ 				throw new Error("check() is only allowed in idle status");
/******/ 			}
/******/ 			return setStatus("check")
/******/ 				.then(__webpack_require__.hmrM)
/******/ 				.then(function (update) {
/******/ 					if (!update) {
/******/ 						return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
/******/ 							function () {
/******/ 								return null;
/******/ 							}
/******/ 						);
/******/ 					}
/******/ 		
/******/ 					return setStatus("prepare").then(function () {
/******/ 						var updatedModules = [];
/******/ 						currentUpdateApplyHandlers = [];
/******/ 		
/******/ 						return Promise.all(
/******/ 							Object.keys(__webpack_require__.hmrC).reduce(function (
/******/ 								promises,
/******/ 								key
/******/ 							) {
/******/ 								__webpack_require__.hmrC[key](
/******/ 									update.c,
/******/ 									update.r,
/******/ 									update.m,
/******/ 									promises,
/******/ 									currentUpdateApplyHandlers,
/******/ 									updatedModules
/******/ 								);
/******/ 								return promises;
/******/ 							}, [])
/******/ 						).then(function () {
/******/ 							return waitForBlockingPromises(function () {
/******/ 								if (applyOnUpdate) {
/******/ 									return internalApply(applyOnUpdate);
/******/ 								}
/******/ 								return setStatus("ready").then(function () {
/******/ 									return updatedModules;
/******/ 								});
/******/ 							});
/******/ 						});
/******/ 					});
/******/ 				});
/******/ 		}
/******/ 		
/******/ 		function hotApply(options) {
/******/ 			if (currentStatus !== "ready") {
/******/ 				return Promise.resolve().then(function () {
/******/ 					throw new Error(
/******/ 						"apply() is only allowed in ready status (state: " +
/******/ 							currentStatus +
/******/ 							")"
/******/ 					);
/******/ 				});
/******/ 			}
/******/ 			return internalApply(options);
/******/ 		}
/******/ 		
/******/ 		function internalApply(options) {
/******/ 			options = options || {};
/******/ 		
/******/ 			applyInvalidatedModules();
/******/ 		
/******/ 			var results = currentUpdateApplyHandlers.map(function (handler) {
/******/ 				return handler(options);
/******/ 			});
/******/ 			currentUpdateApplyHandlers = undefined;
/******/ 		
/******/ 			var errors = results
/******/ 				.map(function (r) {
/******/ 					return r.error;
/******/ 				})
/******/ 				.filter(Boolean);
/******/ 		
/******/ 			if (errors.length > 0) {
/******/ 				return setStatus("abort").then(function () {
/******/ 					throw errors[0];
/******/ 				});
/******/ 			}
/******/ 		
/******/ 			// Now in "dispose" phase
/******/ 			var disposePromise = setStatus("dispose");
/******/ 		
/******/ 			results.forEach(function (result) {
/******/ 				if (result.dispose) result.dispose();
/******/ 			});
/******/ 		
/******/ 			// Now in "apply" phase
/******/ 			var applyPromise = setStatus("apply");
/******/ 		
/******/ 			var error;
/******/ 			var reportError = function (err) {
/******/ 				if (!error) error = err;
/******/ 			};
/******/ 		
/******/ 			var outdatedModules = [];
/******/ 			results.forEach(function (result) {
/******/ 				if (result.apply) {
/******/ 					var modules = result.apply(reportError);
/******/ 					if (modules) {
/******/ 						for (var i = 0; i < modules.length; i++) {
/******/ 							outdatedModules.push(modules[i]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		
/******/ 			return Promise.all([disposePromise, applyPromise]).then(function () {
/******/ 				// handle errors in accept handlers and self accepted module load
/******/ 				if (error) {
/******/ 					return setStatus("fail").then(function () {
/******/ 						throw error;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				if (queuedInvalidatedModules) {
/******/ 					return internalApply(options).then(function (list) {
/******/ 						outdatedModules.forEach(function (moduleId) {
/******/ 							if (list.indexOf(moduleId) < 0) list.push(moduleId);
/******/ 						});
/******/ 						return list;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				return setStatus("idle").then(function () {
/******/ 					return outdatedModules;
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function applyInvalidatedModules() {
/******/ 			if (queuedInvalidatedModules) {
/******/ 				if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
/******/ 				Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 					queuedInvalidatedModules.forEach(function (moduleId) {
/******/ 						__webpack_require__.hmrI[key](
/******/ 							moduleId,
/******/ 							currentUpdateApplyHandlers
/******/ 						);
/******/ 					});
/******/ 				});
/******/ 				queuedInvalidatedModules = undefined;
/******/ 				return true;
/******/ 			}
/******/ 		}
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	!function() {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl + "../../";
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	!function() {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push(function(options) {
/******/ 			var originalFactory = options.factory;
/******/ 			options.factory = function(moduleObject, moduleExports, webpackRequire) {
/******/ 				var hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				var cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : function() {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/******/ 	/* webpack/runtime/consumes */
/******/ 	!function() {
/******/ 		var installedModules = {};
/******/ 		var moduleToHandlerMapping = {
/******/ 			"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-dev-runtime_js").then(function() { return function() { return __webpack_require__(/*! react/jsx-dev-runtime */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": false,
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "react/jsx-dev-runtime",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/styled-jsx/style/styled-jsx/style": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_st-9a91510").then(function() { return function() { return __webpack_require__(/*! styled-jsx/style */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/style.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^5.1.6",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "styled-jsx/style",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/react/react": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_index_js").then(function() { return function() { return __webpack_require__(/*! react */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": false,
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "react",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_cssinjs_1_21_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-de-f3c0a91").then(function() { return function() { return __webpack_require__(/*! @ant-design/cssinjs */ "../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/es/index.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^1.21.0",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/cssinjs",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-0a9ca10").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons/es/components/Context */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^5.3.7",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/icons/es/components/Context",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?369e": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_colors_7_1_0_node_modules_ant-design_colors_es_index_js-_f8480").then(function() { return function() { return __webpack_require__(/*! @ant-design/colors */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^7.1.0",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/colors",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/react-dom/react-dom": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_index_js").then(function() { return function() { return __webpack_require__(/*! react-dom */ "../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/index.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": false,
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "react-dom",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-587f871").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons/es/icons/BarsOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^5.3.7",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/icons/es/icons/BarsOutlined",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-d114ce1").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons/es/icons/LeftOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^5.3.7",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/icons/es/icons/LeftOutlined",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-9c06211").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons/es/icons/RightOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^5.3.7",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/icons/es/icons/RightOutlined",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-871a9e1").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons/es/icons/EllipsisOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^5.3.7",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/icons/es/icons/EllipsisOutlined",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/next/router/next/router": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1250").then(function() { return function() { return __webpack_require__(/*! next/router */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": false,
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "next/router",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/next/head/next/head?1388": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad0").then(function() { return function() { return __webpack_require__(/*! next/head */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "14.2.16",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "next/head",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/next/link/next/link?4ec1": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-dfbe5d0").then(function() { return function() { return __webpack_require__(/*! next/link */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "14.2.16",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "next/link",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_colors_7_1_0_node_modules_ant-design_colors_es_index_js-_f8481").then(function() { return function() { return __webpack_require__(/*! @ant-design/colors */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/es/index.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^7.0.0",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/colors",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_BarsOut-3927b4").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons-svg/es/asn/BarsOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^4.4.0",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/icons-svg/es/asn/BarsOutlined",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_Ellipsi-cf0c04").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons-svg/es/asn/EllipsisOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^4.4.0",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/icons-svg/es/asn/EllipsisOutlined",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_LeftOut-1fba7a").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons-svg/es/asn/LeftOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^4.4.0",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/icons-svg/es/asn/LeftOutlined",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_ant-design_icons-svg_4_4_2_node_modules_ant-design_icons-svg_es_asn_RightOu-993bc2").then(function() { return function() { return __webpack_require__(/*! @ant-design/icons-svg/es/asn/RightOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": "^4.4.0",
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false,
/******/ 					  "layer": null
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "@ant-design/icons-svg/es/asn/RightOutlined",
/******/ 			},
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime": {
/******/ 				getter: function() { return __webpack_require__.e("node_modules_pnpm_react_18_3_1_node_modules_react_jsx-runtime_js-_c1860").then(function() { return function() { return __webpack_require__(/*! react/jsx-runtime */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js"); }; }); },
/******/ 				shareInfo: {
/******/ 					shareConfig: {
/******/ 					  "fixedDependencies": false,
/******/ 					  "requiredVersion": false,
/******/ 					  "strictVersion": false,
/******/ 					  "singleton": true,
/******/ 					  "eager": false
/******/ 					},
/******/ 					scope: ["default"],
/******/ 				},
/******/ 				shareKey: "react/jsx-runtime",
/******/ 			}
/******/ 		};
/******/ 		// no consumes in initial chunks
/******/ 		var chunkMapping = {
/******/ 			"__federation_expose_SharedNav": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/styled-jsx/style/styled-jsx/style",
/******/ 				"webpack/sharing/consume/default/react/react",
/******/ 				"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?369e",
/******/ 				"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined",
/******/ 				"webpack/sharing/consume/default/next/router/next/router"
/******/ 			],
/******/ 			"__federation_expose_menu": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/next/router/next/router",
/******/ 				"webpack/sharing/consume/default/react/react",
/******/ 				"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?369e",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined"
/******/ 			],
/******/ 			"__federation_expose_pages__index": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/react/react",
/******/ 				"webpack/sharing/consume/default/next/head/next/head?1388"
/******/ 			],
/******/ 			"__federation_expose_pages__home__exposed_pages": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"__federation_expose_pages__home__test_broken_remotes": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/next/link/next/link?4ec1"
/******/ 			],
/******/ 			"__federation_expose_pages__home__test_remote_hook": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime"
/******/ 			],
/******/ 			"__federation_expose_pages__home__test_shared_nav": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/styled-jsx/style/styled-jsx/style",
/******/ 				"webpack/sharing/consume/default/react/react",
/******/ 				"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?369e",
/******/ 				"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined",
/******/ 				"webpack/sharing/consume/default/next/router/next/router"
/******/ 			],
/******/ 			"node_modules_pnpm_ant-design_cssinjs_1_21_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-de-f3c0a90": [
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-0a9ca11": [
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-587f870": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined",
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-871a9e0": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined",
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-d114ce0": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined",
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-9c06210": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined",
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-6478ab0": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad1": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-e15dbc0": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 				"webpack/sharing/consume/default/react/react",
/******/ 				"webpack/sharing/consume/default/react-dom/react-dom"
/******/ 			],
/******/ 			"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-dfbe5d0": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1251": [
/******/ 				"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-78b1ab0": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 				"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_client_js-_382a0": [
/******/ 				"webpack/sharing/consume/default/react-dom/react-dom"
/******/ 			],
/******/ 			"node_modules_pnpm_react-dom_18_3_1_react_18_3_1_node_modules_react-dom_index_js": [
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_react_18_3_1_node_modules_react_jsx-dev-runtime_js": [
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_react_18_3_1_node_modules_react_jsx-runtime_js-_c1861": [
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_st-9a91511": [
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_styled-jsx_5_1_1__babel_core_7_25_2_react_18_3_1_node_modules_styled-jsx_in-b28c190": [
/******/ 				"webpack/sharing/consume/default/react/react"
/******/ 			],
/******/ 			"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-59b1250": [
/******/ 				"webpack/sharing/consume/default/react-dom/react-dom",
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 			],
/******/ 			"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-587f871": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined"
/******/ 			],
/******/ 			"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-d114ce1": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined"
/******/ 			],
/******/ 			"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-9c06211": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined"
/******/ 			],
/******/ 			"node_modules_pnpm_ant-design_icons_5_5_1_react-dom_18_3_1_react_18_3_1_node_modules_ant-desig-871a9e1": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?25db",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined"
/******/ 			],
/******/ 			"node_modules_pnpm_next_14_2_16__babel_core_7_25_2_react-dom_18_3_1_react_18_3_1_node_modules_-2e0fad0": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 			]
/******/ 		};
/******/ 		__webpack_require__.f.consumes = function(chunkId, promises) {
/******/ 			__webpack_require__.federation.bundlerRuntime.consumes({
/******/ 			chunkMapping: chunkMapping,
/******/ 			installedModules: installedModules,
/******/ 			chunkId: chunkId,
/******/ 			moduleToHandlerMapping: moduleToHandlerMapping,
/******/ 			promises: promises,
/******/ 			webpackRequire:__webpack_require__
/******/ 			});
/******/ 		}
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/embed/federation */
/******/ 	!function() {
/******/ 		var oldStartup = __webpack_require__.x;
/******/ 		var hasRun = false;
/******/ 		__webpack_require__.x = function() {
/******/ 			if (!hasRun) {
/******/ 			  hasRun = true;
/******/ 			  __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-swc-loader.js??ruleSet[1].rules[7].oneOf[0].use[0]!./node_modules/.federation/entry.2e8b903b3a4b8118da0eb99c1e4f58da.js */ "./node_modules/.federation/entry.2e8b903b3a4b8118da0eb99c1e4f58da.js");
/******/ 			}
/******/ 			return oldStartup();
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = __webpack_require__.hmrS_jsonp = __webpack_require__.hmrS_jsonp || {
/******/ 			"home_app": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = function(chunkId, promises) {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(!/^webpack_container_remote_shop_Webpack(Pn|Sv)g$/.test(chunkId)) {
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise(function(resolve, reject) { installedChunkData = installedChunks[chunkId] = [resolve, reject]; });
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = function(event) {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						} else installedChunks[chunkId] = 0;
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		var currentUpdatedModulesList;
/******/ 		var waitingUpdateResolves = {};
/******/ 		function loadUpdateChunk(chunkId, updatedModulesList) {
/******/ 			currentUpdatedModulesList = updatedModulesList;
/******/ 			return new Promise(function(resolve, reject) {
/******/ 				waitingUpdateResolves[chunkId] = resolve;
/******/ 				// start update chunk loading
/******/ 				var url = __webpack_require__.p + __webpack_require__.hu(chunkId);
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				var error = new Error();
/******/ 				var loadingEnded = function(event) {
/******/ 					if(waitingUpdateResolves[chunkId]) {
/******/ 						waitingUpdateResolves[chunkId] = undefined
/******/ 						var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 						var realSrc = event && event.target && event.target.src;
/******/ 						error.message = 'Loading hot update chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 						error.name = 'ChunkLoadError';
/******/ 						error.type = errorType;
/******/ 						error.request = realSrc;
/******/ 						reject(error);
/******/ 					}
/******/ 				};
/******/ 				__webpack_require__.l(url, loadingEnded);
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		self["webpackHotUpdatehome_app"] = function(chunkId, moreModules, runtime) {
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					currentUpdate[moduleId] = moreModules[moduleId];
/******/ 					if(currentUpdatedModulesList) currentUpdatedModulesList.push(moduleId);
/******/ 				}
/******/ 			}
/******/ 			if(runtime) currentUpdateRuntime.push(runtime);
/******/ 			if(waitingUpdateResolves[chunkId]) {
/******/ 				waitingUpdateResolves[chunkId]();
/******/ 				waitingUpdateResolves[chunkId] = undefined;
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var currentUpdateChunks;
/******/ 		var currentUpdate;
/******/ 		var currentUpdateRemovedChunks;
/******/ 		var currentUpdateRuntime;
/******/ 		function applyHandler(options) {
/******/ 			if (__webpack_require__.f) delete __webpack_require__.f.jsonpHmr;
/******/ 			currentUpdateChunks = undefined;
/******/ 			function getAffectedModuleEffects(updateModuleId) {
/******/ 				var outdatedModules = [updateModuleId];
/******/ 				var outdatedDependencies = {};
/******/ 		
/******/ 				var queue = outdatedModules.map(function (id) {
/******/ 					return {
/******/ 						chain: [id],
/******/ 						id: id
/******/ 					};
/******/ 				});
/******/ 				while (queue.length > 0) {
/******/ 					var queueItem = queue.pop();
/******/ 					var moduleId = queueItem.id;
/******/ 					var chain = queueItem.chain;
/******/ 					var module = __webpack_require__.c[moduleId];
/******/ 					if (
/******/ 						!module ||
/******/ 						(module.hot._selfAccepted && !module.hot._selfInvalidated)
/******/ 					)
/******/ 						continue;
/******/ 					if (module.hot._selfDeclined) {
/******/ 						return {
/******/ 							type: "self-declined",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					if (module.hot._main) {
/******/ 						return {
/******/ 							type: "unaccepted",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					for (var i = 0; i < module.parents.length; i++) {
/******/ 						var parentId = module.parents[i];
/******/ 						var parent = __webpack_require__.c[parentId];
/******/ 						if (!parent) continue;
/******/ 						if (parent.hot._declinedDependencies[moduleId]) {
/******/ 							return {
/******/ 								type: "declined",
/******/ 								chain: chain.concat([parentId]),
/******/ 								moduleId: moduleId,
/******/ 								parentId: parentId
/******/ 							};
/******/ 						}
/******/ 						if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 						if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 							if (!outdatedDependencies[parentId])
/******/ 								outdatedDependencies[parentId] = [];
/******/ 							addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 							continue;
/******/ 						}
/******/ 						delete outdatedDependencies[parentId];
/******/ 						outdatedModules.push(parentId);
/******/ 						queue.push({
/******/ 							chain: chain.concat([parentId]),
/******/ 							id: parentId
/******/ 						});
/******/ 					}
/******/ 				}
/******/ 		
/******/ 				return {
/******/ 					type: "accepted",
/******/ 					moduleId: updateModuleId,
/******/ 					outdatedModules: outdatedModules,
/******/ 					outdatedDependencies: outdatedDependencies
/******/ 				};
/******/ 			}
/******/ 		
/******/ 			function addAllToSet(a, b) {
/******/ 				for (var i = 0; i < b.length; i++) {
/******/ 					var item = b[i];
/******/ 					if (a.indexOf(item) === -1) a.push(item);
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			// at begin all updates modules are outdated
/******/ 			// the "outdated" status can propagate to parents if they don't accept the children
/******/ 			var outdatedDependencies = {};
/******/ 			var outdatedModules = [];
/******/ 			var appliedUpdate = {};
/******/ 		
/******/ 			var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" + module.id + ") to disposed module"
/******/ 				);
/******/ 			};
/******/ 		
/******/ 			for (var moduleId in currentUpdate) {
/******/ 				if (__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 					var newModuleFactory = currentUpdate[moduleId];
/******/ 					/** @type {TODO} */
/******/ 					var result = newModuleFactory
/******/ 						? getAffectedModuleEffects(moduleId)
/******/ 						: {
/******/ 								type: "disposed",
/******/ 								moduleId: moduleId
/******/ 							};
/******/ 					/** @type {Error|false} */
/******/ 					var abortError = false;
/******/ 					var doApply = false;
/******/ 					var doDispose = false;
/******/ 					var chainInfo = "";
/******/ 					if (result.chain) {
/******/ 						chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 					}
/******/ 					switch (result.type) {
/******/ 						case "self-declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of self decline: " +
/******/ 										result.moduleId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of declined dependency: " +
/******/ 										result.moduleId +
/******/ 										" in " +
/******/ 										result.parentId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "unaccepted":
/******/ 							if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 							if (!options.ignoreUnaccepted)
/******/ 								abortError = new Error(
/******/ 									"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "accepted":
/******/ 							if (options.onAccepted) options.onAccepted(result);
/******/ 							doApply = true;
/******/ 							break;
/******/ 						case "disposed":
/******/ 							if (options.onDisposed) options.onDisposed(result);
/******/ 							doDispose = true;
/******/ 							break;
/******/ 						default:
/******/ 							throw new Error("Unexception type " + result.type);
/******/ 					}
/******/ 					if (abortError) {
/******/ 						return {
/******/ 							error: abortError
/******/ 						};
/******/ 					}
/******/ 					if (doApply) {
/******/ 						appliedUpdate[moduleId] = newModuleFactory;
/******/ 						addAllToSet(outdatedModules, result.outdatedModules);
/******/ 						for (moduleId in result.outdatedDependencies) {
/******/ 							if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
/******/ 								if (!outdatedDependencies[moduleId])
/******/ 									outdatedDependencies[moduleId] = [];
/******/ 								addAllToSet(
/******/ 									outdatedDependencies[moduleId],
/******/ 									result.outdatedDependencies[moduleId]
/******/ 								);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 					if (doDispose) {
/******/ 						addAllToSet(outdatedModules, [result.moduleId]);
/******/ 						appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 			currentUpdate = undefined;
/******/ 		
/******/ 			// Store self accepted outdated modules to require them later by the module system
/******/ 			var outdatedSelfAcceptedModules = [];
/******/ 			for (var j = 0; j < outdatedModules.length; j++) {
/******/ 				var outdatedModuleId = outdatedModules[j];
/******/ 				var module = __webpack_require__.c[outdatedModuleId];
/******/ 				if (
/******/ 					module &&
/******/ 					(module.hot._selfAccepted || module.hot._main) &&
/******/ 					// removed self-accepted modules should not be required
/******/ 					appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
/******/ 					// when called invalidate self-accepting is not possible
/******/ 					!module.hot._selfInvalidated
/******/ 				) {
/******/ 					outdatedSelfAcceptedModules.push({
/******/ 						module: outdatedModuleId,
/******/ 						require: module.hot._requireSelf,
/******/ 						errorHandler: module.hot._selfAccepted
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			var moduleOutdatedDependencies;
/******/ 		
/******/ 			return {
/******/ 				dispose: function () {
/******/ 					currentUpdateRemovedChunks.forEach(function (chunkId) {
/******/ 						delete installedChunks[chunkId];
/******/ 					});
/******/ 					currentUpdateRemovedChunks = undefined;
/******/ 		
/******/ 					var idx;
/******/ 					var queue = outdatedModules.slice();
/******/ 					while (queue.length > 0) {
/******/ 						var moduleId = queue.pop();
/******/ 						var module = __webpack_require__.c[moduleId];
/******/ 						if (!module) continue;
/******/ 		
/******/ 						var data = {};
/******/ 		
/******/ 						// Call dispose handlers
/******/ 						var disposeHandlers = module.hot._disposeHandlers;
/******/ 						for (j = 0; j < disposeHandlers.length; j++) {
/******/ 							disposeHandlers[j].call(null, data);
/******/ 						}
/******/ 						__webpack_require__.hmrD[moduleId] = data;
/******/ 		
/******/ 						// disable module (this disables requires from this module)
/******/ 						module.hot.active = false;
/******/ 		
/******/ 						// remove module from cache
/******/ 						delete __webpack_require__.c[moduleId];
/******/ 		
/******/ 						// when disposing there is no need to call dispose handler
/******/ 						delete outdatedDependencies[moduleId];
/******/ 		
/******/ 						// remove "parents" references from all children
/******/ 						for (j = 0; j < module.children.length; j++) {
/******/ 							var child = __webpack_require__.c[module.children[j]];
/******/ 							if (!child) continue;
/******/ 							idx = child.parents.indexOf(moduleId);
/******/ 							if (idx >= 0) {
/******/ 								child.parents.splice(idx, 1);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// remove outdated dependency from module children
/******/ 					var dependency;
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									dependency = moduleOutdatedDependencies[j];
/******/ 									idx = module.children.indexOf(dependency);
/******/ 									if (idx >= 0) module.children.splice(idx, 1);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				},
/******/ 				apply: function (reportError) {
/******/ 					// insert new code
/******/ 					for (var updateModuleId in appliedUpdate) {
/******/ 						if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
/******/ 							__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// run new runtime modules
/******/ 					for (var i = 0; i < currentUpdateRuntime.length; i++) {
/******/ 						currentUpdateRuntime[i](__webpack_require__);
/******/ 					}
/******/ 		
/******/ 					// call accept handlers
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							var module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								var callbacks = [];
/******/ 								var errorHandlers = [];
/******/ 								var dependenciesForCallbacks = [];
/******/ 								for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									var dependency = moduleOutdatedDependencies[j];
/******/ 									var acceptCallback =
/******/ 										module.hot._acceptedDependencies[dependency];
/******/ 									var errorHandler =
/******/ 										module.hot._acceptedErrorHandlers[dependency];
/******/ 									if (acceptCallback) {
/******/ 										if (callbacks.indexOf(acceptCallback) !== -1) continue;
/******/ 										callbacks.push(acceptCallback);
/******/ 										errorHandlers.push(errorHandler);
/******/ 										dependenciesForCallbacks.push(dependency);
/******/ 									}
/******/ 								}
/******/ 								for (var k = 0; k < callbacks.length; k++) {
/******/ 									try {
/******/ 										callbacks[k].call(null, moduleOutdatedDependencies);
/******/ 									} catch (err) {
/******/ 										if (typeof errorHandlers[k] === "function") {
/******/ 											try {
/******/ 												errorHandlers[k](err, {
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k]
/******/ 												});
/******/ 											} catch (err2) {
/******/ 												if (options.onErrored) {
/******/ 													options.onErrored({
/******/ 														type: "accept-error-handler-errored",
/******/ 														moduleId: outdatedModuleId,
/******/ 														dependencyId: dependenciesForCallbacks[k],
/******/ 														error: err2,
/******/ 														originalError: err
/******/ 													});
/******/ 												}
/******/ 												if (!options.ignoreErrored) {
/******/ 													reportError(err2);
/******/ 													reportError(err);
/******/ 												}
/******/ 											}
/******/ 										} else {
/******/ 											if (options.onErrored) {
/******/ 												options.onErrored({
/******/ 													type: "accept-errored",
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k],
/******/ 													error: err
/******/ 												});
/******/ 											}
/******/ 											if (!options.ignoreErrored) {
/******/ 												reportError(err);
/******/ 											}
/******/ 										}
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// Load self accepted modules
/******/ 					for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
/******/ 						var item = outdatedSelfAcceptedModules[o];
/******/ 						var moduleId = item.module;
/******/ 						try {
/******/ 							item.require(moduleId);
/******/ 						} catch (err) {
/******/ 							if (typeof item.errorHandler === "function") {
/******/ 								try {
/******/ 									item.errorHandler(err, {
/******/ 										moduleId: moduleId,
/******/ 										module: __webpack_require__.c[moduleId]
/******/ 									});
/******/ 								} catch (err1) {
/******/ 									if (options.onErrored) {
/******/ 										options.onErrored({
/******/ 											type: "self-accept-error-handler-errored",
/******/ 											moduleId: moduleId,
/******/ 											error: err1,
/******/ 											originalError: err
/******/ 										});
/******/ 									}
/******/ 									if (!options.ignoreErrored) {
/******/ 										reportError(err1);
/******/ 										reportError(err);
/******/ 									}
/******/ 								}
/******/ 							} else {
/******/ 								if (options.onErrored) {
/******/ 									options.onErrored({
/******/ 										type: "self-accept-errored",
/******/ 										moduleId: moduleId,
/******/ 										error: err
/******/ 									});
/******/ 								}
/******/ 								if (!options.ignoreErrored) {
/******/ 									reportError(err);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					return outdatedModules;
/******/ 				}
/******/ 			};
/******/ 		}
/******/ 		__webpack_require__.hmrI.jsonp = function (moduleId, applyHandlers) {
/******/ 			if (!currentUpdate) {
/******/ 				currentUpdate = {};
/******/ 				currentUpdateRuntime = [];
/******/ 				currentUpdateRemovedChunks = [];
/******/ 				applyHandlers.push(applyHandler);
/******/ 			}
/******/ 			if (!__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 				currentUpdate[moduleId] = __webpack_require__.m[moduleId];
/******/ 			}
/******/ 		};
/******/ 		__webpack_require__.hmrC.jsonp = function (
/******/ 			chunkIds,
/******/ 			removedChunks,
/******/ 			removedModules,
/******/ 			promises,
/******/ 			applyHandlers,
/******/ 			updatedModulesList
/******/ 		) {
/******/ 			applyHandlers.push(applyHandler);
/******/ 			currentUpdateChunks = {};
/******/ 			currentUpdateRemovedChunks = removedChunks;
/******/ 			currentUpdate = removedModules.reduce(function (obj, key) {
/******/ 				obj[key] = false;
/******/ 				return obj;
/******/ 			}, {});
/******/ 			currentUpdateRuntime = [];
/******/ 			chunkIds.forEach(function (chunkId) {
/******/ 				if (
/******/ 					__webpack_require__.o(installedChunks, chunkId) &&
/******/ 					installedChunks[chunkId] !== undefined
/******/ 				) {
/******/ 					promises.push(loadUpdateChunk(chunkId, updatedModulesList));
/******/ 					currentUpdateChunks[chunkId] = true;
/******/ 				} else {
/******/ 					currentUpdateChunks[chunkId] = false;
/******/ 				}
/******/ 			});
/******/ 			if (__webpack_require__.f) {
/******/ 				__webpack_require__.f.jsonpHmr = function (chunkId, promises) {
/******/ 					if (
/******/ 						currentUpdateChunks &&
/******/ 						__webpack_require__.o(currentUpdateChunks, chunkId) &&
/******/ 						!currentUpdateChunks[chunkId]
/******/ 					) {
/******/ 						promises.push(loadUpdateChunk(chunkId));
/******/ 						currentUpdateChunks[chunkId] = true;
/******/ 					}
/******/ 				};
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.hmrM = function() {
/******/ 			if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
/******/ 			return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then(function(response) {
/******/ 				if(response.status === 404) return; // no update available
/******/ 				if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
/******/ 				return response.json();
/******/ 			});
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some(function(id) { return installedChunks[id] !== 0; })) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkhome_app"] = self["webpackChunkhome_app"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	// run runtime startup
/******/ 	__webpack_require__.x();
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__("webpack/container/entry/home_app");
/******/ 	window.home_app = __webpack_exports__;
/******/ 	
/******/ })()
;