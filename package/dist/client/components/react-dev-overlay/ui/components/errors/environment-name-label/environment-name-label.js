"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    ENVIRONMENT_NAME_LABEL_STYLES: null,
    EnvironmentNameLabel: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ENVIRONMENT_NAME_LABEL_STYLES: function() {
        return ENVIRONMENT_NAME_LABEL_STYLES;
    },
    EnvironmentNameLabel: function() {
        return EnvironmentNameLabel;
    }
});
const _jsxruntime = require("react/jsx-runtime");
function EnvironmentNameLabel(param) {
    let { environmentName } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("span", {
        "data-nextjs-environment-name-label": true,
        children: environmentName
    });
}
const ENVIRONMENT_NAME_LABEL_STYLES = "\n  [data-nextjs-environment-name-label] {\n    padding: 2px 6px;\n    margin: 0;\n    border-radius: var(--rounded-md-2);\n    background: var(--color-gray-100);\n    font-weight: 600;\n    font-size: var(--size-12);\n    color: var(--color-gray-900);\n    font-family: var(--font-stack-monospace);\n    line-height: var(--size-20);\n  }\n";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=environment-name-label.js.map