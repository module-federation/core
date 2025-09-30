"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    ErrorTypeLabel: null,
    styles: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ErrorTypeLabel: function() {
        return ErrorTypeLabel;
    },
    styles: function() {
        return styles;
    }
});
const _jsxruntime = require("react/jsx-runtime");
function ErrorTypeLabel(param) {
    let { errorType } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
        id: "nextjs__container_errors_label",
        className: "nextjs__container_errors_label",
        children: errorType
    });
}
const styles = "\n  .nextjs__container_errors_label {\n    padding: 2px 6px;\n    margin: 0;\n    border-radius: var(--rounded-md-2);\n    background: var(--color-red-100);\n    font-weight: 600;\n    font-size: var(--size-12);\n    color: var(--color-red-900);\n    font-family: var(--font-stack-monospace);\n    line-height: var(--size-20);\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=error-type-label.js.map