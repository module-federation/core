"use strict";
/* eslint-disable @typescript-eslint/ban-ts-comment */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModule = exports.getContainer = exports.createRuntimeVariables = exports.injectScript = exports.createDelegatedModule = exports.importDelegatedModule = exports.extractUrlAndGlobal = void 0;
var tslib_1 = require("tslib");
// split the @ syntax into url and global
var extractUrlAndGlobal = function (urlAndGlobal) {
    var index = urlAndGlobal.indexOf('@');
    if (index <= 0 || index === urlAndGlobal.length - 1) {
        throw new Error("Invalid request \"".concat(urlAndGlobal, "\""));
    }
    return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
};
exports.extractUrlAndGlobal = extractUrlAndGlobal;
var getRuntimeRemotes = function () {
    try {
        //@ts-ignore
        var remoteVars = (process.env.REMOTES || {});
        var runtimeRemotes = Object.entries(remoteVars).reduce(function (acc, item) {
            var key = item[0], value = item[1];
            // if its an object with a thenable (eagerly executing function)
            if (typeof value === 'object' && typeof value.then === 'function') {
                acc[key] = { asyncContainer: value };
            }
            // if its a function that must be called (lazily executing function)
            else if (typeof value === 'function') {
                // @ts-ignore
                acc[key] = { asyncContainer: value };
            }
            // if its a delegate module, skip it
            else if (typeof value === 'string' && value.startsWith('internal ')) {
                // do nothing to internal modules
            }
            // if its just a string (global@url)
            else if (typeof value === 'string') {
                var _a = (0, exports.extractUrlAndGlobal)(value), url = _a[0], global_1 = _a[1];
                acc[key] = { global: global_1, url: url };
            }
            // we dont know or currently support this type
            else {
                //@ts-ignore
                console.log('remotes process', process.env.REMOTES);
                throw new Error("[mf] Invalid value received for runtime_remote \"".concat(key, "\""));
            }
            return acc;
        }, {});
        return runtimeRemotes;
    }
    catch (err) {
        console.warn('Unable to retrieve runtime remotes: ', err);
    }
    return {};
};
var importDelegatedModule = function (keyOrRuntimeRemoteItem) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        // @ts-ignore
        return [2 /*return*/, loadScript(keyOrRuntimeRemoteItem)
                .then(function (asyncContainer) {
                return asyncContainer;
            })
                .then(function (asyncContainer) {
                // most of this is only needed because of legacy promise based implementation
                // can remove proxies once we remove promise based implementations
                if (typeof window === 'undefined') {
                    //TODO: need to solve chunk flushing with delegated modules
                    return asyncContainer;
                }
                else {
                    var proxy_1 = {
                        get: asyncContainer.get,
                        //@ts-ignore
                        init: function (shareScope, initScope) {
                            try {
                                //@ts-ignore
                                asyncContainer.init(shareScope, initScope);
                                // for legacy reasons, we must mark container a initialized
                                // here otherwise older promise based implementation will try to init again with diff object
                                //@ts-ignore
                                proxy_1.__initialized = true;
                            }
                            catch (e) {
                                return 1;
                            }
                        },
                    };
                    // @ts-ignore
                    if (!proxy_1.__initialized) {
                        //@ts-ignore
                        proxy_1.init(__webpack_share_scopes__.default);
                    }
                    return proxy_1;
                }
            })];
    });
}); };
exports.importDelegatedModule = importDelegatedModule;
var createDelegatedModule = function (delegate, params) {
    var queries = [];
    for (var _i = 0, _a = Object.entries(params); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (Array.isArray(value) || typeof value === 'object') {
            throw new Error("[Module Federation] Delegated module params cannot be an array or object. Key \"".concat(key, "\" should be a string or number"));
        }
        queries.push("".concat(key, "=").concat(value));
    }
    return "internal ".concat(delegate, "?").concat(queries.join('&'));
};
exports.createDelegatedModule = createDelegatedModule;
var loadScript = function (keyOrRuntimeRemoteItem) {
    var runtimeRemotes = getRuntimeRemotes();
    // 1) Load remote container if needed
    var asyncContainer;
    var reference = typeof keyOrRuntimeRemoteItem === 'string'
        ? runtimeRemotes[keyOrRuntimeRemoteItem]
        : keyOrRuntimeRemoteItem;
    if (reference.asyncContainer) {
        asyncContainer =
            typeof reference.asyncContainer.then === 'function'
                ? reference.asyncContainer
                : // @ts-ignore
                    reference.asyncContainer();
    }
    else {
        // This casting is just to satisfy typescript,
        // In reality remoteGlobal will always be a string;
        var remoteGlobal_1 = reference.global;
        // Check if theres an override for container key if not use remote global
        var containerKey_1 = reference.uniqueKey
            ? reference.uniqueKey
            : remoteGlobal_1;
        var __webpack_error__1 = new Error();
        // @ts-ignore
        if (!global.__remote_scope__) {
            // create a global scope for container, similar to how remotes are set on window in the browser
            // @ts-ignore
            global.__remote_scope__ = {
                // @ts-ignore
                _config: {},
            };
        }
        var globalScope_1 = 
        // @ts-ignore
        typeof window !== 'undefined' ? window : global.__remote_scope__;
        if (typeof window === 'undefined') {
            globalScope_1['_config'][containerKey_1] = reference.url;
        }
        else {
            // to match promise template system, can be removed once promise template is gone
            if (!globalScope_1['remoteLoading']) {
                globalScope_1['remoteLoading'] = {};
            }
            if (globalScope_1['remoteLoading'][containerKey_1]) {
                return globalScope_1['remoteLoading'][containerKey_1];
            }
        }
        asyncContainer = new Promise(function (resolve, reject) {
            function resolveRemoteGlobal() {
                var asyncContainer = globalScope_1[remoteGlobal_1];
                return resolve(asyncContainer);
            }
            if (typeof globalScope_1[remoteGlobal_1] !== 'undefined') {
                return resolveRemoteGlobal();
            }
            __webpack_require__.l(reference.url, function (event) {
                if (typeof globalScope_1[remoteGlobal_1] !== 'undefined') {
                    return resolveRemoteGlobal();
                }
                var errorType = event && (event.type === 'load' ? 'missing' : event.type);
                var realSrc = event && event.target && event.target.src;
                __webpack_error__1.message =
                    'Loading script failed.\n(' +
                        errorType +
                        ': ' +
                        realSrc +
                        ' or global var ' +
                        remoteGlobal_1 +
                        ')';
                __webpack_error__1.name = 'ScriptExternalLoadError';
                __webpack_error__1.type = errorType;
                __webpack_error__1.request = realSrc;
                reject(__webpack_error__1);
            }, containerKey_1);
        });
        if (typeof window !== 'undefined') {
            globalScope_1['remoteLoading'][containerKey_1] = asyncContainer;
        }
    }
    return asyncContainer;
};
var createContainerSharingScope = function (asyncContainer) {
    // @ts-ignore
    return asyncContainer
        .then(function (container) {
        if (!__webpack_share_scopes__['default']) {
            // not always a promise, so we wrap it in a resolve
            return Promise.resolve(__webpack_init_sharing__('default')).then(function () {
                return container;
            });
        }
        else {
            return container;
        }
    })
        .then(function (container) {
        try {
            // WARNING: here might be a potential BUG.
            //   `container.init` does not return a Promise, and here we do not call `then` on it.
            // But according to [docs](https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers)
            //   it must be async.
            // The problem may be in Proxy in NextFederationPlugin.js.
            //   or maybe a bug in the webpack itself - instead of returning rejected promise it just throws an error.
            // But now everything works properly and we keep this code as is.
            container.init(__webpack_share_scopes__['default']);
        }
        catch (e) {
            // maybe container already initialized so nothing to throw
        }
        return container;
    });
};
/**
 * Return initialized remote container by remote's key or its runtime remote item data.
 *
 * `runtimeRemoteItem` might be
 *    { global, url } - values obtained from webpack remotes option `global@url`
 * or
 *    { asyncContainer } - async container is a promise that resolves to the remote container
 */
