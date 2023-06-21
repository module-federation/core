"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importRemote = void 0;
const tslib_1 = require("tslib");
const REMOTE_ENTRY_FILE = 'remoteEntry.js';
const loadRemote = (url, scope, bustRemoteEntryCache) => new Promise((resolve, reject) => {
    const timestamp = bustRemoteEntryCache ? `?t=${new Date().getTime()}` : '';
    const webpackRequire = __webpack_require__;
    webpackRequire.l(`${url}${timestamp}`, (event) => {
        var _a;
        if ((event === null || event === void 0 ? void 0 : event.type) === 'load') {
            // Script loaded successfully:
            return resolve();
        }
        const realSrc = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.src;
        const error = new Error();
        error.message = 'Loading script failed.\n(missing: ' + realSrc + ')';
        error.name = 'ScriptExternalLoadError';
        reject(error);
    }, scope);
});
const initSharing = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const webpackShareScopes = __webpack_share_scopes__;
    if (!(webpackShareScopes === null || webpackShareScopes === void 0 ? void 0 : webpackShareScopes.default)) {
        yield __webpack_init_sharing__('default');
    }
});
// __initialized and __initializing flags prevent some concurrent re-initialization corner cases
const initContainer = (containerScope) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const webpackShareScopes = __webpack_share_scopes__;
        if (!containerScope.__initialized && !containerScope.__initializing) {
            containerScope.__initializing = true;
            yield containerScope.init(webpackShareScopes.default);
            containerScope.__initialized = true;
            delete containerScope.__initializing;
        }
    }
    catch (error) {
        console.error(error);
    }
});
/*
    Dynamically import a remote module using Webpack's loading mechanism:
    https://webpack.js.org/concepts/module-federation/
  */
const importRemote = ({ url, scope, module, remoteEntryFileName = REMOTE_ENTRY_FILE, bustRemoteEntryCache = true, }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const remoteScope = scope;
    if (!window[remoteScope]) {
        let remoteUrl = '';
        if (typeof url === 'string') {
            remoteUrl = url;
        }
        else {
            remoteUrl = yield url();
        }
        // Load the remote and initialize the share scope if it's empty
        yield Promise.all([
            loadRemote(`${remoteUrl}/${remoteEntryFileName}`, scope, bustRemoteEntryCache),
            initSharing(),
        ]);
        if (!window[remoteScope]) {
            throw new Error(`Remote loaded successfully but ${scope} could not be found! Verify that the name is correct in the Webpack configuration!`);
        }
        // Initialize the container to get shared modules and get the module factory:
        const [, moduleFactory] = yield Promise.all([
            initContainer(window[remoteScope]),
            window[remoteScope].get((module === '.' || module.startsWith('./')) ? module : `./${module}`),
        ]);
        return moduleFactory();
    }
    else {
        const moduleFactory = yield window[remoteScope].get((module === '.' || module.startsWith('./')) ? module : `./${module}`);
        return moduleFactory();
    }
});
exports.importRemote = importRemote;
//# sourceMappingURL=importRemote.js.map