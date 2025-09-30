"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ErrorOverlay", {
    enumerable: true,
    get: function() {
        return ErrorOverlay;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _builderror = require("../../../container/build-error");
const _errors = require("../../../container/errors");
const _usedelayedrender = require("../../../hooks/use-delayed-render");
const transitionDurationMs = 200;
function ErrorOverlay(param) {
    let { state, runtimeErrors, isErrorOverlayOpen, setIsErrorOverlayOpen } = param;
    const isTurbopack = !!process.env.TURBOPACK;
    // This hook lets us do an exit animation before unmounting the component
    const { mounted, rendered } = (0, _usedelayedrender.useDelayedRender)(isErrorOverlayOpen, {
        exitDelay: transitionDurationMs
    });
    const commonProps = {
        rendered,
        transitionDurationMs,
        isTurbopack,
        versionInfo: state.versionInfo
    };
    if (state.buildError !== null) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(_builderror.BuildError, {
            ...commonProps,
            message: state.buildError,
            // This is not a runtime error, forcedly display error overlay
            rendered: true
        });
    }
    // No Runtime Errors.
    if (!runtimeErrors.length) {
        // Workaround React quirk that triggers "Switch to client-side rendering" if
        // we return no Suspense boundary here.
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(_react.Suspense, {});
    }
    if (!mounted) {
        // Workaround React quirk that triggers "Switch to client-side rendering" if
        // we return no Suspense boundary here.
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(_react.Suspense, {});
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_errors.Errors, {
        ...commonProps,
        debugInfo: state.debugInfo,
        runtimeErrors: runtimeErrors,
        onClose: ()=>{
            setIsErrorOverlayOpen(false);
        }
    });
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=error-overlay.js.map