var injectScript = function (keyOrRuntimeRemoteItem) {
    var asyncContainer = loadScript(keyOrRuntimeRemoteItem);
    return createContainerSharingScope(asyncContainer);
};
exports.injectScript = injectScript;
var createRuntimeVariables = function (remotes) {
    if (!remotes) {
        return {};
    }
    return Object.entries(remotes).reduce(function (acc, remote) {
        // handle promise new promise and external new promise
        if (remote[1].startsWith('promise ') || remote[1].startsWith('external ')) {
            var promiseCall = remote[1]
                .replace('promise ', '')
                .replace('external ', '');
            acc[remote[0]] = "function() {\n        return ".concat(promiseCall, "\n      }");
            return acc;
        }
        // if somehow its just the @ syntax or something else, pass it through
        acc[remote[0]] = JSON.stringify(remote[1]);
        return acc;
    }, {});
};
exports.createRuntimeVariables = createRuntimeVariables;
/**
 * Returns initialized webpack RemoteContainer.
 * If its' script does not loaded - then load & init it firstly.
 */
var getContainer = function (remoteContainer) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var containerScope, uniqueKey, container;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!remoteContainer) {
                    throw Error("Remote container options is empty");
                }
                containerScope = 
                //@ts-ignore
                typeof window !== 'undefined' ? window : global.__remote_scope__;
                if (!(typeof remoteContainer === 'string')) return [3 /*break*/, 1];
                if (containerScope[remoteContainer]) {
                    return [2 /*return*/, containerScope[remoteContainer]];
                }
                return [2 /*return*/];
            case 1:
                uniqueKey = remoteContainer.uniqueKey;
                if (containerScope[uniqueKey]) {
                    return [2 /*return*/, containerScope[uniqueKey]];
                }
                return [4 /*yield*/, (0, exports.injectScript)({
                        global: remoteContainer.global,
                        url: remoteContainer.url,
                    })];
            case 2:
                container = _a.sent();
                if (container) {
                    return [2 /*return*/, container];
                }
                throw Error("Remote container ".concat(remoteContainer.url, " is empty"));
        }
    });
}); };
exports.getContainer = getContainer;
/**
 * Return remote module from container.
 * If you provide `exportName` it automatically return exact property value from module.
 *
 * @example
 *   remote.getModule('./pages/index', 'default')
 */
var getModule = function (_a) {
    var remoteContainer = _a.remoteContainer, modulePath = _a.modulePath, exportName = _a.exportName;
    return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var container, modFactory, mod, error_1;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, exports.getContainer)(remoteContainer)];
                case 1:
                    container = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (container === null || container === void 0 ? void 0 : container.get(modulePath))];
                case 3:
                    modFactory = _b.sent();
                    if (!modFactory)
                        return [2 /*return*/, undefined];
                    mod = modFactory();
                    if (exportName) {
                        return [2 /*return*/, mod && typeof mod === 'object' ? mod[exportName] : undefined];
                    }
                    else {
                        return [2 /*return*/, mod];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    console.log(error_1);
                    return [2 /*return*/, undefined];
                case 5: return [2 /*return*/];
            }
        });
    });
};
exports.getModule = getModule;
//# sourceMappingURL=common.js.map