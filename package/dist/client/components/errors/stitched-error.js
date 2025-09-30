"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getReactStitchedError", {
    enumerable: true,
    get: function() {
        return getReactStitchedError;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _react = /*#__PURE__*/ _interop_require_default._(require("react"));
const _iserror = /*#__PURE__*/ _interop_require_default._(require("../../../lib/is-error"));
const _errortelemetryutils = require("../../../lib/error-telemetry-utils");
const REACT_ERROR_STACK_BOTTOM_FRAME = 'react-stack-bottom-frame';
const REACT_ERROR_STACK_BOTTOM_FRAME_REGEX = new RegExp("(at " + REACT_ERROR_STACK_BOTTOM_FRAME + " )|(" + REACT_ERROR_STACK_BOTTOM_FRAME + "\\@)");
function getReactStitchedError(err) {
    const isErrorInstance = (0, _iserror.default)(err);
    const originStack = isErrorInstance ? err.stack || '' : '';
    const originMessage = isErrorInstance ? err.message : '';
    const stackLines = originStack.split('\n');
    const indexOfSplit = stackLines.findIndex((line)=>REACT_ERROR_STACK_BOTTOM_FRAME_REGEX.test(line));
    const isOriginalReactError = indexOfSplit >= 0 // has the react-stack-bottom-frame
    ;
    let newStack = isOriginalReactError ? stackLines.slice(0, indexOfSplit).join('\n') : originStack;
    const newError = Object.defineProperty(new Error(originMessage), "__NEXT_ERROR_CODE", {
        value: "E394",
        enumerable: false,
        configurable: true
    });
    // Copy all enumerable properties, e.g. digest
    Object.assign(newError, err);
    (0, _errortelemetryutils.copyNextErrorCode)(err, newError);
    newError.stack = newStack;
    // Avoid duplicate overriding stack frames
    appendOwnerStack(newError);
    return newError;
}
function appendOwnerStack(error) {
    if (!_react.default.captureOwnerStack) {
        return;
    }
    let stack = error.stack || '';
    // This module is only bundled in development mode so this is safe.
    const ownerStack = _react.default.captureOwnerStack();
    // Avoid duplicate overriding stack frames
    if (ownerStack && stack.endsWith(ownerStack) === false) {
        stack += ownerStack;
        // Override stack
        error.stack = stack;
    }
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=stitched-error.js.map