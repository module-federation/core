"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    isStale: null,
    tagsManifest: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    isStale: function() {
        return isStale;
    },
    tagsManifest: function() {
        return tagsManifest;
    }
});
const tagsManifest = new Map();
const isStale = (tags, timestamp)=>{
    for (const tag of tags){
        const revalidatedAt = tagsManifest.get(tag);
        if (typeof revalidatedAt === 'number' && revalidatedAt >= timestamp) {
            return true;
        }
    }
    return false;
};

//# sourceMappingURL=tags-manifest.external.js.map