"use strict";
/* eslint-disable @typescript-eslint/ban-ts-comment */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModule = exports.getContainer = exports.createRuntimeVariables = exports.injectScript = exports.loadScript = exports.createDelegatedModule = exports.extractUrlAndGlobal = exports.remoteVars = void 0;
const tslib_1 = require("tslib");
const getRuntimeRemotes_1 = require("./getRuntimeRemotes");
let remotesFromProcess = {};
try {
    // @ts-ignore
    remotesFromProcess = process.env['REMOTES'] || {};
}
catch (e) {
    // not in webpack bundle
}
exports.remoteVars = remotesFromProcess;
// split the @ syntax into url and global
const extractUrlAndGlobal = (urlAndGlobal) => {
    const index = urlAndGlobal.indexOf('@');
    if (index <= 0 || index === urlAndGlobal.length - 1) {
        throw new Error(`Invalid request "${urlAndGlobal}"`);
    }
    return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
};
exports.extractUrlAndGlobal = extractUrlAndGlobal;
const createDelegatedModule = (delegate, params) => {
    const queries = [];
    for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value) || typeof value === 'object') {
            throw new Error(`[Module Federation] Delegated module params cannot be an array or object. Key "${key}" should be a string or number`);
        }
        queries.push(`${key}=${value}`);
    }
    if (queries.length === 0)
        return `internal ${delegate}`;
    return `internal ${delegate}?${queries.join('&')}`;
};
exports.createDelegatedModule = createDelegatedModule;
const loadScript = (keyOrRuntimeRemoteItem) => {
    const runtimeRemotes = (0, getRuntimeRemotes_1.getRuntimeRemotes)();
    // 1) Load remote container if needed
    let asyncContainer;
    const reference = typeof keyOrRuntimeRemoteItem === 'string'
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
        const remoteGlobal = reference.global;
        // Check if theres an override for container key if not use remote global
        const containerKey = reference.uniqueKey
            ? reference.uniqueKey
            : remoteGlobal;
        const __webpack_error__ = new Error();
        // @ts-ignore
        if (!global.__remote_scope__) {
            // create a global scope for container, similar to how remotes are set on window in the browser
            // @ts-ignore
            global.__remote_scope__ = {
                // @ts-ignore
                _config: {},
            };
        }
        // @ts-ignore
        const globalScope = 
        // @ts-ignore
        typeof window !== 'undefined' ? window : global.__remote_scope__;
        if (typeof window === 'undefined') {
            globalScope['_config'][containerKey] = reference.url;
        }
        else {
            // to match promise template system, can be removed once promise template is gone
            if (!globalScope['remoteLoading']) {
                globalScope['remoteLoading'] = {};
            }
            if (globalScope['remoteLoading'][containerKey]) {
                return globalScope['remoteLoading'][containerKey];
            }
        }
        // @ts-ignore
        asyncContainer = new Promise(function (resolve, reject) {
            function resolveRemoteGlobal() {
                const asyncContainer = globalScope[remoteGlobal];
                return resolve(asyncContainer);
            }
            if (typeof globalScope[remoteGlobal] !== 'undefined') {
                return resolveRemoteGlobal();
            }
            __webpack_require__.l(reference.url, function (event) {
                if (typeof globalScope[remoteGlobal] !== 'undefined') {
                    return resolveRemoteGlobal();
                }
                const errorType = event && (event.type === 'load' ? 'missing' : event.type);
                const realSrc = event && event.target && event.target.src;
                __webpack_error__.message =
                    'Loading script failed.\n(' +
                        errorType +
                        ': ' +
                        realSrc +
                        ' or global var ' +
                        remoteGlobal +
                        ')';
                __webpack_error__.name = 'ScriptExternalLoadError';
                __webpack_error__.type = errorType;
                __webpack_error__.request = realSrc;
                reject(__webpack_error__);
            }, containerKey);
        }).catch(function (err) {
            console.error('container is offline, returning fake remote');
            console.error(err);
            return {
                fake: true,
                // @ts-ignore
                get: (arg) => {
                    console.warn('faking', arg, 'module on, its offline');
                    return Promise.resolve(() => {
                        return {
                            __esModule: true,
                            default: () => {
                                return null;
                            },
                        };
                    });
                },
                //eslint-disable-next-line
                init: () => { },
            };
        });
        if (typeof window !== 'undefined') {
            globalScope['remoteLoading'][containerKey] = asyncContainer;
        }
    }
    return asyncContainer;
};
exports.loadScript = loadScript;
const createContainerSharingScope = (asyncContainer) => {
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
const injectScript = (keyOrRuntimeRemoteItem) => {
    const asyncContainer = (0, exports.loadScript)(keyOrRuntimeRemoteItem);
    return createContainerSharingScope(asyncContainer);
};
exports.injectScript = injectScript;
const createRuntimeVariables = (remotes) => {
    if (!remotes) {
        return {};
    }
    return Object.entries(remotes).reduce((acc, remote) => {
        // handle promise new promise and external new promise
        if (remote[1].startsWith('promise ') || remote[1].startsWith('external ')) {
            const promiseCall = remote[1]
                .replace('promise ', '')
                .replace('external ', '');
            acc[remote[0]] = `function() {
        return ${promiseCall}
      }`;
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
const getContainer = (remoteContainer) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!remoteContainer) {
        throw Error(`Remote container options is empty`);
    }
    // @ts-ignore
    const containerScope = 
    // @ts-ignore
    typeof window !== 'undefined' ? window : global.__remote_scope__;
    if (typeof remoteContainer === 'string') {
        if (containerScope[remoteContainer]) {
            return containerScope[remoteContainer];
        }
        return;
    }
    else {
        const uniqueKey = remoteContainer.uniqueKey;
        if (containerScope[uniqueKey]) {
            return containerScope[uniqueKey];
        }
        const container = yield (0, exports.injectScript)({
            global: remoteContainer.global,
            url: remoteContainer.url,
        });
        if (container) {
            return container;
        }
        throw Error(`Remote container ${remoteContainer.url} is empty`);
    }
});
exports.getContainer = getContainer;
/**
 * Return remote module from container.
 * If you provide `exportName` it automatically return exact property value from module.
 *
 * @example
 *   remote.getModule('./pages/index', 'default')
 */
const getModule = ({ remoteContainer, modulePath, exportName, }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const container = yield (0, exports.getContainer)(remoteContainer);
    try {
        const modFactory = yield (container === null || container === void 0 ? void 0 : container.get(modulePath));
        if (!modFactory)
            return undefined;
        const mod = modFactory();
        if (exportName) {
            return mod && typeof mod === 'object' ? mod[exportName] : undefined;
        }
        else {
            return mod;
        }
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
});
exports.getModule = getModule;
//# sourceMappingURL=common.js.map