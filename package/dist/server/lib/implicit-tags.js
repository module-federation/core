"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getImplicitTags", {
    enumerable: true,
    get: function() {
        return getImplicitTags;
    }
});
const _constants = require("../../lib/constants");
const _handlers = require("../use-cache/handlers");
const _lazyresult = require("./lazy-result");
const getDerivedTags = (pathname)=>{
    const derivedTags = [
        `/layout`
    ];
    // we automatically add the current path segments as tags
    // for revalidatePath handling
    if (pathname.startsWith('/')) {
        const pathnameParts = pathname.split('/');
        for(let i = 1; i < pathnameParts.length + 1; i++){
            let curPathname = pathnameParts.slice(0, i).join('/');
            if (curPathname) {
                // all derived tags other than the page are layout tags
                if (!curPathname.endsWith('/page') && !curPathname.endsWith('/route')) {
                    curPathname = `${curPathname}${!curPathname.endsWith('/') ? '/' : ''}layout`;
                }
                derivedTags.push(curPathname);
            }
        }
    }
    return derivedTags;
};
/**
 * Creates a map with lazy results that fetch the expiration value for the given
 * tags and respective cache kind when they're awaited for the first time.
 */ function createTagsExpirationsByCacheKind(tags) {
    const expirationsByCacheKind = new Map();
    const cacheHandlers = (0, _handlers.getCacheHandlerEntries)();
    if (cacheHandlers) {
        for (const [kind, cacheHandler] of cacheHandlers){
            if ('getExpiration' in cacheHandler) {
                expirationsByCacheKind.set(kind, (0, _lazyresult.createLazyResult)(async ()=>cacheHandler.getExpiration(...tags)));
            }
        }
    }
    return expirationsByCacheKind;
}
async function getImplicitTags(page, url, fallbackRouteParams) {
    const tags = [];
    const hasFallbackRouteParams = fallbackRouteParams && fallbackRouteParams.size > 0;
    // Add the derived tags from the page.
    const derivedTags = getDerivedTags(page);
    for (let tag of derivedTags){
        tag = `${_constants.NEXT_CACHE_IMPLICIT_TAG_ID}${tag}`;
        tags.push(tag);
    }
    // Add the tags from the pathname. If the route has unknown params, we don't
    // want to add the pathname as a tag, as it will be invalid.
    if (url.pathname && !hasFallbackRouteParams) {
        const tag = `${_constants.NEXT_CACHE_IMPLICIT_TAG_ID}${url.pathname}`;
        tags.push(tag);
    }
    return {
        tags,
        expirationsByCacheKind: createTagsExpirationsByCacheKind(tags)
    };
}

//# sourceMappingURL=implicit-tags.js.map