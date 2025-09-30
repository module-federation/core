"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    BuildError: null,
    styles: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    BuildError: function() {
        return BuildError;
    },
    styles: function() {
        return styles;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _jsxruntime = require("react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_wildcard._(require("react"));
const _stripansi = /*#__PURE__*/ _interop_require_default._(require("next/dist/compiled/strip-ansi"));
const _terminal = require("../components/terminal");
const _erroroverlaylayout = require("../components/errors/error-overlay-layout/error-overlay-layout");
const getErrorTextFromBuildErrorMessage = (multiLineMessage)=>{
    const lines = multiLineMessage.split('\n');
    // The multi-line build error message looks like:
    // <file path>:<line number>:<column number>
    // <error message>
    // <error code frame of compiler or bundler>
    // e.g.
    // ./path/to/file.js:1:1
    // SyntaxError: ...
    // > 1 | con st foo =
    // ...
    return (0, _stripansi.default)(lines[1] || '');
};
const BuildError = function BuildError(param) {
    let { message, ...props } = param;
    const noop = (0, _react.useCallback)(()=>{}, []);
    const error = Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
        value: "E394",
        enumerable: false,
        configurable: true
    });
    const formattedMessage = (0, _react.useMemo)(()=>getErrorTextFromBuildErrorMessage(message) || 'Failed to compile', [
        message
    ]);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_erroroverlaylayout.ErrorOverlayLayout, {
        errorType: "Build Error",
        errorMessage: formattedMessage,
        onClose: noop,
        error: error,
        footerMessage: "This error occurred during the build process and can only be dismissed by fixing the error.",
        ...props,
        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_terminal.Terminal, {
            content: message
        })
    });
};
const styles = "";

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=build-error.js.map