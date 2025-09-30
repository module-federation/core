"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CopyStackTraceButton", {
    enumerable: true,
    get: function() {
        return CopyStackTraceButton;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _copybutton = require("../../copy-button");
function CopyStackTraceButton(param) {
    let { error } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_copybutton.CopyButton, {
        "data-nextjs-data-runtime-error-copy-stack": true,
        className: "copy-stack-trace-button",
        actionLabel: "Copy Stack Trace",
        successLabel: "Stack Trace Copied",
        content: error.stack || '',
        disabled: !error.stack
    });
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=copy-stack-trace-button.js.map