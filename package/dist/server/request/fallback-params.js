"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getFallbackRouteParams: null,
    getParamKeys: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getFallbackRouteParams: function() {
        return getFallbackRouteParams;
    },
    getParamKeys: function() {
        return getParamKeys;
    }
});
const _routematcher = require("../../shared/lib/router/utils/route-matcher");
const _routeregex = require("../../shared/lib/router/utils/route-regex");
function getParamKeys(page) {
    const pattern = (0, _routeregex.getRouteRegex)(page);
    const matcher = (0, _routematcher.getRouteMatcher)(pattern);
    // Get the default list of allowed params.
    return Object.keys(matcher(page));
}
function getFallbackRouteParams(pageOrKeys) {
    let keys;
    if (typeof pageOrKeys === 'string') {
        keys = getParamKeys(pageOrKeys);
    } else {
        keys = pageOrKeys;
    }
    // If there are no keys, we can return early.
    if (keys.length === 0) return null;
    const params = new Map();
    // As we're creating unique keys for each of the dynamic route params, we only
    // need to generate a unique ID once per request because each of the keys will
    // be also be unique.
    const uniqueID = Math.random().toString(16).slice(2);
    for (const key of keys){
        params.set(key, `%%drp:${key}:${uniqueID}%%`);
    }
    return params;
}

//# sourceMappingURL=fallback-params.js.map