"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    DIALOG_HEADER_STYLES: null,
    ErrorOverlayDialogHeader: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DIALOG_HEADER_STYLES: function() {
        return DIALOG_HEADER_STYLES;
    },
    ErrorOverlayDialogHeader: function() {
        return ErrorOverlayDialogHeader;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _dialogheader = require("../../dialog/dialog-header");
function ErrorOverlayDialogHeader(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_dialogheader.DialogHeader, {
        className: "nextjs-container-errors-header",
        children: children
    });
}
const DIALOG_HEADER_STYLES = "\n  .nextjs-container-errors-header {\n    position: relative;\n  }\n  .nextjs-container-errors-header > h1 {\n    font-size: var(--size-20);\n    line-height: var(--size-24);\n    font-weight: bold;\n    margin: calc(16px * 1.5) 0;\n    color: var(--color-title-h1);\n  }\n  .nextjs-container-errors-header small {\n    font-size: var(--size-14);\n    color: var(--color-accents-1);\n    margin-left: 16px;\n  }\n  .nextjs-container-errors-header small > span {\n    font-family: var(--font-stack-monospace);\n  }\n  .nextjs-container-errors-header > div > small {\n    margin: 0;\n    margin-top: 4px;\n  }\n  .nextjs-container-errors-header > p > a {\n    color: inherit;\n    font-weight: bold;\n  }\n  .nextjs-container-errors-header\n    > .nextjs-container-build-error-version-status {\n    position: absolute;\n    top: 16px;\n    right: 16px;\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=header.js.map