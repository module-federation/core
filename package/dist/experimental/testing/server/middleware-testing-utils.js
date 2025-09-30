"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "unstable_doesMiddlewareMatch", {
    enumerable: true,
    get: function() {
        return unstable_doesMiddlewareMatch;
    }
});
const _getpagestaticinfo = require("../../../build/analysis/get-page-static-info");
const _middlewareroutematcher = require("../../../shared/lib/router/utils/middleware-route-matcher");
const _url = require("../../../lib/url");
const _utils = require("./utils");
function unstable_doesMiddlewareMatch({ config, url, headers, cookies, nextConfig }) {
    if (!config.matcher) {
        return true;
    }
    const matchers = (0, _getpagestaticinfo.getMiddlewareMatchers)(config.matcher, nextConfig ?? {});
    const routeMatchFn = (0, _middlewareroutematcher.getMiddlewareRouteMatcher)(matchers);
    const { pathname, searchParams = new URLSearchParams() } = (0, _url.parseUrl)(url) || {};
    const request = (0, _utils.constructRequest)({
        url,
        headers,
        cookies
    });
    return routeMatchFn(pathname, request, Object.fromEntries(searchParams));
}

//# sourceMappingURL=middleware-testing-utils.js.map