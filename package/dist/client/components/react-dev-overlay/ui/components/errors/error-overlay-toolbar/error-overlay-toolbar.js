"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    ErrorOverlayToolbar: null,
    styles: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ErrorOverlayToolbar: function() {
        return ErrorOverlayToolbar;
    },
    styles: function() {
        return styles;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _nodejsinspectorbutton = require("./nodejs-inspector-button");
const _copystacktracebutton = require("./copy-stack-trace-button");
const _docslinkbutton = require("./docs-link-button");
function ErrorOverlayToolbar(param) {
    let { error, debugInfo } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("span", {
        className: "error-overlay-toolbar",
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_copystacktracebutton.CopyStackTraceButton, {
                error: error
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_docslinkbutton.DocsLinkButton, {
                errorMessage: error.message
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(_nodejsinspectorbutton.NodejsInspectorButton, {
                devtoolsFrontendUrl: debugInfo == null ? void 0 : debugInfo.devtoolsFrontendUrl
            })
        ]
    });
}
const styles = "\n  .error-overlay-toolbar {\n    display: flex;\n    gap: 6px;\n  }\n\n  .nodejs-inspector-button,\n  .copy-stack-trace-button,\n  .docs-link-button {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n\n    width: var(--size-28);\n    height: var(--size-28);\n    background: var(--color-background-100);\n    background-clip: padding-box;\n    border: 1px solid var(--color-gray-alpha-400);\n    box-shadow: var(--shadow-small);\n    border-radius: var(--rounded-full);\n\n    svg {\n      width: var(--size-14);\n      height: var(--size-14);\n    }\n\n    &:focus {\n      outline: var(--focus-ring);\n    }\n\n    &:not(:disabled):hover {\n      background: var(--color-gray-alpha-100);\n    }\n\n    &:not(:disabled):active {\n      background: var(--color-gray-alpha-200);\n    }\n\n    &:disabled {\n      background-color: var(--color-gray-100);\n      cursor: not-allowed;\n    }\n  }\n\n  .error-overlay-toolbar-button-icon {\n    color: var(--color-gray-900);\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=error-overlay-toolbar.js.map