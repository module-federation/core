"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "cacheTag", {
    enumerable: true,
    get: function() {
        return cacheTag;
    }
});
const _workunitasyncstorageexternal = require("../app-render/work-unit-async-storage.external");
const _patchfetch = require("../lib/patch-fetch");
function cacheTag(...tags) {
    if (!process.env.__NEXT_USE_CACHE) {
        throw Object.defineProperty(new Error('cacheTag() is only available with the experimental.useCache config.'), "__NEXT_ERROR_CODE", {
            value: "E628",
            enumerable: false,
            configurable: true
        });
    }
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (!workUnitStore || workUnitStore.type !== 'cache') {
        throw Object.defineProperty(new Error('cacheTag() can only be called inside a "use cache" function.'), "__NEXT_ERROR_CODE", {
            value: "E177",
            enumerable: false,
            configurable: true
        });
    }
    const validTags = (0, _patchfetch.validateTags)(tags, 'cacheTag()');
    if (!workUnitStore.tags) {
        workUnitStore.tags = validTags;
    } else {
        workUnitStore.tags.push(...validTags);
    }
}

//# sourceMappingURL=cache-tag.js.map