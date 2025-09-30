'use client';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    MetadataBoundary: null,
    OutletBoundary: null,
    ViewportBoundary: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    MetadataBoundary: function() {
        return MetadataBoundary;
    },
    OutletBoundary: function() {
        return OutletBoundary;
    },
    ViewportBoundary: function() {
        return ViewportBoundary;
    }
});
const _metadataconstants = require("../../../lib/metadata/metadata-constants");
// We use a namespace object to allow us to recover the name of the function
// at runtime even when production bundling/minification is used.
const NameSpace = {
    [_metadataconstants.METADATA_BOUNDARY_NAME]: function(param) {
        let { children } = param;
        return children;
    },
    [_metadataconstants.VIEWPORT_BOUNDARY_NAME]: function(param) {
        let { children } = param;
        return children;
    },
    [_metadataconstants.OUTLET_BOUNDARY_NAME]: function(param) {
        let { children } = param;
        return children;
    }
};
const MetadataBoundary = // We use slice(0) to trick the bundler into not inlining/minifying the function
// so it retains the name inferred from the namespace object
NameSpace[_metadataconstants.METADATA_BOUNDARY_NAME.slice(0)];
const ViewportBoundary = // We use slice(0) to trick the bundler into not inlining/minifying the function
// so it retains the name inferred from the namespace object
NameSpace[_metadataconstants.VIEWPORT_BOUNDARY_NAME.slice(0)];
const OutletBoundary = // We use slice(0) to trick the bundler into not inlining/minifying the function
// so it retains the name inferred from the namespace object
NameSpace[_metadataconstants.OUTLET_BOUNDARY_NAME.slice(0)];

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=metadata-boundary.js.map