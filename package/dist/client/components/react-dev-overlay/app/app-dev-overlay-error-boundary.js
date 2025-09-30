"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppDevOverlayErrorBoundary", {
    enumerable: true,
    get: function() {
        return AppDevOverlayErrorBoundary;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _runtimeerrorhandler = require("../../errors/runtime-error-handler");
const _errorboundary = require("../../error-boundary");
function ErroredHtml(param) {
    let { globalError: [GlobalError, globalErrorStyles], error } = param;
    if (!error) {
        return /*#__PURE__*/ (0, _jsxruntime.jsxs)("html", {
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)("head", {}),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("body", {})
            ]
        });
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_errorboundary.ErrorBoundary, {
        errorComponent: _errorboundary.GlobalError,
        children: [
            globalErrorStyles,
            /*#__PURE__*/ (0, _jsxruntime.jsx)(GlobalError, {
                error: error
            })
        ]
    });
}
class AppDevOverlayErrorBoundary extends _react.PureComponent {
    static getDerivedStateFromError(error) {
        if (!error.stack) {
            return {
                isReactError: false,
                reactError: null
            };
        }
        _runtimeerrorhandler.RuntimeErrorHandler.hadRuntimeError = true;
        return {
            isReactError: true,
            reactError: error
        };
    }
    componentDidCatch() {
        this.props.onError(this.state.isReactError);
    }
    render() {
        const { children, globalError } = this.props;
        const { isReactError, reactError } = this.state;
        const fallback = /*#__PURE__*/ (0, _jsxruntime.jsx)(ErroredHtml, {
            globalError: globalError,
            error: reactError
        });
        return isReactError ? fallback : children;
    }
    constructor(...args){
        super(...args), this.state = {
            isReactError: false,
            reactError: null
        };
    }
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=app-dev-overlay-error-boundary.js.map