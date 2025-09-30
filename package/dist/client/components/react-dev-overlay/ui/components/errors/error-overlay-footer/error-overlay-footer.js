"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    ErrorOverlayFooter: null,
    styles: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ErrorOverlayFooter: function() {
        return ErrorOverlayFooter;
    },
    styles: function() {
        return styles;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _errorfeedback = require("./error-feedback/error-feedback");
function ErrorOverlayFooter(param) {
    let { errorCode, footerMessage } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("footer", {
        className: "error-overlay-footer",
        children: [
            footerMessage ? /*#__PURE__*/ (0, _jsxruntime.jsx)("p", {
                className: "error-overlay-footer-message",
                children: footerMessage
            }) : null,
            errorCode ? /*#__PURE__*/ (0, _jsxruntime.jsx)(_errorfeedback.ErrorFeedback, {
                className: "error-feedback",
                errorCode: errorCode
            }) : null
        ]
    });
}
const styles = "\n  .error-overlay-footer {\n    display: flex;\n    flex-direction: row;\n    justify-content: space-between;\n\n    gap: 8px;\n    padding: 12px;\n    background: var(--color-background-200);\n    border-top: 1px solid var(--color-gray-400);\n  }\n\n  .error-feedback {\n    margin-left: auto;\n\n    p {\n      font-size: var(--size-14);\n      font-weight: 500;\n      margin: 0;\n    }\n  }\n\n  .error-overlay-footer-message {\n    color: var(--color-gray-900);\n    margin: 0;\n    font-size: var(--size-14);\n    font-weight: 400;\n    line-height: var(--size-20);\n  }\n\n  " + _errorfeedback.styles + "\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=error-overlay-footer.js.map