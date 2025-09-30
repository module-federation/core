"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    ErrorOverlayOverlay: null,
    OVERLAY_STYLES: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ErrorOverlayOverlay: function() {
        return ErrorOverlayOverlay;
    },
    OVERLAY_STYLES: function() {
        return OVERLAY_STYLES;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _overlay = require("../../overlay/overlay");
function ErrorOverlayOverlay(param) {
    let { children, ...props } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_overlay.Overlay, {
        ...props,
        children: children
    });
}
const OVERLAY_STYLES = "\n  [data-nextjs-dialog-overlay] {\n    padding: initial;\n    top: 10vh;\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=overlay.js.map