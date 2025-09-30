"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BrowserResolvedMetadata", {
    enumerable: true,
    get: function() {
        return BrowserResolvedMetadata;
    }
});
const _react = require("react");
function BrowserResolvedMetadata(param) {
    let { promise } = param;
    const { metadata, error } = (0, _react.use)(promise);
    // If there's metadata error on client, discard the browser metadata
    // and let metadata outlet deal with the error. This will avoid the duplication metadata.
    if (error) return null;
    return metadata;
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=browser-resolved-metadata.js.map