"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    DIALOG_STYLES: null,
    ErrorOverlayDialog: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DIALOG_STYLES: function() {
        return DIALOG_STYLES;
    },
    ErrorOverlayDialog: function() {
        return ErrorOverlayDialog;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _dialog = require("../../dialog/dialog");
function ErrorOverlayDialog(param) {
    let { children, onClose, footer, ...props } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("div", {
        className: "error-overlay-dialog-container",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_dialog.Dialog, {
                type: "error",
                "aria-labelledby": "nextjs__container_errors_label",
                "aria-describedby": "nextjs__container_errors_desc",
                className: "error-overlay-dialog-scroll",
                onClose: onClose,
                ...props,
                children: children
            }),
            footer
        ]
    });
}
const DIALOG_STYLES = "\n  .error-overlay-dialog-container {\n    -webkit-font-smoothing: antialiased;\n    display: flex;\n    flex-direction: column;\n    background: var(--color-background-100);\n    background-clip: padding-box;\n    border: var(--next-dialog-border-width) solid var(--color-gray-400);\n    border-radius: 0 0 var(--next-dialog-radius) var(--next-dialog-radius);\n    box-shadow: var(--shadow-menu);\n    position: relative;\n    overflow: hidden;\n  }\n\n  .error-overlay-dialog-scroll {\n    overflow-y: auto;\n    height: 100%;\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=dialog.js.map