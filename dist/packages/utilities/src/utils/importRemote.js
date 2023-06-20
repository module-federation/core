"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importRemote = void 0;
var tslib_1 = require("tslib");
var REMOTE_ENTRY_FILE = 'remoteEntry.js';
var loadRemote = function (url, scope, bustRemoteEntryCache) {
    return new Promise(function (resolve, reject) {
        var timestamp = bustRemoteEntryCache ? "?t=".concat(new Date().getTime()) : '';
        var webpackRequire = __webpack_require__;
        webpackRequire.l("".concat(url).concat(timestamp), function (event) {
            var _a;
            if ((event === null || event === void 0 ? void 0 : event.type) === 'load') {
                // Script loaded successfully:
                return resolve();
            }
            var realSrc = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.src;
            var error = new Error();
            error.message = 'Loading script failed.\n(missing: ' + realSrc + ')';
            error.name = 'ScriptExternalLoadError';
            reject(error);
        }, scope);
    });
};
var initSharing = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var webpackShareScopes;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                webpackShareScopes = __webpack_share_scopes__;
                if (!!(webpackShareScopes === null || webpackShareScopes === void 0 ? void 0 : webpackShareScopes.default)) return [3 /*break*/, 2];
                return [4 /*yield*/, __webpack_init_sharing__('default')];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
// __initialized and __initializing flags prevent some concurrent re-initialization corner cases
var initContainer = function (containerScope) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var webpackShareScopes, error_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                webpackShareScopes = __webpack_share_scopes__;
                if (!(!containerScope.__initialized && !containerScope.__initializing)) return [3 /*break*/, 2];
                containerScope.__initializing = true;
                return [4 /*yield*/, containerScope.init(webpackShareScopes.default)];
            case 1:
                _a.sent();
                containerScope.__initialized = true;
                delete containerScope.__initializing;
                _a.label = 2;
            case 2: return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/*
    Dynamically import a remote module using Webpack's loading mechanism:
    https://webpack.js.org/concepts/module-federation/
  */
var importRemote = function (_a) {
    var url = _a.url, scope = _a.scope, module = _a.module, _b = _a.remoteEntryFileName, remoteEntryFileName = _b === void 0 ? REMOTE_ENTRY_FILE : _b, _c = _a.bustRemoteEntryCache, bustRemoteEntryCache = _c === void 0 ? true : _c;
    return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var remoteScope, remoteUrl, _d, moduleFactory, moduleFactory;
        return tslib_1.__generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    remoteScope = scope;
                    if (!!window[remoteScope]) return [3 /*break*/, 6];
                    remoteUrl = '';
                    if (!(typeof url === 'string')) return [3 /*break*/, 1];
                    remoteUrl = url;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, url()];
                case 2:
                    remoteUrl = _e.sent();
                    _e.label = 3;
                case 3: 
                // Load the remote and initialize the share scope if it's empty
                return [4 /*yield*/, Promise.all([
                        loadRemote("".concat(remoteUrl, "/").concat(remoteEntryFileName), scope, bustRemoteEntryCache),
                        initSharing(),
                    ])];
                case 4:
                    // Load the remote and initialize the share scope if it's empty
                    _e.sent();
                    if (!window[remoteScope]) {
                        throw new Error("Remote loaded successfully but ".concat(scope, " could not be found! Verify that the name is correct in the Webpack configuration!"));
                    }
                    return [4 /*yield*/, Promise.all([
                            initContainer(window[remoteScope]),
                            window[remoteScope].get((module === '.' || module.startsWith('./')) ? module : "./".concat(module)),
                        ])];
                case 5:
                    _d = _e.sent(), moduleFactory = _d[1];
                    return [2 /*return*/, moduleFactory()];
                case 6: return [4 /*yield*/, window[remoteScope].get((module === '.' || module.startsWith('./')) ? module : "./".concat(module))];
                case 7:
                    moduleFactory = _e.sent();
                    return [2 /*return*/, moduleFactory()];
            }
        });
    });
};
exports.importRemote = importRemote;
//# sourceMappingURL=importRemote.js.map