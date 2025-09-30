"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SegmentPrefixRSCPathnameNormalizer", {
    enumerable: true,
    get: function() {
        return SegmentPrefixRSCPathnameNormalizer;
    }
});
const _constants = require("../../../lib/constants");
const PATTERN = new RegExp(`^(/.*)${_constants.RSC_SEGMENTS_DIR_SUFFIX}(/.*)${_constants.RSC_SEGMENT_SUFFIX}$`);
class SegmentPrefixRSCPathnameNormalizer {
    match(pathname) {
        return PATTERN.test(pathname);
    }
    extract(pathname) {
        const match = pathname.match(PATTERN);
        if (!match) return null;
        return {
            originalPathname: match[1],
            segmentPath: match[2]
        };
    }
    normalize(pathname) {
        const match = this.extract(pathname);
        if (!match) return pathname;
        return match.originalPathname;
    }
}

//# sourceMappingURL=segment-prefix-rsc.js.map