"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    deleteCache: null,
    deleteFromRequireCache: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    deleteCache: function() {
        return deleteCache;
    },
    deleteFromRequireCache: function() {
        return deleteFromRequireCache;
    }
});
const _iserror = /*#__PURE__*/ _interop_require_default(require("../../lib/is-error"));
const _realpath = require("../../lib/realpath");
const _loadmanifest = require("../load-manifest");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function deleteFromRequireCache(filePath) {
    try {
        filePath = (0, _realpath.realpathSync)(filePath);
    } catch (e) {
        if ((0, _iserror.default)(e) && e.code !== 'ENOENT') throw e;
    }
    const mod = require.cache[filePath];
    if (mod) {
        // remove the child reference from all parent modules
        for (const parent of Object.values(require.cache)){
            if (parent == null ? void 0 : parent.children) {
                const idx = parent.children.indexOf(mod);
                if (idx >= 0) parent.children.splice(idx, 1);
            }
        }
        // remove parent references from external modules
        for (const child of mod.children){
            child.parent = null;
        }
        delete require.cache[filePath];
        return true;
    }
    return false;
}
function deleteCache(filePath) {
    // try to clear it from the fs cache
    (0, _loadmanifest.clearManifestCache)(filePath);
    deleteFromRequireCache(filePath);
}

//# sourceMappingURL=require-cache.js.map