/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../packages/error-codes/dist/index.esm.mjs":
/*!*****************************************************!*\
  !*** ../../packages/error-codes/dist/index.esm.mjs ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BUILD_001: () => (/* binding */ BUILD_001),
/* harmony export */   RUNTIME_001: () => (/* binding */ RUNTIME_001),
/* harmony export */   RUNTIME_002: () => (/* binding */ RUNTIME_002),
/* harmony export */   RUNTIME_003: () => (/* binding */ RUNTIME_003),
/* harmony export */   RUNTIME_004: () => (/* binding */ RUNTIME_004),
/* harmony export */   RUNTIME_005: () => (/* binding */ RUNTIME_005),
/* harmony export */   RUNTIME_006: () => (/* binding */ RUNTIME_006),
/* harmony export */   RUNTIME_007: () => (/* binding */ RUNTIME_007),
/* harmony export */   RUNTIME_008: () => (/* binding */ RUNTIME_008),
/* harmony export */   TYPE_001: () => (/* binding */ TYPE_001),
/* harmony export */   buildDescMap: () => (/* binding */ buildDescMap),
/* harmony export */   errorDescMap: () => (/* binding */ errorDescMap),
/* harmony export */   getShortErrorMsg: () => (/* binding */ getShortErrorMsg),
/* harmony export */   runtimeDescMap: () => (/* binding */ runtimeDescMap),
/* harmony export */   typeDescMap: () => (/* binding */ typeDescMap)
/* harmony export */ });
const RUNTIME_001 = "RUNTIME-001";
const RUNTIME_002 = "RUNTIME-002";
const RUNTIME_003 = "RUNTIME-003";
const RUNTIME_004 = "RUNTIME-004";
const RUNTIME_005 = "RUNTIME-005";
const RUNTIME_006 = "RUNTIME-006";
const RUNTIME_007 = "RUNTIME-007";
const RUNTIME_008 = "RUNTIME-008";
const TYPE_001 = "TYPE-001";
const BUILD_001 = "BUILD-001";
const getDocsUrl = (errorCode)=>{
    const type = errorCode.split("-")[0].toLowerCase();
    return `View the docs to see how to solve: https://module-federation.io/guide/troubleshooting/${type}/${errorCode}`;
};
const getShortErrorMsg = (errorCode, errorDescMap, args, originalErrorMsg)=>{
    const msg = [
        `${[
            errorDescMap[errorCode]
        ]} #${errorCode}`
    ];
    args && msg.push(`args: ${JSON.stringify(args)}`);
    msg.push(getDocsUrl(errorCode));
    originalErrorMsg && msg.push(`Original Error Message:\n ${originalErrorMsg}`);
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
const runtimeDescMap = {
    [RUNTIME_001]: "Failed to get remoteEntry exports.",
    [RUNTIME_002]: 'The remote entry interface does not contain "init"',
    [RUNTIME_003]: "Failed to get manifest.",
    [RUNTIME_004]: "Failed to locate remote.",
    [RUNTIME_005]: "Invalid loadShareSync function call from bundler runtime",
    [RUNTIME_006]: "Invalid loadShareSync function call from runtime",
    [RUNTIME_007]: "Failed to get remote snapshot.",
    [RUNTIME_008]: "Failed to load script resources."
};
const typeDescMap = {
    [TYPE_001]: "Failed to generate type declaration. Execute the below cmd to reproduce and fix the error."
};
const buildDescMap = {
    [BUILD_001]: "Failed to find expose module."
};
const errorDescMap = _extends({}, runtimeDescMap, typeDescMap, buildDescMap);



/***/ }),

/***/ "../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.cjs?runtimePlugin":
/*!*******************************************************************************************!*\
  !*** ../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.cjs?runtimePlugin ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports["default"] = default_1;
function default_1() {
    return {
        name: "next-internal-plugin",
        createScript: function(args) {
            const url = args.url;
            const attrs = args.attrs;
            if (false) {}
            return undefined;
        },
        errorLoadRemote: function(args) {
            const id = args.id;
            const error = args.error;
            const from = args.from;
            //@ts-ignore
            globalThis.moduleGraphDirty = true;
            console.error(id, "offline");
            const pg = function() {
                console.error(id, "offline", error);
                return null;
            };
            pg.getInitialProps = function(ctx) {
                return {};
            };
            let mod;
            if (from === "build") {
                mod = function() {
                    return {
                        __esModule: true,
                        default: pg,
                        getServerSideProps: function() {
                            return {
                                props: {}
                            };
                        }
                    };
                };
            } else {
                mod = {
                    default: pg,
                    getServerSideProps: function() {
                        return {
                            props: {}
                        };
                    }
                };
            }
            return mod;
        },
        beforeInit: function(args) {
            if (!globalThis.usedChunks) globalThis.usedChunks = new Set();
            if (typeof __webpack_require__.j === "string" && !__webpack_require__.j.startsWith("webpack")) {
                return args;
            }
            const moduleCache = args.origin.moduleCache;
            const name = args.origin.name;
            let gs;
            try {
                gs = new Function("return globalThis")();
            } catch (e) {
                gs = globalThis; // fallback for browsers without 'unsafe-eval' CSP policy enabled
            }
            //@ts-ignore
            const attachedRemote = gs[name];
            if (attachedRemote) {
                moduleCache.set(name, attachedRemote);
            }
            return args;
        },
        init: function(args) {
            return args;
        },
        beforeRequest: function(args) {
            const options = args.options;
            const id = args.id;
            const remoteName = id.split("/").shift();
            const remote = options.remotes.find(function(remote) {
                return remote.name === remoteName;
            });
            if (!remote) return args;
            if (remote && remote.entry && remote.entry.includes("?t=")) {
                return args;
            }
            remote.entry = remote.entry + "?t=" + Date.now();
            return args;
        },
        afterResolve: function(args) {
            return args;
        },
        onLoad: function(args) {
            const exposeModuleFactory = args.exposeModuleFactory;
            const exposeModule = args.exposeModule;
            const id = args.id;
            const moduleOrFactory = exposeModuleFactory || exposeModule;
            if (!moduleOrFactory) return args;
            if (true) {
                let exposedModuleExports;
                try {
                    exposedModuleExports = moduleOrFactory();
                } catch (e) {
                    exposedModuleExports = moduleOrFactory;
                }
                const handler = {
                    get: function(target, prop, receiver) {
                        if (target === exposedModuleExports && typeof exposedModuleExports[prop] === "function") {
                            return function() {
                                globalThis.usedChunks.add(id);
                                //eslint-disable-next-line
                                return exposedModuleExports[prop].apply(this, arguments);
                            };
                        }
                        const originalMethod = target[prop];
                        if (typeof originalMethod === "function") {
                            const proxiedFunction = function() {
                                globalThis.usedChunks.add(id);
                                //eslint-disable-next-line
                                return originalMethod.apply(this, arguments);
                            };
                            Object.keys(originalMethod).forEach(function(prop) {
                                Object.defineProperty(proxiedFunction, prop, {
                                    value: originalMethod[prop],
                                    writable: true,
                                    enumerable: true,
                                    configurable: true
                                });
                            });
                            return proxiedFunction;
                        }
                        return Reflect.get(target, prop, receiver);
                    }
                };
                if (typeof exposedModuleExports === "function") {
                    exposedModuleExports = new Proxy(exposedModuleExports, handler);
                    const staticProps = Object.getOwnPropertyNames(exposedModuleExports);
                    staticProps.forEach(function(prop) {
                        if (typeof exposedModuleExports[prop] === "function") {
                            exposedModuleExports[prop] = new Proxy(exposedModuleExports[prop], handler);
                        }
                    });
                    return function() {
                        return exposedModuleExports;
                    };
                } else {
                    exposedModuleExports = new Proxy(exposedModuleExports, handler);
                }
                return exposedModuleExports;
            }
            return args;
        },
        loadRemoteSnapshot (args) {
            const { from, remoteSnapshot, manifestUrl, manifestJson, options } = args;
            // ensure snapshot is loaded from manifest
            if (from !== "manifest" || !manifestUrl || !manifestJson || !("publicPath" in remoteSnapshot)) {
                return args;
            }
            // re-assign publicPath based on remoteEntry location if in browser nextjs remote
            const { publicPath } = remoteSnapshot;
            if (options.inBrowser && publicPath.includes("/_next/")) {
                remoteSnapshot.publicPath = publicPath.substring(0, publicPath.lastIndexOf("/_next/") + 7);
            } else {
                const serverPublicPath = manifestUrl.substring(0, manifestUrl.indexOf("mf-manifest.json"));
                remoteSnapshot.publicPath = serverPublicPath;
            }
            if ("publicPath" in manifestJson.metaData) {
                manifestJson.metaData.publicPath = remoteSnapshot.publicPath;
            }
            return args;
        },
        resolveShare: function(args) {
            if (args.pkgName !== "react" && args.pkgName !== "react-dom" && !args.pkgName.startsWith("next/")) {
                return args;
            }
            const shareScopeMap = args.shareScopeMap;
            const scope = args.scope;
            const pkgName = args.pkgName;
            const version = args.version;
            const GlobalFederation = args.GlobalFederation;
            const host = GlobalFederation["__INSTANCES__"][0];
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
        beforeLoadShare: async function(args) {
            return args;
        }
    };
} //# sourceMappingURL=runtimePlugin.js.map


/***/ }),

/***/ "../../packages/node/dist/src/runtimePlugin.js?runtimePlugin":
/*!*******************************************************************!*\
  !*** ../../packages/node/dist/src/runtimePlugin.js?runtimePlugin ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports["default"] = default_1;
const node_chunk_loader_1 = __webpack_require__(/*! ./utils/node-chunk-loader */ "../../packages/node/dist/src/utils/node-chunk-loader.js");
const hmr_runtime_patch_1 = __webpack_require__(/*! ./utils/hmr-runtime-patch */ "../../packages/node/dist/src/utils/hmr-runtime-patch.js");
/**
 * Creates a Node.js Federation runtime plugin that patches webpack chunk loading and HMR runtime
 * @returns FederationRuntimePlugin instance
 */ function default_1() {
    return {
        name: "node-federation-plugin",
        beforeInit (args) {
            try {
                // Initialize federation chunk loading
                (0, node_chunk_loader_1.initializeFederationChunkLoading)(args);
                // Initialize HMR runtime patching for hot module replacement
                (0, hmr_runtime_patch_1.initializeHMRRuntimePatchingFromArgs)(args);
                return args;
            } catch (error) {
                console.error("Failed to initialize node-federation-plugin:", error);
                return args;
            }
        }
    };
} //# sourceMappingURL=runtimePlugin.js.map


/***/ }),

/***/ "../../packages/node/dist/src/utils sync recursive":
/*!************************************************!*\
  !*** ../../packages/node/dist/src/utils/ sync ***!
  \************************************************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "../../packages/node/dist/src/utils sync recursive";
module.exports = webpackEmptyContext;

/***/ }),

/***/ "../../packages/node/dist/src/utils/custom-hmr-helpers.js":
/*!****************************************************************!*\
  !*** ../../packages/node/dist/src/utils/custom-hmr-helpers.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.applyInMemoryHotUpdate = applyInMemoryHotUpdate;
exports.applyHotUpdateFromStringsByPatching = applyInMemoryHotUpdate;
exports.injectInMemoryHMRRuntime = injectInMemoryHMRRuntime;
const hmr_runtime_1 = __webpack_require__(/*! ./hmr-runtime */ "../../packages/node/dist/src/utils/hmr-runtime.js");
// Injects the necessary webpack runtime patches for in-memory HMR functionality
function injectInMemoryHMRRuntime(__nested_webpack_require_432__) {
    if ( false || __nested_webpack_require_432__.setInMemoryManifest) {
        console.warn("[Custom HMR Helper] __webpack_require__ not available, skipping runtime injection");
        return;
    }
    // we need to patch the runtime module for chunk loading hot update chunks to support in memory
    /* webpack/runtime/readFile chunk loading */ (()=>{
        // no baseURI
        // object to store loaded chunks
        // "0" means "already loaded", Promise means loading
        var installedChunks = __nested_webpack_require_432__.hmrS_readFileVm = __nested_webpack_require_432__.hmrS_readFileVm || {
            index: 0
        };
        // Global storage for in-memory chunk content
        var inMemoryChunks = {};
        // no on chunks loaded
        // no chunk install function needed
        // no chunk loading
        // no external install chunk
        // Global storage for in-memory manifest content
        var manifestRef = {
            value: null
        };
        // Create the complete HMR runtime with shared state
        var hmrRuntime = (0, hmr_runtime_1.createHMRRuntime)(__nested_webpack_require_432__, installedChunks, inMemoryChunks, manifestRef);
        // Assign the HMR handlers
        __nested_webpack_require_432__.hmrI["readFileVm"] = hmrRuntime.hmrHandlers.hmrI;
        __nested_webpack_require_432__.hmrC["readFileVm"] = hmrRuntime.hmrHandlers.hmrC;
        // Assign the HMR manifest loader
        __nested_webpack_require_432__.hmrM = hmrRuntime.hmrManifestLoader;
        // Helper functions to set in-memory content
        __nested_webpack_require_432__.setInMemoryManifest = function(manifestContent) {
            manifestRef.value = manifestContent;
        };
        __nested_webpack_require_432__.setInMemoryChunk = function(chunkId, chunkContent) {
            inMemoryChunks[chunkId] = chunkContent;
        };
    })();
}
/**
 * Applies hot module replacement using in-memory content and webpack's native HMR system.
 * This function injects the necessary runtime patches and triggers webpack's HMR update flow.
 * @param moduleObj - The module object (usually 'module') with .hot API
 * @param webpackRequire - The __webpack_require__ function with HMR capabilities
 * @param manifestJsonString - The JSON string content of the HMR manifest
 * @param chunkJsStringsMap - A map of chunkId to the JS string content of the HMR chunk
 * @returns A promise that resolves to an array of module IDs that were updated
 */ function applyInMemoryHotUpdate(moduleObj, webpackRequire, manifestJsonString, chunkJsStringsMap) {
    // Applying update using patched runtime modules
    return new Promise((resolve, reject)=>{
        try {
            // Check if module.hot is available
            if (!moduleObj || !moduleObj.hot) {
                reject(new Error("[HMR] Hot Module Replacement is disabled."));
                return;
            }
            if (!webpackRequire) {
                reject(new Error("[HMR] __webpack_require__ is not available."));
                return;
            }
            // Inject the in-memory HMR runtime if not already injected
            if (!webpackRequire.setInMemoryManifest) {
                // Injecting in-memory HMR runtime
                injectInMemoryHMRRuntime(webpackRequire);
            }
            // Setting in-memory content for HMR
            // Set the in-memory manifest content
            if (webpackRequire.setInMemoryManifest) {
                webpackRequire.setInMemoryManifest(manifestJsonString);
            // Set in-memory manifest
            } else {
            // setInMemoryManifest not available
            }
            // Set the in-memory chunk content for each chunk
            if (webpackRequire.setInMemoryChunk) {
                for(const chunkId in chunkJsStringsMap){
                    webpackRequire.setInMemoryChunk(chunkId, chunkJsStringsMap[chunkId]);
                // Set in-memory chunk
                }
            } else {
            // setInMemoryChunk not available
            }
            console.log("\uD83D\uDCCA [Custom HMR Helper] Current HMR status:", moduleObj.hot.status());
            if (moduleObj.hot.status() === "idle") {
                moduleObj.hot.check(true) // true means auto-apply
                .then((updatedModules)=>{
                    if (!updatedModules) {
                        console.log("ℹ️ [Custom HMR Helper] No updates detected by webpack");
                        resolve([]);
                        return;
                    }
                    // Update applied
                    resolve(updatedModules || []);
                }).catch((error)=>{
                    const status = moduleObj.hot.status();
                    if ([
                        "abort",
                        "fail"
                    ].indexOf(status) >= 0) {
                        console.error("[Custom HMR Helper] Cannot apply update:", error);
                        console.error("[Custom HMR Helper] You need to restart the application!");
                    } else {
                        console.error("[Custom HMR Helper] Update failed:", error);
                    }
                    reject(error);
                });
            } else {
                console.warn(`⚠️ [Custom HMR Helper] HMR not in idle state (${moduleObj.hot.status()}), cannot check for updates`);
                resolve([]);
            }
        } catch (error) {
            console.error("[Custom HMR Helper] Error processing update:", error);
            reject(error);
        }
    });
} //# sourceMappingURL=custom-hmr-helpers.js.map


/***/ }),

/***/ "../../packages/node/dist/src/utils/hmr-runtime-patch.js":
/*!***************************************************************!*\
  !*** ../../packages/node/dist/src/utils/hmr-runtime-patch.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.initializeHMRRuntimePatching = initializeHMRRuntimePatching;
exports.initializeHMRRuntimePatchingFromArgs = initializeHMRRuntimePatchingFromArgs;
const custom_hmr_helpers_1 = __webpack_require__(/*! ./custom-hmr-helpers */ "../../packages/node/dist/src/utils/custom-hmr-helpers.js");
/**
 * Patches webpack require with HMR runtime capabilities for Module Federation
 * This function integrates HMR functionality into the webpack runtime to support
 * hot module replacement in federation environments.
 *
 * @param args - Runtime initialization arguments from Module Federation
 */ function initializeHMRRuntimePatching(args) {
    try {
        // Check if we're in a webpack environment with __webpack_require__ available
        if (typeof globalThis !== "undefined" && "__webpack_require__" in globalThis) {
            const webpackRequire = globalThis.__webpack_require__;
            if (typeof webpackRequire === "function") {
                // Inject HMR runtime into webpack require
                (0, custom_hmr_helpers_1.injectInMemoryHMRRuntime)(webpackRequire);
                console.log("[HMR Runtime Plugin] Successfully patched webpack require with HMR capabilities");
            } else {
                console.warn("[HMR Runtime Plugin] __webpack_require__ is not a function, skipping HMR patch");
            }
        } else {
            console.warn("[HMR Runtime Plugin] __webpack_require__ not available, skipping HMR patch");
        }
    } catch (error) {
        console.error("[HMR Runtime Plugin] Failed to initialize HMR runtime patching:", error);
    }
}
/**
 * Alternative approach to patch webpack require when it's available on the args
 * Some federation setups might provide webpack require through the args object
 *
 * @param args - Runtime initialization arguments that might contain webpack require
 */ function initializeHMRRuntimePatchingFromArgs(args) {
    try {
        // Check if webpack require is available in args
        const webpackRequire = args?.__webpack_require__ || args?.webpackRequire;
        if (webpackRequire && typeof webpackRequire === "function") {
            (0, custom_hmr_helpers_1.injectInMemoryHMRRuntime)(webpackRequire);
            console.log("[HMR Runtime Plugin] Successfully patched webpack require from args with HMR capabilities");
            return;
        }
        // Fallback to global approach
        initializeHMRRuntimePatching(args);
    } catch (error) {
        console.error("[HMR Runtime Plugin] Failed to initialize HMR runtime patching from args:", error);
    }
} //# sourceMappingURL=hmr-runtime-patch.js.map


/***/ }),

