"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "blockCrossSite", {
    enumerable: true,
    get: function() {
        return blockCrossSite;
    }
});
const _url = require("../../../lib/url");
const _log = require("../../../build/output/log");
const _csrfprotection = require("../../app-render/csrf-protection");
function warnOrBlockRequest(res, origin, mode) {
    const originString = origin ? `from ${origin}` : '';
    if (mode === 'warn') {
        (0, _log.warnOnce)(`Cross origin request detected ${originString} to /_next/* resource. In a future major version of Next.js, you will need to explicitly configure "allowedDevOrigins" in next.config to allow this.\nRead more: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins`);
        return false;
    }
    (0, _log.warnOnce)(`Blocked cross-origin request ${originString} to /_next/* resource. To allow this, configure "allowedDevOrigins" in next.config\nRead more: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins`);
    if ('statusCode' in res) {
        res.statusCode = 403;
    }
    res.end('Unauthorized');
    return true;
}
function isInternalDevEndpoint(req) {
    if (!req.url) return false;
    try {
        // TODO: We should standardize on a single prefix for this
        const isMiddlewareRequest = req.url.includes('/__nextjs');
        const isInternalAsset = req.url.includes('/_next');
        // Static media requests are excluded, as they might be loaded via CSS and would fail
        // CORS checks.
        const isIgnoredRequest = req.url.includes('/_next/image') || req.url.includes('/_next/static/media');
        return !isIgnoredRequest && (isInternalAsset || isMiddlewareRequest);
    } catch (err) {
        return false;
    }
}
const blockCrossSite = (req, res, allowedDevOrigins, hostname)=>{
    // in the future, these will be blocked by default when allowed origins aren't configured.
    // for now, we warn when allowed origins aren't configured
    const mode = typeof allowedDevOrigins === 'undefined' ? 'warn' : 'block';
    const allowedOrigins = [
        '*.localhost',
        'localhost',
        ...allowedDevOrigins || []
    ];
    if (hostname) {
        allowedOrigins.push(hostname);
    }
    // only process internal URLs/middleware
    if (!isInternalDevEndpoint(req)) {
        return false;
    }
    // block non-cors request from cross-site e.g. script tag on
    // different host
    if (req.headers['sec-fetch-mode'] === 'no-cors' && req.headers['sec-fetch-site'] === 'cross-site') {
        return warnOrBlockRequest(res, undefined, mode);
    }
    // ensure websocket requests from allowed origin
    const rawOrigin = req.headers['origin'];
    if (rawOrigin) {
        const parsedOrigin = (0, _url.parseUrl)(rawOrigin);
        if (parsedOrigin) {
            const originLowerCase = parsedOrigin.hostname.toLowerCase();
            if (!(0, _csrfprotection.isCsrfOriginAllowed)(originLowerCase, allowedOrigins)) {
                return warnOrBlockRequest(res, originLowerCase, mode);
            }
        }
    }
    return false;
};

//# sourceMappingURL=block-cross-site.js.map