"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    SEGMENT_PATH_KEY: null,
    buildPrefetchSegmentDataRoute: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    SEGMENT_PATH_KEY: function() {
        return SEGMENT_PATH_KEY;
    },
    buildPrefetchSegmentDataRoute: function() {
        return buildPrefetchSegmentDataRoute;
    }
});
const _path = /*#__PURE__*/ _interop_require_default(require("../../../shared/lib/isomorphic/path"));
const _normalizepagepath = require("../../../shared/lib/page-path/normalize-page-path");
const _routeregex = require("../../../shared/lib/router/utils/route-regex");
const _constants = require("../../../lib/constants");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const SEGMENT_PATH_KEY = 'nextSegmentPath';
function buildPrefetchSegmentDataRoute(page, segmentPath) {
    const pagePath = (0, _normalizepagepath.normalizePagePath)(page);
    const destination = _path.default.posix.join(`${pagePath}${_constants.RSC_SEGMENTS_DIR_SUFFIX}`, `${segmentPath}${_constants.RSC_SEGMENT_SUFFIX}`);
    const { namedRegex } = (0, _routeregex.getNamedRouteRegex)(destination, {
        prefixRouteKeys: true,
        includePrefix: true,
        includeSuffix: true,
        excludeOptionalTrailingSlash: true,
        backreferenceDuplicateKeys: true
    });
    return {
        destination,
        source: namedRegex
    };
}

//# sourceMappingURL=build-prefetch-segment-data-route.js.map