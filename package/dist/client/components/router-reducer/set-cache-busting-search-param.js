'use client';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "setCacheBustingSearchParam", {
    enumerable: true,
    get: function() {
        return setCacheBustingSearchParam;
    }
});
const _hash = require("../../../shared/lib/hash");
const _approuterheaders = require("../app-router-headers");
const setCacheBustingSearchParam = (url, headers)=>{
    const uniqueCacheKey = (0, _hash.hexHash)([
        headers[_approuterheaders.NEXT_ROUTER_PREFETCH_HEADER] || '0',
        headers[_approuterheaders.NEXT_ROUTER_SEGMENT_PREFETCH_HEADER] || '0',
        headers[_approuterheaders.NEXT_ROUTER_STATE_TREE_HEADER],
        headers[_approuterheaders.NEXT_URL]
    ].join(','));
    /**
   * Note that we intentionally do not use `url.searchParams.set` here:
   *
   * const url = new URL('https://example.com/search?q=custom%20spacing');
   * url.searchParams.set('_rsc', 'abc123');
   * console.log(url.toString()); // Outputs: https://example.com/search?q=custom+spacing&_rsc=abc123
   *                                                                             ^ <--- this is causing confusion
   * This is in fact intended based on https://url.spec.whatwg.org/#interface-urlsearchparams, but
   * we want to preserve the %20 as %20 if that's what the user passed in, hence the custom
   * logic below.
   */ const existingSearch = url.search;
    const rawQuery = existingSearch.startsWith('?') ? existingSearch.slice(1) : existingSearch;
    const pairs = rawQuery.split('&').filter(Boolean);
    pairs.push(_approuterheaders.NEXT_RSC_UNION_QUERY + "=" + uniqueCacheKey);
    url.search = pairs.length ? "?" + pairs.join('&') : '';
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=set-cache-busting-search-param.js.map