/***/ "../../packages/node/dist/src/utils/hmr-runtime.js":
/*!*********************************************************!*\
  !*** ../../packages/node/dist/src/utils/hmr-runtime.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var __createBinding = (void 0) && (void 0).__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = (void 0) && (void 0).__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = (void 0) && (void 0).__importStar || function() {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o) {
            var ar = [];
            for(var k in o)if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
            for(var k = ownKeys(mod), i = 0; i < k.length; i++)if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
    };
}();
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.createLoadUpdateChunk = createLoadUpdateChunk;
exports.createApplyHandler = createApplyHandler;
exports.createHMRManifestLoader = createHMRManifestLoader;
exports.createHMRHandlers = createHMRHandlers;
exports.createHMRRuntime = createHMRRuntime;
const vm = __importStar(__webpack_require__(/*! vm */ "vm"));
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
/**
 * Creates the loadUpdateChunk function for HMR
 * @param __webpack_require__ - The webpack require function
 * @param inMemoryChunks - Storage for in-memory chunks
 * @param state - Shared state object
 * @returns The loadUpdateChunk function
 */ function createLoadUpdateChunk(__nested_webpack_require_2211__, inMemoryChunks, state) {
    return function loadUpdateChunk(chunkId, updatedModulesList) {
        return new Promise((resolve, reject)=>{
            // Initialize currentUpdate if not already done
            if (!state.currentUpdate) {
                state.currentUpdate = {};
            }
            // Check if we have in-memory content for this chunk
            if (inMemoryChunks[chunkId]) {
                var content = inMemoryChunks[chunkId];
                var update = {};
                var filename = "in-memory-" + chunkId + ".js";
                vm.runInThisContext("(function(exports, require, __dirname, __filename) {" + content + "\n})", filename)(update, __webpack_require__("../../packages/node/dist/src/utils sync recursive"), __dirname, filename);
                var updatedModules = update.modules;
                var runtime = update.runtime;
                for(var moduleId in updatedModules){
                    if (__nested_webpack_require_2211__.o(updatedModules, moduleId)) {
                        state.currentUpdate[moduleId] = updatedModules[moduleId];
                        if (updatedModulesList) updatedModulesList.push(moduleId);
                    }
                }
                if (runtime) state.currentUpdateRuntime.push(runtime);
                resolve();
            } else {
                // Fallback to filesystem loading
                var filename = (__webpack_require__(/*! path */ "path").join)(__dirname, "" + __nested_webpack_require_2211__.hu(chunkId));
                (__webpack_require__(/*! fs */ "fs").readFile)(filename, "utf-8", function(err, content) {
                    if (err) return reject(err);
                    var update = {};
                    (__webpack_require__(/*! vm */ "vm").runInThisContext)("(function(exports, require, __dirname, __filename) {" + content + "\n})", filename)(update, __webpack_require__("../../packages/node/dist/src/utils sync recursive"), (__webpack_require__(/*! path */ "path").dirname)(filename), filename);
                    var updatedModules = update.modules;
                    var runtime = update.runtime;
                    for(var moduleId in updatedModules){
                        if (__nested_webpack_require_2211__.o(updatedModules, moduleId)) {
                            state.currentUpdate[moduleId] = updatedModules[moduleId];
                            if (updatedModulesList) updatedModulesList.push(moduleId);
                        }
                    }
                    if (runtime) state.currentUpdateRuntime.push(runtime);
                    resolve();
                });
            }
        });
    };
}
/**
 * Creates the applyHandler function for HMR
 * @param __webpack_require__ - The webpack require function
 * @param installedChunks - Installed chunks storage
 * @param state - Shared state object
 * @returns The applyHandler function
 */ function createApplyHandler(__nested_webpack_require_4914__, installedChunks, state) {
    return function applyHandler(options) {
        if (__nested_webpack_require_4914__.f) delete __nested_webpack_require_4914__.f.readFileVmHmr;
        state.currentUpdateChunks = undefined;
        function getAffectedModuleEffects(updateModuleId) {
            const outdatedModules = [
                updateModuleId
            ];
            const outdatedDependencies = {};
            const queue = outdatedModules.map((id)=>({
                    chain: [
                        id
                    ],
                    id: id
                }));
            while(queue.length > 0){
                const queueItem = queue.pop();
                const moduleId = queueItem.id;
                const chain = queueItem.chain;
                const module = __nested_webpack_require_4914__.c[moduleId];
                if (!module || module.hot._selfAccepted && !module.hot._selfInvalidated) continue;
                if (module.hot._selfDeclined) {
                    return {
                        type: "self-declined",
                        chain: chain,
                        moduleId: moduleId
                    };
                }
                if (module.hot._main) {
                    return {
                        type: "unaccepted",
                        chain: chain,
                        moduleId: moduleId
                    };
                }
                for(let i = 0; i < module.parents.length; i++){
                    const parentId = module.parents[i];
                    const parent = __nested_webpack_require_4914__.c[parentId];
                    if (!parent) continue;
                    if (parent.hot._declinedDependencies?.[moduleId]) {
                        return {
                            type: "declined",
                            chain: chain.concat([
                                parentId
                            ]),
                            moduleId: moduleId,
                            parentId: parentId
                        };
                    }
                    if (outdatedModules.indexOf(parentId) !== -1) continue;
                    if (parent.hot._acceptedDependencies?.[moduleId]) {
                        if (!outdatedDependencies[parentId]) outdatedDependencies[parentId] = [];
                        addAllToSet(outdatedDependencies[parentId], [
                            moduleId
                        ]);
                        continue;
                    }
                    delete outdatedDependencies[parentId];
                    outdatedModules.push(parentId);
                    queue.push({
                        chain: chain.concat([
                            parentId
                        ]),
                        id: parentId
                    });
                }
            }
            return {
                type: "accepted",
                moduleId: updateModuleId,
                outdatedModules: outdatedModules,
                outdatedDependencies: outdatedDependencies
            };
        }
        function addAllToSet(a, b) {
            for(let i = 0; i < b.length; i++){
                const item = b[i];
                if (a.indexOf(item) === -1) a.push(item);
            }
        }
        // at begin all updates modules are outdated
        // the "outdated" status can propagate to parents if they don't accept the children
        const outdatedDependencies = {};
        const outdatedModules = [];
        const appliedUpdate = {};
        const warnUnexpectedRequire = function warnUnexpectedRequire(module) {
            console.warn("[HMR] unexpected require(" + module.id + ") to disposed module");
        };
        for(const moduleId in state.currentUpdate){
            if (__nested_webpack_require_4914__.o(state.currentUpdate, moduleId)) {
                const newModuleFactory = state.currentUpdate[moduleId];
                /** @type {TODO} */ // eslint-disable-next-line no-constant-condition
                const result =  true ? getAffectedModuleEffects(moduleId) : 0;
                let abortError = false;
                let doApply = false;
                let doDispose = false;
                let chainInfo = "";
                if (result.chain) {
                    chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
                }
                switch(result.type){
                    case "self-declined":
                        if (options.onDeclined) options.onDeclined(result);
                        if (!options.ignoreDeclined) abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
                        break;
                    case "declined":
                        if (options.onDeclined) options.onDeclined(result);
                        if (!options.ignoreDeclined) abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
                        break;
                    case "unaccepted":
                        if (options.onUnaccepted) options.onUnaccepted(result);
                        if (!options.ignoreUnaccepted) abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
                        break;
                    case "accepted":
                        if (options.onAccepted) options.onAccepted(result);
                        doApply = true;
                        break;
                    case "disposed":
                        if (options.onDisposed) options.onDisposed(result);
                        doDispose = true;
                        break;
                    default:
                        throw new Error("Unexception type " + result.type);
                }
                if (abortError) {
                    return {
                        error: abortError
                    };
                }
                if (doApply) {
                    //if no new module factory, use the existing one
                    appliedUpdate[moduleId] = newModuleFactory || __nested_webpack_require_4914__.m[moduleId];
                    // Propagate outdated modules and dependencies
                    addAllToSet(outdatedModules, result.outdatedModules || []);
                    for(const outModuleId in result.outdatedDependencies){
                        if (__nested_webpack_require_4914__.o(result.outdatedDependencies, outModuleId)) {
                            if (!outdatedDependencies[outModuleId]) outdatedDependencies[outModuleId] = [];
                            addAllToSet(outdatedDependencies[outModuleId], result.outdatedDependencies[outModuleId]);
                        }
                    }
                }
                if (doDispose) {
                    addAllToSet(outdatedModules, [
                        result.moduleId
                    ]);
                    appliedUpdate[moduleId] = warnUnexpectedRequire;
                }
            }
        }
        state.currentUpdate = undefined;
        // Store self accepted outdated modules to require them later by the module system
        const outdatedSelfAcceptedModules = [];
        for(let j = 0; j < outdatedModules.length; j++){
            const outdatedModuleId = outdatedModules[j];
            const module = __nested_webpack_require_4914__.c[outdatedModuleId];
            if (module && (module.hot._selfAccepted || module.hot._main) && // removed self-accepted modules should not be required
            appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire && // when called invalidate self-accepting is not possible
            !module.hot._selfInvalidated) {
                outdatedSelfAcceptedModules.push({
                    module: outdatedModuleId,
                    require: module.hot._requireSelf,
                    errorHandler: typeof module.hot._selfAccepted === "function" ? module.hot._selfAccepted : undefined
                });
            }
        }
        let moduleOutdatedDependencies;
        return {
            dispose: function() {
                state.currentUpdateRemovedChunks.forEach((chunkId)=>{
                    delete installedChunks[chunkId];
                });
                state.currentUpdateRemovedChunks = undefined;
                let idx;
                const queue = outdatedModules.slice();
                while(queue.length > 0){
                    const moduleId = queue.pop();
                    const module = __nested_webpack_require_4914__.c[moduleId];
                    if (!module) continue;
                    const data = {};
                    // Call dispose handlers
                    const disposeHandlers = module.hot._disposeHandlers;
                    for(let j = 0; j < disposeHandlers.length; j++){
                        disposeHandlers[j].call(null, data);
                    }
                    __nested_webpack_require_4914__.hmrD[moduleId] = data;
                    // disable module (this disables requires from this module)
                    module.hot.active = false;
                    // remove module from cache
                    delete __nested_webpack_require_4914__.c[moduleId];
                    // when disposing there is no need to call dispose handler
                    delete outdatedDependencies[moduleId];
                    // remove "parents" references from all children
                    for(let j = 0; j < module.children.length; j++){
                        const child = __nested_webpack_require_4914__.c[module.children[j]];
                        if (!child) continue;
                        idx = child.parents.indexOf(moduleId);
                        if (idx >= 0) {
                            child.parents.splice(idx, 1);
                        }
                    }
                }
                // remove outdated dependency from module children
                let dependency;
                for(const outdatedModuleId in outdatedDependencies){
                    if (__nested_webpack_require_4914__.o(outdatedDependencies, outdatedModuleId)) {
                        const module = __nested_webpack_require_4914__.c[outdatedModuleId];
                        if (module) {
                            moduleOutdatedDependencies = outdatedDependencies[outdatedModuleId];
                            for(let j = 0; j < moduleOutdatedDependencies.length; j++){
                                dependency = moduleOutdatedDependencies[j];
                                idx = module.children.indexOf(dependency);
                                if (idx >= 0) module.children.splice(idx, 1);
                            }
                        }
                    }
                }
            },
            apply: function(reportError) {
                // insert new code
                for(const updateModuleId in appliedUpdate){
                    if (__nested_webpack_require_4914__.o(appliedUpdate, updateModuleId)) {
                        __nested_webpack_require_4914__.m[updateModuleId] = appliedUpdate[updateModuleId];
                    }
                }
                // run new runtime modules
                for(let i = 0; i < state.currentUpdateRuntime.length; i++){
                    state.currentUpdateRuntime[i](__nested_webpack_require_4914__);
                }
                // call accept handlers
                for(const outdatedModuleId in outdatedDependencies){
                    if (__nested_webpack_require_4914__.o(outdatedDependencies, outdatedModuleId)) {
                        const module = __nested_webpack_require_4914__.c[outdatedModuleId];
                        if (module) {
                            moduleOutdatedDependencies = outdatedDependencies[outdatedModuleId];
                            const callbacks = [];
                            const errorHandlers = [];
                            const dependenciesForCallbacks = [];
                            for(let j = 0; j < moduleOutdatedDependencies.length; j++){
                                const dependency = moduleOutdatedDependencies[j];
                                const acceptCallback = module.hot._acceptedDependencies?.[dependency];
                                const errorHandler = module.hot._acceptedErrorHandlers?.[dependency];
                                if (acceptCallback) {
                                    if (callbacks.indexOf(acceptCallback) !== -1) continue;
                                    callbacks.push(acceptCallback);
                                    errorHandlers.push(errorHandler);
                                    dependenciesForCallbacks.push(dependency);
                                }
                            }
                            for(let k = 0; k < callbacks.length; k++){
                                try {
                                    callbacks[k].call(null, moduleOutdatedDependencies);
                                } catch (err) {
                                    if (typeof errorHandlers[k] === "function") {
                                        try {
                                            errorHandlers[k](err, {
                                                moduleId: outdatedModuleId,
                                                dependencyId: dependenciesForCallbacks[k]
                                            });
                                        } catch (err2) {
                                            if (options.onErrored) {
                                                options.onErrored({
                                                    type: "accept-error-handler-errored",
                                                    moduleId: outdatedModuleId,
                                                    dependencyId: dependenciesForCallbacks[k],
                                                    error: err2,
                                                    originalError: err
                                                });
                                            }
                                            if (!options.ignoreErrored) {
                                                reportError(err2);
                                                reportError(err);
                                            }
                                        }
                                    } else {
                                        if (options.onErrored) {
                                            options.onErrored({
                                                type: "accept-errored",
                                                moduleId: outdatedModuleId,
                                                dependencyId: dependenciesForCallbacks[k],
                                                error: err
                                            });
                                        }
                                        if (!options.ignoreErrored) {
                                            reportError(err);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // Load self accepted modules
                for(let o = 0; o < outdatedSelfAcceptedModules.length; o++){
                    const item = outdatedSelfAcceptedModules[o];
                    const moduleId = item.module;
                    try {
                        item.require(moduleId);
                    } catch (err) {
                        if (item.errorHandler && typeof item.errorHandler === "function") {
                            try {
                                item.errorHandler(err, {
                                    moduleId: moduleId,
                                    module: __nested_webpack_require_4914__.c[moduleId]
                                });
                            } catch (err1) {
                                if (options.onErrored) {
                                    options.onErrored({
                                        type: "self-accept-error-handler-errored",
                                        moduleId: moduleId,
                                        error: err1,
                                        originalError: err
                                    });
                                }
                                if (!options.ignoreErrored) {
                                    reportError(err1);
                                    reportError(err);
                                }
                            }
                        } else {
                            if (options.onErrored) {
                                options.onErrored({
                                    type: "self-accept-errored",
                                    moduleId: moduleId,
                                    error: err
                                });
                            }
                            if (!options.ignoreErrored) {
                                reportError(err);
                            }
                        }
                    }
                }
                return outdatedModules;
            }
        };
    };
}
/**
 * Creates the HMR manifest loader function
 * @param __webpack_require__ - The webpack require function
 * @param manifestRef - Reference object containing inMemoryManifest
 * @returns The HMR manifest loader function
 */ function createHMRManifestLoader(__nested_webpack_require_22547__, manifestRef) {
    return function() {
        return new Promise((resolve, reject)=>{
            // Check if we have in-memory manifest content
            if (manifestRef.value) {
                try {
                    resolve(JSON.parse(manifestRef.value));
                } catch (e) {
                    reject(e);
                }
            } else {
                // Fallback to filesystem loading
                const filename = path.join(__dirname, "" + __nested_webpack_require_22547__.hmrF());
                fs.readFile(filename, "utf-8", (err, content)=>{
                    if (err) {
                        if (err.code === "ENOENT") return resolve(undefined);
                        return reject(err);
                    }
                    try {
                        resolve(JSON.parse(content));
                    } catch (e) {
                        reject(e);
                    }
                });
            }
        });
    };
}
/**
 * Creates the HMR chunk loading handlers
 * @param __webpack_require__ - The webpack require function
 * @param installedChunks - Installed chunks storage
 * @param loadUpdateChunk - The loadUpdateChunk function
 * @param applyHandler - The applyHandler function
 * @param state - Shared state object
 * @returns Object containing hmrI and hmrC handlers
 */ function createHMRHandlers(__nested_webpack_require_23927__, installedChunks, loadUpdateChunk, applyHandler, state) {
    return {
        hmrI: function(moduleId, applyHandlers) {
            // hmrI.readFileVm called for module
            if (!state.currentUpdate) {
                // Initializing currentUpdate
                state.currentUpdate = {};
                state.currentUpdateRuntime = [];
                state.currentUpdateRemovedChunks = [];
                applyHandlers.push(applyHandler);
            }
            if (!__nested_webpack_require_23927__.o(state.currentUpdate, moduleId)) {
                // Adding module to currentUpdate
                state.currentUpdate[moduleId] = __nested_webpack_require_23927__.m[moduleId];
            } else {
            // Module already in currentUpdate
            }
        // Current update modules
        },
        hmrC: function(chunkIds, removedChunks, removedModules, promises, applyHandlers, updatedModulesList) {
            applyHandlers.push(applyHandler);
            state.currentUpdateChunks = {};
            state.currentUpdateRemovedChunks = removedChunks;
            state.currentUpdate = removedModules.reduce((obj, key)=>{
                obj[key] = false;
                return obj;
            }, {});
            // Initial currentUpdate from removedModules
            state.currentUpdateRuntime = [];
            chunkIds.forEach((chunkId)=>{
                // Processing chunkId
                if (__nested_webpack_require_23927__.o(installedChunks, chunkId) && installedChunks[chunkId] !== undefined) {
                    // Loading update chunk
                    promises.push(loadUpdateChunk(chunkId, updatedModulesList));
                    state.currentUpdateChunks[chunkId] = true;
                } else {
                    // Skipping chunk (not installed)
                    state.currentUpdateChunks[chunkId] = false;
                }
            });
            if (__nested_webpack_require_23927__.f) {
                __nested_webpack_require_23927__.f.readFileVmHmr = function(chunkId, promises) {
                    if (state.currentUpdateChunks && __nested_webpack_require_23927__.o(state.currentUpdateChunks, chunkId) && !state.currentUpdateChunks[chunkId]) {
                        promises.push(loadUpdateChunk(chunkId));
                        state.currentUpdateChunks[chunkId] = true;
                    }
                };
            }
        }
    };
}
/**
 * Creates a complete HMR runtime with shared state
 * @param __webpack_require__ - The webpack require function
 * @param installedChunks - Installed chunks storage
 * @param inMemoryChunks - Storage for in-memory chunks
 * @param manifestRef - Reference object for in-memory manifest storage
 * @returns Object containing all HMR functions
 */ function createHMRRuntime(__nested_webpack_require_26679__, installedChunks, inMemoryChunks, manifestRef) {
    // Shared state object
    const state = {
        currentUpdateChunks: undefined,
        currentUpdate: {},
        currentUpdateRemovedChunks: [],
        currentUpdateRuntime: []
    };
    const loadUpdateChunk = createLoadUpdateChunk(__nested_webpack_require_26679__, inMemoryChunks, state);
    const applyHandler = createApplyHandler(__nested_webpack_require_26679__, installedChunks, state);
    const hmrHandlers = createHMRHandlers(__nested_webpack_require_26679__, installedChunks, loadUpdateChunk, applyHandler, state);
    const hmrManifestLoader = createHMRManifestLoader(__nested_webpack_require_26679__, manifestRef);
    return {
        loadUpdateChunk: loadUpdateChunk,
        applyHandler: applyHandler,
        hmrHandlers: hmrHandlers,
        hmrManifestLoader: hmrManifestLoader
    };
} //# sourceMappingURL=hmr-runtime.js.map


/***/ }),

/***/ "../../packages/node/dist/src/utils/node-chunk-loader.js":
/*!***************************************************************!*\
  !*** ../../packages/node/dist/src/utils/node-chunk-loader.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.initializeFederationChunkLoading = exports.patchWebpackRequireForFederation = exports.createFederationChunkHandler = exports.configureFederationScriptLoader = exports.deleteChunk = exports.installChunk = exports.loadChunk = exports.resolveUrl = exports.fetchAndRun = exports.loadFromFs = exports.getFederationEntryFromGlobalInstances = exports.getFederationEntryFromCache = exports.resolveFile = void 0;
exports.importNodeModule = importNodeModule;
/**
 * Safely imports a Node.js module with error handling
 */ function importNodeModule(name) {
    if (!name) {
        throw new Error("import specifier is required");
    }
    const importModule = new Function("name", `return import(name)`);
    return importModule(name).then((res)=>res.default).catch((error)=>{
        console.error(`Error importing module ${name}:`, error);
        throw error;
    });
}
// Hoisted utility function to resolve file paths for chunks
const resolveFile = (rootOutputDir, chunkId)=>{
    const path = require("path");
    return path.join(__dirname, rootOutputDir + __webpack_require__.u(chunkId));
};
exports.resolveFile = resolveFile;
// Hoisted utility function to get remote entry from cache
const getFederationEntryFromCache = (remoteName)=>{
    const globalThisVal = new Function("return globalThis")();
    const federationInstances = globalThisVal["__FEDERATION__"]["__INSTANCES__"];
    for (const instance of federationInstances){
        const moduleContainer = instance.moduleCache.get(remoteName);
        if (moduleContainer?.remoteInfo) return moduleContainer.remoteInfo.entry;
    }
    return null;
};
exports.getFederationEntryFromCache = getFederationEntryFromCache;
// Hoisted utility function to get remote entry from global instances
const getFederationEntryFromGlobalInstances = (remoteName)=>{
    const globalThisVal = new Function("return globalThis")();
    const federationInstances = globalThisVal["__FEDERATION__"]["__INSTANCES__"];
    for (const instance of federationInstances){
        for (const remote of instance.options.remotes){
            if (remote.name === remoteName || remote.alias === remoteName) {
                console.log("Backup remote entry found:", remote.entry);
                return remote.entry;
            }
        }
    }
    return null;
};
exports.getFederationEntryFromGlobalInstances = getFederationEntryFromGlobalInstances;
// Hoisted utility function to load chunks from filesystem
const loadFromFs = (filename, callback)=>{
    const fs = require("fs");
    const path = require("path");
    const vm = require("vm");
    if (fs.existsSync(filename)) {
        fs.readFile(filename, "utf-8", (err, content)=>{
            if (err) return callback(err, null);
            const chunk = {};
            try {
                const script = new vm.Script(`(function(exports, require, __dirname, __filename) {${content}\n})`, {
                    filename,
                    importModuleDynamically: //@ts-ignore
                    vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ?? importNodeModule
                });
                script.runInThisContext()(chunk, require, path.dirname(filename), filename);
                callback(null, chunk);
            } catch (e) {
                console.log("'runInThisContext threw'", e);
                callback(e, null);
            }
        });
    } else {
        callback(new Error(`File ${filename} does not exist`), null);
    }
};
exports.loadFromFs = loadFromFs;
// Hoisted utility function to fetch and execute chunks from remote URLs
const fetchAndRun = (url, chunkName, callback, args)=>{
    (typeof fetch === "undefined" ? importNodeModule("node-fetch").then((mod)=>mod.default) : Promise.resolve(fetch)).then((fetchFunction)=>{
        return args.origin.loaderHook.lifecycle.fetch.emit(url.href, {}).then((res)=>{
            if (!res || !(res instanceof Response)) {
                return fetchFunction(url.href).then((response)=>response.text());
            }
            return res.text();
        });
    }).then((data)=>{
        const chunk = {};
        try {
            eval(`(function(exports, require, __dirname, __filename) {${data}\n})`)(chunk, require, url.pathname.split("/").slice(0, -1).join("/"), chunkName);
            callback(null, chunk);
        } catch (e) {
            callback(e, null);
        }
    }).catch((err)=>callback(err, null));
};
exports.fetchAndRun = fetchAndRun;
// Hoisted utility function to resolve URLs for chunks
const resolveUrl = (remoteName, chunkName)=>{
    try {
        return new URL(chunkName, __webpack_require__.p);
    } catch  {
        const entryUrl = (0, exports.getFederationEntryFromCache)(remoteName) || (0, exports.getFederationEntryFromGlobalInstances)(remoteName);
        if (!entryUrl) return null;
        const url = new URL(entryUrl);
        const path = require("path");
        // Extract the directory path from the remote entry URL
        // e.g., from "http://url/static/js/remoteEntry.js" to "/static/js/"
        const urlPath = url.pathname;
        const lastSlashIndex = urlPath.lastIndexOf("/");
        const directoryPath = lastSlashIndex >= 0 ? urlPath.substring(0, lastSlashIndex + 1) : "/";
        // Get rootDir from webpack configuration
        const rootDir = __webpack_require__.federation.rootOutputDir || "";
        // Use path.join to combine the paths properly while handling slashes
        // Convert Windows-style paths to URL-style paths
        const combinedPath = path.join(directoryPath, rootDir, chunkName).replace(/\\/g, "/");
        // Create the final URL
        return new URL(combinedPath, url.origin);
    }
};
exports.resolveUrl = resolveUrl;
// Hoisted utility function to load chunks based on different strategies
const loadChunk = (strategy, chunkId, rootOutputDir, callback, args)=>{
    if (strategy === "filesystem") {
        return (0, exports.loadFromFs)((0, exports.resolveFile)(rootOutputDir, chunkId), callback);
    }
    const url = (0, exports.resolveUrl)(rootOutputDir, chunkId);
    if (!url) return callback(null, {
        modules: {},
        ids: [],
        runtime: null
    });
    // Using fetchAndRun directly with args
    (0, exports.fetchAndRun)(url, chunkId, callback, args);
};
exports.loadChunk = loadChunk;
// Hoisted utility function to install a chunk into webpack
const installChunk = (chunk, installedChunks)=>{
    for(const moduleId in chunk.modules){
        __webpack_require__.m[moduleId] = chunk.modules[moduleId];
    }
    if (chunk.runtime) chunk.runtime(__webpack_require__);
    for (const chunkId of chunk.ids){
        if (installedChunks[chunkId]) installedChunks[chunkId][0]();
        installedChunks[chunkId] = 0;
    }
};
exports.installChunk = installChunk;
// Hoisted utility function to remove a chunk on fail
const deleteChunk = (chunkId, installedChunks)=>{
    delete installedChunks[chunkId];
    return true;
};
exports.deleteChunk = deleteChunk;
/**
 * Configures webpack script loader for federation
 * @throws {Error} If setup fails
 */ const configureFederationScriptLoader = ()=>{
    __webpack_require__.l = (url, done, key, chunkId)=>{
        if (!key || chunkId) {
            throw new Error(`__webpack_require__.l name is required for ${url}`);
        }
        __webpack_require__.federation.runtime.loadScriptNode(url, {
            attrs: {
                globalName: key
            }
        }).then((res)=>{
            const enhancedRemote = __webpack_require__.federation.instance.initRawContainer(key, url, res);
            new Function("return globalThis")()[key] = enhancedRemote;
            done(enhancedRemote);
        }).catch(done);
    };
};
exports.configureFederationScriptLoader = configureFederationScriptLoader;
/**
 * Creates a chunk handler for webpack module loading
 * @param installedChunks - Object tracking installed chunks
 * @param args - Federation runtime arguments
 * @returns Chunk handler function
 */ const createFederationChunkHandler = (installedChunks, args)=>{
    return (chunkId, promises)=>{
        // console.log('HANDLER', chunkId);
        let installedChunkData = installedChunks[chunkId];
        if (installedChunkData !== 0) {
            if (installedChunkData) {
                promises.push(installedChunkData[2]);
            } else {
                const matcher = __webpack_require__.federation.chunkMatcher ? __webpack_require__.federation.chunkMatcher(chunkId) : true;
                if (matcher) {
                    const promise = new Promise((resolve, reject)=>{
                        installedChunkData = installedChunks[chunkId] = [
                            resolve,
                            reject
                        ];
                        const fs = typeof process !== "undefined" ? require("fs") : false;
                        const filename = typeof process !== "undefined" ? (0, exports.resolveFile)(__webpack_require__.federation.rootOutputDir || "", chunkId) : false;
                        if (fs && fs.existsSync(filename)) {
                            (0, exports.loadChunk)("filesystem", chunkId, __webpack_require__.federation.rootOutputDir || "", (err, chunk)=>{
                                if (err) return (0, exports.deleteChunk)(chunkId, installedChunks) && reject(err);
                                if (chunk) (0, exports.installChunk)(chunk, installedChunks);
                                resolve(chunk);
                            }, args);
                        } else {
                            const chunkName = __webpack_require__.u(chunkId);
                            const loadingStrategy = typeof process === "undefined" ? "http-eval" : "http-vm";
                            (0, exports.loadChunk)(loadingStrategy, chunkName, __webpack_require__.federation.initOptions.name, (err, chunk)=>{
                                if (err) return (0, exports.deleteChunk)(chunkId, installedChunks) && reject(err);
                                if (chunk) (0, exports.installChunk)(chunk, installedChunks);
                                resolve(chunk);
                            }, args);
                        }
                    });
                    promises.push(installedChunkData[2] = promise);
                } else {
                    installedChunks[chunkId] = 0;
                }
            }
        }
    };
};
exports.createFederationChunkHandler = createFederationChunkHandler;
/**
 * Patches webpack require to use custom chunk handler
 * @param handle - Custom chunk handler function
 */ const patchWebpackRequireForFederation = (handle)=>{
    if (__webpack_require__.f) {
        if (__webpack_require__.f.require) {
            console.warn("\x1b[33m%s\x1b[0m", 'CAUTION: build target is not set to "async-node", attempting to patch additional chunk handlers. This may not work');
            __webpack_require__.f.require = handle;
        }
        if (__webpack_require__.f.readFileVm) {
            console.log("patching readfilevm", __filename);
            __webpack_require__.f.readFileVm = handle;
        }
    }
};
exports.patchWebpackRequireForFederation = patchWebpackRequireForFederation;
/**
 * Initializes federation chunk loading for Node.js runtime
 * @param args - Federation runtime arguments
 * @returns Object containing setup state
 */ const initializeFederationChunkLoading = (args)=>{
    // Create the chunk tracking object
    const installedChunks = {};
    // Set up webpack script loader
    (0, exports.configureFederationScriptLoader)();
    // Create and set up the chunk handler
    const handle = (0, exports.createFederationChunkHandler)(installedChunks, args);
    // Patch webpack require
    (0, exports.patchWebpackRequireForFederation)(handle);
    return {
        installedChunks
    };
};
exports.initializeFederationChunkLoading = initializeFederationChunkLoading; //# sourceMappingURL=node-chunk-loader.js.map


/***/ }),

/***/ "../../packages/runtime-core/dist/index.esm.js":
/*!*****************************************************!*\
  !*** ../../packages/runtime-core/dist/index.esm.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CurrentGlobal: () => (/* binding */ CurrentGlobal),
/* harmony export */   FederationHost: () => (/* binding */ FederationHost),
/* harmony export */   Global: () => (/* binding */ Global),
/* harmony export */   Module: () => (/* binding */ Module),
/* harmony export */   addGlobalSnapshot: () => (/* binding */ addGlobalSnapshot),
/* harmony export */   assert: () => (/* binding */ assert),
/* harmony export */   getGlobalFederationConstructor: () => (/* binding */ getGlobalFederationConstructor),
/* harmony export */   getGlobalSnapshot: () => (/* binding */ getGlobalSnapshot),
/* harmony export */   getInfoWithoutType: () => (/* binding */ getInfoWithoutType),
/* harmony export */   getRegisteredShare: () => (/* binding */ getRegisteredShare),
/* harmony export */   getRemoteEntry: () => (/* binding */ getRemoteEntry),
/* harmony export */   getRemoteInfo: () => (/* binding */ getRemoteInfo),
/* harmony export */   helpers: () => (/* binding */ helpers),
/* harmony export */   isStaticResourcesEqual: () => (/* binding */ isStaticResourcesEqual),
/* harmony export */   loadScript: () => (/* reexport safe */ _module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.loadScript),
/* harmony export */   loadScriptNode: () => (/* reexport safe */ _module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.loadScriptNode),
/* harmony export */   matchRemoteWithNameAndExpose: () => (/* binding */ matchRemoteWithNameAndExpose),
/* harmony export */   registerGlobalPlugins: () => (/* binding */ registerGlobalPlugins),
/* harmony export */   resetFederationGlobalInfo: () => (/* binding */ resetFederationGlobalInfo),
/* harmony export */   safeWrapper: () => (/* binding */ safeWrapper),
/* harmony export */   satisfy: () => (/* binding */ satisfy),
/* harmony export */   setGlobalFederationConstructor: () => (/* binding */ setGlobalFederationConstructor),
/* harmony export */   setGlobalFederationInstance: () => (/* binding */ setGlobalFederationInstance),
/* harmony export */   types: () => (/* binding */ index)
/* harmony export */ });
/* harmony import */ var _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfills.esm.js */ "../../packages/runtime-core/dist/polyfills.esm.js");
/* harmony import */ var _module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @module-federation/sdk */ "../../packages/sdk/dist/index.esm.js");
/* harmony import */ var _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @module-federation/error-codes */ "../../packages/error-codes/dist/index.esm.mjs");




