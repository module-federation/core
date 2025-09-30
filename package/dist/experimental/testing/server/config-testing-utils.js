"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "unstable_getResponseFromNextConfig", {
    enumerable: true,
    get: function() {
        return unstable_getResponseFromNextConfig;
    }
});
const _nodeurl = require("node:url");
const _pathtoregexp = require("next/dist/compiled/path-to-regexp");
const _preparedestination = require("../../../shared/lib/router/utils/prepare-destination");
const _buildcustomroute = require("../../../lib/build-custom-route");
const _loadcustomroutes = /*#__PURE__*/ _interop_require_default(require("../../../lib/load-custom-routes"));
const _exports = require("../../../server/web/exports");
const _redirectstatus = require("../../../lib/redirect-status");
const _utils = require("./utils");
const _parsedurlquerytoparams = require("../../../server/route-modules/app-route/helpers/parsed-url-query-to-params");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Tries to match the current request against the provided route. If there is
 * a match, it returns the params extracted from the path. If not, it returns
 * undefined.
 */ function matchRoute(route, request, parsedUrl) {
    const pathname = parsedUrl.pathname;
    if (!pathname) {
        return;
    }
    const regexMatches = pathname == null ? void 0 : pathname.match(route.regex);
    if (regexMatches) {
        const pathMatch = (0, _pathtoregexp.match)(route.source)(pathname);
        if (!pathMatch) {
            throw Object.defineProperty(new Error('Unexpected error: extracting params from path failed but the regular expression matched'), "__NEXT_ERROR_CODE", {
                value: "E289",
                enumerable: false,
                configurable: true
            });
        }
        if (route.has || route.missing) {
            if (!(0, _preparedestination.matchHas)(request, parsedUrl.query, route.has, route.missing)) {
                return;
            }
        }
        return pathMatch.params;
    }
}
async function unstable_getResponseFromNextConfig({ url, nextConfig, headers = {}, cookies = {} }) {
    const parsedUrl = (0, _nodeurl.parse)(url, true);
    const request = (0, _utils.constructRequest)({
        url,
        headers,
        cookies
    });
    const routes = await (0, _loadcustomroutes.default)(nextConfig);
    const headerRoutes = routes.headers.map((route)=>(0, _buildcustomroute.buildCustomRoute)('header', route));
    const redirectRoutes = routes.redirects.map((route)=>(0, _buildcustomroute.buildCustomRoute)('redirect', route, [
            '/_next/'
        ]));
    const rewriteRoutes = [
        ...routes.rewrites.beforeFiles,
        ...routes.rewrites.afterFiles,
        ...routes.rewrites.fallback
    ].map((route)=>(0, _buildcustomroute.buildCustomRoute)('rewrite', route));
    const respHeaders = {};
    for (const route of headerRoutes){
        const matched = matchRoute(route, request, parsedUrl);
        if (matched) {
            for (const header of route.headers){
                respHeaders[header.key] = header.value;
            }
        }
    }
    function matchRouteAndGetDestination(route) {
        const params = matchRoute(route, request, parsedUrl);
        if (!params) {
            return;
        }
        const { newUrl, parsedDestination } = (0, _preparedestination.prepareDestination)({
            appendParamsToQuery: false,
            destination: route.destination,
            params,
            query: parsedUrl.query
        });
        const searchParams = new URLSearchParams((0, _parsedurlquerytoparams.parsedUrlQueryToParams)(parsedDestination.query));
        return new URL(searchParams.size > 0 ? `${newUrl}?${searchParams.toString()}` : newUrl, parsedDestination.hostname ? `${parsedDestination.protocol}//${parsedDestination.hostname}` : parsedUrl.host ? `${parsedUrl.protocol}//${parsedUrl.host}` : 'https://example.com');
    }
    for (const route of redirectRoutes){
        const redirectUrl = matchRouteAndGetDestination(route);
        if (!redirectUrl) {
            continue;
        }
        const statusCode = (0, _redirectstatus.getRedirectStatus)(route);
        return _exports.NextResponse.redirect(redirectUrl, {
            status: statusCode,
            headers: respHeaders
        });
    }
    for (const route of rewriteRoutes){
        const rewriteUrl = matchRouteAndGetDestination(route);
        if (!rewriteUrl) {
            continue;
        }
        return _exports.NextResponse.rewrite(rewriteUrl, {
            headers: respHeaders
        });
    }
    return new _exports.NextResponse('', {
        status: 200,
        headers: respHeaders
    });
}

//# sourceMappingURL=config-testing-utils.js.map