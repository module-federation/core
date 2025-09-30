"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getRedirectUrl: null,
    getRewrittenUrl: null,
    isRewrite: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getRedirectUrl: function() {
        return _utils.getRedirectUrl;
    },
    getRewrittenUrl: function() {
        return _utils.getRewrittenUrl;
    },
    isRewrite: function() {
        return _utils.isRewrite;
    }
});
0 && __export(require("./config-testing-utils")) && __export(require("./middleware-testing-utils"));
_export_star(require("./config-testing-utils"), exports);
_export_star(require("./middleware-testing-utils"), exports);
const _utils = require("./utils");
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}

//# sourceMappingURL=index.js.map