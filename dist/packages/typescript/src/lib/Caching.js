"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TypesCache", {
    enumerable: true,
    get: function() {
        return TypesCache;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _fs = /*#__PURE__*/ _interop_require_default._(require("fs"));
let TypesCache = class TypesCache {
    static getFsFiles(directory) {
        // Simple caching mechanism to improve performance reading the file system
        if (this.fsCache.has(directory)) {
            return this.fsCache.get(directory);
        }
        const files = _fs.default.readdirSync(directory);
        this.fsCache.set(directory, files);
        return files;
    }
    static getCacheBustedFiles(remote, statsJson) {
        const stats = this.typesCache.get(remote);
        if (!stats) {
            this.typesCache.set(remote, statsJson);
        }
        const cachedFiles = stats == null ? void 0 : stats.files;
        const files = statsJson.files;
        const filesToCacheBust = [];
        const filesToDelete = [];
        // No 'cached files' => No types downloaded
        // Go head and download all the files, no need to cache bust
        if (!cachedFiles) {
            return {
                filesToCacheBust: Object.keys(files),
                filesToDelete
            };
        }
        Object.entries(cachedFiles).forEach(([filename, hash])=>{
            const remoteFileHash = files[filename];
            if (remoteFileHash) {
                if (remoteFileHash !== hash) {
                    filesToCacheBust.push(filename);
                }
            } else {
                filesToDelete.push(filename);
            }
        });
        return {
            filesToCacheBust,
            filesToDelete
        };
    }
};
(()=>{
    TypesCache.fsCache = new Map();
})();
(()=>{
    TypesCache.typesCache = new Map();
})();

//# sourceMappingURL=Caching.js.map