const LOG_CATEGORY = "[ Federation Runtime ]";
// FIXME: pre-bundle ?
const logger = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.createLogger)(LOG_CATEGORY);
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function assert(condition, msg) {
    if (!condition) {
        error(msg);
    }
}
function error(msg) {
    if (msg instanceof Error) {
        msg.message = `${LOG_CATEGORY}: ${msg.message}`;
        throw msg;
    }
    throw new Error(`${LOG_CATEGORY}: ${msg}`);
}
function warn(msg) {
    if (msg instanceof Error) {
        msg.message = `${LOG_CATEGORY}: ${msg.message}`;
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
        return `${remoteInfo.name}:${remoteInfo.version}`;
    } else if ("entry" in remoteInfo && remoteInfo.entry) {
        return `${remoteInfo.name}:${remoteInfo.entry}`;
    } else {
        return `${remoteInfo.name}`;
    }
}
function isRemoteInfoWithEntry(remote) {
    return typeof remote.entry !== "undefined";
}
function isPureRemoteEntry(remote) {
    return !remote.entry.includes(".json");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeWrapper(callback, disableWarn) {
    try {
        const res = await callback();
        return res;
    } catch (e) {
        !disableWarn && warn(e);
        return;
    }
}
function isObject(val) {
    return val && typeof val === "object";
}
const objectToString = Object.prototype.toString;
// eslint-disable-next-line @typescript-eslint/ban-types
function isPlainObject(val) {
    return objectToString.call(val) === "[object Object]";
}
function isStaticResourcesEqual(url1, url2) {
    const REG_EXP = /^(https?:)?\/\//i;
    // Transform url1 and url2 into relative paths
    const relativeUrl1 = url1.replace(REG_EXP, "").replace(/\/$/, "");
    const relativeUrl2 = url2.replace(REG_EXP, "").replace(/\/$/, "");
    // Check if the relative paths are identical
    return relativeUrl1 === relativeUrl2;
}
function arrayOptions(options) {
    return Array.isArray(options) ? options : [
        options
    ];
}
function getRemoteEntryInfoFromSnapshot(snapshot) {
    const defaultRemoteEntryInfo = {
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
const processModuleAlias = (name, subPath)=>{
    // @host/ ./button -> @host/button
    let moduleName;
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
const CurrentGlobal = typeof globalThis === "object" ? globalThis : window;
const nativeGlobal = (()=>{
    try {
        // get real window (incase of sandbox)
        return document.defaultView;
    } catch (e) {
        // node env
        return CurrentGlobal;
    }
})();
const Global = nativeGlobal;
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
const globalLoading = CurrentGlobal.__GLOBAL_LOADING_REMOTE_ENTRY__;
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
function setGlobalFederationConstructor(FederationConstructor, isDebug = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isDebugMode)()) {
    if (isDebug) {
        CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = FederationConstructor;
        CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR_VERSION__ = "0.15.0";
    }
}
// eslint-disable-next-line @typescript-eslint/ban-types
function getInfoWithoutType(target, key) {
    if (typeof key === "string") {
        const keyRes = target[key];
        if (keyRes) {
            return {
                value: target[key],
                key: key
            };
        } else {
            const targetKeys = Object.keys(target);
            for (const targetKey of targetKeys){
                const [targetTypeOrName, _] = targetKey.split(":");
                const nKey = `${targetTypeOrName}:${key}`;
                const typeWithKeyRes = target[nKey];
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
const getGlobalSnapshot = ()=>nativeGlobal.__FEDERATION__.moduleInfo;
const getTargetSnapshotInfoByModuleInfo = (moduleInfo, snapshot)=>{
    // Check if the remote is included in the hostSnapshot
    const moduleKey = getFMId(moduleInfo);
    const getModuleInfo = getInfoWithoutType(snapshot, moduleKey).value;
    // The remoteSnapshot might not include a version
    if (getModuleInfo && !getModuleInfo.version && "version" in moduleInfo && moduleInfo["version"]) {
        getModuleInfo.version = moduleInfo["version"];
    }
    if (getModuleInfo) {
        return getModuleInfo;
    }
    // If the remote is not included in the hostSnapshot, deploy a micro app snapshot
    if ("version" in moduleInfo && moduleInfo["version"]) {
        const { version } = moduleInfo, resModuleInfo = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__.a)(moduleInfo, [
            "version"
        ]);
        const moduleKeyWithoutVersion = getFMId(resModuleInfo);
        const getModuleInfoWithoutVersion = getInfoWithoutType(nativeGlobal.__FEDERATION__.moduleInfo, moduleKeyWithoutVersion).value;
        if ((getModuleInfoWithoutVersion == null ? void 0 : getModuleInfoWithoutVersion.version) === version) {
            return getModuleInfoWithoutVersion;
        }
    }
    return;
};
const getGlobalSnapshotInfoByModuleInfo = (moduleInfo)=>getTargetSnapshotInfoByModuleInfo(moduleInfo, nativeGlobal.__FEDERATION__.moduleInfo);
const setGlobalSnapshotInfoByModuleInfo = (remoteInfo, moduleDetailInfo)=>{
    const moduleKey = getFMId(remoteInfo);
    nativeGlobal.__FEDERATION__.moduleInfo[moduleKey] = moduleDetailInfo;
    return nativeGlobal.__FEDERATION__.moduleInfo;
};
const addGlobalSnapshot = (moduleInfos)=>{
    nativeGlobal.__FEDERATION__.moduleInfo = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, nativeGlobal.__FEDERATION__.moduleInfo, moduleInfos);
    return ()=>{
        const keys = Object.keys(moduleInfos);
        for (const key of keys){
            delete nativeGlobal.__FEDERATION__.moduleInfo[key];
        }
    };
};
const getRemoteEntryExports = (name, globalName)=>{
    const remoteEntryKey = globalName || `__FEDERATION_${name}:custom__`;
    const entryExports = CurrentGlobal[remoteEntryKey];
    return {
        remoteEntryKey,
        entryExports
    };
};
// This function is used to register global plugins.
// It iterates over the provided plugins and checks if they are already registered.
// If a plugin is not registered, it is added to the global plugins.
// If a plugin is already registered, a warning message is logged.
const registerGlobalPlugins = (plugins)=>{
    const { __GLOBAL_PLUGIN__ } = nativeGlobal.__FEDERATION__;
    plugins.forEach((plugin)=>{
        if (__GLOBAL_PLUGIN__.findIndex((p)=>p.name === plugin.name) === -1) {
            __GLOBAL_PLUGIN__.push(plugin);
        } else {
            warn(`The plugin ${plugin.name} has been registered.`);
        }
    });
};
const getGlobalHostPlugins = ()=>nativeGlobal.__FEDERATION__.__GLOBAL_PLUGIN__;
const getPreloaded = (id)=>CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.get(id);
const setPreloaded = (id)=>CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.set(id, true);
const DEFAULT_SCOPE = "default";
const DEFAULT_REMOTE_TYPE = "global";
// fork from https://github.com/originjs/vite-plugin-federation/blob/v1.1.12/packages/lib/src/utils/semver/index.ts
// those constants are based on https://www.rubydoc.info/gems/semantic_range/3.0.0/SemanticRange#BUILDIDENTIFIER-constant
// Copyright (c)
// vite-plugin-federation is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.
const buildIdentifier = "[0-9A-Za-z-]+";
const build = `(?:\\+(${buildIdentifier}(?:\\.${buildIdentifier})*))`;
const numericIdentifier = "0|[1-9]\\d*";
const numericIdentifierLoose = "[0-9]+";
const nonNumericIdentifier = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
const preReleaseIdentifierLoose = `(?:${numericIdentifierLoose}|${nonNumericIdentifier})`;
const preReleaseLoose = `(?:-?(${preReleaseIdentifierLoose}(?:\\.${preReleaseIdentifierLoose})*))`;
const preReleaseIdentifier = `(?:${numericIdentifier}|${nonNumericIdentifier})`;
const preRelease = `(?:-(${preReleaseIdentifier}(?:\\.${preReleaseIdentifier})*))`;
const xRangeIdentifier = `${numericIdentifier}|x|X|\\*`;
const xRangePlain = `[v=\\s]*(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:${preRelease})?${build}?)?)?`;
const hyphenRange = `^\\s*(${xRangePlain})\\s+-\\s+(${xRangePlain})\\s*$`;
const mainVersionLoose = `(${numericIdentifierLoose})\\.(${numericIdentifierLoose})\\.(${numericIdentifierLoose})`;
const loosePlain = `[v=\\s]*${mainVersionLoose}${preReleaseLoose}?${build}?`;
const gtlt = "((?:<|>)?=?)";
const comparatorTrim = `(\\s*)${gtlt}\\s*(${loosePlain}|${xRangePlain})`;
const loneTilde = "(?:~>?)";
const tildeTrim = `(\\s*)${loneTilde}\\s+`;
const loneCaret = "(?:\\^)";
const caretTrim = `(\\s*)${loneCaret}\\s+`;
const star = "(<|>)?=?\\s*\\*";
const caret = `^${loneCaret}${xRangePlain}$`;
const mainVersion = `(${numericIdentifier})\\.(${numericIdentifier})\\.(${numericIdentifier})`;
const fullPlain = `v?${mainVersion}${preRelease}?${build}?`;
const tilde = `^${loneTilde}${xRangePlain}$`;
const xRange = `^${gtlt}\\s*${xRangePlain}$`;
const comparator = `^${gtlt}\\s*(${fullPlain})$|^$`;
// copy from semver package
const gte0 = "^\\s*>=\\s*0.0.0\\s*$";
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
function pipe(...fns) {
    return (x)=>fns.reduce((v, f)=>f(v), x);
}
function extractComparator(comparatorString) {
    return comparatorString.match(parseRegex(comparator));
}
function combineVersion(major, minor, patch, preRelease) {
    const mainVersion = `${major}.${minor}.${patch}`;
    if (preRelease) {
        return `${mainVersion}-${preRelease}`;
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
            from = `>=${fromMajor}.0.0`;
        } else if (isXVersion(fromPatch)) {
            from = `>=${fromMajor}.${fromMinor}.0`;
        } else {
            from = `>=${from}`;
        }
        if (isXVersion(toMajor)) {
            to = "";
        } else if (isXVersion(toMinor)) {
            to = `<${Number(toMajor) + 1}.0.0-0`;
        } else if (isXVersion(toPatch)) {
            to = `<${toMajor}.${Number(toMinor) + 1}.0-0`;
        } else if (toPreRelease) {
            to = `<=${toMajor}.${toMinor}.${toPatch}-${toPreRelease}`;
        } else {
            to = `<=${to}`;
        }
        return `${from} ${to}`.trim();
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
                return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
            } else if (isXVersion(patch)) {
                if (major === "0") {
                    return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
                } else {
                    return `>=${major}.${minor}.0 <${Number(major) + 1}.0.0-0`;
                }
            } else if (preRelease) {
                if (major === "0") {
                    if (minor === "0") {
                        return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${minor}.${Number(patch) + 1}-0`;
                    } else {
                        return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
                    }
                } else {
                    return `>=${major}.${minor}.${patch}-${preRelease} <${Number(major) + 1}.0.0-0`;
                }
            } else {
                if (major === "0") {
                    if (minor === "0") {
                        return `>=${major}.${minor}.${patch} <${major}.${minor}.${Number(patch) + 1}-0`;
                    } else {
                        return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
                    }
                }
                return `>=${major}.${minor}.${patch} <${Number(major) + 1}.0.0-0`;
            }
        })).join(" ");
}
function parseTildes(range) {
    return range.trim().split(/\s+/).map((rangeVersion)=>rangeVersion.replace(parseRegex(tilde), (_, major, minor, patch, preRelease)=>{
            if (isXVersion(major)) {
                return "";
            } else if (isXVersion(minor)) {
                return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
            } else if (isXVersion(patch)) {
                return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
            } else if (preRelease) {
                return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
            }
            return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
        })).join(" ");
}
function parseXRanges(range) {
    return range.split(/\s+/).map((rangeVersion)=>rangeVersion.trim().replace(parseRegex(xRange), (ret, gtlt, major, minor, patch, preRelease)=>{
            const isXMajor = isXVersion(major);
            const isXMinor = isXMajor || isXVersion(minor);
            const isXPatch = isXMinor || isXVersion(patch);
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
                return `${gtlt + major}.${minor}.${patch}${preRelease}`;
            } else if (isXMinor) {
                return `>=${major}.0.0${preRelease} <${Number(major) + 1}.0.0-0`;
            } else if (isXPatch) {
                return `>=${major}.${minor}.0${preRelease} <${major}.${Number(minor) + 1}.0-0`;
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
    const { preRelease: rangePreRelease } = rangeAtom;
    const { preRelease: versionPreRelease } = versionAtom;
    if (rangePreRelease === undefined && Boolean(versionPreRelease)) {
        return 1;
    }
    if (Boolean(rangePreRelease) && versionPreRelease === undefined) {
        return -1;
    }
    if (rangePreRelease === undefined && versionPreRelease === undefined) {
        return 0;
    }
    for(let i = 0, n = rangePreRelease.length; i <= n; i++){
        const rangeElement = rangePreRelease[i];
        const versionElement = versionPreRelease[i];
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
    if (!version) {
        return false;
    }
    // Extract version details once
    const extractedVersion = extractComparator(version);
    if (!extractedVersion) {
        // If the version string is invalid, it can't satisfy any range
        return false;
    }
    const [, versionOperator, , versionMajor, versionMinor, versionPatch, versionPreRelease] = extractedVersion;
    const versionAtom = {
        operator: versionOperator,
        version: combineVersion(versionMajor, versionMinor, versionPatch, versionPreRelease),
        major: versionMajor,
        minor: versionMinor,
        patch: versionPatch,
        preRelease: versionPreRelease == null ? void 0 : versionPreRelease.split(".")
    };
    // Split the range by || to handle OR conditions
    const orRanges = range.split("||");
    for (const orRange of orRanges){
        const trimmedOrRange = orRange.trim();
        if (!trimmedOrRange) {
            // An empty range string signifies wildcard *, satisfy any valid version
            // (We already checked if the version itself is valid)
            return true;
        }
        // Handle simple wildcards explicitly before complex parsing
        if (trimmedOrRange === "*" || trimmedOrRange === "x") {
            return true;
        }
        try {
            // Apply existing parsing logic to the current OR sub-range
            const parsedSubRange = parseRange(trimmedOrRange); // Handles hyphens, trims etc.
            // Check if the result of initial parsing is empty, which can happen
            // for some wildcard cases handled by parseRange/parseComparatorString.
            // E.g. `parseStar` used in `parseComparatorString` returns ''.
            if (!parsedSubRange.trim()) {
                // If parsing results in empty string, treat as wildcard match
                return true;
            }
            const parsedComparatorString = parsedSubRange.split(" ").map((rangeVersion)=>parseComparatorString(rangeVersion)) // Expands ^, ~
            .join(" ");
            // Check again if the comparator string became empty after specific parsing like ^ or ~
            if (!parsedComparatorString.trim()) {
                return true;
            }
            // Split the sub-range by space for implicit AND conditions
            const comparators = parsedComparatorString.split(/\s+/).map((comparator)=>parseGTE0(comparator)) // Filter out empty strings that might result from multiple spaces
            .filter(Boolean);
            // If a sub-range becomes empty after parsing (e.g., invalid characters),
            // it cannot be satisfied. This check might be redundant now but kept for safety.
            if (comparators.length === 0) {
                continue;
            }
            let subRangeSatisfied = true;
            for (const comparator of comparators){
                const extractedComparator = extractComparator(comparator);
                // If any part of the AND sub-range is invalid, the sub-range is not satisfied
                if (!extractedComparator) {
                    subRangeSatisfied = false;
                    break;
                }
                const [, rangeOperator, , rangeMajor, rangeMinor, rangePatch, rangePreRelease] = extractedComparator;
                const rangeAtom = {
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
                return true;
            }
        } catch (e) {
            // Log error and treat this sub-range as unsatisfied
            console.error(`[semver] Error processing range part "${trimmedOrRange}":`, e);
            continue;
        }
    }
    // If none of the OR sub-ranges were satisfied
    return false;
}
function formatShare(shareArgs, from, name, shareStrategy) {
    let get;
    if ("get" in shareArgs) {
        // eslint-disable-next-line prefer-destructuring
        get = shareArgs.get;
    } else if ("lib" in shareArgs) {
        get = ()=>Promise.resolve(shareArgs.lib);
    } else {
        get = ()=>Promise.resolve(()=>{
                throw new Error(`Can not get shared '${name}'!`);
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
            requiredVersion: `^${shareArgs.version}`,
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
    const shareArgs = userOptions.shared || {};
    const from = userOptions.name;
    const shareInfos = Object.keys(shareArgs).reduce((res, pkgName)=>{
        const arrayShareArgs = arrayOptions(shareArgs[pkgName]);
        res[pkgName] = res[pkgName] || [];
        arrayShareArgs.forEach((shareConfig)=>{
            res[pkgName].push(formatShare(shareConfig, from, pkgName, userOptions.shareStrategy));
        });
        return res;
    }, {});
    const shared = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, globalOptions.shared);
    Object.keys(shareInfos).forEach((shareKey)=>{
        if (!shared[shareKey]) {
            shared[shareKey] = shareInfos[shareKey];
        } else {
            shareInfos[shareKey].forEach((newUserSharedOptions)=>{
                const isSameVersion = shared[shareKey].find((sharedVal)=>sharedVal.version === newUserSharedOptions.version);
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
    const transformInvalidVersion = (version)=>{
        const isNumberVersion = !Number.isNaN(Number(version));
        if (isNumberVersion) {
            const splitArr = version.split(".");
            let validVersion = version;
            for(let i = 0; i < 3 - splitArr.length; i++){
                validVersion += ".0";
            }
            return validVersion;
        }
        return version;
    };
    if (satisfy(transformInvalidVersion(a), `<=${transformInvalidVersion(b)}`)) {
        return true;
    } else {
        return false;
    }
}
const findVersion = (shareVersionMap, cb)=>{
    const callback = cb || function(prev, cur) {
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
const isLoaded = (shared)=>{
    return Boolean(shared.loaded) || typeof shared.lib === "function";
};
const isLoading = (shared)=>{
    return Boolean(shared.loading);
};
function findSingletonVersionOrderByVersion(shareScopeMap, scope, pkgName) {
    const versions = shareScopeMap[scope][pkgName];
    const callback = function(prev, cur) {
        return !isLoaded(versions[prev]) && versionLt(prev, cur);
    };
    return findVersion(shareScopeMap[scope][pkgName], callback);
}
function findSingletonVersionOrderByLoaded(shareScopeMap, scope, pkgName) {
    const versions = shareScopeMap[scope][pkgName];
    const callback = function(prev, cur) {
        const isLoadingOrLoaded = (shared)=>{
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
    if (!localShareScopeMap) {
        return;
    }
    const { shareConfig, scope = DEFAULT_SCOPE, strategy } = shareInfo;
    const scopes = Array.isArray(scope) ? scope : [
        scope
    ];
    for (const sc of scopes){
        if (shareConfig && localShareScopeMap[sc] && localShareScopeMap[sc][pkgName]) {
            const { requiredVersion } = shareConfig;
            const findShareFunction = getFindShareFunction(strategy);
            const maxOrSingletonVersion = findShareFunction(localShareScopeMap, sc, pkgName);
            //@ts-ignore
            const defaultResolver = ()=>{
                if (shareConfig.singleton) {
                    if (typeof requiredVersion === "string" && !satisfy(maxOrSingletonVersion, requiredVersion)) {
                        const msg = `Version ${maxOrSingletonVersion} from ${maxOrSingletonVersion && localShareScopeMap[sc][pkgName][maxOrSingletonVersion].from} of shared singleton module ${pkgName} does not satisfy the requirement of ${shareInfo.from} which needs ${requiredVersion})`;
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
                    for (const [versionKey, versionValue] of Object.entries(localShareScopeMap[sc][pkgName])){
                        if (satisfy(versionKey, requiredVersion)) {
                            return versionValue;
                        }
                    }
                }
            };
            const params = {
                shareScopeMap: localShareScopeMap,
                scope: sc,
                pkgName,
                version: maxOrSingletonVersion,
                GlobalFederation: Global.__FEDERATION__,
                resolver: defaultResolver
            };
            const resolveShared = resolveShare.emit(params) || params;
            return resolveShared.resolver();
        }
    }
}
function getGlobalShareScope() {
    return Global.__FEDERATION__.__SHARE__;
}
function getTargetSharedOptions(options) {
    const { pkgName, extraOptions, shareInfos } = options;
    const defaultResolver = (sharedOptions)=>{
        if (!sharedOptions) {
            return undefined;
        }
        const shareVersionMap = {};
        sharedOptions.forEach((shared)=>{
            shareVersionMap[shared.version] = shared;
        });
        const callback = function(prev, cur) {
            return !isLoaded(shareVersionMap[prev]) && versionLt(prev, cur);
        };
        const maxVersion = findVersion(shareVersionMap, callback);
        return shareVersionMap[maxVersion];
    };
    var _extraOptions_resolver;
    const resolver = (_extraOptions_resolver = extraOptions == null ? void 0 : extraOptions.resolver) != null ? _extraOptions_resolver : defaultResolver;
    return Object.assign({}, resolver(shareInfos[pkgName]), extraOptions == null ? void 0 : extraOptions.customShareInfo);
}
const ShareUtils = {
    getRegisteredShare,
    getGlobalShareScope
};
const GlobalUtils = {
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
    for (const remote of remotes){
        // match pkgName
        const isNameMatched = id.startsWith(remote.name);
        let expose = id.replace(remote.name, "");
        if (isNameMatched) {
            if (expose.startsWith("/")) {
                const pkgNameOrAlias = remote.name;
                expose = `.${expose}`;
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
        const isAliasMatched = remote.alias && id.startsWith(remote.alias);
        let exposeWithAlias = remote.alias && id.replace(remote.alias, "");
        if (remote.alias && isAliasMatched) {
            if (exposeWithAlias && exposeWithAlias.startsWith("/")) {
                const pkgNameOrAlias = remote.alias;
                exposeWithAlias = `.${exposeWithAlias}`;
                return {
                    pkgNameOrAlias,
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
    for (const remote of remotes){
        const isNameMatched = nameOrAlias === remote.name;
        if (isNameMatched) {
            return remote;
        }
        const isAliasMatched = remote.alias && nameOrAlias === remote.alias;
        if (isAliasMatched) {
            return remote;
        }
    }
    return;
}
function registerPlugins(plugins, hookInstances) {
    const globalPlugins = getGlobalHostPlugins();
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
const importCallback = ".then(callbacks[0]).catch(callbacks[1])";
async function loadEsmEntry({ entry, remoteEntryExports }) {
    return new Promise((resolve, reject)=>{
        try {
            if (!remoteEntryExports) {
                if (typeof FEDERATION_ALLOW_NEW_FUNCTION !== "undefined") {
                    new Function("callbacks", `import("${entry}")${importCallback}`)([
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
}
async function loadSystemJsEntry({ entry, remoteEntryExports }) {
    return new Promise((resolve, reject)=>{
        try {
            if (!remoteEntryExports) {
                //@ts-ignore
                if (false) {} else {
                    new Function("callbacks", `System.import("${entry}")${importCallback}`)([
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
}
function handleRemoteEntryLoaded(name, globalName, entry) {
    const { remoteEntryKey, entryExports } = getRemoteEntryExports(name, globalName);
    assert(entryExports, (0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_001, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap, {
        remoteName: name,
        remoteEntryUrl: entry,
        remoteEntryKey
    }));
    return entryExports;
}
async function loadEntryScript({ name, globalName, entry, loaderHook }) {
    const { entryExports: remoteEntryExports } = getRemoteEntryExports(name, globalName);
    if (remoteEntryExports) {
        return remoteEntryExports;
    }
    return (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.loadScript)(entry, {
        attrs: {},
        createScriptHook: (url, attrs)=>{
            const res = loaderHook.lifecycle.createScript.emit({
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
        assert(undefined, (0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_008, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap, {
            remoteName: name,
            resourceUrl: entry
        }));
        throw e;
    });
}
async function loadEntryDom({ remoteInfo, remoteEntryExports, loaderHook }) {
    const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
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
}
async function loadEntryNode({ remoteInfo, loaderHook }) {
    const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
    const { entryExports: remoteEntryExports } = getRemoteEntryExports(name, globalName);
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
            createScriptHook: (url, attrs = {})=>{
                const res = loaderHook.lifecycle.createScript.emit({
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
}
function getRemoteEntryUniqueKey(remoteInfo) {
    const { entry, name } = remoteInfo;
    return (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.composeKeyWithSeparator)(name, entry);
}
async function getRemoteEntry({ origin, remoteEntryExports, remoteInfo }) {
    const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
    if (remoteEntryExports) {
        return remoteEntryExports;
    }
    if (!globalLoading[uniqueKey]) {
        const loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
        const loaderHook = origin.loaderHook;
        globalLoading[uniqueKey] = loadEntryHook.emit({
            loaderHook,
            remoteInfo,
            remoteEntryExports
        }).then((res)=>{
            if (res) {
                return res;
            }
            // Use ENV_TARGET if defined, otherwise fallback to isBrowserEnv, must keep this
            const isWebEnvironment = typeof ENV_TARGET !== "undefined" ? ENV_TARGET === "web" : (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isBrowserEnv)();
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
}
function getRemoteInfo(remote) {
    return (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, remote, {
        entry: "entry" in remote ? remote.entry : "",
        type: remote.type || DEFAULT_REMOTE_TYPE,
        entryGlobalName: remote.entryGlobalName || remote.name,
        shareScope: remote.shareScope || DEFAULT_SCOPE
    });
}
let Module = class Module {
    async getEntry() {
        if (this.remoteEntryExports) {
            return this.remoteEntryExports;
        }
        let remoteEntryExports;
        try {
            remoteEntryExports = await getRemoteEntry({
                origin: this.host,
                remoteInfo: this.remoteInfo,
                remoteEntryExports: this.remoteEntryExports
            });
        } catch (err) {
            const uniqueKey = getRemoteEntryUniqueKey(this.remoteInfo);
            remoteEntryExports = await this.host.loaderHook.lifecycle.loadEntryError.emit({
                getRemoteEntry,
                origin: this.host,
                remoteInfo: this.remoteInfo,
                remoteEntryExports: this.remoteEntryExports,
                globalLoading,
                uniqueKey
            });
        }
        assert(remoteEntryExports, `remoteEntryExports is undefined \n ${(0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.safeToString)(this.remoteInfo)}`);
        this.remoteEntryExports = remoteEntryExports;
        return this.remoteEntryExports;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async get(id, expose, options, remoteSnapshot) {
        const { loadFactory = true } = options || {
            loadFactory: true
        };
        // Get remoteEntry.js
        const remoteEntryExports = await this.getEntry();
        if (!this.inited) {
            const localShareScopeMap = this.host.shareScopeMap;
            const shareScopeKeys = Array.isArray(this.remoteInfo.shareScope) ? this.remoteInfo.shareScope : [
                this.remoteInfo.shareScope
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
            const shareScope = localShareScopeMap[shareScopeKeys[0]];
            const initScope = [];
            const remoteEntryInitOptions = {
                version: this.remoteInfo.version || "",
                shareScopeKeys: Array.isArray(this.remoteInfo.shareScope) ? shareScopeKeys : this.remoteInfo.shareScope || "default"
            };
            // Help to find host instance
            Object.defineProperty(remoteEntryInitOptions, "shareScopeMap", {
                value: localShareScopeMap,
                // remoteEntryInitOptions will be traversed and assigned during container init, ,so this attribute is not allowed to be traversed
                enumerable: false
            });
            const initContainerOptions = await this.host.hooks.lifecycle.beforeInitContainer.emit({
                shareScope,
                // @ts-ignore shareScopeMap will be set by Object.defineProperty
                remoteEntryInitOptions,
                initScope,
                remoteInfo: this.remoteInfo,
                origin: this.host
            });
            if (typeof (remoteEntryExports == null ? void 0 : remoteEntryExports.init) === "undefined") {
                error((0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_002, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap, {
                    hostName: this.host.name,
                    remoteName: this.remoteInfo.name,
                    remoteEntryUrl: this.remoteInfo.entry,
                    remoteEntryKey: this.remoteInfo.entryGlobalName
                }));
            }
            await remoteEntryExports.init(initContainerOptions.shareScope, initContainerOptions.initScope, initContainerOptions.remoteEntryInitOptions);
            await this.host.hooks.lifecycle.initContainer.emit((0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, initContainerOptions, {
                id,
                remoteSnapshot,
                remoteEntryExports
            }));
        }
        this.lib = remoteEntryExports;
        this.inited = true;
        let moduleFactory;
        moduleFactory = await this.host.loaderHook.lifecycle.getModuleFactory.emit({
            remoteEntryExports,
            expose,
            moduleInfo: this.remoteInfo
        });
        // get exposeGetter
        if (!moduleFactory) {
            moduleFactory = await remoteEntryExports.get(expose);
        }
        assert(moduleFactory, `${getFMId(this.remoteInfo)} remote don't export ${expose}.`);
        // keep symbol for module name always one format
        const symbolName = processModuleAlias(this.remoteInfo.name, expose);
        const wrapModuleFactory = this.wraperFactory(moduleFactory, symbolName);
        if (!loadFactory) {
            return wrapModuleFactory;
        }
        const exposeContent = await wrapModuleFactory();
        return exposeContent;
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
            return async ()=>{
                const res = await moduleFactory();
                // This parameter is used for bridge debugging
                defineModuleId(res, id);
                return res;
            };
        } else {
            return ()=>{
                const res = moduleFactory();
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
        const self = this;
        this.on(function wrapper(...args) {
            self.remove(wrapper);
            // eslint-disable-next-line prefer-spread
            return fn.apply(null, args);
        });
    }
    emit(...data) {
        let result;
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
    emit(...data) {
        let result;
        const ls = Array.from(this.listeners);
        if (ls.length > 0) {
            let i = 0;
            const call = (prev)=>{
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
        for(const key in originalData){
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
            error(`The data for the "${this.type}" hook should be an object.`);
        }
        for (const fn of this.listeners){
            try {
                const tempData = fn(data);
                if (checkReturnData(data, tempData)) {
                    data = tempData;
                } else {
                    this.onerror(`A plugin returned an unacceptable value for the "${this.type}" type.`);
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
            error(`The response data for the "${this.type}" hook must be an object.`);
        }
        const ls = Array.from(this.listeners);
        if (ls.length > 0) {
            let i = 0;
            const processError = (e)=>{
                warn(e);
                this.onerror(e);
                return data;
            };
            const call = (prevData)=>{
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
                    this.onerror(`A plugin returned an incorrect value for the "${this.type}" type.`);
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
        const pluginName = plugin.name;
        assert(pluginName, "A name must be provided by the plugin.");
        if (!this.registerPlugins[pluginName]) {
            this.registerPlugins[pluginName] = plugin;
            Object.keys(this.lifecycle).forEach((key)=>{
                const pluginLife = plugin[key];
                if (pluginLife) {
                    this.lifecycle[key].on(pluginLife);
                }
            });
        }
    }
    removePlugin(pluginName) {
        assert(pluginName, "A name is required.");
        const plugin = this.registerPlugins[pluginName];
        assert(plugin, `The plugin "${pluginName}" is not registered.`);
        Object.keys(plugin).forEach((key)=>{
            if (key !== "name") {
                this.lifecycle[key].remove(plugin[key]);
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    inherit({ lifecycle, registerPlugins }) {
        Object.keys(lifecycle).forEach((hookName)=>{
            assert(!this.lifecycle[hookName], `The hook "${hookName}" has a conflict and cannot be inherited.`);
            this.lifecycle[hookName] = lifecycle[hookName];
        });
        Object.keys(registerPlugins).forEach((pluginName)=>{
            assert(!this.registerPlugins[pluginName], `The plugin "${pluginName}" has a conflict and cannot be inherited.`);
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
        const remoteInfo = matchRemote(remotes, args.nameOrAlias);
        assert(remoteInfo, `Unable to preload ${args.nameOrAlias} as it is not included in ${!remoteInfo && (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.safeToString)({
            remoteInfo,
            remotes
        })}`);
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
function preloadAssets(remoteInfo, host, assets, useLinkPreload = true) {
    const { cssAssets, jsAssetsWithoutEntry, entryAssets } = assets;
    if (host.options.inBrowser) {
        entryAssets.forEach((asset)=>{
            const { moduleInfo } = asset;
            const module = host.moduleCache.get(remoteInfo.name);
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
            const defaultAttrs = {
                rel: "preload",
                as: "style"
            };
            cssAssets.forEach((cssUrl)=>{
                const { link: cssEl, needAttach } = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.createLink)({
                    url: cssUrl,
                    cb: ()=>{
                    // noop
                    },
                    attrs: defaultAttrs,
                    createLinkHook: (url, attrs)=>{
                        const res = host.loaderHook.lifecycle.createLink.emit({
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
            const defaultAttrs = {
                rel: "stylesheet",
                type: "text/css"
            };
            cssAssets.forEach((cssUrl)=>{
                const { link: cssEl, needAttach } = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.createLink)({
                    url: cssUrl,
                    cb: ()=>{
                    // noop
                    },
                    attrs: defaultAttrs,
                    createLinkHook: (url, attrs)=>{
                        const res = host.loaderHook.lifecycle.createLink.emit({
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
            const defaultAttrs = {
                rel: "preload",
                as: "script"
            };
            jsAssetsWithoutEntry.forEach((jsUrl)=>{
                const { link: linkEl, needAttach } = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.createLink)({
                    url: jsUrl,
                    cb: ()=>{
                    // noop
                    },
                    attrs: defaultAttrs,
                    createLinkHook: (url, attrs)=>{
                        const res = host.loaderHook.lifecycle.createLink.emit({
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
            const defaultAttrs = {
                fetchpriority: "high",
                type: (remoteInfo == null ? void 0 : remoteInfo.type) === "module" ? "module" : "text/javascript"
            };
            jsAssetsWithoutEntry.forEach((jsUrl)=>{
                const { script: scriptEl, needAttach } = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.createScript)({
                    url: jsUrl,
                    cb: ()=>{
                    // noop
                    },
                    attrs: defaultAttrs,
                    createScriptHook: (url, attrs)=>{
                        const res = host.loaderHook.lifecycle.createScript.emit({
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
    const remoteEntryInfo = getRemoteEntryInfoFromSnapshot(remoteSnapshot);
    if (!remoteEntryInfo.url) {
        error(`The attribute remoteEntry of ${remoteInfo.name} must not be undefined.`);
    }
    let entryUrl = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.getResourceUrl)(remoteSnapshot, remoteEntryInfo.url);
    if (!(0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isBrowserEnv)() && !entryUrl.startsWith("http")) {
        entryUrl = `https:${entryUrl}`;
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
        async afterResolve (args) {
            const { remote, pkgNameOrAlias, expose, origin, remoteInfo, id } = args;
            if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
                const { remoteSnapshot, globalSnapshot } = await origin.snapshotHandler.loadRemoteSnapshotInfo({
                    moduleInfo: remote,
                    id
                });
                assignRemoteInfo(remoteInfo, remoteSnapshot);
                // preloading assets
                const preloadOptions = {
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
                const assets = await origin.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit({
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
        }
    };
}
// name
// name:version
function splitId(id) {
    const splitInfo = id.split(":");
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
function traverseModuleInfo(globalSnapshot, remoteInfo, traverse, isRoot, memo = {}, remoteSnapshot) {
    const id = getFMId(remoteInfo);
    const { value: snapshotValue } = getInfoWithoutType(globalSnapshot, id);
    const effectiveRemoteSnapshot = remoteSnapshot || snapshotValue;
    if (effectiveRemoteSnapshot && !(0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isManifestProvider)(effectiveRemoteSnapshot)) {
        traverse(effectiveRemoteSnapshot, remoteInfo, isRoot);
        if (effectiveRemoteSnapshot.remotesInfo) {
            const remoteKeys = Object.keys(effectiveRemoteSnapshot.remotesInfo);
            for (const key of remoteKeys){
                if (memo[key]) {
                    continue;
                }
                memo[key] = true;
                const subRemoteInfo = splitId(key);
                const remoteValue = effectiveRemoteSnapshot.remotesInfo[key];
                traverseModuleInfo(globalSnapshot, {
                    name: subRemoteInfo.name,
                    version: remoteValue.matchedVersion
                }, traverse, false, memo, undefined);
            }
        }
    }
}
const isExisted = (type, url)=>{
    return document.querySelector(`${type}[${type === "link" ? "href" : "src"}="${url}"]`);
};
// eslint-disable-next-line max-lines-per-function
function generatePreloadAssets(origin, preloadOptions, remote, globalSnapshot, remoteSnapshot) {
    const cssAssets = [];
    const jsAssets = [];
    const entryAssets = [];
    const loadedSharedJsAssets = new Set();
    const loadedSharedCssAssets = new Set();
    const { options } = origin;
    const { preloadConfig: rootPreloadConfig } = preloadOptions;
    const { depsRemote } = rootPreloadConfig;
    const memo = {};
    traverseModuleInfo(globalSnapshot, remote, (moduleInfoSnapshot, remoteInfo, isRoot)=>{
        let preloadConfig;
        if (isRoot) {
            preloadConfig = rootPreloadConfig;
        } else {
            if (Array.isArray(depsRemote)) {
                // eslint-disable-next-line array-callback-return
                const findPreloadConfig = depsRemote.find((remoteConfig)=>{
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
        const remoteEntryUrl = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.getResourceUrl)(moduleInfoSnapshot, getRemoteEntryInfoFromSnapshot(moduleInfoSnapshot).url);
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
        let moduleAssetsInfo = "modules" in moduleInfoSnapshot ? moduleInfoSnapshot.modules : [];
        const normalizedPreloadExposes = normalizePreloadExposes(preloadConfig.exposes);
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
            const assetsRes = assets.map((asset)=>(0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.getResourceUrl)(moduleInfoSnapshot, asset));
            if (preloadConfig.filter) {
                return assetsRes.filter(preloadConfig.filter);
            }
            return assetsRes;
        }
        if (moduleAssetsInfo) {
            const assetsLength = moduleAssetsInfo.length;
            for(let index = 0; index < assetsLength; index++){
                const assetsInfo = moduleAssetsInfo[index];
                const exposeFullPath = `${remoteInfo.name}/${assetsInfo.moduleName}`;
                origin.remoteHandler.hooks.lifecycle.handlePreloadModule.emit({
                    id: assetsInfo.moduleName === "." ? remoteInfo.name : exposeFullPath,
                    name: remoteInfo.name,
                    remoteSnapshot: moduleInfoSnapshot,
                    preloadConfig,
                    remote: remoteInfo,
                    origin
                });
                const preloaded = getPreloaded(exposeFullPath);
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
        const collectSharedAssets = (shareInfo, snapshotShared)=>{
            const registeredShared = getRegisteredShare(origin.shareScopeMap, snapshotShared.sharedName, shareInfo, origin.sharedHandler.hooks.lifecycle.resolveShare);
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
            const shareInfos = (_options_shared = options.shared) == null ? void 0 : _options_shared[shared.sharedName];
            if (!shareInfos) {
                return;
            }
            // if no version, preload all shared
            const sharedOptions = shared.version ? shareInfos.find((s)=>s.version === shared.version) : shareInfos;
            if (!sharedOptions) {
                return;
            }
            const arrayShareInfo = arrayOptions(sharedOptions);
            arrayShareInfo.forEach((s)=>{
                collectSharedAssets(s, shared);
            });
        });
    }
    const needPreloadJsAssets = jsAssets.filter((asset)=>!loadedSharedJsAssets.has(asset) && !isExisted("script", asset));
    const needPreloadCssAssets = cssAssets.filter((asset)=>!loadedSharedCssAssets.has(asset) && !isExisted("link", asset));
    return {
        cssAssets: needPreloadCssAssets,
        jsAssetsWithoutEntry: needPreloadJsAssets,
        entryAssets: entryAssets.filter((entry)=>!isExisted("script", entry.url))
    };
}
const generatePreloadAssetsPlugin = function() {
    return {
        name: "generate-preload-assets-plugin",
        async generatePreloadAssets (args) {
            const { origin, preloadOptions, remoteInfo, remote, globalSnapshot, remoteSnapshot } = args;
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
            const assets = generatePreloadAssets(origin, preloadOptions, remoteInfo, globalSnapshot, remoteSnapshot);
            return assets;
        }
    };
};
function getGlobalRemoteInfo(moduleInfo, origin) {
    const hostGlobalSnapshot = getGlobalSnapshotInfoByModuleInfo({
        name: origin.name,
        version: origin.options.version
    });
    // get remote detail info from global
    const globalRemoteInfo = hostGlobalSnapshot && "remotesInfo" in hostGlobalSnapshot && hostGlobalSnapshot.remotesInfo && getInfoWithoutType(hostGlobalSnapshot.remotesInfo, moduleInfo.name).value;
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
    async loadRemoteSnapshotInfo({ moduleInfo, id, expose }) {
        const { options } = this.HostInstance;
        await this.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
            options,
            moduleInfo
        });
        let hostSnapshot = getGlobalSnapshotInfoByModuleInfo({
            name: this.HostInstance.options.name,
            version: this.HostInstance.options.version
        });
        if (!hostSnapshot) {
            hostSnapshot = {
                version: this.HostInstance.options.version || "",
                remoteEntry: "",
                remotesInfo: {}
            };
            addGlobalSnapshot({
                [this.HostInstance.options.name]: hostSnapshot
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
        const { hostGlobalSnapshot, remoteSnapshot, globalSnapshot } = this.getGlobalRemoteInfo(moduleInfo);
        const { remoteSnapshot: globalRemoteSnapshot, globalSnapshot: globalSnapshotRes } = await this.hooks.lifecycle.loadSnapshot.emit({
            options,
            moduleInfo,
            hostGlobalSnapshot,
            remoteSnapshot,
            globalSnapshot
        });
        let mSnapshot;
        let gSnapshot;
        // global snapshot includes manifest or module info includes manifest
        if (globalRemoteSnapshot) {
            if ((0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isManifestProvider)(globalRemoteSnapshot)) {
                const remoteEntry = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.isBrowserEnv)() ? globalRemoteSnapshot.remoteEntry : globalRemoteSnapshot.ssrRemoteEntry || globalRemoteSnapshot.remoteEntry || "";
                const moduleSnapshot = await this.getManifestJson(remoteEntry, moduleInfo, {});
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo((0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, moduleInfo, {
                    // The global remote may be overridden
                    // Therefore, set the snapshot key to the global address of the actual request
                    entry: remoteEntry
                }), moduleSnapshot);
                mSnapshot = moduleSnapshot;
                gSnapshot = globalSnapshotRes;
            } else {
                const { remoteSnapshot: remoteSnapshotRes } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                    options: this.HostInstance.options,
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
                const moduleSnapshot = await this.getManifestJson(moduleInfo.entry, moduleInfo, {});
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const globalSnapshotRes = setGlobalSnapshotInfoByModuleInfo(moduleInfo, moduleSnapshot);
                const { remoteSnapshot: remoteSnapshotRes } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                    options: this.HostInstance.options,
                    moduleInfo,
                    remoteSnapshot: moduleSnapshot,
                    from: "global"
                });
                mSnapshot = remoteSnapshotRes;
                gSnapshot = globalSnapshotRes;
            } else {
                error((0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_007, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap, {
                    hostName: moduleInfo.name,
                    hostVersion: moduleInfo.version,
                    globalSnapshot: JSON.stringify(globalSnapshotRes)
                }));
            }
        }
        await this.hooks.lifecycle.afterLoadSnapshot.emit({
            id,
            host: this.HostInstance,
            options,
            moduleInfo,
            remoteSnapshot: mSnapshot
        });
        return {
            remoteSnapshot: mSnapshot,
            globalSnapshot: gSnapshot
        };
    }
    getGlobalRemoteInfo(moduleInfo) {
        return getGlobalRemoteInfo(moduleInfo, this.HostInstance);
    }
    async getManifestJson(manifestUrl, moduleInfo, extraOptions) {
        const getManifest = async ()=>{
            let manifestJson = this.manifestCache.get(manifestUrl);
            if (manifestJson) {
                return manifestJson;
            }
            try {
                let res = await this.loaderHook.lifecycle.fetch.emit(manifestUrl, {});
                if (!res || !(res instanceof Response)) {
                    res = await fetch(manifestUrl, {});
                }
                manifestJson = await res.json();
            } catch (err) {
                manifestJson = await this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
                    id: manifestUrl,
                    error: err,
                    from: "runtime",
                    lifecycle: "afterResolve",
                    origin: this.HostInstance
                });
                if (!manifestJson) {
                    delete this.manifestLoading[manifestUrl];
                    error((0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_003, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap, {
                        manifestUrl,
                        moduleName: moduleInfo.name,
                        hostName: this.HostInstance.options.name
                    }, `${err}`));
                }
            }
            assert(manifestJson.metaData && manifestJson.exposes && manifestJson.shared, `${manifestUrl} is not a federation manifest`);
            this.manifestCache.set(manifestUrl, manifestJson);
            return manifestJson;
        };
        const asyncLoadProcess = async ()=>{
            const manifestJson = await getManifest();
            const remoteSnapshot = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.generateSnapshotFromManifest)(manifestJson, {
                version: manifestUrl
            });
            const { remoteSnapshot: remoteSnapshotRes } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
                options: this.HostInstance.options,
                moduleInfo,
                manifestJson,
                remoteSnapshot,
                manifestUrl,
                from: "manifest"
            });
            return remoteSnapshotRes;
        };
        if (!this.manifestLoading[manifestUrl]) {
            this.manifestLoading[manifestUrl] = asyncLoadProcess().then((res)=>res);
        }
        return this.manifestLoading[manifestUrl];
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
        const { shareInfos, shared } = formatShareConfigs(globalOptions, userOptions);
        const sharedKeys = Object.keys(shareInfos);
        sharedKeys.forEach((sharedKey)=>{
            const sharedVals = shareInfos[sharedKey];
            sharedVals.forEach((sharedVal)=>{
                const registeredShared = getRegisteredShare(this.shareScopeMap, sharedKey, sharedVal, this.hooks.lifecycle.resolveShare);
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
    async loadShare(pkgName, extraOptions) {
        const { host } = this;
        // This function performs the following steps:
        // 1. Checks if the currently loaded share already exists, if not, it throws an error
        // 2. Searches globally for a matching share, if found, it uses it directly
        // 3. If not found, it retrieves it from the current share and stores the obtained share globally.
        const shareInfo = getTargetSharedOptions({
            pkgName,
            extraOptions,
            shareInfos: host.options.shared
        });
        if (shareInfo == null ? void 0 : shareInfo.scope) {
            await Promise.all(shareInfo.scope.map(async (shareScope)=>{
                await Promise.all(this.initializeSharing(shareScope, {
                    strategy: shareInfo.strategy
                }));
                return;
            }));
        }
        const loadShareRes = await this.hooks.lifecycle.beforeLoadShare.emit({
            pkgName,
            shareInfo,
            shared: host.options.shared,
            origin: host
        });
        const { shareInfo: shareInfoRes } = loadShareRes;
        // Assert that shareInfoRes exists, if not, throw an error
        assert(shareInfoRes, `Cannot find ${pkgName} Share in the ${host.options.name}. Please ensure that the ${pkgName} Share parameters have been injected`);
        // Retrieve from cache
        const registeredShared = getRegisteredShare(this.shareScopeMap, pkgName, shareInfoRes, this.hooks.lifecycle.resolveShare);
        const addUseIn = (shared)=>{
            if (!shared.useIn) {
                shared.useIn = [];
            }
            addUniqueItem(shared.useIn, host.options.name);
        };
        if (registeredShared && registeredShared.lib) {
            addUseIn(registeredShared);
            return registeredShared.lib;
        } else if (registeredShared && registeredShared.loading && !registeredShared.loaded) {
            const factory = await registeredShared.loading;
            registeredShared.loaded = true;
            if (!registeredShared.lib) {
                registeredShared.lib = factory;
            }
            addUseIn(registeredShared);
            return factory;
        } else if (registeredShared) {
            const asyncLoadProcess = async ()=>{
                const factory = await registeredShared.get();
                shareInfoRes.lib = factory;
                shareInfoRes.loaded = true;
                addUseIn(shareInfoRes);
                const gShared = getRegisteredShare(this.shareScopeMap, pkgName, shareInfoRes, this.hooks.lifecycle.resolveShare);
                if (gShared) {
                    gShared.lib = factory;
                    gShared.loaded = true;
                }
                return factory;
            };
            const loading = asyncLoadProcess();
            this.setShared({
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
            const asyncLoadProcess = async ()=>{
                const factory = await shareInfoRes.get();
                shareInfoRes.lib = factory;
                shareInfoRes.loaded = true;
                addUseIn(shareInfoRes);
                const gShared = getRegisteredShare(this.shareScopeMap, pkgName, shareInfoRes, this.hooks.lifecycle.resolveShare);
                if (gShared) {
                    gShared.lib = factory;
                    gShared.loaded = true;
                }
                return factory;
            };
            const loading = asyncLoadProcess();
            this.setShared({
                pkgName,
                loaded: false,
                shared: shareInfoRes,
                from: host.options.name,
                lib: null,
                loading
            });
            return loading;
        }
    }
    /**
   * This function initializes the sharing sequence (executed only once per share scope).
   * It accepts one argument, the name of the share scope.
   * If the share scope does not exist, it creates one.
   */ // eslint-disable-next-line @typescript-eslint/member-ordering
    initializeSharing(shareScopeName = DEFAULT_SCOPE, extraOptions) {
        const { host } = this;
        const from = extraOptions == null ? void 0 : extraOptions.from;
        const strategy = extraOptions == null ? void 0 : extraOptions.strategy;
        let initScope = extraOptions == null ? void 0 : extraOptions.initScope;
        const promises = [];
        if (from !== "build") {
            const { initTokens } = this;
            if (!initScope) initScope = [];
            let initToken = initTokens[shareScopeName];
            if (!initToken) initToken = initTokens[shareScopeName] = {
                from: this.host.name
            };
            if (initScope.indexOf(initToken) >= 0) return promises;
            initScope.push(initToken);
        }
        const shareScope = this.shareScopeMap;
        const hostName = host.options.name;
        // Creates a new share scope if necessary
        if (!shareScope[shareScopeName]) {
            shareScope[shareScopeName] = {};
        }
        // Executes all initialization snippets from all accessible modules
        const scope = shareScope[shareScopeName];
        const register = (name, shared)=>{
            var _activeVersion_shareConfig;
            const { version, eager } = shared;
            scope[name] = scope[name] || {};
            const versions = scope[name];
            const activeVersion = versions[version];
            const activeVersionEager = Boolean(activeVersion && (activeVersion.eager || ((_activeVersion_shareConfig = activeVersion.shareConfig) == null ? void 0 : _activeVersion_shareConfig.eager)));
            if (!activeVersion || activeVersion.strategy !== "loaded-first" && !activeVersion.loaded && (Boolean(!eager) !== !activeVersionEager ? eager : hostName > activeVersion.from)) {
                versions[version] = shared;
            }
        };
        const initFn = (mod)=>mod && mod.init && mod.init(shareScope[shareScopeName], initScope);
        const initRemoteModule = async (key)=>{
            const { module } = await host.remoteHandler.getRemoteModuleAndOptions({
                id: key
            });
            if (module.getEntry) {
                let remoteEntryExports;
                try {
                    remoteEntryExports = await module.getEntry();
                } catch (error) {
                    remoteEntryExports = await host.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
                        id: key,
                        error,
                        from: "runtime",
                        lifecycle: "beforeLoadShare",
                        origin: host
                    });
                }
                if (!module.inited) {
                    await initFn(remoteEntryExports);
                    module.inited = true;
                }
            }
        };
        Object.keys(host.options.shared).forEach((shareName)=>{
            const sharedArr = host.options.shared[shareName];
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
        const { host } = this;
        const shareInfo = getTargetSharedOptions({
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
        const registeredShared = getRegisteredShare(this.shareScopeMap, pkgName, shareInfo, this.hooks.lifecycle.resolveShare);
        const addUseIn = (shared)=>{
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
                const module = registeredShared.get();
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
            const module = shareInfo.get();
            if (module instanceof Promise) {
                const errorCode = (extraOptions == null ? void 0 : extraOptions.from) === "build" ? _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_005 : _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_006;
                throw new Error((0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(errorCode, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap, {
                    hostName: host.options.name,
                    sharedPkgName: pkgName
                }));
            }
            shareInfo.lib = module;
            this.setShared({
                pkgName,
                loaded: true,
                from: host.options.name,
                lib: shareInfo.lib,
                shared: shareInfo
            });
            return shareInfo.lib;
        }
        throw new Error((0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_006, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap, {
            hostName: host.options.name,
            sharedPkgName: pkgName
        }));
    }
    initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
        const { host } = this;
        this.shareScopeMap[scopeName] = shareScope;
        this.hooks.lifecycle.initContainerShareScopeMap.emit({
            shareScope,
            options: host.options,
            origin: host,
            scopeName,
            hostShareScopeMap: extraOptions.hostShareScopeMap
        });
    }
    setShared({ pkgName, shared, from, lib, loading, loaded, get }) {
        const { version, scope = "default" } = shared, shareInfo = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__.a)(shared, [
            "version",
            "scope"
        ]);
        const scopes = Array.isArray(scope) ? scope : [
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
            const registeredShared = this.shareScopeMap[sc][pkgName][version];
            if (loading && !registeredShared.loading) {
                registeredShared.loading = loading;
            }
        });
    }
    _setGlobalShareScopeMap(hostOptions) {
        const globalShareScopeMap = getGlobalShareScope();
        const identifier = hostOptions.id || hostOptions.name;
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
        const userRemotes = userOptions.remotes || [];
        return userRemotes.reduce((res, remote)=>{
            this.registerRemote(remote, res, {
                force: false
            });
            return res;
        }, globalOptions.remotes);
    }
    setIdToRemoteMap(id, remoteMatchInfo) {
        const { remote, expose } = remoteMatchInfo;
        const { name, alias } = remote;
        this.idToRemoteMap[id] = {
            name: remote.name,
            expose
        };
        if (alias && id.startsWith(name)) {
            const idWithAlias = id.replace(name, alias);
            this.idToRemoteMap[idWithAlias] = {
                name: remote.name,
                expose
            };
            return;
        }
        if (alias && id.startsWith(alias)) {
            const idWithName = id.replace(alias, name);
            this.idToRemoteMap[idWithName] = {
                name: remote.name,
                expose
            };
        }
    }
    // eslint-disable-next-line max-lines-per-function
    // eslint-disable-next-line @typescript-eslint/member-ordering
    async loadRemote(id, options) {
        const { host } = this;
        try {
            const { loadFactory = true } = options || {
                loadFactory: true
            };
            // 1. Validate the parameters of the retrieved module. There are two module request methods: pkgName + expose and alias + expose.
            // 2. Request the snapshot information of the current host and globally store the obtained snapshot information. The retrieved module information is partially offline and partially online. The online module information will retrieve the modules used online.
            // 3. Retrieve the detailed information of the current module from global (remoteEntry address, expose resource address)
            // 4. After retrieving remoteEntry, call the init of the module, and then retrieve the exported content of the module through get
            // id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
            // id: alias(app1) + expose(button) = app1/button
            // id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
            const { module, moduleOptions, remoteMatchInfo } = await this.getRemoteModuleAndOptions({
                id
            });
            const { pkgNameOrAlias, remote, expose, id: idRes, remoteSnapshot } = remoteMatchInfo;
            const moduleOrFactory = await module.get(idRes, expose, options, remoteSnapshot);
            const moduleWrapper = await this.hooks.lifecycle.onLoad.emit({
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
            this.setIdToRemoteMap(id, remoteMatchInfo);
            if (typeof moduleWrapper === "function") {
                return moduleWrapper;
            }
            return moduleOrFactory;
        } catch (error) {
            const { from = "runtime" } = options || {
                from: "runtime"
            };
            const failOver = await this.hooks.lifecycle.errorLoadRemote.emit({
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
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    async preloadRemote(preloadOptions) {
        const { host } = this;
        await this.hooks.lifecycle.beforePreloadRemote.emit({
            preloadOps: preloadOptions,
            options: host.options,
            origin: host
        });
        const preloadOps = formatPreloadArgs(host.options.remotes, preloadOptions);
        await Promise.all(preloadOps.map(async (ops)=>{
            const { remote } = ops;
            const remoteInfo = getRemoteInfo(remote);
            const { globalSnapshot, remoteSnapshot } = await host.snapshotHandler.loadRemoteSnapshotInfo({
                moduleInfo: remote
            });
            const assets = await this.hooks.lifecycle.generatePreloadAssets.emit({
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
        }));
    }
    registerRemotes(remotes, options) {
        const { host } = this;
        remotes.forEach((remote)=>{
            this.registerRemote(remote, host.options.remotes, {
                force: options == null ? void 0 : options.force
            });
        });
    }
    async getRemoteModuleAndOptions(options) {
        const { host } = this;
        const { id } = options;
        let loadRemoteArgs;
        try {
            loadRemoteArgs = await this.hooks.lifecycle.beforeRequest.emit({
                id,
                options: host.options,
                origin: host
            });
        } catch (error) {
            loadRemoteArgs = await this.hooks.lifecycle.errorLoadRemote.emit({
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
        const { id: idRes } = loadRemoteArgs;
        const remoteSplitInfo = matchRemoteWithNameAndExpose(host.options.remotes, idRes);
        assert(remoteSplitInfo, (0,_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.getShortErrorMsg)(_module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.RUNTIME_004, _module_federation_error_codes__WEBPACK_IMPORTED_MODULE_2__.runtimeDescMap, {
            hostName: host.options.name,
            requestId: idRes
        }));
        const { remote: rawRemote } = remoteSplitInfo;
        const remoteInfo = getRemoteInfo(rawRemote);
        const matchInfo = await host.sharedHandler.hooks.lifecycle.afterResolve.emit((0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({
            id: idRes
        }, remoteSplitInfo, {
            options: host.options,
            origin: host,
            remoteInfo
        }));
        const { remote, expose } = matchInfo;
        assert(remote && expose, `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`);
        let module = host.moduleCache.get(remote.name);
        const moduleOptions = {
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
    }
    registerRemote(remote, targetRemotes, options) {
        const { host } = this;
        const normalizeRemote = ()=>{
            if (remote.alias) {
                // Validate if alias equals the prefix of remote.name and remote.alias, if so, throw an error
                // As multi-level path references cannot guarantee unique names, alias being a prefix of remote.name is not supported
                const findEqual = targetRemotes.find((item)=>{
                    var _item_alias;
                    return remote.alias && (item.name.startsWith(remote.alias) || ((_item_alias = item.alias) == null ? void 0 : _item_alias.startsWith(remote.alias)));
                });
                assert(!findEqual, `The alias ${remote.alias} of remote ${remote.name} is not allowed to be the prefix of ${findEqual && findEqual.name} name or alias`);
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
        const registeredRemote = targetRemotes.find((item)=>item.name === remote.name);
        if (!registeredRemote) {
            normalizeRemote();
            targetRemotes.push(remote);
            this.hooks.lifecycle.registerRemote.emit({
                remote,
                origin: host
            });
        } else {
            const messages = [
                `The remote "${remote.name}" is already registered.`,
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
            const { host } = this;
            const { name } = remote;
            const remoteIndex = host.options.remotes.findIndex((item)=>item.name === name);
            if (remoteIndex !== -1) {
                host.options.remotes.splice(remoteIndex, 1);
            }
            const loadedModule = host.moduleCache.get(remote.name);
            if (loadedModule) {
                const remoteInfo = loadedModule.remoteInfo;
                const key = remoteInfo.entryGlobalName;
                if (CurrentGlobal[key]) {
                    var _Object_getOwnPropertyDescriptor;
                    if ((_Object_getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor(CurrentGlobal, key)) == null ? void 0 : _Object_getOwnPropertyDescriptor.configurable) {
                        delete CurrentGlobal[key];
                    } else {
                        // @ts-ignore
                        CurrentGlobal[key] = undefined;
                    }
                }
                const remoteEntryUniqueKey = getRemoteEntryUniqueKey(loadedModule.remoteInfo);
                if (globalLoading[remoteEntryUniqueKey]) {
                    delete globalLoading[remoteEntryUniqueKey];
                }
                host.snapshotHandler.manifestCache.delete(remoteInfo.entry);
                // delete unloaded shared and instance
                let remoteInsId = remoteInfo.buildVersion ? (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_1__.composeKeyWithSeparator)(remoteInfo.name, remoteInfo.buildVersion) : remoteInfo.name;
                const remoteInsIndex = CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex((ins)=>{
                    if (remoteInfo.buildVersion) {
                        return ins.options.id === remoteInsId;
                    } else {
                        return ins.name === remoteInsId;
                    }
                });
                if (remoteInsIndex !== -1) {
                    const remoteIns = CurrentGlobal.__FEDERATION__.__INSTANCES__[remoteInsIndex];
                    remoteInsId = remoteIns.options.id || remoteInsId;
                    const globalShareScopeMap = getGlobalShareScope();
                    let isAllSharedNotUsed = true;
                    const needDeleteKeys = [];
                    Object.keys(globalShareScopeMap).forEach((instId)=>{
                        const shareScopeMap = globalShareScopeMap[instId];
                        shareScopeMap && Object.keys(shareScopeMap).forEach((shareScope)=>{
                            const shareScopeVal = shareScopeMap[shareScope];
                            shareScopeVal && Object.keys(shareScopeVal).forEach((shareName)=>{
                                const sharedPkgs = shareScopeVal[shareName];
                                sharedPkgs && Object.keys(sharedPkgs).forEach((shareVersion)=>{
                                    const shared = sharedPkgs[shareVersion];
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
                    needDeleteKeys.forEach(([insId, shareScope, shareName, shareVersion])=>{
                        var _globalShareScopeMap_insId_shareScope_shareName, _globalShareScopeMap_insId_shareScope, _globalShareScopeMap_insId;
                        (_globalShareScopeMap_insId = globalShareScopeMap[insId]) == null ? true : (_globalShareScopeMap_insId_shareScope = _globalShareScopeMap_insId[shareScope]) == null ? true : (_globalShareScopeMap_insId_shareScope_shareName = _globalShareScopeMap_insId_shareScope[shareName]) == null ? true : delete _globalShareScopeMap_insId_shareScope_shareName[shareVersion];
                    });
                    CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(remoteInsIndex, 1);
                }
                const { hostGlobalSnapshot } = getGlobalRemoteInfo(remote, host);
                if (hostGlobalSnapshot) {
                    const remoteKey = hostGlobalSnapshot && "remotesInfo" in hostGlobalSnapshot && hostGlobalSnapshot.remotesInfo && getInfoWithoutType(hostGlobalSnapshot.remotesInfo, remote.name).key;
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
const USE_SNAPSHOT =  true ? !false : 0; // Default to true (use snapshot) when not explicitly defined
class FederationHost {
    initOptions(userOptions) {
        this.registerPlugins(userOptions.plugins);
        const options = this.formatOptions(this.options, userOptions);
        this.options = options;
        return options;
    }
    async loadShare(pkgName, extraOptions) {
        return this.sharedHandler.loadShare(pkgName, extraOptions);
    }
    // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
    // 1. If the loaded shared already exists globally, then it will be reused
    // 2. If lib exists in local shared, it will be used directly
    // 3. If the local get returns something other than Promise, then it will be used directly
    loadShareSync(pkgName, extraOptions) {
        return this.sharedHandler.loadShareSync(pkgName, extraOptions);
    }
    initializeSharing(shareScopeName = DEFAULT_SCOPE, extraOptions) {
        return this.sharedHandler.initializeSharing(shareScopeName, extraOptions);
    }
    initRawContainer(name, url, container) {
        const remoteInfo = getRemoteInfo({
            name,
            entry: url
        });
        const module = new Module({
            host: this,
            remoteInfo
        });
        module.remoteEntryExports = container;
        this.moduleCache.set(name, module);
        return module;
    }
    // eslint-disable-next-line max-lines-per-function
    // eslint-disable-next-line @typescript-eslint/member-ordering
    async loadRemote(id, options) {
        return this.remoteHandler.loadRemote(id, options);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    async preloadRemote(preloadOptions) {
        return this.remoteHandler.preloadRemote(preloadOptions);
    }
    initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
        this.sharedHandler.initShareScopeMap(scopeName, shareScope, extraOptions);
    }
    formatOptions(globalOptions, userOptions) {
        const { shared } = formatShareConfigs(globalOptions, userOptions);
        const { userOptions: userOptionsRes, options: globalOptionsRes } = this.hooks.lifecycle.beforeInit.emit({
            origin: this,
            userOptions,
            options: globalOptions,
            shareInfo: shared
        });
        const remotes = this.remoteHandler.formatAndRegisterRemote(globalOptionsRes, userOptionsRes);
        const { shared: handledShared } = this.sharedHandler.registerShared(globalOptionsRes, userOptionsRes);
        const plugins = [
            ...globalOptionsRes.plugins
        ];
        if (userOptionsRes.plugins) {
            userOptionsRes.plugins.forEach((plugin)=>{
                if (!plugins.includes(plugin)) {
                    plugins.push(plugin);
                }
            });
        }
        const optionsRes = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, globalOptions, userOptions, {
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
        const pluginRes = registerPlugins(plugins, [
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
        const plugins = USE_SNAPSHOT ? [
            snapshotPlugin(),
            generatePreloadAssetsPlugin()
        ] : [];
        // TODO: Validate the details of the options
        // Initialize options with default values
        const defaultOptions = {
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
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _: () => (/* binding */ _extends),
/* harmony export */   a: () => (/* binding */ _object_without_properties_loose)
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
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FederationHost: () => (/* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.FederationHost),
/* harmony export */   Module: () => (/* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Module),
/* harmony export */   getInstance: () => (/* binding */ getInstance),
/* harmony export */   getRemoteEntry: () => (/* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getRemoteEntry),
/* harmony export */   getRemoteInfo: () => (/* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getRemoteInfo),
/* harmony export */   init: () => (/* binding */ init),
/* harmony export */   loadRemote: () => (/* binding */ loadRemote),
/* harmony export */   loadScript: () => (/* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.loadScript),
/* harmony export */   loadScriptNode: () => (/* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.loadScriptNode),
/* harmony export */   loadShare: () => (/* binding */ loadShare),
/* harmony export */   loadShareSync: () => (/* binding */ loadShareSync),
/* harmony export */   preloadRemote: () => (/* binding */ preloadRemote),
/* harmony export */   registerGlobalPlugins: () => (/* reexport safe */ _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.registerGlobalPlugins),
/* harmony export */   registerPlugins: () => (/* binding */ registerPlugins),
/* harmony export */   registerRemotes: () => (/* binding */ registerRemotes)
/* harmony export */ });
/* harmony import */ var _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @module-federation/runtime-core */ "../../packages/runtime-core/dist/index.esm.js");
/* harmony import */ var _utils_esm_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.esm.js */ "../../packages/runtime/dist/utils.esm.js");



let FederationInstance = null;
function init(options) {
    // Retrieve the same instance with the same name
    const instance = (0,_utils_esm_js__WEBPACK_IMPORTED_MODULE_1__.g)(options.name, options.version);
    if (!instance) {
        // Retrieve debug constructor
        const FederationConstructor = (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getGlobalFederationConstructor)() || _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.FederationHost;
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
function loadRemote(...args) {
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    const loadRemote1 = FederationInstance.loadRemote;
    // eslint-disable-next-line prefer-spread
    return loadRemote1.apply(FederationInstance, args);
}
function loadShare(...args) {
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    // eslint-disable-next-line prefer-spread
    const loadShare1 = FederationInstance.loadShare;
    return loadShare1.apply(FederationInstance, args);
}
function loadShareSync(...args) {
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    const loadShareSync1 = FederationInstance.loadShareSync;
    // eslint-disable-next-line prefer-spread
    return loadShareSync1.apply(FederationInstance, args);
}
function preloadRemote(...args) {
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    // eslint-disable-next-line prefer-spread
    return FederationInstance.preloadRemote.apply(FederationInstance, args);
}
function registerRemotes(...args) {
    (0,_module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assert)(FederationInstance, "Please call init first");
    // eslint-disable-next-line prefer-spread
    return FederationInstance.registerRemotes.apply(FederationInstance, args);
}
function registerPlugins(...args) {
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
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   g: () => (/* binding */ getGlobalFederationInstance)
/* harmony export */ });
/* harmony import */ var _module_federation_runtime_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @module-federation/runtime-core */ "../../packages/runtime-core/dist/index.esm.js");

// injected by bundler, so it can not use runtime-core stuff
function getBuilderId() {
    //@ts-ignore
    return  true ? "home_app:1.0.0" : 0;
}
function getGlobalFederationInstance(name, version) {
    const buildId = getBuilderId();
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
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BROWSER_LOG_KEY: () => (/* binding */ BROWSER_LOG_KEY),
/* harmony export */   ENCODE_NAME_PREFIX: () => (/* binding */ ENCODE_NAME_PREFIX),
/* harmony export */   EncodedNameTransformMap: () => (/* binding */ EncodedNameTransformMap),
/* harmony export */   FederationModuleManifest: () => (/* binding */ FederationModuleManifest),
/* harmony export */   MANIFEST_EXT: () => (/* binding */ MANIFEST_EXT),
/* harmony export */   MFModuleType: () => (/* binding */ MFModuleType),
/* harmony export */   MFPrefetchCommon: () => (/* binding */ MFPrefetchCommon),
/* harmony export */   MODULE_DEVTOOL_IDENTIFIER: () => (/* binding */ MODULE_DEVTOOL_IDENTIFIER),
/* harmony export */   ManifestFileName: () => (/* binding */ ManifestFileName),
/* harmony export */   NameTransformMap: () => (/* binding */ NameTransformMap),
/* harmony export */   NameTransformSymbol: () => (/* binding */ NameTransformSymbol),
/* harmony export */   SEPARATOR: () => (/* binding */ SEPARATOR),
/* harmony export */   StatsFileName: () => (/* binding */ StatsFileName),
/* harmony export */   TEMP_DIR: () => (/* binding */ TEMP_DIR),
/* harmony export */   assert: () => (/* binding */ assert),
/* harmony export */   composeKeyWithSeparator: () => (/* binding */ composeKeyWithSeparator),
/* harmony export */   containerPlugin: () => (/* binding */ ContainerPlugin),
/* harmony export */   containerReferencePlugin: () => (/* binding */ ContainerReferencePlugin),
/* harmony export */   createLink: () => (/* binding */ createLink),
/* harmony export */   createLogger: () => (/* binding */ createLogger),
/* harmony export */   createScript: () => (/* binding */ createScript),
/* harmony export */   createScriptNode: () => (/* binding */ createScriptNode),
/* harmony export */   decodeName: () => (/* binding */ decodeName),
/* harmony export */   encodeName: () => (/* binding */ encodeName),
/* harmony export */   error: () => (/* binding */ error),
/* harmony export */   generateExposeFilename: () => (/* binding */ generateExposeFilename),
/* harmony export */   generateShareFilename: () => (/* binding */ generateShareFilename),
/* harmony export */   generateSnapshotFromManifest: () => (/* binding */ generateSnapshotFromManifest),
/* harmony export */   getProcessEnv: () => (/* binding */ getProcessEnv),
/* harmony export */   getResourceUrl: () => (/* binding */ getResourceUrl),
/* harmony export */   inferAutoPublicPath: () => (/* binding */ inferAutoPublicPath),
/* harmony export */   isBrowserEnv: () => (/* binding */ isBrowserEnv),
/* harmony export */   isDebugMode: () => (/* binding */ isDebugMode),
/* harmony export */   isManifestProvider: () => (/* binding */ isManifestProvider),
/* harmony export */   isReactNativeEnv: () => (/* binding */ isReactNativeEnv),
/* harmony export */   isRequiredVersion: () => (/* binding */ isRequiredVersion),
/* harmony export */   isStaticResourcesEqual: () => (/* binding */ isStaticResourcesEqual),
/* harmony export */   loadScript: () => (/* binding */ loadScript),
/* harmony export */   loadScriptNode: () => (/* binding */ loadScriptNode),
/* harmony export */   logger: () => (/* binding */ logger),
/* harmony export */   moduleFederationPlugin: () => (/* binding */ ModuleFederationPlugin),
/* harmony export */   normalizeOptions: () => (/* binding */ normalizeOptions),
/* harmony export */   parseEntry: () => (/* binding */ parseEntry),
/* harmony export */   safeToString: () => (/* binding */ safeToString),
/* harmony export */   safeWrapper: () => (/* binding */ safeWrapper),
/* harmony export */   sharePlugin: () => (/* binding */ SharePlugin),
/* harmony export */   simpleJoinRemoteEntry: () => (/* binding */ simpleJoinRemoteEntry),
/* harmony export */   warn: () => (/* binding */ warn)
/* harmony export */ });
/* harmony import */ var _polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfills.esm.js */ "../../packages/sdk/dist/polyfills.esm.js");

const FederationModuleManifest = "federation-manifest.json";
const MANIFEST_EXT = ".json";
const BROWSER_LOG_KEY = "FEDERATION_DEBUG";
const NameTransformSymbol = {
    AT: "@",
    HYPHEN: "-",
    SLASH: "/"
};
const NameTransformMap = {
    [NameTransformSymbol.AT]: "scope_",
    [NameTransformSymbol.HYPHEN]: "_",
    [NameTransformSymbol.SLASH]: "__"
};
const EncodedNameTransformMap = {
    [NameTransformMap[NameTransformSymbol.AT]]: NameTransformSymbol.AT,
    [NameTransformMap[NameTransformSymbol.HYPHEN]]: NameTransformSymbol.HYPHEN,
    [NameTransformMap[NameTransformSymbol.SLASH]]: NameTransformSymbol.SLASH
};
const SEPARATOR = ":";
const ManifestFileName = "mf-manifest.json";
const StatsFileName = "mf-stats.json";
const MFModuleType = {
    NPM: "npm",
    APP: "app"
};
const MODULE_DEVTOOL_IDENTIFIER = "__MF_DEVTOOLS_MODULE_INFO__";
const ENCODE_NAME_PREFIX = "ENCODE_NAME_PREFIX";
const TEMP_DIR = ".federation";
const MFPrefetchCommon = {
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
    return  false && 0;
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
const getProcessEnv = function() {
    return typeof process !== "undefined" && process.env ? process.env : {};
};
const LOG_CATEGORY = "[ Federation Runtime ]";
// entry: name:version   version : 1.0.0 | ^1.2.3
// entry: name:entry  entry:  https://localhost:9000/federation-manifest.json
const parseEntry = (str, devVerOrUrl, separator = SEPARATOR)=>{
    const strSplit = str.split(separator);
    const devVersionOrUrl = getProcessEnv()["NODE_ENV"] === "development" && devVerOrUrl;
    const defaultVersion = "*";
    const isEntry = (s)=>s.startsWith("http") || s.includes(MANIFEST_EXT);
    // Check if the string starts with a type
    if (strSplit.length >= 2) {
        let [name, ...versionOrEntryArr] = strSplit;
        // @name@manifest-url.json
        if (str.startsWith(separator)) {
            name = strSplit.slice(0, 2).join(separator);
            versionOrEntryArr = [
                devVersionOrUrl || strSplit.slice(2).join(separator)
            ];
        }
        let versionOrEntry = devVersionOrUrl || versionOrEntryArr.join(separator);
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
        const [name] = strSplit;
        if (devVersionOrUrl && isEntry(devVersionOrUrl)) {
            return {
                name,
                entry: devVersionOrUrl
            };
        }
        return {
            name,
            version: devVersionOrUrl || defaultVersion
        };
    } else {
        throw `Invalid entry value: ${str}`;
    }
};
const composeKeyWithSeparator = function(...args) {
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
        return `${sum}${SEPARATOR}${cur}`;
    }, "");
};
const encodeName = function(name, prefix = "", withExt = false) {
    try {
        const ext = withExt ? ".js" : "";
        return `${prefix}${name.replace(new RegExp(`${NameTransformSymbol.AT}`, "g"), NameTransformMap[NameTransformSymbol.AT]).replace(new RegExp(`${NameTransformSymbol.HYPHEN}`, "g"), NameTransformMap[NameTransformSymbol.HYPHEN]).replace(new RegExp(`${NameTransformSymbol.SLASH}`, "g"), NameTransformMap[NameTransformSymbol.SLASH])}${ext}`;
    } catch (err) {
        throw err;
    }
};
const decodeName = function(name, prefix, withExt) {
    try {
        let decodedName = name;
        if (prefix) {
            if (!decodedName.startsWith(prefix)) {
                return decodedName;
            }
            decodedName = decodedName.replace(new RegExp(prefix, "g"), "");
        }
        decodedName = decodedName.replace(new RegExp(`${NameTransformMap[NameTransformSymbol.AT]}`, "g"), EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.AT]]).replace(new RegExp(`${NameTransformMap[NameTransformSymbol.SLASH]}`, "g"), EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.SLASH]]).replace(new RegExp(`${NameTransformMap[NameTransformSymbol.HYPHEN]}`, "g"), EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.HYPHEN]]);
        if (withExt) {
            decodedName = decodedName.replace(".js", "");
        }
        return decodedName;
    } catch (err) {
        throw err;
    }
};
const generateExposeFilename = (exposeName, withExt)=>{
    if (!exposeName) {
        return "";
    }
    let expose = exposeName;
    if (expose === ".") {
        expose = "default_export";
    }
    if (expose.startsWith("./")) {
        expose = expose.replace("./", "");
    }
    return encodeName(expose, "__federation_expose_", withExt);
};
const generateShareFilename = (pkgName, withExt)=>{
    if (!pkgName) {
        return "";
    }
    return encodeName(pkgName, "__federation_shared_", withExt);
};
const getResourceUrl = (module, sourceUrl)=>{
    if ("getPublicPath" in module) {
        let publicPath;
        if (!module.getPublicPath.startsWith("function")) {
            publicPath = new Function(module.getPublicPath)();
        } else {
            publicPath = new Function("return " + module.getPublicPath)()();
        }
        return `${publicPath}${sourceUrl}`;
    } else if ("publicPath" in module) {
        if (!isBrowserEnv() && !isReactNativeEnv() && "ssrPublicPath" in module) {
            return `${module.ssrPublicPath}${sourceUrl}`;
        }
        return `${module.publicPath}${sourceUrl}`;
    } else {
        console.warn("Cannot get resource URL. If in debug mode, please ignore.", module, sourceUrl);
        return "";
    }
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const assert = (condition, msg)=>{
    if (!condition) {
        error(msg);
    }
};
const error = (msg)=>{
    throw new Error(`${LOG_CATEGORY}: ${msg}`);
};
const warn = (msg)=>{
    console.warn(`${LOG_CATEGORY}: ${msg}`);
};
function safeToString(info) {
    try {
        return JSON.stringify(info, null, 2);
    } catch (e) {
        return "";
    }
}
// RegExp for version string
const VERSION_PATTERN_REGEXP = /^([\d^=v<>~]|[*xX]$)/;
function isRequiredVersion(str) {
    return VERSION_PATTERN_REGEXP.test(str);
}
const simpleJoinRemoteEntry = (rPath, rName)=>{
    if (!rPath) {
        return rName;
    }
    const transformPath = (str)=>{
        if (str === ".") {
            return "";
        }
        if (str.startsWith("./")) {
            return str.replace("./", "");
        }
        if (str.startsWith("/")) {
            const strWithoutSlash = str.slice(1);
            if (strWithoutSlash.endsWith("/")) {
                return strWithoutSlash.slice(0, -1);
            }
            return strWithoutSlash;
        }
        return str;
    };
    const transformedPath = transformPath(rPath);
    if (!transformedPath) {
        return rName;
    }
    if (transformedPath.endsWith("/")) {
        return `${transformedPath}${rName}`;
    }
    return `${transformedPath}/${rName}`;
};
function inferAutoPublicPath(url) {
    return url.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
}
// Priority: overrides > remotes
// eslint-disable-next-line max-lines-per-function
function generateSnapshotFromManifest(manifest, options = {}) {
    var _manifest_metaData, _manifest_metaData1;
    const { remotes = {}, overrides = {}, version } = options;
    let remoteSnapshot;
    const getPublicPath = ()=>{
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
    const overridesKeys = Object.keys(overrides);
    let remotesInfo = {};
    // If remotes are not provided, only the remotes in the manifest will be read
    if (!Object.keys(remotes).length) {
        var _manifest_remotes;
        remotesInfo = ((_manifest_remotes = manifest.remotes) == null ? void 0 : _manifest_remotes.reduce((res, next)=>{
            let matchedVersion;
            const name = next.federationContainerName;
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
    const { remoteEntry: { path: remoteEntryPath, name: remoteEntryName, type: remoteEntryType }, types: remoteTypes, buildInfo: { buildVersion }, globalName, ssrRemoteEntry } = manifest.metaData;
    const { exposes } = manifest;
    let basicRemoteSnapshot = {
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
        const prefetchInterface = manifest.metaData.prefetchInterface;
        basicRemoteSnapshot = (0,_polyfills_esm_js__WEBPACK_IMPORTED_MODULE_0__._)({}, basicRemoteSnapshot, {
            prefetchInterface
        });
    }
    if ((_manifest_metaData1 = manifest.metaData) == null ? void 0 : _manifest_metaData1.prefetchEntry) {
        const { path, name, type } = manifest.metaData.prefetchEntry;
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
        const fullSSRRemoteEntry = simpleJoinRemoteEntry(ssrRemoteEntry.path, ssrRemoteEntry.name);
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
const PREFIX = "[ Module Federation ]";
let Logger = class Logger {
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    log(...args) {
        console.log(this.prefix, ...args);
    }
    warn(...args) {
        console.log(this.prefix, ...args);
    }
    error(...args) {
        console.log(this.prefix, ...args);
    }
    success(...args) {
        console.log(this.prefix, ...args);
    }
    info(...args) {
        console.log(this.prefix, ...args);
    }
    ready(...args) {
        console.log(this.prefix, ...args);
    }
    debug(...args) {
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
const logger = createLogger(PREFIX);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeWrapper(callback, disableWarn) {
    try {
        const res = await callback();
        return res;
    } catch (e) {
        !disableWarn && warn(e);
        return;
    }
}
function isStaticResourcesEqual(url1, url2) {
    const REG_EXP = /^(https?:)?\/\//i;
    // Transform url1 and url2 into relative paths
    const relativeUrl1 = url1.replace(REG_EXP, "").replace(/\/$/, "");
    const relativeUrl2 = url2.replace(REG_EXP, "").replace(/\/$/, "");
    // Check if the relative paths are identical
    return relativeUrl1 === relativeUrl2;
}
function createScript(info) {
    // Retrieve the existing script element by its src attribute
    let script = null;
    let needAttach = true;
    let timeout = 20000;
    let timeoutId;
    const scripts = document.getElementsByTagName("script");
    for(let i = 0; i < scripts.length; i++){
        const s = scripts[i];
        const scriptSrc = s.getAttribute("src");
        if (scriptSrc && isStaticResourcesEqual(scriptSrc, info.url)) {
            script = s;
            needAttach = false;
            break;
        }
    }
    if (!script) {
        const attrs = info.attrs;
        script = document.createElement("script");
        script.type = (attrs == null ? void 0 : attrs["type"]) === "module" ? "module" : "text/javascript";
        let createScriptRes = undefined;
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
    const onScriptComplete = async (prev, event)=>{
        clearTimeout(timeoutId);
        const onScriptCompleteCallback = ()=>{
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
                const { needDeleteScript = true } = info;
                if (needDeleteScript) {
                    (script == null ? void 0 : script.parentNode) && script.parentNode.removeChild(script);
                }
            });
            if (prev && typeof prev === "function") {
                const result = prev(event);
                if (result instanceof Promise) {
                    const res = await result;
                    onScriptCompleteCallback();
                    return res;
                }
                onScriptCompleteCallback();
                return result;
            }
        }
        onScriptCompleteCallback();
    };
    script.onerror = onScriptComplete.bind(null, script.onerror);
    script.onload = onScriptComplete.bind(null, script.onload);
    timeoutId = setTimeout(()=>{
        onScriptComplete(null, new Error(`Remote script "${info.url}" time-outed.`));
    }, timeout);
    return {
        script,
        needAttach
    };
}
function createLink(info) {
    // <link rel="preload" href="script.js" as="script">
    // Retrieve the existing script element by its src attribute
    let link = null;
    let needAttach = true;
    const links = document.getElementsByTagName("link");
    for(let i = 0; i < links.length; i++){
        const l = links[i];
        const linkHref = l.getAttribute("href");
        const linkRel = l.getAttribute("rel");
        if (linkHref && isStaticResourcesEqual(linkHref, info.url) && linkRel === info.attrs["rel"]) {
            link = l;
            needAttach = false;
            break;
        }
    }
    if (!link) {
        link = document.createElement("link");
        link.setAttribute("href", info.url);
        let createLinkRes = undefined;
        const attrs = info.attrs;
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
    const onLinkComplete = (prev, event)=>{
        const onLinkCompleteCallback = ()=>{
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
                const { needDeleteLink = true } = info;
                if (needDeleteLink) {
                    (link == null ? void 0 : link.parentNode) && link.parentNode.removeChild(link);
                }
            });
            if (prev) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const res = prev(event);
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
    const { attrs = {}, createScriptHook } = info;
    return new Promise((resolve, reject)=>{
        const { script, needAttach } = createScript({
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
    const importModule = new Function("name", `return import(name)`);
    return importModule(name).then((res)=>res).catch((error1)=>{
        console.error(`Error importing module ${name}:`, error1);
        throw error1;
    });
}
const loadNodeFetch = async ()=>{
    const fetchModule = await importNodeModule("node-fetch");
    return fetchModule.default || fetchModule;
};
const lazyLoaderHookFetch = async (input, init, loaderHook)=>{
    const hook = (url, init)=>{
        return loaderHook.lifecycle.fetch.emit(url, init);
    };
    const res = await hook(input, init || {});
    if (!res || !(res instanceof Response)) {
        const fetchFunction = typeof fetch === "undefined" ? await loadNodeFetch() : fetch;
        return fetchFunction(input, init || {});
    }
    return res;
};
const createScriptNode = typeof ENV_TARGET === "undefined" || ENV_TARGET !== "web" ? (url, cb, attrs, loaderHook)=>{
    if (loaderHook == null ? void 0 : loaderHook.createScriptHook) {
        const hookResult = loaderHook.createScriptHook(url);
        if (hookResult && typeof hookResult === "object" && "url" in hookResult) {
            url = hookResult.url;
        }
    }
    let urlObj;
    try {
        urlObj = new URL(url);
    } catch (e) {
        console.error("Error constructing URL:", e);
        cb(new Error(`Invalid URL: ${e}`));
        return;
    }
    const getFetch = async ()=>{
        if (loaderHook == null ? void 0 : loaderHook.fetch) {
            return (input, init)=>lazyLoaderHookFetch(input, init, loaderHook);
        }
        return typeof fetch === "undefined" ? loadNodeFetch() : fetch;
    };
    const handleScriptFetch = async (f, urlObj)=>{
        try {
            var _vm_constants;
            const res = await f(urlObj.href);
            const data = await res.text();
            const [path, vm] = await Promise.all([
                importNodeModule("path"),
                importNodeModule("vm")
            ]);
            const scriptContext = {
                exports: {},
                module: {
                    exports: {}
                }
            };
            const urlDirname = urlObj.pathname.split("/").slice(0, -1).join("/");
            const filename = path.basename(urlObj.pathname);
            var _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER;
            const script = new vm.Script(`(function(exports, module, require, __dirname, __filename) {${data}\n})`, {
                filename,
                importModuleDynamically: (_vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER = (_vm_constants = vm.constants) == null ? void 0 : _vm_constants.USE_MAIN_CONTEXT_DEFAULT_LOADER) != null ? _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER : importNodeModule
            });
            script.runInThisContext()(scriptContext.exports, scriptContext.module, eval("require"), urlDirname, filename);
            const exportedInterface = scriptContext.module.exports || scriptContext.exports;
            if (attrs && exportedInterface && attrs["globalName"]) {
                const container = exportedInterface[attrs["globalName"]] || exportedInterface;
                cb(undefined, container);
                return;
            }
            cb(undefined, exportedInterface);
        } catch (e) {
            cb(e instanceof Error ? e : new Error(`Script execution error: ${e}`));
        }
    };
    getFetch().then(async (f)=>{
        if ((attrs == null ? void 0 : attrs["type"]) === "esm" || (attrs == null ? void 0 : attrs["type"]) === "module") {
            return loadModule(urlObj.href, {
                fetch: f,
                vm: await importNodeModule("vm")
            }).then(async (module)=>{
                await module.evaluate();
                cb(undefined, module.namespace);
            }).catch((e)=>{
                cb(e instanceof Error ? e : new Error(`Script execution error: ${e}`));
            });
        }
        handleScriptFetch(f, urlObj);
    }).catch((err)=>{
        cb(err);
    });
} : (url, cb, attrs, loaderHook)=>{
    cb(new Error("createScriptNode is disabled in non-Node.js environment"));
};
const loadScriptNode = typeof ENV_TARGET === "undefined" || ENV_TARGET !== "web" ? (url, info)=>{
    return new Promise((resolve, reject)=>{
        createScriptNode(url, (error1, scriptContext)=>{
            if (error1) {
                reject(error1);
            } else {
                var _info_attrs, _info_attrs1;
                const remoteEntryKey = (info == null ? void 0 : (_info_attrs = info.attrs) == null ? void 0 : _info_attrs["globalName"]) || `__FEDERATION_${info == null ? void 0 : (_info_attrs1 = info.attrs) == null ? void 0 : _info_attrs1["name"]}:custom__`;
                const entryExports = globalThis[remoteEntryKey] = scriptContext;
                resolve(entryExports);
            }
        }, info.attrs, info.loaderHook);
    });
} : (url, info)=>{
    throw new Error("loadScriptNode is disabled in non-Node.js environment");
};
async function loadModule(url, options) {
    const { fetch: fetch1, vm } = options;
    const response = await fetch1(url);
    const code = await response.text();
    const module = new vm.SourceTextModule(code, {
        // @ts-ignore
        importModuleDynamically: async (specifier, script)=>{
            const resolvedUrl = new URL(specifier, url).href;
            return loadModule(resolvedUrl, options);
        }
    });
    await module.link(async (specifier)=>{
        const resolvedUrl = new URL(specifier, url).href;
        const module = await loadModule(resolvedUrl, options);
        return module;
    });
    return module;
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
        throw new Error(`Unexpected type for \`${key}\`, expect boolean/undefined/object, got: ${typeof options}`);
    };
}



/***/ }),

/***/ "../../packages/sdk/dist/polyfills.esm.js":
/*!************************************************!*\
  !*** ../../packages/sdk/dist/polyfills.esm.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _: () => (/* binding */ _extends)
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
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FEDERATION_SUPPORTED_TYPES: () => (/* binding */ FEDERATION_SUPPORTED_TYPES)
/* harmony export */ });
const FEDERATION_SUPPORTED_TYPES = [
    "script"
];



/***/ }),

/***/ "../../packages/webpack-bundler-runtime/dist/index.esm.js":
/*!****************************************************************!*\
  !*** ../../packages/webpack-bundler-runtime/dist/index.esm.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ federation)
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
    const { chunkId, promises, chunkMapping, idToExternalAndNameMapping, webpackRequire, idToRemoteMap } = options;
    attachShareScopeMap(webpackRequire);
    if (webpackRequire.o(chunkMapping, chunkId)) {
        chunkMapping[chunkId].forEach((id)=>{
            let getScope = webpackRequire.R;
            if (!getScope) {
                getScope = [];
            }
            const data = idToExternalAndNameMapping[id];
            const remoteInfos = idToRemoteMap[id];
            // @ts-ignore seems not work
            if (getScope.indexOf(data) >= 0) {
                return;
            }
            // @ts-ignore seems not work
            getScope.push(data);
            if (data.p) {
                return promises.push(data.p);
            }
            const onError = (error)=>{
                if (!error) {
                    error = new Error("Container missing");
                }
                if (typeof error.message === "string") {
                    error.message += `\nwhile loading "${data[1]}" from ${data[2]}`;
                }
                webpackRequire.m[id] = ()=>{
                    throw error;
                };
                data.p = 0;
            };
            const handleFunction = (fn, arg1, arg2, d, next, first)=>{
                try {
                    const promise = fn(arg1, arg2);
                    if (promise && promise.then) {
                        const p = promise.then((result)=>next(result, d), onError);
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
            const onExternal = (external, _, first)=>external ? handleFunction(webpackRequire.I, data[0], 0, external, onInitialized, first) : onError();
            // eslint-disable-next-line no-var
            var onInitialized = (_, external, first)=>handleFunction(external.get, data[1], getScope, 0, onFactory, first);
            // eslint-disable-next-line no-var
            var onFactory = (factory)=>{
                data.p = 1;
                webpackRequire.m[id] = (module)=>{
                    module.exports = factory();
                };
            };
            const onRemoteLoaded = ()=>{
                try {
                    const remoteName = (0,_module_federation_sdk__WEBPACK_IMPORTED_MODULE_2__.decodeName)(remoteInfos[0].name, _module_federation_sdk__WEBPACK_IMPORTED_MODULE_2__.ENCODE_NAME_PREFIX);
                    const remoteModuleName = remoteName + data[1].slice(1);
                    const instance = webpackRequire.federation.instance;
                    const loadRemote = ()=>webpackRequire.federation.instance.loadRemote(remoteModuleName, {
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
            const useRuntimeLoad = remoteInfos.length === 1 && _constant_esm_js__WEBPACK_IMPORTED_MODULE_1__.FEDERATION_SUPPORTED_TYPES.includes(remoteInfos[0].externalType) && remoteInfos[0].name;
            if (useRuntimeLoad) {
                handleFunction(onRemoteLoaded, data[2], 0, 0, onFactory, 1);
            } else {
                handleFunction(webpackRequire, data[2], 0, 0, onExternal, 1);
            }
        });
    }
}
function consumes(options) {
    const { chunkId, promises, chunkMapping, installedModules, moduleToHandlerMapping, webpackRequire } = options;
    attachShareScopeMap(webpackRequire);
    if (webpackRequire.o(chunkMapping, chunkId)) {
        chunkMapping[chunkId].forEach((id)=>{
            if (webpackRequire.o(installedModules, id)) {
                return promises.push(installedModules[id]);
            }
            const onFactory = (factory)=>{
                installedModules[id] = 0;
                webpackRequire.m[id] = (module)=>{
                    delete webpackRequire.c[id];
                    module.exports = factory();
                };
            };
            const onError = (error)=>{
                delete installedModules[id];
                webpackRequire.m[id] = (module)=>{
                    delete webpackRequire.c[id];
                    throw error;
                };
            };
            try {
                const federationInstance = webpackRequire.federation.instance;
                if (!federationInstance) {
                    throw new Error("Federation instance not found!");
                }
                const { shareKey, getter, shareInfo } = moduleToHandlerMapping[id];
                const promise = federationInstance.loadShare(shareKey, {
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
function initializeSharing({ shareScopeName, webpackRequire, initPromises, initTokens, initScope }) {
    const shareScopeKeys = Array.isArray(shareScopeName) ? shareScopeName : [
        shareScopeName
    ];
    var initializeSharingPromises = [];
    var _initializeSharing = function(shareScopeKey) {
        if (!initScope) initScope = [];
        const mfInstance = webpackRequire.federation.instance;
        // handling circular init calls
        var initToken = initTokens[shareScopeKey];
        if (!initToken) initToken = initTokens[shareScopeKey] = {
            from: mfInstance.name
        };
        if (initScope.indexOf(initToken) >= 0) return;
        initScope.push(initToken);
        const promise = initPromises[shareScopeKey];
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
        const promises = mfInstance.initializeSharing(shareScopeKey, {
            strategy: mfInstance.options.shareStrategy,
            initScope,
            from: "build"
        });
        attachShareScopeMap(webpackRequire);
        const bundlerRuntimeRemotesOptions = webpackRequire.federation.bundlerRuntimeOptions.remotes;
        if (bundlerRuntimeRemotesOptions) {
            Object.keys(bundlerRuntimeRemotesOptions.idToRemoteMap).forEach((moduleId)=>{
                const info = bundlerRuntimeRemotesOptions.idToRemoteMap[moduleId];
                const externalModuleId = bundlerRuntimeRemotesOptions.idToExternalAndNameMapping[moduleId][2];
                if (info.length > 1) {
                    initExternal(externalModuleId);
                } else if (info.length === 1) {
                    const remoteInfo = info[0];
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
    const { moduleId, moduleToHandlerMapping, webpackRequire } = options;
    const federationInstance = webpackRequire.federation.instance;
    if (!federationInstance) {
        throw new Error("Federation instance not found!");
    }
    const { shareKey, shareInfo } = moduleToHandlerMapping[moduleId];
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
    const { moduleToHandlerMapping, webpackRequire, installedModules, initialConsumes } = options;
    initialConsumes.forEach((id)=>{
        webpackRequire.m[id] = (module)=>{
            // Handle scenario when module is used synchronously
            installedModules[id] = 0;
            delete webpackRequire.c[id];
            const factory = handleInitialConsumes({
                moduleId: id,
                moduleToHandlerMapping,
                webpackRequire
            });
            if (typeof factory !== "function") {
                throw new Error(`Shared module is not available for eager consumption: ${id}`);
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
    const { webpackRequire, shareScope, initScope, shareScopeKey, remoteEntryInitOptions } = options;
    if (!webpackRequire.S) return;
    if (!webpackRequire.federation || !webpackRequire.federation.instance || !webpackRequire.federation.initOptions) return;
    const federationInstance = webpackRequire.federation.instance;
    federationInstance.initOptions(_extends({
        name: webpackRequire.federation.initOptions.name,
        remotes: []
    }, remoteEntryInitOptions));
    const hostShareScopeKeys = remoteEntryInitOptions == null ? void 0 : remoteEntryInitOptions.shareScopeKeys;
    const hostShareScopeMap = remoteEntryInitOptions == null ? void 0 : remoteEntryInitOptions.shareScopeMap;
    // host: 'default' remote: 'default'  remote['default'] = hostShareScopeMap['default']
    // host: ['default', 'scope1'] remote: 'default'  remote['default'] = hostShareScopeMap['default']; remote['scope1'] = hostShareScopeMap['scop1']
    // host: 'default' remote: ['default','scope1']  remote['default'] = hostShareScopeMap['default']; remote['scope1'] = hostShareScopeMap['scope1'] = {}
    // host: ['scope1','default'] remote: ['scope1','scope2'] => remote['scope1'] = hostShareScopeMap['scope1']; remote['scope2'] = hostShareScopeMap['scope2'] = {};
    if (!shareScopeKey || typeof shareScopeKey === "string") {
        const key = shareScopeKey || "default";
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
                const sc = hostShareScopeMap[hostKey];
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
            const sc = hostShareScopeMap[key];
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
const federation = {
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

/***/ "./node_modules/.federation/entry.d4edce69e44cd2eefc72fc1b79a3e8dd.js":
/*!****************************************************************************!*\
  !*** ./node_modules/.federation/entry.d4edce69e44cd2eefc72fc1b79a3e8dd.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Users_bytedance_dev_universe_packages_webpack_bundler_runtime_dist_index_esm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../packages/webpack-bundler-runtime/dist/index.esm.js */ "../../packages/webpack-bundler-runtime/dist/index.esm.js");
/* harmony import */ var _Users_bytedance_dev_universe_packages_node_dist_src_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../packages/node/dist/src/runtimePlugin.js?runtimePlugin */ "../../packages/node/dist/src/runtimePlugin.js?runtimePlugin");
/* harmony import */ var _Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_cjs_runtimePlugin__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.cjs?runtimePlugin */ "../../packages/nextjs-mf/dist/src/plugins/container/runtimePlugin.cjs?runtimePlugin");




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
		_Users_bytedance_dev_universe_packages_node_dist_src_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__["default"] ? (_Users_bytedance_dev_universe_packages_node_dist_src_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__["default"]["default"] || _Users_bytedance_dev_universe_packages_node_dist_src_runtimePlugin_js_runtimePlugin__WEBPACK_IMPORTED_MODULE_1__["default"])() : false,
		_Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_cjs_runtimePlugin__WEBPACK_IMPORTED_MODULE_2__["default"] ? (_Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_cjs_runtimePlugin__WEBPACK_IMPORTED_MODULE_2__["default"]["default"] || _Users_bytedance_dev_universe_packages_nextjs_mf_dist_src_plugins_container_runtimePlugin_cjs_runtimePlugin__WEBPACK_IMPORTED_MODULE_2__["default"])() : false,
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

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "styled-jsx/style":
/*!***********************************!*\
  !*** external "styled-jsx/style" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("styled-jsx/style");

/***/ }),

/***/ "vm":
/*!*********************!*\
  !*** external "vm" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("vm");

/***/ }),

/***/ "webpack/container/entry/home_app":
/*!***********************!*\
  !*** container entry ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var moduleMap = {
	"./SharedNav": () => {
		return Promise.all(/*! __federation_expose_SharedNav */[__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ctrl+tinycolor@3.6.1"), __webpack_require__.e("vendor-chunks/antd@5.19.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@rc-component+async-validator@5.0.4"), __webpack_require__.e("vendor-chunks/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/resize-observer-polyfill@1.5.1"), __webpack_require__.e("vendor-chunks/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-tooltip@6.2.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/react-is@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.6"), __webpack_require__.e("vendor-chunks/rc-picker@4.6.15_dayjs@1.11.13_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-pagination@4.2.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("__federation_expose_SharedNav")]).then(() => (() => ((__webpack_require__(/*! ./components/SharedNav */ "./components/SharedNav.tsx")))));
	},
	"./menu": () => {
		return Promise.all(/*! __federation_expose_menu */[__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ctrl+tinycolor@3.6.1"), __webpack_require__.e("vendor-chunks/antd@5.19.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@rc-component+async-validator@5.0.4"), __webpack_require__.e("vendor-chunks/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/resize-observer-polyfill@1.5.1"), __webpack_require__.e("vendor-chunks/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-tooltip@6.2.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/react-is@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.6"), __webpack_require__.e("vendor-chunks/rc-picker@4.6.15_dayjs@1.11.13_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-pagination@4.2.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("__federation_expose_menu")]).then(() => (() => ((__webpack_require__(/*! ./components/menu */ "./components/menu.tsx")))));
	},
	"./pages-map": () => {
		return __webpack_require__.e(/*! __federation_expose_pages_map */ "__federation_expose_pages_map").then(() => (() => ((__webpack_require__(/*! ../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js */ "../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js")))));
	},
	"./pages-map-v2": () => {
		return __webpack_require__.e(/*! __federation_expose_pages_map_v2 */ "__federation_expose_pages_map_v2").then(() => (() => ((__webpack_require__(/*! ../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js?v2!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js */ "../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js?v2!../../packages/nextjs-mf/dist/src/loaders/nextPageMapLoader.js")))));
	},
	"./pages/index": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__index */ "__federation_expose_pages__index").then(() => (() => ((__webpack_require__(/*! ./pages/index.tsx */ "./pages/index.tsx")))));
	},
	"./pages/checkout/[...slug]": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__[...slug] */ "__federation_expose_pages__checkout__[...slug]").then(() => (() => ((__webpack_require__(/*! ./pages/checkout/[...slug].tsx */ "./pages/checkout/[...slug].tsx")))));
	},
	"./pages/checkout/[pid]": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__[pid] */ "__federation_expose_pages__checkout__[pid]").then(() => (() => ((__webpack_require__(/*! ./pages/checkout/[pid].tsx */ "./pages/checkout/[pid].tsx")))));
	},
	"./pages/checkout/exposed-pages": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__exposed_pages */ "__federation_expose_pages__checkout__exposed_pages").then(() => (() => ((__webpack_require__(/*! ./pages/checkout/exposed-pages.tsx */ "./pages/checkout/exposed-pages.tsx")))));
	},
	"./pages/checkout/index": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__index */ "__federation_expose_pages__checkout__index").then(() => (() => ((__webpack_require__(/*! ./pages/checkout/index.tsx */ "./pages/checkout/index.tsx")))));
	},
	"./pages/checkout/test-check-button": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__test_check_button */ "__federation_expose_pages__checkout__test_check_button").then(() => (() => ((__webpack_require__(/*! ./pages/checkout/test-check-button.tsx */ "./pages/checkout/test-check-button.tsx")))));
	},
	"./pages/checkout/test-title": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__checkout__test_title */ "__federation_expose_pages__checkout__test_title").then(() => (() => ((__webpack_require__(/*! ./pages/checkout/test-title.tsx */ "./pages/checkout/test-title.tsx")))));
	},
	"./pages/home/exposed-pages": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__home__exposed_pages */ "__federation_expose_pages__home__exposed_pages").then(() => (() => ((__webpack_require__(/*! ./pages/home/exposed-pages.tsx */ "./pages/home/exposed-pages.tsx")))));
	},
	"./pages/home/test-broken-remotes": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__home__test_broken_remotes */ "__federation_expose_pages__home__test_broken_remotes").then(() => (() => ((__webpack_require__(/*! ./pages/home/test-broken-remotes.tsx */ "./pages/home/test-broken-remotes.tsx")))));
	},
	"./pages/home/test-remote-hook": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__home__test_remote_hook */ "__federation_expose_pages__home__test_remote_hook").then(() => (() => ((__webpack_require__(/*! ./pages/home/test-remote-hook.tsx */ "./pages/home/test-remote-hook.tsx")))));
	},
	"./pages/home/test-shared-nav": () => {
		return Promise.all(/*! __federation_expose_pages__home__test_shared_nav */[__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ctrl+tinycolor@3.6.1"), __webpack_require__.e("vendor-chunks/antd@5.19.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@rc-component+async-validator@5.0.4"), __webpack_require__.e("vendor-chunks/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/resize-observer-polyfill@1.5.1"), __webpack_require__.e("vendor-chunks/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-tooltip@6.2.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/react-is@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.6"), __webpack_require__.e("vendor-chunks/rc-picker@4.6.15_dayjs@1.11.13_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/rc-pagination@4.2.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("__federation_expose_pages__home__test_shared_nav")]).then(() => (() => ((__webpack_require__(/*! ./pages/home/test-shared-nav.tsx */ "./pages/home/test-shared-nav.tsx")))));
	},
	"./pages/shop/exposed-pages": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__shop__exposed_pages */ "__federation_expose_pages__shop__exposed_pages").then(() => (() => ((__webpack_require__(/*! ./pages/shop/exposed-pages.js */ "./pages/shop/exposed-pages.js")))));
	},
	"./pages/shop/index": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__shop__index */ "__federation_expose_pages__shop__index").then(() => (() => ((__webpack_require__(/*! ./pages/shop/index.js */ "./pages/shop/index.js")))));
	},
	"./pages/shop/test-webpack-png": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__shop__test_webpack_png */ "__federation_expose_pages__shop__test_webpack_png").then(() => (() => ((__webpack_require__(/*! ./pages/shop/test-webpack-png.js */ "./pages/shop/test-webpack-png.js")))));
	},
	"./pages/shop/test-webpack-svg": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__shop__test_webpack_svg */ "__federation_expose_pages__shop__test_webpack_svg").then(() => (() => ((__webpack_require__(/*! ./pages/shop/test-webpack-svg.js */ "./pages/shop/test-webpack-svg.js")))));
	},
	"./pages/shop/products/[...slug]": () => {
		return __webpack_require__.e(/*! __federation_expose_pages__shop__products__[...slug] */ "__federation_expose_pages__shop__products__[...slug]").then(() => (() => ((__webpack_require__(/*! ./pages/shop/products/[...slug].js */ "./pages/shop/products/[...slug].js")))));
	}
};
var get = (module, getScope) => {
	__webpack_require__.R = getScope;
	getScope = (
		__webpack_require__.o(moduleMap, module)
			? moduleMap[module]()
			: Promise.resolve().then(() => {
				throw new Error('Module "' + module + '" does not exist in container.');
			})
	);
	__webpack_require__.R = undefined;
	return getScope;
};
var init = (shareScope, initScope, remoteEntryInitOptions) => {
	return __webpack_require__.federation.bundlerRuntime.initContainerEntry({	webpackRequire: __webpack_require__,
		shareScope: shareScope,
		initScope: initScope,
		remoteEntryInitOptions: remoteEntryInitOptions,
		shareScopeKey: "default"
	})
};


// This exports getters to disallow modifications
__webpack_require__.d(exports, {
	get: () => (get),
	init: () => (init)
});

/***/ }),

/***/ "webpack/container/reference/checkout":
/*!*********************************************************************************!*\
  !*** external "checkout@http://localhost:3002/_next/static/ssr/remoteEntry.js" ***!
  \*********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
var __webpack_error__ = new Error();
module.exports = new Promise((resolve, reject) => {
	if(typeof checkout !== "undefined") return resolve();
	__webpack_require__.l("http://localhost:3002/_next/static/ssr/remoteEntry.js", (event) => {
		if(typeof checkout !== "undefined") return resolve();
		var errorType = event && (event.type === 'load' ? 'missing' : event.type);
		var realSrc = event && event.target && event.target.src;
		__webpack_error__.message = 'Loading script failed.\n(' + errorType + ': ' + realSrc + ')';
		__webpack_error__.name = 'ScriptExternalLoadError';
		__webpack_error__.type = errorType;
		__webpack_error__.request = realSrc;
		reject(__webpack_error__);
	}, "checkout");
}).then(() => (checkout));

/***/ }),

/***/ "webpack/container/reference/shop":
/*!*****************************************************************************!*\
  !*** external "shop@http://localhost:3001/_next/static/ssr/remoteEntry.js" ***!
  \*****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
var __webpack_error__ = new Error();
module.exports = new Promise((resolve, reject) => {
	if(typeof shop !== "undefined") return resolve();
	__webpack_require__.l("http://localhost:3001/_next/static/ssr/remoteEntry.js", (event) => {
		if(typeof shop !== "undefined") return resolve();
		var errorType = event && (event.type === 'load' ? 'missing' : event.type);
		var realSrc = event && event.target && event.target.src;
		__webpack_error__.message = 'Loading script failed.\n(' + errorType + ': ' + realSrc + ')';
		__webpack_error__.name = 'ScriptExternalLoadError';
		__webpack_error__.type = errorType;
		__webpack_error__.request = realSrc;
		reject(__webpack_error__);
	}, "shop");
}).then(() => (shop));

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

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
/******/ 	// It's empty as no entry modules are in this chunk
/******/ 	__webpack_require__.x = x => {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/federation runtime */
/******/ 	(() => {
/******/ 		if(!__webpack_require__.federation){
/******/ 			__webpack_require__.federation = {
/******/ 				initOptions: {"name":"home_app","remotes":[{"alias":"shop","name":"shop","entry":"http://localhost:3001/_next/static/ssr/remoteEntry.js","shareScope":"default"},{"alias":"checkout","name":"checkout","entry":"http://localhost:3002/_next/static/ssr/remoteEntry.js","shareScope":"default"}],"shareStrategy":"loaded-first"},
/******/ 				chunkMatcher: function(chunkId) {return !/^webpack_(container_remote_(shop_(Webpack(Pn|Sv)g|menu)|checkout_menu)|sharing_consume_default_(ant\-design_colors_ant\-design_colors\-webpack_sharing_consume_d\-(033bef[01]|1df084[01]|66b103[01]|7831a5[01])|react_jsx\-runtime_react_jsx\-runtime\-_bfc8[012345]))$/.test(chunkId)},
/******/ 				rootOutputDir: "",
/******/ 				initialConsumes: undefined,
/******/ 				bundlerRuntimeOptions: {}
/******/ 			};
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
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
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames not based on template
/******/ 			if ({"vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/@swc+helpers@0.5.5":1,"vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/@babel+runtime@7.26.0":1,"vendor-chunks/classnames@2.5.1":1,"vendor-chunks/@ctrl+tinycolor@3.6.1":1,"vendor-chunks/antd@5.19.1_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/rc-menu@9.14.1_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/rc-field-form@2.2.1_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/@rc-component+trigger@2.2.3_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/@rc-component+async-validator@5.0.4":1,"vendor-chunks/rc-motion@2.9.3_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/resize-observer-polyfill@1.5.1":1,"vendor-chunks/rc-overflow@1.3.2_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/rc-resize-observer@1.4.0_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/@rc-component+portal@1.1.2_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/rc-tooltip@6.2.1_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/react-is@18.3.1":1,"vendor-chunks/@babel+runtime@7.25.6":1,"vendor-chunks/rc-picker@4.6.15_dayjs@1.11.13_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/rc-pagination@4.2.0_react-dom@18.3.1_react@18.3.1":1,"vendor-chunks/tr46@0.0.3":1,"vendor-chunks/iconv-lite@0.6.3":1,"vendor-chunks/node-fetch@2.7.0_encoding@0.1.13":1,"vendor-chunks/whatwg-url@5.0.0":1,"vendor-chunks/webidl-conversions@3.0.1":1,"vendor-chunks/encoding@0.1.13":1,"vendor-chunks/safer-buffer@2.1.2":1}[chunkId]) return "" + chunkId + ".js";
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + "-" + {"__federation_expose_SharedNav":"e3d08bc05698c81d","__federation_expose_menu":"b23d8ca9e16f708b","__federation_expose_pages_map":"357ae3c1607aacdd","__federation_expose_pages_map_v2":"41c88806f2472dec","__federation_expose_pages__index":"18b7ea3c20e73472","__federation_expose_pages__checkout__[...slug]":"0f48279a2ddef1d9","__federation_expose_pages__checkout__[pid]":"d5d79e32863a59a9","__federation_expose_pages__checkout__exposed_pages":"8e6ad58e10f420f1","__federation_expose_pages__checkout__index":"39de0f2b091ff151","__federation_expose_pages__checkout__test_check_button":"2a485bf7d4542e77","__federation_expose_pages__checkout__test_title":"d4701a45f1a375a2","__federation_expose_pages__home__exposed_pages":"d9f81c35223227e8","__federation_expose_pages__home__test_broken_remotes":"868ca6aed72fa62d","__federation_expose_pages__home__test_remote_hook":"75c96574d36aa1b3","__federation_expose_pages__home__test_shared_nav":"0ee7abc787eef22a","__federation_expose_pages__shop__exposed_pages":"6aef04f926f60b42","__federation_expose_pages__shop__index":"7bcac62ac50d5cf3","__federation_expose_pages__shop__test_webpack_png":"d4cec1ef6d878c09","__federation_expose_pages__shop__test_webpack_svg":"d41ec0f3e5f2c188","__federation_expose_pages__shop__products__[...slug]":"5a3c3473993fd6fb","vendor-chunks/@ant-design+colors@7.1.0":"1d1102a1d57c51f0","vendor-chunks/@babel+runtime@7.25.7":"7b3c8972b9979ba3","vendor-chunks/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1":"ffdad335bdcfd342","vendor-chunks/stylis@4.3.4":"e9575ef80156216b","vendor-chunks/@emotion+hash@0.8.0":"4224d96b572460fd","vendor-chunks/@emotion+unitless@0.7.5":"6c824da849cc84e7","vendor-chunks/@ant-design+icons-svg@4.4.2":"c359bd17f6a8945c","vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1":"8dce77e2b43b86b3","vendor-chunks/react@18.3.1":"3a2c27cf94fe1ab4","vendor-chunks/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1":"4171d1d1dfa2db11","components_SharedNav_tsx":"cd753832514adc09"}[chunkId] + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "home_app:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
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
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/remotes loading */
/******/ 	(() => {
/******/ 		var chunkMapping = {
/******/ 			"pages/index": [
/******/ 				"webpack/container/remote/checkout/CheckoutTitle",
/******/ 				"webpack/container/remote/checkout/ButtonOldAnt"
/******/ 			],
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
/******/ 			"webpack_container_remote_shop_menu": [
/******/ 				"webpack/container/remote/shop/menu"
/******/ 			],
/******/ 			"webpack_container_remote_checkout_menu": [
/******/ 				"webpack/container/remote/checkout/menu"
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
/******/ 			"webpack/container/remote/shop/menu": [
/******/ 				"default",
/******/ 				"./menu",
/******/ 				"webpack/container/reference/shop"
/******/ 			],
/******/ 			"webpack/container/remote/checkout/menu": [
/******/ 				"default",
/******/ 				"./menu",
/******/ 				"webpack/container/reference/checkout"
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
/******/ 			"webpack/container/remote/shop/menu": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "shop",
/******/ 					"externalModuleId": "webpack/container/reference/shop"
/******/ 				}
/******/ 			],
/******/ 			"webpack/container/remote/checkout/menu": [
/******/ 				{
/******/ 					"externalType": "script",
/******/ 					"name": "checkout",
/******/ 					"externalModuleId": "webpack/container/reference/checkout"
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
/******/ 		__webpack_require__.f.remotes = (chunkId, promises) => {
/******/ 			__webpack_require__.federation.bundlerRuntime.remotes({idToRemoteMap,chunkMapping, idToExternalAndNameMapping, chunkId, promises, webpackRequire:__webpack_require__});
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/runtimeId */
/******/ 	(() => {
/******/ 		__webpack_require__.j = "webpack-runtime";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/sharing */
/******/ 	(() => {
/******/ 		__webpack_require__.S = {};
/******/ 		var initPromises = {};
/******/ 		var initTokens = {};
/******/ 		__webpack_require__.I = (name, initScope) => {
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
/******/ 			var warn = (msg) => {
/******/ 				if (typeof console !== "undefined" && console.warn) console.warn(msg);
/******/ 			};
/******/ 			var uniqueName = "home_app";
/******/ 			var register = (name, version, factory, eager) => {
/******/ 				var versions = scope[name] = scope[name] || {};
/******/ 				var activeVersion = versions[version];
/******/ 				if(!activeVersion || (!activeVersion.loaded && (!eager != !activeVersion.eager ? eager : uniqueName > activeVersion.from))) versions[version] = { get: factory, from: uniqueName, eager: !!eager };
/******/ 			};
/******/ 			var initExternal = (id) => {
/******/ 				var handleError = (err) => (warn("Initialization of sharing external failed: " + err));
/******/ 				try {
/******/ 					var module = __webpack_require__(id);
/******/ 					if(!module) return;
/******/ 					var initFn = (module) => (module && module.init && module.init(__webpack_require__.S[name], initScope))
/******/ 					if(module.then) return promises.push(module.then(initFn, handleError));
/******/ 					var initResult = initFn(module);
/******/ 					if(initResult && initResult.then) return promises.push(initResult['catch'](handleError));
/******/ 				} catch(err) { handleError(err); }
/******/ 			}
/******/ 			var promises = [];
/******/ 			switch(name) {
/******/ 				case "default": {
/******/ 					register("@ant-design/colors", "7.1.0", () => (Promise.all([__webpack_require__.e("vendor-chunks/@ctrl+tinycolor@3.6.1"), __webpack_require__.e("vendor-chunks/@ant-design+colors@7.1.0")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js"))))));
/******/ 					register("@ant-design/cssinjs", "1.21.1", () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/stylis@4.3.4"), __webpack_require__.e("vendor-chunks/@emotion+hash@0.8.0"), __webpack_require__.e("vendor-chunks/@emotion+unitless@0.7.5")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/lib/index.js */ "../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/lib/index.js"))))));
/******/ 					register("@ant-design/icons-svg/es/asn/BarsOutlined", "4.4.2", () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js"))))));
/******/ 					register("@ant-design/icons-svg/es/asn/EllipsisOutlined", "4.4.2", () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js"))))));
/******/ 					register("@ant-design/icons-svg/es/asn/LeftOutlined", "4.4.2", () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js"))))));
/******/ 					register("@ant-design/icons-svg/es/asn/RightOutlined", "4.4.2", () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js"))))));
/******/ 					register("@ant-design/icons/es/components/Context", "5.5.1", () => (__webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js"))))));
/******/ 					register("@ant-design/icons/es/icons/BarsOutlined", "5.5.1", () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-7831a50")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js"))))));
/******/ 					register("@ant-design/icons/es/icons/EllipsisOutlined", "5.5.1", () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-66b1030")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js"))))));
/******/ 					register("@ant-design/icons/es/icons/LeftOutlined", "5.5.1", () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-033bef0")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js"))))));
/******/ 					register("@ant-design/icons/es/icons/RightOutlined", "5.5.1", () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1df0840")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js"))))));
/******/ 					register("next/dynamic", "14.2.16", () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc81")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js"))))));
/******/ 					register("next/head", "14.2.16", () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc82")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js"))))));
/******/ 					register("next/image", "14.2.16", () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc83")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js"))))));
/******/ 					register("next/link", "14.2.16", () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc84")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js"))))));
/******/ 					register("next/router", "14.2.16", () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc80")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js"))))));
/******/ 					register("next/script", "14.2.16", () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc85")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js"))))));
/******/ 					register("react/jsx-dev-runtime", "18.3.1", () => (__webpack_require__.e("vendor-chunks/react@18.3.1").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js"))))));
/******/ 					register("react/jsx-runtime", "18.3.1", () => (__webpack_require__.e("vendor-chunks/react@18.3.1").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js"))))));
/******/ 					register("styled-jsx", "5.1.6", () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js"))))));
/******/ 					initExternal("webpack/container/reference/checkout");
/******/ 					initExternal("webpack/container/reference/shop");
/******/ 				}
/******/ 				break;
/******/ 			}
/******/ 			if(!promises.length) return initPromises[name] = 1;
/******/ 			return initPromises[name] = Promise.all(promises).then(() => (initPromises[name] = 1));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup entrypoint */
/******/ 	(() => {
/******/ 		__webpack_require__.X = (result, chunkIds, fn) => {
/******/ 			// arguments: chunkIds, moduleId are deprecated
/******/ 			var moduleId = chunkIds;
/******/ 			if(!fn) chunkIds = result, fn = () => (__webpack_require__(__webpack_require__.s = moduleId));
/******/ 			return Promise.all(chunkIds.map(__webpack_require__.e, __webpack_require__)).then(() => {
/******/ 				var r = fn();
/******/ 				return r === undefined ? result : r;
/******/ 			})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup entrypoint */
/******/ 	(() => {
/******/ 		__webpack_require__.X = (result, chunkIds, fn) => {
/******/ 			// arguments: chunkIds, moduleId are deprecated
/******/ 			var moduleId = chunkIds;
/******/ 			if(!fn) chunkIds = result, fn = () => (__webpack_require__(__webpack_require__.s = moduleId));
/******/ 			return Promise.all(chunkIds.map(__webpack_require__.e, __webpack_require__)).then(() => {
/******/ 				var r = fn();
/******/ 				return r === undefined ? result : r;
/******/ 			})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/sharing */
/******/ 	(() => {
/******/ 		__webpack_require__.federation.initOptions.shared = {	"@ant-design/colors": [{	version: "7.1.0",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/@ctrl+tinycolor@3.6.1"), __webpack_require__.e("vendor-chunks/@ant-design+colors@7.1.0")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/cssinjs": [{	version: "1.21.1",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/stylis@4.3.4"), __webpack_require__.e("vendor-chunks/@emotion+hash@0.8.0"), __webpack_require__.e("vendor-chunks/@emotion+unitless@0.7.5")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/lib/index.js */ "../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/lib/index.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/BarsOutlined": [{	version: "4.4.2",
/******/ 				get: () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/EllipsisOutlined": [{	version: "4.4.2",
/******/ 				get: () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/LeftOutlined": [{	version: "4.4.2",
/******/ 				get: () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons-svg/es/asn/RightOutlined": [{	version: "4.4.2",
/******/ 				get: () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/components/Context": [{	version: "5.5.1",
/******/ 				get: () => (__webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/BarsOutlined": [{	version: "5.5.1",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-7831a50")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/EllipsisOutlined": [{	version: "5.5.1",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-66b1030")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/LeftOutlined": [{	version: "5.5.1",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-033bef0")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"@ant-design/icons/es/icons/RightOutlined": [{	version: "5.5.1",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.26.0"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/classnames@2.5.1"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1df0840")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/dynamic": [{	version: "14.2.16",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc81")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/head": [{	version: "14.2.16",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc82")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/image": [{	version: "14.2.16",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc83")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/link": [{	version: "14.2.16",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc84")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"next/router": [{	version: "14.2.16",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc80")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"next/script": [{	version: "14.2.16",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc85")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"singleton":true,"layer":null}},],	"react/jsx-dev-runtime": [{	version: "18.3.1",
/******/ 				get: () => (__webpack_require__.e("vendor-chunks/react@18.3.1").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"react/jsx-runtime": [{	version: "18.3.1",
/******/ 				get: () => (__webpack_require__.e("vendor-chunks/react@18.3.1").then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":false,"singleton":true,"layer":null}},],	"styled-jsx": [{	version: "5.1.6",
/******/ 				get: () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1")]).then(() => (() => (__webpack_require__(/*! ../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js */ "../../node_modules/.pnpm/styled-jsx@5.1.1_@babel+core@7.25.2_react@18.3.1/node_modules/styled-jsx/index.js"))))),
/******/ 				scope: ["default"],
/******/ 				shareConfig: {"eager":false,"requiredVersion":"^5.1.6","singleton":true,"layer":null}},],}
/******/ 		__webpack_require__.S = {};
/******/ 		var initPromises = {};
/******/ 		var initTokens = {};
/******/ 		__webpack_require__.I = (name, initScope) => {
/******/ 			return __webpack_require__.federation.bundlerRuntime.I({	shareScopeName: name,
/******/ 				webpackRequire: __webpack_require__,
/******/ 				initPromises: initPromises,
/******/ 				initTokens: initTokens,
/******/ 				initScope: initScope,
/******/ 			})
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/consumes */
/******/ 	(() => {
/******/ 		var installedModules = {};
/******/ 		var moduleToHandlerMapping = {
/******/ 			"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime": {
/******/ 				getter: () => (__webpack_require__.e("vendor-chunks/react@18.3.1").then(() => (() => (__webpack_require__(/*! react/jsx-dev-runtime */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-dev-runtime.js"))))),
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
/******/ 			"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs": {
/******/ 				getter: () => (Promise.all([__webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/stylis@4.3.4"), __webpack_require__.e("vendor-chunks/@emotion+hash@0.8.0"), __webpack_require__.e("vendor-chunks/@emotion+unitless@0.7.5")]).then(() => (() => (__webpack_require__(/*! @ant-design/cssinjs */ "../../node_modules/.pnpm/@ant-design+cssinjs@1.21.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/cssinjs/lib/index.js"))))),
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
/******/ 				getter: () => (__webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1").then(() => (() => (__webpack_require__(/*! @ant-design/icons/es/components/Context */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/components/Context.js"))))),
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
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98": {
/******/ 				getter: () => (__webpack_require__.e("vendor-chunks/@ant-design+colors@7.1.0").then(() => (() => (__webpack_require__(/*! @ant-design/colors */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js"))))),
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
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined": {
/******/ 				getter: () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-7831a51")]).then(() => (() => (__webpack_require__(/*! @ant-design/icons/es/icons/BarsOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/BarsOutlined.js"))))),
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
/******/ 				getter: () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-033bef1")]).then(() => (() => (__webpack_require__(/*! @ant-design/icons/es/icons/LeftOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/LeftOutlined.js"))))),
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
/******/ 				getter: () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1df0841")]).then(() => (() => (__webpack_require__(/*! @ant-design/icons/es/icons/RightOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/RightOutlined.js"))))),
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
/******/ 			"webpack/sharing/consume/default/next/router/next/router": {
/******/ 				getter: () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc80")]).then(() => (() => (__webpack_require__(/*! next/router */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js"))))),
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
/******/ 			"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined": {
/******/ 				getter: () => (Promise.all([__webpack_require__.e("vendor-chunks/rc-util@5.43.0_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@babel+runtime@7.25.7"), __webpack_require__.e("vendor-chunks/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-66b1031")]).then(() => (() => (__webpack_require__(/*! @ant-design/icons/es/icons/EllipsisOutlined */ "../../node_modules/.pnpm/@ant-design+icons@5.5.1_react-dom@18.3.1_react@18.3.1/node_modules/@ant-design/icons/es/icons/EllipsisOutlined.js"))))),
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
/******/ 			"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime": {
/******/ 				getter: () => (__webpack_require__.e("vendor-chunks/react@18.3.1").then(() => (() => (__webpack_require__(/*! react/jsx-runtime */ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js"))))),
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
/******/ 			},
/******/ 			"webpack/sharing/consume/default/next/head/next/head?1388": {
/******/ 				getter: () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc82")]).then(() => (() => (__webpack_require__(/*! next/head */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js"))))),
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
/******/ 				getter: () => (Promise.all([__webpack_require__.e("vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"), __webpack_require__.e("vendor-chunks/@swc+helpers@0.5.5"), __webpack_require__.e("webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc84")]).then(() => (() => (__webpack_require__(/*! next/link */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js"))))),
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
/******/ 			"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?41bc": {
/******/ 				getter: () => (Promise.all([__webpack_require__.e("vendor-chunks/@ctrl+tinycolor@3.6.1"), __webpack_require__.e("vendor-chunks/@ant-design+colors@7.1.0")]).then(() => (() => (__webpack_require__(/*! @ant-design/colors */ "../../node_modules/.pnpm/@ant-design+colors@7.1.0/node_modules/@ant-design/colors/lib/index.js"))))),
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
/******/ 				getter: () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! @ant-design/icons-svg/es/asn/BarsOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js"))))),
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
/******/ 				getter: () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! @ant-design/icons-svg/es/asn/EllipsisOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/EllipsisOutlined.js"))))),
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
/******/ 				getter: () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! @ant-design/icons-svg/es/asn/LeftOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js"))))),
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
/******/ 				getter: () => (__webpack_require__.e("vendor-chunks/@ant-design+icons-svg@4.4.2").then(() => (() => (__webpack_require__(/*! @ant-design/icons-svg/es/asn/RightOutlined */ "../../node_modules/.pnpm/@ant-design+icons-svg@4.4.2/node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js"))))),
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
/******/ 			}
/******/ 		};
/******/ 		var initialConsumes = ["webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime","webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs","webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context","webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98","webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined","webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined","webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined","webpack/sharing/consume/default/next/router/next/router","webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined","webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime","webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime","webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs","webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context","webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98","webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined","webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined","webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined","webpack/sharing/consume/default/next/router/next/router","webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined","webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime","webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime","webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime","webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime","webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs","webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context","webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98","webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined","webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined","webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined","webpack/sharing/consume/default/next/router/next/router","webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined","webpack/sharing/consume/default/next/head/next/head?1388"];
/******/ 		__webpack_require__.federation.installInitialConsumes = () => (__webpack_require__.federation.bundlerRuntime.installInitialConsumes({
/******/ 			initialConsumes: initialConsumes,
/******/ 			installedModules:installedModules,
/******/ 			moduleToHandlerMapping:moduleToHandlerMapping,
/******/ 			webpackRequire: __webpack_require__
/******/ 		}))
/******/ 		var chunkMapping = {
/******/ 			"pages/_app": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 				"webpack/sharing/consume/default/next/router/next/router",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined"
/******/ 			],
/******/ 			"pages/_error": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 				"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 				"webpack/sharing/consume/default/next/router/next/router",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined"
/******/ 			],
/******/ 			"pages/_document": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 			],
/******/ 			"pages/index": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime",
/******/ 				"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 				"webpack/sharing/consume/default/next/router/next/router",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined",
/******/ 				"webpack/sharing/consume/default/next/head/next/head?1388"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc80": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 			],
/******/ 			"__federation_expose_SharedNav": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined",
/******/ 				"webpack/sharing/consume/default/next/router/next/router"
/******/ 			],
/******/ 			"__federation_expose_menu": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/next/router/next/router",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined"
/******/ 			],
/******/ 			"__federation_expose_pages__index": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime",
/******/ 				"webpack/sharing/consume/default/next/head/next/head?1388"
/******/ 			],
/******/ 			"__federation_expose_pages__home__exposed_pages": [
/******/ 				"webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime"
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
/******/ 				"webpack/sharing/consume/default/@ant-design/cssinjs/@ant-design/cssinjs",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/components/Context/@ant-design/icons/es/components/Context",
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?7e98",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/BarsOutlined/@ant-design/icons/es/icons/BarsOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/LeftOutlined/@ant-design/icons/es/icons/LeftOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/RightOutlined/@ant-design/icons/es/icons/RightOutlined",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons/es/icons/EllipsisOutlined/@ant-design/icons/es/icons/EllipsisOutlined",
/******/ 				"webpack/sharing/consume/default/next/router/next/router"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-7831a50": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?41bc",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-66b1030": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?41bc",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-033bef0": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?41bc",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1df0840": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?41bc",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc81": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc82": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc83": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc84": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_react_jsx-runtime_react_jsx-runtime-_bfc85": [
/******/ 				"webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-7831a51": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?41bc",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/BarsOutlined/@ant-design/icons-svg/es/asn/BarsOutlined"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-033bef1": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?41bc",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/LeftOutlined/@ant-design/icons-svg/es/asn/LeftOutlined"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-1df0841": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?41bc",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/RightOutlined/@ant-design/icons-svg/es/asn/RightOutlined"
/******/ 			],
/******/ 			"webpack_sharing_consume_default_ant-design_colors_ant-design_colors-webpack_sharing_consume_d-66b1031": [
/******/ 				"webpack/sharing/consume/default/@ant-design/colors/@ant-design/colors?41bc",
/******/ 				"webpack/sharing/consume/default/@ant-design/icons-svg/es/asn/EllipsisOutlined/@ant-design/icons-svg/es/asn/EllipsisOutlined"
/******/ 			]
/******/ 		};
/******/ 		__webpack_require__.f.consumes = (chunkId, promises) => {
/******/ 			__webpack_require__.federation.bundlerRuntime.consumes({
/******/ 			chunkMapping: chunkMapping,
/******/ 			installedModules: installedModules,
/******/ 			chunkId: chunkId,
/******/ 			moduleToHandlerMapping: moduleToHandlerMapping,
/******/ 			promises: promises,
/******/ 			webpackRequire:__webpack_require__
/******/ 			});
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/embed/federation */
/******/ 	(() => {
/******/ 		var oldStartup = __webpack_require__.x;
/******/ 		var hasRun = false;
/******/ 		__webpack_require__.x = () => {
/******/ 			if (!hasRun) {
/******/ 			  hasRun = true;
/******/ 			  __webpack_require__(/*! ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-swc-loader.js??ruleSet[1].rules[7].oneOf[0].use[0]!./node_modules/.federation/entry.d4edce69e44cd2eefc72fc1b79a3e8dd.js */ "./node_modules/.federation/entry.d4edce69e44cd2eefc72fc1b79a3e8dd.js");
/******/ 			}
/******/ 			return oldStartup();
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/readFile chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "0" means "already loaded", Promise means loading
/******/ 		var installedChunks = {
/******/ 			"webpack-runtime": 0
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		var installChunk = (chunk) => {
/******/ 			var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			for(var i = 0; i < chunkIds.length; i++) {
/******/ 				if(installedChunks[chunkIds[i]]) {
/******/ 					installedChunks[chunkIds[i]][0]();
/******/ 				}
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 		
/******/ 		};
/******/ 		
/******/ 		// ReadFile + VM.run chunk loading for javascript
/******/ 		__webpack_require__.f.readFileVm = function(chunkId, promises) {
/******/ 		
/******/ 			var installedChunkData = installedChunks[chunkId];
/******/ 			if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 				// array of [resolve, reject, promise] means "currently loading"
/******/ 				if(installedChunkData) {
/******/ 					promises.push(installedChunkData[2]);
/******/ 				} else {
/******/ 					if(!/^webpack_(container_remote_(shop_(Webpack(Pn|Sv)g|menu)|checkout_menu)|sharing_consume_default_(ant\-design_colors_ant\-design_colors\-webpack_sharing_consume_d\-(033bef[01]|1df084[01]|66b103[01]|7831a5[01])|react_jsx\-runtime_react_jsx\-runtime\-_bfc8[012345]))$/.test(chunkId)) {
/******/ 						// load the chunk and return promise to it
/******/ 						var promise = new Promise(function(resolve, reject) {
/******/ 							installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 							var filename = require('path').join(__dirname, "" + __webpack_require__.u(chunkId));
/******/ 							require('fs').readFile(filename, 'utf-8', function(err, content) {
/******/ 								if(err) return reject(err);
/******/ 								var chunk = {};
/******/ 								require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\n})', filename)(chunk, require, require('path').dirname(filename), filename);
/******/ 								installChunk(chunk);
/******/ 							});
/******/ 						});
/******/ 						promises.push(installedChunkData[2] = promise);
/******/ 					} else installedChunks[chunkId] = 0;
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		module.exports = __webpack_require__;
/******/ 		__webpack_require__.C = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/inverted container startup */
/******/ 	(() => {
/******/ 		var prevStartup = __webpack_require__.x;
/******/ 		var hasRun = false;
/******/ 		var cachedRemote;
/******/ 		__webpack_require__.x = () => {
/******/ 			if (!hasRun) {
/******/ 				hasRun = true;
/******/ 				if (typeof prevStartup === 'function') {
/******/ 					prevStartup();
/******/ 				}
/******/ 				cachedRemote = __webpack_require__("webpack/container/entry/home_app");
/******/ 				var gs = __webpack_require__.g || globalThis;
/******/ 				gs["home_app"] = cachedRemote;
/******/ 			} else if (typeof prevStartup === 'function') {
/******/ 				prevStartup();
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	
/******/ 	// Custom hook: appended startup call because none was added automatically
/******/ 	__webpack_require__.x();
/******/ 	
/******/ })()
;