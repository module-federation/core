"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    DIALOG_BODY_STYLES: null,
    ErrorOverlayDialogBody: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DIALOG_BODY_STYLES: function() {
        return DIALOG_BODY_STYLES;
    },
    ErrorOverlayDialogBody: function() {
        return ErrorOverlayDialogBody;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _dialog = require("../../dialog");
function ErrorOverlayDialogBody(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_dialog.DialogBody, {
        className: "nextjs-container-errors-body",
        children: children
    });
}
const DIALOG_BODY_STYLES = "";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=body.js.map