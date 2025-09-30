"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getDisableDevIndicatorMiddleware", {
    enumerable: true,
    get: function() {
        return getDisableDevIndicatorMiddleware;
    }
});
const _middlewareresponse = require("../../client/components/react-dev-overlay/server/middleware-response");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../build/output/log"));
const _devindicatorserverstate = require("./dev-indicator-server-state");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const DISABLE_DEV_INDICATOR_PREFIX = '/__nextjs_disable_dev_indicator';
const COOLDOWN_TIME_MS = process.env.__NEXT_DEV_INDICATOR_COOLDOWN_MS ? parseInt(process.env.__NEXT_DEV_INDICATOR_COOLDOWN_MS) : 1000 * 60 * 60 * 24;
function getDisableDevIndicatorMiddleware() {
    return async function disableDevIndicatorMiddleware(req, res, next) {
        try {
            const { pathname } = new URL(`http://n${req.url}`);
            if (!pathname.startsWith(DISABLE_DEV_INDICATOR_PREFIX)) {
                return next();
            }
            if (req.method !== 'POST') {
                return _middlewareresponse.middlewareResponse.methodNotAllowed(res);
            }
            _devindicatorserverstate.devIndicatorServerState.disabledUntil = Date.now() + COOLDOWN_TIME_MS;
            return _middlewareresponse.middlewareResponse.noContent(res);
        } catch (err) {
            _log.error('Failed to disable the dev indicator:', err instanceof Error ? err.message : err);
            return _middlewareresponse.middlewareResponse.internalServerError(res);
        }
    };
}

//# sourceMappingURL=dev-indicator-middleware.js.map